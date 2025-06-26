import Joi from "joi";

export const validateBooking = (req, res, next) => {
  const schema = Joi.object({
    movieId: Joi.string().required(),
    quantity: Joi.number().min(1).max(10).required(),
    showTime: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};
