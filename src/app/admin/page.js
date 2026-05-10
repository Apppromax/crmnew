import { getAllUsers, getPendingTopUps } from "@/actions/admin";
import AdminClient from "./AdminClient";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  try {
    const [users, topUps] = await Promise.all([
      getAllUsers(),
      getPendingTopUps()
    ]);
    return <AdminClient initialUsers={users} initialTopUps={topUps} />;
  } catch (err) {
    return <AdminClient initialUsers={[]} initialTopUps={[]} initialError={err.message} />;
  }
}
