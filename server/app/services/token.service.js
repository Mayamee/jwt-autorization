import jwt from "jsonwebtoken";
import tokenModel from "../models/token.model.js";
import dotenv from "dotenv";
dotenv.config();

class TokenService {
  generateToken(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "30s",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });
    return { accessToken, refreshToken };
  }
  validateAccessToken(accessToken) {
    try {
      const tokenData = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      return tokenData;
    } catch (err) {
      return null;
    }
  }

  validateRefreshToken(refreshToken) {
    try {
      const tokenData = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );
      return tokenData;
    } catch (err) {
      return null;
    }
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await tokenModel.findOne({ user: userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return await tokenData.save();
    }
    const token = await tokenModel.create({ user: userId, refreshToken });
    return token;
  }
  async removeToken(refreshToken) {
    const tokenData = await tokenModel.deleteOne({ refreshToken });
    return tokenData;
  }
  async findToken(refreshToken) {
    const tokenData = await tokenModel.findOne({ refreshToken });
    return tokenData;
  }
}

export default new TokenService();
