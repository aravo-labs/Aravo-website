import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/Shell";

export const metadata: Metadata = {
  title: "Dashboard | Aravo",
  // Behind a login. It has no business in an index.
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
