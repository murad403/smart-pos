"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import AddAdminModal from "@/components/modal/AddAdminModal";
import UserResetPasswordModal from "@/components/modal/UserResetPasswordModal";
import { useTranslations } from "next-intl";

type UserData = {
    id: string;
    name: string;
    email: string;
    role: "STAFF" | "ADMIN";
    lastActive: string;
    initial: string;
    color: string;
};

const UserManagementPage = ({ params }: { params?: Promise<{ locale: string }> }) => {
    if (params) React.use(params);
    const t = useTranslations("Profile");
    const [isAddAdminOpen, setIsAddAdminOpen] = React.useState(false);
    const [isResetPassOpen, setIsResetPassOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<UserData | null>(null);

    const mockUsers: UserData[] = [
        { id: "1", name: "Budi Santoso", email: "budi@smartpos.com", role: "STAFF", lastActive: "2024-04-24 10:30", initial: "B", color: "bg-blue-50 text-blue-600" },
        { id: "2", name: "Siti Aminah", email: "siti@smartpos.com", role: "STAFF", lastActive: "2024-04-24 09:15", initial: "S", color: "bg-blue-50 text-blue-600" },
        { id: "3", name: "Admin John", email: "john@smartpos.com", role: "STAFF", lastActive: "2024-04-24 11:00", initial: "A", color: "bg-blue-50 text-blue-600" },
        { id: "4", name: "Rina Wijaya", email: "rina@smartpos.com", role: "ADMIN", lastActive: "2024-04-23 18:20", initial: "R", color: "bg-blue-50 text-blue-600" },
    ];

    const handleResetPassword = (user: UserData) => {
        setSelectedUser(user);
        setIsResetPassOpen(true);
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-[32px] font-bold tracking-tight text-slate-900">{t("userManagementTitle") || "USER & ACCESS MANAGEMENT"}</h1>
                    <p className="mt-1 text-slate-500">{t("subtitle")}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsAddAdminOpen(true)}
                        className="h-11 rounded-xl bg-[#1A56DB] px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
                    >
                        {t("addAdminStaff")}
                    </Button>
                </div>
            </div>

            <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-blue-500" />
                        <h2 className="text-[12px] font-bold uppercase tracking-wider text-blue-600">{t("userManagementTitle") || "USER & ACCESS MANAGEMENT"}</h2>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5">
                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t("managementConsole")}</span>
                    </div>
                </div>

                <p className="mb-6 text-[14px] text-slate-500">{t("resetDescription")}</p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {mockUsers.map((user) => (
                        <div key={user.id} className="group rounded-2xl border border-slate-100 p-5 transition-all hover:border-blue-200 hover:shadow-md">
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`flex size-11 items-center justify-center rounded-xl font-bold ${user.color}`}>
                                        {user.initial}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[15px] font-bold text-slate-900">{user.name}</span>
                                            <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold tracking-wider ${user.role === "ADMIN" ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"
                                                }`}>
                                                {user.role}
                                            </span>
                                        </div>
                                        <p className="text-[12px] text-slate-500">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4 space-y-1 border-t border-slate-50 pt-4">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("lastActive")}</p>
                                <p className="text-[12px] font-medium text-slate-700">{user.lastActive}</p>
                            </div>

                            <button
                                onClick={() => handleResetPassword(user)}
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white py-2.5 text-[11px] font-bold uppercase tracking-widest text-blue-600 transition-all hover:bg-blue-50"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3m-3-3l-4.5 4.5" />
                                </svg>
                                {t("resetPasswordButton") || "RESET PASSWORD"}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Global Save Changes Button */}
            <Button
                type="button"
                className="h-11 cursor-pointer w-full rounded-xl bg-[#3B82F6] text-sm font-semibold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-600"
            >
                {t("saveChanges")}
            </Button>

            {/* Modals */}
            <AddAdminModal open={isAddAdminOpen} onClose={() => setIsAddAdminOpen(false)} />
            <UserResetPasswordModal
                open={isResetPassOpen}
                onClose={() => setIsResetPassOpen(false)}
                user={selectedUser}
            />
        </div>
    );
};

export default UserManagementPage;