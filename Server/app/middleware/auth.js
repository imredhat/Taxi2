const jwt = require('jsonwebtoken');
const developmentSecret='pooyesh_taxi_jwt_secret_2026';
const JWT_SECRET=process.env.JWT_SECRET||developmentSecret;
if(process.env.NODE_ENV==='production'&&(JWT_SECRET===developmentSecret||Buffer.byteLength(JWT_SECRET)<32)){
  throw new Error('Set a private JWT_SECRET of at least 32 bytes in production.');
}
exports.verifyAccessToken=token=>jwt.verify(token,JWT_SECRET,{algorithms:['HS256']});

// Verify JWT token middleware
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (typeof authHeader!=='string'||!/^Bearer [^\s]+$/.test(authHeader)) {
    return res.status(401).json({ error: 'دسترسی غیرمجاز - لطفاً وارد شوید' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = exports.verifyAccessToken(token);
    req.user = decoded;
    res.set('Cache-Control','private, no-store');
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

// Passenger JWTs must not reach the existing backoffice CRUD routes.
exports.denyPassenger = (req,res,next) => req.user?.role === 'passenger'
  ? res.status(403).json({error:'برای این عملیات از API مخصوص مسافر استفاده کنید.'}) : next();

exports.verifyStaff=async(req,res,next)=>{
  const deny=()=>res.status(403).json({error:'دسترسی محدود به کارکنان است.'});
  if(!['admin','super_admin','support'].includes(req.user?.role)||!require('./passenger').uuid(req.user.userId))return deny();
  const {rowCount}=await require('../models/db').query(
    'SELECT 1 FROM users WHERE id=$1 AND role=$2 AND is_active AND NOT is_blocked',
    [req.user.userId,req.user.role],
  );
  return rowCount?next():deny();
};
