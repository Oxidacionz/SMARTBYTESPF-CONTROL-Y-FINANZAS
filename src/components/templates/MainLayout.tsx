
import React from 'react';

interface MainLayoutProps {
  header: React.ReactNode;
  summary: React.ReactNode;
  navigation: React.ReactNode;
  mainContent: React.ReactNode;
  sidebar: React.ReactNode;
  floatingAction?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  header, 
  summary, 
  navigation, 
  mainContent, 
  sidebar,
  floatingAction
}) => {
  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-[#f3f4f6] dark:bg-gray-900 transition-colors">
      {header}
      
      {/* Reduced padding top for slimmer header (approx 70px + space) */}
      <main className="max-w-6xl mx-auto p-4 space-y-6 pt-[130px] md:pt-[90px]">
        {summary}
        {navigation}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {mainContent}
          </div>
          <div className="space-y-6">
            {sidebar}
          </div>
        </div>
      </main>

      {floatingAction}
    </div>
  );
};
