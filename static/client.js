displayView = function() {
    var view;
    if (window.localStorage.getItem('token')) {
        view = document.getElementById("profile_view").innerHTML;
        document.getElementById("view").innerHTML = view;
        connect_websocket();
        personal_info();
    } else {
        view = document.getElementById("welcome_view").innerHTML;
        document.getElementById("view").innerHTML = view;
    }
};

window.onload = function() {
    displayView();
};

function sign_out() {
    request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            let response = JSON.parse(request.responseText);
            if (response.success) {
                localStorage.setItem("token", '');
                displayView();  
            } else {
               // error_message.innerHTML = "ERROR: cant sign out";
               console.log("ERROR: cant sign out");
                return false;   
            }
        }
    }
    let token = {"token": window.localStorage.getItem('token')};
    request.open("POST", "/sign_out", true);
    request.setRequestHeader("Content-type", "application/json; charset=utf-8");
    request.send(JSON.stringify(token));
};

function signin() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let error_message = document.getElementById('error_sign_in');
    if (validate_email(email)) {
        error_message.innerHTML = "ERROR: No valid email address";
        return false;
    }
    if (password.lenght < 9) {
        error_message.innerHTML = "ERROR: Password lenght is to short";
        return false;
    }
    let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            let response = JSON.parse(request.responseText);
            if (response.success && response.data) {
                window.localStorage.setItem("token", response.data);
                window.localStorage.setItem("email", email); //new
                //connect_websocket();
                displayView();  
            } else {
                error_message.innerHTML = "ERROR: No valid user input";
                return false;   
            }
        }
    }
    let signin = {"email": email, "password": password};
    request.open("POST", "/sign_in", true);
    request.setRequestHeader("Content-type", "application/json; charset=utf-8");
    request.send(JSON.stringify(signin));
};

function validate_email(any) {
    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(any)) {
        return true;
    }
    return false;
};

/*---- sign up ----*/
function signup() {
    let error_message = document.getElementById('error_sign_up');

    let email = document.getElementById('set_email').value;
    let password = document.getElementById('set_password').value;
    let repeatpassword = document.getElementById('repeat_password').value;
    let first_name = document.getElementById('first_name').value;
    let last_name = document.getElementById('last_name').value;
    let gender = document.getElementById('gender').value;
    let city = document.getElementById('city').value;
    let country = document.getElementById('country').value;

    if (!password.match(repeatpassword)) {
        error_message.innerHTML = "ERROR: Passwords do not match";
        return false;
    }

    if (password.lenght < 9) {
        error_message.innerHTML = "ERROR: Password lenght is to short";
        return false;
    }

    if (validate_email(email)) {
        error_message.innerHTML = "ERROR: No valid email address";
        return false;
    }

    let user_data = {
        email: email,
        password: password,
        firstname: first_name,
        familyname: last_name,
        gender: gender,
        city: city,
        country: country
    };

    let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
       if (request.readyState === 4 && request.status === 200) {
           let response = JSON.parse(request.responseText);
           if(response.success === true) {
            error_message.innerHTML = "Signup sucessful";
            location.reload();   
           } else {
            error_message.innerHTML = "ERROR: Signup could not be completed"; 
           }
       }
    };
    request.open("POST", "/sign_up", true);
    request.setRequestHeader("Content-type", "application/json; charset=utf-8");
    request.send(JSON.stringify(user_data));
};

/*---- profile view ----*/
function openTab(evt, cur_tab) {
    var tabcontent, tablinks;
    //found on W3schools
    tabcontent = document.getElementsByClassName("tab_content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tab_links");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(cur_tab).style.display = "block";
    evt.currentTarget.className += " active";
};

/*---- change password ----*/
function change_password() {
    let data = {
        "token": localStorage.getItem('token'),
        "old_password": document.getElementById('old_password').value,
        "new_password": document.getElementById('new_password').value
    }
    if (old_password == new_password) {
        document.getElementById('error_change_password').innerHTML = "Dont use the same password!";
        return false;
    }
    request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(request.readyState == 4 && request.status == 200) {
            let response = JSON.parse(request.responseText);
            if (response.success) {
                document.getElementById('password_changed').innerHTML = "Your password is now updated";
                return true;
            } else {
                console.log('cant update password');
                return false;
            }
        }
    };
    request.open("POST", "/change_password", true);
    request.setRequestHeader("Content-type", "application/json; charset=utf-8");
    request.send(JSON.stringify(data));
};

/*---- view personal info ----*/
function personal_info() {
    let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(request.readyState == 4 && request.status == 200) {
            let response = JSON.parse(request.responseText);
            if (response.success) {
                document.getElementById('view_email').innerHTML = response.data.email;
                document.getElementById('view_first_name').innerHTML = response.data.firstname;
                document.getElementById('view_last_name').innerHTML = response.data.familyname;
                document.getElementById('view_gender').innerHTML = response.data.gender;
                document.getElementById('view_city').innerHTML = response.data.city;
                document.getElementById('view_country').innerHTML = response.data.country;
                return true;
            } else {
                console.log("cant show personal info");
                return false;
            }
        }
    };   
    request.open("GET", "/get_user_data_by_token", true);
    request.setRequestHeader("Authorization", window.localStorage.getItem('token')); 
    request.send();
};


