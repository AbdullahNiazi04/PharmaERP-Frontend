"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Form,
  Input,
  Select,
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
  InputNumber,
  Switch,
} from "antd";
import {
  InboxOutlined,
  ShopOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer } from "@/components/common";
import {
  useGoodsReceiptNotes,
  useCreateGoodsReceiptNote,
  useUpdateGoodsReceiptNote,
  useDeleteGoodsReceiptNote,
  usePurchaseOrders,
  useAvailablePurchaseOrdersForGRN,
  useVendors,
  useUpdateGRNStatus,
} from "@/hooks/useProcurement";
import { GoodsReceiptNote, CreateGoodsReceiptNoteDto, GoodsReceiptItem, purchaseOrdersApi, goodsReceiptNotesApi } from "@/lib/services";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;
const { Text } = Typography;

// Status color mapping
const statusColors: Record<string, string> = {
  Draft: "default",
  Pending: "orange",
  Approved: "success",
  Rejected: "error",
};

export default function GoodsReceiptNotesPage() {
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentGRN, setCurrentGRN] = useState<GoodsReceiptNote | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [items, setItems] = useState<(GoodsReceiptItem & { key: string })[]>([]);

  // API Hooks
  const { data: grns = [], isLoading, refetch } = useGoodsReceiptNotes();
  const { data: purchaseOrders = [] } = usePurchaseOrders();
  const { data: availablePurchaseOrders = [] } = useAvailablePurchaseOrdersForGRN();
  const { data: vendors = [] } = useVendors();
  const createGRN = useCreateGoodsReceiptNote();
  const updateGRN = useUpdateGoodsReceiptNote();
  const deleteGRN = useDeleteGoodsReceiptNote();
  const updateGRNStatus = useUpdateGRNStatus();

  // Get PO number
  const getPONumber = useCallback((poId: string) => {
    const po = purchaseOrders.find(p => p.id === poId);
    return po?.poNumber || poId || "-";
  }, [purchaseOrders]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = grns.length;
    const qcRequired = grns.filter(g => g.qcRequired === true).length;
    const stockPosted = grns.filter(g => g.stockPosted === true).length;

    return { total, qcRequired, stockPosted };
  }, [grns]);

  // Table columns
  const columns: ColumnsType<GoodsReceiptNote> = useMemo(
    () => [
      {
        title: "GRN Number",
        dataIndex: "grnNumber",
        key: "grnNumber",
        width: 150,
        fixed: "left",
        render: (text: string) => (
          <Text strong style={{ color: "#1890ff" }}>
            {text}
          </Text>
        ),
      },
      {
        title: "QC Required",
        dataIndex: "qcRequired",
        key: "qcRequired",
        width: 130,
        render: (qcRequired: boolean) => (
          qcRequired 
            ? <Tag color="orange">Pending QC</Tag>
            : <Tag color="default">No</Tag>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 140,
        render: (status: string, record: GoodsReceiptNote) => (
          <Select
            value={status || "Draft"}
            size="small"
            style={{ width: 120 }}
            onChange={(value) => {
              updateGRNStatus.mutate({ id: record.id, data: { status: value } });
            }}
            options={[
              { label: <Tag color="default">Draft</Tag>, value: "Draft" },
              { label: <Tag color="processing">Submitted</Tag>, value: "Submitted" },
              { label: <Tag color="success">Approved</Tag>, value: "Approved" },
            ]}
          />
        ),
      },
      {
        title: "QC Status",
        dataIndex: "qcStatus",
        key: "qcStatus",
        width: 140,
        render: (qcStatus: string, record: GoodsReceiptNote) => {
          if (!record.qcRequired) return <Tag>N/A</Tag>;
          return (
            <Select
              value={qcStatus || "Pending"}
              size="small"
              style={{ width: 120 }}
              onChange={(value) => {
                updateGRNStatus.mutate({ id: record.id, data: { qcStatus: value } });
              }}
              options={[
                { label: <Tag color="orange">Pending</Tag>, value: "Pending" },
                { label: <Tag color="success">Passed</Tag>, value: "Passed" },
                { label: <Tag color="error">Failed</Tag>, value: "Failed" },
                { label: <Tag color="default">Skipped</Tag>, value: "Skipped" },
              ]}
            />
          );
        },
      },
      {
        title: "Purchase Order",
        dataIndex: "poId",
        key: "poId",
        width: 140,
        render: (poId: string) => getPONumber(poId),
      },
      {
        title: "GRN Date",
        dataIndex: "grnDate",
        key: "grnDate",
        width: 130,
        render: (date: string) =>
          date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
      {
        title: "Received By",
        dataIndex: "receivedBy",
        key: "receivedBy",
        width: 150,
      },
      {
        title: "Warehouse",
        dataIndex: "warehouseLocation",
        key: "warehouseLocation",
        width: 150,
      },
      {
        title: "Stock Posted",
        dataIndex: "stockPosted",
        key: "stockPosted",
        width: 100,
        render: (val: boolean) => val ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>,
      },
      {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 150,
        render: (date: string) =>
          date ? dayjs(date).format("MMM DD, YYYY HH:mm") : "-",
      },
    ],
    [getPONumber]
  );

  // Summary component
  const summaryComponent = useMemo(
    () => (
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={8}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: "#0958d9" }}>Total GRNs</span>}
              value={summaryStats.total}
              styles={{ content: { fontSize: 20, color: "#0958d9" } }}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: "#d46b08" }}>Pending QC</span>}
              value={summaryStats.qcRequired}
              styles={{ content: { fontSize: 20, color: "#d46b08" } }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 12, color: "#389e0d" }}>Stock Posted</span>}
              value={summaryStats.stockPosted}
              styles={{ content: { fontSize: 20, color: "#389e0d" } }}
              prefix={<CheckCircleOutlined />}
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
        itemName: "",
        orderedQty: 0,
        receivedQty: 0,
        rejectedQty: 0,
        batchNumber: "",
        storageCondition: "",
      }
    ]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback((index: number, field: keyof GoodsReceiptItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  }, []);

  // Handlers
  // Form initial values
  const formInitialValues = useMemo(() => {
    if (drawerMode === "create") {
      return {
        // grnNumber: Left blank for auto-generation
        grnDate: dayjs(),
        qcRequired: true, // Default to requiring QC
      };
    }

    if (currentGRN) {
      return {
        ...currentGRN,
        grnDate: currentGRN.grnDate ? dayjs(currentGRN.grnDate) : undefined,
      };
    }
    
    return undefined;
  }, [drawerMode, currentGRN]);

  // Handlers
  const handleAdd = useCallback(() => {
    setCurrentGRN(null);
    setDrawerMode("create");
    setItems([{ key: `init-${Date.now()}`, itemCode: "", itemName: "", orderedQty: 0, receivedQty: 0, rejectedQty: 0, batchNumber: "", storageCondition: "" }]);
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback(
    async (record: GoodsReceiptNote) => {
      try {
        // Fetch full GRN with items from API to ensure items are loaded
        const fullGRN = await goodsReceiptNotesApi.getById(record.id);
        setCurrentGRN(fullGRN);
        setDrawerMode("edit");
        setItems(fullGRN.items?.map((item, idx) => ({ ...item, key: item.id || `edit-${idx}-${Date.now()}` })) || []);
        setDrawerOpen(true);
      } catch (error) {
        console.error("Failed to fetch GRN details", error);
        modal.error({ title: "Error", content: "Failed to load GRN details for editing" });
      }
    },
    [modal]
  );

  const handleView = useCallback(async (record: GoodsReceiptNote) => {
    try {
      const fullGRN = await goodsReceiptNotesApi.getById(record.id);
      setCurrentGRN(fullGRN);
      setDocumentViewerOpen(true);
    } catch (error) {
      console.error("Failed to fetch GRN details", error);
      modal.error({ title: "Error", content: "Failed to load GRN details" });
    }
  }, [modal]);

  const handleDelete = useCallback(
    (record: GoodsReceiptNote) => {
      modal.confirm({
        title: "Delete Goods Receipt Note",
        content: `Are you sure you want to delete "${record.grnNumber}"? This action cannot be undone.`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          await deleteGRN.mutateAsync(record.id);
        },
      });
    },
    [deleteGRN, modal]
  );

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      // Validate items
      if (items.length === 0 || !items.some(item => item.receivedQty > 0)) {
        modal.error({
          title: "Validation Error",
          content: "Please add at least one item with received quantity.",
        });
        return;
      }

      const data: CreateGoodsReceiptNoteDto = {
        grnNumber: values.grnNumber as string,
        grnDate: (values.grnDate as dayjs.Dayjs).format("YYYY-MM-DD"),
        poId: values.poId as string,
        warehouseLocation: values.warehouseLocation as string | undefined,
        receivedBy: values.receivedBy as string,
        qcRequired: values.qcRequired as boolean | undefined,
        qcRemarks: values.qcRemarks as string | undefined,
        stockPosted: values.stockPosted as boolean | undefined,
        inventoryLocation: values.inventoryLocation as string | undefined,
        items: items
          .filter(item => item.receivedQty > 0)
          .map(({ key, id, ...rest }) => rest), // Strip React key and id before sending
      };

      if (drawerMode === "create") {
        await createGRN.mutateAsync(data);
      } else if (drawerMode === "edit" && currentGRN) {
        await updateGRN.mutateAsync({ id: currentGRN.id, data });
      }

      setDrawerOpen(false);
      form.resetFields();
      setItems([]);
    },
    [createGRN, updateGRN, drawerMode, currentGRN, form, items]
  );

  // Document viewer sections
  const documentSections = useMemo(() => {
    if (!currentGRN) return [];

    const po = purchaseOrders.find((p) => p.id === currentGRN.poId);

    return [
      {
        title: "GRN Details",
        items: [
          { label: "GRN Number", value: <Text strong style={{ fontSize: 16 }}>{currentGRN.grnNumber}</Text> },
          { label: "GRN Date", value: currentGRN.grnDate ? dayjs(currentGRN.grnDate).format("MMMM DD, YYYY") : null },
          { label: "Received By", value: currentGRN.receivedBy },
          { label: "Warehouse", value: currentGRN.warehouseLocation },
        ],
      },
      {
        title: "Quality Control",
        items: [
          { label: "QC Required", value: currentGRN.qcRequired ? <Tag color="orange">Yes - Pending QC</Tag> : <Tag>No</Tag> },
          { label: "QC Remarks", value: currentGRN.qcRemarks, span: 2 },
        ],
      },
      {
        title: "Purchase Order Reference",
        items: [
          { label: "PO Number", value: po?.poNumber },
          { label: "Stock Posted", value: currentGRN.stockPosted ? <Tag color="green">Yes</Tag> : <Tag>No</Tag> },
        ],
      },
      {
        title: "Line Items",
        table: {
          columns: [
            { title: "Code", dataIndex: "itemCode", render: (val: unknown) => String(val || "-") },
            { title: "Name", dataIndex: "itemName", render: (val: unknown) => String(val || "-") },
            { title: "Ordered", dataIndex: "orderedQty", render: (val: unknown) => String(val ?? 0) },
            { title: "Received", dataIndex: "receivedQty", render: (val: unknown) => <Text strong style={{ color: "#52c41a" }}>{String(val ?? 0)}</Text> },
            { title: "Rejected", dataIndex: "rejectedQty", render: (val: unknown) => Number(val) > 0 ? <Text type="danger">{String(val)}</Text> : "0" },
            { title: "Batch #", dataIndex: "batchNumber", render: (val: unknown) => String(val || "-") },
            { title: "Expiry", dataIndex: "expiryDate", render: (val: unknown) => val ? dayjs(val as string).format("DD MMM YYYY") : "-" },
            { title: "Condition", dataIndex: "storageCondition", render: (val: unknown) => String(val || "-") },
          ],
          data: currentGRN.items?.map((item, index) => ({ ...item, key: item.id || index })) || [],
        },
      },
    ];
  }, [currentGRN, purchaseOrders]);

  // Items table columns
  const itemColumns = [
    {
      title: "Item Name *",
      dataIndex: "itemName",
      key: "itemName",
      render: (_: string, __: GoodsReceiptItem, index: number) => (
        <Input
          value={items[index]?.itemName}
          onChange={(e) => updateItem(index, "itemName", e.target.value)}
          placeholder="Item name"
          size="small"
        />
      ),
    },
    {
      title: "Ordered",
      dataIndex: "orderedQty",
      key: "orderedQty",
      width: 90,
      render: (_: number, __: GoodsReceiptItem, index: number) => (
        <InputNumber
          value={items[index]?.orderedQty}
          onChange={(val) => updateItem(index, "orderedQty", val || 0)}
          min={0}
          size="small"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Received *",
      dataIndex: "receivedQty",
      key: "receivedQty",
      width: 90,
      render: (_: number, __: GoodsReceiptItem, index: number) => (
        <InputNumber
          value={items[index]?.receivedQty}
          onChange={(val) => updateItem(index, "receivedQty", val || 0)}
          min={0}
          size="small"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Rejected",
      dataIndex: "rejectedQty",
      key: "rejectedQty",
      width: 90,
      render: (_: number, __: GoodsReceiptItem, index: number) => (
        <InputNumber
          value={items[index]?.rejectedQty}
          onChange={(val) => updateItem(index, "rejectedQty", val || 0)}
          min={0}
          size="small"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Batch #",
      dataIndex: "batchNumber",
      key: "batchNumber",
      width: 100,
      render: (_: string, __: GoodsReceiptItem, index: number) => (
        <Input
          value={items[index]?.batchNumber}
          onChange={(e) => updateItem(index, "batchNumber", e.target.value)}
          placeholder="Batch"
          size="small"
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 40,
      render: (_: unknown, __: GoodsReceiptItem, index: number) => (
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
      <EnterpriseDataTable<GoodsReceiptNote>
        title="Goods Receipt Notes"
        subtitle="Track goods received from vendors against purchase orders"
        tableKey="goods-receipt-notes"
        columns={columns}
        data={grns}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        exportFileName="goods_receipt_notes"
        showSelection
        showActions
        summary={summaryComponent}
      />

      {/* Create/Edit Drawer */}
      <FormDrawer
        title="Goods Receipt Note"
        formKey="goods-receipt-note-v2"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        onDelete={drawerMode === "edit" && currentGRN ? () => handleDelete(currentGRN) : undefined}
        loading={createGRN.isPending || updateGRN.isPending}
        mode={drawerMode}
        width={800}
        form={form}
        initialValues={formInitialValues}
        entityId={currentGRN?.id}
        onDraftLoaded={(data) => ({
          ...data,
          grnDate: data.grnDate && typeof data.grnDate === 'string' 
            ? dayjs(data.grnDate) 
            : data.grnDate
        })}
      >
        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <InboxOutlined /> GRN Details
        </Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="grnNumber"
              label="GRN Number"
            >
              <Input placeholder="Auto-generated if blank" disabled={drawerMode === "edit"} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="grnDate"
              label="GRN Date"
              rules={[{ required: true, message: "Required" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="poId"
              label="Purchase Order"
              rules={[{ required: true, message: "Required" }]}
            >
              <Select
                placeholder="Select PO"
                showSearch
                optionFilterProp="label"
                options={availablePurchaseOrders.map((p) => ({
                  label: `${p.poNumber} - ${vendors.find(v => v.id === p.vendorId)?.legalName || ""}`,
                  value: p.id,
                }))}
                onChange={async (value) => {
                  if (!value) return;
                  try {
                    const poDetails = await purchaseOrdersApi.getById(value);
                    if (poDetails) {
                      // Attempt to pre-fill warehouse/location if available in PO (deliveryLocation)
                      if (poDetails.deliveryLocation) {
                        form.setFieldsValue({ warehouseLocation: poDetails.deliveryLocation });
                      }

                      if (poDetails.items) {
                        const mappedItems = poDetails.items.map((item: any, index: number) => ({
                          key: `po-item-${index}-${Date.now()}`,
                          itemCode: item.itemCode || '',
                          itemName: item.description, // Description in PO is Item Name in GRN
                          orderedQty: item.quantity,
                          receivedQty: item.quantity, // Default to full receipt
                          rejectedQty: 0,
                          batchNumber: "",
                          storageCondition: "",
                        }));
                        setItems(mappedItems);
                      }
                    }
                  } catch (error) {
                    console.error("Failed to fetch PO details", error);
                    modal.error({ title: "Error", content: "Failed to load PO items" });
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="receivedBy"
              label="Received By"
              rules={[{ required: true, message: "Received By is required for audit compliance" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Name of person receiving goods" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="warehouseLocation" label="Warehouse Location">
              <Input placeholder="Warehouse" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="inventoryLocation" label="Inventory Location">
              <Input placeholder="Bin/Rack" />
            </Form.Item>
          </Col>
        </Row>

        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <CheckCircleOutlined /> Quality Control
        </Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="qcRequired" label="QC Required" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="stockPosted" label="Stock Posted" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="qcRemarks" label="QC Remarks">
              <Input.TextArea rows={2} placeholder="Quality control notes" />
            </Form.Item>
          </Col>
        </Row>

        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <ShopOutlined /> Received Items
        </Divider>

        <Table
          dataSource={items}
          columns={itemColumns}
          pagination={false}
          size="small"
          rowKey="key"
          style={{ marginBottom: 16 }}
          scroll={{ x: 600 }}
        />

        <Button type="dashed" onClick={addItem} icon={<PlusOutlined />} style={{ width: "100%" }}>
          Add Item
        </Button>
      </FormDrawer>

      {/* Document Viewer */}
      {currentGRN && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Goods Receipt Note"
          documentNumber={currentGRN.grnNumber}
          documentDate={
            currentGRN.grnDate
              ? dayjs(currentGRN.grnDate).format("MMMM DD, YYYY")
              : undefined
          }
          status={
            currentGRN.qcRequired
              ? {
                  text: "Pending QC",
                  color: "orange",
                }
              : {
                  text: "No QC Required",
                  color: "default",
                }
          }
          sections={documentSections}
          signatures={[
            { title: "Received By", name: currentGRN.receivedBy },
            { title: "QC Verified By" },
            { title: "Store Manager" },
          ]}
          fileName="goods_receipt_note"
        />
      )}
    </div>
  );
}
