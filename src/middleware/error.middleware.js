const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'Record';
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    status = 409;
  }

  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(', ');
    status = 400;
  }

  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    status = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expired';
    status = 401;
  }

  res.status(status).json({ message });
};

export default errorHandler;

