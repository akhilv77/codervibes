import { PageShell } from "@/components/layout/page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scorecard App",
  description: "Track scores for your favorite games",
};

export default function ScorecardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageShell>{children}</PageShell>;
}