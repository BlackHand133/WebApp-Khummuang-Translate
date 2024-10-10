from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, set_access_cookies, set_refresh_cookies, unset_jwt_cookies, get_jwt_identity, get_jwt
from flask_bcrypt import Bcrypt
from models import db, SysAdmin
from config import Config
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

admin_bp = Blueprint('admin', __name__)
bcrypt = Bcrypt()
limiter = Limiter(key_func=get_remote_address)

@admin_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Please provide username and password'}), 400

    admin = SysAdmin.query.filter_by(admin_name=username).first()

    if admin and admin.check_password(password):
        access_token = create_access_token(
            identity=username,
            additional_claims={'is_admin': True}
        )
        refresh_token = create_refresh_token(
            identity=username,
            additional_claims={'is_admin': True}
        )
        response = jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'admin_id': admin.admin_id,
            'username': admin.admin_name
        })
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
        return response
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

@admin_bp.route('/protected', methods=['GET'])
@jwt_required()
def admin_protected():
    claims = get_jwt()
    if not claims.get('is_admin', False):
        return jsonify({'error': 'Admin access required'}), 403
    admin_identity = get_jwt_identity()
    return jsonify(logged_in_as=admin_identity), 200

@admin_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def admin_refresh():
    claims = get_jwt()
    if not claims.get('is_admin', False):
        return jsonify({'error': 'Admin access required'}), 403
    current_admin_identity = get_jwt_identity()
    new_access_token = create_access_token(
        identity=current_admin_identity,
        additional_claims={'is_admin': True}
    )
    
    response = jsonify({'message': 'Token refreshed'})
    set_access_cookies(response, new_access_token)
    
    return response

@admin_bp.route('/logout', methods=['POST'])
@jwt_required()
def admin_logout():
    claims = get_jwt()
    if not claims.get('is_admin', False):
        return jsonify({'error': 'Admin access required'}), 403
    response = jsonify({'message': 'Logout successful'})
    unset_jwt_cookies(response)
    return response

@admin_bp.route('/create_admin', methods=['POST'])
def create_admin():
    data = request.get_json()
    admin_name = data.get('admin_name')
    email = data.get('email')
    password = data.get('password')

    if not all([admin_name, email, password]):
        return jsonify({'error': 'กรุณากรอกข้อมูลที่จำเป็น (admin_name, email, password)'}), 400

    # ตรวจสอบว่า admin_name หรือ email มีอยู่แล้วหรือไม่
    if SysAdmin.query.filter((SysAdmin.admin_name == admin_name) | (SysAdmin.email == email)).first():
        return jsonify({'error': 'Admin name or email already exists'}), 400

    new_admin = SysAdmin(admin_name=admin_name, email=email)
    new_admin.set_password(password)

    db.session.add(new_admin)
    db.session.commit()

    return jsonify({
        'message': 'Admin created successfully',
        'admin': new_admin.to_dict()
    }), 201