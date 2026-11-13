import { useState } from "react";
import {
  PayPalScriptProvider,
  PayPalButtons
} from "@paypal/react-paypal-js";

export default function Checkout() {
  const [message, setMessage] = useState("");

  const initialOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture"
  };

  // Calls Express backend to create the PayPal order
  const handleCreateOrder = async () => {
    const response = await fetch(
      "http://localhost:8000/api/orders",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: [{ id: "ITEM_123", quantity: 1 }]
        })
      }
    );

    const orderData = await response.json();
    if (orderData.id) {
      return orderData.id;
    }
    throw new Error("Could not initiate PayPal Checkout.");
  };

  // Calls Express backend to finalize payment after buyer approves
  const handleApprove = async (data: { orderID: unknown }) => {
    const response = await fetch(
      `http://localhost:8000/api/orders/${data.orderID}/capture`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      }
    );

    const orderData = await response.json();
    const transaction =
      orderData?.purchase_units?.[0]?.payments?.captures?.[0];

    if (transaction) {
      setMessage(
        `Transaction ${transaction.status}: ${transaction.id}`
      );
      // Update your database or redirect to a success page here
    } else {
      setMessage("Payment failed or declined.");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <PayPalScriptProvider options={initialOptions}>
        <PayPalButtons
          style={{ layout: "vertical" }}
          createOrder={handleCreateOrder}
          onApprove={handleApprove}
        />
      </PayPalScriptProvider>
      {message && <p>{message}</p>}
    </div>
  );
}
