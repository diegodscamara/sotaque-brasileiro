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
    "The NextJS boilerplate with all you need to build your SaaS, AI tool, or any other web app.",
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
        description: "Perfect for beginners testing the waters or casual learners who want flexibility. Includes 8 hours of classes per month.",
        // The price you want to display, the one user will be charged on Stripe.
        price: 260,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        features: [
          {
            name: "Flexible scheduling to fit your lifestyle.",
          },
          { name: "Native Brazilian instructors with expertise." },
          { name: "Cultural and conversational lessons." },
          { name: "Automated reminders for class schedules." },
          { name: "Cancel or reschedule easily." },
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
        description: "Perfect for beginners testing the waters or casual learners who want flexibility. Includes 8 hours of classes per month.",
        price: 2880,
        features: [
          {
            name: "Flexible scheduling to fit your lifestyle.",
          },
          { name: "Native Brazilian instructors with expertise." },
          { name: "Cultural and conversational lessons." },
          { name: "Automated reminders for class schedules." },
          { name: "Cancel or reschedule easily." },
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
        description: "Ideal for consistent learners aiming for steady progress with more regular practice. Includes 12 hours of classes per month.",
        price: 380,
        features: [
          { name: "Priority access to experienced instructors." },
          { name: "Advanced cultural and conversational content." },
          { name: "Flexible scheduling for steady progress." },
          { name: "Automated reminders and progress tracking." },
          { name: "One free top-up hour after three months of subscription." },
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
        description: "Ideal for consistent learners aiming for steady progress with more regular practice. Includes 12 hours of classes per month.",
        price: 4320,
        features: [
          { name: "Priority access to experienced instructors." },
          { name: "Advanced cultural and conversational content." },
          { name: "Flexible scheduling for steady progress." },
          { name: "Automated reminders and progress tracking." },
          { name: "One free top-up hour after three months of subscription." },
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
        description: "Designed for dedicated learners or professionals with ambitious goals and a focus on fluency. Includes 16 hours of classes per month.",
        price: 450,
        features: [
          { name: "Dedicated sessions with senior instructors." },
          { name: "Business, cultural, and conversational modules." },
          { name: "Most cost-effective plan (up to 20% savings annually)." },
          { name: "Premium support and priority scheduling." },
          { name: "Bonus: Free cultural immersion workshop after six months." },
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
        description: "Designed for dedicated learners or professionals with ambitious goals and a focus on fluency. Includes 16 hours of classes per month.",
        price: 4860,
        features: [
          { name: "Dedicated sessions with senior instructors." },
          { name: "Business, cultural, and conversational modules." },
          { name: "Most cost-effective plan (up to 20% savings annually)." },
          { name: "Premium support and priority scheduling." },
          { name: "Bonus: Free cultural immersion workshop after six months." },
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
    fromNoReply: `Sotaque Brasileiro <noreply@resend.sotaquebrasileiro.ca>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Diego at Sotaque Brasileiro <contato@resend.sotaquebrasileiro.ca>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "sotaquebrasileiro@gmail.com",
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;
