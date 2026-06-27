const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { BLOOD_GROUPS } = require("../constants/bloodGroups");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    NIDNumber: {
      type: String,
      required: [true, "NID number is required"],
      unique: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    bloodGroup: {
      type: String,
      required: [true, "Blood group is required"],
      enum: {
        values: BLOOD_GROUPS,
        message: "Blood group must be one of: {VALUE}",
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
