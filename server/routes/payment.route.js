import express from "express";
import {
  placeOrder,
  placeOrderStripe,
  verifyStripe,
  placeOrderPaystack,
  handlePaystackWebhook,
} from "../controllers/payment.controller.js";
import authUser from "../middleware/auth.js";

const paymentRouter = express.Router();

paymentRouter.post("/order/cash",authUser,  placeOrder);
paymentRouter.post("/order/stripe",authUser, placeOrderStripe);
paymentRouter.post("/order/verify-stripe",authUser, verifyStripe);
paymentRouter.post("/order/paystack",authUser, placeOrderPaystack);

paymentRouter.post("/webhook/paystack", handlePaystackWebhook);

export default paymentRouter;
