require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3001;
const { verifyToken, verifyStaff } = require('./middleware/auth');

app.disable('x-powered-by');

// CORS — intercepts before Express 5 router
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Max-Age': '86400',
    });
    res.end();
    return;
  }
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public/assets under the /static URL
app.use('/static', express.static(path.join(__dirname, '..', 'public')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health endpoint (no auth needed)
app.get('/', (req, res) => {
  res.json({ message: 'Taxi2 API is running' });
});

// Load routes — login is public, all others require JWT token
const authRoutes = require('./routes/auth');
const otpRoutes = require('./routes/otp');
const userRoutes = require('./routes/users');
const rideRoutes = require('./routes/rides');
const driverRoutes = require('./routes/drivers');
const uploadRoutes = require('./routes/upload');
const pricingRoutes = require('./routes/pricing');
app.use('/', authRoutes);  // login is public
app.use('/', otpRoutes);   // OTP is public (send + verify)

// Public car data (no auth needed for signup)
const driverCtrl = require('./controllers/driverController');
app.get('/api/car-brands', driverCtrl.getCarBrands);
app.get('/api/car-models', driverCtrl.getCarModels);

const { handler } = require('./middleware/passenger');
const sepPayments = require('./controllers/passengerPaymentController');
app.get('/api/payments/sep/callback/:id', handler(sepPayments.callback));
app.post('/api/payments/sep/callback/:id', handler(sepPayments.callback));
app.use('/api/passenger', require('./routes/passenger'));
app.use('/api/driver', require('./routes/driverApp'));

app.use('/', verifyToken, verifyStaff, userRoutes, rideRoutes, driverRoutes, uploadRoutes, pricingRoutes);

app.use((error, req, res, next) => {
  if(error.type==='entity.parse.failed')return res.status(400).json({error:'بدنه JSON معتبر نیست.'});
  if(error.type==='entity.too.large')return res.status(413).json({error:'حجم درخواست بیش از حد مجاز است.'});
  console.error('Unhandled API error:',error.code||error.name);res.status(500).json({error:'خطای سرور'});
});

const server=require('node:http').createServer(app);
require('./services/dispatchSocket')(server);
require('./services/chatPush')();
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
