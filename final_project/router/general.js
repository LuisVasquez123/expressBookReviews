const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const axios = require('axios');

public_users.post("/register", (req,res) => {
  const username = req.body.username; // Send in Body, instead of URL
  const password = req.body.password;

  if (username && password) {
      if (!isValid(username)) {
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: `User ${username} already exists!`});
      }
  }

  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const data = await Promise.resolve(books);
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error retrieving books:', err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;

  Promise
    .resolve(books[isbn])               
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify(book, null, 2));
    })
    .catch((err) => {
      console.error('Error retrieving book by ISBN:', err);
      return res.status(500).json({ message: "Internal Server Error" });
    });
});

  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  const matchingBooks = {};
  const isbns = Object.keys(books);

  isbns.forEach((key) => {
    if (books[key].author.toLowerCase() === author) {
      matchingBooks[key] = books[key];
    }
  });

  if (Object.keys(matchingBooks).length > 0) {
    const prettyOutput = JSON.stringify(matchingBooks, null, 2);
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(prettyOutput);
  } 
  else {
    return res.status(404).json({ message: `No books found for ${req.params.author}` });
  }
});


// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLowerCase();
  const matchingBooks = {};
  const isbns = Object.keys(books);

  isbns.forEach((key) => {
    if (books[key].title.toLowerCase() === title) {
      matchingBooks[key] = books[key];
    }
  });

  if (Object.keys(matchingBooks).length > 0) {
    const prettyOutput = JSON.stringify(matchingBooks, null, 2);
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(prettyOutput);
  } 
  else {
    return res.status(404).json({ message: `No books found for ${req.params.title}` });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const { isbn } = req.params;
  if (!books[isbn]) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
