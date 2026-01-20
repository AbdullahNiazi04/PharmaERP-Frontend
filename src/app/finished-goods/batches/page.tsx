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
  App,
  Typography,
  Card,
  Statistic,
  InputNumber,
  DatePicker,
} from "antd";
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer } from "@/components/common";
import {
  useFinishedGoods,
  useFinishedGoodsBatches,
  useCreateFinishedGoodBatch,
  useUpdateFinishedGoodBatch,
  useDeleteFinishedGoodBatch,
  FinishedGoodBatch,
  CreateFinishedGoodBatchDto,
} from "@/hooks/useFinishedGoods";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;
const { Text } = Typography;

// QC status color mapping
const qcStatusColors: Record<string, string> = {
  Released: "green",
  Hold: "gold",
  Rejected: "red",
};

export default function FinishedGoodsBatchesPage() {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentBatch, setCurrentBatch] = useState<FinishedGoodBatch | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  // API Hooks
  const { data: products = [] } = useFinishedGoods();
  const { data: batches = [], isLoading, refetch } = useFinishedGoodsBatches();
  const createBatch = useCreateFinishedGoodBatch();
  const updateBatch = useUpdateFinishedGoodBatch();
  const deleteBatch = useDeleteFinishedGoodBatch();

  // Product options for select
  const productOptions = useMemo(() => {
    return products.map((p) => ({
      value: p.id,
      label: `${p.itemCode} - ${p.itemName}`,
    }));
  }, [products]);

  // Get product name by ID
  const getProductName = useCallback((itemId: string) => {
    const product = products.find((p) => p.id === itemId);
    return product ? `${product.itemCode} - ${product.itemName}` : itemId;
  }, [products]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = batches.length;
    const releasedCount = batches.filter((b) => b.qcStatus === "Released").length;
    const holdCount = batches.filter((b) => b.qcStatus === "Hold").length;
    const rejectedCount = batches.filter((b) => b.qcStatus === "Rejected").length;
    const totalQuantity = batches.reduce((sum, b) => sum + (b.quantityAvailable || 0), 0);

    // Near expiry (within 90 days)
    const now = new Date();
    const nearExpiryCount = batches.filter((b) => {
      if (!b.expiryDate) return false;
      const expiry = new Date(b.expiryDate);
      const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
    }).length;

    return { total, releasedCount, holdCount, rejectedCount, totalQuantity, nearExpiryCount };
  }, [batches]);

  // Table columns
  const columns: ColumnsType<FinishedGoodBatch> = useMemo(
    () => [
      {
        title: "Batch #",
        dataIndex: "batchNumber",
        key: "batchNumber",
        width: 120,
        fixed: "left",
        render: (text: string) => (
          <Text strong style={{ color: "#722ed1" }}>
            {text}
          </Text>
        ),
      },
      {
        title: "Product",
        dataIndex: "itemId",
        key: "itemId",
        width: 250,
        render: (itemId: string) => <Text>{getProductName(itemId)}</Text>,
      },
      {
        title: "QC Status",
        dataIndex: "qcStatus",
        key: "qcStatus",
        width: 120,
        render: (status: string) => {
          const icon =
            status === "Released" ? <CheckCircleOutlined /> :
            status === "Hold" ? <ClockCircleOutlined /> :
            <CloseCircleOutlined />;
          return (
            <Tag color={qcStatusColors[status] || "default"}>
              {icon} {status}
            </Tag>
          );
        },
      },
      {
        title: "Qty Produced",
        dataIndex: "quantityProduced",
        key: "quantityProduced",
        width: 120,
        render: (qty: number) => qty?.toLocaleString() || "-",
      },
      {
        title: "Qty Available",
        dataIndex: "quantityAvailable",
        key: "quantityAvailable",
        width: 120,
        render: (qty: number) => qty?.toLocaleString() || "-",
      },
      {
        title: "Mfg Date",
        dataIndex: "mfgDate",
        key: "mfgDate",
        width: 120,
        render: (date: string) =>
          date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
      {
        title: "Expiry Date",
        dataIndex: "expiryDate",
        key: "expiryDate",
        width: 130,
        render: (date: string) => {
          if (!date) return "-";
          const expiry = new Date(date);
          const now = new Date();
          const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          
          let color = "default";
          if (daysUntilExpiry <= 0) color = "red";
          else if (daysUntilExpiry <= 90) color = "orange";
          else if (daysUntilExpiry <= 180) color = "gold";
          
          return <Tag color={color}>{dayjs(date).format("MMM DD, YYYY")}</Tag>;
        },
      },
      {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 130,
        render: (date: string) =>
          date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
    ],
    [getProductName]
  );

  // Summary component
  const summaryComponent = useMemo(
    () => (
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#531dab" }}>Total Batches</span>}
              value={summaryStats.total}
              styles={{ content: { fontSize: 18, color: "#531dab" } }}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#d46b08" }}>Hold</span>}
              value={summaryStats.holdCount}
              styles={{ content: { fontSize: 18, color: "#d46b08" } }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#389e0d" }}>Released</span>}
              value={summaryStats.releasedCount}
              styles={{ content: { fontSize: 18, color: "#389e0d" } }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff1f0 0%, #ffa39e 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#cf1322" }}>Rejected</span>}
              value={summaryStats.rejectedCount}
              styles={{ content: { fontSize: 18, color: "#cf1322" } }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #e6f4ff 0%, #91caff 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#0958d9" }}>Total Qty</span>}
              value={summaryStats.totalQuantity}
              styles={{ content: { fontSize: 18, color: "#0958d9" } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fffbe6 0%, #ffe58f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#d48806" }}>Near Expiry</span>}
              value={summaryStats.nearExpiryCount}
              styles={{ content: { fontSize: 18, color: "#d48806" } }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>
    ),
    [summaryStats]
  );

  // Form initial values
  const formInitialValues = useMemo(() => {
    if (drawerMode === "create") {
      return {
        batchNumber: `BT-${Date.now().toString().slice(-8)}`,
        qcStatus: "Hold",
      };
    }

    if (currentBatch) {
      return {
        ...currentBatch,
        mfgDate: currentBatch.mfgDate ? dayjs(currentBatch.mfgDate) : undefined,
        expiryDate: currentBatch.expiryDate ? dayjs(currentBatch.expiryDate) : undefined,
      };
    }
    
    return undefined;
  }, [drawerMode, currentBatch, drawerOpen]);

  // Handlers
  const handleAdd = useCallback(() => {
    setCurrentBatch(null);
    setDrawerMode("create");
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback(
    (record: FinishedGoodBatch) => {
      setCurrentBatch(record);
      setDrawerMode("edit");
      setDrawerOpen(true);
    },
    []
  );

  const handleView = useCallback((record: FinishedGoodBatch) => {
    setCurrentBatch(record);
    setDocumentViewerOpen(true);
  }, []);

  const handleDelete = useCallback(
    (record: FinishedGoodBatch) => {
      modal.confirm({
        title: "Delete Batch",
        content: `Are you sure you want to delete batch "${record.batchNumber}"? This action cannot be undone.`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await deleteBatch.mutateAsync(record.id);
            message.success("Batch deleted successfully");
          } catch (error: any) {
            message.error(error.message || "Failed to delete batch");
          }
        },
      });
    },
    [deleteBatch, modal]
  );

  const handleBulkDelete = useCallback(
    async (records: FinishedGoodBatch[]) => {
      modal.confirm({
        title: "Delete Selected Batches",
        content: `Are you sure you want to delete ${records.length} batches? This action cannot be undone.`,
        okText: "Delete All",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            for (const record of records) {
              await deleteBatch.mutateAsync(record.id);
            }
            message.success("Selected batches deleted successfully");
          } catch (error: any) {
             message.error(error.message || "Failed to delete some batches");
          }
        },
      });
    },
    [deleteBatch, modal]
  );

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      const data: CreateFinishedGoodBatchDto = {
        itemId: values.itemId as string,
        batchNumber: values.batchNumber as string,
        mfgDate: (values.mfgDate as dayjs.Dayjs)?.format("YYYY-MM-DD"),
        expiryDate: (values.expiryDate as dayjs.Dayjs)?.format("YYYY-MM-DD"),
        quantityProduced: values.quantityProduced as number,
        qcStatus: values.qcStatus as "Released" | "Hold" | "Rejected",
        warehouseId: values.warehouseId as string | undefined,
      };

      try {
        if (drawerMode === "create") {
          await createBatch.mutateAsync(data);
          message.success("Batch created successfully");
        } else if (drawerMode === "edit" && currentBatch) {
          await updateBatch.mutateAsync({ id: currentBatch.id, data });
          message.success("Batch updated successfully");
        }
        setDrawerOpen(false);
        form.resetFields();
      } catch (error: any) {
        message.error(error.message || "Failed to save batch");
      }
    },
    [createBatch, updateBatch, drawerMode, currentBatch, form, message]
  );

  // Document viewer sections
  const documentSections = useMemo(() => {
    if (!currentBatch) return [];

    return [
      {
        title: "Batch Information",
        items: [
          { label: "Batch Number", value: <Text strong style={{ fontSize: 16 }}>{currentBatch.batchNumber}</Text> },
          { label: "Product", value: <Text strong>{getProductName(currentBatch.itemId)}</Text> },
          { 
            label: "QC Status", 
            value: (
              <Tag color={qcStatusColors[currentBatch.qcStatus] || "default"} style={{ fontSize: 13 }}>
                {currentBatch.qcStatus === "Released" ? <CheckCircleOutlined /> :
                 currentBatch.qcStatus === "Hold" ? <ClockCircleOutlined /> :
                 <CloseCircleOutlined />} {currentBatch.qcStatus}
              </Tag>
            ) 
          },
        ],
      },
      {
        title: "Quantity & Dates",
        items: [
          { label: "Quantity Produced", value: currentBatch.quantityProduced?.toLocaleString() },
          { label: "Quantity Available", value: currentBatch.quantityAvailable?.toLocaleString() },
          { label: "Manufacturing Date", value: currentBatch.mfgDate ? dayjs(currentBatch.mfgDate).format("MMMM DD, YYYY") : null },
          { label: "Expiry Date", value: currentBatch.expiryDate ? dayjs(currentBatch.expiryDate).format("MMMM DD, YYYY") : null },
        ],
      },
      {
        title: "Audit Trail",
        items: [
          { label: "Created At", value: currentBatch.createdAt ? dayjs(currentBatch.createdAt).format("MMMM DD, YYYY HH:mm") : null },
          { label: "Last Updated", value: currentBatch.updatedAt ? dayjs(currentBatch.updatedAt).format("MMMM DD, YYYY HH:mm") : null },
        ],
      },
    ];
  }, [currentBatch, getProductName]);

  return (
    <div style={{ padding: 24 }}>
      <EnterpriseDataTable<FinishedGoodBatch>
        title="Batch Tracking"
        subtitle="Manage finished goods batches with QC status and expiry tracking"
        tableKey="finished-goods-batches"
        columns={columns}
        data={batches}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        exportFileName="finished_goods_batches"
        showSelection
        showActions
        summary={summaryComponent}
      />

      {/* Create/Edit Drawer */}
      <FormDrawer
        title="Finished Good Batch"
        formKey="finished-goods-batch-v2"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        onDelete={drawerMode === "edit" && currentBatch ? () => handleDelete(currentBatch) : undefined}
        loading={createBatch.isPending || updateBatch.isPending}
        mode={drawerMode}
        width={550}
        form={form}
        initialValues={formInitialValues}
        entityId={currentBatch?.id}
        onDraftLoaded={(data) => ({
          ...data,
          mfgDate: data.mfgDate && typeof data.mfgDate === 'string' ? dayjs(data.mfgDate) : data.mfgDate,
          expiryDate: data.expiryDate && typeof data.expiryDate === 'string' ? dayjs(data.expiryDate) : data.expiryDate,
        })}
      >
        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <AppstoreOutlined /> Batch Information
        </Divider>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="itemId"
              label="Product"
              rules={[{ required: true, message: "Please select a product" }]}
            >
              <Select
                placeholder="Select product"
                options={productOptions}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="batchNumber"
              label="Batch Number"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="BT-XXXXXXXX" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="qcStatus"
              label="QC Status"
              initialValue="Hold"
            >
              <Select>
                <Option value="Hold">Hold</Option>
                <Option value="Released">Released</Option>
                <Option value="Rejected">Rejected</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <CalendarOutlined /> Dates & Quantity
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="mfgDate"
              label="Manufacturing Date"
              rules={[{ required: true, message: "Required" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="expiryDate"
              label="Expiry Date"
              rules={[{ required: true, message: "Required" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="quantityProduced"
              label="Quantity Produced"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} placeholder="Enter quantity produced" />
            </Form.Item>
          </Col>
        </Row>
      </FormDrawer>

      {/* Document Viewer */}
      {currentBatch && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Finished Good Batch"
          documentNumber={currentBatch.batchNumber}
          documentDate={
            currentBatch.createdAt
              ? dayjs(currentBatch.createdAt).format("MMMM DD, YYYY")
              : undefined
          }
          status={{
            text: currentBatch.qcStatus || "Hold",
            color: qcStatusColors[currentBatch.qcStatus] || "gold",
          }}
          sections={documentSections}
          signatures={[
            { title: "Production" },
            { title: "QA/QC" },
            { title: "Approved By" },
          ]}
          fileName="finished_good_batch"
        />
      )}
    </div>
  );
}
