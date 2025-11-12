import QRCode from 'qrcode';
import crypto from 'crypto';
import logger from '../config/logger.js';

class QRService {
  generateCheckInToken(jobId, workerId, shiftDate) {
    const payload = {
      jobId,
      workerId,
      shiftDate: shiftDate.toISOString().split('T')[0],
      timestamp: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex')
    };

    const secret = process.env.QR_SECRET_KEY;
    const token = crypto.createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return { ...payload, token };
  }

  verifyCheckInToken(payload, token) {
    const secret = process.env.QR_SECRET_KEY;
    const expectedToken = crypto.createHmac('sha256', secret)
      .update(JSON.stringify({
        jobId: payload.jobId,
        workerId: payload.workerId,
        shiftDate: payload.shiftDate,
        timestamp: payload.timestamp,
        nonce: payload.nonce
      }))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(token),
      Buffer.from(expectedToken)
    );
  }

  async generateQRCode(data) {
    try {
      const qrData = JSON.stringify(data);
      const qrCode = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCode;
    } catch (error) {
      logger.error('QR Code generation failed', { error: error.message });
      throw error;
    }
  }

  async generateCheckInQR(jobId, workerId, shiftDate) {
    const tokenData = this.generateCheckInToken(jobId, workerId, shiftDate);
    return await this.generateQRCode(tokenData);
  }
}

export default new QRService();