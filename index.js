const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt'); // Moved to the top

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Paths to data files
const reviewFilePath = path.join(__dirname, 'review.json');
const dataFilePath = path.join(__dirname, 'data.json');

// Ensure review.json exists
if (!fs.existsSync(reviewFilePath)) {
    console.log("review.json not found. Creating a new file.");
    fs.writeFileSync(reviewFilePath, JSON.stringify([], null, 2), 'utf8'); // Create an empty review file
} else {
    console.log("review.json exists.");
}

// Load reviews from file
let reviews = [];
try {
    const reviewData = fs.readFileSync(reviewFilePath, 'utf8');
    reviews = JSON.parse(reviewData);
    console.log("Reviews loaded from file.");
} catch (err) {
    console.error("Error loading reviews:", err);
}

// Load users from file
let users = [];
function loadUsers() {
    try {
        const userData = fs.readFileSync(dataFilePath, 'utf8');
        users = JSON.parse(userData);
        console.log("Users loaded from file.");
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log("data.json not found. Creating a new file.");
            fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf8'); // Create an empty user file
        } else {
            console.error("Error loading user data:", err);
        }
    }
}

loadUsers();

// Render the main page
app.get('/', function (req, res) {
    fs.readdir('./files', function (err, files) {
        if (err) {
            console.error("Error reading files directory:", err);
            res.status(500).send("Internal server error.");
            return;
        }
        res.render("main.ejs", {
            files: files,
            reviews: reviews // Passing the reviews to the EJS template
        });
    });
});

app.get('/login', (req, res) => {
    res.render("login");
});

app.get('/signup', (req, res) => {
    res.render("signup");
});

// Submit review endpoint
app.post('/submit-review', function (req, res) {
    const { name, comment, rating } = req.body;

    if (name && comment && rating) {
        const newReview = {
            name: name,
            comment: comment,
            rating: parseInt(rating)
        };

        reviews.push(newReview); // Add the new review to the reviews array

        // Save reviews to file
        fs.writeFile(reviewFilePath, JSON.stringify(reviews, null, 2), 'utf8', (err) => {
            if (err) {
                console.error("Error saving reviews:", err);
                return res.status(500).send("Error saving review.");
            }
            console.log("Review saved successfully.");
            res.redirect('/'); // Redirect back to the main page to see the updated reviews
        });
    } else {
        res.status(400).send("All fields are required.");
    }
});

// Signup endpoint
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send("Error: Username and password are required.");
    }

    const existingUser = users.find((user) => user.name === username);

    if (existingUser) {
        return res.status(400).send("Error: User already exists. Please choose a different username.");
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { name: username, password: hashedPassword };
        users.push(newUser);

        fs.writeFile(dataFilePath, JSON.stringify(users, null, 2), "utf8", (err) => {
            if (err) {
                console.error("Error writing to file:", err);
                return res.status(500).send(`Error: Could not save user data to file. Details: ${err.message}`);
            }
            console.log("User data written to file.");
            res.redirect('/login'); // Redirect to login page after successful signup
        });
    } catch (error) {
        console.error("Error hashing password:", error);
        return res.status(500).send("Error: Could not hash password.");
    }
});

// Login endpoint
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send("Error: Username and password are required.");
    }

    const user = users.find((user) => user.name === username);

    if (!user) {
        return res.status(400).send("Error: User not found. Please check your username.");
    }

    try {
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(400).send("Error: Incorrect password.");
        }

        res.redirect('/'); // Redirect to main page after successful login
    } catch (error) {
        console.error("Error comparing passwords:", error);
        return res.status(500).send("Error: Login failed due to an internal error.");
    }
});

// Start the server
app.listen(3002, function () {
    console.log("Running on http://localhost:3002");
});