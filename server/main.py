import os
from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_login import LoginManager
from flask_principal import Principal
from flask_socketio import SocketIO
from config import Config
from models import db, User
from routes_admin import admin_bp
from routes_user import user_bp
from routes_service import service_bp
from redis import Redis
from routes_user import user_bp, get_redis_client

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
app.config.from_object(Config)
bcrypt = Bcrypt(app)

migrate = Migrate(app, db)
db.init_app(app)


# ตั้งค่า JWT
jwt = JWTManager(app)

@jwt.token_in_blocklist_loader
def check_if_token_in_blocklist(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    token_in_redis = get_redis_client().get(jti)
    return token_in_redis is not None

socketio = SocketIO(app, cors_allowed_origins="*")

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

principal = Principal(app)

app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(service_bp, url_prefix='/api')

with app.app_context():
    db.create_all()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

with app.app_context():
    try:
        get_redis_client().ping()
        print("Successfully connected to Redis")
    except Exception as e:
        print(f"Error connecting to Redis: {e}")

if __name__ == "__main__":
    socketio.run(app, debug=True, port=8080)