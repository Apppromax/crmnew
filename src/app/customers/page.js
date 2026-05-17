import { getAllCustomers, getAllTags } from "@/actions/customers";
import CustomerClient from "./CustomerClient";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const initialCustomers = await getAllCustomers();
  const allTagsData = await getAllTags();

  return <CustomerClient initialCustomers={initialCustomers} allTagsData={allTagsData} />;
}
