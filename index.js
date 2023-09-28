const express = require('express');
const app = express();
var passwordHash = require('password-hash');
const bodyParser = require("body-parser");

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({extended : false}));

app.use(express.static("public"));

app.set("view engine","ejs");

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore , Filter} = require('firebase-admin/firestore');

var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount),
});
 
const db = getFirestore();

app.get("/", function (req,res){
  res.sendFile(__dirname + "/public/" + "dashboard.html");
});

app.post("/signupSubmit", function(req,res){
    console.log(req.body);
  db.collection("usersDemo")
    .where(
        Filter.or(
          Filter.where("email" , "==" ,req.body.email),
          Filter.where("userName" , "==" ,req.body.username)
        )
    )
    .get()
    .then((docs) => {
    if (docs.size > 0){
      res.send("Sorry,This account is already Exists with email and username");
    } else {
      db.collection("usersDemo")
        .add({
        userName : req.body.username,
        email : req.body.email,
        password : passwordHash.generate(req.body.password),
      })
      .then(() => {
        res.sendFile(__dirname + "/public/" + "login.html");
      })
      .catch(() => {
        res.send("Something went wrong");
      });
    } 
  });
});

app.post("/loginSubmit", function(req,res){


 // passwordHash.verify(req.query.password, hashedPassword)
  db.collection("usersDemo")
    .where("userName", "==" , req.body.username)
    .get()
    .then((docs) => {
      let verified = false;
      docs.forEach((doc) => {
        verified = passwordHash.verify(req.body.password, doc.data().password);
      });

      if(verified){
        res.render("books");
      } else{
        res.send("Fail");
      }
       //if(docs.size > 0){ 
      // res.sendFile(__dirname + "/public/" + "dashboard.html");
      //} else{
      //res.send("Fail");
      //}
  });

});

app.listen("5000");