const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    userId: {
        type: Number,
        unique: true,
        sparse: true
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    displayName: {
        type: String,
        required: [true, 'Display name is required'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash if password is modified (or new)
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        console.log('Hashing password for user:', this.username);
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        console.log('Password hashed successfully');
        next();
    } catch (error) {
        console.error('Password hashing error:', error);
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        console.log('Comparing password for user:', this.username);
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

// Static method to get next userId
userSchema.statics.getNextUserId = async function() {
    const lastUser = await this.findOne().sort({ userId: -1 });
    console.log('Last userId found:', lastUser?.userId);
    return lastUser ? lastUser.userId + 1 : 1;
};

module.exports = mongoose.model('User', userSchema);