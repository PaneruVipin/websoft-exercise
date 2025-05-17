const User = require("../models/User");

const findUserByEmail = async (email) => {
  return await User.findOne({ email }).select('+password');
};

const findUserById = async (id) => {
  return await User.findById(id);
};

const createUser = async ({ email, password }) => {
    const user = new User({ email, password });
    await user.save();
    return user;
}

module.exports = {
    findUserByEmail,
    findUserById,
    createUser,
}