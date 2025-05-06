import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Checkout from "../components/Checkout";
import { usePaymentStore } from "../store/usePaymentStore";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY);

const Payment = () => {
  const { items, deliveryFee } = usePaymentStore();

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    deliveryFee
  );

  return (
    <div className="w-11/12 px-3 max-w-7xl mt-20 h-full mx-auto ">
      <div className="flex gap-8 py-4 md:flex-col shadow-lg border-2 border-emerald-500 rounded-xl">
        {/* Left: Item Summary */}
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
        {/* Right: Stripe Checkout Form */}
        <section className="w-1/2 md:w-full">
          <Elements stripe={stripePromise}>
            <Checkout total={total} />
          </Elements>
        </section>
      </div>
    </div>
  );
};

export default Payment;
