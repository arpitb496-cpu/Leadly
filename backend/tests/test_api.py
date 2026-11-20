import pytest

def test_create_lead(client):
    """Test successful lead creation returns 201 and created lead data."""
    payload = {
        'name': 'Sarah Connor',
        'email': 'sarah@example.com',
        'phone': '1234567890',
        'company': 'Cyberdyne Systems',
        'source': 'LinkedIn',
        'status': 'New',
    }
    response = client.post('/api/leads', json=payload)
    assert response.status_code == 201

    data = response.get_json()
    assert data['id'] is not None
    assert data['name'] == 'Sarah Connor'
    assert data['email'] == 'sarah@example.com'
    assert data['phone'] == '1234567890'
    assert data['company'] == 'Cyberdyne Systems'
    assert data['source'] == 'LinkedIn'
    assert data['status'] == 'New'
    assert data['created_at'] is not None

def test_create_lead_validation_errors(client):
    """Test field-wise validation errors on missing/invalid fields."""
    # 1. Missing required fields (name, email, status)
    response = client.post('/api/leads', json={})
    assert response.status_code == 400
    data = response.get_json()
    assert data['error'] == 'Validation failed'
    assert 'name' in data['errors']
    assert 'email' in data['errors']
    assert 'status' in data['errors']

    # 2. Invalid email format
    res_bad_email = client.post(
        '/api/leads',
        json={'name': 'John Doe', 'email': 'not-an-email', 'status': 'New'},
    )
    assert res_bad_email.status_code == 400
    assert 'email' in res_bad_email.get_json()['errors']

    # 3. Invalid phone (< 7 digits or non-digits)
    res_bad_phone = client.post(
        '/api/leads',
        json={
            'name': 'John Doe',
            'email': 'john@example.com',
            'phone': '12345',
            'status': 'New',
        },
    )
    assert res_bad_phone.status_code == 400
    assert 'phone' in res_bad_phone.get_json()['errors']

    # 4. Invalid source and status options
    res_bad_options = client.post(
        '/api/leads',
        json={
            'name': 'John Doe',
            'email': 'john@example.com',
            'status': 'NonExistentStatus',
            'source': 'InvalidSource',
        },
    )
    assert res_bad_options.status_code == 400
    errors = res_bad_options.get_json()['errors']
    assert 'status' in errors
    assert 'source' in errors

def test_update_lead(client):
    """Test updating lead details and status."""
    # Create lead
    create_res = client.post(
        '/api/leads',
        json={
            'name': 'Bruce Wayne',
            'email': 'bruce@wayne.com',
            'status': 'New',
            'source': 'Referral',
        },
    )
    assert create_res.status_code == 201
    lead_id = create_res.get_json()['id']

    # Update status to Qualified and company
    update_res = client.put(
        f'/api/leads/{lead_id}',
        json={'status': 'Qualified', 'company': 'Wayne Enterprises'},
    )
    assert update_res.status_code == 200
    updated_data = update_res.get_json()
    assert updated_data['status'] == 'Qualified'
    assert updated_data['company'] == 'Wayne Enterprises'
    assert updated_data['name'] == 'Bruce Wayne'

    # Verify 404 on nonexistent lead
    assert client.put('/api/leads/99999', json={'name': 'Ghost'}).status_code == 404

def test_delete_lead(client):
    """Test deleting a lead."""
    # Create lead
    create_res = client.post(
        '/api/leads',
        json={
            'name': 'Clark Kent',
            'email': 'clark@dailyplanet.com',
            'status': 'New',
        },
    )
    lead_id = create_res.get_json()['id']

    # Delete lead
    del_res = client.delete(f'/api/leads/{lead_id}')
    assert del_res.status_code == 200
    assert 'deleted successfully' in del_res.get_json()['message']

    # Verify it is no longer found
    assert client.get(f'/api/leads/{lead_id}').status_code == 404

    # Verify deleting nonexistent lead returns 404
    assert client.delete('/api/leads/99999').status_code == 404

def test_search_leads(client):
    """Test case-insensitive partial search by name."""
    client.post(
        '/api/leads',
        json={'name': 'Alexander Hamilton', 'email': 'alex@ny.gov', 'status': 'New'},
    )
    client.post(
        '/api/leads',
        json={'name': 'Aaron Burr', 'email': 'aaron@ny.gov', 'status': 'Contacted'},
    )
    client.post(
        '/api/leads',
        json={'name': 'George Washington', 'email': 'george@va.gov', 'status': 'Qualified'},
    )

    # Search partial case-insensitive 'alex'
    res = client.get('/api/leads?name=alex')
    assert res.status_code == 200
    data = res.get_json()
    leads = data['leads'] if isinstance(data, dict) else data
    assert len(leads) == 1
    assert leads[0]['name'] == 'Alexander Hamilton'

    # Search 'a' (matches Alexander and Aaron)
    res_a = client.get('/api/leads?name=a')
    leads_a = res_a.get_json()['leads']
    names = [l['name'] for l in leads_a]
    assert 'Alexander Hamilton' in names
    assert 'Aaron Burr' in names

    # Filter by status
    res_status = client.get('/api/leads?status=Qualified')
    leads_status = res_status.get_json()['leads']
    assert len(leads_status) == 1
    assert leads_status[0]['name'] == 'George Washington'

def test_lead_stats(client):
    """Test GET /api/leads/stats returns correct status counts."""
    client.post(
        '/api/leads',
        json={'name': 'User 1', 'email': 'u1@test.com', 'status': 'New'},
    )
    client.post(
        '/api/leads',
        json={'name': 'User 2', 'email': 'u2@test.com', 'status': 'New'},
    )
    client.post(
        '/api/leads',
        json={'name': 'User 3', 'email': 'u3@test.com', 'status': 'Qualified'},
    )

    res = client.get('/api/leads/stats')
    assert res.status_code == 200
    stats = res.get_json()
    assert stats['total'] == 3
    assert stats['new'] == 2
    assert stats['qualified'] == 1
    assert stats['contacted'] == 0
    assert stats['lost'] == 0
    assert stats['by_status']['New'] == 2
    assert stats['by_status']['Qualified'] == 1
