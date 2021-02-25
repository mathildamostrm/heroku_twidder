/*user table*/
CREATE TABLE users(
   email text,
   password text,
   firstname text,
   familyname text,
   gender text,
   city text,
   country text,
   primary key(email)
);

/*logged in users*/
CREATE TABLE users_logged_in(
    token text, /*hashed token*/
    email text
);

/*tweets*/
CREATE TABLE tweets(
    post_email text,
    receive_email text,
    message text
);