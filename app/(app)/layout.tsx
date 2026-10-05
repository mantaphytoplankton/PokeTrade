import { redirect } from "next/navigation";
import { logoutUser } from "@/actions/auth";
import { getCurrentUserId } from "@/lib/auth/currentUser";
import { readJson } from "@/lib/persistence/atomicWrite";
import { userProfilePath } from "@/lib/persistence/paths";
import { NavRail } from "@/components/ui/NavRail";
import { IconButton } from "@/components/ui/Button";
import { LogoutIcon } from "@/components/ui/icons";

interface Profile {
  name: string;
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login"); // defense in depth alongside proxy.ts

  const profile = await readJson<Profile>(userProfilePath(userId));
  const name = profile?.name ?? "Trainer";

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <NavRail />
      <div className="flex-1 min-w-0 flex flex-col order-1 md:order-2">
        <header className="flex items-center justify-between gap-4 flex-wrap px-6 py-4 border-b-[2.5px] border-ink bg-paper-raised">
          <div className="flex items-center gap-3">
            <span>Hi, {name} 👋</span>
          </div>
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-full bg-spark-100 border-[2.5px] border-ink flex items-center justify-center font-display text-spark-700"
            >
              {name.charAt(0).toUpperCase()}
            </div>
            <form action={logoutUser}>
              <IconButton type="submit" aria-label="Log out" title="Log out">
                <LogoutIcon className="w-5 h-5" />
              </IconButton>
            </form>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
