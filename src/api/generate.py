import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import CORS
from api.models import db, Generation
from api.utils import APIException
from api.services import AIService

gen_bp = Blueprint("gen", __name__)
CORS(gen_bp)


@gen_bp.route("/generate", methods=["POST"])
@jwt_required()
def generate():
    user_id = int(get_jwt_identity())
    body = request.get_json()

    if not body:
        raise APIException("Request body is missing", 400)

    mode = body.get("mode")
    inputs = body.get("inputs", {})

    if mode not in ("prompt", "skill"):
        raise APIException("mode must be 'prompt' or 'skill'", 400)
    if not inputs or not any(v for v in inputs.values() if v):
        raise APIException("At least one input field is required", 400)

    result = AIService.generate(mode, inputs)

    generation = Generation(
        user_id=user_id,
        mode=mode,
        user_inputs=json.dumps(inputs, ensure_ascii=False),
        result=result,
    )
    db.session.add(generation)
    db.session.commit()

    return jsonify(generation.serialize()), 201


@gen_bp.route("/history", methods=["GET"])
@jwt_required()
def get_history():
    user_id = int(get_jwt_identity())
    generations = (
        Generation.query
        .filter_by(user_id=user_id)
        .order_by(Generation.created_at.desc())
        .all()
    )
    return jsonify([g.serialize() for g in generations]), 200


@gen_bp.route("/history/<int:gen_id>", methods=["DELETE"])
@jwt_required()
def delete_generation(gen_id):
    user_id = int(get_jwt_identity())
    generation = Generation.query.filter_by(id=gen_id, user_id=user_id).first()
    if not generation:
        raise APIException("Generation not found", 404)
    db.session.delete(generation)
    db.session.commit()
    return jsonify({"message": "Deleted"}), 200
