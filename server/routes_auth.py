from flask import Blueprint, jsonify, request, current_app
from models import db, User
from sqlalchemy.exc import SQLAlchemyError
import secrets
from datetime import datetime
from flask_mail import Message
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        # สำหรับความปลอดภัย เราไม่ควรเปิดเผยว่าอีเมลนี้ไม่มีอยู่ในระบบ
        return jsonify({'message': 'If the email exists, a password reset link will be sent'}), 200

    # สร้าง token สำหรับรีเซ็ตรหัสผ่าน
    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    user.reset_token_expires = datetime.utcnow() + current_app.config['PASSWORD_RESET_EXPIRATION']

    try:
        db.session.commit()

        # ส่งอีเมลพร้อม reset link
        reset_url = f"{current_app.config['FRONTEND_URL']}/reset-password?token={reset_token}"
        msg = Message("Password Reset Request",
                      recipients=[user.email])
        msg.body = f"To reset your password, please click on this link: {reset_url}"
        current_app.extensions['mail'].send(msg)

        return jsonify({'message': 'Password reset link has been sent to your email'}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'An error occurred. Please try again later.'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')

    if not token or not new_password:
        return jsonify({'error': 'Token and new password are required'}), 400

    user = User.query.filter_by(reset_token=token).first()

    if not user or user.reset_token_expires < datetime.utcnow():
        return jsonify({'error': 'Invalid or expired token'}), 400

    user.set_password(new_password)
    user.reset_token = None
    user.reset_token_expires = None

    try:
        db.session.commit()
        return jsonify({'message': 'Password has been reset successfully'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'An error occurred. Please try again later.'}), 500