import { AdminLayout, ReviewsManagement } from "@/components/admin";

export default function AdminReviewsPage() {
  return (
    <AdminLayout>
      <ReviewsManagement />
    </AdminLayout>
  );
}

export const metadata = {
  title: "Reviews Management - Admin Panel",
  description: "Manage and moderate user reviews",
};
