from datetime import datetime
from flask import jsonify, request, redirect, url_for
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token
from models import db, User, sysAdmin
from flask import Blueprint

admin_bp = Blueprint('admin_bp', __name__)

# ตั้งค่า Bcrypt
bcrypt = Bcrypt()

@admin_bp.route('/admin')
def admin_index():
    return redirect(url_for('admin.index'))  # Redirect ไปยังหน้า admin interface

@admin_bp.route('/create_admin', methods=['POST'])
def create_admin():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    gender = data.get('gender')
    birth_date = data.get('birth_date')  # แก้ไขจาก birt_date เป็น birth_date

    if not all([username, email, password, gender, birth_date]):
        return jsonify({'error': 'กรุณากรอกข้อมูลที่จำเป็น'}), 400

    try:
        birth_date = datetime.strptime(birth_date, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format. Expected YYYY-MM-DD'}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({'error': 'Username or email already exists'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, email=email, password=hashed_password, gender=gender, birth_date=birth_date)
    db.session.add(new_user)

    admin_user = sysAdmin(user=new_user)
    db.session.add(admin_user)

    db.session.commit()
    access_token = create_access_token(identity=username)

    return jsonify({'message': 'Admin created successfully', 'access_token': access_token}), 201
