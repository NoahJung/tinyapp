const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8080; // default port 8080


//Middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['hellothere','IloveDima']
}));

//Databases
const urlDatabase = {};
const users = {};


// server connecting
app.get("/", (req, res) => {
  const currentUserID = req.session.user_id;
  if (currentUserID) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// GET Route
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls : urlDatabase,
    user: users[req.session.user_id],
    urllist: function() {
      let foundURLs = []; 
      for (const urlKeys in urlDatabase) {
        if (urlDatabase[urlKeys].userID === req.session.user_id) {
          foundURLs.push(urlKeys);
        }
      }
      return foundURLs;   // return the user's own url list as an Array
    }
  };  
 
  if (!req.session.user_id) {
    templateVars.urls = [];        // when no users logged-in, url list is empty.
  };
  res.render("urls_index", templateVars);

});

app.get("/register", (req, res) => {
  const templateVars = { 
    user: users[req.session.user_id] 
  }
  if (req.session.user_id) {
    res.redirect("/urls");          // when a user already logged-in, the register page does not appear
  } else {
    res.render("urls_register", templateVars);
  }
  
});

app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.session.user_id] 
  }
  if (req.session.user_id) {
    res.redirect("/urls");         // when a user already logged-in, the login page does not appear
  } else {
    res.render("urls_login", templateVars);
  }
  
});


app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: users[req.session.user_id] };

  if (req.session.user_id){
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
    console.log("please login to create new URL");
  }
  
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(String(longURL));
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortU: req.params.shortURL, 
    longU: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
    urlmatch: function() {                       // the function check if current shortURL is on the user's own or not    
      let result = true;
      if (urlDatabase[this.shortU].userID === req.session.user_id) {
        result = true;
      } else {
        result = false;
      }   
      console.log(result);
      return result;
    }
   }
  res.render("urls_show", templateVars);
});

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

// check User id match and return the user object
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
  urlDatabase[shortURL] = {
    "longURL" : req.body.longURL,
    "userID" : req.session.user_id
  }
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
  
  res.redirect(`/urls/`);
});

app.post("/login", (req, res) => {
  const loginEmail = req.body.user_email;
  const loginPW = req.body.user_password;
  const checkUser = checkSameEmail(loginEmail);
  
  if (!checkUser) {
    console.log("no user found");
    res.status(403).send('Please check your Email. If you do not have accout yet, please register.');
  }

  if (bcrypt.compareSync(loginPW, users[checkUser].password)) {
    //res.cookie("user_id", users[checkUser].id);
    req.session.user_id = users[checkUser].id;
    res.redirect("/urls");
  } else {
    console.log("password not match");
    res.status(403).send('Please check your Email or password please');
  }

});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  if (req.body.password === "" || req.body.email === "") {
    res.status(400).send('please fill out all forms and sumbmit');
  }

  if (checkSameEmail(req.body.email)) {
    res.status(400).send('This email is already exist');
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
    req.session.user_id = users[newID].id;
    res.redirect("/urls");
  }


});