import { User } from "../models/user.model";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const handleServerError = (res: Response, message: string) => {
  return res.status(500).json({ message });
};

export const signupHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase();

    const userFound = await User.findOne({ email: normalizedEmail });

    if (userFound) {
      return res.status(409).json({ message: "User already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    const createdUser = new User({
      email: normalizedEmail,
      password: encryptedPassword,
    });

    await createdUser.save();

    const token = jwt.sign(
      { userId: createdUser._id, email: createdUser.email },
      process.env.SECRET_KEY!,
      { expiresIn: "72h" }
    );

    return res.status(201).json({
      message: "Signup successful",
      user: {
        token,
        _id: createdUser._id,
        email: createdUser.email,
      },
    });
  } catch (error) {
    return handleServerError(res, "Signup failed. Please try again later!");
  }
};

export const loginHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase();

    const userFound = await User.findOne({ email: normalizedEmail });
    if (!userFound) {
      return res.status(401).json({
        message: "Invalid credentials. Check your username and password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, userFound.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials. Check your username and password.",
      });
    }

    const token = jwt.sign(
      { userId: userFound._id, email: userFound.email },
      process.env.SECRET_KEY!,
      { expiresIn: "72h" }
    );

    return res.status(200).json({
      message: "Login successful",
      user: {
        token,
        _id: userFound._id,
        email: userFound.email,
      },
    });
  } catch (error) {
    return handleServerError(res, "Login failed. Please try again later!");
  }
};
