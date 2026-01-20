"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Divider,
  Tag,
  Modal,
  Typography,
  Card,
  Statistic,
  DatePicker,
  InputNumber,
} from "antd";
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BankOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer } from "@/components/common";
import { useSalesOrders, useCustomers, SalesOrder } from "@/hooks/useSales";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;
const { Text } = Typography;

// Payment status colors
const paymentStatusColors: Record<string, string> = {
  Pending: "gold",
  Partial: "blue",
  Paid: "green",
  Overdue: "red",
};

// Payment method colors
const paymentMethodColors: Record<string, string> = {
  Cash: "green",
  Bank: "blue",
  Cheque: "purple",
  Online: "cyan",
};

// Mock payments derived from orders - in real app this would be separate endpoint
interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  paidAmount: number;
  paymentDate?: string;
  paymentMethod?: string;
  status: string;
  reference?: string;
}

export default function SalesPaymentsPage() {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  // API Hooks
  const { data: salesOrders = [], isLoading, refetch } = useSalesOrders();
  const { data: customers = [] } = useCustomers();

  // Convert orders to payment records
  const payments: Payment[] = useMemo(() => {
    return salesOrders
      .filter(o => o.status !== "Draft")
      .map(o => ({
        id: `PAY-${o.id.slice(0, 6)}`,
        orderId: o.id,
        customerId: o.customerId,
        amount: Number(o.totalAmount) || 0,
        paidAmount: o.status === "Delivered" ? Number(o.totalAmount) || 0 : 0,
        paymentDate: o.status === "Delivered" ? o.deliveryDate : undefined,
        paymentMethod: o.status === "Delivered" ? "Bank" : undefined,
        status: o.status === "Delivered" ? "Paid" : "Pending",
        reference: o.status === "Delivered" ? `REF-${o.id.slice(0, 8).toUpperCase()}` : undefined,
      }));
  }, [salesOrders]);

  // Get customer name by ID
  const getCustomerName = useCallback((customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : customerId;
  }, [customers]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = payments.length;
    const pendingCount = payments.filter((p) => p.status === "Pending").length;
    const paidCount = payments.filter((p) => p.status === "Paid").length;
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const receivedAmount = payments.reduce((sum, p) => sum + p.paidAmount, 0);
    const outstandingAmount = totalAmount - receivedAmount;

    return { total, pendingCount, paidCount, totalAmount, receivedAmount, outstandingAmount };
  }, [payments]);

  // Table columns
  const columns: ColumnsType<Payment> = useMemo(
    () => [
      {
        title: "Payment #",
        dataIndex: "id",
        key: "id",
        width: 130,
        fixed: "left",
        render: (text: string) => (
          <Text strong style={{ color: "#52c41a" }}>
            {text}
          </Text>
        ),
      },
      {
        title: "Customer",
        dataIndex: "customerId",
        key: "customerId",
        width: 180,
        render: (customerId: string) => <Text>{getCustomerName(customerId)}</Text>,
      },
      {
        title: "Invoice Amount",
        dataIndex: "amount",
        key: "amount",
        width: 130,
        render: (amount: number) => `₨ ${amount.toLocaleString()}`,
      },
      {
        title: "Paid Amount",
        dataIndex: "paidAmount",
        key: "paidAmount",
        width: 120,
        render: (amount: number) => (
          <Text type={amount > 0 ? "success" : "secondary"}>
            ₨ {amount.toLocaleString()}
          </Text>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (status: string) => (
          <Tag color={paymentStatusColors[status] || "default"}>
            {status === "Paid" ? <CheckCircleOutlined /> : <ClockCircleOutlined />} {status}
          </Tag>
        ),
      },
      {
        title: "Method",
        dataIndex: "paymentMethod",
        key: "paymentMethod",
        width: 100,
        render: (method: string) => method ? (
          <Tag color={paymentMethodColors[method] || "default"}>{method}</Tag>
        ) : "-",
      },
      {
        title: "Payment Date",
        dataIndex: "paymentDate",
        key: "paymentDate",
        width: 120,
        render: (date: string) => date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
    ],
    [getCustomerName]
  );

  // Summary component
  const summaryComponent = useMemo(
    () => (
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#389e0d" }}>Total Payments</span>}
              value={summaryStats.total}
              styles={{ content: { fontSize: 18, color: "#389e0d" } }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#d46b08" }}>Pending</span>}
              value={summaryStats.pendingCount}
              styles={{ content: { fontSize: 18, color: "#d46b08" } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#389e0d" }}>Paid</span>}
              value={summaryStats.paidCount}
              styles={{ content: { fontSize: 18, color: "#389e0d" } }}
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
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#389e0d" }}>Received</span>}
              value={summaryStats.receivedAmount}
              styles={{ content: { fontSize: 14, color: "#389e0d" } }}
              prefix="₨"
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff1f0 0%, #ffa39e 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#cf1322" }}>Outstanding</span>}
              value={summaryStats.outstandingAmount}
              styles={{ content: { fontSize: 14, color: "#cf1322" } }}
              prefix="₨"
            />
          </Card>
        </Col>
      </Row>
    ),
    [summaryStats]
  );

  // Handlers
  const handleView = useCallback((record: Payment) => {
    setCurrentPayment(record);
    setDocumentViewerOpen(true);
  }, []);

  const handleRecordPayment = useCallback((record: Payment) => {
    setCurrentPayment(record);
    form.setFieldsValue({
      amount: record.amount - record.paidAmount,
      paymentMethod: "Bank",
      paymentDate: dayjs(),
    });
    setDrawerOpen(true);
  }, [form]);

  // Document viewer sections
  const documentSections = useMemo(() => {
    if (!currentPayment) return [];

    return [
      {
        title: "Payment Information",
        items: [
          { label: "Payment ID", value: <Text strong>{currentPayment.id}</Text> },
          { label: "Customer", value: <Text strong>{getCustomerName(currentPayment.customerId)}</Text> },
          { label: "Status", value: <Tag color={paymentStatusColors[currentPayment.status]}>{currentPayment.status}</Tag> },
          { label: "Reference", value: currentPayment.reference },
        ],
      },
      {
        title: "Amount Details",
        items: [
          { label: "Invoice Amount", value: <Text>₨ {currentPayment.amount.toLocaleString()}</Text> },
          { label: "Paid Amount", value: <Text type="success">₨ {currentPayment.paidAmount.toLocaleString()}</Text> },
          { label: "Outstanding", value: <Text type="danger">₨ {(currentPayment.amount - currentPayment.paidAmount).toLocaleString()}</Text> },
        ],
      },
      {
        title: "Payment Details",
        items: [
          { label: "Payment Method", value: currentPayment.paymentMethod ? <Tag color={paymentMethodColors[currentPayment.paymentMethod]}>{currentPayment.paymentMethod}</Tag> : null },
          { label: "Payment Date", value: currentPayment.paymentDate ? dayjs(currentPayment.paymentDate).format("MMMM DD, YYYY") : null },
        ],
      },
    ];
  }, [currentPayment, getCustomerName]);

  return (
    <div style={{ padding: 24 }}>
      <EnterpriseDataTable<Payment>
        title="Payment Management"
        subtitle="Track and manage customer payments"
        tableKey="sales-payments"
        columns={columns}
        data={payments}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onView={handleView}
        onEdit={handleRecordPayment}
        exportFileName="sales_payments"
        showActions
        summary={summaryComponent}
      />

      {/* Record Payment Drawer */}
      <FormDrawer
        title="Record Payment"
        formKey="record-payment"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={async () => {
          setDrawerOpen(false);
          // In real app, this would call a payment recording API
        }}
        loading={false}
        mode="edit"
        width={450}
        form={form}
      >
        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <BankOutlined /> Payment Details
        </Divider>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="amount"
              label="Payment Amount"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Enter amount"
                prefix="₨"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="paymentMethod"
              label="Payment Method"
              rules={[{ required: true, message: "Required" }]}
            >
              <Select placeholder="Select method">
                <Option value="Cash">Cash</Option>
                <Option value="Bank">Bank Transfer</Option>
                <Option value="Cheque">Cheque</Option>
                <Option value="Online">Online Payment</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="paymentDate"
              label="Payment Date"
              rules={[{ required: true, message: "Required" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="reference"
              label="Reference / Transaction ID"
            >
              <Input placeholder="Enter reference number" />
            </Form.Item>
          </Col>
        </Row>
      </FormDrawer>

      {/* Document Viewer */}
      {currentPayment && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Payment Receipt"
          documentNumber={currentPayment.id}
          documentDate={
            currentPayment.paymentDate
              ? dayjs(currentPayment.paymentDate).format("MMMM DD, YYYY")
              : undefined
          }
          status={{
            text: currentPayment.status,
            color: paymentStatusColors[currentPayment.status] || "default",
          }}
          sections={documentSections}
          signatures={[
            { title: "Cashier" },
            { title: "Approved By" },
          ]}
          fileName="payment_receipt"
        />
      )}
    </div>
  );
}
