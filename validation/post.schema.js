const Joi = require("joi");

const createPostSchema = Joi.object({
  title: Joi.string().trim().min(4).max(100).required(),
  content: Joi.string().trim().min(5).required(),
  image: Joi.string().uri().optional(),
}).unknown(false);

const updatePostSchema = Joi.object({
  title: Joi.string().trim().min(4).max(100).optional(),
  content: Joi.string().trim().min(5).optional(),
  image: Joi.string().uri().optional(),
})
  .min(1)
  .unknown(false);

module.exports = {
  createPostSchema,
  updatePostSchema,
};
