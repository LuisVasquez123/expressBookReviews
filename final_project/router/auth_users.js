const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let userswithsamename = users.filter((user) => {
          return user.username === username;
      });
      
      if (userswithsamename.length > 0) {
          return true;
      } else {
          return false;
      }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user) => {
      return (user.username === username && user.password === password);
  });
  
  if (validusers.length > 0) {
      return true;
  } else {
      return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign({
          data: password
      }, 'access', { expiresIn: 60 * 60 });
      
      req.session.authorization = {
          accessToken, username
      }
      return res.status(200).send("User successfully logged in");
  } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review - must come as a query param: ?review=My%20text
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const review = req.query.review;
  const username = req.session.authorization.username; // req.session.authorization = { accessToken, username }
  
  console.log(isbn);
  console.log(review);
  console.log(username)
  
  if (!username) return res.status(401).json({ message: "User not authenticated" });
  if (!books[isbn]) return res.status(404).json({ message: "Book not found" });
  if (!review) { return res.status(400).json({ message: "Query param 'review' is required." });}

  if (!books[isbn].reviews) { books[isbn].reviews = {}; }
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: `Reviews updated for ISBN ${isbn}`,
    isbn,
    by: username,
    reviews: books[isbn].reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.session.authorization.username; // req.session.authorization = { accessToken, username }
  
  console.log(isbn);
  console.log(username)
  
  if (!username) return res.status(401).json({ message: "User not authenticated" });
  if (!books[isbn]) return res.status(404).json({ message: "Book not found" });

  if (!Object.prototype.hasOwnProperty.call(books[isbn].reviews, username))
    return res.status(404).json({ message: "No review by this user for this ISBN" });

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: `Reviews updated for ISBN ${isbn}`,
    isbn,
    reviews: books[isbn].reviews
  });
});


// POST http://localhost:5002/register
// POST http://localhost:5002/customer/login
// PUT http://localhost:5002/customer/auth/review/3?review=I%20loved%20it
// DELETE http://localhost:5002/customer/auth/review/3

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
