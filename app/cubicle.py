import functools

from flask import Blueprint
from flask import flash
from flask import g
from flask import redirect
from flask import render_template
from flask import request
from flask import session
from flask import url_for
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash

from app.db import get_db

bp = Blueprint("cubicle", __name__, url_prefix="/cubicle")

@bp.route("/")
def index():
    return render_template("cubicle/cubicle.html")