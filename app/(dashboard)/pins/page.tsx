"use client";

import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { PinsTable } from '@/features/property-management/components/PinsTable';
import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function PinsPage() {
  return (
    <SharedLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Property Pins</h1>
                <p className="mt-2 text-gray-600">
                  Manage your property pins and track their status
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add New Pin
              </Link>
            </div>
          </div>

          {/* Pins Table */}
          <div className="bg-white shadow rounded-lg">
            <PinsTable />
          </div>
        </div>
      </div>
    </SharedLayout>
  );
}
