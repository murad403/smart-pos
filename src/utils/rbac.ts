export const ROLE_ALLOWED_ROUTES: Record<string, string[]> = {
  USER: ["/menu", "/order-life-cycle"],
  ADMIN: [
    "/dashboard",
    "/collection",
    "/pending-payments",
    "/menu-management",
    "/menu",
    "/manage-table",
    "/order-life-cycle",
    "/reports",
    "/inventory-report",
    "/item",
    "/production-station",
    "/order",
  ],
  SERVICE: ["/production", "/collection"],
  OWNER: [
    "/dashboard",
    "/reports",
    "/payment-verification",
    "/inventory-report",
    "/menu-management",
    "/profile",
    "/shift-workflow",
    "/item",
    "/production-station",
    "/order",
  ]
};

export const DEFAULT_ROLE_ROUTE: Record<string, string> = {
  USER: "/menu",
  ADMIN: "/dashboard",
  SERVICE: "/production",
  OWNER: "/dashboard"
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
