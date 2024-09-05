from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt, jwt_required, set_access_cookies, set_refresh_cookies, unset_jwt_cookies, get_jwt_identity
from flask_login import login_user, logout_user, login_required, current_user
from models import db, User, Profile
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError
import re
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from datetime import datetime
from redis import Redis


user_bp = Blueprint('user', __name__)
bcrypt = Bcrypt()
limiter = Limiter(key_func=get_remote_address)

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

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    try:
        new_user = User(username=username, email=email, password=hashed_password, gender=gender, birth_date=birth_date)
        db.session.add(new_user)
        db.session.flush()

        # สร้าง Profile พร้อมกับ User
        new_profile = Profile(user_id=new_user.user_id, firstname='', lastname='', country='', state='', phone_number='')
        db.session.add(new_profile)

        db.session.commit()
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองอีกครั้ง'}), 500

    access_token = create_access_token(identity=username)
    refresh_token = create_refresh_token(identity=username)

    return jsonify({
        'message': 'ลงทะเบียนสำเร็จ',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user_id': new_user.user_id  # ใช้ user_id ที่ถูกต้อง
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

    if user and bcrypt.check_password_hash(user.password, password):
        login_user(user)
        access_token = create_access_token(identity=username)
        refresh_token = create_refresh_token(identity=username)
        response = jsonify({
            'message': 'เข้าสู่ระบบสำเร็จ',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user_id': user.user_id,  # ใช้ user_id ที่ถูกต้อง
            'username': user.username
        })
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
    current_user_identity = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_identity)
    
    response = jsonify({'message': 'Token ได้รับการต่ออายุแล้ว'})
    set_access_cookies(response, new_access_token)
    
    return response

@user_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    try:
        jti = get_jwt()['jti']
        response = jsonify({'message': 'ออกจากระบบสำเร็จ'})
        unset_jwt_cookies(response)
        return response, 200
    except Exception as e:
        current_app.logger.error(f"Error during logout: {str(e)}")
        return jsonify({"error": "เกิดข้อผิดพลาดระหว่างการออกจากระบบ"}), 500

@user_bp.route('/forgot_password', methods=['POST'])
@limiter.limit("3 per hour")
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'error': 'กรุณากรอกอีเมล'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปให้'}), 200

    # สร้าง token สำหรับรีเซ็ตรหัสผ่าน (ในที่นี้เป็นเพียงตัวอย่าง ควรใช้วิธีที่ปลอดภัยกว่านี้ในการใช้งานจริง)
    reset_token = create_access_token(identity=email, expires_delta=timedelta(hours=1))

    # ส่งอีเมลพร้อม reset_token (ในที่นี้เป็นเพียงการจำลอง)
    print(f"Send password reset email to {email} with token: {reset_token}")

    return jsonify({'message': 'หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปให้'}), 200

@user_bp.route('/reset_password', methods=['POST'])
@jwt_required()
def reset_password():
    data = request.get_json()
    new_password = data.get('new_password')

    if not new_password:
        return jsonify({'error': 'กรุณากรอกรหัสผ่านใหม่'}), 400

    if len(new_password) < 8 or not re.search(r"[A-Z]", new_password) or not re.search(r"\d", new_password):
        return jsonify({'error': 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร และประกอบด้วยตัวพิมพ์ใหญ่และตัวเลข'}), 400

    email = get_jwt_identity()
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'error': 'ไม่พบผู้ใช้'}), 404

    try:
        hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        user.password = hashed_password
        db.session.commit()
        return jsonify({'message': 'รีเซ็ตรหัสผ่านสำเร็จ'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน'}), 500


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