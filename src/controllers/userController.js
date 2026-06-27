const User = require("../models/User");
const { signToken, setAuthCookie, clearAuthCookie } = require("../utils/token");

const sendUserResponse = (res, statusCode, user, message, token) => {
  const payload = {
    success: true,
    message,
    data: user,
  };

  if (token) {
    payload.token = token;
  }

  return res.status(statusCode).json(payload);
};

const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      NIDNumber,
      phoneNumber,
      password,
      bloodGroup,
    } = req.body;

    const existingUser = await User.findOne({
      $or: [{ NIDNumber }, { phoneNumber }],
    }).select("+password");

    if (existingUser) {
      const field =
        existingUser.NIDNumber === NIDNumber ? "NID number" : "phone number";
      return res.status(409).json({
        success: false,
        message: `User with this ${field} already exists.`,
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      NIDNumber,
      phoneNumber,
      password,
      bloodGroup,
    });

    const token = signToken(user._id);
    setAuthCookie(res, token);

    return sendUserResponse(
      res,
      201,
      user,
      "User registered successfully.",
      token,
    );
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      return res.status(409).json({
        success: false,
        message: `Duplicate value for ${field}.`,
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed.",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone number and password are required.",
      });
    }

    const user = await User.findOne({ phoneNumber }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone number or password.",
      });
    }

    const token = signToken(user._id);
    setAuthCookie(res, token);

    user.password = undefined;

    return sendUserResponse(res, 200, user, "Login successful.", token);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login failed.",
      error: error.message,
    });
  }
};

const logoutUser = (_req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

const getMyProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};

const getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user id.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user.",
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
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
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    const user = await User.findById(req.params.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    Object.assign(user, updates);
    await user.save();

    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: user,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "field";
      return res.status(409).json({
        success: false,
        message: `Duplicate value for ${field}.`,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user id.",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update user.",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      data: user,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user id.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete user.",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMyProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
