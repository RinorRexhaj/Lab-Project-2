import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { UtilityPayment } from "../models/UtilityPayment";
import { User } from "../models/User";

export const createUtilityPayment = async (req: Request, res: Response) => {
  try {
    const { fullName, consumerCode, paymentDate, amount, type, userId } = req.body;

    const user = await AppDataSource.getRepository(User).findOneBy({ id: userId });
    if (!user){ res.status(404).json({ message: "User not found" });return} 

    const payment = new UtilityPayment();
    payment.fullName = fullName;
    payment.consumerCode = consumerCode;
    payment.paymentDate = new Date(paymentDate);
    payment.amount = parseFloat(amount);
    payment.type = type;
    payment.user = user;

    await AppDataSource.getRepository(UtilityPayment).save(payment);

    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
