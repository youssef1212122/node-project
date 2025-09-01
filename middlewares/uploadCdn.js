const multer = require("multer");
const { imagekit } = require("../config/imagekit");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadCDN = (fieldName) => {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      try {
        if (!req.file) return next();

        const result = await imagekit.upload({
          file: req.file.buffer,
          fileName: `${Date.now()}-${req.file.originalname}`,
          folder: "/uploads", 
        });

        req.file.path = result.url;
        next();
      } catch (err) {
        next(err);
      }
    },
  ];
};

module.exports = uploadCDN;
