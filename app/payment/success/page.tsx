"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

function SuccessLogic() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const data = searchParams.get("data"); // Base64 from eSewa
  const pid = searchParams.get("pid");   // Our Payment ID

  useEffect(() => {
    if (data && pid) {
      fetch("/api/payment/verify", {
        method: "POST",
        body: JSON.stringify({ encodedData: data, paymentId: pid }),
      }).then(() => {
        // Optional: Redirect to a "Thank You" page or close window
      });
    }
  }, [data, pid]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-50">
      <h1 className="text-3xl font-bold text-green-700">Payment Successful!</h1>
      <p className="mt-2 text-gray-600">You can close this window.</p>
    </div>
  );
}

export default function Page() {
  return <Suspense><SuccessLogic /></Suspense>;
}