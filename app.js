require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
//const encrypt = require('mongoose-encryption');
const md5 = require('md5');
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const uri =
  "mongodb://localhost:27017/userDB";

mongoose.connect(uri,{useNewUrlParser : true});

const userSchema = new mongoose.Schema({
    email : String,
    password : String
});

//const secret = process.env.SECRET;

//userSchema.plugin(encrypt,{secret : secret, encryptedFields : ['password'] }); 

const User = mongoose.model('User',userSchema);

const user1 = new User({
    email : '',
    password : ''
  });

app.get('/',(req,res) => {
    res.render('home')
});

app.route('/login')
.get( (req,res) => {
    res.render('login')
})
.post( (req,res) => {
    User.findOne({email : req.body.username},(err,foundUser) => {
        if(!err){
            if(foundUser.password === md5(req.body.password)){
                res.render('secrets');
            }else{
                res.send('Incorrect Password... Try Again...');
            }
        }else{
            res.send(err);
        }
    });
})


app.route('/register')
.get((req,res) => {
    res.render('register')
})
.post((req,res) => {
    const newUser = new User({
        email : req.body.username,
        password : md5(req.body.password)
      });
    newUser.save((err) => {
        if(!err){
            res.render('login');
        }else{
            res.send(err);
        }
    });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});