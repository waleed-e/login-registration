const User = require('../models/user.model')
var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const getAllUsers = async (req, res, next) => {
    try {
        // ### Pagination Setup ###
        const query = req.query;
        const page = parseInt(query.page, 10) || 1; // Parse page number
        const limit = parseInt(query.limit, 10) || 4; // Parse limit number
        const skip = (page - 1) * limit; // Calculate skip value

        // ### Retrieve Users ###
        const users = await User.find({}, { "_v": false, 'password': false }).limit(limit).skip(skip);

        // Check if users array is empty
        if (users.length === 0) {
            return res.status(404).json({ msg: "NO USERS FOUND" });
        }

        // Respond with the retrieved users
        res.status(200).json({ status: "success", data: users });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'An error occurred while fetching users' });
    }
};

const register = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            role,
            avatar
        } = req.body;

        const hashedPassword = await bcrypt.hash(password,10)

        // Check for required fields
        if (!firstName || !password || !email) {
            return res.status(400).json({
                status: "fail",
                msg: "First name, email, and password are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                status: "fail",
                msg: "Email already in use"
            });
        }

        // Create a new user
        const newUser = User.create({ firstName,
            lastName,
            email,
            password:hashedPassword,
            role,
            avatar})
            
        const token =await jwt.sign({email:newUser.email,id:newUser._id,role:newUser.role},process.env.JWT_SECRET_KEY,{expiresIn:'20s'})
newUser.token = token
        res.status(201).json({ status: "success", data: newUser });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'An error occurred while registering the user' });
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Log the incoming request to debug the issue
        console.log('Login request:', req.body);

        // Check for required fields
        if (!email || !password) {
            return res.status(400).json({ status: "error", msg: "Password and Email are required" });
        }

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: "error", msg: "User not found" });
        }

        // Compare the passwords
        const matchedPassword = await bcrypt.compare(password, user.password);

        if (matchedPassword) {
            const token =await jwt.sign({email:user.email,id:user._id,role:user.role},process.env.JWT_SECRET_KEY,{expiresIn:'20m'})
            user.token = token
            res.status(200).json({ status: "success", data: {token} });
        } else {
            return res.status(401).json({ status: "error", message: "Invalid credentials" });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ status: "error", message: "An error occurred during login" });
    }
};

module.exports= {
    getAllUsers,
    register,
    login
}