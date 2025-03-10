"use client";

import { UserAccountDropdown } from "@/components/user-account-dropdown";
import { JSX } from "react";
/**
 * ButtonAccount component provides user account actions dropdown
 * Uses the UserAccountDropdown component with the header variant
 * @component
 * @returns {JSX.Element} Account dropdown with profile, billing, and sign-out options
 */
const ButtonAccount = (): JSX.Element => {
  return <UserAccountDropdown variant="header" />;
};

export default ButtonAccount;
