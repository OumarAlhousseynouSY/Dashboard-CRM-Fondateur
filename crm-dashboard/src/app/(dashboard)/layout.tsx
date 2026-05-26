import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import SignOutButton from "@/components/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-gray-700">
          <span className="font-bold text-lg">CRM Dashboard</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink href="/">KPIs</NavLink>
          <NavLink href="/commerciaux">Commerciaux</NavLink>
          <NavLink href="/secteurs">Secteurs</NavLink>
          <NavLink href="/import">Importer CSV</NavLink>
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2 truncate">{session.user?.email}</p>
          <SignOutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="p-8">{children}</div>
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
    >
      {children}
    </Link>
  );
}
