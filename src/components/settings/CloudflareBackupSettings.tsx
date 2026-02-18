"use client";

import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, Typography, Space, message, Divider, Alert } from "antd";
import { CloudServerOutlined, SaveOutlined, PlayCircleOutlined } from "@ant-design/icons";
import api from "@/lib/api";

const { Title, Text, Paragraph } = Typography;

const CloudflareBackupSettings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get("/settings/cloudflare-config");
      form.setFieldsValue(response.data);
    } catch (error: any) {
      console.error("Failed to fetch config:", error);
      message.error("Failed to load Cloudflare configuration");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      await api.post("/settings/cloudflare-config", values);
      message.success("Settings saved successfully");
    } catch (error: any) {
      console.error("Failed to save config:", error);
      message.error(error.response?.data?.message || "Failed to save configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleTestBackup = async () => {
    try {
      setTestLoading(true);
      await api.post("/test-backup");
      message.success("Manual backup triggered! Check your Cloudflare R2 bucket in a few moments.");
    } catch (error: any) {
      console.error("Manual backup failed:", error);
      message.error(error.response?.data?.message || "Failed to trigger manual backup");
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Card
        title={
          <Space>
            <CloudServerOutlined />
            <span>Cloudflare R2 Backup Settings</span>
          </Space>
        }
        loading={loading}
      >
        <Paragraph>
          Configure your Cloudflare R2 credentials to enable automated database backups. 
          Database dumps will be uploaded to your specified bucket according to the schedule.
        </Paragraph>

        <Alert
          message="Security Note"
          description="Your credentials are stored securely in the database. Ensure your R2 bucket permissions are correctly configured."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ backupSchedule: "0 0 * * *" }}
        >
          <Form.Item
            label="R2 Account ID"
            name="r2AccountId"
            rules={[{ required: true, message: "Please input your R2 Account ID" }]}
            tooltip="Find this in your Cloudflare R2 dashboard"
          >
            <Input placeholder="e.g. 1234567890abcdef1234567890abcdef" />
          </Form.Item>

          <Form.Item
            label="R2 Access Key ID"
            name="r2AccessKeyId"
            rules={[{ required: true, message: "Please input your R2 Access Key ID" }]}
          >
            <Input.Password placeholder="Enter Access Key ID" />
          </Form.Item>

          <Form.Item
            label="R2 Secret Access Key"
            name="r2SecretAccessKey"
            rules={[{ required: true, message: "Please input your R2 Secret Access Key" }]}
          >
            <Input.Password placeholder="Enter Secret Access Key" />
          </Form.Item>

          <Form.Item
            label="R2 Bucket Name"
            name="r2BucketName"
            rules={[{ required: true, message: "Please input your R2 Bucket Name" }]}
          >
            <Input placeholder="e.g. pharma-erp-backups" />
          </Form.Item>

          <Form.Item
            label="Backup Schedule (Cron Expression)"
            name="backupSchedule"
            rules={[{ required: true, message: "Please input a cron expression" }]}
            tooltip="Default is daily at midnight: 0 0 * * *"
          >
            <Input placeholder="0 0 * * *" />
          </Form.Item>

          <Form.Item>
            <Space split={<Divider type="vertical" />}>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />} 
                loading={loading}
              >
                Save Settings
              </Button>
              <Button 
                icon={<PlayCircleOutlined />} 
                onClick={handleTestBackup}
                loading={testLoading}
                danger
              >
                Test Backup Now
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CloudflareBackupSettings;
