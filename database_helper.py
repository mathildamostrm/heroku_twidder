import sqlite3
from flask import g
DATABASE = 'database.db'

def get_db():
    db = getattr(g, 'db', None)
    if db is None:
        db = g.db = sqlite3.connect(DATABASE)
    return db

def disconnect_db():
    db = getattr(g, 'db', None)
    if db is not None:
        g.db.close()
        g.db = None

def get_user(email): 
    cursor = get_db().execute('SELECT * FROM users WHERE users.email = ?', [email])
    result = cursor.fetchall()
    cursor.close()
    if len(result) != 0:
        data = result[0]
        if email in data:
            user = {'email': data[0], 'password': data[1], 'firstname': data[2], 'familyname': data[3], 'gender': data[4], 'city': data[5], 'country': data[6]}
        else:
            user = None
    else:
        user = None
    return user

def save_new_user(email, password, firstname, familyname, gender, city, country): 
    try:
        get_db().execute('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)',
             [email, password, firstname, familyname, gender, city, country])
        get_db().commit()
        return True
    except:
        return False

def save_token(token, email): 
    try:
        get_db().execute('INSERT INTO users_logged_in (token, email) VALUES (?,?)', [token, email])
        get_db().commit()
        return True
    except:
        return False

def change_password(email, new_password): 
    con = sqlite3.connect('database.db')
    db = con.cursor()
    try:
        db.execute('UPDATE users SET password=? WHERE email=?', [new_password, email])
        con.commit()
        db.close()
        con.close()
        return True
    except:
        db.close()
        con.close()
        return False

def get_token(token):  
    try:
        get_db().execute('SELECT * FROM users_logged_in WHERE token = ?', [token])
        db.commit()
    except:
        return False

def get_email_by_token(token): 
    con = sqlite3.connect('database.db')
    db = con.cursor()
    db.execute('SELECT email FROM users_logged_in WHERE token = ?', [token])
    rows = db.fetchall()
    con.commit()
    if len(rows) == 0:
        db.close()
        con.close()
        return False
    else:
        db.close()
        con.close()
        return rows[0][0]

def get_user_data_by_token(token):
    cursor = get_db().execute('SELECT * FROM users WHERE token = ?', [token])
    rows = cursor.fetchall()
    cursor.close()
    if len(rows) == 0:
        return False
    else:
        return rows[0][0]

def remove_user(token): 
    if get_email_by_token(token):
        con = sqlite3.connect('database.db')
        db = con.cursor()
        try:
            db.execute('DELETE FROM users_logged_in WHERE token=?', [token])
            con.commit()
            db.close()
            con.close()
            return True
        except:
            db.close()
            con.close()
            return False

def get_user_messages_by_email(email):
        con = sqlite3.connect('database.db')
        db = con.cursor()
        try:
            cursor = db.execute('SELECT * FROM tweets WHERE receive_email = ?', [email])
            result = db.fetchall()
            con.commit()
            db.close()
            con.close()
            tweets = []
            for i in range(len(result)):
                tweets.append({'from':result[i][1], 'tweet':result[i][2]})
            return result
        except:
            db.close()
            con.close()
            return False
     
def get_user_messages_by_token(token):
        con = sqlite3.connect('database.db')
        db = con.cursor()
        try:
            cursor = db.execute('SELECT * FROM tweets WHERE receive_email = ?', [token])
            result = db.fetchall()
            con.commit()
            db.close()
            con.close()
            tweets = []
            for i in range(len(result)):
                tweets.append({'from':result[i][1], 'tweet':result[i][2]})
            return result
        except:
            db.close()
            con.close()
            return False
        con = sqlite3.connect('database.db')
        db = con.cursor()

def save_tweet(post_email, receive_email, message):
        con = sqlite3.connect('database.db')
        db = con.cursor()
        try:
            db.execute('INSERT INTO tweets (post_email, receive_email, message) VALUES (?, ?, ?)', [post_email, receive_email, message])
            con.commit()
            db.close()
            con.close()
            return True
        except:
            db.close()
            con.close()
            return False

def get_email_logged_in_user(email): 
    con = sqlite3.connect('database.db')
    db = con.cursor()
    cursor = db.execute('SELECT * FROM users_logged_in WHERE email = ?', [email])
    rows = cursor.fetchall()
    cursor.close()
    if len(rows) == 0:
        return False
    else:
        return rows[0][0]







