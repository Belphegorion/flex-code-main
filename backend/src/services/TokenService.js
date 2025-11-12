import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import redis from '../config/redis.js';
import logger from '../config/logger.js';

class TokenService {
  generateAccessToken(userId, role, deviceId) {
    const tokenId = crypto.randomUUID();
    return {
      token: jwt.sign(
        { userId, role, deviceId, tokenId, type: 'access' },
        process.env.JWT_SECRET,
        { expiresIn: '15m', issuer: 'eventflex' }
      ),
      tokenId,
      expiresAt: Date.now() + (15 * 60 * 1000)
    };
  }

  generateRefreshToken(userId, deviceId) {
    const tokenId = crypto.randomUUID();
    return {
      token: jwt.sign(
        { userId, deviceId, tokenId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d', issuer: 'eventflex' }
      ),
      tokenId
    };
  }

  async storeRefreshToken(userId, tokenId, deviceInfo) {
    try {
      await redis.setex(
        `refresh_token:${userId}:${tokenId}`,
        7 * 24 * 60 * 60,
        JSON.stringify({ ...deviceInfo, createdAt: new Date().toISOString(), ipAddress: deviceInfo.ip })
      );
      logger.info('Refresh token stored', { userId, tokenId });
    } catch (error) {
      logger.error('Redis store failed', { error: error.message, userId });
      throw error;
    }
  }

  async verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const stored = await redis.get(`refresh_token:${decoded.userId}:${decoded.tokenId}`);
      if (!stored) {
        logger.warn('Token not found or revoked', { userId: decoded.userId });
        throw new Error('Token revoked or expired');
      }
      const tokenData = JSON.parse(stored);
      return { ...decoded, ...tokenData };
    } catch (error) {
      logger.error('Token verification failed', { error: error.message });
      throw error;
    }
  }

  async revokeToken(userId, tokenId) {
    await redis.del(`refresh_token:${userId}:${tokenId}`);
    await redis.setex(`token_blacklist:${tokenId}`, 15 * 60, '1');
    logger.info('Token revoked', { userId, tokenId });
  }

  async isTokenBlacklisted(tokenId) {
    const result = await redis.get(`token_blacklist:${tokenId}`);
    return result === '1';
  }
}

export default new TokenService();


