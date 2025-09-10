import { Suspense } from 'react';
import { ResetPasswordPage } from '@/components/auth';

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#198639]"></div>
      </div>
    }>
      <ResetPasswordPage />
    </Suspense>
  );
}

export const metadata = {
  title: 'Reset Password - Reviews Platform',
  description: 'Reset your account password',
};