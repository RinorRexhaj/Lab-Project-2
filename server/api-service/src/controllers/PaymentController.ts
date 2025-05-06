import { RequestHandler } from "express";
import Stripe from "stripe";
import { createPayment, getAllPayments } from "../services/PaymentService";

const stripe_key = process.env.STRIPE_KEY;

const stripe = new Stripe(stripe_key || "");

interface Item {
  name: string;
  price: number;
  quantity: number;
}

export const createCheckout: RequestHandler = async (
  req,
  res
): Promise<void> => {
  const { amount, userId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // in cents
      currency: "usd",
    });
    await createPayment(userId, amount);

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    res.status(500).send({ error: err });
  }
};

export const getPayments: RequestHandler = async (req, res): Promise<void> => {
  try {
    const payments = await getAllPayments();
    res.status(200).send({ payments });
  } catch (err) {
    res.status(500).send({ error: err });
  }
};
