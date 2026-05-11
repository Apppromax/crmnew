import { getUserProfile } from "@/actions/user";
import { getSystemSettings } from "@/actions/admin";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const [profile, settings] = await Promise.all([
    getUserProfile(),
    getSystemSettings()
  ]);

  return <ProfileClient initialProfile={profile} settings={settings} />;
}
