// ============================================================
// controllers/authController.js - AUTH BUSINESS LOGIC
// ============================================================
// Controllers contain the ACTUAL LOGIC for what happens
// when a route is hit. Routes just say "this URL → this function".
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================================
// HELPER: Generate JWT Token
// ============================================================
// We'll use this in both signup and login
// jwt.sign(payload, secret, options) creates a token

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },              // Payload: what we store in the token
    process.env.JWT_SECRET,      // Secret: only the server knows this
    { expiresIn: '30d' }         // Token expires in 30 days
  );
};

// ============================================================
// SIGNUP
// POST /api/auth/signup
// Body: { name, email, password }
// ============================================================

const signup = async (req, res) => {
  // ── STEP 1: Extract data from request body ──
  // req.body is the JSON object React sent
  const { name, email, password } = req.body;

  // ── STEP 2: Validate input ──
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }

  try {
    // ── STEP 3: Check if user already exists ──
    // User.findOne({ email }) = MongoDB query: "find a document where email = ?"
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // ── STEP 4: Create new user ──
    // User.create() = creates AND saves to MongoDB in one step
    // The password gets hashed automatically by our pre-save hook in User.js
    const user = await User.create({ name, email, password });

    // ── STEP 5: Generate JWT token ──
    const token = generateToken(user._id);

    // ── STEP 6: Send response ──
    // Status 201 = "Created" (resource was successfully created)
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

// ============================================================
// LOGIN
// POST /api/auth/login
// Body: { email, password }
// ============================================================

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // ── STEP 1: Find user by email ──
    const user = await User.findOne({ email });

    if (!user) {
      // Security tip: Don't say "email not found" - that reveals which emails exist!
      // Instead, give a vague message.
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ── STEP 2: Check password ──
    // user.matchPassword() is the method we defined in User.js
    // It uses bcrypt to compare entered password with stored hash
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ── STEP 3: Generate token and respond ──
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ============================================================
// GET CURRENT USER
// GET /api/auth/me
// (Requires auth token in header)
// ============================================================

const getMe = async (req, res) => {
  // req.user was set by the authMiddleware
  // We just return it
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
};

module.exports = { signup, login, getMe };
