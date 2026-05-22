/* eslint-disable react-hooks/set-state-in-effect */
"use client"
import React from "react"
// Trigger MainWrapper rebuild to reload translations
import Image from "next/image"
import { Armchair, CalendarRange, ChevronDown, CreditCard, Fuel, Grid2x2, HandCoins, LayoutDashboard, LogOut, Package, ReceiptText, ShoppingBag, User, Utensils } from "lucide-react"
import brandLogo from "@/assets/logo/logo.png"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { usePathname, useRouter, Link } from "@/i18n/routing"
import { useLocale, useTranslations } from "next-intl"
import { clearUserData, getUserData } from "@/utils/auth"
import { toast } from "sonner"

function SidebarBrand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-1">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-[#F7F7F7] shadow-sm ring-1 ring-slate-200 group-data-[collapsible=icon]:size-9">
        <Image src={brandLogo} alt="SmartPOS" className="h-7 w-7 object-contain group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" priority />
      </div>
      <div className="min-w-0 group-data-[collapsible=icon]:hidden">
        <p className="text-lg font-semibold tracking-tight text-slate-950">SmartPOS</p>
        <p className="text-xs text-slate-500">Admin panel</p>
      </div>
    </Link>
  )
}

function AppSidebar() {
  const pathName = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = React.useState(pathName.startsWith("/profile"));
  const t = useTranslations("Common");

  React.useEffect(() => {
    setProfileOpen(pathName.startsWith("/profile"));
  }, [pathName]);

  const handleLogout = () => {
    clearUserData();
    toast.success("Logged out successfully!");
    router.push("/auth/sign-in");
  };

  const navigationItems = [
    { label: t("dashboard"), icon: LayoutDashboard, href: "/dashboard" },
    { label: t("salesReports"), icon: ReceiptText, href: "/reports" },
    { label: t("paymentVerification"), icon: CreditCard, href: "/payment-verification" },
    { label: t("inventoryReport"), icon: Package, href: "/inventory-report" },
    { label: t("menu"), icon: Grid2x2, href: "/menu" },
    { label: t("item"), icon: Utensils, href: "/item" },
    { label: t("productionStation"), icon: Fuel, href: "/production-station" },
    { label: t("manageTable"), icon: Armchair, href: "/manage-table" },
    { label: t("shiftWorkflow"), icon: CalendarRange, href: "/shift-workflow" },
    { label: t("order"), icon: ShoppingBag, href: "/order" },
    { label: t("pendingPayments"), icon: HandCoins, href: "/pending-payments" },
  ]

  const profileSubItems = [
    { label: t("profileInformation"), href: "/profile/personal-information" },
    { label: t("users"), href: "/profile/users" },
    { label: t("operatingHours"), href: "/profile/operating-hours" },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200/80 bg-white">
      <SidebarHeader className="border-b border-slate-200/70 px-2 py-1">
        <SidebarBrand />
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.label}
                    className={cn(
                      "h-11 rounded-lg px-3 text-sm font-medium text-slate-600 transition-colors group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:px-0",
                      item.href === pathName
                        ? "bg-[#1A56DB] text-white shadow-lg shadow-[#1A56DB]/20 hover:bg-[#1A56DB] hover:text-white"
                        : "hover:bg-slate-100 hover:text-slate-950"
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
                      <item.icon className="size-4" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Profile Dropdown */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setProfileOpen(!profileOpen)}
                  tooltip={t("profile")}
                  className={cn(
                    "h-11 rounded-lg px-3 text-sm font-medium transition-colors group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:px-0",
                    profileOpen || pathName.startsWith("/profile")
                      ? "bg-[#1A56DB] text-white shadow-lg shadow-[#1A56DB]/20 hover:bg-[#1A56DB] hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  )}
                >
                  <div className="flex w-full items-center gap-3">
                    <User className="size-4" />
                    <span className="flex-1 group-data-[collapsible=icon]:hidden">{t("profile")}</span>
                    <ChevronDown className={cn("size-4 transition-transform group-data-[collapsible=icon]:hidden", profileOpen && "rotate-180")} />
                  </div>
                </SidebarMenuButton>

                {profileOpen && (
                  <div className="mt-1 space-y-1 group-data-[collapsible=icon]:hidden">
                    {profileSubItems.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className={cn(
                          "flex h-10 items-center rounded-lg px-10 text-sm font-medium transition-colors",
                          pathName === sub.href
                            ? "text-[#1A56DB] bg-blue-50/50"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                        )}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200/70 p-3">
        <SidebarMenuButton
          onClick={handleLogout}
          tooltip={t("logout")}
          className="h-11 justify-start rounded-2xl px-3 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <div className="flex items-center gap-3 cursor-pointer">
            <LogOut className="size-4" />
            <span>{t("logout")}</span>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}

function Topbar() {
  const t = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    setUser(getUserData());
  }, [pathname]);

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  const handleLogout = () => {
    clearUserData();
    toast.success("Logged out successfully!");
    router.push("/auth/sign-in");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white">
      <div className="flex py-3.5 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger className="-ml-1 text-slate-700 hover:bg-slate-100" />
          <div className="min-w-0">
            <h1 className="truncate text-[1.05rem] font-semibold tracking-tight text-slate-950 sm:text-[1.15rem]">{t("dashboard")}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center rounded-2xl border border-slate-200 bg-[#f3f4f6] p-1 shadow-sm">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLocaleChange("en");
              }}
              className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${locale === "en" ? "bg-white text-[#1A56DB] shadow-[0_1px_3px_rgba(15,23,42,0.12)]" : "text-slate-500 hover:text-slate-700"}`}
            >
              EN
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLocaleChange("id");
              }}
              className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${locale === "id" ? "bg-white text-[#1A56DB] shadow-[0_1px_3px_rgba(15,23,42,0.12)]" : "text-slate-500 hover:text-slate-700"}`}
            >
              ID
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 text-left outline-none">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#1A56DB] text-white shadow-sm sm:size-11 overflow-hidden">
                  {user?.photoUrl ? (
                    <img src={user.photoUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="size-5" />
                  )}
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="text-sm font-medium text-slate-950 sm:text-base">{user?.name || t("restaurantOwner")}</div>
                  <div className="text-xs text-slate-500 sm:text-sm">{user?.role || t("owner")}</div>
                </div>
                <ChevronDown className="size-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={12} className="w-68 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
              <DropdownMenuLabel className="px-2 py-1.5">
                <div className="text-base font-medium text-slate-950">{user?.name || t("restaurantOwner")}</div>
                <div className="text-sm font-normal text-slate-400">{user?.email || "owner@smartpos.com"}</div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="my-1 bg-slate-200" />

              <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2 text-base text-slate-800 focus:bg-slate-50 focus:text-slate-950">
                <Link href="/profile" className="flex items-center gap-3">
                  <User className="size-4 text-slate-500" />
                  <span>{t("profile")}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-slate-200" />

              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer rounded-lg px-3 py-2 text-base text-red-500 focus:bg-red-50 focus:text-red-600"
              >
                <div className="flex w-full items-center gap-3 text-left">
                  <LogOut className="size-4 text-slate-500" />
                  <span>{t("logout")}</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

const MainWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-[#F7F7F7] text-slate-900">
        <AppSidebar />

        <SidebarInset className="flex min-h-screen flex-col bg-[#F7F7F7]">
          <Topbar />
          <main className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainWrapper;
