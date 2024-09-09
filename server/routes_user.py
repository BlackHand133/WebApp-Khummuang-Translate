from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, get_jwt, jwt_required, set_access_cookies, set_refresh_cookies, unset_jwt_cookies, get_jwt_identity
from flask_login import login_user, logout_user, login_required, current_user
from models import db, User, Profile, TokenBlacklist, AudioRecord
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError
import re
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime, timedelta
import logging
from flask_mail import Mail, Message
import secrets

user_bp = Blueprint('user', __name__)
bcrypt = Bcrypt()
limiter = Limiter(key_func=get_remote_address)

mail = Mail()
jwt = JWTManager()

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    token = TokenBlacklist.query.filter_by(jti=jti).first()
    return token is not None

@user_bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    gender = data.get('gender')
    birth_date_str = data.get('birth_date')

    if not all([username, email, password, gender, birth_date_str]):
        return jsonify({'error': 'กรุณากรอกข้อมูลให้ครบถ้วน'}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({'error': 'รูปแบบอีเมลไม่ถูกต้อง'}), 400

    if len(password) < 8 or not re.search(r"[A-Z]", password) or not re.search(r"\d", password):
        return jsonify({'error': 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร และประกอบด้วยตัวพิมพ์ใหญ่และตัวเลข'}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'error': 'Username หรือ email นี้มีอยู่ในระบบแล้ว'}), 400

    try:
        birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'รูปแบบวันเกิดไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD'}), 400

    try:
        new_user = User(username=username, email=email, gender=gender, birth_date=birth_date, is_active=True)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.flush()

        # สร้าง Profile พร้อมกับ User
        new_profile = Profile(user_id=new_user.user_id, firstname='', lastname='', country='', state='', phone_number='')
        db.session.add(new_profile)

        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองอีกครั้ง'}), 500

    access_token = create_access_token(
        identity=username,
        additional_claims={
            'user_id': new_user.user_id,
            'email': new_user.email
        },
        expires_delta=current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
    )
    refresh_token = create_refresh_token(
        identity=username,
        expires_delta=current_app.config['JWT_REFRESH_TOKEN_EXPIRES']
    )

    return jsonify({
        'message': 'ลงทะเบียนสำเร็จ',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user_id': new_user.user_id
    }), 201

@user_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'กรุณากรอก username และ password'}), 400

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        access_token = create_access_token(
            identity=username,
            additional_claims={
                'user_id': user.user_id,
                'email': user.email
            }
        )
        refresh_token = create_refresh_token(identity=username)
        
        response = jsonify({
            'message': 'เข้าสู่ระบบสำเร็จ',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user_id': user.user_id,
            'username': user.username
        })
        
        # ตั้งค่า cookie สำหรับ token (ถ้าต้องการใช้)
        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
        
        return response
    else:
        return jsonify({'error': 'Username หรือ password ไม่ถูกต้อง'}), 401

