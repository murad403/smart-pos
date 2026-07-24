import { useState, useEffect, useMemo } from "react";
import { getUserData } from "@/utils/auth";

export const useShowMenu = (sections: any[]) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredSections = useMemo(() => {
    if (!sections) return [];
    if (!isMounted) return [];

    const user = getUserData();
    const isSpecialRole = user?.role === "ADMIN" || user?.role === "OWNER";

    if (isSpecialRole) {
      // Admins and owners see all visible sections
      return sections.filter((s: any) => s.isVisible !== false);
    }

    const table = localStorage.getItem("table");
    const tableId = localStorage.getItem("tableId");
    const hasTable = !!(table || tableId);

    if (hasTable) {
      // If table info exists, filter by visibleOnQrTable
      return sections.filter(
        (s: any) => s.isVisible !== false && s.visibleOnQrTable !== false
      );
    } else {
      // If no table info exists, it's touchscreen
      return sections.filter(
        (s: any) => s.isVisible !== false && s.visibleOnTouchscreen !== false
      );
    }
  }, [sections, isMounted]);

  return filteredSections;
};
