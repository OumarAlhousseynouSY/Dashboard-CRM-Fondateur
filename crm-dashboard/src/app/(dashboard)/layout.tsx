import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex">
      <Sidebar email={session.user?.email ?? ""} />

      <main className="flex-1 overflow-auto" style={{ background: "hsl(44 20% 97%)" }}>
        <div className="p-6 pt-16 md:pt-6 lg:p-8">{children}</div>
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}
