'use client';

import React from 'react';
import { SharedLayout } from '@/features/shared/components/layout/SharedLayout';
import { SettingsPage } from '@/features/user-dashboard/components/SettingsPage';

export default function SettingsPageWrapper() {
  return (
    <SharedLayout>
      <SettingsPage />
    </SharedLayout>
  );
}
