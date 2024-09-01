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
from models import db
from routes_admin import admin_bp
from routes_user import user_bp
from routes_service import service_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config.from_object(Config)
bcrypt = Bcrypt(app)

migrate = Migrate(app, db)
db.init_app(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

principal = Principal(app)

app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(service_bp, url_prefix='/api')

if __name__ == "__main__":
    socketio.run(app, debug=True, port=8080)
