const { rateLimit }  = require('express-rate-limit')


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  limit: 100, 
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  handler: (req, res) => {
    res.status(429).json({
      status: "error",
      message: "Too many requests, please try again later.",
    });
  },
});

module.exports= limiter