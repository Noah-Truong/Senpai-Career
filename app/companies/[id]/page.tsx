import { redirect } from "next/navigation";

// Redirect /companies/[id] to /user/[id] since company profiles are handled there
export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/user/${id}`);
}
