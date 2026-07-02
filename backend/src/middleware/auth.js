const jwt = require("jsonwebtoken");
const { config } = require("../config");
const { AppError } = require("../utils/errors");
const { prisma } = require("../utils/prisma");
const { asyncHandler } = require("../utils/asyncHandler");

const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError(401, "Authentication required");
  }

  const token = header.slice(7);
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    throw new AppError(401, "User no longer exists");
  }

  req.user = { userId: user.id, role: user.role };
  next();
});

function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError(403, "Insufficient permissions");
    }
    next();
  };
}

module.exports = { authenticate, authorize };
