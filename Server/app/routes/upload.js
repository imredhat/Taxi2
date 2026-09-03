const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const SERVER_PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${SERVER_PORT}`;

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('فقط فایل‌های تصویری مجاز هستند'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Single file upload
router.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'فایلی انتخاب نشده است' });
    }
    const fileUrl = `${BASE_URL}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.filename });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'خطا در آپلود فایل' });
  }
});

// Multiple files upload
router.post('/api/upload/multiple', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'فایلی انتخاب نشده است' });
    }
    const files = req.files.map(f => ({
      url: `${BASE_URL}/uploads/${f.filename}`,
      filename: f.filename
    }));
    res.json({ files });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'خطا در آپلود فایل‌ها' });
  }
});

// Delete file
router.delete('/api/upload/:filename', (req, res) => {
  try {
    const fs = require('fs');
    const filePath = path.join(__dirname, '..', '..', 'uploads', req.params.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'فایل حذف شد' });
    } else {
      res.status(404).json({ error: 'فایل یافت نشد' });
    }
  } catch (err) {
    console.error('Delete file error:', err);
    res.status(500).json({ error: 'خطا در حذف فایل' });
  }
});

module.exports = router;
