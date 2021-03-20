const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "https://www.lighthouselabs.ca",
  "9sm5xK": "https://www.google.com"
};

const users = { 
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
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
   }; 
  res.render("urls_show", templateVars);
});

function generateRandomString() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const stringLength = characters.length;
    for ( var i = 0; i < 6; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * stringLength));
    }
    return result;
};

function createRandomID() {
  const userNumber = Object.keys(users).length + 1;
  return `user${userNumber}RandomID`;
}

function checkSameEmail(newEmail) {
  for (const user in users) {
    if (newEmail === users[user]["email"]) {
      console.log("existing email");
      return user;
    } 
  }
} 

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(String(longURL));
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.editURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/login", (req, res) => {
  const loginEmail = req.body.user_email;
  const loginPW = req.body.user_password;
  const checkUser = checkSameEmail(loginEmail);
  
  if (!checkUser) {
    console.log("no user found");
    res.sendStatus(403);
  }

  if (users[checkUser].password !== loginPW) {
    console.log("password not match");
    res.sendStatus(403);
  }
  
  console.log(users[checkUser].id);
  res.cookie("user_id", users[checkUser].id);
  res.redirect("/urls");


});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");

});



app.post("/register", (req, res) => {
  if (req.body.password === "" || req.body.email === "") {
    res.send(400);
  }

  if (checkSameEmail(req.body.email)) {
    console.log("This eamil is already exist");
    res.sendStatus(400);
  } else {
    const newID = createRandomID();

    users[newID] = {
      id : newID,
      password : req.body.password,
      email : req.body.email
    }
  
    console.log(users);
    res.cookie("user_id", users[newID].id);
    res.redirect("/urls");
  }



});