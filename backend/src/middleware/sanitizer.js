import mongoSanitize from 'express-mongo-sanitize';

const sanitizeInput = (req, res, next) => {
  return mongoSanitize()(req, res, next);
};

export default sanitizeInput;