@user_bp.route('/protected', methods=['POST', 'GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

@user_bp.route('/check_token', methods=['POST', 'OPTIONS'])
@jwt_required()
def check_token():
    if request.method == 'OPTIONS':
        return '', 204
    return jsonify({'message': 'Token ยังใช้งานได้'}), 200

@user_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()
    
    if not user:
        return jsonify({'error': 'ไม่พบผู้ใช้'}), 404
    
    # สร้าง token ใหม่
    new_access_token = create_access_token(
        identity=current_user,
        additional_claims={
            'user_id': user.user_id,
            'email': user.email
        }
    )
    new_refresh_token = create_refresh_token(identity=current_user)
    
    # สร้าง response พร้อมตั้งค่า cookie
    response = jsonify({'message': 'Token ได้รับการต่ออายุแล้ว'})
    set_access_cookies(response, new_access_token)
    set_refresh_cookies(response, new_refresh_token)
    
    return response

@user_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        jti = get_jwt()['jti']
        now = datetime.utcnow()
        token_block = TokenBlacklist(jti=jti, created_at=now)
        db.session.add(token_block)
        db.session.commit()
        
        response = jsonify({'message': 'ออกจากระบบสำเร็จ'})
        unset_jwt_cookies(response)
        return response, 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error during logout: {str(e)}")
        return jsonify({"error": "เกิดข้อผิดพลาดระหว่างการออกจากระบบ"}), 500

    
@user_bp.route('/profile/<string:username>', methods=['GET'])
@jwt_required()
def get_user_profile(username):
    try:
        current_user = get_jwt_identity()
        if current_user != username:
            return jsonify({'error': 'คุณไม่มีสิทธิ์เข้าถึงโปรไฟล์นี้'}), 403
        
        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({'error': 'ไม่พบผู้ใช้'}), 404
        
        profile = Profile.query.filter_by(user_id=user.user_id).first()
        if not profile:
            return jsonify({'error': 'ไม่พบข้อมูลโปรไฟล์'}), 404
        
        user_data = {
            'username': user.username,
            'email': user.email,
            'gender': user.gender,
            'birth_date': user.birth_date.strftime('%Y-%m-%d') if user.birth_date else None,
            'profile': {
                'firstname': profile.firstname,
                'lastname': profile.lastname,
                'country': profile.country,
                'state': profile.state,
                'phone_number': profile.phone_number
            }
        }

        return jsonify(user_data), 200

    except Exception as e:
        return jsonify({'error': 'เกิดข้อผิดพลาด: ' + str(e)}), 500


@user_bp.route('/profile/<string:username>', methods=['PATCH'])
@jwt_required()
def update_user_profile(username):
    try:
        # ตรวจสอบสิทธิ์ของผู้ใช้
        current_user = get_jwt_identity()
        if current_user != username:
            return jsonify({'error': 'คุณไม่มีสิทธิ์แก้ไขโปรไฟล์นี้'}), 403
        
        # ดึงข้อมูลผู้ใช้ตาม username
        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({'error': 'ไม่พบผู้ใช้'}), 404
        
        # ดึงข้อมูลโปรไฟล์ที่เกี่ยวข้องกับผู้ใช้
        profile = Profile.query.filter_by(user_id=user.user_id).first()
        if not profile:
            # ถ้าไม่พบข้อมูลโปรไฟล์ ให้สร้างโปรไฟล์ใหม่
            profile = Profile(user_id=user.user_id)
            db.session.add(profile)

        # รับข้อมูลจากคำร้องขอ
        data = request.get_json()
        print("Received data:", data)

        # อัปเดตข้อมูลผู้ใช้
        if 'email' in data:
            user.email = data['email']
        if 'gender' in data:
            user.gender = data['gender']
        if 'birth_date' in data:
            try:
                user.birth_date = datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'รูปแบบวันเกิดไม่ถูกต้อง กรุณาใช้รูปแบบ YYYY-MM-DD'}), 400

        # อัปเดตข้อมูลโปรไฟล์
        profile_data = data.get('profile', {})
        profile.firstname = profile_data.get('firstname', profile.firstname)
        profile.lastname = profile_data.get('lastname', profile.lastname)
        profile.country = profile_data.get('country', profile.country)
        profile.state = profile_data.get('state', profile.state)
        profile.phone_number = profile_data.get('phone_number', profile.phone_number)

        print("Updated user:", user)
        print("Updated profile:", profile)

        # บันทึกข้อมูลที่อัปเดตลงในฐานข้อมูล
        try:
            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({'error': 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'}), 500
        
        return jsonify({'message': 'อัปเดตโปรไฟล์สำเร็จ'}), 200

    except Exception as e:
        return jsonify({'error': 'เกิดข้อผิดพลาด: ' + str(e)}), 500
    
@user_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    confirm_password = data.get('confirm_password')

    if not all([current_password, new_password, confirm_password]):
        return jsonify({'error': 'กรุณากรอกข้อมูลให้ครบถ้วน'}), 400

    if new_password != confirm_password:
        return jsonify({'error': 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน'}), 400

    if len(new_password) < 8 or not re.search(r"[A-Z]", new_password) or not re.search(r"\d", new_password):
        return jsonify({'error': 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร และประกอบด้วยตัวพิมพ์ใหญ่และตัวเลข'}), 400

    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()

    if not user:
        return jsonify({'error': 'ไม่พบผู้ใช้'}), 404

    if not user.check_password(current_password):
        return jsonify({'error': 'รหัสผ่านปัจจุบันไม่ถูกต้อง'}), 401

    try:
        user.set_password(new_password)
        db.session.commit()
        return jsonify({'message': 'เปลี่ยนรหัสผ่านสำเร็จ'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองอีกครั้ง'}), 500
    
@user_bp.route('/delete-account', methods=['DELETE'])
@jwt_required()
def delete_account():
    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    # รับรหัสผ่านจาก request
    data = request.get_json()
    password = data.get('password')

    if not password:
        return jsonify({'error': 'Password is required'}), 400

    # ตรวจสอบรหัสผ่าน
    if not user.check_password(password):
        return jsonify({'error': 'Incorrect password'}), 401

    try:
        # อัปเดต AudioRecords ให้ไม่มีการอ้างอิงถึงผู้ใช้ที่ถูกลบ
        AudioRecord.query.filter_by(user_id=user.user_id).update({'user_id': None})

        # ลบ Profile ของ user
        Profile.query.filter_by(user_id=user.user_id).delete()

        # ลบ User
        db.session.delete(user)

        # Commit การเปลี่ยนแปลงทั้งหมด
        db.session.commit()

        return jsonify({'message': 'Account deleted successfully. Audio records have been preserved.'}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'An error occurred while deleting the account'}), 500
    