import { ConfigProps } from "./types/config";
import themes from "daisyui/src/theming/themes";

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
            ? "price_1QbVRdG0hzDtxXr33tyaZPNd"
            : "price_456",
        //  REQUIRED - Name of the plan, displayed on the pricing page
        interval: "monthly",
        name: "Starter",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "Best for casual learners or those testing the waters.",
        // The price you want to display, the one user will be charged on Stripe.
        price: 340,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: 360,
        features: [
          {
            name: "NextJS boilerplate",
          },
          { name: "User oauth" },
          { name: "Database" },
          { name: "Emails" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1QbVRdG0hzDtxXr3rIEE1cy2"
            : "price_456",
        interval: "yearly",
        name: "Starter",
        description: "Best for casual learners or those testing the waters.",
        price: 4000,
        priceAnchor: 4200,
        features: [
          {
            name: "NextJS boilerplate",
          },
          { name: "User oauth" },
          { name: "Database" },
          { name: "Emails" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1QbVRdG0hzDtxXr3rIEE1cy2"
            : "price_456",
        isFeatured: true,
        interval: "monthly",
        name: "Pro",
        description: "You need more power",
        price: 460,
        priceAnchor: 480,
        features: [
          {
            name: "NextJS boilerplate",
          },
          { name: "User oauth" },
          { name: "Database" },
          { name: "Emails" },
          { name: "1 year of updates" },
          { name: "24/7 support" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1QbVRdG0hzDtxXr3rIEE1cy2"
            : "price_456",
        isFeatured: true,
        interval: "yearly",
        name: "Pro",
        description: "You need more power",
        price: 4800,
        priceAnchor: 5200,
        features: [
          {
            name: "NextJS boilerplate",
          },
          { name: "User oauth" },
          { name: "Database" },
          { name: "Emails" },
          { name: "1 year of updates" },
          { name: "24/7 support" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1QbVRdG0hzDtxXr3rIEE1cy2"
            : "price_456",
        isFeatured: false,
        interval: "monthly",
        name: "Premium",
        description: "You need more power",
        price: 540,
        priceAnchor: 560,
        features: [
          {
            name: "NextJS boilerplate",
          },
          { name: "User oauth" },
          { name: "Database" },
          { name: "Emails" },
          { name: "1 year of updates" },
          { name: "24/7 support" },
        ],
      },
      {
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1QbVRdG0hzDtxXr3rIEE1cy2"
            : "price_456",
        isFeatured: false,
        interval: "yearly",
        name: "Premium",
        description: "You need more power",
        price: 5760,
        priceAnchor: 5940,
        features: [
          {
            name: "NextJS boilerplate",
          },
          { name: "User oauth" },
          { name: "Database" },
          { name: "Emails" },
          { name: "1 year of updates" },
          { name: "24/7 support" },
        ],
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
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "lemonade",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes["light"]["primary"],
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
} as ConfigProps;

export default config;
