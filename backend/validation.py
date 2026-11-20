import re

SOURCE_OPTIONS = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Other']
STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Lost']

ALLOWED_SORT_FIELDS = [
    'id', 'name', 'email', 'phone', 'company', 'source', 'status', 'created_at', 'updated_at'
]

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
PHONE_REGEX = re.compile(r"^\d{7,15}$")

def validate_lead_create(data):
    """
    Validate payload for creating a new lead.
    Rules:
    - name, email, and status are required.
    - valid email format.
    - phone: if provided, digits only (7-15 chars).
    - source: if provided, must be in SOURCE_OPTIONS.
    - status: required, must be in STATUS_OPTIONS.
    Returns:
        tuple: (cleaned_data, errors_dict)
    """
    errors = {}
    if not isinstance(data, dict):
        return None, {'payload': 'Request body must be a JSON object'}

    # 1. name: required
    name = data.get('name')
    if name is None or not str(name).strip():
        errors['name'] = 'Name is required'
    else:
        name = str(name).strip()

    # 2. email: required, valid format
    email = data.get('email')
    if email is None or not str(email).strip():
        errors['email'] = 'Email is required'
    else:
        email = str(email).strip()
        if not EMAIL_REGEX.match(email):
            errors['email'] = 'Invalid email address format'

    # 3. status: required, must be from allowed list
    status = data.get('status')
    if status is None or not str(status).strip():
        errors['status'] = 'Status is required'
    else:
        status = str(status).strip()
        if status not in STATUS_OPTIONS:
            errors['status'] = f"Status must be one of: {', '.join(STATUS_OPTIONS)}"

    # 4. phone: digits only (7-15 chars) if provided
    phone = data.get('phone')
    if phone is not None and str(phone).strip() != '':
        phone_str = str(phone).strip()
        if not PHONE_REGEX.match(phone_str):
            errors['phone'] = 'Phone must contain only digits (7-15 characters)'
        else:
            phone = phone_str
    else:
        phone = None

    # 5. source: must be from allowed list if provided
    source = data.get('source')
    if source is not None and str(source).strip() != '':
        source_str = str(source).strip()
        if source_str not in SOURCE_OPTIONS:
            errors['source'] = f"Source must be one of: {', '.join(SOURCE_OPTIONS)}"
        else:
            source = source_str
    else:
        source = None

    company = data.get('company')
    company = str(company).strip() if company is not None and str(company).strip() else None

    cleaned_data = {
        'name': name,
        'email': email,
        'phone': phone,
        'company': company,
        'source': source,
        'status': status,
    }

    return cleaned_data, errors

def validate_lead_update(data):
    """
    Validate payload for updating a lead.
    Rules:
    - At least one field provided.
    - If name provided: cannot be empty.
    - If email provided: cannot be empty, valid format.
    - If status provided: cannot be empty, must be in STATUS_OPTIONS.
    - If phone provided: if non-empty, digits only (7-15 chars).
    - If source provided: if non-empty, must be in SOURCE_OPTIONS.
    Returns:
        tuple: (cleaned_data, errors_dict)
    """
    errors = {}
    if not isinstance(data, dict):
        return None, {'payload': 'Request body must be a JSON object'}

    if not data:
        return None, {'payload': 'At least one field must be provided to update'}

    cleaned_data = {}

    if 'name' in data:
        name = data.get('name')
        if name is None or not str(name).strip():
            errors['name'] = 'Name cannot be empty'
        else:
            cleaned_data['name'] = str(name).strip()

    if 'email' in data:
        email = data.get('email')
        if email is None or not str(email).strip():
            errors['email'] = 'Email cannot be empty'
        else:
            email_str = str(email).strip()
            if not EMAIL_REGEX.match(email_str):
                errors['email'] = 'Invalid email address format'
            else:
                cleaned_data['email'] = email_str

    if 'status' in data:
        status = data.get('status')
        if status is None or not str(status).strip():
            errors['status'] = 'Status cannot be empty'
        else:
            status_str = str(status).strip()
            if status_str not in STATUS_OPTIONS:
                errors['status'] = f"Status must be one of: {', '.join(STATUS_OPTIONS)}"
            else:
                cleaned_data['status'] = status_str

    if 'phone' in data:
        phone = data.get('phone')
        if phone is not None and str(phone).strip() != '':
            phone_str = str(phone).strip()
            if not PHONE_REGEX.match(phone_str):
                errors['phone'] = 'Phone must contain only digits (7-15 characters)'
            else:
                cleaned_data['phone'] = phone_str
        else:
            cleaned_data['phone'] = None

    if 'source' in data:
        source = data.get('source')
        if source is not None and str(source).strip() != '':
            source_str = str(source).strip()
            if source_str not in SOURCE_OPTIONS:
                errors['source'] = f"Source must be one of: {', '.join(SOURCE_OPTIONS)}"
            else:
                cleaned_data['source'] = source_str
        else:
            cleaned_data['source'] = None

    if 'company' in data:
        company = data.get('company')
        cleaned_data['company'] = str(company).strip() if company is not None and str(company).strip() else None

    return cleaned_data, errors

def validate_query_params(args):
    """
    Validate query parameters for GET /api/leads:
    - name / search (case-insensitive partial search)
    - status (must be in STATUS_OPTIONS or 'All')
    - sort (must be in ALLOWED_SORT_FIELDS, default: created_at)
    - order ('asc' or 'desc', default: desc)
    - page (int >= 1, default: 1)
    - per_page (int >= 1, default: 10)
    Returns:
        tuple: (cleaned_params, errors_dict)
    """
    errors = {}
    cleaned = {}

    # Search by name (case-insensitive partial)
    name_query = args.get('name') or args.get('search')
    cleaned['name'] = name_query.strip() if name_query and name_query.strip() else None

    # Filter by status
    status = args.get('status')
    if status and status != 'All':
        status = status.strip()
        if status not in STATUS_OPTIONS:
            errors['status'] = f"Status must be one of: {', '.join(STATUS_OPTIONS)}"
        else:
            cleaned['status'] = status
    else:
        cleaned['status'] = None

    # Sorting field
    sort_field = args.get('sort', 'created_at')
    if sort_field:
        sort_field = sort_field.strip().lower()
        if sort_field not in ALLOWED_SORT_FIELDS:
            errors['sort'] = f"Sort field must be one of: {', '.join(ALLOWED_SORT_FIELDS)}"
        else:
            cleaned['sort'] = sort_field
    else:
        cleaned['sort'] = 'created_at'

    # Sorting order
    order = args.get('order', 'desc')
    if order:
        order = order.strip().lower()
        if order not in ['asc', 'desc']:
            errors['order'] = "Order must be 'asc' or 'desc'"
        else:
            cleaned['order'] = order
    else:
        cleaned['order'] = 'desc'

    # Pagination: page
    page_val = args.get('page', 1)
    try:
        page = int(page_val)
        if page < 1:
            errors['page'] = 'Page must be an integer >= 1'
        else:
            cleaned['page'] = page
    except (ValueError, TypeError):
        errors['page'] = 'Page must be an integer >= 1'

    # Pagination: per_page
    per_page_val = args.get('per_page', 10)
    try:
        per_page = int(per_page_val)
        if per_page < 1:
            errors['per_page'] = 'per_page must be an integer >= 1'
        else:
            cleaned['per_page'] = per_page
    except (ValueError, TypeError):
        errors['per_page'] = 'per_page must be an integer >= 1'

    cleaned['paginate'] = args.get('paginate') != 'false'

    return cleaned, errors
