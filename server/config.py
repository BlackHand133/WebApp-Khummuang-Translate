import secrets

class Config:
    SECRET_KEY = 'I_am_Number_Four_Five'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///appDB.sqlite3'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = secrets.token_hex(16)
    JWT_COOKIE_SECURE = True  # ควรเป็น True ใน production
    JWT_SESSION_COOKIE = False
    UPLOAD_FOLDER = 'uploads'
    
