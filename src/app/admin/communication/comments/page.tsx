import { AdminLayout, CommentsManagement } from "@/components/admin";

export default function AdminCommentsPage() {
  return (
    <AdminLayout>
      <CommentsManagement />
    </AdminLayout>
  );
}

export const metadata = {
  title: "Comments Management - Admin Panel",
  description: "Manage and moderate user comments",
};
