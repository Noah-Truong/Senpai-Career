import { redirect } from "next/navigation";

// Redirect /obog/list to /ob-visit since pages are combined
export default function OBOGListPage() {
  redirect("/ob-visit");
}

