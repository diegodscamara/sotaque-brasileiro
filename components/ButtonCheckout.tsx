"use client";

import { Button } from "./ui/button";
import apiClient from "@/libs/api";
import { useState } from "react";
import { toast } from "sonner";

interface ButtonCheckoutProps {
  priceId: string;
  mode?: "payment" | "subscription";
  variant?: "default" | "outline";
  successUrl?: string;
  pendingClass?: any;
}

/**
 * ButtonCheckout component creates Stripe Checkout Sessions
 * It calls the /api/stripe/create-checkout route with the priceId, successUrl and cancelUrl
 * Users must be authenticated. It will prefill the Checkout data with their email and/or credit card (if any)
 * 
 * @param {ButtonCheckoutProps} props - Component props
 * @returns {React.JSX.Element} A button that initiates the checkout process
 */
const ButtonCheckout = ({
  priceId,
  mode = "subscription",
  variant = "default",
  successUrl,
  pendingClass,
}: ButtonCheckoutProps): React.JSX.Element => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      if (!priceId) {
        throw new Error("Invalid price ID");
      }

      const baseUrl = window.location.origin;
      const defaultSuccessUrl = `${baseUrl}/dashboard`;
      const checkoutSuccessUrl = successUrl ? `${baseUrl}${successUrl}` : defaultSuccessUrl;
      const checkoutCancelUrl = `${baseUrl}${window.location.pathname}`;

      console.log("Creating checkout session with:", {
        priceId,
        successUrl: checkoutSuccessUrl,
        cancelUrl: checkoutCancelUrl,
        mode,
        pendingClass: pendingClass ? 'Present' : 'Not provided',
      });

      // Make the API call
      try {
        // Note: apiClient.post returns response.data directly due to the interceptor in libs/api.ts
        const response = await apiClient.post("/stripe/create-checkout", {
          priceId,
          successUrl: checkoutSuccessUrl,
          cancelUrl: checkoutCancelUrl,
          mode,
          pendingClass,
        });

        console.log("Checkout response:", response);

        // Check if the response has a URL property
        if (response && typeof response === 'object' && 'url' in response && response.url) {
          // Redirect to Stripe checkout
          window.location.href = response.url as string;
        } else {
          // Handle case where URL is missing
          const errorMessage = response && typeof response === 'object' && 'error' in response
            ? response.error as string
            : "Failed to create checkout session. Please check your Stripe configuration.";
          throw new Error(errorMessage);
        }
      } catch (apiError: unknown) {
        console.error("API error:", apiError);

        // Extract the error message
        let errorMessage = "Failed to create checkout session. Please try again.";

        if (apiError instanceof Error) {
          errorMessage = apiError.message;
        } else if (typeof apiError === 'object' && apiError && 'message' in apiError) {
          errorMessage = String(apiError.message);
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to start checkout process. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      effect="shineHover"
      onClick={() => handlePayment()}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <span className="mr-2 loading loading-spinner loading-xs"></span>
      ) : null}
      Get started
    </Button>
  );
};

export default ButtonCheckout;