/*---- post tweet ----*/
function post_tweet() {
    let request_email = new XMLHttpRequest();
    request_email.onreadystatechange = function() {
        if(request_email.readyState == 4 && request_email.status == 200) {
            let response_email = JSON.parse(request_email.responseText);
            let email = response_email.data.email;
            let request = new XMLHttpRequest();
            request.onreadystatechange = function() {
                 if(request.readyState == 4 && request.status == 200) {
                    let response = JSON.parse(request.responseText);
                        document.getElementById('post_tweet').innerText = response.message;
                        refresh_wall();
                    }
                }
                let my_tweet = document.getElementById('post_tweet').value;
                request.open("PUT", "/post_tweet", true);
                request.setRequestHeader("Authorization",localStorage.getItem('token'));
                request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
                let data = {"message": my_tweet, "email": email};
                request.send(JSON.stringify(data));
        }
    }

    request_email.open("GET", "/get_user_data_by_token", true);
    request_email.setRequestHeader("Authorization", window.localStorage.getItem('token'));
    request_email.send();
};

/*---- refresh wall ----*/
function refresh_wall() {
    let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(request.readyState == 4 && request.status == 200) {
            let response = JSON.parse(request.responseText);
            if (response.success) {
                get_tweet();
                console.log('refresh wall');
            } else {
                return false;
            }
        }  
    }
    request.open("GET", "/get_user_messages_by_token", true);
    request.setRequestHeader("Authorization", window.localStorage.getItem('token'));
    request.send();
};

/*---- get tweet ----*/
function get_tweet() {
    let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(request.readyState == 4 && request.status == 200) {
            let response = JSON.parse(request.responseText);
            if(response.success) {
                let tweet = response.data;
                let messages = " ";
                for (let i = 0; i < tweet.length; i++) {
                    messages += tweet[i][2] + '<br>';  
                }
                document.getElementById("display_wall").innerHTML = messages;       
            } else {
                console.log('tweet cant be displayed');
                return false;              
        }
    }
}
    request.open("GET", "/get_user_messages_by_token", true);
    request.setRequestHeader("Authorization", window.localStorage.getItem('token'));
    request.send();
};

/*---- search for user ----*/
function search_user() {
    let email = document.getElementById('search_user_email').value;
    let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(request.readyState = 4 && request.status == 200) {
            let response = JSON.parse(request.responseText); //ERRROR 
            console.log(request.responseText);
            if(response.success) {
                document.getElementById('name_user').innerHTML = response.data.firstname + "'s Twidder:";
                document.getElementById('browse_email').innerHTML = response.data.email;
                document.getElementById('browse_first_name').innerHTML = response.data.firstname;
                document.getElementById('browse_last_name').innerHTML = response.data.familyname;
                document.getElementById('browse_gender').innerHTML = response.data.gender;
                document.getElementById('browse_city').innerHTML = response.data.city;
                document.getElementById('browse_country').innerHTML = response.data.country;
                get_tweet_other();
                return true;
            } else {
                document.getElementById('error_no_user_found').innerHTML = "ERROR: User not found.";
                return false;
            }  
        }
    }
    request.open("GET", "/get_user_data_by_email/"+email, true);
    request.setRequestHeader("Authorization", window.localStorage.getItem('token'));
    request.send();
};

/*---- post to other users twidder wall ----*/
function post_tweet_other() {
    let request_email = new XMLHttpRequest();
    request_email.onreadystatechange = function() {
        if(request_email.readyState == 4 && request_email.status == 200) {
            let response_email = JSON.parse(request_email.responseText);
            let email = response_email.data.email;
            let request = new XMLHttpRequest();
            request.onreadystatechange = function() {
                 if(request.readyState == 4 && request.status == 200) {
                    let response = JSON.parse(request.responseText);
                        //document.getElementById('post_tweet').innerText = response.message;
                        refresh_wall_other();
                    }
                }
                let tweet = document.getElementById('post_tweet_other').value;
                request.open("PUT", "/post_tweet", true);
                request.setRequestHeader("Authorization",localStorage.getItem('token'));
                request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
                let data = {"message": tweet, "email": email};
                request.send(JSON.stringify(data));
        }
    }

    request_email.open("GET", "/get_user_data_by_token", true);
    request_email.setRequestHeader("Authorization", window.localStorage.getItem('token'));
    request_email.send();
};

/*---- refresh other users twidder wall ----*/
function refresh_wall_other() {
    let email = document.getElementById('search_user_email').value;
    let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(request.readyState == 4 && request.status == 200) {
            let response = JSON.parse(request.responseText);
            if (response.success) {
                get_tweet_other();
                console.log('refresh other wall');
            } else {
                return false;
            }
        }  
    }
    request.open("GET", "/get_user_messages_by_email/"+email, true);
    request.setRequestHeader("Authorization", window.localStorage.getItem('token'));
    request.send();
};

function get_tweet_other() {
    let email = document.getElementById('search_user_email').value;
    let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            let response = JSON.parse(request.responseText);
            if(response.success && response.data) {
            let tweet = response.data;
            let messages = " ";
            for (let i = 0; i < tweet.length; i++) {
                messages += tweet[i][2] + '<br>'; 
            }
            document.getElementById("display_wall_other").innerHTML = messages;
        } else {
            console.log('other tweet cant be displayed');
            return false; 
        }
    }
}
    request.open("GET", "/get_user_messages_by_email/"+email, true);
    request.setRequestHeader("Authorization", window.localStorage.getItem('token'));
    request.send();
};

function connect_websocket() {
    let socket = new WebSocket("ws://127.0.0.1:5000/socket");
    socket.onopen = function () {
      console.log('websocket open');
      let data = { "email": window.localStorage.getItem("email"), "token": window.localStorage.getItem("token") };
      console.log(data);
      socket.send(JSON.stringify(data));
    };
  
    socket.onmessage = function (message) {
        console.log('websocket on message');
      message = JSON.parse(message.data);
      if (message.success == false) {
          console.log('closing websocket');
        sign_out();
      }
    };
}

//---- PROJECT ----//

  







