from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Profile
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from werkzeug.exceptions import NotFound, BadRequest

profile_bp = Blueprint('profile', __name__)

@profile_bp.errorhandler(Exception)
def handle_error(error):
    if isinstance(error, NotFound):
        return jsonify({'error': 'ไม่พบข้อมูล'}), 404
    elif isinstance(error, BadRequest):
        return jsonify({'error': str(error)}), 400
    elif isinstance(error, SQLAlchemyError):
        return jsonify({'error': 'เกิดข้อผิดพลาดในการจัดการข้อมูล'}), 500
    else:
        return jsonify({'error': 'เกิดข้อผิดพลาดที่ไม่คาดคิด'}), 500

@profile_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        raise NotFound('ไม่พบผู้ใช้')

    profile = user.get_profile()

    return jsonify({
        'profile': {
            'username': user.username,
            'email': user.email,
            'firstname': profile.firstname,
            'lastname': profile.lastname,
            'country': profile.country,
            'state': profile.state,
            'phone_number': profile.phone_number,
            'gender': user.gender,
            'birth_date': user.birth_date.isoformat() if user.birth_date else None,
            'last_updated': profile.last_updated.isoformat() if profile.last_updated else None
        }
    }), 200

@profile_bp.route('/profile', methods=['POST', 'PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        raise NotFound('ไม่พบผู้ใช้')

    data = request.get_json()
    
    try:
        profile = user.get_profile()
        
        # อัปเดตข้อมูล User
        if 'email' in data:
            user.email = data['email']
        if 'gender' in data:
            user.gender = data['gender']
        if 'birth_date' in data:
            user.birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()

        # อัปเดตข้อมูล Profile
        for field in ['firstname', 'lastname', 'country', 'state', 'phone_number']:
            if field in data:
                setattr(profile, field, data[field])
        
        profile.last_updated = datetime.utcnow()
        
        db.session.commit()
        return jsonify({
            'message': 'บันทึกข้อมูล Profile สำเร็จ',
            'profile': {
                'username': user.username,
                'email': user.email,
                'firstname': profile.firstname,
                'lastname': profile.lastname,
                'country': profile.country,
                'state': profile.state,
                'phone_number': profile.phone_number,
                'gender': user.gender,
                'birth_date': user.birth_date.isoformat() if user.birth_date else None,
                'last_updated': profile.last_updated.isoformat()
            }
        }), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        raise