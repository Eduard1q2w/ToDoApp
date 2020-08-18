var express     = require("express"),
    app         = express(),
	  mongoose   	= require("mongoose"),
	  bodyParser 	= require("body-parser"),
	  passport   	=require("passport"),
	  LocalStrategy = require("passport-local"),
	  User	      =require("./models/user"),
	  TodoTask		=require("./models/todoApp")

app.use(express.static(__dirname + '/public'));
app.set("view engine","ejs");

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

mongoose.connect("mongodb://localhost/to_do", {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true  });
mongoose.set('useFindAndModify', false);

//SCHEMA SETUP

var userSchema = new mongoose.Schema({
	username:String,
	password:String,
	email:String
})

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({ extended: true }));

app.use(require("express-session")({
	secret:"i am me",
	resave:false,
	saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	next();
});

app.get("/",function(req,res){
	res.render("landing")
});

app.get("/application",function(req,res){
	res.render("application")
});

app.get("/notes",function(req,res){
	res.render("notes")
});

app.get("/test",function(req,res){
	res.render('anchievements.html')
});


app.get("/progress",function(req,res){
	res.render("progress")
});
app.get("/notif",function(req,res){
	res.render("notif")
});
//AUTH ROUTES

//REGISTER

app.get("/register",function(req,res){
	res.render("register");
});

app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/application");
        });
    });
});

//LOGIN

app.get("/login",function(req,res){
	res.render("login")
});

app.post("/login",passport.authenticate("local",
	{
	successRedirect:"/profile",
	failureRedirect:"/login"
	}),function(req,res){

});

//LOGOUT

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});

// PROFILE

app.get("/profile",isLoggedIn,function(req,res){
	res.render("profile")
});

//PROFILE SETTINGS

app.get("/settings",function(req,res){
	res.render("settings")
});



//TODO

app.post('/application',async (req, res) => {
const todoTask = new TodoTask({
content: req.body.content
});
try {
await todoTask.save();
res.redirect("/application");
} catch (err) {
res.redirect("/");
}
});


app.get("/application", (req, res) => {
TodoTask.find({}, (err, tasks) => {
res.render("application.ejs", { todoTasks: tasks});
});
});

//todo

app.post('/application',async (req, res) => {
const todoTask = new TodoTask({
content: req.body.content
});
try {
await todoTask.save();
res.redirect("/application");
} catch (err) {
res.redirect("/application");
}
});


app.get("/application", (req, res) => {
TodoTask.find({}, (err, tasks) => {
res.render("application.ejs", { todoTasks: tasks });
});
});

//todo Edit

app.route("/edit/:id").get((req, res) => {
const id = req.params.id;
TodoTask.find({}, (err, tasks) => {
res.render("todoEdit.ejs", { todoTasks: tasks, idTask: id });
});
})


app.post((req, res) => {
const id = req.params.id;
TodoTask.findByIdAndUpdate(id, { content: req.body.content }, err => {
if (err) return res.send(500, err);
res.redirect("/");
});
});


//todo remove

app.route("/remove/:id").get((req, res) => {
const id = req.params.id;
TodoTask.findByIdAndRemove(id, err => {
if (err) return res.send(500, err);
res.redirect("/");
});
});

//MIDDLEWARE

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
};

app.listen(3000, function() {
  console.log('Server listening on port 3000');
});
