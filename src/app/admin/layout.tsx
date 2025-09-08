import type { Metadata } from "next";
import AdminLayoutComponent from '@/components/admin/AdminLayout';

export const metadata: Metadata = {
  title: "Admin Panel - ReviewHub",
  description: "Admin dashboard for managing merchants, reviews, and content.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminLayoutComponent>
      {children}
    </AdminLayoutComponent>
  );
}