import { useEffect, useState } from "react";
import useApi from "../../../hooks/useApi";
import { Payment } from "../../../types/Payment";

const PaymentsTab = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const { get } = useApi();

  useEffect(() => {
    getPayments();
  }, []);

  const getPayments = async () => {
    const { payments } = await get(`/payment/all`);
    setPayments(payments);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-700 mb-6">Payments</h2>

      {payments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700 border border-gray-200">
            <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-600">
              <tr>
                <th scope="col" className="px-6 py-4">
                  User Full Name
                </th>
                <th scope="col" className="px-6 py-4">
                  Total
                </th>
                <th scope="col" className="px-6 py-4">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr
                  key={"payment-" + payment.id}
                  className="hover:bg-gray-50 border-t"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {payment.user.fullName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    ${payment.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 italic">No payments found.</p>
      )}
    </div>
  );
};

export default PaymentsTab;
