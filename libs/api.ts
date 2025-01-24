import axios from "axios";
import config from "@/config";

// use this to interact with our own API (/app/api folder) from the front-end side
// See https://shipfa.st/docs/tutorials/api-call
const apiClient = axios.create({
  baseURL: "/api",
});

// Function to handle redirection
export const handleRedirect = (url: string) => {
  if (typeof window !== "undefined") {
    window.location.href = url; // Use window.location for redirection
  }
};

apiClient.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    let message = "";

    if (error.response?.status === 401) {
      // User not authenticated, ask to re-login
      // Redirects the user to the login page
      handleRedirect(config.auth.loginUrl);
    } else if (error.response?.status === 403) {
      // User not authorized, must subscribe/purchase/pick a plan
      message = "Pick a plan to use this feature";
    } else {
      message =
        error?.response?.data?.error || error.message || error.toString();
    }

    error.message =
      typeof message === "string" ? message : JSON.stringify(message);

    console.error(error.message);

    // Automatically display errors to the user
    if (error.message) {
      console.error(error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
