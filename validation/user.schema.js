const Joi = require("joi");

// ملاحظة: لو بترفع الصورة بـ multer (local/CDN)، الصورة هتكون في req.file مش في body.
// سيبنا avatar كـ URL اختياري لو هترفع على CDN وترجع لينك في الـ body.

const createUserSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).required(),
  age: Joi.number().integer().min(10).max(120).optional(),
  bio: Joi.string().trim().min(10).optional(),
  role: Joi.string().valid("admin", "user").default("user").optional(),
  avatar: Joi.string().uri().optional(), // لينك صورة (لو CDN)
}).unknown(false); // امنع أي مفاتيح زيادة

const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).optional(),
  email: Joi.string().trim().lowercase().email().optional(),
  password: Joi.string().min(6).optional(),
  age: Joi.number().integer().min(10).max(120).optional(),
  bio: Joi.string().trim().min(10).optional(),
  role: Joi.string().valid("admin", "user").optional(),
  avatar: Joi.string().uri().optional(),
})
  .min(1)          // لازم يكون فيه على الأقل حقل واحد للتحديث
  .unknown(false); // امنع أي مفاتيح زيادة

module.exports = {
  createUserSchema,
  updateUserSchema,
};
