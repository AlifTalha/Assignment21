const userService = require("../services/userService");
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

const handleError = (res, error, fallbackMessage) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
    error: error.message,
  });
};

const registerUser = async (req, res) => {
  try {
    const user = await userService.registerUser(req.body);
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
    return handleError(res, error, "Registration failed.");
  }
};

const loginUser = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const user = await userService.loginUser(phoneNumber, password);
    const token = signToken(user._id);
    setAuthCookie(res, token);

    return sendUserResponse(res, 200, user, "Login successful.", token);
  } catch (error) {
    return handleError(res, error, "Login failed.");
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
    const users = await userService.getAllUsers();

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch users.");
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return handleError(res, error, "Failed to fetch user.");
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: user,
    });
  } catch (error) {
    return handleError(res, error, "Failed to update user.");
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      data: user,
    });
  } catch (error) {
    return handleError(res, error, "Failed to delete user.");
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
