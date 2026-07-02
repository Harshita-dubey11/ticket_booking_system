const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const { config } = require("../config");
const { prisma } = require("../utils/prisma");
const { AppError } = require("../utils/errors");
const { asyncHandler } = require("../utils/asyncHandler");

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["customer", "organiser"]).default("customer"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

function signToken(userId, role) {
  return jwt.sign({ userId, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    throw new AppError(409, "Email already in use");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
    },
  });

  const token = signToken(user.id, user.role);
  res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

const login = asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = signToken(user.id, user.role);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  res.json(user);
});

module.exports = { register, login, me };
