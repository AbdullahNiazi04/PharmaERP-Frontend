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
  MedicineBoxOutlined,
  AppstoreOutlined,
  ArrowRightOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  GoldOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useFinishedGoods, useFinishedGoodsBatches, usePrefetchFinishedGoods } from "@/hooks/useFinishedGoods";

const { Title, Text, Paragraph } = Typography;

// Module cards configuration
const moduleCards = [
  {
    title: "Product Master",
    description: "Manage finished product definitions",
    icon: <MedicineBoxOutlined style={{ fontSize: 32, color: "#722ed1" }} />,
    href: "/finished-goods/products",
    color: "#f9f0ff",
    borderColor: "#d3adf7",
  },
  {
    title: "Batch Tracking",
    description: "Manage production batches with QC status & expiry",
    icon: <AppstoreOutlined style={{ fontSize: 32, color: "#eb2f96" }} />,
    href: "/finished-goods/batches",
    color: "#fff0f6",
    borderColor: "#ffadd2",
  },
];

// Dosage form colors
const dosageFormColors: Record<string, string> = {
  Tablet: "#1890ff",
  Capsule: "#52c41a",
  Syrup: "#faad14",
  Injection: "#f5222d",
  Cream: "#eb2f96",
  Other: "#722ed1",
};

export default function FinishedGoodsDashboardPage() {
  // API Hooks
  const { data: products = [], isLoading: productsLoading } = useFinishedGoods();
  const { data: batches = [], isLoading: batchesLoading } = useFinishedGoodsBatches();
  const prefetch = usePrefetchFinishedGoods();

  const isLoading = productsLoading || batchesLoading;

  // Prefetch all data on mount
  useEffect(() => {
    prefetch.prefetchAll();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.status === "Active").length;
    const totalBatches = batches.length;
    const releasedBatches = batches.filter((b) => b.qcStatus === "Released").length;
    const holdBatches = batches.filter((b) => b.qcStatus === "Hold").length;
    const rejectedBatches = batches.filter((b) => b.qcStatus === "Rejected").length;
    
    // Calculate total available quantity
    const totalQuantity = batches.reduce((sum, b) => sum + (b.quantityAvailable || 0), 0);
    
    // Dosage form distribution
    const dosageForms: Record<string, number> = {};
    products.forEach((p) => {
      const form = p.dosageForm || "Other";
      dosageForms[form] = (dosageForms[form] || 0) + 1;
    });

    return {
      totalProducts,
      activeProducts,
      totalBatches,
      releasedBatches,
      holdBatches,
      rejectedBatches,
      totalQuantity,
      dosageForms,
    };
  }, [products, batches]);

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 2 }} />
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <Col key={i} xs={24} sm={12} lg={6}>
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
          Finished Goods Inventory
        </Title>
        <Text type="secondary">
          Manage finished products and production batch tracking
        </Text>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
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
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Total Products</span>}
              value={stats.totalProducts}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
              prefix={<MedicineBoxOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                {stats.activeProducts} Active
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #eb2f96 0%, #f759ab 100%)",
              border: "none",
              borderRadius: 12,
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Total Batches</span>}
              value={stats.totalBatches}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
              prefix={<AppstoreOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                {stats.releasedBatches} Released
              </Tag>
            </div>
          </Card>
        </Col>
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
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Available Stock</span>}
              value={stats.totalQuantity}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
              prefix={<GoldOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                Total Units
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
              border: "none",
              borderRadius: 12,
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>QC Pending</span>}
              value={stats.holdBatches}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
              prefix={<ClockCircleOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color={stats.rejectedBatches > 0 ? "#ff4d4f" : "rgba(255,255,255,0.2)"} style={{ color: "#fff", border: "none" }}>
                {stats.rejectedBatches} Rejected
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
          <Col key={module.title} xs={24} sm={12} lg={12}>
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
            {products.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <CheckCircleOutlined style={{ fontSize: 32, color: "#52c41a" }} />
                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                  No alerts at this time. Get started by adding products.
                </Paragraph>
                <Link href="/finished-goods/products">
                  <Button type="primary" size="small">
                    Add Products
                  </Button>
                </Link>
              </div>
            ) : (
              <Alert
                message="System Information"
                description="Finished goods inventory is being tracked. Monitor batch QC status and expiry dates."
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
                <ClockCircleOutlined style={{ color: "#722ed1" }} />
                <span>Quick Actions</span>
              </Space>
            }
            size="small"
            style={{ borderRadius: 12 }}
          >
            <Space orientation="vertical" style={{ width: "100%" }}>
              <Link href="/finished-goods/products">
                <Button block type="default" icon={<MedicineBoxOutlined />}>
                  Add New Product
                </Button>
              </Link>
              <Link href="/finished-goods/batches">
                <Button block type="default" icon={<AppstoreOutlined />}>
                  Add New Batch
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Dosage Form Distribution */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Products by Dosage Form" size="small" style={{ borderRadius: 12 }}>
            <Row gutter={16}>
              {Object.entries(stats.dosageForms).length === 0 ? (
                <Col span={24}>
                  <div style={{ textAlign: "center", padding: 20 }}>
                    <ExperimentOutlined style={{ fontSize: 32, color: "#bfbfbf" }} />
                    <Paragraph type="secondary" style={{ marginTop: 8 }}>
                      No products yet. Add products to see distribution.
                    </Paragraph>
                  </div>
                </Col>
              ) : (
                Object.entries(stats.dosageForms).map(([form, count]) => (
                  <Col key={form} xs={12} sm={8} md={4}>
                    <div style={{ textAlign: "center" }}>
                      <Progress
                        type="circle"
                        percent={stats.totalProducts > 0 ? Math.round((count / stats.totalProducts) * 100) : 0}
                        strokeColor={dosageFormColors[form] || "#722ed1"}
                        size={80}
                      />
                      <div style={{ marginTop: 8 }}>
                        <Text strong>{form}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {count} product{count !== 1 ? "s" : ""}
                        </Text>
                      </div>
                    </div>
                  </Col>
                ))
              )}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
