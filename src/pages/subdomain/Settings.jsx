import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTenantAuth } from "../../hooks/useTenantAuth";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  
  const { organization } = useSelector((state) => state.tenantAuth);
  const { isHROrManager } = useTenantAuth();
  
  // If user is not HR or Manager, show access denied message
  if (!isHROrManager()) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">
              You don't have permission to access the settings page. Only HR personnel and managers can configure system settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      
      <div className="w-full">
        <div className="flex space-x-1 border-b">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "notifications"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === "system"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            System
          </button>
        </div>
        
        {activeTab === "notifications" && (
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Notification Settings</h2>
                <p className="text-gray-600 mt-1">
                  Configure email and in-app notification preferences
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <span>Email Notifications</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Enabled
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <span>In-App Notifications</span>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Enabled
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "system" && (
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">System Settings</h2>
                <p className="text-gray-600 mt-1">
                  Configure system-wide settings and preferences
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <span>Time Zone</span>
                    <span className="font-medium">Asia/Kolkata (GMT+5:30)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <span>Date Format</span>
                    <span className="font-medium">DD/MM/YYYY</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <span>Time Format</span>
                    <span className="font-medium">24 Hour</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;