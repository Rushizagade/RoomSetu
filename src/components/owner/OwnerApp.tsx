import React, { useState } from 'react';
import { OwnerDashboard } from './OwnerDashboard.tsx';
import { AddPropertyWizard } from './AddPropertyWizard.tsx';

export const OwnerApp: React.FC = () => {
  const [isAddWizardOpen, setIsAddWizardOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <OwnerDashboard onOpenAddWizard={() => setIsAddWizardOpen(true)} />

      <AddPropertyWizard
        isOpen={isAddWizardOpen}
        onClose={() => setIsAddWizardOpen(false)}
        onSuccess={() => {
          // dashboard will refresh on mount or reload
        }}
      />
    </div>
  );
};
