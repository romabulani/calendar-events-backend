import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface CustomRequest extends Request {
  user: { id: string; email: string };
}

interface JwtCustomPayload extends JwtPayload {
  userId: string;
  email: string;
}

const verifyAuth = (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Authorization error. Access denied.",
    });
  }

  try {
    const verifiedUser = jwt.verify(token, process.env.SECRET_KEY!) as JwtCustomPayload;

    if (verifiedUser) {
      req.user = { id: verifiedUser.userId, email: verifiedUser.email };
      next();
    } else {
      return res.status(401).json({
        message: "Authorization error. User not found.",
      });
    }
  } catch (error) {
    return res.status(401).json({
      message: "Authorization error. Invalid token.",
    });
  }
};

export default verifyAuth;
