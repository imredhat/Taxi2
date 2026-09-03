const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'pooyesh_taxi_jwt_secret_2026';

// Verify JWT token middleware
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'دسترسی غیرمجاز - لطفاً وارد شوید' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'توکن نامعتبر یا منقضی شده' });
  }
};

// Verify admin role middleware
exports.verifyAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'دسترسی غیرمجاز - فقط مدیران' });
  }
  next();
};

// Verify support or admin role
exports.verifySupportOrAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'super_admin', 'support'].includes(req.user.role)) {
    return res.status(403).json({ error: 'دسترسی غیرمجاز' });
  }
  next();
};
