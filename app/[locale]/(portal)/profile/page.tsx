import { ProfilePageClient } from "./page-client";

/**
 * ProfilePage component that handles both student and teacher profiles
 * Uses the ProfilePageClient component to avoid redundant data fetching
 * @returns {JSX.Element} Profile page with user data
 */
export default function ProfilePage() {
  return <ProfilePageClient />;
} 