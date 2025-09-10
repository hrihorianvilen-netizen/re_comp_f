import { AdminLayout, UserManagement } from "@/components/admin";

export default function AdminUsersPage() {
  return (
    <AdminLayout>
      <UserManagement />
    </AdminLayout>
  );
}

export const metadata = {
  title: "User Management - Admin Panel",
  description: "Manage users, permissions, and account status",
};
