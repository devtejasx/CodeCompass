import { AppHeader } from "@/components/app/app-header";
import { ExploreHeader } from "@/components/careers/explore-header";
import { getCurrentUser } from "@/lib/session";

/**
 * The explorer is public — anyone can read career content without an account.
 *
 * Signed-in users get the app header (account menu, logout) so the explorer
 * feels like part of the product; signed-out visitors get sign-in calls to
 * action instead. Reading the session here rather than in each page keeps the
 * three career routes consistent.
 */
export default async function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      {user ? <AppHeader name={user.name} email={user.email} /> : <ExploreHeader />}
      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
