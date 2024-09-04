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
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
    JWT_REFRESH_TOKEN_EXPIRES = 2592000  # 30 days
    
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