import { AppDataSource } from "../data-source";
import { Payment } from "../models/Payment";
import { User } from "../models/User";
import { PaymentRepo } from "../repositories/PaymentRepo";

export const createPayment = async (
  userId: number,
  totalPrice: number
): Promise<Payment | null> => {
  if (!userId || !totalPrice || totalPrice <= 0) return null;

  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) return null;

  const paymentData: Partial<Payment> = {
    user,
    totalPrice,
  };

  return await PaymentRepo.createPayment(paymentData);
};

export const getAllPayments = async (): Promise<Payment[]> => {
  return await PaymentRepo.getPayments();
};

export const getUserPayments = async (userId: number): Promise<Payment[]> => {
  if (!userId) return [];
  return await PaymentRepo.getUserPayments(userId);
};
