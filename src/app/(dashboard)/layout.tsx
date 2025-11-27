'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService, getStoredAdmin } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import { LogOut, Menu, X, Bell } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const admin = getStoredAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    authService.logout();
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <AuthGuard>
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Mobile Close Button */}
        <button
          onClick={closeSidebar}
          className="absolute top-4 right-4 lg:hidden text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Logo */}
        <div className="p-5 border-b border-gray-700 bg-gradient-to-r from-indigo-600 to-purple-600">
          <h1 className="text-xl font-bold text-white">Butical Admin</h1>
          <p className="text-xs text-indigo-100 mt-1">Management Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="mt-4 overflow-y-auto h-[calc(100vh-80px)]">
          <ul className="space-y-2 px-2">
            <li>
              <Link
                href="/dashboard"
                onClick={closeSidebar}
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 rounded"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/dating-users"
                onClick={closeSidebar}
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 rounded"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Dating Users
              </Link>
            </li>
            <li>
              <Link
                href="/escorts"
                onClick={closeSidebar}
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 rounded"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Escorts
              </Link>
            </li>
            <li>
              <Link
                href="/hookup-users"
                onClick={closeSidebar}
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 rounded"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Hookup Users
              </Link>
            </li>
            <li>
              <Link
                href="/referral-program"
                onClick={closeSidebar}
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 rounded"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Referral Program
              </Link>
            </li>
            <li className="pt-4 pb-2">
              <div className="px-4 text-xs text-gray-400 uppercase font-semibold">Payments</div>
            </li>
            <li>
              <Link
                href="/dating-payments"
                onClick={closeSidebar}
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 rounded"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                Dating Payments
              </Link>
            </li>
            <li>
              <Link
                href="/hookup-payments"
                onClick={closeSidebar}
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 rounded"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                Hookup Payments
              </Link>
            </li>
            <li>
              <Link
                href="/escort-payments"
                onClick={closeSidebar}
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 rounded"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                Escort Payments
              </Link>
            </li>
            <li className="mt-4 pb-4">
              <Link
                href="/account"
                onClick={closeSidebar}
                className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 rounded"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Account
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-md h-16 flex items-center px-4 lg:px-6 sticky top-0 z-30 border-b border-gray-200">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors mr-4"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1">
            {/* Search or breadcrumbs can go here */}
          </div>

          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <button className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile */}
            <div className="flex items-center space-x-2 lg:space-x-4 ml-2">
              <div className="text-sm text-gray-700 hidden sm:block">
                <span className="font-medium">
                  {admin ? `${admin.firstName} ${admin.lastName}` : 'Admin'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-all shadow-sm"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="ml-2 hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 bg-gray-100 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
    </AuthGuard>
  );
}
