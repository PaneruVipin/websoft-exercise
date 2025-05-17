const User = require("../models/User");

const findUserByEmail = async (email) => {
  return await User.findOne({ email }).select("+password");
};

const findUserById = async (id) => {
  return await User.findById(id);
};

const createUser = async ({ email, password, fullname }) => {
  const user = new User({ email, password, fullname });
  await user.save();
  return user;
};

const get_users = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const search = req.query.q?.trim() || "";
    const regex = new RegExp(search, "i");

    const matchConditions = {};

    if (search) {
      matchConditions.$or = [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(matchConditions)
        .select("_id fullname email isOnline createdAt")
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(matchConditions),
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    console.error(err);
    throw new InternalServerErrorException("Error fetching users");
  }
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  get_users,
};
