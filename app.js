require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.use(session({
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

const uri =
  "mongodb://localhost:27017/userDB";

mongoose.connect(uri,{useNewUrlParser : true});

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User',userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const user = new User({
    email : '',
    password : ''
  });

app.get('/',(req,res) => {
    res.render('home')
});


app.route('/secrets')
.get( (req,res) => {
    if(req.isAuthenticated()){
        res.render('secrets');
    }else{
        res.render('/login');
    }
});


app.route('/login')
.get( (req,res) => {
    res.render('login')
})
.post( (req,res) => {
    const user = new User({
        username : req.body.username,
        password : req.body.password
      });
    req.login(user,(err) =>{
        if(err){
            console.log(err);
        }else{
            passport.authenticate('local')(req,res,function(){
                res.redirect('/secrets');
            });
        }
    })
});


app.route('/register')
.get((req,res) => {
    res.render('register')
})
.post((req,res) => {
    User.register({username : req.body.username},req.body.password,(err,user) =>{
        if(err){
            console.log(err);
            res.render('register');
        }else{
            passport.authenticate('local')(req,res,function(){
                res.redirect('/login');
            });
        }
    });
    
});

app.get('/logout', (req,res) =>{
    req.logout((err) =>{
        if(err){
            console.log(err);
        }else{
        res.redirect('/');
        }
    });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});