"use client";

import { Button } from "./ui/button";
import apiClient from "@/libs/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

// This component is used to create Stripe Checkout Sessions
// It calls the /api/stripe/create-checkout route with the priceId, successUrl and cancelUrl
// Users must be authenticated. It will prefill the Checkout data with their email and/or credit card (if any)
// You can also change the mode to "subscription" if you want to create a subscription instead of a one-time payment
const ButtonCheckout = ({
  priceId,
  mode = "subscription",
  variant = "default",
}: {
  priceId: string;
  mode?: "payment" | "subscription";
  variant?: "default" | "outline";
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      const { url }: { url: string } = await apiClient.post(
        "/stripe/create-checkout",
        {
          priceId,
          successUrl: `${window.location.origin}/dashboard`,
          cancelUrl: window.location.href,
          mode,
        }
      );

      router.push(url);
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
  };

  return (
    <Button
      variant={variant}
      effect="shineHover"
      onClick={() => handlePayment()}
    >
      {isLoading && (
        <span className="loading loading-spinner loading-xs"></span>
      )}
      Get started
    </Button>
  );
};

export default ButtonCheckout;
