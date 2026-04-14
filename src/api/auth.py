from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from api.models import db, User
from api.utils import APIException

auth = Blueprint("auth", __name__)
CORS(auth)


@auth.route("/register", methods=["POST"])
def register():
    body = request.get_json()
    if not body:
        raise APIException("Request body is missing", 400)

    email = body.get("email", "").strip().lower()
    password = body.get("password", "")

    if not email or not password:
        raise APIException("Email and password are required", 400)
    if len(password) < 6:
        raise APIException("Password must be at least 6 characters", 400)
    if User.query.filter_by(email=email).first():
        raise APIException("Email already registered", 409)

    user = User(email=email, is_active=True)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.serialize()}), 201


@auth.route("/login", methods=["POST"])
def login():
    body = request.get_json()
    if not body:
        raise APIException("Request body is missing", 400)

    email = body.get("email", "").strip().lower()
    password = body.get("password", "")

    if not email or not password:
        raise APIException("Email and password are required", 400)

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        raise APIException("Invalid credentials", 401)

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.serialize()}), 200


@auth.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        raise APIException("User not found", 404)
    return jsonify(user.serialize()), 200
