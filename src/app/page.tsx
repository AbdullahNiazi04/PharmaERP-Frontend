"use client";

import React from "react";
import { Row, Col, Card, Typography, Space, Table, Tag, Avatar, List, Progress, Segmented, Tooltip } from "antd";
import {
  ShoppingCartOutlined,
  InboxOutlined,
  TeamOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ShopOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { DashboardLayout } from "@/components/layout";
import StatCard, { StatsGrid } from "@/components/common/StatCard";

const { Title, Text, Paragraph } = Typography;

// Dashboard Stats Data
const statsData = [
  {
    title: "Total Revenue",
    value: 284500,
    prefix: "Rs.",
    icon: <DollarOutlined />,
    color: "#52c41a",
    trend: "up" as const,
    trendValue: "+12.5%",
    trendLabel: "vs last month",
    tooltip: "Total revenue this month",
  },
  {
    title: "Purchase Orders",
    value: 156,
    icon: <ShoppingCartOutlined />,
    color: "#1890ff",
    trend: "up" as const,
    trendValue: "+8",
    trendLabel: "new today",
  },
  {
    title: "Total Customers",
    value: 1247,
    icon: <TeamOutlined />,
    color: "#722ed1",
    trend: "up" as const,
    trendValue: "+23",
    trendLabel: "this week",
  },
  {
    title: "Pending Shipments",
    value: 42,
    icon: <TruckOutlined />,
    color: "#faad14",
    progress: 65,
    progressColor: "#faad14",
  },
];

// Recent Orders Data
const recentOrdersData = [
  {
    key: "1",
    orderId: "PO-2024-001",
    vendor: "PharmaChem Industries",
    amount: 45000,
    status: "Approved",
    date: "2024-01-14",
  },
  {
    key: "2",
    orderId: "PO-2024-002",
    vendor: "MedSupply Corp",
    amount: 28500,
    status: "Pending",
    date: "2024-01-14",
  },
  {
    key: "3",
    orderId: "PO-2024-003",
    vendor: "Global Pharma Ltd",
    amount: 67200,
    status: "Delivered",
    date: "2024-01-13",
  },
  {
    key: "4",
    orderId: "PO-2024-004",
    vendor: "BioTech Solutions",
    amount: 34800,
    status: "In Transit",
    date: "2024-01-13",
  },
  {
    key: "5",
    orderId: "PO-2024-005",
    vendor: "ChemLab Industries",
    amount: 52100,
    status: "Approved",
    date: "2024-01-12",
  },
];

const recentOrdersColumns = [
  {
    title: "Order ID",
    dataIndex: "orderId",
    key: "orderId",
    render: (text: string) => (
      <Text strong style={{ color: "#1890ff" }}>
        {text}
      </Text>
    ),
  },
  {
    title: "Vendor",
    dataIndex: "vendor",
    key: "vendor",
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    render: (amount: number) => (
      <Text strong>Rs. {amount.toLocaleString()}</Text>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const colors: Record<string, string> = {
        Approved: "green",
        Pending: "gold",
        Delivered: "blue",
        "In Transit": "purple",
      };
      return <Tag color={colors[status]}>{status}</Tag>;
    },
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
];

// Low Stock Alerts
const lowStockItems = [
  { name: "Paracetamol API", current: 50, minimum: 100, unit: "kg" },
  { name: "Sodium Chloride", current: 25, minimum: 80, unit: "kg" },
  { name: "Glucose Powder", current: 120, minimum: 200, unit: "kg" },
  { name: "Packaging Film A", current: 500, minimum: 1000, unit: "rolls" },
];

// Recent Activities
const recentActivities = [
  {
    icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
    title: "GRN #GR-2024-156 approved",
    time: "2 minutes ago",
  },
  {
    icon: <ShoppingCartOutlined style={{ color: "#1890ff" }} />,
    title: "New PO created for PharmaChem",
    time: "15 minutes ago",
  },
  {
    icon: <InboxOutlined style={{ color: "#722ed1" }} />,
    title: "Raw material received from vendor",
    time: "1 hour ago",
  },
  {
    icon: <WarningOutlined style={{ color: "#faad14" }} />,
    title: "Low stock alert: Paracetamol API",
    time: "2 hours ago",
  },
  {
    icon: <TeamOutlined style={{ color: "#13c2c2" }} />,
    title: "New customer registered",
    time: "3 hours ago",
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div style={{ padding: 24 }}>
        {/* Welcome Section */}
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            Welcome back, Admin! 👋
          </Title>
          <Text type="secondary">
            Here&apos;s what&apos;s happening with your pharma operations today.
          </Text>
        </div>

        {/* Stats Grid */}
        <StatsGrid stats={statsData} />

        {/* Main Content Grid */}
        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          {/* Recent Orders */}
          <Col xs={24} xl={16}>
            <Card
              title={
                <Space>
                  <ShoppingCartOutlined />
                  <span>Recent Purchase Orders</span>
                </Space>
              }
              extra={
                <a href="/procurement/purchase-orders" style={{ color: "#1890ff" }}>
                  View All
                </a>
              }
              style={{ borderRadius: 12 }}
            >
              <Table
                columns={recentOrdersColumns}
                dataSource={recentOrdersData}
                pagination={false}
                size="middle"
              />
            </Card>
          </Col>

          {/* Low Stock Alerts */}
          <Col xs={24} xl={8}>
            <Card
              title={
                <Space>
                  <WarningOutlined style={{ color: "#faad14" }} />
                  <span>Low Stock Alerts</span>
                </Space>
              }
              extra={
                <Tag color="error">{lowStockItems.length} items</Tag>
              }
              style={{ borderRadius: 12 }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {lowStockItems.map((item, index) => (
                  <div key={index} style={{ borderBottom: index !== lowStockItems.length - 1 ? "1px solid #f0f0f0" : "none", paddingBottom: index !== lowStockItems.length - 1 ? 16 : 0 }}>
                    <div style={{ marginBottom: 4 }}>
                      <Text strong>{item.name}</Text>
                    </div>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text type="secondary">
                          {item.current} / {item.minimum} {item.unit}
                        </Text>
                        <Text type="danger">
                          {Math.round((item.current / item.minimum) * 100)}%
                        </Text>
                      </div>
                      <Progress
                        percent={Math.round(
                          (item.current / item.minimum) * 100
                        )}
                        showInfo={false}
                        strokeColor={
                          item.current / item.minimum < 0.5
                            ? "#ff4d4f"
                            : "#faad14"
                        }
                        size="small"
                      />
                    </Space>
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          {/* Recent Activities */}
          <Col xs={24} xl={12}>
            <Card
              title={
                <Space>
                  <ClockCircleOutlined />
                  <span>Recent Activities</span>
                </Space>
              }
              style={{ borderRadius: 12 }}
            >
              <List
                itemLayout="horizontal"
                dataSource={recentActivities}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={40}
                          style={{ backgroundColor: "#f5f5f5" }}
                          icon={item.icon}
                        />
                      }
                      title={<Text>{item.title}</Text>}
                      description={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.time}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Quick Actions */}
          <Col xs={24} xl={12}>
            <Card
              title="Quick Actions"
              style={{ borderRadius: 12 }}
            >
              <Row gutter={[16, 16]}>
                {[
                  {
                    icon: <ShoppingCartOutlined />,
                    title: "New Purchase Order",
                    color: "#1890ff",
                    link: "/procurement/purchase-orders",
                  },
                  {
                    icon: <InboxOutlined />,
                    title: "Add GRN",
                    color: "#52c41a",
                    link: "/procurement/grn",
                  },
                  {
                    icon: <ShopOutlined />,
                    title: "Add Vendor",
                    color: "#722ed1",
                    link: "/procurement/vendors",
                  },
                  {
                    icon: <TeamOutlined />,
                    title: "Add Customer",
                    color: "#13c2c2",
                    link: "/customers",
                  },
                ].map((action, index) => (
                  <Col xs={12} key={index}>
                    <Tooltip title={action.title}>
                      <Card
                        hoverable
                        style={{
                          textAlign: "center",
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                        onClick={() => (window.location.href = action.link)}
                      >
                        <div
                          style={{
                            fontSize: 28,
                            color: action.color,
                            marginBottom: 8,
                          }}
                        >
                          {action.icon}
                        </div>
                        <Text strong style={{ fontSize: 13 }}>
                          {action.title}
                        </Text>
                      </Card>
                    </Tooltip>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </DashboardLayout>
  );
}
