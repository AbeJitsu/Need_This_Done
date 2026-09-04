"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";
import PublicEngagementTracker from "./PublicEngagementTracker";

const privatePrefixes = [
  "/dashboard",
  "/employee",
  "/prospecting",
  "/admin",
  "/account",
  "/login",
];

export default function PublicChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPrivate = privatePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (isPrivate)
    return (
      <>
        <Navigation />
        {children}
        <Footer />
      </>
    );
  return (
    <div className="public-shell">
      <PublicEngagementTracker />
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}
