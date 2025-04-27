const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');  // Add bcrypt for password comparison

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection string
const mongoURI = "mongodb://localhost:27017/hospitalDB";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log("Failed to connect to MongoDB", err));

// Define the User schema
const userSchema = new mongoose.Schema({
    name: String,
    age: Number,
    email: String,
    number: String,
    password: String,
    role: String
});

// Create a User model
const User = mongoose.model('User', userSchema);

// Signup route
app.post('/signup', async (req, res) => {
    const { name, age, email, number, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);  // Hash the password before saving

    const newUser = new User({
        name,
        age,
        email,
        number,
        password: hashedPassword,  // Save the hashed password
        role
    });

    try {
        await newUser.save();
        res.status(200).json({ message: 'User registered successfully', userId: newUser._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Compare entered password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Check the role
        if (user.role !== role) {
            return res.status(400).json({ error: "Role mismatch" });
        }

        // If login is successful
        res.status(200).json({ message: "Login successful", userId: user._id, role: user.role });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// Start the server
const port = 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
