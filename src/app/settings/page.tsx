"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout";
import CloudflareBackupSettings from "@/components/settings/CloudflareBackupSettings";
import { Typography, Divider } from "antd";

const { Title, Paragraph } = Typography;

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div style={{ padding: "24px" }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={2}>System Settings</Title>
          <Paragraph>
            Manage your application configurations, database backups, and other system-wide settings.
          </Paragraph>
        </div>
        
        <Divider />
        
        <CloudflareBackupSettings />
      </div>
    </DashboardLayout>
  );
}
