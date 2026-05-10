import { getAllCustomers } from "@/actions/customers";
import CustomerClient from "./CustomerClient";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const initialCustomers = await getAllCustomers();

  return <CustomerClient initialCustomers={initialCustomers} />;
}
