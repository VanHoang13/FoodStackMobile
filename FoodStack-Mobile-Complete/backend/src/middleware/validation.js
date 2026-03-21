// src/middleware/validation.js
const { ValidationError } = require('../exception/validation-error');

function validation(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors
        });
      } else {
        next(error);
      }
    }
  };
}

module.exports = {
  validation,
  validateRequest: validation,
};
