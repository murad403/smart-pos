export const ROLE_ALLOWED_ROUTES: Record<string, string[]> = {
  USER: ["/menu", "/order-life-cycle"],
  ADMIN: [
    "/mobile-admin-layout",
    "/menu",
    "/collection",
    "/inventory-report",
    "/menu-management",
    "/pending-payments",
    "/payment-verification",
    "/payments-history",
  ],
  SERVICE: ["/production", "/collection"],
  OWNER: [
    "/mobile-owner-layout",
    "/menu-management",
    "/payment-verification",
    "/inventory-report",
    "/dashboard",
    "/reports",
    "/profile",
    // "/shift-workflow",
    // "/item",
    "/production-station",
    // "/order",
    "/payments-history",
    "/view-all",
    "/efficiency-report",
    "/manage-table"
  ]
};

export const DEFAULT_ROLE_ROUTE: Record<string, string> = {
  USER: "/menu",
  ADMIN: "/menu",
  SERVICE: "/production",
  OWNER: "/menu-management"
};

/**
 * Checks if a route is allowed for a given role.
 */
export const isRouteAllowed = (role: string | undefined, path: string): boolean => {
  if (!role) return false;
  const upperRole = role.toUpperCase();
  const allowedPaths = ROLE_ALLOWED_ROUTES[upperRole];
  if (!allowedPaths) return false;

  // Clean pathname to remove trailing slash if any, but keep leading slash
  const cleanPath = path === "/" ? "/" : path.replace(/\/$/, "");

  return allowedPaths.some(allowedPath => {
    return cleanPath === allowedPath || cleanPath.startsWith(allowedPath + "/");
  });
};
