import React, { useState } from 'react';
import { OwnerDashboard } from './OwnerDashboard.tsx';
import { AddPropertyWizard } from './AddPropertyWizard.tsx';

export const OwnerApp: React.FC = () => {
  const [isAddWizardOpen, setIsAddWizardOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <OwnerDashboard
        key={refreshKey}
        onOpenAddWizard={() => setIsAddWizardOpen(true)}
      />

      <AddPropertyWizard
        isOpen={isAddWizardOpen}
        onClose={() => setIsAddWizardOpen(false)}
        onSuccess={() => {
          setIsAddWizardOpen(false);
          setRefreshKey((prev) => prev + 1);
        }}
      />
    </div>
  );
};
