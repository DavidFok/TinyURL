var express = require("express");
var app = express();
var cookieParser = require('cookie-parser');
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).substring(6);
};

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  console.log('hello');
  res.render("urls_new", templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  console.log("delete successful. redirecting");
  res.redirect(301, "/urls");
});

app.post('/urls/:id/', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  console.log("update successful. redirecting");
  res.redirect(301, "/urls");
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(302, '/urls');
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username).redirect('/urls');
  let templateVars = {
    username: req.cookies["username"]
  };
  console.log('cookie sent!!');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username').redirect('/urls');
  console.log('cookie deleted!!');
});

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {     //the colon (:) before id indicates a pattern
  let templateVars = {
    shortURL: req.params.id,
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});