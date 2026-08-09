import { AppHeader } from "@/components/app/app-header";
import { requireUser } from "@/lib/session";

/**
 * Shell for every authenticated route.
 *
 * The session check runs here, on the server, in addition to the edge
 * middleware — middleware alone would be a single point of failure, and a
 * layout that renders user data should prove who the user is itself.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader name={user.name} email={user.email} />
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
