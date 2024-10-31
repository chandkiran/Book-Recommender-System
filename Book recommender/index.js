const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const app = express();

// Set EJS as the view engine
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// Load the data
let popularData, ptData, booksData, similarityScores;

try {
  popularData = JSON.parse(
    fs.readFileSync(path.join(__dirname, "popular.json"))
  );
} catch (error) {
  console.error("Error reading popular.json:", error);
}

try {
  ptData = JSON.parse(fs.readFileSync(path.join(__dirname, "pt.json")));
} catch (error) {
  console.error("Error reading pt.json:", error);
}

try {
  booksData = JSON.parse(fs.readFileSync(path.join(__dirname, "books.json")));
} catch (error) {
  console.error("Error reading books.json:", error);
}

try {
  similarityScores = JSON.parse(
    fs.readFileSync(path.join(__dirname, "similarity_scores.json"))
  );
} catch (error) {
  console.error("Error reading similarity_scores.json:", error);
}

// Home route
app.get("/", (req, res) => {
  res.render("index", {
    book_name: popularData.map((book) => book["Book-Title"]),
    author: popularData.map((book) => book["Book-Author"]),
    image: popularData.map((book) => book["Image-URL-S"]),
    votes: popularData.map((book) => book["num_ratings"]),
    rating: popularData.map((book) => book["avg_ratings"]),
  });
});

// Recommendation route
app.get("/recommend", (req, res) => {
  res.render("recommend");
});

// Function to get book recommendations based on user input
function Recommend(userInput){
const data=[]
  const index = ptData.findIndex((book) => book["Book-Title"] === userInput);
  console.log(index)
  if (index == -1) {
    console.log("Book not found")
    return [];
  }
  const similarItems = similarityScores[index]
    .map((score, i) => [i, score]) // Step 1: Create (index, value) pairs
    .sort((a, b) => b[1] - a[1]) // Step 2: Sort by the similarity score (descending)
    .slice(1, 6); // Ignoreing First element
    // console.log(similarItems)

  similarItems.forEach((item) => {
    const bookIndex = item[0];
    const bookObject = ptData[bookIndex];
    const bookTitle = bookObject["Book-Title"];

    // Filter booksData to find entries with the same title
    const matchingBooks = booksData.filter(
      (book) => book["Book-Title"] === bookTitle
    );

    if (matchingBooks.length > 0) {
      // Get unique title, author, and image values
      const uniqueTitle = matchingBooks[0]["Book-Title"];
      const uniqueAuthor = matchingBooks[0]["Book-Author"];
      const uniqueImage = matchingBooks[0]["Image-URL-S"];
      console.log(uniqueTitle)

      // Append the information as an array to data
      data.push([uniqueTitle, uniqueAuthor, uniqueImage]);
    }
  });
  console.log(data);
  return data;
}

// Handle the POST request for recommendations
app.post("/recommend_books", (req, res) => {
  const userInput=req.body.user_input;//Extract user input from request
  const recommendations = Recommend(userInput); // Call the recommendation function
   console.log(userInput)
  // Render recommendations
  res.render("recommend", {
    data: recommendations, // This will always be defined
    message:
      recommendations.length === 0
        ? "N recommendations found. Please try another book title."
        : null,
  });
});
// Start the server
app.listen(5000, () => {
  console.log("Listening at port 5000");
});
