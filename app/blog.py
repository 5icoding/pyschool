from flask import Blueprint
from flask import flash
from flask import g
from flask import redirect
from flask import render_template
from flask import request
from flask import url_for
from werkzeug.exceptions import abort

from app.auth import login_required
from app.db import get_db

import pymysql

bp = Blueprint("blog", __name__)


@bp.route("/")
def index():
    """Show all the posts, most recent first."""
    db = get_db()
    # posts = db.execute(
    #     "SELECT p.id, title, body, created, author_id, username"
    #     " FROM post p JOIN user u ON p.author_id = u.id"
    #     " ORDER BY created DESC"
    # ).fetchall()

    # 创建游标对象
    cursor = db.cursor(cursor=pymysql.cursors.DictCursor)

    # 执行查询
    cursor.execute(
        "SELECT p.id, title, body, created, author_id, username"
        " FROM post p JOIN user u ON p.author_id = u.id"
        " ORDER BY created DESC"
    )

    # 获取查询结果
    posts = cursor.fetchall()

    # 关闭游标和连接
    cursor.close()
    return render_template("blog/index.html", posts=posts)


def get_post(id, check_author=True):
    """Get a post and its author by id.

    Checks that the id exists and optionally that the current user is
    the author.

    :param id: id of post to get
    :param check_author: require the current user to be the author
    :return: the post with author information
    :raise 404: if a post with the given id doesn't exist
    :raise 403: if the current user isn't the author
    """
    # post = (
    #     get_db()
    #     .execute(
    #         "SELECT p.id, title, body, created, author_id, username"
    #         " FROM post p JOIN user u ON p.author_id = u.id"
    #         " WHERE p.id = ?",
    #         (id,),
    #     )
    #     .fetchone()
    # )

    # 创建游标对象
    cursor = get_db().cursor(cursor=pymysql.cursors.DictCursor)

    # 执行查询
    cursor.execute(
        "SELECT p.id, title, body, created, author_id, username"
        " FROM post p JOIN user u ON p.author_id = u.id"
        " WHERE p.id = %s",
        (id,)
    )

    # 获取查询结果
    post = cursor.fetchone()

    # 关闭游标和连接
    cursor.close()

    if post is None:
        abort(404, f"Post id {id} doesn't exist.")

    if check_author and post["author_id"] != g.user["id"]:
        abort(403)

    return post


@bp.route("/create", methods=("GET", "POST"))
@login_required
def create():
    """Create a new post for the current user."""
    if request.method == "POST":
        title = request.form["title"]
        body = request.form["body"]
        error = None

        if not title:
            error = "Title is required."

        if error is not None:
            flash(error)
        else:
            # 创建游标对象
            cursor = get_db().cursor(cursor=pymysql.cursors.DictCursor)

            # 执行插入操作
            cursor.execute(
                "INSERT INTO post (title, body, author_id) VALUES (%s, %s, %s)",
                (title, body, g.user["id"])
            )

            # 提交更改
            get_db().commit()

            # 关闭游标和连接
            cursor.close()

            return redirect(url_for("blog.index"))

    return render_template("blog/create.html")


@bp.route("/<int:id>/update", methods=("GET", "POST"))
@login_required
def update(id):
    """Update a post if the current user is the author."""
    post = get_post(id)

    if request.method == "POST":
        title = request.form["title"]
        body = request.form["body"]
        error = None

        if not title:
            error = "Title is required."

        if error is not None:
            flash(error)
        else:
            # db = get_db()
            # db.execute(
            #     "UPDATE post SET title = ?, body = ? WHERE id = ?", (title, body, id)
            # )
            # db.commit()

            # 创建游标对象
            cursor = get_db().cursor(cursor=pymysql.cursors.DictCursor)

            # 执行更新操作
            cursor.execute(
                "UPDATE post SET title = %s, body = %s WHERE id = %s",
                (title, body, id)
            )

            # 提交更改
            get_db().commit()

            # 关闭游标和连接
            cursor.close()
            return redirect(url_for("blog.index"))

    return render_template("blog/update.html", post=post)


@bp.route("/<int:id>/delete", methods=("POST",))
@login_required
def delete(id):
    """Delete a post.

    Ensures that the post exists and that the logged in user is the
    author of the post.
    """
    get_post(id)
    # db = get_db()
    # db.execute("DELETE FROM post WHERE id = ?", (id,))
    # db.commit()

    # 创建游标对象
    cursor = get_db().cursor(cursor= pymysql.cursors.DictCursor)

    # 执行删除操作
    cursor.execute("DELETE FROM post WHERE id = %s", (id,))

    # 提交更改
    get_db().commit()

    # 关闭游标和连接
    cursor.close()

    return redirect(url_for("blog.index"))
