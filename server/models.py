from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from uuid import uuid4
from sqlalchemy import Date, Enum, DateTime
from flask_wtf import FlaskForm
from wtforms import DateField, SelectField, StringField, PasswordField
from wtforms.validators import DataRequired, Length
from flask_bcrypt import Bcrypt
from datetime import datetime, timedelta
import enum
from audio_utils import calculate_expiration_date
import hashlib

class RatingEnum(enum.Enum):
    UNKNOWN = 'unknown'
    LIKE = 'like'
    DISLIKE = 'dislike'

class SourceEnum(enum.Enum):
    MICROPHONE = 'microphone'
    UPLOAD = 'upload'

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
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    hashed_id = db.Column(db.String(8), unique=True, index=True, nullable=False)
    audio_hash = db.Column(db.String(64), unique=True, index=True, nullable=False)
    user_id = db.Column(db.String(32), db.ForeignKey('user.user_id'), nullable=False)
    audio_url = db.Column(db.String(200))
    transcription = db.Column(db.Text)
    time = db.Column(db.String(20), nullable=False)
    duration = db.Column(db.Integer)  # Duration in seconds
    language = db.Column(db.String(10))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expiration_date = db.Column(db.DateTime)
    rating = db.Column(db.Enum(RatingEnum), default=RatingEnum.UNKNOWN)
    source = db.Column(db.Enum(SourceEnum), nullable=False)

    user = db.relationship('User', backref=db.backref('audio_records', lazy=True))

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if not self.hashed_id:
            self.hashed_id = self.generate_hashed_id()
        self.set_expiration_date()

    def set_expiration_date(self):
        self.expiration_date = calculate_expiration_date(self.source, self.rating)

    def generate_hashed_id(self):
        if self.id is None:
            # If id is not set yet, use a temporary unique identifier
            temp_id = uuid4().hex
        else:
            temp_id = str(self.id)
        return hashlib.sha256(temp_id.encode()).hexdigest()[:8]

    @classmethod
    def create(cls, **kwargs):
        record = cls(**kwargs)
        db.session.add(record)
        db.session.flush()  # This will assign an ID to the record
        if not record.hashed_id:
            record.hashed_id = record.generate_hashed_id()
        return record

    def to_dict(self):
        return {
            'id': self.id,
            'hashed_id': self.hashed_id,
            'user_id': self.user_id,
            'audio_url': self.audio_url,
            'transcription': self.transcription,
            'time': self.time,
            'duration': self.duration,
            'language': self.language,
            'created_at': self.created_at.isoformat(),
            'expiration_date': self.expiration_date.isoformat(),
            'rating': self.rating.value,
            'audio_hash': self.audio_hash,
            'source': self.source.value
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