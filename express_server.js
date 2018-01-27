const express = require("express");
const app = express();

const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require('cookie-session');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['ihatecookies']
}));

var urlDatabase = {
  "b2xVn2": {"longURL": "http://www.lighthouselabs.ca", "userId": "userRandomID"},
  "9sm5xK": {"longURL": "http://www.google.com", "userId": "user2RandomID"}
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
}

function checkEmailAgainstUsers (email) {
  for (let id in users) {
    if (email === users[id].email) {
      return true;
    }
  }
  return false;
}

function getUserId(reqEmail) {
  for (let i in users) {
    if (reqEmail === users[i].email) {
      return users[i].id;
    }
  }
}

function checkCookies (cookies) {
  if (cookies.session.user_id) {
    return true;
  } else { return false;
  }
}

//Head page
app.get("/", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render("landing", templateVars);
});

// JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//User Registration
app.get("/register", (req, res) => {
  let templateVars = users[req.session.user_id];
  res.render("urls_register", templateVars);
});

//User Login Page
app.get("/login", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  } else {
    let templateVars = users[req.session.user_id];
    res.render("urls_login", templateVars);
  }
});

//Url list page
app.get("/urls", (req, res) => {
  if (!checkCookies(req)) {
    res.redirect("/");
  } else {
    let templateVars = {
      urls: urlDatabase,
      user: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  }
});

//create a new TinyURL page
app.get("/urls/new", (req, res) => {
  if (!checkCookies(req)) {
    res.redirect("/login");
  } else {
    let templateVars = {
    user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

//accepts the login info from the client-agent
app.post("/login", (req, res) => {
  let email = req.body.email;
  if (!email) {
    res.redirect("/login");
  } else if (!checkEmailAgainstUsers(email)) {
    res.redirect("register");
  } else if (!bcrypt.compareSync(req.body.password, users[getUserId(email)].password)) {
    res.sendStatus(403);
  } else {
    let cookieValue = "";
    for (var id in users) {
      if (email === users[id].email) {
        cookieValue = id;
      }
  }
  req.session.user_id = cookieValue;
  res.redirect("/urls");
  }
});

//accepts registration
app.post("/register", (req, res) => {
  let userIdNum = generateRandomString();
  if (!req.body.email) {
    res.redirect("/register");
  } else if (!req.body.email || !req.body.password) {
    res.sendStatus(400);
  } else if (checkEmailAgainstUsers(req.body.email)) {
    res.sendStatus(400);
  } else {
    users[userIdNum] = {
      id: userIdNum,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = userIdNum;
    res.redirect("/urls");
  }
});

//delete a created TinyURL
app.post("/urls/:id/delete", (req, res) => {
  if (!checkCookies(req)) {
    res.redirect("/login");
  } else {
    delete urlDatabase[req.params.id];
    res.redirect(301, "/urls");
  }
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//receives the updated LongURL linked to the TinyURL in /:id/
app.post("/urls/:id", (req, res) => {
  if (!checkCookies(req)) {
    res.redirect("/login");
  } else {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

//Creating a new TinyURL
app.post("/urls", (req, res) => {
  if (!checkCookies(req)) {
    res.redirect("/login");
  } else {
    let longUrl = req.body.longURL;
    if (longUrl.split('/')[0] !== 'http:') {
      longUrl = 'http://' + longUrl;
    }
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      "longURL": longUrl,
      "userId": req.session.user_id
    }
  }
  res.redirect(302, "/urls");
});

app.get("/u/:id", (req, res) => {
  const url = urlDatabase[req.params.id];
  if (!url) {
    res.sendStatus(404);
    return;
  }
  let longURL = url.longURL;
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
      shortURL: req.params.id,
      user: users[req.session.user_id]
    };
  if (!checkCookies(req)) {
    res.redirect("/login");
  } else if (req.session.user_id !== urlDatabase[req.params.id].userId) {
    res.render("wrong_page", templateVars);
  } else {
    res.render("urls_show", templateVars);
  }
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});