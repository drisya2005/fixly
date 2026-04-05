import mysql.connector
from flask import g


def get_db(app):
    """
    Returns a per-request MySQL connection stored in Flask's `g`.
    This keeps code beginner-friendly without introducing an ORM.
    """
    if "db" not in g:
        g.db = mysql.connector.connect(
            host=app.config["MYSQL_HOST"],
            user=app.config["MYSQL_USER"],
            password=app.config["MYSQL_PASSWORD"],
            database=app.config["MYSQL_DATABASE"],
            port=app.config["MYSQL_PORT"],
        )
    return g.db


def close_db(_e=None):
    """Close DB connection after request."""
    db = g.pop("db", None)
    if db is not None:
        db.close()


def query(app, sql, params=None, fetchone=False, fetchall=False, commit=False):
    """
    Small helper for running queries.
    - fetchone/fetchall: return dict-like rows using cursor(dictionary=True)
    - commit: for INSERT/UPDATE/DELETE
    """
    db = get_db(app)
    cur = db.cursor(dictionary=True)
    cur.execute(sql, params or ())

    result = None
    if fetchone:
        result = cur.fetchone()
    if fetchall:
        result = cur.fetchall()

    if commit:
        db.commit()

    cur.close()
    return result


