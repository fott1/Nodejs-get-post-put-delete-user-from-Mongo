var express     =   require("express"); //prepei na kanoume require ola afta pou xrisimopoioume
var app         =   express(); // to app to petame se mia app metavliti
var bodyParser  =   require("body-parser");
var router      =   express.Router();
//this is the file i keep my schema and the database connection
var mongoOp     =   require("./models/mongo"); //to models to pairnoume apo to afto to path.
path = require('path');
var formidable = require("formidable");
var util = require('util');

// Dependancies for Facebook Login 
var express = require('express');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;

passport.use(new Strategy({
    clientID: process.env.CLIENT_ID || '1672996562925109',
    clientSecret: process.env.CLIENT_SECRET || '01279a1db36c54dba6ffe4f31c66b579',
    callbackURL: 'http://www.3e.gr'
  },
  function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    return cb(null, profile);
  }));

  passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// We set the views to render to the user
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));

router.get("/",function(req,res){ // sto vasiko rout mas leme ti na emfanizei. edo leme to klassiko hello
        res.sendFile(path.join(__dirname, 'index.html'));}); //gia na treksei to path, to ekana prwta require epano
            //to dirname dhlwnei to vasiko directory, an einai se allo path tha htan res.sendFile(path.join(__dirname, '../dirNameHere', 'index.html'));
router.get("/about",function(req,res){ // kanoyme to idio gia ena about page
        res.sendFile(path.join(__dirname, 'about.html'));}); 

router.get("/adduser",function(req,res){
        res.sendFile(path.join(__dirname, 'form.html'));}); 

router.get("/deleteuser",function(req,res){
        res.sendFile(path.join(__dirname, 'delete.html'));}); 

router.route("/adduser")
    .post(function(req,res){
        var db = new mongoOp();
        var response = {};
        db.userEmail = req.body.email;
        db.userName = req.body.name;

        db.save(function(err){
        // save() will run insert() command of MongoDB.
        // it will add new data in collection.
            if(err) {
                response = {"error" : true,"message" : "Error adding User"};
            } else {
                response = {"error" : false,"message" : "User added"};
            }
           res.json(response);

        });

    });

router.route("/users") //gia na doume oti einai na doume prepei na pame sto /users
	.get(function(req,res){ // otan kanoume get request exoume to request kai to response pou tha to epistrepsoume se ligo
            var response = {}; // dimiourgoume ena adeio object, an instance pou lene sinexeia
	        mongoOp.find({},function(err,data){ //kai edo arxizei i anazitisi apo tin vasi, petame mesa kai ena callback function
	        // Mongo command to fetch all data from collection.
	            if(err) {
	                response = {"error" : true,"message" : "Error fetching data"};
	            } else {
	                response = {"error" : false,"message" : data}; //to response mas edwse oti dedomena vrike stin DB
	            }
	            res.json(response); //kai edo me ena json ta dinoume ston xristi me to response
	        });
	    })
	.post(function(req,res){ //ta idia me prin se ola.
        var db = new mongoOp();
        var response = {};
        // fetch email and password from REST request.
        // Add strict validation when you use this in Production.
        db.userEmail = req.body.email; 
        // Hash the password using SHA1 algorithm.
        db.userPassword =  require('crypto')
                          .createHash('sha1')
                          .update(req.body.password)
                          .digest('base64');
        db.save(function(err){
        // save() will run insert() command of MongoDB.
        // it will add new data in collection.
            if(err) {
                response = {"error" : true,"message" : "Error adding data"};
            } else {
                response = {"error" : false,"message" : "Data added"};
            }
            res.json(response);
        });
    });
    //pairno toys users me vasi to ID. i diadikasia einai idia
    //dilono to route me to id etsi
    router.route("/users/:id")
    .get(function(req,res){ // to get function einai idio me parametrous request kai response
        var response = {}; // dimiourgo ena instance gia to respond
        mongoOp.findById(req.params.id,function(err,data){ // apo tin Mongo vasi mou, vrisko me vasi to ID,
        	//tin requested parametro ID kai dino Callback to error an yparxei, kai ta Data moy.
        // This will run Mongo Query to fetch data based on ID.
            if(err) {
                response = {"error" : true,"message" : "Error fetching data"};
            } else {
                response = {"error" : false,"message" : data}; // edo epistrefei sto response ta dedomena mou
            }
            res.json(response); // edo epistrefei olokliro to JSON moy me parametro to response pou pire prin
        });
    })
    //ksana to idio, exoume vevaia prwta kanei to routing
    .put(function(req,res){ //kai twra gia to put, pou kata vasi einai to edit, dinoume ksana response kai request
        var response = {}; // ksana dilwnoyme ws ena adeio object ws instance toy response
        // first find out record exists or not
        // if it does then update the record
        mongoOp.findById(req.params.id,function(err,data){ //pali arxizei psaxnei me vasi to ID
            if(err) { //ean yparxei error. diladi an ayto to id einai TRUE
                response = {"error" : true,"message" : "Error fetching data"};
            } else {
            // we got data from Mongo. Diaforetika pairnoume ola sta stoxeia apo tin Mongo Vasi mas
            // change it accordingly.
                if(req.body.userEmail !== undefined) { //se periptwsi pou exei dwthei mail
                    // case where email needs to be updated.
                    data.userEmail = req.body.userEmail; // perase mesa oti exei dwthei sto body
                }
                if(req.body.userPassword !== undefined) {
                    // case where password needs to be updated
                    data.userPassword = req.body.userPassword; // to idio ginetai kai edo me to password
                }
                // save the data
                data.save(function(err){ //kanoume save, exontas omws dwsei callback function gia pithano error
                    if(err) {
                        response = {"error" : true,"message" : "Error updating data"};
                    } else {
                    	// twra emfanise ta dedomena wpos exoun allaksei, dinontas to requested param me vasi to ID
                        response = {"error" : false,"message" : "Data is updated for "+req.params.id}; 
                    }
                    res.json(response);
                })
            }
        });
    })
    .delete(function(req,res){ //same router.route("/users/:id").delete(funtion(req, res))
        var response = {};
        // find the data
        mongoOp.findById(req.params.id,function(err,data){
            if(err) {
                response = {"error" : true,"message" : "Error fetching data"};
            } else {
                // data exists, remove it.
                mongoOp.remove({_id : req.params.id},function(err){
                    if(err) {
                        response = {"error" : true,"message" : "Error deleting data"};
                    } else {
                        response = {"error" : true,"message" : "Data associated with "+req.params.id+"is deleted"};
                    }
                    res.json(response);
                });
            }
        });
    })


// Define Facebook Routes 

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/facebook',
  passport.authenticate('facebook'));

app.get('/login/facebook/return', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });



app.use('/',router);

app.listen(3000);
console.log("Listening to PORT 3000");