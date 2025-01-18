export interface ConfigProps {
  appName: string;
  appDescription: string;
  domainName: string;
  crisp: {
    id?: string;
    onlyShowOnRoutes?: string[];
  };
  stripe: {
    plans: {
      units: number;
      isFeatured?: boolean;
      interval?: "monthly" | "yearly" | "one-time";
      priceId: string;
      name: string;
      description?: string;
      price: number;
      priceAnchor?: number;
      features: {
        name: string;
      }[];
    }[];
  };
  aws?: {
    bucket?: string;
    bucketUrl?: string;
    cdn?: string;
  };
  resend: {
    fromNoReply: string;
    fromAdmin: string;
    supportEmail?: string;
  };
  auth: {
    loginUrl: string;
    callbackUrl: string;
    studentWithoutPlanUrl: string;
  };
}
