from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, set_access_cookies, set_refresh_cookies, unset_jwt_cookies, get_jwt_identity
from flask_bcrypt import Bcrypt
from models import db, SysAdmin
from config import Config
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address


admin_bp = Blueprint('admin', __name__)
bcrypt = Bcrypt()
limiter = Limiter(key_func=get_remote_address)

@admin_bp.route('/create', methods=['POST'])
def create_admin():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify(success=False, message='Missing required fields'), 400

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    new_admin = SysAdmin(
        AdminName=username,
        email=email,
        password_hash=password_hash
    )
    db.session.add(new_admin)
    db.session.commit()
    return jsonify(success=True, message=f'Admin {username} created successfully!'), 201

@admin_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Please provide username and password'}), 400

    admin = SysAdmin.query.filter_by(AdminName=username).first()

    if admin and bcrypt.check_password_hash(admin.password_hash, password):
        access_token = create_access_token(identity=username)
        refresh_token = create_refresh_token(identity=username)
        response = jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'admin_id': admin.admin_id,
            'username': admin.AdminName
        })
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
        return response
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

@admin_bp.route('/protected', methods=['GET'])
@jwt_required()
def admin_protected():
    admin_identity = get_jwt_identity()
    return jsonify(logged_in_as=admin_identity), 200

@admin_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def admin_refresh():
    current_admin_identity = get_jwt_identity()
    new_access_token = create_access_token(identity=current_admin_identity)
    
    response = jsonify({'message': 'Token refreshed'})
    set_access_cookies(response, new_access_token)
    
    return response

@admin_bp.route('/logout', methods=['POST'])
@jwt_required()
def admin_logout():
    response = jsonify({'message': 'Logout successful'})
    unset_jwt_cookies(response)
    return response



