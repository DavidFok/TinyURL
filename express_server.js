var express = require("express");
var app = express();
var cookieParser = require('cookie-parser');
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

var users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

function generateRandomString() {
  return Math.random().toString(36).substring(6);
};

function checkEmailAgainstUsers (email) {
  for (let id in users) {
    if (email === users[id].email) {
      return true;
    }
  }
  return false;
}

function verifyPassword(email, password) {
  for (let id in users) {
    if (email === users[id].email) {
      if (password === users[id].password) {
        return true;
      }
    }
  }
  return false;
}

//Head page - NEEDS WORK!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
app.get("/", (req, res) => {
  res.end("Hello!");
});

// JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//User Registration
app.get("/register", (req, res) => {
  let templateVars = users[req.cookies.user_id];
  res.render("urls_register", templateVars);
});

//User Login Page
app.get("/login", (req, res) => {
  let templateVars = users[req.cookies.user_id];
  res.render("urls_login", templateVars);
});

//Url list page
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

//create a new TinyURL page
app.get("/urls/new", (req, res) => {
  let templateVars = {
   user: users[req.cookies.user_id]
  };
  console.log('hello');
  res.render("urls_new", templateVars);
});

//accepts the login info from the client-agent
app.post("/login", (req, res) => {
  if (!checkEmailAgainstUsers(req.body.email)) {
    res.sendStatus(403);
  } else if (!verifyPassword(req.body.email, req.body.password)) {
    res.sendStatus(403);
  } else {
    let cookieValue = "";
    for (var id in users) {
      if (req.body.email === users[id].email) {
        cookieValue = users[id].id;
      }
    }
  res.cookie('user_id', cookieValue).redirect('/urls');
  console.log("logged in!");
  console.log('cookie sent!!');
  }
});

//accepts registration
app.post("/register", (req, res) => {
  let userIdNum = generateRandomString();
  if (!req.body.email || !req.body.password) {
    res.sendStatus(400);
  } else if (checkEmailAgainstUsers(req.body.email)) {
    res.sendStatus(400);
  } else {
    users[userIdNum] = {
      id: userIdNum,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', userIdNum).redirect('/urls');
    console.log('user registered!!');
    console.log(users);
  }
});

//delete a created TinyURL
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  console.log("delete successful. redirecting");
  res.redirect(301, "/urls");
});

//receives the updated LongURL linked to the TinyURL in /:id/
app.post('/urls/:id/', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  console.log("update successful. redirecting");
  res.redirect(301, "/urls");
});

//accepts the form from creating a new TinyURL
app.post("/urls", (req, res) => {
  console.log(req.body);
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(302, '/urls');
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id').redirect('/urls');
  console.log('cookie deleted!!');
});


app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {     //the colon (:) before id indicates a pattern
  let templateVars = {
    shortURL: req.params.id,
    user: users[req.cookies.user_id]
  };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});