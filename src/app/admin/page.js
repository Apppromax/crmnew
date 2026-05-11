import { getAllUsers, getPendingTopUps, getSystemSettings } from "@/actions/admin";
import AdminClient from "./AdminClient";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  try {
    const [users, topUps, settings] = await Promise.all([
      getAllUsers(),
      getPendingTopUps(),
      getSystemSettings()
    ]);
    return <AdminClient initialUsers={users} initialTopUps={topUps} initialSettings={settings} />;
  } catch (err) {
    return <AdminClient initialUsers={[]} initialTopUps={[]} initialSettings={{}} initialError={err.message} />;
  }
}
