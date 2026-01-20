"use client";

import React, { useMemo, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Statistic,
  Progress,
  Tag,
  Space,
  Button,
  Skeleton,
  Alert,
} from "antd";
import {
  ExperimentOutlined,
  DatabaseOutlined,
  AppstoreOutlined,
  ArrowRightOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRawMaterials, usePrefetchRawMaterials } from "@/hooks/useRawMaterials";

const { Title, Text, Paragraph } = Typography;

// Module cards configuration
const moduleCards = [
  {
    title: "Material Master",
    description: "Manage raw material definitions",
    icon: <ExperimentOutlined style={{ fontSize: 32, color: "#52c41a" }} />,
    href: "/raw-materials/materials",
    color: "#f6ffed",
    borderColor: "#b7eb8f",
  },
  {
    title: "Inventory",
    description: "Track inventory levels and configurations",
    icon: <DatabaseOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
    href: "/raw-materials/inventory",
    color: "#e6f4ff",
    borderColor: "#91caff",
  },
  {
    title: "Batch Tracking",
    description: "Manage batches with QC status & expiry",
    icon: <AppstoreOutlined style={{ fontSize: 32, color: "#722ed1" }} />,
    href: "/raw-materials/batches",
    color: "#f9f0ff",
    borderColor: "#d3adf7",
  },
];

export default function RawMaterialsDashboardPage() {
  // API Hooks
  const { data: rawMaterials = [], isLoading } = useRawMaterials();
  const prefetch = usePrefetchRawMaterials();

  // Prefetch all data on mount
  useEffect(() => {
    prefetch.prefetchAll();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalMaterials = rawMaterials.length;
    const apiCount = rawMaterials.filter((m) => m.type === "API").length;
    const excipientCount = rawMaterials.filter((m) => m.type === "Excipient").length;
    const packagingCount = rawMaterials.filter((m) => m.type === "Packaging").length;

    return {
      totalMaterials,
      apiCount,
      excipientCount,
      packagingCount,
    };
  }, [rawMaterials]);

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 2 }} />
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {[1, 2, 3].map((i) => (
            <Col key={i} xs={24} sm={12} lg={8}>
              <Card><Skeleton active /></Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Raw Materials Inventory
        </Title>
        <Text type="secondary">
          Manage raw materials, inventory configurations, and batch tracking
        </Text>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              border: "none",
              borderRadius: 12,
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Total Materials</span>}
              value={stats.totalMaterials}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
              border: "none",
              borderRadius: 12,
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>API Materials</span>}
              value={stats.apiCount}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                Active Pharmaceutical Ingredients
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
              border: "none",
              borderRadius: 12,
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Excipients</span>}
              value={stats.excipientCount}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                Inactive Ingredients
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)",
              border: "none",
              borderRadius: 12,
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Packaging</span>}
              value={stats.packagingCount}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                Packaging Materials
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Module Cards */}
      <Title level={5} style={{ marginBottom: 16 }}>
        Inventory Modules
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {moduleCards.map((module) => (
          <Col key={module.title} xs={24} sm={12} lg={8}>
            <Link href={module.href} style={{ display: "block" }}>
              <Card
                hoverable
                style={{
                  background: module.color,
                  border: `1px solid ${module.borderColor}`,
                  borderRadius: 12,
                  height: "100%",
                }}
                styles={{ body: { padding: 20 } }}
              >
                <div style={{ marginBottom: 12 }}>{module.icon}</div>
                <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                  {module.title}
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {module.description}
                </Text>
                <div style={{ marginTop: 12 }}>
                  <Button type="link" style={{ padding: 0, fontSize: 12 }}>
                    Open Module <ArrowRightOutlined />
                  </Button>
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      {/* Alerts Section */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: "#faad14" }} />
                <span>Inventory Alerts</span>
              </Space>
            }
            size="small"
            style={{ borderRadius: 12 }}
          >
            {rawMaterials.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <CheckCircleOutlined style={{ fontSize: 32, color: "#52c41a" }} />
                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                  No alerts at this time. Get started by adding raw materials.
                </Paragraph>
                <Link href="/raw-materials/materials">
                  <Button type="primary" size="small">
                    Add Materials
                  </Button>
                </Link>
              </div>
            ) : (
              <Alert
                message="System Information"
                description="Raw materials inventory is being tracked. Set reorder levels to enable low stock alerts."
                type="info"
                showIcon
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: "#1890ff" }} />
                <span>Quick Actions</span>
              </Space>
            }
            size="small"
            style={{ borderRadius: 12 }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Link href="/raw-materials/materials">
                <Button block type="default" icon={<ExperimentOutlined />}>
                  Add New Raw Material
                </Button>
              </Link>
              <Link href="/raw-materials/batches">
                <Button block type="default" icon={<AppstoreOutlined />}>
                  Add New Batch
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Material Type Distribution */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Material Distribution by Type" size="small" style={{ borderRadius: 12 }}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Progress
                    type="circle"
                    percent={stats.totalMaterials > 0 ? Math.round((stats.apiCount / stats.totalMaterials) * 100) : 0}
                    strokeColor="#1890ff"
                    size={100}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text strong>API</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {stats.apiCount} materials
                    </Text>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Progress
                    type="circle"
                    percent={stats.totalMaterials > 0 ? Math.round((stats.excipientCount / stats.totalMaterials) * 100) : 0}
                    strokeColor="#722ed1"
                    size={100}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Excipient</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {stats.excipientCount} materials
                    </Text>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Progress
                    type="circle"
                    percent={stats.totalMaterials > 0 ? Math.round((stats.packagingCount / stats.totalMaterials) * 100) : 0}
                    strokeColor="#fa8c16"
                    size={100}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Packaging</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {stats.packagingCount} materials
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
