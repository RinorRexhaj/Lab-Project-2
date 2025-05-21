import { useState } from 'react';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Checkout from "../components/Checkout";
import { usePaymentStore } from "../store/usePaymentStore";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

interface UtilityFormData {
  consumerCode: string;
  fullName: string;
  paymentDate: string;
  amount: string;
}

interface FormErrors {
  consumerCode?: string;
  fullName?: string;
  paymentDate?: string;
  amount?: string;
}

const Payment = () => {
  const { items, deliveryFee } = usePaymentStore();
  const [activeForm, setActiveForm] = useState<'water' | 'electricity' | null>(null);
  const [utilityData, setUtilityData] = useState<UtilityFormData>({
    consumerCode: '',
    fullName: '',
    paymentDate: '',
    amount: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    deliveryFee
  );

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!utilityData.consumerCode.trim()) newErrors.consumerCode = 'Kodi i konsumatorit është i detyrueshëm';
    if (!utilityData.fullName.trim()) newErrors.fullName = 'Emri i plotë është i detyrueshëm';
    if (!utilityData.paymentDate) newErrors.paymentDate = 'Data e pagesës është e detyrueshme';
    if (!utilityData.amount) newErrors.amount = 'Shuma është e detyrueshme';
    else if (!/^\d+(\.\d{1,2})?$/.test(utilityData.amount)) newErrors.amount = 'Shuma jo valide';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUtilitySubmit = (e: React.FormEvent, type: 'water' | 'electricity') => {
    e.preventDefault();
    if (validateForm()) {
      console.log(`Pagesa për ${type}:`, utilityData);
      setUtilityData({ consumerCode: '', fullName: '', paymentDate: '', amount: '' });
      setActiveForm(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUtilityData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  return (
    <div className="w-11/12 px-3 max-w-7xl mt-20 h-full mx-auto ">
      {/* Pjesa ekzistuese e Stripe */}
      <div className="flex gap-8 py-4 md:flex-col shadow-lg border-2 border-emerald-500 rounded-xl">
        <aside className="w-1/2 bg-white p-6 rounded-xl md:w-full">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <ul className="space-y-4">
            {items.map((item, idx) => (
              <li key={idx} className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold mt-2 text-base">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </aside>
        <span className="min-h-full w-[1px] bg-emerald-400"></span>
        <section className="w-1/2 md:w-full">
          <Elements stripe={stripePromise}>
            <Checkout total={total} />
          </Elements>
        </section>
      </div>

      {/* Butonat e reja */}
      <div className="flex gap-4 mt-8">
        <button 
          onClick={() => setActiveForm(activeForm === 'water' ? null : 'water')}
          className="w-1/2 bg-emerald-500 hover:bg-emerald-600 transition font-semibold text-white py-2 px-4 rounded-md"
        >
          Pagesa për Ujë
        </button>
        <button 
          onClick={() => setActiveForm(activeForm === 'electricity' ? null : 'electricity')}
          className="w-1/2 bg-emerald-500 hover:bg-emerald-600 transition font-semibold text-white py-2 px-4 rounded-md"
        >
          Pagesa për Rrymë
        </button>
      </div>

      {/* Forma e përbashkët */}
      {activeForm && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md border-2 border-emerald-500">
          <h1 className="text-2xl font-bold text-center mb-6 text-emerald-600">
            Forma për Pagesën e {activeForm === 'water' ? 'Ujit' : 'Rrymës'}
          </h1>

          <form onSubmit={(e) => handleUtilitySubmit(e, activeForm)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kodi i Konsumatorit
                  <input
                    type="text"
                    name="consumerCode"
                    value={utilityData.consumerCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md mt-1 focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
                {errors.consumerCode && 
                  <p className="text-red-500 text-xs mt-1">{errors.consumerCode}</p>
                }
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emri i Plotë
                  <input
                    type="text"
                    name="fullName"
                    value={utilityData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md mt-1 focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
                {errors.fullName && 
                  <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                }
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data e Pagesës
                  <input
                    type="date"
                    name="paymentDate"
                    value={utilityData.paymentDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md mt-1 focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
                {errors.paymentDate && 
                  <p className="text-red-500 text-xs mt-1">{errors.paymentDate}</p>
                }
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shuma (€)
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    value={utilityData.amount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md mt-1 focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
                {errors.amount && 
                  <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                }
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Konfirmo Pagesën për {activeForm === 'water' ? 'Ujë' : 'Rrymë'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Payment;