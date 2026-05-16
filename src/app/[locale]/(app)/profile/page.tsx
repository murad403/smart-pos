import { redirect } from "next/navigation";

export default async function ProfilePage({ params }: { params?: Promise<any> }) {
  if (params) await params;
  redirect("/profile/personal-information");
}
