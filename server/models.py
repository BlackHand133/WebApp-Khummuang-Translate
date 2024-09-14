from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from uuid import uuid4
from sqlalchemy import Date, Enum, DateTime
from flask_wtf import FlaskForm
from wtforms import DateField, SelectField, StringField, PasswordField
from wtforms.validators import DataRequired, Length
from flask_bcrypt import Bcrypt
from datetime import datetime

db = SQLAlchemy()
bcrypt = Bcrypt()

def get_uuid():
    return uuid4().hex


class User(UserMixin, db.Model):
    __tablename__ = 'user'
    user_id = db.Column(db.String(32), primary_key=True, default=get_uuid, unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    birth_date = db.Column(Date, nullable=False)
    created_at = db.Column(DateTime, default=datetime.utcnow)
    updated_at = db.Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    reset_token = db.Column(db.String(100), nullable=True)
    reset_token_expires = db.Column(db.DateTime, nullable=True)

    def to_dict(self, include_audio=False):
        user_dict = {
            'user_id': self.user_id,
            'username': self.username,
            'email': self.email,
            'gender': self.gender,
            'is_active': self.is_active,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'profile': self.profile.to_dict() if self.profile else None
        }
        if include_audio:
            user_dict['audio_records'] = [record.to_dict() for record in self.audio_records]
        return user_dict

    def get_id(self):
        return self.user_id
    
    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)
    
    profile = db.relationship('Profile', back_populates='user', uselist=False, cascade='all, delete-orphan')

class AudioRecord(db.Model):
    __tablename__ = 'audio_record'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(32), db.ForeignKey('user.user_id'), nullable=True)
    audio_url = db.Column(db.String(200))
    transcription = db.Column(db.Text)
    time = db.Column(db.String(20), nullable=False)
    duration = db.Column(db.Integer)  # Duration in seconds
    language = db.Column(db.String(10))  # เพิ่มบรรทัดนี้
    created_at = db.Column(DateTime, default=datetime.utcnow)
    updated_at = db.Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('audio_records', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'audio_url': self.audio_url,
            'transcription': self.transcription,
            'time': self.time,
            'duration': self.duration,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class SysAdmin(db.Model):
    __tablename__ = 'admin'
    admin_id = db.Column(db.Integer, primary_key=True)
    admin_name = db.Column(db.String(32), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(DateTime, default=datetime.utcnow)
    updated_at = db.Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<SysAdmin {self.admin_name}>'

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'admin_id': self.admin_id,
            'admin_name': self.admin_name,
            'email': self.email,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Profile(db.Model):
    __tablename__ = 'profile'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(32), db.ForeignKey('user.user_id'), nullable=False)
    firstname = db.Column(db.String(50), nullable=True)
    lastname = db.Column(db.String(50), nullable=True)
    country = db.Column(db.String(50))
    state = db.Column(db.String(50))
    phone_number = db.Column(db.String(15))
    last_login = db.Column(DateTime)
    created_at = db.Column(DateTime, default=datetime.utcnow)
    updated_at = db.Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', back_populates='profile')     

    def __repr__(self):
        return f'<Profile {self.firstname} {self.lastname}>'
    def to_dict(self):
        return {
            'firstname': self.firstname,
            'lastname': self.lastname,
            'country': self.country,
            'state': self.state,
            'phone_number': self.phone_number
        }

class TokenBlacklist(db.Model):
    __tablename__ = 'token_blacklist'
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f'<TokenBlacklist {self.jti}>'
