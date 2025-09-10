import { AdminLayout, AdminDashboard } from '@/components/admin';

export default function AdminPage() {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  );
}

export const metadata = {
  title: 'Admin Dashboard - Reviews Platform',
  description: 'Administrative dashboard for managing the reviews platform',
};