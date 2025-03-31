const multer = require('multer');

const uploadMiddlewareMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Formato no permitido'), false);
    }
    cb(null, true);
  }
});

module.exports = { uploadMiddlewareMemory };
