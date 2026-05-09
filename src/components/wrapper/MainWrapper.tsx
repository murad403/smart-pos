"use client"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, CreditCard, Grid2x2, LayoutDashboard, LogOut, Package, ReceiptText, User } from "lucide-react"
import brandLogo from "@/assets/logo/logo.png"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"



const navigationItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Sales Reports", icon: ReceiptText, href: "/reports" },
  { label: "Payment Verification", icon: CreditCard, href: "/payment-verification" },
  { label: "Inventory Report", icon: Package, href: "/inventory-report" },
  { label: "Menu", icon: Grid2x2, href: "/menu" },
  { label: "Profile", icon: User, href: "/profile" },
]

function Topbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white">
      <div className="flex py-3.5 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger className="-ml-1 text-slate-700 hover:bg-slate-100" />
          <div className="min-w-0">
            <h1 className="truncate text-[1.05rem] font-semibold tracking-tight text-slate-950 sm:text-[1.15rem]">
              Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center rounded-2xl border border-slate-200 bg-[#f3f4f6] p-1 shadow-sm">
            <button className="rounded-xl bg-white px-3 py-1.5 text-sm font-medium text-[#1A56DB] shadow-[0_1px_3px_rgba(15,23,42,0.12)]">
              EN
            </button>
            <button className="rounded-xl px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700">
              ID
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 text-left outline-none">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#1A56DB] text-white shadow-sm sm:size-11">
                  <User className="size-5" />
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="text-sm font-medium text-slate-950 sm:text-base">
                    Restaurant Owner
                  </div>
                  <div className="text-xs text-slate-500 sm:text-sm">Owner</div>
                </div>
                <ChevronDown className="size-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={12} className="w-68 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
              <DropdownMenuLabel className="px-2 py-1.5">
                <div className="text-base font-medium text-slate-950">
                  Restaurant Owner
                </div>
                <div className="text-sm font-normal text-slate-400">
                  owner@smartpos.com
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="my-1 bg-slate-200" />

              <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2 text-base text-slate-800 focus:bg-slate-50 focus:text-slate-950">
                <Link href="/profile" className="flex items-center gap-3">
                  <User className="size-4 text-slate-500" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-slate-200" />

              <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2 text-base text-red-500 focus:bg-red-50 focus:text-red-600">
                <button className="flex w-full items-center gap-3 text-left">
                  <LogOut className="size-4 text-slate-500" />
                  <span>Logout</span>
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-1">
      <div className="flex size-11 items-center justify-center rounded-2xl bg-[#F7F7F7] shadow-sm ring-1 ring-slate-200 group-data-[collapsible=icon]:size-9">
        <Image src={brandLogo} alt="SmartPOS" className="h-7 w-7 object-contain group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" priority />
      </div>
      <div className="min-w-0 group-data-[collapsible=icon]:hidden">
        <p className="text-lg font-semibold tracking-tight text-slate-950">SmartPOS</p>
        <p className="text-xs text-slate-500">Admin panel</p>
      </div>
    </div>
  )
}

function AppSidebar() {
  const pathName = usePathname();
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
                    <a href={item.href} className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
                      <item.icon className="size-4" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200/70 p-3">
        <SidebarMenuButton
          asChild
          tooltip="Logout"
          className="h-11 justify-start rounded-2xl px-3 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <a href="#" className="flex items-center gap-3">
            <LogOut className="size-4" />
            <span>Logout</span>
          </a>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}

import useLocalLanguage, { LanguageProvider } from "@/hooks/useLocalLanguage";

function Topbar() {
  const { locale, setLocale } = useLocalLanguage();
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white">
      <div className="flex py-3.5 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger className="-ml-1 text-slate-700 hover:bg-slate-100" />
          <div className="min-w-0">
            <h1 className="truncate text-[1.05rem] font-semibold tracking-tight text-slate-950 sm:text-[1.15rem]">Dashboard</h1>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center rounded-2xl border border-slate-200 bg-[#f3f4f6] p-1 shadow-sm">
            <button
              onClick={() => setLocale("EN")}
              className={`rounded-xl px-3 py-1.5 text-sm font-medium ${locale === "EN" ? "bg-white text-[#1A56DB] shadow-[0_1px_3px_rgba(15,23,42,0.12)]" : "text-slate-500"}`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale("ID")}
              className={`rounded-xl px-3 py-1.5 text-sm font-medium ${locale === "ID" ? "bg-white text-[#1A56DB] shadow-[0_1px_3px_rgba(15,23,42,0.12)]" : "text-slate-500"}`}
            >
              ID
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 text-left outline-none">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#1A56DB] text-white shadow-sm sm:size-11">
                  <User className="size-5" />
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="text-sm font-medium text-slate-950 sm:text-base">Restaurant Owner</div>
                  <div className="text-xs text-slate-500 sm:text-sm">Owner</div>
                </div>
                <ChevronDown className="size-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" sideOffset={12} className="w-68 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
              <DropdownMenuLabel className="px-2 py-1.5">
                <div className="text-base font-medium text-slate-950">Restaurant Owner</div>
                <div className="text-sm font-normal text-slate-400">owner@smartpos.com</div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="my-1 bg-slate-200" />

              <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2 text-base text-slate-800 focus:bg-slate-50 focus:text-slate-950">
                <Link href="/profile" className="flex items-center gap-3">
                  <User className="size-4 text-slate-500" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-slate-200" />

              <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2 text-base text-red-500 focus:bg-red-50 focus:text-red-600">
                <button className="flex w-full items-center gap-3 text-left">
                  <LogOut className="size-4 text-slate-500" />
                  <span>Logout</span>
                </button>
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
    <LanguageProvider>
      <SidebarProvider defaultOpen>
        <div className="flex min-h-screen w-full bg-[#F7F7F7] text-slate-900">
          <AppSidebar />

          <SidebarInset className="flex min-h-screen flex-col bg-[#F7F7F7]">
            <Topbar />
            <main className="flex flex-1 flex-col p-4 md:p-6 lg:p-8">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </LanguageProvider>
  );
};

export default MainWrapper;
