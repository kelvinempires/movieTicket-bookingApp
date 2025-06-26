import Stripe from "stripe";
import paystackPkg from "paystack";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import UserModel from "../models/userModel.js";
import PaymentModel from "../models/PaymentModel.js";

const currency = "NGN";
const deliveryCharge = parseInt(process.env.DELIVERY_CHARGE || "1000", 10);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const paystack = paystackPkg(process.env.PAYSTACK_SECRET_KEY);

// === Cash on Delivery ===
export const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const reference = uuidv4();

    const newOrder = new PaymentModel({
      userId,
      items,
      address,
      amount,
      paymentMethod: "Cash on Delivery",
      payment: false,
      date: Date.now(),
      reference,
    });

    await newOrder.save();
    await UserModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.error("Error placing cash order:", error);
    res.status(500).json({ success: false, message: "Failed to place order." });
  }
};

// === Stripe Checkout ===
export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;
    const baseUrl = origin || process.env.FRONTEND_URL;

    const newOrder = new PaymentModel({
      userId,
      items,
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    });

    await newOrder.save();

    const line_items = items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    // Add delivery charge
    line_items.push({
      price_data: {
        currency,
        product_data: { name: "Delivery Fee" },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${baseUrl}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${baseUrl}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    res
      .status(500)
      .json({ success: false, message: "Stripe checkout failed." });
  }
};

// === Stripe Verification ===
export const verifyStripe = async (req, res) => {
  try {
    const { success, orderId, userId } = req.body;

    if (success === "true" || success === true) {
      await PaymentModel.findByIdAndUpdate(orderId, { payment: true });
      await UserModel.findByIdAndUpdate(userId, { cartData: {} });

      res.json({ success: true, message: "Order confirmed and paid" });
    } else {
      await PaymentModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment cancelled" });
    }
  } catch (error) {
    console.error("Stripe verification error:", error);
    res.status(500).json({ success: false, message: "Verification failed." });
  }
};

// === Paystack Order with Split Payment ===
export const placeOrderPaystack = async (req, res) => {
  try {
    const { items, amount, address } = req.body;
    const userId = req.user?._id;
    const email = address?.email;
    const { origin } = req.headers;

    const baseUrl =
      origin === process.env.ADMIN_FRONTEND_URL
        ? process.env.FRONTEND_URL
        : origin || process.env.FRONTEND_URL;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }

    const reference = uuidv4();

    const newOrder = new PaymentModel({
      userId,
      items,
      address,
      amount,
      paymentMethod: "Paystack",
      payment: false,
      date: Date.now(),
      reference,
    });

    await newOrder.save();

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        currency: "NGN",
        reference,
        callback_url: `${baseUrl}/verify?success=true&orderId=${newOrder._id}`,
        metadata: {
          orderId: newOrder._id,
          custom_fields: [{ display_name: "Delivery Address", value: address }],
        },
        split: {
          type: "percentage",
          subaccounts: [
            { subaccount: process.env.YOUR_SUBACCOUNT_CODE, share: 5 },
            { subaccount: process.env.VENDOR_SUBACCOUNT_CODE, share: 95 },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response?.data?.status && response.data.data?.authorization_url) {
      res.json({
        success: true,
        authorization_url: response.data.data.authorization_url,
      });
    } else {
      throw new Error("Paystack response invalid");
    }
  } catch (error) {
    console.error("Paystack order error:", error);
    res.status(500).json({ success: false, message: "Paystack order failed" });
  }
};

// === Handle Paystack Webhook (optional for automated confirmation) ===
export const handlePaystackWebhook = async (req, res) => {
  try {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).send("Unauthorized webhook");
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const order = await PaymentModel.findOne({ reference });

      if (order && !order.payment) {
        order.payment = true;
        await order.save();
        await UserModel.findByIdAndUpdate(order.userId, { cartData: {} });
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Webhook processing error");
  }
};
