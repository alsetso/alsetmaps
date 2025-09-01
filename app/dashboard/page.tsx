'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card';
import { Button } from '@/features/shared/components/ui/button';
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  BookmarkIcon, 
  UserIcon,
  CreditCardIcon,
  ChartBarIcon,
  BellIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const quickStats = [
    { title: 'Total Credits', value: '15', icon: CreditCardIcon, color: 'text-blue-600' },
    { title: 'Properties Saved', value: '8', icon: BookmarkIcon, color: 'text-green-600' },
    { title: 'Searches This Month', value: '23', icon: MagnifyingGlassIcon, color: 'text-purple-600' },
    { title: 'Active Intents', value: '3', icon: UserIcon, color: 'text-orange-600' }
  ];

  const recentActivity = [
    { action: 'Property Search', details: '123 Main St, San Francisco', time: '2 hours ago', type: 'search' },
    { action: 'Property Saved', details: '456 Oak Ave, Oakland', time: '1 day ago', type: 'save' },
    { action: 'Buyer Intent Updated', details: 'Updated preferences', time: '2 days ago', type: 'intent' },
    { action: 'Credits Used', details: 'Property search', time: '3 days ago', type: 'credits' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'search': return <MagnifyingGlassIcon className="h-4 w-4 text-blue-500" />;
      case 'save': return <BookmarkIcon className="h-4 w-4 text-green-500" />;
      case 'intent': return <UserIcon className="h-4 w-4 text-purple-500" />;
      case 'credits': return <CreditCardIcon className="h-4 w-4 text-orange-500" />;
      default: return <BellIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <SharedLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your account.</p>
              </div>
              <div className="flex space-x-3">
                <Link href="/settings">
                  <Button variant="outline" size="sm">
                    <CogIcon className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                <Button size="sm">
                  <BellIcon className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: HomeIcon },
                { id: 'properties', label: 'My Properties', icon: BookmarkIcon },
                { id: 'intents', label: 'Buyer Intents', icon: UserIcon },
                { id: 'credits', label: 'Credits & Billing', icon: CreditCardIcon },
                { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickStats.map((stat, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                        <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BellIcon className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.details}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <p className="text-xs text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                      Search Properties
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <UserIcon className="h-4 w-4 mr-2" />
                      Create Buyer Intent
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <BookmarkIcon className="h-4 w-4 mr-2" />
                      View Saved Properties
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Subscription</span>
                      <span className="text-sm font-medium text-green-600">Free Plan</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Credits Remaining</span>
                      <span className="text-sm font-medium text-blue-600">15</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Login</span>
                      <span className="text-sm text-gray-900">Today</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Other Tab Content Placeholders */}
          {activeTab === 'properties' && (
            <div className="text-center py-12">
              <BookmarkIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">My Properties</h3>
              <p className="text-gray-500">View and manage your saved properties.</p>
            </div>
          )}

          {activeTab === 'intents' && (
            <div className="text-center py-12">
              <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Buyer Intents</h3>
              <p className="text-gray-500">Manage your property search criteria and preferences.</p>
            </div>
          )}

          {activeTab === 'credits' && (
            <div className="text-center py-12">
              <CreditCardIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Credits & Billing</h3>
              <p className="text-gray-500">Manage your credits and subscription.</p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-500">View your search and usage statistics.</p>
            </div>
          )}
        </div>
      </div>
    </SharedLayout>
  );
}
