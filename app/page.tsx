import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth/currentUser";

export default async function RootPage() {
  const userId = await getCurrentUserId();
  redirect(userId ? "/dashboard" : "/login");
}
