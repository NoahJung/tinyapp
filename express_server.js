const express = require("express");
const bodyParser = require("body-parser");
//const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8080; // default port 8080


//Middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['hellothere','IloveDima'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

//Databases
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" }
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


// server connecting
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



// GET Route
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.session.user_id] };  // before : users[req.cookies["user_id"]
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { 
    user: users[req.session.user_id] };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.session.user_id] };
  res.render("urls_login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: users[req.session.user_id] };

  if (req.session.user_id){
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
  
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL);
  res.redirect(String(longURL));
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
   }; 
  res.render("urls_show", templateVars);
});


// check User id match and return user
function urlsForUser(id) {
  let urlsOfCurrentUser = new Object();
  for (const sURL in urlDatabase) {
    if (urlDatabase[sURL].userID === id) {
      urlsOfCurrentUser[sURL] = urlDatabase[sURL];
    }
  }
  console.log(urlsOfCurrentUser);
  return urlsOfCurrentUser;
};

// Generating new short URL
function generateRandomString() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const stringLength = characters.length;
    for ( var i = 0; i < 6; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * stringLength));
    }
    return result;
};

// Creat new User ID
function createRandomID() {
  const userNumber = Object.keys(users).length + 1;
  return `user${userNumber}RandomID`;
}

// Check exiting eamil or not
function checkSameEmail(newEmail) {
  for (const user in users) {
    if (newEmail === users[user]["email"]) {
      console.log("existing email");
      return user;
    } 
  }
} 


// POST Route
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const currentUserID = req.session.user_id;
  const myURL = urlsForUser(currentUserID);
  for (const sURL in myURL) {
    if (sURL === req.params.shortURL) {
      delete urlDatabase[req.params.shortURL];
    } 
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const currentUserID = req.session.user_id;
  const myURL = urlsForUser(currentUserID);
  for (const sURL in myURL) {
    if (sURL === req.params.shortURL) {
      urlDatabase[sURL].longURL = req.body.editURL;
    } else {
      console.log("can not edit");
    }
  }
  
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

  if (bcrypt.compareSync(loginPW, users[checkUser].password)) {
    //res.cookie("user_id", users[checkUser].id);
    req.session.user_id = users[checkUser].id;
    res.redirect("/urls");
  } else {
    console.log("password not match");
    res.sendStatus(403);
  }

});

app.post("/logout", (req, res) => {
  req.session = null;
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
    const password = req.body.password; 
    const hashedPassword = bcrypt.hashSync(password, 10);

    users[newID] = {
      id : newID,
      password : hashedPassword,
      email : req.body.email
    }
  
    console.log(users);
    //res.cookie("user_id", users[newID].id);
    req.session.user_id = users[newID].id;
    res.redirect("/urls");
  }


});