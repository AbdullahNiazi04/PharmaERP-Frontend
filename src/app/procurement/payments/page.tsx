"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Divider,
  Tag,
  Modal,
  App,
  Typography,
  Card,
  Statistic,
} from "antd";
import {
  CreditCardOutlined,
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer, DynamicSelect } from "@/components/common";
import {
  usePayments,
  useCreatePayment,
  useUpdatePayment,
  useDeletePayment,
  useInvoices,
  useVendors,
} from "@/hooks/useProcurement";
import { Payment, CreatePaymentDto } from "@/lib/services";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;
const { Text } = Typography;

// Status color mapping
const statusColors: Record<string, string> = {
  Pending: "orange",
  Completed: "green",
  Failed: "red",
};

// Payment method color mapping
const methodColors: Record<string, string> = {
  "Bank Transfer": "blue",
  Cash: "green",
  Cheque: "orange",
  "Credit Card": "purple",
};

export default function PaymentsPage() {
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  // API Hooks
  const { data: payments = [], isLoading, refetch } = usePayments();
  const { data: invoices = [] } = useInvoices();
  const { data: vendors = [] } = useVendors();
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();

  // Get invoice details with vendor info
  const getInvoiceWithVendor = useCallback((invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return null;
    const vendor = vendors.find(v => v.id === invoice.vendorId);
    return { invoice, vendor };
  }, [invoices, vendors]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = payments.length;
    const pending = payments.filter(p => p.status === "Pending").length;
    const completed = payments.filter(p => p.status === "Completed").length;
    const failed = payments.filter(p => p.status === "Failed").length;
    const totalAmount = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    const completedAmount = payments
      .filter(p => p.status === "Completed")
      .reduce((sum, p) => sum + (p.amountPaid || 0), 0);

    return { total, pending, completed, failed, totalAmount, completedAmount };
  }, [payments]);

  // Table columns
  const columns: ColumnsType<Payment> = useMemo(
    () => [
      {
        title: "Payment ID",
        dataIndex: "id",
        key: "id",
        width: 140,
        fixed: "left",
        render: (text: string) => (
          <Text strong style={{ color: "#1890ff" }}>
            {text?.slice(0, 8)}...
          </Text>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 110,
        render: (status: string) => (
          <Tag color={statusColors[status] || "default"}>
            {status || "Pending"}
          </Tag>
        ),
      },
      {
        title: "Invoice",
        dataIndex: "invoiceId",
        key: "invoiceId",
        width: 130,
        render: (invoiceId: string) => {
          const invoice = invoices.find(i => i.id === invoiceId);
          return invoice?.invoiceNumber || "-";
        },
      },
      {
        title: "Vendor",
        dataIndex: "invoiceId",
        key: "vendor",
        width: 180,
        render: (invoiceId: string) => {
          const data = getInvoiceWithVendor(invoiceId);
          return data?.vendor?.legalName || "-";
        },
      },
      {
        title: "Payment Method",
        dataIndex: "paymentMethod",
        key: "paymentMethod",
        width: 140,
        render: (method: string) => (
          <Tag color={methodColors[method] || "default"}>
            {method || "N/A"}
          </Tag>
        ),
      },
      {
        title: "Payment Date",
        dataIndex: "paymentDate",
        key: "paymentDate",
        width: 120,
        render: (date: string) =>
          date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
      {
        title: "Amount Paid",
        dataIndex: "amountPaid",
        key: "amountPaid",
        width: 130,
        render: (value: number) => (
          <Text strong style={{ color: "#52c41a" }}>
            {value != null ? `₨ ${Number(value).toLocaleString()}` : "-"}
          </Text>
        ),
      },
      {
        title: "Tax Withheld",
        dataIndex: "taxWithheld",
        key: "taxWithheld",
        width: 110,
        render: (value: number) =>
          value != null ? `₨ ${Number(value).toLocaleString()}` : "-",
      },
      {
        title: "Reference",
        dataIndex: "paymentReference",
        key: "paymentReference",
        width: 150,
        ellipsis: true,
      },
      {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 150,
        render: (date: string) =>
          date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
    ],
    [invoices, getInvoiceWithVendor]
  );

  // Summary component
  const summaryComponent = useMemo(
    () => (
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#0958d9" }}>Total Payments</span>}
              value={summaryStats.total}
              styles={{ content: { fontSize: 18, color: "#0958d9" } }}
              prefix={<CreditCardOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#d46b08" }}>Pending</span>}
              value={summaryStats.pending}
              styles={{ content: { fontSize: 18, color: "#d46b08" } }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#389e0d" }}>Completed</span>}
              value={summaryStats.completed}
              styles={{ content: { fontSize: 18, color: "#389e0d" } }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff1f0 0%, #ffa39e 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#cf1322" }}>Failed</span>}
              value={summaryStats.failed}
              styles={{ content: { fontSize: 18, color: "#cf1322" } }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#722ed1" }}>Total Value</span>}
              value={summaryStats.totalAmount}
              styles={{ content: { fontSize: 18, color: "#722ed1" } }}
              prefix="₨"
              precision={0}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #e6fffb 0%, #87e8de 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#08979c" }}>Completed</span>}
              value={summaryStats.completedAmount}
              styles={{ content: { fontSize: 18, color: "#08979c" } }}
              prefix="₨"
              precision={0}
            />
          </Card>
        </Col>
      </Row>
    ),
    [summaryStats]
  );

  // Handlers
  const handleAdd = useCallback(() => {
    setCurrentPayment(null);
    setDrawerMode("create");
    form.resetFields();
    form.setFieldsValue({
      paymentDate: dayjs(),
      status: "Pending",
    });
    setDrawerOpen(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: Payment) => {
      setCurrentPayment(record);
      setDrawerMode("edit");
      form.setFieldsValue({
        ...record,
        paymentDate: record.paymentDate ? dayjs(record.paymentDate) : undefined,
      });
      setDrawerOpen(true);
    },
    [form]
  );

  const handleView = useCallback((record: Payment) => {
    setCurrentPayment(record);
    setDocumentViewerOpen(true);
  }, []);

  const handleDelete = useCallback(
    (record: Payment) => {
      modal.confirm({
        title: "Delete Payment",
        content: `Are you sure you want to delete this payment? This action cannot be undone.`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          await deletePayment.mutateAsync(record.id);
        },
      });
    },
    [deletePayment, modal]
  );

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      console.log('Payment form values:', values);
      const data: CreatePaymentDto = {
        invoiceId: values.invoiceId as string,
        paymentDate: (values.paymentDate as dayjs.Dayjs).format("YYYY-MM-DD"),
        paymentMethod: (values.paymentMethod as string)?.replace(/ /g, "_") as 'Bank_Transfer' | 'Cheque' | 'Cash' | 'Credit_Card' | undefined,
        amountPaid: values.amountPaid as number,
        taxWithheld: values.taxWithheld != null ? Number(values.taxWithheld) : undefined,
        advanceAdjustments: values.advanceAdjustments != null ? Number(values.advanceAdjustments) : undefined,
        paymentReference: values.paymentReference as string | undefined,
        status: values.status as 'Pending' | 'Completed' | 'Failed' | undefined,
      };
      console.log('Payment submission data:', data);

      if (drawerMode === "create") {
        await createPayment.mutateAsync(data);
      } else if (drawerMode === "edit" && currentPayment) {
        await updatePayment.mutateAsync({ id: currentPayment.id, data });
      }

      setDrawerOpen(false);
      form.resetFields();
    },
    [createPayment, updatePayment, drawerMode, currentPayment, form]
  );

  // Auto-fill from selected invoice
  const handleInvoiceChange = useCallback((invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (invoice?.amount) {
      form.setFieldValue("amountPaid", invoice.amount);
    }
  }, [invoices, form]);

  // Document viewer sections
  const documentSections = useMemo(() => {
    if (!currentPayment) return [];

    const data = getInvoiceWithVendor(currentPayment.invoiceId);

    return [
      {
        title: "Payment Details",
        items: [
          { label: "Payment ID", value: <Text strong style={{ fontSize: 16 }}>{currentPayment.id}</Text> },
          { label: "Status", value: <Tag color={statusColors[currentPayment.status || ""] || "default"} style={{ fontSize: 13 }}>{currentPayment.status}</Tag> },
          { label: "Payment Date", value: currentPayment.paymentDate ? dayjs(currentPayment.paymentDate).format("MMMM DD, YYYY") : null },
          { label: "Payment Method", value: <Tag color={methodColors[currentPayment.paymentMethod || ""] || "default"}>{currentPayment.paymentMethod}</Tag> },
        ],
      },
      {
        title: "Invoice & Vendor Information",
        items: [
          { label: "Invoice Number", value: data?.invoice?.invoiceNumber },
          { label: "Vendor Name", value: <Text strong>{data?.vendor?.legalName}</Text> },
          { label: "Contact Person", value: data?.vendor?.contactPerson },
          { label: "Email", value: data?.vendor?.email },
        ],
      },
      {
        title: "Financial Details",
        items: [
          { label: "Amount Paid", value: currentPayment.amountPaid != null ? <Text strong style={{ color: "#52c41a", fontSize: 20 }}>₨ {Number(currentPayment.amountPaid).toLocaleString()}</Text> : null },
          { label: "Tax Withheld", value: currentPayment.taxWithheld != null ? `₨ ${Number(currentPayment.taxWithheld).toLocaleString()}` : null },
          { label: "Advance Adjustments", value: currentPayment.advanceAdjustments != null ? `₨ ${Number(currentPayment.advanceAdjustments).toLocaleString()}` : null },
          { label: "Reference Number", value: currentPayment.paymentReference },
        ],
      },
    ];
  }, [currentPayment, getInvoiceWithVendor]);

  // Prepare form initial values with proper date objects
  const formInitialValues = useMemo(() => {
    if (!currentPayment) {
      return {
        paymentDate: dayjs(),
        status: "Pending",
      };
    }
    
    return {
      ...currentPayment,
      paymentDate: currentPayment.paymentDate ? dayjs(currentPayment.paymentDate) : undefined,
    };
  }, [currentPayment]);

  return (
    <div style={{ padding: 24 }}>
      <EnterpriseDataTable<Payment>
        title="Vendor Payments"
        subtitle="Manage payments to vendors"
        tableKey="vendor-payments"
        columns={columns}
        data={payments}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        exportFileName="vendor_payments"
        showSelection
        showActions
        summary={summaryComponent}
      />

      {/* Create/Edit Drawer */}
      <FormDrawer
        title="Vendor Payment"
        formKey="vendor-payment-v2"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        onDelete={drawerMode === "edit" && currentPayment ? () => handleDelete(currentPayment) : undefined}
        loading={createPayment.isPending || updatePayment.isPending}
        mode={drawerMode}
        width={600}
        form={form}
        initialValues={formInitialValues}
        entityId={currentPayment?.id}
        onDraftLoaded={(data) => ({
          ...data,
          paymentDate: data.paymentDate && typeof data.paymentDate === 'string' 
            ? dayjs(data.paymentDate) 
            : data.paymentDate
        })}
      >

        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <FileTextOutlined /> Invoice Selection
        </Divider>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="invoiceId"
              label="Invoice"
              rules={[{ required: true, message: "Please select an invoice" }]}
              tooltip="Select the invoice for this payment"
            >
              <Select
                placeholder="Select invoice"
                showSearch
                optionFilterProp="label"
                onChange={handleInvoiceChange}
                options={invoices.map((i) => ({
                  label: `${i.invoiceNumber} - ₨ ${Number(i.amount).toLocaleString()} (${i.status})`,
                  value: i.id,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <CreditCardOutlined /> Payment Details
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="paymentDate"
              label="Payment Date"
              rules={[{ required: true, message: "Required" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="paymentMethod"
              label="Payment Method"
            >
              <DynamicSelect 
                type="PAYMENT_METHOD" 
                placeholder="Select method" 
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="status" label="Status">
              <Select placeholder="Select status">
                <Option value="Pending">Pending</Option>
                <Option value="Completed">Completed</Option>
                <Option value="Failed">Failed</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="paymentReference" label="Reference">
              <Input placeholder="Cheque #, Transaction ID, etc." />
            </Form.Item>
          </Col>
        </Row>

        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <DollarOutlined /> Amount Details
        </Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="amountPaid"
              label="Amount Paid"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                prefix="₨"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) =>
                  (Number(value?.replace(/\$\s?|(,*)/g, "")) || 0) as 0
                }
                placeholder="0"
                min={0}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="taxWithheld" label="Tax Withheld">
              <InputNumber
                style={{ width: "100%" }}
                prefix="₨"
                placeholder="0"
                min={0}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="advanceAdjustments" label="Advance Adjustments">
              <InputNumber
                style={{ width: "100%" }}
                prefix="₨"
                placeholder="0"
              />
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
          status={
            currentPayment.status
              ? {
                  text: currentPayment.status,
                  color: statusColors[currentPayment.status] || "default",
                }
              : undefined
          }
          sections={documentSections}
          signatures={[
            { title: "Prepared By" },
            { title: "Authorized By" },
            { title: "Finance Director" },
          ]}
          fileName="payment_receipt"
        />
      )}
    </div>
  );
}
