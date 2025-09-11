import { UserManagement } from "@/components/admin";

export default function AdminUsersPage() {
  return <UserManagement />;
}

export const metadata = {
  title: "User Management - Admin Panel",
  description: "Manage users, permissions, and account status",
};
