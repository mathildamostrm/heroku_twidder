from flask import Flask, request, jsonify
import database_helper as db_helper
import json, secrets 
from gevent.pywsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from geventwebsocket import WebSocketError

app = Flask(__name__)
app.debug = True
sockets = dict() #key-value dictionary

@app.route('/')
def root():
    return app.send_static_file('client.html')

@app.route('/socket')
def socket():
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        obj = ws.receive()
        data = json.loads(obj)
        try:
            sockets[data['email']] = ws
            print(sockets[data['email']])

            while True:
                obj = ws.receive()
                if obj is None:
                    del sockets[data['email']]
                    ws.close()
                    return ""
        except WebSocketError as e:
            del sockets[data['email']]

    return ""

@app.route('/sign_in', methods=['POST'])
def sign_in():
    data = request.get_json()
    email = data['email']
    password = data['password']  
    user = db_helper.get_user(email)

    if user is None:
        return jsonify(success=False, message='ERROR: Wrong email')
    if user['password'] != password:
        return jsonify(success=False,message='ERROR: Wrong password')

    if user['password'] == password:
       #password = secrets.token_hex(50) #dont do anything with the password?

        if db_helper.get_email_logged_in_user(email):
            if email in sockets: 
                try:
                    ws = sockets[email]
                    ws.send(json.dumps({'success': False, 'message': 'You have been logged out'}))
                except WebSocketError as e:
                    del sockets[email]
            db_helper.remove_user(db_helper.get_email_logged_in_user(email)[1])


        token = secrets.token_hex(50)
        db_helper.save_token(token, email) #add logged in user
        return jsonify(success=True, message='Signing in', data=token)   
    else:
        return jsonify(success=False,message='ERROR: Wrong password')


@app.route("/sign_up", methods=["POST"]) 
def sign_up():
    data = request.get_json()
    email = data['email']
    password = data['password']
    firstname = data['firstname']
    familyname = data['familyname']
    gender = data['gender']
    city = data['city']
    country = data['country']

    old_user = db_helper.get_user(email)
    if old_user is None:
        user = db_helper.save_new_user(email, password, firstname, familyname, gender, city, country)
        if(user == True):
            return jsonify(success=True, message='Created new user')
        else:
            return jsonify(success=False, message='ERROR: New user not created')
    else:
        return jsonify(success=False, message='User exist, please sign in')


@app.route('/change_password', methods=["POST"])
def change_password():
    data = request.get_json()
    token = data['token']
    old_password = data['old_password']
    new_password = data['new_password']
    if old_password == new_password:
        return jsonify(success=False, message='ERROR: Dont use the same password again')
    email = db_helper.get_email_by_token(token)
    if email:
        logged_in_user_email = db_helper.get_user(email)          
        if old_password == logged_in_user_email['password']:
            db_helper.change_password(email, new_password)
            return jsonify(success=True, message='Password changed')
        else:
            return jsonify(success='False', message='ERROR: Password could not be changed, use a new password not your old')   
        
    else:
        return jsonify(success='False', message='ERROR: You are not signed in')


@app.route('/sign_out', methods=["POST"])  #remove token from active_websockets
def sign_out():
    data = request.get_json()
    token = data['token']
    user_sign_out = db_helper.remove_user(token)
    if user_sign_out is not None:
        return jsonify(success=True, message='Sign out successful')
    else:
        return jsonify(success=False, message='ERROR: You are not signed in')


@app.route('/get_user_data_by_token', methods=['GET']) 
def get_user_data_by_token():
    token  = request.headers.get('Authorization')
    email = db_helper.get_email_by_token(token)
    if email:
        user = db_helper.get_user(email)
        if user:
           return jsonify(success=True, message='User data GET with token', data=user)
        else:
           return jsonify(success=False, message='ERROR: User dont exist')
    else:
        return jsonify(success=False, message='ERROR: You are not signed in')


@app.route('/get_user_data_by_email/<email>', methods=['GET'])
def get_user_data_by_email(email=""):
    token  = request.headers.get('Authorization')
    get_email = db_helper.get_email_by_token(token)
    if get_email is not None:
        response_email = db_helper.get_user(email)
        if response_email is not None:
            return jsonify(success=True, message="User data GET with email", data=response_email)
        else:
            return jsonify(success=False, message='ERROR: User dont exist')
    else:
        return jsonify(success=False, message='ERROR: You are not signed in')



@app.route('/get_user_messages_by_email/<email>', methods=['GET'])
def get_user_messages_by_email(email=""):
    token = request.headers.get('Authorization')
    get_email = db_helper.get_email_by_token(token)
    if get_email is not None and db_helper.get_user(email) is not None:
        messages = db_helper.get_user_messages_by_email(email)
        if messages is not None:
            return jsonify(success=True, message="GET user data by email", data=messages)
        else:
            return jsonify(success=False, messages='ERROR: User dont exist')
    else:
        return jsonify(success=False, message='You are not signed in')


@app.route('/get_user_messages_by_token', methods=['GET'])
def get_user_messages_by_token():
    token  = request.headers.get('Authorization')
    user_email = db_helper.get_email_by_token(token)
    if user_email is not None:
        messages = db_helper.get_user_messages_by_token(user_email)
        return jsonify(success=True, message='Tweets GET by token', data=messages)
    else:
        return jsonify(success=False, message='ERROR: Couldnt get tweets by token')


@app.route('/post_tweet', methods=['PUT'])
def post_tweet():
    data = request.get_json()
    message = data['message']
    token = request.headers.get("Authorization")
    post_email = db_helper.get_email_by_token(token)
    if post_email:
        receive_email = data['email']
        if db_helper.get_user(receive_email) is not None:
            db_helper.save_tweet(post_email, receive_email, message)
            return jsonify(success=True, message='Message Posted')
        else:
            return jsonify(success=False, message='ERROR: User not find')
    else:
        return jsonify(success=False, message='ERROR: Could not post tweet')

if __name__ == '__main__':
    #app.run()
    http_server = WSGIServer(('', 5000), app ,handler_class=WebSocketHandler)
    http_server.serve_forever()
                                    