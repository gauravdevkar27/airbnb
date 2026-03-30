// app/admin/page.tsx
// This page is already protected at the middleware level.
// The server-side check below is a second layer of defence.

import { redirect } from 'next/navigation';
import getCurrentUser from '@/app/actions/getCurrentUser';

export default async function AdminPage() {
  const user = await getCurrentUser();

  // Double-check server side — middleware is the first gate,
  // this is the second in case someone bypasses it
  if (!user || (user as any).role !== 'admin') {
    redirect('/?error=forbidden');
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Admin dashboard</h1>
      <p className="text-gray-500 text-sm">Welcome, {user.first_name}.</p>

      {/* Build out your admin panels here */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
          <p className="text-sm font-medium text-gray-700">Users</p>
          <p className="text-xs text-gray-400 mt-1">Manage, ban, activate</p>
        </div>
        <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
          <p className="text-sm font-medium text-gray-700">Listings</p>
          <p className="text-xs text-gray-400 mt-1">Review, remove listings</p>
        </div>
        <div className="border border-gray-100 rounded-xl p-6 bg-white shadow-sm">
          <p className="text-sm font-medium text-gray-700">Disputes</p>
          <p className="text-xs text-gray-400 mt-1">View and resolve disputes</p>
        </div>
      </div>
    </div>
  );
}