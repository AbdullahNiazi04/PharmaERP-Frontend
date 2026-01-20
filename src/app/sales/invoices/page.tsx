"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Form,
  Row,
  Col,
  Tag,
  Typography,
  Card,
  Statistic,
  Alert,
} from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, DocumentViewer } from "@/components/common";
import { useSalesOrders, useCustomers, SalesOrder } from "@/hooks/useSales";
import type { ColumnsType } from "antd/es/table";

const { Text, Paragraph } = Typography;

// Invoice status color mapping (derived from order status)
const invoiceStatusColors: Record<string, string> = {
  Draft: "default",
  Pending: "gold",
  Paid: "green",
  Overdue: "red",
};

export default function SalesInvoicesPage() {
  const [currentInvoice, setCurrentInvoice] = useState<SalesOrder | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  // API Hooks - Invoices are derived from confirmed/dispatched/delivered orders
  const { data: salesOrders = [], isLoading, refetch } = useSalesOrders();
  const { data: customers = [] } = useCustomers();

  // Filter to invoiceable orders (not drafts)
  const invoices = useMemo(() => {
    return salesOrders.filter(o => o.status !== "Draft");
  }, [salesOrders]);

  // Get customer name by ID
  const getCustomerName = useCallback((customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : customerId;
  }, [customers]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = invoices.length;
    const pendingCount = invoices.filter((o) => o.status === "Confirmed").length;
    const paidCount = invoices.filter((o) => o.status === "Delivered").length;
    const totalAmount = invoices.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const paidAmount = invoices
      .filter(o => o.status === "Delivered")
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    return { total, pendingCount, paidCount, totalAmount, paidAmount };
  }, [invoices]);

  // Table columns
  const columns: ColumnsType<SalesOrder> = useMemo(
    () => [
      {
        title: "Invoice #",
        dataIndex: "id",
        key: "id",
        width: 150,
        fixed: "left",
        render: (text: string) => (
          <Text strong style={{ color: "#fa541c" }}>
            INV-{text?.slice(0, 6).toUpperCase()}
          </Text>
        ),
      },
      {
        title: "Customer",
        dataIndex: "customerId",
        key: "customerId",
        width: 200,
        render: (customerId: string) => <Text>{getCustomerName(customerId)}</Text>,
      },
      {
        title: "Invoice Date",
        dataIndex: "orderDate",
        key: "orderDate",
        width: 120,
        render: (date: string) =>
          date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
      {
        title: "Amount",
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 120,
        render: (amount: number) => (
          <Text strong>₨ {Number(amount || 0).toLocaleString()}</Text>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (status: string) => {
          const invoiceStatus = status === "Delivered" ? "Paid" : status === "Confirmed" ? "Pending" : status;
          return (
            <Tag color={invoiceStatusColors[invoiceStatus] || "default"}>
              {status === "Delivered" ? <CheckCircleOutlined /> : <ClockCircleOutlined />} {invoiceStatus}
            </Tag>
          );
        },
      },
      {
        title: "Due Date",
        dataIndex: "deliveryDate",
        key: "deliveryDate",
        width: 120,
        render: (date: string) =>
          date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
    ],
    [getCustomerName]
  );

  // Summary component
  const summaryComponent = useMemo(
    () => (
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={5}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff2e8 0%, #ffbb96 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#d4380d" }}>Total Invoices</span>}
              value={summaryStats.total}
              styles={{ content: { fontSize: 18, color: "#d4380d" } }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#d46b08" }}>Pending</span>}
              value={summaryStats.pendingCount}
              styles={{ content: { fontSize: 18, color: "#d46b08" } }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#389e0d" }}>Paid</span>}
              value={summaryStats.paidCount}
              styles={{ content: { fontSize: 18, color: "#389e0d" } }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #e6f4ff 0%, #91caff 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#0958d9" }}>Total Amount</span>}
              value={summaryStats.totalAmount}
              styles={{ content: { fontSize: 14, color: "#0958d9" } }}
              prefix="₨"
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#389e0d" }}>Paid Amount</span>}
              value={summaryStats.paidAmount}
              styles={{ content: { fontSize: 14, color: "#389e0d" } }}
              prefix="₨"
            />
          </Card>
        </Col>
      </Row>
    ),
    [summaryStats]
  );

  // Handlers
  const handleView = useCallback((record: SalesOrder) => {
    setCurrentInvoice(record);
    setDocumentViewerOpen(true);
  }, []);

  // Document viewer sections
  const documentSections = useMemo(() => {
    if (!currentInvoice) return [];

    return [
      {
        title: "Invoice Details",
        items: [
          { label: "Invoice Number", value: <Text strong>INV-{currentInvoice.id?.slice(0, 6).toUpperCase()}</Text> },
          { label: "Customer", value: <Text strong>{getCustomerName(currentInvoice.customerId)}</Text> },
          { label: "Invoice Date", value: currentInvoice.orderDate ? dayjs(currentInvoice.orderDate).format("MMMM DD, YYYY") : null },
          { label: "Due Date", value: currentInvoice.deliveryDate ? dayjs(currentInvoice.deliveryDate).format("MMMM DD, YYYY") : null },
        ],
      },
      {
        title: "Amount",
        items: [
          { label: "Total Amount", value: <Text strong style={{ fontSize: 16 }}>₨ {Number(currentInvoice.totalAmount || 0).toLocaleString()}</Text> },
          { label: "Payment Status", value: <Tag color={currentInvoice.status === "Delivered" ? "green" : "gold"}>{currentInvoice.status === "Delivered" ? "Paid" : "Pending"}</Tag> },
        ],
      },
    ];
  }, [currentInvoice, getCustomerName]);

  return (
    <div style={{ padding: 24 }}>
      {invoices.length === 0 && (
        <Alert
          message="No Invoices Yet"
          description="Invoices are automatically generated when sales orders are confirmed. Create and confirm sales orders to see invoices here."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <EnterpriseDataTable<SalesOrder>
        title="Sales Invoices"
        subtitle="View and manage sales invoices"
        tableKey="sales-invoices"
        columns={columns}
        data={invoices}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onView={handleView}
        exportFileName="sales_invoices"
        showActions
        summary={summaryComponent}
      />

      {/* Document Viewer */}
      {currentInvoice && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Sales Invoice"
          documentNumber={`INV-${currentInvoice.id?.slice(0, 6).toUpperCase()}`}
          documentDate={
            currentInvoice.orderDate
              ? dayjs(currentInvoice.orderDate).format("MMMM DD, YYYY")
              : undefined
          }
          status={{
            text: currentInvoice.status === "Delivered" ? "Paid" : "Pending",
            color: currentInvoice.status === "Delivered" ? "green" : "gold",
          }}
          sections={documentSections}
          signatures={[
            { title: "Prepared By" },
            { title: "Approved By" },
            { title: "Received By" },
          ]}
          fileName="sales_invoice"
        />
      )}
    </div>
  );
}
