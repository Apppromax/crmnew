import { getUserProfile } from "@/actions/user";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getUserProfile();

  return <ProfileClient initialProfile={profile} />;
}
