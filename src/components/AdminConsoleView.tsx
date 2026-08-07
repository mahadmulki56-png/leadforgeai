import React from 'react';
import { UserProfile } from '../types';
import { AdminDataQualityView } from './AdminDataQualityView';

interface AdminConsoleViewProps {
  user: UserProfile;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({ user }) => {
  return <AdminDataQualityView user={user} />;
};

export { AdminDataQualityView };


