const {
  BadRequestException,
  UnauthorizedException,
} = require("../execeptions/cutsom-exception");
const { createUser, findUserByEmail } = require("./users");

const register = async (req, res) => {
  const { email, password, fullname } = req.body;
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new UnauthorizedException("User already exists");
  }
  const user = await createUser({ email, password, fullname });
  const token = user.generateAuthToken();
  res.status(201).json({
    user:user.sanitize(),
    token,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);
  if (!user || !(await user.comparePassword(password))) {
    throw new UnauthorizedException("Invalid email or password");
  }
  const token = user.generateAuthToken();
  res.status(200).json({
    user:user.sanitize(),
    token,
  });
};

module.exports = {
  register,
  login,
};
