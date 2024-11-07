const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        default: function() {
            return this.email.split('@')[0];
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        set: function(value) {
            this.username = value.split('@')[0];
            return value;
        }
    },
    password: {
        type: String,
        required: true,
    },
}, {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
});

// Add an index on the 'username' field for quicker lookups
UserSchema.index({ username: 1 });

// Hash password before saving the user document
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(enteredPassword) {
    console.log('Comparing entered password:', enteredPassword); // Log the entered password
    console.log('With stored password:', this.password); // Log the stored hashed password
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
