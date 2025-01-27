import { ConfigProps } from "./types/config";

export type StripePlan = {
  isFeatured?: boolean;
  interval?: "monthly" | "yearly" | "one-time";
  priceId: string;
  name: string;
  description?: string;
  price: number;
  priceAnchor?: number;
  features: { name: string; }[];
  units: number;
};

const config = {
  // REQUIRED
  appName: "Sotaque Brasileiro",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "Sotaque Brasileiro is an online Portuguese school that offers personalized, culturally immersive classes with native Brazilian instructors, tailored to individual schedules and learning goals.",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "sotaquebrasileiro.com",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    plans: [
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1QfVt5G0hzDtxXr3D7YiNwRq"
            : "price_456",
        //  REQUIRED - Name of the plan, displayed on the pricing page
        interval: "monthly",
        name: "Explorer",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "Perfect for beginners testing the waters or casual learners who want flexibility.",
        // The price you want to display, the one user will be charged on Stripe.
        price: 260,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        features: [
          {
            name: "8 hours of classes per month",
          },
          {
            name: "Native Brazilian instructors",
          },
          { name: "Personalized learning plan" },
          { name: "Flexible scheduling" },
          { name: "Email support" },
        ],
        units: 8,
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1QfVxyG0hzDtxXr3GGFsKXQV"
            : "price_456",
        interval: "yearly",
        name: "Explorer",
        description: "Perfect for beginners testing the waters or casual learners who want flexibility.",
        price: 2880,
        features: [
          {
            name: "8 hours of classes per month",
          },
          {
            name: "Native Brazilian instructors",
          },
          { name: "Personalized learning plan" },
          { name: "Flexible scheduling" },
          { name: "Email support" },
        ],
        units: 96,
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1QfW3jG0hzDtxXr3Om5klqsl"
            : "price_456",
        isFeatured: true,
        interval: "monthly",
        name: "Enthusiast",
        description: "Ideal for consistent learners aiming for steady progress with more regular practice.",
        price: 380,
        features: [
          { name: "12 hours of classes per month" },
          {
            name: "Native Brazilian instructors",
          },
          { name: "Personalized learning plan" },
          { name: "Flexible scheduling" },
          { name: "Priority email support" },
        ],
        units: 12,
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1QfW6PG0hzDtxXr3DxLeHB8c"
            : "price_456",
        isFeatured: true,
        interval: "yearly",
        name: "Enthusiast",
        description: "Ideal for consistent learners aiming for steady progress with more regular practice.",
        price: 4320,
        features: [
          { name: "12 hours of classes per month" },
          {
            name: "Native Brazilian instructors",
          },
          { name: "Personalized learning plan" },
          { name: "Flexible scheduling" },
          { name: "Priority email support" },
        ],
        units: 144,
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1QfWBBG0hzDtxXr3FlRtiwr0"
            : "price_456",
        isFeatured: false,
        interval: "monthly",
        name: "Master",
        description: "Designed for dedicated learners or professionals with ambitious goals.",
        price: 450,
        features: [
          { name: "16 hours of classes per month" },
          {
            name: "Native Brazilian instructors",
          },
          { name: "Personalized learning plan" },
          { name: "Flexible scheduling" },
          { name: "Priority email and chat support" },
        ],
        units: 16,
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1QfWEfG0hzDtxXr3TetQvd8v"
            : "price_456",
        isFeatured: false,
        interval: "yearly",
        name: "Master",
        description: "Designed for dedicated learners or professionals with ambitious goals.",
        price: 4860,
        features: [
          { name: "16 hours of classes per month" },
          {
            name: "Native Brazilian instructors",
          },
          { name: "Personalized learning plan" },
          { name: "Flexible scheduling" },
          { name: "Priority email and chat support" },
        ],
        units: 192,
      },
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `Sotaque Brasileiro <noreply@resend.sotaquebrasileiro.com>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Diego at Sotaque Brasileiro <support@sotaquebrasileiro.com>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "support@sotaquebrasileiro.com",
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;
