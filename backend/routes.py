import math
from flask import Blueprint, request, jsonify
from sqlalchemy import func
from models import db, Lead, STATUS_OPTIONS
from validation import (
    validate_lead_create,
    validate_lead_update,
    validate_query_params,
    ALLOWED_SORT_FIELDS
)

leads_bp = Blueprint('leads', __name__, url_prefix='/api/leads')

SORT_COLUMNS = {
    'id': Lead.id,
    'name': Lead.name,
    'email': Lead.email,
    'phone': Lead.phone,
    'company': Lead.company,
    'source': Lead.source,
    'status': Lead.status,
    'created_at': Lead.created_at,
    'updated_at': Lead.updated_at,
}

@leads_bp.route('/stats', methods=['GET'])
def get_lead_stats():
    """
    Return the count of leads per status, plus total count.
    """
    counts = dict(
        db.session.query(Lead.status, func.count(Lead.id))
        .group_by(Lead.status)
        .all()
    )

    by_status = {status: counts.get(status, 0) for status in STATUS_OPTIONS}
    total = sum(by_status.values())

    return jsonify({
        'total': total,
        'by_status': by_status,
        'new': by_status.get('New', 0),
        'contacted': by_status.get('Contacted', 0),
        'qualified': by_status.get('Qualified', 0),
        'lost': by_status.get('Lost', 0),
    }), 200

@leads_bp.route('', methods=['GET'])
def get_leads():
    """
    Retrieve leads with query parameters:
    - name or search: search by name (case-insensitive, partial)
    - status: filter by status (New, Contacted, Qualified, Lost)
    - sort: sort field (default: created_at)
    - order: asc or desc (default: desc)
    - page: page number (default: 1)
    - per_page: items per page (default: 10)
    """
    params, errors = validate_query_params(request.args)
    if errors:
        return jsonify({'error': 'Validation failed', 'errors': errors}), 400

    query = Lead.query

    # 1. Search by name (case-insensitive, partial)
    if params['name']:
        query = query.filter(Lead.name.ilike(f"%{params['name']}%"))

    # 2. Filter by status
    if params['status']:
        query = query.filter(Lead.status == params['status'])

    # 3. Sorting (sort, order)
    sort_field = params['sort']
    order = params['order']
    sort_column = SORT_COLUMNS.get(sort_field, Lead.created_at)
    query = query.order_by(sort_column.asc() if order == 'asc' else sort_column.desc())

    # Support optional unpaginated view when paginate=false is requested
    if not params['paginate']:
        leads = query.all()
        return jsonify([lead.to_dict() for lead in leads]), 200

    # 4. Pagination (page, per_page)
    page = params['page']
    per_page = params['per_page']
    total = query.count()
    total_pages = math.ceil(total / per_page) if total > 0 else 0
    offset = (page - 1) * per_page
    leads = query.offset(offset).limit(per_page).all()

    return jsonify({
        'leads': [lead.to_dict() for lead in leads],
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': total_pages
    }), 200

@leads_bp.route('/<int:lead_id>', methods=['GET'])
def get_lead(lead_id):
    """Retrieve a single lead by ID."""
    lead = db.session.get(Lead, lead_id)
    if not lead:
        return jsonify({'error': f'Lead with id {lead_id} not found'}), 404
    return jsonify(lead.to_dict()), 200

@leads_bp.route('', methods=['POST'])
def create_lead():
    """Create a new lead."""
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({
            'error': 'Validation failed',
            'errors': {'payload': 'Invalid JSON or missing request body'}
        }), 400

    cleaned_data, errors = validate_lead_create(data)
    if errors:
        return jsonify({'error': 'Validation failed', 'errors': errors}), 400

    lead = Lead(
        name=cleaned_data['name'],
        email=cleaned_data['email'],
        phone=cleaned_data['phone'],
        company=cleaned_data['company'],
        source=cleaned_data['source'],
        status=cleaned_data['status']
    )

    db.session.add(lead)
    db.session.commit()

    return jsonify(lead.to_dict()), 201

@leads_bp.route('/<int:lead_id>', methods=['PUT'])
def update_lead(lead_id):
    """Update an existing lead by ID."""
    lead = db.session.get(Lead, lead_id)
    if not lead:
        return jsonify({'error': f'Lead with id {lead_id} not found'}), 404

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({
            'error': 'Validation failed',
            'errors': {'payload': 'Invalid JSON or missing request body'}
        }), 400

    cleaned_data, errors = validate_lead_update(data)
    if errors:
        return jsonify({'error': 'Validation failed', 'errors': errors}), 400

    for key, value in cleaned_data.items():
        setattr(lead, key, value)

    db.session.commit()
    return jsonify(lead.to_dict()), 200

@leads_bp.route('/<int:lead_id>', methods=['DELETE'])
def delete_lead(lead_id):
    """Delete a lead by ID."""
    lead = db.session.get(Lead, lead_id)
    if not lead:
        return jsonify({'error': f'Lead with id {lead_id} not found'}), 404

    db.session.delete(lead)
    db.session.commit()
    return jsonify({'message': f'Lead {lead_id} deleted successfully'}), 200
