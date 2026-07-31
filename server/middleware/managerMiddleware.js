const isManager = (req, res, next) => {
    if (req.user && req.user.role === 'manager') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied: managers only' });
    }
  };
  
  module.exports = isManager;