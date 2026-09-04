"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordEngagement } from "@/lib/engagement";
import { getPublicRouteEvent, PUBLIC_VARIANT } from "@/lib/public-journey";

/** Records only an allowlisted route identifier; it never reads visitor content. */
export default function PublicEngagementTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const route = getPublicRouteEvent(pathname);
    if (!route) return;
    recordEngagement({
      event: "page_view",
      route,
      element: "page",
      variant: PUBLIC_VARIANT,
    });
  }, [pathname]);

  return null;
}
