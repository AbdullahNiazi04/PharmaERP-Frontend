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
  Typography,
  Card,
  Statistic,
  Alert,
} from "antd";
import {
  FileTextOutlined,
  ShopOutlined,
  CalendarOutlined,
  DollarOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer } from "@/components/common";
import {
  useInvoices,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  useVendors,
  usePurchaseOrders,
  useGoodsReceiptNotes,
} from "@/hooks/useProcurement";
import { Invoice, CreateInvoiceDto } from "@/lib/services";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;
const { Text } = Typography;

// Status color mapping
const statusColors: Record<string, string> = {
  Pending: "orange",
  Paid: "green",
  Overdue: "red",
  Cancelled: "default",
};

export default function InvoicesPage() {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  // API Hooks
  const { data: invoices = [], isLoading, refetch } = useInvoices();
  const { data: vendors = [] } = useVendors();
  const { data: purchaseOrders = [] } = usePurchaseOrders();
  const { data: grns = [] } = useGoodsReceiptNotes();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = invoices.length;
    const pending = invoices.filter(inv => inv.status === "Pending").length;
    const paid = invoices.filter(inv => inv.status === "Paid").length;
    const overdue = invoices.filter(inv => inv.status === "Overdue").length;
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const pendingAmount = invoices
      .filter(inv => inv.status === "Pending" || inv.status === "Overdue")
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);

    return { total, pending, paid, overdue, totalAmount, pendingAmount };
  }, [invoices]);

  // Table columns
  const columns: ColumnsType<Invoice> = useMemo(
    () => [
      {
        title: "Invoice #",
        dataIndex: "invoiceNumber",
        key: "invoiceNumber",
        width: 140,
        fixed: "left",
        render: (text: string) => (
          <Text strong style={{ color: "#1890ff" }}>
            {text}
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
        title: "Vendor",
        dataIndex: "vendorId",
        key: "vendorId",
        width: 180,
        render: (vendorId: string) => {
          const vendor = vendors.find(v => v.id === vendorId);
          return vendor?.legalName || vendorId || "-";
        },
      },
      {
        title: "PO Reference",
        dataIndex: "poId",
        key: "poId",
        width: 130,
        render: (poId: string) => {
          const po = purchaseOrders.find(p => p.id === poId);
          return po?.poNumber || "-";
        },
      },
      {
        title: "GRN Reference",
        dataIndex: "grnId",
        key: "grnId",
        width: 130,
        render: (grnId: string) => {
          const grn = grns.find(g => g.id === grnId);
          return grn?.grnNumber || "-";
        },
      },
      {
        title: "Invoice Date",
        dataIndex: "invoiceDate",
        key: "invoiceDate",
        width: 120,
        render: (date: string) =>
          date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
      {
        title: "Due Date",
        dataIndex: "dueDate",
        key: "dueDate",
        width: 120,
        render: (date: string, record: Invoice) => {
          const isOverdue = date && dayjs(date).isBefore(dayjs()) && record.status !== "Paid";
          return (
            <span style={{ color: isOverdue ? "#ff4d4f" : "inherit" }}>
              {date ? dayjs(date).format("MMM DD, YYYY") : "-"}
            </span>
          );
        },
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        width: 130,
        render: (value: number) => (
          <Text strong style={{ color: "#52c41a" }}>
            {value != null ? `$${value.toLocaleString()}` : "-"}
          </Text>
        ),
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
    [vendors, purchaseOrders, grns]
  );

  // Summary component
  const summaryComponent = useMemo(
    () => (
      <div style={{ marginBottom: 8 }}>
        <Row gutter={16}>
          <Col span={4}>
            <Card size="small" style={{ background: "linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%)", border: "none" }}>
              <Statistic
                title={<span style={{ fontSize: 11, color: "#0958d9" }}>Total Invoices</span>}
                value={summaryStats.total}
                styles={{ content: { fontSize: 18, color: "#0958d9" } }}
                prefix={<FileTextOutlined />}
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
                title={<span style={{ fontSize: 11, color: "#389e0d" }}>Paid</span>}
                value={summaryStats.paid}
                styles={{ content: { fontSize: 18, color: "#389e0d" } }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small" style={{ background: "linear-gradient(135deg, #fff1f0 0%, #ffa39e 100%)", border: "none" }}>
              <Statistic
                title={<span style={{ fontSize: 11, color: "#cf1322" }}>Overdue</span>}
                value={summaryStats.overdue}
                styles={{ content: { fontSize: 18, color: "#cf1322" } }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small" style={{ background: "linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%)", border: "none" }}>
              <Statistic
                title={<span style={{ fontSize: 11, color: "#722ed1" }}>Total Value</span>}
                value={summaryStats.totalAmount}
                styles={{ content: { fontSize: 18, color: "#722ed1" } }}
                prefix="$"
                precision={0}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small" style={{ background: "linear-gradient(135deg, #e6fffb 0%, #87e8de 100%)", border: "none" }}>
              <Statistic
                title={<span style={{ fontSize: 11, color: "#08979c" }}>Outstanding</span>}
                value={summaryStats.pendingAmount}
                styles={{ content: { fontSize: 18, color: "#08979c" } }}
                prefix="$"
                precision={0}
              />
            </Card>
          </Col>
        </Row>
        {summaryStats.overdue > 0 && (
          <Alert
            title={`${summaryStats.overdue} invoice(s) are overdue and require immediate attention.`}
            type="warning"
            showIcon
            style={{ marginTop: 12 }}
          />
        )}
      </div>
    ),
    [summaryStats]
  );

  // Handlers
  const handleAdd = useCallback(() => {
    setCurrentInvoice(null);
    setDrawerMode("create");
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback(
    (record: Invoice) => {
      setCurrentInvoice(record);
      setDrawerMode("edit");
      form.setFieldsValue({
        ...record,
        invoiceDate: record.invoiceDate ? dayjs(record.invoiceDate) : undefined,
        dueDate: record.dueDate ? dayjs(record.dueDate) : undefined,
      });
      setDrawerOpen(true);
    },
    [form]
  );

  const handleView = useCallback((record: Invoice) => {
    setCurrentInvoice(record);
    setDocumentViewerOpen(true);
  }, []);

  const handleDelete = useCallback(
    (record: Invoice) => {
      Modal.confirm({
        title: "Delete Invoice",
        content: `Are you sure you want to delete "${record.invoiceNumber}"? This action cannot be undone.`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          await deleteInvoice.mutateAsync(record.id);
        },
      });
    },
    [deleteInvoice]
  );

  const handleBulkDelete = useCallback(
    async (records: Invoice[]) => {
      Modal.confirm({
        title: "Delete Selected Invoices",
        content: `Are you sure you want to delete ${records.length} invoices? This action cannot be undone.`,
        okText: "Delete All",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          for (const record of records) {
            await deleteInvoice.mutateAsync(record.id);
          }
        },
      });
    },
    [deleteInvoice]
  );

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      const data: CreateInvoiceDto = {
        invoiceNumber: values.invoiceNumber as string,
        invoiceDate: (values.invoiceDate as dayjs.Dayjs).format("YYYY-MM-DD"),
        vendorId: values.vendorId as string,
        poId: values.poId as string | undefined,
        grnId: values.grnId as string | undefined,
        amount: values.amount as number,
        dueDate: (values.dueDate as dayjs.Dayjs).format("YYYY-MM-DD"),
        status: values.status as 'Pending' | 'Paid' | 'Overdue' | 'Cancelled' | undefined,
      };

      if (drawerMode === "create") {
        await createInvoice.mutateAsync(data);
      } else if (drawerMode === "edit" && currentInvoice) {
        await updateInvoice.mutateAsync({ id: currentInvoice.id, data });
      }

      setDrawerOpen(false);
      form.resetFields();
    },
    [createInvoice, updateInvoice, drawerMode, currentInvoice, form]
  );

  // Document viewer sections
  const documentSections = useMemo(() => {
    if (!currentInvoice) return [];

    const vendor = vendors.find((v) => v.id === currentInvoice.vendorId);
    const po = purchaseOrders.find((p) => p.id === currentInvoice.poId);
    const grn = grns.find((g) => g.id === currentInvoice.grnId);

    return [
      {
        title: "Invoice Details",
        items: [
          { label: "Invoice Number", value: <Text strong style={{ fontSize: 16 }}>{currentInvoice.invoiceNumber}</Text> },
          { label: "Status", value: <Tag color={statusColors[currentInvoice.status || ""] || "default"} style={{ fontSize: 13 }}>{currentInvoice.status}</Tag> },
          { label: "Invoice Date", value: currentInvoice.invoiceDate ? dayjs(currentInvoice.invoiceDate).format("MMMM DD, YYYY") : null },
          { label: "Due Date", value: currentInvoice.dueDate ? dayjs(currentInvoice.dueDate).format("MMMM DD, YYYY") : null },
        ],
      },
      {
        title: "Vendor Information",
        items: [
          { label: "Vendor Name", value: <Text strong>{vendor?.legalName}</Text> },
          { label: "Contact Person", value: vendor?.contactPerson },
          { label: "Contact Number", value: vendor?.contactNumber },
          { label: "Email", value: vendor?.email },
          { label: "Address", value: vendor?.address, span: 2 },
        ],
      },
      {
        title: "Reference Documents",
        items: [
          { label: "Purchase Order", value: po?.poNumber },
          { label: "GRN Reference", value: grn?.grnNumber },
        ],
      },
      {
        title: "Financial Summary",
        items: [
          { label: "Invoice Amount", value: currentInvoice.amount != null ? <Text strong style={{ color: "#52c41a", fontSize: 20 }}>${currentInvoice.amount.toLocaleString()}</Text> : null },
        ],
      },
      {
        title: "Audit Trail",
        items: [
          { label: "Created At", value: currentInvoice.createdAt ? dayjs(currentInvoice.createdAt).format("MMMM DD, YYYY HH:mm") : null },
          { label: "Last Updated", value: currentInvoice.updatedAt ? dayjs(currentInvoice.updatedAt).format("MMMM DD, YYYY HH:mm") : null },
        ],
      },
    ];
  }, [currentInvoice, vendors, purchaseOrders, grns]);

  // Prepare form initial values with proper date objects
  const formInitialValues = useMemo(() => {
    if (!currentInvoice) {
      return {
        status: "Pending",
        invoiceDate: dayjs(),
      };
    };
    
    return {
      ...currentInvoice,
      invoiceDate: currentInvoice.invoiceDate ? dayjs(currentInvoice.invoiceDate) : undefined,
      dueDate: currentInvoice.dueDate ? dayjs(currentInvoice.dueDate) : undefined,
    };
  }, [currentInvoice]);

  // Handle draft data loading
  const onDraftLoaded = useCallback((data: Record<string, unknown>) => {
    return {
      ...data,
      invoiceDate: data.invoiceDate ? dayjs(data.invoiceDate as string) : undefined,
      dueDate: data.dueDate ? dayjs(data.dueDate as string) : undefined,
    };
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <EnterpriseDataTable<Invoice>
        title="Vendor Invoices"
        subtitle="Manage invoices received from vendors"
        tableKey="vendor-invoices"
        columns={columns}
        data={invoices}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        exportFileName="vendor_invoices"
        showSelection
        showActions
        summary={summaryComponent}
      />

      {/* Create/Edit Drawer */}
      <FormDrawer
        title="Vendor Invoice"
        formKey="vendor-invoice"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        onDelete={drawerMode === "edit" && currentInvoice ? () => handleDelete(currentInvoice) : undefined}
        loading={createInvoice.isPending || updateInvoice.isPending}
        mode={drawerMode}
        width={600}
        form={form}
        initialValues={formInitialValues}
        entityId={currentInvoice?.id}
        onDraftLoaded={onDraftLoaded}
      >
        <Divider titlePlacement="left" style={{ fontSize: 13 }}>
          <FileTextOutlined /> Invoice Details
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="invoiceNumber"
              label="Invoice Number"
              tooltip="Vendor invoice reference number. Leave blank to auto-generate."
            >
              <Input placeholder="Auto-generated if blank" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label="Status">
              <Select placeholder="Select status">
                <Option value="Pending">Pending</Option>
                <Option value="Paid">Paid</Option>
                <Option value="Overdue">Overdue</Option>
                <Option value="Cancelled">Cancelled</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="invoiceDate"
              label="Invoice Date"
              rules={[{ required: true, message: "Required" }]}
              tooltip="Date on vendor invoice"
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dueDate"
              label="Due Date"
              rules={[{ required: true, message: "Required" }]}
              tooltip="Payment due date"
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left" style={{ fontSize: 13 }}>
          <ShopOutlined /> Vendor & References
        </Divider>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="vendorId"
              label="Vendor"
              rules={[{ required: true, message: "Please select a vendor" }]}
            >
              <Select
                placeholder="Select vendor"
                showSearch
                optionFilterProp="label"
                options={vendors.map((v) => ({
                  label: v.legalName,
                  value: v.id,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="poId"
              label="Purchase Order"
              tooltip="Optional - Link to a purchase order"
            >
              <Select
                placeholder="Select PO (optional)"
                allowClear
                showSearch
                optionFilterProp="label"
                options={purchaseOrders.map((p) => ({
                  label: p.poNumber,
                  value: p.id,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="grnId"
              label="Goods Receipt Note"
              tooltip="Optional - Link to a GRN"
            >
              <Select
                placeholder="Select GRN (optional)"
                allowClear
                showSearch
                optionFilterProp="label"
                options={grns.map((g) => ({
                  label: g.grnNumber,
                  value: g.id,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left" style={{ fontSize: 13 }}>
          <DollarOutlined /> Amount
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="amount"
              label="Invoice Amount"
              rules={[{ required: true, message: "Please enter invoice amount" }]}
              tooltip="Total invoice amount"
            >
              <InputNumber
                style={{ width: "100%" }}
                prefix="$"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) =>
                  (Number(value?.replace(/\$\s?|(,*)/g, "")) || 0) as 0
                }
                placeholder="0.00"
                min={0}
              />
            </Form.Item>
          </Col>
        </Row>
      </FormDrawer>

      {/* Document Viewer */}
      {currentInvoice && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Vendor Invoice"
          documentNumber={currentInvoice.invoiceNumber}
          documentDate={
            currentInvoice.invoiceDate
              ? dayjs(currentInvoice.invoiceDate).format("MMMM DD, YYYY")
              : undefined
          }
          status={
            currentInvoice.status
              ? {
                  text: currentInvoice.status,
                  color: statusColors[currentInvoice.status] || "default",
                }
              : undefined
          }
          sections={documentSections}
          signatures={[
            { title: "Verified By" },
            { title: "Approved By" },
            { title: "Finance Manager" },
          ]}
          fileName="vendor_invoice"
        />
      )}
    </div>
  );
}
