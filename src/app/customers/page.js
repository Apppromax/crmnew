import { getAllCustomers, getAllTags } from "@/actions/customers";
import CustomerClient from "./CustomerClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  const [initialCustomers, allTagsData] = await Promise.all([
    getAllCustomers(),
    getAllTags(),
  ]);

  return <CustomerClient initialCustomers={initialCustomers} allTagsData={allTagsData} currentUserId={currentUserId} />;
}
