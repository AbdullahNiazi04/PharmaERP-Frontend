"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Row,
  Col,
  Tag,
  Typography,
  Card,
  Statistic,
  Alert,
} from "antd";
import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  SendOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, DocumentViewer } from "@/components/common";
import { useSalesOrders, useCustomers, SalesOrder } from "@/hooks/useSales";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;

// Dispatch status color mapping
const dispatchStatusColors: Record<string, string> = {
  Pending: "gold",
  Dispatched: "blue",
  "In Transit": "purple",
  Delivered: "green",
};

export default function DispatchesPage() {
  const [currentDispatch, setCurrentDispatch] = useState<SalesOrder | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  // API Hooks - Dispatches are derived from confirmed/dispatched orders
  const { data: salesOrders = [], isLoading, refetch } = useSalesOrders();
  const { data: customers = [] } = useCustomers();

  // Filter to dispatchable orders (confirmed or later)
  const dispatches = useMemo(() => {
    return salesOrders.filter(o => o.status === "Confirmed" || o.status === "Dispatched" || o.status === "Delivered");
  }, [salesOrders]);

  // Get customer name by ID
  const getCustomerName = useCallback((customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : customerId;
  }, [customers]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = dispatches.length;
    const pendingCount = dispatches.filter((o) => o.status === "Confirmed").length;
    const inTransitCount = dispatches.filter((o) => o.status === "Dispatched").length;
    const deliveredCount = dispatches.filter((o) => o.status === "Delivered").length;

    return { total, pendingCount, inTransitCount, deliveredCount };
  }, [dispatches]);

  // Table columns
  const columns: ColumnsType<SalesOrder> = useMemo(
    () => [
      {
        title: "Dispatch #",
        dataIndex: "id",
        key: "id",
        width: 150,
        fixed: "left",
        render: (text: string) => (
          <Text strong style={{ color: "#722ed1" }}>
            DSP-{text?.slice(0, 6).toUpperCase()}
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
        title: "Order Date",
        dataIndex: "orderDate",
        key: "orderDate",
        width: 120,
        render: (date: string) =>
          date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
      {
        title: "Delivery Date",
        dataIndex: "deliveryDate",
        key: "deliveryDate",
        width: 120,
        render: (date: string) =>
          date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 130,
        render: (status: string) => {
          const dispatchStatus = status === "Confirmed" ? "Pending" : status === "Dispatched" ? "In Transit" : status;
          const icon = status === "Delivered" ? <CheckCircleOutlined /> : 
                       status === "Dispatched" ? <CarOutlined /> : 
                       <ClockCircleOutlined />;
          return (
            <Tag color={dispatchStatusColors[dispatchStatus] || "default"}>
              {icon} {dispatchStatus}
            </Tag>
          );
        },
      },
      {
        title: "Amount",
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 120,
        render: (amount: number) => `₨ ${Number(amount || 0).toLocaleString()}`,
      },
    ],
    [getCustomerName]
  );

  // Summary component
  const summaryComponent = useMemo(
    () => (
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#531dab" }}>Total Dispatches</span>}
              value={summaryStats.total}
              styles={{ content: { fontSize: 18, color: "#531dab" } }}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#d46b08" }}>Pending</span>}
              value={summaryStats.pendingCount}
              styles={{ content: { fontSize: 18, color: "#d46b08" } }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #e6f4ff 0%, #91caff 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#0958d9" }}>In Transit</span>}
              value={summaryStats.inTransitCount}
              styles={{ content: { fontSize: 18, color: "#0958d9" } }}
              prefix={<SendOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#389e0d" }}>Delivered</span>}
              value={summaryStats.deliveredCount}
              styles={{ content: { fontSize: 18, color: "#389e0d" } }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
    ),
    [summaryStats]
  );

  // Handlers
  const handleView = useCallback((record: SalesOrder) => {
    setCurrentDispatch(record);
    setDocumentViewerOpen(true);
  }, []);

  // Document viewer sections
  const documentSections = useMemo(() => {
    if (!currentDispatch) return [];

    return [
      {
        title: "Dispatch Information",
        items: [
          { label: "Dispatch Number", value: <Text strong>DSP-{currentDispatch.id?.slice(0, 6).toUpperCase()}</Text> },
          { label: "Customer", value: <Text strong>{getCustomerName(currentDispatch.customerId)}</Text> },
          { 
            label: "Status", 
            value: (
              <Tag color={dispatchStatusColors[currentDispatch.status === "Confirmed" ? "Pending" : currentDispatch.status === "Dispatched" ? "In Transit" : currentDispatch.status || ""] || "default"}>
                {currentDispatch.status === "Confirmed" ? "Pending" : currentDispatch.status === "Dispatched" ? "In Transit" : currentDispatch.status}
              </Tag>
            )
          },
        ],
      },
      {
        title: "Dates",
        items: [
          { label: "Order Date", value: currentDispatch.orderDate ? dayjs(currentDispatch.orderDate).format("MMMM DD, YYYY") : null },
          { label: "Expected Delivery", value: currentDispatch.deliveryDate ? dayjs(currentDispatch.deliveryDate).format("MMMM DD, YYYY") : null },
        ],
      },
      {
        title: "Order Value",
        items: [
          { label: "Total Amount", value: <Text strong>₨ {Number(currentDispatch.totalAmount || 0).toLocaleString()}</Text> },
        ],
      },
    ];
  }, [currentDispatch, getCustomerName]);

  return (
    <div style={{ padding: 24 }}>
      {dispatches.length === 0 && (
        <Alert
          message="No Dispatches Yet"
          description="Dispatches appear when sales orders are confirmed. Create and confirm sales orders to start tracking dispatches."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <EnterpriseDataTable<SalesOrder>
        title="Dispatch Tracking"
        subtitle="Track order shipments and deliveries"
        tableKey="sales-dispatches"
        columns={columns}
        data={dispatches}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onView={handleView}
        exportFileName="dispatches"
        showActions
        summary={summaryComponent}
      />

      {/* Document Viewer */}
      {currentDispatch && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Dispatch Note"
          documentNumber={`DSP-${currentDispatch.id?.slice(0, 6).toUpperCase()}`}
          documentDate={
            currentDispatch.orderDate
              ? dayjs(currentDispatch.orderDate).format("MMMM DD, YYYY")
              : undefined
          }
          status={{
            text: currentDispatch.status === "Confirmed" ? "Pending" : currentDispatch.status === "Dispatched" ? "In Transit" : currentDispatch.status || "",
            color: dispatchStatusColors[currentDispatch.status === "Confirmed" ? "Pending" : currentDispatch.status === "Dispatched" ? "In Transit" : currentDispatch.status || ""] || "default",
          }}
          sections={documentSections}
          signatures={[
            { title: "Warehouse" },
            { title: "Driver" },
            { title: "Received By" },
          ]}
          fileName="dispatch_note"
        />
      )}
    </div>
  );
}
