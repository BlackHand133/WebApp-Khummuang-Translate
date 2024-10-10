from datetime import timedelta
import secrets
import os

class Config:
    # ใช้ environment variable ถ้ามี มิฉะนั้นจะใช้ค่าเริ่มต้น
    SECRET_KEY = os.environ.get('SECRET_KEY') or secrets.token_hex(24)
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or secrets.token_hex(16)
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///WebAppDB.sqlite3'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT settings
    JWT_COOKIE_SECURE = True  # ควรเป็น True ใน production
    JWT_SESSION_COOKIE = False
    
    # File upload
    UPLOAD_FOLDER = 'uploads'
    UPLOAD_FOLDERURL = 'uploads/audio'
    
    
    # JWT blacklist
    JWT_BLACKLIST_ENABLED = False
    JWT_BLACKLIST_TOKEN_CHECKS = []
    
    # ตั้งค่าเพิ่มเติมเพื่อความปลอดภัย
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SECURE = True
    REMEMBER_COOKIE_HTTPONLY = True

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=60)  # ตั้งค่าอายุของ access token
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ['access', 'refresh']


    MAIL_SERVER = 'smtp.gmail.com'  # เปลี่ยนเป็น SMTP server ของมหาวิทยาลัย
    MAIL_PORT = 587  # อาจแตกต่างกันไปตามการตั้งค่าของมหาวิทยาลัย
    MAIL_USE_TLS = True  # หรือ False ขึ้นอยู่กับการตั้งค่าของเซิร์ฟเวอร์
    MAIL_USERNAME = 'khummuang2545@gmail.com'
    MAIL_DEFAULT_SENDER = 'khummuang2545@gmail.com'
    MAIL_PASSWORD = 'pmbe cxlb hhia nmbf'
    MAIL_USE_SSL = False

    PASSWORD_RESET_EXPIRATION = timedelta(minutes=10)

    FRONTEND_URL = 'http://localhost:5173'