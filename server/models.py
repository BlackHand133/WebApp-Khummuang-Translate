from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4

db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

class User(db.Model):
    userid = db.Column(db.String(32), primary_key=True, default=get_uuid, unique=True, nullable=False)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)  # Increased length for hashed password
    gender = db.Column(db.String(10), nullable=False)
    age_group = db.Column(db.String(10), nullable=False)

    admin = db.relationship('Admin', backref='user', uselist=False)

class Admin(db.Model):
    admin_id = db.Column(db.String(32), primary_key=True, default=get_uuid, unique=True, nullable=False)
    userid = db.Column(db.String(32), db.ForeignKey('user.userid'), nullable=False)
