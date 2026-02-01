"use client";
import { useEffect, useState } from "react";

export default function MobilePay({ params }: { params: { id: string } }) {
  const [error, setError] = useState("");

  useEffect(() => {
    const pay = async () => {
      try {
        // Get config from backend
        const res = await fetch(`/api/payment/details?id=${params.id}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        // Create hidden form
        const config = data.esewaConfig;
        const form = document.createElement("form");
        form.action = config.gatewayUrl;
        form.method = "POST";

        Object.keys(config).forEach((key) => {
          if (key !== "gatewayUrl") {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = config[key];
            form.appendChild(input);
          }
        });

        document.body.appendChild(form);
        form.submit(); // GO TO ESEWA
      } catch (err) {
        setError("Payment Link Expired or Invalid");
      }
    };
    pay();
  }, [params.id]);

  if (error) return <div className="p-10 text-red-500 font-bold">{error}</div>;
  return <div className="p-10 text-center font-bold text-lg">Redirecting to eSewa...</div>;
}