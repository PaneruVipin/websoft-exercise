const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { generateToken } = require('../lib/jwt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/.+\@.+\..+/, 'Invalid email address']
  },
  fullname: {
    type: String,
    required: [true, 'fullname is required'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false 
  },
  isOnline: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); 
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    return next(err);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return generateToken(this);
}

userSchema.methods.sanitize = function () {
  const userObj = this.toObject();
  delete userObj.password;
  return userObj;
};

module.exports = mongoose.model('User', userSchema);
