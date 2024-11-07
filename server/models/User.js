const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

if (!mongoose.models.User) {
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
        timestamps: true,
    });

    // Add an index on the 'username' field for quicker lookups
    UserSchema.index({ username: 1 });

    // Hash password before saving the user document
    UserSchema.pre('save', async function(next) {
        if (!this.isModified('password')) return next();
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            console.log(`Password to be saved: ${this.password}`);  // Log hashed password before saving
            next();
        } catch (error) {
            next(error);
        }
    });

    // Method to compare password
    UserSchema.methods.comparePassword = async function(enteredPassword) {
        console.log('Comparing entered password:', enteredPassword);
        console.log('With stored password:', this.password);
        const isMatch = await bcrypt.compare(enteredPassword, this.password);
        console.log(`Comparison result: ${isMatch}`);
        return isMatch;
    };

    mongoose.model('User', UserSchema);
}

module.exports = mongoose.models.User;
