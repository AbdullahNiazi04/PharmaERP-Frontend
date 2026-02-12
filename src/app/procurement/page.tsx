"use client";

import React, { useMemo, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Statistic,
  Progress,
  Table,
  Tag,
  Space,
  Button,
  Skeleton,
  Tooltip,
  Divider,
  Alert,
} from "antd";
import {
  ShopOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  ArrowRightOutlined,
  RiseOutlined,
  FallOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  WarningOutlined,
  FileProtectOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import dayjs from "dayjs";
import {
  useVendors,
  usePurchaseRequisitions,
  usePurchaseOrders,
  useGoodsReceiptNotes,
  useInvoices,
  usePayments,
  usePrefetchProcurementData,
} from "@/hooks/useProcurement";

const { Title, Text, Paragraph } = Typography;

// Module cards configuration
const moduleCards = [
  {
    title: "Vendors",
    description: "Manage suppliers and vendor relationships",
    icon: <ShopOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
    href: "/procurement/vendors",
    color: "#e6f4ff",
    borderColor: "#91caff",
  },
  {
    title: "Purchase Requisitions",
    description: "Create and track purchase requests",
    icon: <FileTextOutlined style={{ fontSize: 32, color: "#722ed1" }} />,
    href: "/procurement/requisitions",
    color: "#f9f0ff",
    borderColor: "#d3adf7",
  },
  {
    title: "Purchase Orders",
    description: "Manage orders placed with vendors",
    icon: <ShoppingCartOutlined style={{ fontSize: 32, color: "#52c41a" }} />,
    href: "/procurement/purchase-orders",
    color: "#f6ffed",
    borderColor: "#b7eb8f",
  },
  {
    title: "Goods Receipt Notes",
    description: "Track received goods and QC status",
    icon: <InboxOutlined style={{ fontSize: 32, color: "#fa8c16" }} />,
    href: "/procurement/grn",
    color: "#fff7e6",
    borderColor: "#ffd591",
  },
  {
    title: "RMQC",
    description: "Quality Control for Raw Materials",
    icon: <CheckCircleOutlined style={{ fontSize: 32, color: "#fa541c" }} />,
    href: "/procurement/rmqc",
    color: "#fff2e8",
    borderColor: "#ffbb96",
  },
  {
    title: "Invoices",
    description: "Manage vendor invoices and payments due",
    icon: <FileProtectOutlined style={{ fontSize: 32, color: "#eb2f96" }} />,
    href: "/procurement/invoices",
    color: "#fff0f6",
    borderColor: "#ffadd2",
  },
  {
    title: "Payments",
    description: "Track and record vendor payments",
    icon: <DollarOutlined style={{ fontSize: 32, color: "#13c2c2" }} />,
    href: "/procurement/payments",
    color: "#e6fffb",
    borderColor: "#87e8de",
  },
];

export default function ProcurementDashboardPage() {
  // API Hooks
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors();
  const { data: requisitions = [], isLoading: requisitionsLoading } = usePurchaseRequisitions();
  const { data: purchaseOrders = [], isLoading: posLoading } = usePurchaseOrders();
  const { data: grns = [], isLoading: grnsLoading } = useGoodsReceiptNotes();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const { data: payments = [], isLoading: paymentsLoading } = usePayments();

  const prefetch = usePrefetchProcurementData();

  // Prefetch all data on mount
  useEffect(() => {
    prefetch.prefetchAll();
  }, []);

  const isLoading = vendorsLoading || requisitionsLoading || posLoading || grnsLoading || invoicesLoading || paymentsLoading;

  // Calculate statistics
  const stats = useMemo(() => {
    // Vendors
    const activeVendors = vendors.filter((v) => v.status === "Active").length;
    const blacklistedVendors = vendors.filter((v) => v.isBlacklisted).length;
    const gmpCertified = vendors.filter((v) => v.isGmpCertified).length;

    // Requisitions
    const pendingReqs = requisitions.filter((r) => r.status === "Pending_Approval").length;
    const approvedReqs = requisitions.filter((r) => r.status === "Approved").length;
    const urgentReqs = requisitions.filter((r) => r.priority === "Urgent" && r.status !== "Approved").length;

    // Purchase Orders
    const draftPOs = purchaseOrders.filter((p) => p.status === "Draft").length;
    const submittedPOs = purchaseOrders.filter((p) => p.status === "Issued").length;
    const completedPOs = purchaseOrders.filter((p) => p.status === "Closed").length;
    const totalPOValue = purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0);

    // GRNs
    const pendingQC = grns.filter((g) => g.qcStatus === "Pending").length;
    const approvedGRNs = grns.filter((g) => g.status === "Approved").length;
    const rejectedGRNs = grns.filter((g) => g.status === "Rejected").length;

    // Invoices
    const pendingInvoices = invoices.filter((i) => i.status === "Pending").length;
    const overdueInvoices = invoices.filter((i) => i.status === "Overdue").length;
    const paidInvoices = invoices.filter((i) => i.status === "Paid").length;
    const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const pendingInvoiceAmount = invoices
      .filter((i) => i.status === "Pending" || i.status === "Overdue")
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);

    // Payments
    const pendingPayments = payments.filter((p) => p.status === "Pending").length;
    const completedPayments = payments.filter((p) => p.status === "Completed").length;
    const totalPaymentAmount = payments.reduce((sum, pay) => sum + (pay.amountPaid || 0), 0);

    return {
      vendors: {
        total: vendors.length,
        active: activeVendors,
        blacklisted: blacklistedVendors,
        gmpCertified,
      },
      requisitions: {
        total: requisitions.length,
        pending: pendingReqs,
        approved: approvedReqs,
        urgent: urgentReqs,
      },
      purchaseOrders: {
        total: purchaseOrders.length,
        draft: draftPOs,
        submitted: submittedPOs,
        completed: completedPOs,
        totalValue: totalPOValue,
      },
      grns: {
        total: grns.length,
        pendingQC,
        approved: approvedGRNs,
        rejected: rejectedGRNs,
      },
      invoices: {
        total: invoices.length,
        pending: pendingInvoices,
        overdue: overdueInvoices,
        paid: paidInvoices,
        totalAmount: totalInvoiceAmount,
        pendingAmount: pendingInvoiceAmount,
      },
      payments: {
        total: payments.length,
        pending: pendingPayments,
        completed: completedPayments,
        totalAmount: totalPaymentAmount,
      },
    };
  }, [vendors, requisitions, purchaseOrders, grns, invoices, payments]);

  // Recent activities
  const recentActivities = useMemo(() => {
    const activities: { type: string; title: string; status: string; date: string; color: string }[] = [];

    // Add recent POs
    purchaseOrders.slice(-3).forEach((po) => {
      activities.push({
        type: "Purchase Order",
        title: po.poNumber,
        status: po.status || "Draft",
        date: po.createdAt || "",
        color: "blue",
      });
    });

    // Add recent GRNs
    grns.slice(-3).forEach((grn) => {
      activities.push({
        type: "GRN",
        title: grn.grnNumber,
        status: grn.status || "Draft",
        date: grn.createdAt || "",
        color: "orange",
      });
    });

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [purchaseOrders, grns]);

  // Top vendors by quality
  const topVendors = useMemo(() => {
    return vendors
      .filter((v) => v.qualityRating && v.status === "Active")
      .sort((a, b) => (b.qualityRating || 0) - (a.qualityRating || 0))
      .slice(0, 5);
  }, [vendors]);

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
          Procurement Dashboard
        </Title>
        <Text type="secondary">
          Overview of all procurement activities and quick access to modules
        </Text>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: 12,
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Total Vendors</span>}
              value={stats.vendors.total}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
              prefix={<ShopOutlined />}
            />
            <div style={{ marginTop: 12 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                {stats.vendors.active} Active
              </Tag>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                {stats.vendors.gmpCertified} GMP
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              border: "none",
              borderRadius: 12,
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Purchase Requisitions</span>}
              value={stats.requisitions.total}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
              prefix={<FileTextOutlined />}
            />
            <div style={{ marginTop: 12 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                {stats.requisitions.pending} Pending
              </Tag>
              {stats.requisitions.urgent > 0 && (
                <Tag color="rgba(255,0,0,0.4)" style={{ color: "#fff", border: "none" }}>
                  <ExclamationCircleOutlined /> {stats.requisitions.urgent} Urgent
                </Tag>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              border: "none",
              borderRadius: 12,
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Purchase Orders</span>}
              value={stats.purchaseOrders.total}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
              prefix={<ShoppingCartOutlined />}
            />
            <div style={{ marginTop: 12 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                ${stats.purchaseOrders.totalValue.toLocaleString()} Total
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              border: "none",
              borderRadius: 12,
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Goods Receipt Notes</span>}
              value={stats.grns.total}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
              prefix={<InboxOutlined />}
            />
            <div style={{ marginTop: 12 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                <ClockCircleOutlined /> {stats.grns.pendingQC} Pending QC
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Module Cards */}
      <Title level={5} style={{ marginBottom: 16 }}>
        Procurement Modules
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

      {/* Alerts & Insights */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <WarningOutlined style={{ color: "#faad14" }} />
                <span>Alerts & Notifications</span>
              </Space>
            }
            size="small"
            style={{ borderRadius: 12 }}
          >
            {stats.requisitions.urgent > 0 && (
              <div
                style={{
                  padding: "12px 16px",
                  marginBottom: 8,
                  background: "#fff2f0",
                  borderRadius: 8,
                  border: "1px solid #ffccc7",
                }}
              >
                <ExclamationCircleOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />
                <Text strong style={{ color: "#cf1322" }}>
                  {stats.requisitions.urgent} urgent requisition(s) pending approval
                </Text>
              </div>
            )}
            {stats.grns.pendingQC > 0 && (
              <div
                style={{
                  padding: "12px 16px",
                  marginBottom: 8,
                  background: "#fffbe6",
                  borderRadius: 8,
                  border: "1px solid #ffe58f",
                }}
              >
                <ClockCircleOutlined style={{ color: "#faad14", marginRight: 8 }} />
                <Text strong style={{ color: "#d48806" }}>
                  {stats.grns.pendingQC} GRN(s) pending quality check
                </Text>
              </div>
            )}
            {stats.vendors.blacklisted > 0 && (
              <div
                style={{
                  padding: "12px 16px",
                  marginBottom: 8,
                  background: "#fff1f0",
                  borderRadius: 8,
                  border: "1px solid #ffa39e",
                }}
              >
                <ExclamationCircleOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />
                <Text type="secondary">
                  {stats.vendors.blacklisted} vendor(s) are blacklisted
                </Text>
              </div>
            )}
            {stats.purchaseOrders.submitted > 0 && (
              <div
                style={{
                  padding: "12px 16px",
                  background: "#e6f4ff",
                  borderRadius: 8,
                  border: "1px solid #91caff",
                }}
              >
                <CheckCircleOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                <Text>
                  {stats.purchaseOrders.submitted} purchase order(s) awaiting approval
                </Text>
              </div>
            )}
            {stats.requisitions.urgent === 0 &&
              stats.grns.pendingQC === 0 &&
              stats.purchaseOrders.submitted === 0 && (
                <div style={{ textAlign: "center", padding: 20 }}>
                  <CheckCircleOutlined style={{ fontSize: 32, color: "#52c41a" }} />
                  <Paragraph type="secondary" style={{ marginTop: 8 }}>
                    All caught up! No pending alerts.
                  </Paragraph>
                </div>
              )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TrophyOutlined style={{ color: "#52c41a" }} />
                <span>Top Rated Vendors</span>
              </Space>
            }
            size="small"
            style={{ borderRadius: 12 }}
          >
            {topVendors.length > 0 ? (
              <div>
                {topVendors.map((vendor, index) => (
                  <div
                    key={vendor.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: index < topVendors.length - 1 ? "1px solid #f0f0f0" : "none",
                    }}
                  >
                    <Space>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: index < 3 ? "#faad14" : "#d9d9d9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: 12,
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <Text strong>{vendor.legalName}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {vendor.vendorType}
                        </Text>
                      </div>
                    </Space>
                    <div style={{ textAlign: "right" }}>
                      <Text strong style={{ color: "#faad14" }}>
                        {"⭐".repeat(vendor.qualityRating || 0)}
                      </Text>
                      <br />
                      <Tag color={vendor.isGmpCertified ? "green" : "default"} style={{ fontSize: 10 }}>
                        {vendor.isGmpCertified ? "GMP Certified" : "Non-GMP"}
                      </Tag>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 20 }}>
                <Text type="secondary">No rated vendors yet</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Process Progress */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Requisition to PO Conversion" size="small" style={{ borderRadius: 12 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <Text>Approved Requisitions</Text>
                <Text strong>{stats.requisitions.approved}</Text>
              </div>
              <Progress
                percent={
                  stats.requisitions.total > 0
                    ? Math.round((stats.requisitions.approved / stats.requisitions.total) * 100)
                    : 0
                }
                strokeColor="#52c41a"
                size="small"
              />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <Text>Completed Purchase Orders</Text>
                <Text strong>{stats.purchaseOrders.completed}</Text>
              </div>
              <Progress
                percent={
                  stats.purchaseOrders.total > 0
                    ? Math.round((stats.purchaseOrders.completed / stats.purchaseOrders.total) * 100)
                    : 0
                }
                strokeColor="#1890ff"
                size="small"
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Quality Control Status" size="small" style={{ borderRadius: 12 }}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Progress
                    type="circle"
                    percent={
                      stats.grns.total > 0
                        ? Math.round((stats.grns.approved / stats.grns.total) * 100)
                        : 0
                    }
                    strokeColor="#52c41a"
                    size={80}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Approved
                    </Text>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Progress
                    type="circle"
                    percent={
                      stats.grns.total > 0
                        ? Math.round((stats.grns.pendingQC / stats.grns.total) * 100)
                        : 0
                    }
                    strokeColor="#faad14"
                    size={80}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Pending QC
                    </Text>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Progress
                    type="circle"
                    percent={
                      stats.grns.total > 0
                        ? Math.round((stats.grns.rejected / stats.grns.total) * 100)
                        : 0
                    }
                    strokeColor="#ff4d4f"
                    size={80}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Rejected
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
