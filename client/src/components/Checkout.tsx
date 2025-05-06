import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import useApi from "../hooks/useApi";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useUserStore } from "../store/useUserStore";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#32325d",
      fontFamily: "Arial, sans-serif",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#e5424d",
      iconColor: "#e5424d",
    },
  },
};

interface CheckoutProps {
  total: number;
}

const Checkout: React.FC<CheckoutProps> = ({ total }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const { post } = useApi();
  const { user } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { clientSecret } = await post("/payment/create-payment-intent", {
      amount: total,
      userId: user?.id,
    });

    const result = await stripe?.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements?.getElement(CardElement)!,
      },
    });
    setLoading(false);

    if (result?.paymentIntent?.status === "succeeded") {
      toast.success("Payment Successful!");
    } else {
      toast.error("Something went wrong!");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded-xl space-y-4"
    >
      <div className="p-3 border border-gray-300 rounded-md">
        <CardElement
          options={CARD_ELEMENT_OPTIONS}
          onChange={(event) => {
            setCardComplete(event.complete);
            setCardError(event.error ? event.error.message : null);
          }}
        />
      </div>
      <button
        type="submit"
        disabled={
          !stripe || !cardComplete || !!cardError || total <= 0 || loading
        }
        className="w-full bg-emerald-500 hover:bg-emerald-600 transition font-semibold text-white py-2 px-4 rounded-md disabled:opacity-50"
      >
        {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Pay Now"}
      </button>
    </form>
  );
};

export default Checkout;
