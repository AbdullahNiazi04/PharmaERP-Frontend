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
  Button,
  Table,
  Switch,
} from "antd";
import {
  ShoppingCartOutlined,
  ShopOutlined,
  DollarOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer } from "@/components/common";
import {
  usePurchaseOrders,
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
  useDeletePurchaseOrder,
  useVendors,
  usePurchaseRequisitions,
} from "@/hooks/useProcurement";
import { PurchaseOrder, CreatePurchaseOrderDto, PurchaseOrderItem, purchaseRequisitionsApi } from "@/lib/services";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;
const { Text } = Typography;

// Status color mapping
const statusColors: Record<string, string> = {
  Draft: "default",
  Submitted: "processing",
  Approved: "success",
  "Partially Received": "orange",
  Completed: "green",
  Cancelled: "red",
};

export default function PurchaseOrdersPage() {
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentPO, setCurrentPO] = useState<PurchaseOrder | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [items, setItems] = useState<(PurchaseOrderItem & { key: string })[]>([]);

  // API Hooks
  const { data: purchaseOrders = [], isLoading, refetch } = usePurchaseOrders();
  const { data: vendors = [] } = useVendors();
  const { data: requisitions = [] } = usePurchaseRequisitions();
  const createPO = useCreatePurchaseOrder();
  const updatePO = useUpdatePurchaseOrder();
  const deletePO = useDeletePurchaseOrder();

  // Vendor lookup
  const getVendorName = useCallback((vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor?.legalName || vendorId || "-";
  }, [vendors]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = purchaseOrders.length;
    const pending = purchaseOrders.filter(po => po.status === "Submitted" || po.status === "Draft").length;
    const completed = purchaseOrders.filter(po => po.status === "Completed").length;
    const totalValue = purchaseOrders.reduce((sum, po) => sum + (Number(po.totalAmount) || 0), 0);

    return { total, pending, completed, totalValue };
  }, [purchaseOrders]);

  // Table columns
  const columns: ColumnsType<PurchaseOrder> = useMemo(
    () => [
      {
        title: "PO Number",
        dataIndex: "poNumber",
        key: "poNumber",
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
        width: 140,
        render: (status: string) => (
          <Tag color={statusColors[status] || "default"}>
            {status || "Draft"}
          </Tag>
        ),
      },
      {
        title: "Vendor",
        dataIndex: "vendorId",
        key: "vendorId",
        width: 180,
        render: (vendorId: string) => getVendorName(vendorId),
      },
      {
        title: "PO Date",
        dataIndex: "poDate",
        key: "poDate",
        width: 120,
        render: (date: string) =>
          date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
      {
        title: "Delivery Date",
        dataIndex: "deliverySchedule",
        key: "deliverySchedule",
        width: 120,
        render: (date: string) =>
          date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
      {
        title: "Payment Terms",
        dataIndex: "paymentTerms",
        key: "paymentTerms",
        width: 120,
      },
      {
        title: "Subtotal",
        dataIndex: "subtotal",
        key: "subtotal",
        width: 120,
        render: (value: number) =>
          value != null ? `₨ ${Number(value).toLocaleString()}` : "-",
      },
      {
        title: "Tax",
        dataIndex: "taxAmount",
        key: "taxAmount",
        width: 100,
        render: (value: number) =>
          value != null ? `₨ ${Number(value).toLocaleString()}` : "-",
      },
      {
        title: "Total",
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 130,
        render: (value: number) => (
          <Text strong style={{ color: "#52c41a" }}>
            {value != null ? `₨ ${Number(value).toLocaleString()}` : "-"}
          </Text>
        ),
      },
    ],
    [getVendorName]
  );

  // Summary component
  const summaryComponent = useMemo(
    () => (
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: "#0958d9" }}>Total Orders</span>}
              value={summaryStats.total}
              styles={{ content: { fontSize: 20, color: "#0958d9" } }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: "#d46b08" }}>Pending</span>}
              value={summaryStats.pending}
              styles={{ content: { fontSize: 20, color: "#d46b08" } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: "#389e0d" }}>Completed</span>}
              value={summaryStats.completed}
              styles={{ content: { fontSize: 20, color: "#389e0d" } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: "#722ed1" }}>Total Value</span>}
              value={summaryStats.totalValue}
              styles={{ content: { fontSize: 20, color: "#722ed1" } }}
              prefix="₨"
              precision={0}
            />
          </Card>
        </Col>
      </Row>
    ),
    [summaryStats]
  );

  // Items management
  const addItem = useCallback(() => {
    setItems(prev => [
      ...prev,
      {
        key: `new-${Date.now()}-${Math.random()}`,
        itemCode: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        taxPercent: 0,
        isBatchRequired: false,
      }
    ]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback((index: number, field: keyof PurchaseOrderItem, value: string | number | boolean) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  }, []);

  // Calculate item totals
  const calculateItemTotal = useCallback((item: PurchaseOrderItem) => {
    const grossAmount = (item.quantity || 0) * (item.unitPrice || 0);
    const discountAmount = grossAmount * ((item.discountPercent || 0) / 100);
    const netAmount = grossAmount - discountAmount;
    const taxAmount = netAmount * ((item.taxPercent || 0) / 100);
    return netAmount + taxAmount;
  }, []);

  const orderTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  }, [items, calculateItemTotal]);

  // Handlers
  // Form initial values
  const formInitialValues = useMemo(() => {
    if (drawerMode === "create") {
      return {
        // poNumber: Left blank for auto-generation
        poDate: dayjs(),
        currency: "PKR",
      };
    }

    if (currentPO) {
      return {
        ...currentPO,
        poDate: currentPO.poDate ? dayjs(currentPO.poDate) : undefined,
        deliverySchedule: currentPO.deliverySchedule ? dayjs(currentPO.deliverySchedule) : undefined,
      };
    }
    
    return undefined;
  }, [drawerMode, currentPO, drawerOpen]);

  // Handlers
  const handleAdd = useCallback(() => {
    setCurrentPO(null);
    setDrawerMode("create");
    setItems([{ key: `init-${Date.now()}`, itemCode: "", description: "", quantity: 1, unitPrice: 0, discountPercent: 0, taxPercent: 0, isBatchRequired: false }]);
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback(
    (record: PurchaseOrder) => {
      setCurrentPO(record);
      setDrawerMode("edit");
      setItems(record.items?.map((item, idx) => ({ ...item, key: item.id || `edit-${idx}-${Date.now()}` })) || []);
      setDrawerOpen(true);
    },
    []
  );

  const handleView = useCallback((record: PurchaseOrder) => {
    setCurrentPO(record);
    setDocumentViewerOpen(true);
  }, []);

  const handleDelete = useCallback(
    (record: PurchaseOrder) => {
      modal.confirm({
        title: "Delete Purchase Order",
        content: `Are you sure you want to delete "${record.poNumber}"? This action cannot be undone.`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          await deletePO.mutateAsync(record.id);
        },
      });
    },
    [deletePO, modal]
  );

  const handleBulkDelete = useCallback(
    async (records: PurchaseOrder[]) => {
      modal.confirm({
        title: "Delete Selected Purchase Orders",
        content: `Are you sure you want to delete ${records.length} purchase orders? This action cannot be undone.`,
        okText: "Delete All",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          for (const record of records) {
            await deletePO.mutateAsync(record.id);
          }
        },
      });
    },
    [deletePO, modal]
  );

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      // Validate items
      if (items.length === 0 || !items.some(item => item.quantity > 0 && item.unitPrice > 0)) {
        modal.error({
          title: "Validation Error",
          content: "Please add at least one item with quantity and unit price.",
        });
        return;
      }

      const data: CreatePurchaseOrderDto = {
        poNumber: values.poNumber as string,
        poDate: (values.poDate as dayjs.Dayjs).format("YYYY-MM-DD"),
        vendorId: values.vendorId as string,
        referencePrId: values.referencePrId as string | undefined,
        currency: values.currency as string | undefined,
        paymentTerms: values.paymentTerms as string | undefined,
        incoterms: values.incoterms as string | undefined,
        deliverySchedule: values.deliverySchedule 
          ? (values.deliverySchedule as dayjs.Dayjs).format("YYYY-MM-DD")
          : undefined,
        deliveryLocation: values.deliveryLocation as string | undefined,
        freightCharges: values.freightCharges as number | undefined,
        insuranceCharges: values.insuranceCharges as number | undefined,
        items: items.filter(item => item.quantity > 0),
      };

      if (drawerMode === "create") {
        await createPO.mutateAsync(data);
      } else if (drawerMode === "edit" && currentPO) {
        await updatePO.mutateAsync({ id: currentPO.id, data });
      }

      setDrawerOpen(false);
      form.resetFields();
      setItems([]);
    },
    [createPO, updatePO, drawerMode, currentPO, form, items]
  );

  // Document viewer sections
  const documentSections = useMemo(() => {
    if (!currentPO) return [];

    const vendor = vendors.find((v) => v.id === currentPO.vendorId);

    return [
      {
        title: "Purchase Order Details",
        items: [
          { label: "PO Number", value: <Text strong style={{ fontSize: 16 }}>{currentPO.poNumber}</Text> },
          { label: "Status", value: <Tag color={statusColors[currentPO.status || ""] || "default"} style={{ fontSize: 13 }}>{currentPO.status}</Tag> },
          { label: "PO Date", value: currentPO.poDate ? dayjs(currentPO.poDate).format("MMMM DD, YYYY") : null },
          { label: "Expected Delivery", value: currentPO.deliverySchedule ? dayjs(currentPO.deliverySchedule).format("MMMM DD, YYYY") : null },
        ],
      },
      {
        title: "Vendor Information",
        items: [
          { label: "Vendor Name", value: <Text strong>{vendor?.legalName}</Text> },
          { label: "Contact Person", value: vendor?.contactPerson },
          { label: "Contact Number", value: vendor?.contactNumber },
          { label: "Email", value: vendor?.email },
        ],
      },
      {
        title: "Financial Summary",
        items: [
          { label: "Subtotal", value: currentPO.subtotal != null ? `₨ ${Number(currentPO.subtotal).toLocaleString()}` : null },
          { label: "Tax Amount", value: currentPO.taxAmount != null ? `₨ ${Number(currentPO.taxAmount).toLocaleString()}` : null },
          { label: "Freight Charges", value: currentPO.freightCharges != null ? `₨ ${Number(currentPO.freightCharges).toLocaleString()}` : null },
          { label: "Total Amount", value: currentPO.totalAmount != null ? <Text strong style={{ color: "#52c41a", fontSize: 18 }}>₨ {Number(currentPO.totalAmount).toLocaleString()}</Text> : null },
        ],
      },
    ];
  }, [currentPO, vendors]);

  // Items table columns
  const itemColumns = [
    {
      title: "Item Code",
      dataIndex: "itemCode",
      key: "itemCode",
      width: 100,
      render: (_: string, __: PurchaseOrderItem, index: number) => (
        <Input
          value={items[index]?.itemCode}
          onChange={(e) => updateItem(index, "itemCode", e.target.value)}
          placeholder="Code"
          size="small"
        />
      ),
    },
    {
      title: "Description *",
      dataIndex: "description",
      key: "description",
      render: (_: string, __: PurchaseOrderItem, index: number) => (
        <Input
          value={items[index]?.description}
          onChange={(e) => updateItem(index, "description", e.target.value)}
          placeholder="Item description"
          size="small"
        />
      ),
    },
    {
      title: "Qty *",
      dataIndex: "quantity",
      key: "quantity",
      width: 80,
      render: (_: number, __: PurchaseOrderItem, index: number) => (
        <InputNumber
          value={items[index]?.quantity}
          onChange={(val) => updateItem(index, "quantity", val || 1)}
          min={1}
          size="small"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Unit Price *",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: 110,
      render: (_: number, __: PurchaseOrderItem, index: number) => (
        <InputNumber
          value={items[index]?.unitPrice}
          onChange={(val) => updateItem(index, "unitPrice", val || 0)}
          min={0}
          size="small"
          style={{ width: "100%" }}
          prefix="₨"
        />
      ),
    },
    {
      title: "Disc %",
      dataIndex: "discountPercent",
      key: "discountPercent",
      width: 70,
      render: (_: number, __: PurchaseOrderItem, index: number) => (
        <InputNumber
          value={items[index]?.discountPercent}
          onChange={(val) => updateItem(index, "discountPercent", val || 0)}
          min={0}
          max={100}
          size="small"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Tax %",
      dataIndex: "taxPercent",
      key: "taxPercent",
      width: 70,
      render: (_: number, __: PurchaseOrderItem, index: number) => (
        <InputNumber
          value={items[index]?.taxPercent}
          onChange={(val) => updateItem(index, "taxPercent", val || 0)}
          min={0}
          max={100}
          size="small"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Total",
      key: "total",
      width: 100,
      render: (_: unknown, __: PurchaseOrderItem, index: number) => (
        <Text strong>₨ {calculateItemTotal(items[index] || {quantity: 0, unitPrice: 0}).toLocaleString()}</Text>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 40,
      render: (_: unknown, __: PurchaseOrderItem, index: number) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeItem(index)}
          disabled={items.length <= 1}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <EnterpriseDataTable<PurchaseOrder>
        title="Purchase Orders"
        subtitle="Manage orders placed with vendors"
        tableKey="purchase-orders"
        columns={columns}
        data={purchaseOrders}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        exportFileName="purchase_orders"
        showSelection
        showActions
        summary={summaryComponent}
      />

      {/* Create/Edit Drawer */}
      <FormDrawer
        title="Purchase Order"
        formKey="purchase-order-v2"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        onDelete={drawerMode === "edit" && currentPO ? () => handleDelete(currentPO) : undefined}
        loading={createPO.isPending || updatePO.isPending}
        mode={drawerMode}
        width={850}
        form={form}
        initialValues={formInitialValues}
        entityId={currentPO?.id}
        onDraftLoaded={(data) => ({
          ...data,
          poDate: data.poDate && typeof data.poDate === 'string' ? dayjs(data.poDate) : data.poDate,
          deliverySchedule: data.deliverySchedule && typeof data.deliverySchedule === 'string' ? dayjs(data.deliverySchedule) : data.deliverySchedule,
        })}
      >
        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <ShoppingCartOutlined /> Order Details
        </Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="poNumber"
              label="PO Number"
            >
              <Input placeholder="Auto-generated if blank" disabled={drawerMode === "edit"} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="poDate"
              label="PO Date"
              rules={[{ required: true, message: "Required" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="deliverySchedule" label="Delivery Date">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <ShopOutlined /> Vendor & Terms
        </Divider>

        <Row gutter={16}>
          <Col span={8}>
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
          <Col span={8}>
            <Form.Item name="referencePrId" label="Linked Requisition">
              <Select
                placeholder="Select requisition (optional)"
                allowClear
                showSearch
                optionFilterProp="label"
                options={requisitions.map((r) => ({
                    label: `${r.reqNumber} (${r.status})`,
                    value: r.id,
                  }))}
                onChange={async (value) => {
                  if (!value) return;
                  try {
                    const prDetails = await purchaseRequisitionsApi.getById(value);
                    if (prDetails && prDetails.items) {
                      const mappedItems = prDetails.items.map((item: any, index: number) => ({
                        key: `pr-item-${index}-${Date.now()}`,
                        itemCode: item.itemCode || '',
                        description: item.itemName,
                        quantity: item.quantity,
                        unitPrice: Number(item.estimatedUnitCost) || 0,
                        discountPercent: 0,
                        taxPercent: 0,
                        isBatchRequired: false,
                      }));
                      setItems(mappedItems);
                      
                      // Also auto-fill other fields if empty
                      if (prDetails.department && !form.getFieldValue('department')) {
                         // Add logic if PO had department field, currently it doesn't, but we can infer others?
                      }
                    }
                  } catch (error) {
                    console.error("Failed to fetch PR details", error);
                    modal.error({ title: "Error", content: "Failed to load PR items" });
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="currency" label="Currency">
              <Select placeholder="Select currency">
                <Option value="PKR">PKR</Option>
                <Option value="USD">USD</Option>
                <Option value="EUR">EUR</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="paymentTerms" label="Payment Terms">
              <Select placeholder="Select terms">
                <Option value="Net-30">Net-30</Option>
                <Option value="Net-60">Net-60</Option>
                <Option value="Advance">Advance</Option>
                <Option value="COD">Cash on Delivery</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="incoterms" label="Incoterms">
              <Select placeholder="Select incoterms" allowClear>
                <Option value="EXW">EXW - Ex Works</Option>
                <Option value="FOB">FOB - Free on Board</Option>
                <Option value="CIF">CIF - Cost, Insurance, Freight</Option>
                <Option value="DDP">DDP - Delivered Duty Paid</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="deliveryLocation" label="Delivery Location">
              <Input placeholder="Warehouse address" />
            </Form.Item>
          </Col>
        </Row>

        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <DollarOutlined /> Order Items
        </Divider>

        <Table
          dataSource={items}
          columns={itemColumns}
          pagination={false}
          size="small"
          rowKey="key"
          style={{ marginBottom: 16 }}
          scroll={{ x: 700 }}
        />

        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Button type="dashed" onClick={addItem} icon={<PlusOutlined />}>
              Add Item
            </Button>
          </Col>
          <Col>
            <Text style={{ fontSize: 16 }}>
              Order Total: <Text strong style={{ color: "#52c41a", fontSize: 18 }}>₨ {orderTotal.toLocaleString()}</Text>
            </Text>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="freightCharges" label="Freight Charges">
              <InputNumber
                style={{ width: "100%" }}
                prefix="₨"
                placeholder="0"
                min={0}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="insuranceCharges" label="Insurance Charges">
              <InputNumber
                style={{ width: "100%" }}
                prefix="₨"
                placeholder="0"
                min={0}
              />
            </Form.Item>
          </Col>
        </Row>
      </FormDrawer>

      {/* Document Viewer */}
      {currentPO && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Purchase Order"
          documentNumber={currentPO.poNumber}
          documentDate={
            currentPO.poDate
              ? dayjs(currentPO.poDate).format("MMMM DD, YYYY")
              : undefined
          }
          status={
            currentPO.status
              ? {
                  text: currentPO.status,
                  color: statusColors[currentPO.status] || "default",
                }
              : undefined
          }
          sections={documentSections}
          signatures={[
            { title: "Prepared By" },
            { title: "Approved By" },
            { title: "Vendor Acknowledgment" },
          ]}
          fileName="purchase_order"
        />
      )}
    </div>
  );
}
