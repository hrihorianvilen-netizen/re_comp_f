import { AdminLayout, AdsManagement } from "@/components/admin";

export default function AdminAdsPage() {
  return (
    <AdminLayout>
      <AdsManagement />
    </AdminLayout>
  );
}

export const metadata = {
  title: "Ads Management - Admin Panel",
  description: "Manage advertisements and promotional content",
};
