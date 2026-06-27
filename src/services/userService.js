const { User } = require("../models");

const createDuplicateError = (field) => {
  const error = new Error(`Duplicate value for ${field}.`);
  error.statusCode = 409;
  return error;
};

const createNotFoundError = (message = "User not found.") => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

const createValidationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const handleMongoError = (error) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "field";
    throw createDuplicateError(field);
  }

  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err) => err.message);
    throw createValidationError(messages.join(", "));
  }

  if (error.name === "CastError") {
    throw createValidationError("Invalid user id.");
  }

  throw error;
};

const registerUser = async (userData) => {
  const { firstName, lastName, NIDNumber, phoneNumber, password, bloodGroup } =
    userData;

  const existingUser = await User.findOne({
    $or: [{ NIDNumber }, { phoneNumber }],
  });

  if (existingUser) {
    const field =
      existingUser.NIDNumber === NIDNumber ? "NID number" : "phone number";
    const error = new Error(`User with this ${field} already exists.`);
    error.statusCode = 409;
    throw error;
  }

  try {
    return await User.create({
      firstName,
      lastName,
      NIDNumber,
      phoneNumber,
      password,
      bloodGroup,
    });
  } catch (error) {
    handleMongoError(error);
  }
};

const loginUser = async (phoneNumber, password) => {
  if (!phoneNumber || !password) {
    throw createValidationError("Phone number and password are required.");
  }

  const user = await User.findOne({ phoneNumber }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    const error = new Error("Invalid phone number or password.");
    error.statusCode = 401;
    throw error;
  }

  user.password = undefined;
  return user;
};

const getAllUsers = async () => {
  return User.find().sort({ createdAt: -1 });
};

const getUserById = async (id) => {
  try {
    const user = await User.findById(id);

    if (!user) {
      throw createNotFoundError();
    }

    return user;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    handleMongoError(error);
  }
};

const updateUser = async (id, body) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "NIDNumber",
    "phoneNumber",
    "password",
    "bloodGroup",
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw createValidationError("No valid fields provided for update.");
  }

  try {
    const user = await User.findById(id).select("+password");

    if (!user) {
      throw createNotFoundError();
    }

    Object.assign(user, updates);
    await user.save();

    user.password = undefined;
    return user;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    handleMongoError(error);
  }
};

const deleteUser = async (id) => {
  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      throw createNotFoundError();
    }

    return user;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    handleMongoError(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
