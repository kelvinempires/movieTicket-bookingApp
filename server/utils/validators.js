import Joi from "joi";

export const validateShowtime = (data) => {
  const schema = Joi.object({
    movie: Joi.string().hex().length(24).required(),
    theatre: Joi.string().hex().length(24).required(),
    screen: Joi.string().hex().length(24).required(),
    showDate: Joi.date().required(),
    startTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
    endTime: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .required(),
    price: Joi.number().min(0).required(),
    bookedSeats: Joi.array().items(Joi.string()),
  });

  return schema.validate(data);
};
