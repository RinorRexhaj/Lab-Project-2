import { AppDataSource } from "../data-source";
import { Payment } from "../models/Payment";

export class PaymentRepo {
  static async createPayment(
    paymentData: Partial<Payment>
  ): Promise<Payment | null> {
    const paymentRepo = AppDataSource.getRepository(Payment);

    const newPayment = paymentRepo.create(paymentData);
    await paymentRepo.save(newPayment);

    return await this.getPaymentById(newPayment.id);
  }

  static async getPaymentById(paymentId: number): Promise<Payment | null> {
    const paymentRepo = AppDataSource.getRepository(Payment);
    return await paymentRepo.findOne({
      where: { id: paymentId },
      relations: ["user"],
    });
  }

  static async getPayments(): Promise<Payment[]> {
    const paymentRepo = AppDataSource.getRepository(Payment);
    return (
      (await paymentRepo.find({
        relations: ["user"],
        order: { createdAt: "DESC" },
      })) || []
    );
  }
  static async getUserPayments(userId: number): Promise<Payment[]> {
    const paymentRepo = AppDataSource.getRepository(Payment);
    return (
      (await paymentRepo.find({
        where: { user: { id: userId } },
        relations: ["user"],
        order: { createdAt: "DESC" },
      })) || []
    );
  }
}
