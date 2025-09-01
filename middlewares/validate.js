const Joi = require("joi");

const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false, // يطلع كل الأخطاء مرة واحدة
      stripUnknown: true, // يشيل أي مفاتيح زيادة مش موجودة في الـ schema
    });

    if (error) {
      return res.status(400).json({
        message: "Validation Error",
        details: error.details.map((d) => ({
          field: d.path.join("."), // يبين اسم الحقل
          message: d.message,
        })),
      });
    }

    // لو stripUnknown true -> استبدل الـ body/params/...
    req[property] = schema.validate(req[property], { stripUnknown: true }).value;

    next();
  };
};

module.exports = validate;
