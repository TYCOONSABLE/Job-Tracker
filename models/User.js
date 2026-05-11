// ============================================================
// models/User.js - USER DATA BLUEPRINT
// ============================================================
// A Mongoose "model" is like a form template for MongoDB.
// Without it, someone could store { age: "banana" } in your DB.
// With it, you enforce: "email MUST be a string AND required."
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // bcrypt = password hashing library

// ============================================================
// WHAT IS A SCHEMA?
// ============================================================
// A Schema defines the SHAPE of documents in a collection.
// Think of it as: "Every user document MUST look like this."

const userSchema = new mongoose.Schema(
  {
    // User's display name
    name: {
      type: String,
      required: [true, 'Name is required'], // [value, error message]
      trim: true, // Removes whitespace: "  John  " → "John"
    },

    // Email must be unique - no two users can have the same email
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,  // Creates a database index to enforce uniqueness
      lowercase: true, // "JOHN@EXAMPLE.COM" → "john@example.com"
      trim: true,
    },

    // We NEVER store plain passwords - always hashed!
    // "Hashing" = one-way scrambling: "password123" → "$2a$10$xyz..."
    // You can't reverse a hash back to the original password
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
  },
  {
    // timestamps: true automatically adds createdAt and updatedAt fields
    // MongoDB will set these automatically when documents are created/updated
    timestamps: true,
  }
);

// ============================================================
// PRE-SAVE HOOK
// ============================================================
// This runs BEFORE saving a user to the database.
// "pre('save')" = "before saving, do this..."

userSchema.pre('save', async function (next) {
  // "this" refers to the user document being saved

  // Only hash the password if it was changed (or is new)
  // Without this check, every time you update a user's name,
  // the password would get hashed again (double-hashing breaks login!)
  if (!this.isModified('password')) {
    return next(); // Skip to the next middleware
  }

  // bcrypt.genSalt(10) creates a "salt" - random data added to the password
  // before hashing. This makes each hash unique even if passwords are same.
  // The "10" is the "cost factor" - higher = slower but more secure
  const salt = await bcrypt.genSalt(10);

  // Hash the password with the salt
  // "password123" + salt → "$2a$10$xxxxxxxxxxx..."
  this.password = await bcrypt.hash(this.password, salt);

  next(); // Continue to the next middleware (or save)
});

// ============================================================
// INSTANCE METHOD
// ============================================================
// Methods defined on the schema are available on every document.
// So you can call: user.matchPassword('somepassword')

userSchema.methods.matchPassword = async function (enteredPassword) {
  // bcrypt.compare() hashes enteredPassword and checks if it matches
  // stored hash. Returns true or false.
  return await bcrypt.compare(enteredPassword, this.password);
};

// ============================================================
// CREATE AND EXPORT THE MODEL
// ============================================================
// mongoose.model('User', userSchema) creates a Model
// First arg 'User' = collection name in MongoDB will be 'users' (lowercase + plural)

module.exports = mongoose.model('User', userSchema);
