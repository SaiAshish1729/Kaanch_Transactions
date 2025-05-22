const Joi = require('joi');
const { ORDER_CATAGORY } = require('../utills/constraints');

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false, convert: false });
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }
        next();
    };
};
const createSellOrderValidation = Joi.object({
    user_id: Joi.string().required().label("user_id"),
    quantity: Joi.string().required().label("quantity"),
    currency: Joi.string().required().label("currency"),
    price: Joi.string().required().label("price"),
    order_catagory: Joi.string().required().valid(...[ORDER_CATAGORY.SELL, ORDER_CATAGORY.BUY]).label("order_catagory"),
});


module.exports = {
    validateRequest,
    createSellOrderValidation
}