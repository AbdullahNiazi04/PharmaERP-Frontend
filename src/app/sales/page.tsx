"use client";

import React, { useMemo, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Statistic,
  Tag,
  Space,
  Button,
  Skeleton,
  Alert,
} from "antd";
import {
  TeamOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  DollarOutlined,
  CarOutlined,
  ArrowRightOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useCustomers, useSalesOrders, usePrefetchSales } from "@/hooks/useSales";

const { Title, Text, Paragraph } = Typography;

// Module cards configuration
const moduleCards = [
  {
    title: "Customers",
    description: "Manage customer accounts and contacts",
    icon: <TeamOutlined style={{ fontSize: 32, color: "#fa541c" }} />,
    href: "/sales/customers",
    color: "#fff2e8",
    borderColor: "#ffbb96",
  },
  {
    title: "Sales Orders",
    description: "Create and manage sales orders",
    icon: <ShoppingCartOutlined style={{ fontSize: 32, color: "#52c41a" }} />,
    href: "/sales/orders",
    color: "#f6ffed",
    borderColor: "#b7eb8f",
  },
  {
    title: "Invoices",
    description: "Generate and track sales invoices",
    icon: <FileTextOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
    href: "/sales/invoices",
    color: "#e6f4ff",
    borderColor: "#91caff",
  },
  {
    title: "Dispatches",
    description: "Track order shipments and delivery",
    icon: <CarOutlined style={{ fontSize: 32, color: "#722ed1" }} />,
    href: "/sales/dispatches",
    color: "#f9f0ff",
    borderColor: "#d3adf7",
  },
];

// Customer type colors
const customerTypeColors: Record<string, string> = {
  Distributor: "#1890ff",
  Hospital: "#52c41a",
  Pharmacy: "#722ed1",
};

export default function SalesDashboardPage() {
  // API Hooks
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: salesOrders = [], isLoading: ordersLoading } = useSalesOrders();
  const prefetch = usePrefetchSales();

  const isLoading = customersLoading || ordersLoading;

  // Prefetch all data on mount
  useEffect(() => {
    prefetch.prefetchAll();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const distributors = customers.filter((c) => c.type === "Distributor").length;
    const hospitals = customers.filter((c) => c.type === "Hospital").length;
    const pharmacies = customers.filter((c) => c.type === "Pharmacy").length;

    const totalOrders = salesOrders.length;
    const draftOrders = salesOrders.filter((o) => o.status === "Draft").length;
    const confirmedOrders = salesOrders.filter((o) => o.status === "Confirmed").length;
    const dispatchedOrders = salesOrders.filter((o) => o.status === "Dispatched").length;
    const deliveredOrders = salesOrders.filter((o) => o.status === "Delivered").length;

    // Calculate total revenue
    const totalRevenue = salesOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    return {
      totalCustomers,
      distributors,
      hospitals,
      pharmacies,
      totalOrders,
      draftOrders,
      confirmedOrders,
      dispatchedOrders,
      deliveredOrders,
      totalRevenue,
    };
  }, [customers, salesOrders]);

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
          Sales & Marketing
        </Title>
        <Text type="secondary">
          Manage customers, sales orders, and deliveries
        </Text>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #fa541c 0%, #ff7a45 100%)",
              border: "none",
              borderRadius: 12,
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Total Customers</span>}
              value={stats.totalCustomers}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
              prefix={<TeamOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                {stats.distributors} Distributors
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
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Total Orders</span>}
              value={stats.totalOrders}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
              prefix={<ShoppingCartOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                {stats.confirmedOrders} Confirmed
              </Tag>
            </div>
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
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Total Revenue</span>}
              value={stats.totalRevenue}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
              prefix={<DollarOutlined />}
              suffix="₨"
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                {stats.deliveredOrders} Delivered
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
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Pending Dispatch</span>}
              value={stats.confirmedOrders}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
              prefix={<CarOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                {stats.draftOrders} Drafts
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Module Cards */}
      <Title level={5} style={{ marginBottom: 16 }}>
        Sales Modules
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {moduleCards.map((module) => (
          <Col key={module.title} xs={24} sm={12} lg={6}>
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
                <span>Sales Alerts</span>
              </Space>
            }
            size="small"
            style={{ borderRadius: 12 }}
          >
            {customers.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <CheckCircleOutlined style={{ fontSize: 32, color: "#52c41a" }} />
                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                  No alerts at this time. Get started by adding customers.
                </Paragraph>
                <Link href="/sales/customers">
                  <Button type="primary" size="small">
                    Add Customers
                  </Button>
                </Link>
              </div>
            ) : (
              <Alert
                title="System Information"
                description={`You have ${stats.draftOrders} draft orders and ${stats.confirmedOrders} orders pending dispatch.`}
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
                <ClockCircleOutlined style={{ color: "#fa541c" }} />
                <span>Quick Actions</span>
              </Space>
            }
            size="small"
            style={{ borderRadius: 12 }}
          >
            <Space orientation="vertical" style={{ width: "100%" }}>
              <Link href="/sales/customers">
                <Button block type="default" icon={<TeamOutlined />}>
                  Add New Customer
                </Button>
              </Link>
              <Link href="/sales/orders">
                <Button block type="default" icon={<ShoppingCartOutlined />}>
                  Create Sales Order
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Customer Type Distribution */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Customer Distribution by Type" size="small" style={{ borderRadius: 12 }}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Statistic
                    title={<span style={{ color: customerTypeColors.Distributor }}>Distributors</span>}
                    value={stats.distributors}
                    styles={{ content: { color: customerTypeColors.Distributor } }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Statistic
                    title={<span style={{ color: customerTypeColors.Hospital }}>Hospitals</span>}
                    value={stats.hospitals}
                    styles={{ content: { color: customerTypeColors.Hospital } }}
                  />
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Statistic
                    title={<span style={{ color: customerTypeColors.Pharmacy }}>Pharmacies</span>}
                    value={stats.pharmacies}
                    styles={{ content: { color: customerTypeColors.Pharmacy } }}
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
