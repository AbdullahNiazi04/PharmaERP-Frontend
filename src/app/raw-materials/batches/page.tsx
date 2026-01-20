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
  Alert,
} from "antd";
import {
  AppstoreOutlined,
  ExperimentOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer } from "@/components/common";
import {
  useAllRawMaterialBatches,
  useAddRawMaterialBatch,
  useUpdateRawMaterialBatch,
  useDeleteRawMaterialBatch,
  useRawMaterialInventory,
  useRawMaterials,
} from "@/hooks/useRawMaterials";
import { RawMaterialBatch, CreateRawMaterialBatchDto } from "@/lib/services";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;
const { Text } = Typography;

// QC Status color mapping
const qcStatusColors: Record<string, string> = {
  Quarantine: "orange",
  Approved: "green",
  Rejected: "red",
};

export default function BatchTrackingPage() {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentBatch, setCurrentBatch] = useState<RawMaterialBatch | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  // API Hooks
  const { data: batches = [], isLoading, refetch } = useAllRawMaterialBatches();
  const { data: inventoryConfigs = [] } = useRawMaterialInventory();
  const { data: materials = [] } = useRawMaterials();
  const createBatch = useAddRawMaterialBatch();
  const updateBatch = useUpdateRawMaterialBatch();
  const deleteBatch = useDeleteRawMaterialBatch();

  // Helper to get material name from inventory config
  const getMaterialName = useCallback((inventoryId: string) => {
    const inv = inventoryConfigs.find(i => i.id === inventoryId);
    if (!inv) return "Unknown";
    const mat = materials.find(m => m.id === inv.materialId);
    return mat?.name || "Unknown";
  }, [inventoryConfigs, materials]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = batches.length;
    const quarantine = batches.filter(b => b.qcStatus === "Quarantine").length;
    const approved = batches.filter(b => b.qcStatus === "Approved").length;
    const rejected = batches.filter(b => b.qcStatus === "Rejected").length;
    const totalQty = batches.reduce((sum, b) => sum + (b.quantityAvailable || 0), 0);
    
    // Check for expired batches
    const expired = batches.filter(b => {
      if (!b.expiryDate) return false;
      return dayjs(b.expiryDate).isBefore(dayjs());
    }).length;

    // Check for near-expiry batches (within 30 days)
    const nearExpiry = batches.filter(b => {
      if (!b.expiryDate) return false;
      const expiry = dayjs(b.expiryDate);
      return expiry.isAfter(dayjs()) && expiry.isBefore(dayjs().add(30, 'day'));
    }).length;

    return { total, quarantine, approved, rejected, totalQty, expired, nearExpiry };
  }, [batches]);

  // Table columns
  const columns: ColumnsType<RawMaterialBatch> = useMemo(
    () => [
      {
        title: "Batch #",
        dataIndex: "batchNumber",
        key: "batchNumber",
        width: 140,
        fixed: "left",
        render: (text: string) => (
          <Text strong style={{ color: "#1890ff" }}>
            {text}
          </Text>
        ),
      },
      {
        title: "Material",
        dataIndex: "inventoryId",
        key: "material",
        width: 200,
        render: (inventoryId: string) => getMaterialName(inventoryId),
      },
      {
        title: "QC Status",
        dataIndex: "qcStatus",
        key: "qcStatus",
        width: 120,
        render: (status: string) => (
          <Tag color={qcStatusColors[status] || "default"}>
            {status || "Quarantine"}
          </Tag>
        ),
      },
      {
        title: "Quantity Available",
        dataIndex: "quantityAvailable",
        key: "quantityAvailable",
        width: 150,
        render: (value: number) => (
          <Text strong style={{ color: "#52c41a" }}>
            {value?.toLocaleString() || 0}
          </Text>
        ),
      },
      {
        title: "Expiry Date",
        dataIndex: "expiryDate",
        key: "expiryDate",
        width: 130,
        render: (date: string) => {
          if (!date) return "-";
          const expiry = dayjs(date);
          const isExpired = expiry.isBefore(dayjs());
          const isNearExpiry = expiry.isAfter(dayjs()) && expiry.isBefore(dayjs().add(30, 'day'));
          
          return (
            <span style={{ color: isExpired ? "#ff4d4f" : isNearExpiry ? "#faad14" : "inherit" }}>
              {expiry.format("MMM DD, YYYY")}
              {isExpired && <Tag color="red" style={{ marginLeft: 4 }}>Expired</Tag>}
            </span>
          );
        },
      },
      {
        title: "Warehouse Location",
        dataIndex: "warehouseLocation",
        key: "warehouseLocation",
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
    [getMaterialName]
  );

  // Summary component
  const summaryComponent = useMemo(
    () => (
      <div style={{ marginBottom: 8 }}>
        <Row gutter={16}>
          <Col span={4}>
            <Card size="small" style={{ background: "linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%)", border: "none" }}>
              <Statistic
                title={<span style={{ fontSize: 11, color: "#0958d9" }}>Total Batches</span>}
                value={summaryStats.total}
                styles={{ content: { fontSize: 18, color: "#0958d9" } }}
                prefix={<AppstoreOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small" style={{ background: "linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)", border: "none" }}>
              <Statistic
                title={<span style={{ fontSize: 11, color: "#d46b08" }}>Quarantine</span>}
                value={summaryStats.quarantine}
                styles={{ content: { fontSize: 18, color: "#d46b08" } }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
              <Statistic
                title={<span style={{ fontSize: 11, color: "#389e0d" }}>Approved</span>}
                value={summaryStats.approved}
                styles={{ content: { fontSize: 18, color: "#389e0d" } }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small" style={{ background: "linear-gradient(135deg, #fff1f0 0%, #ffa39e 100%)", border: "none" }}>
              <Statistic
                title={<span style={{ fontSize: 11, color: "#cf1322" }}>Rejected</span>}
                value={summaryStats.rejected}
                styles={{ content: { fontSize: 18, color: "#cf1322" } }}
                prefix={<CloseCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small" style={{ background: "linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%)", border: "none" }}>
              <Statistic
                title={<span style={{ fontSize: 11, color: "#722ed1" }}>Total Quantity</span>}
                value={summaryStats.totalQty}
                styles={{ content: { fontSize: 18, color: "#722ed1" } }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card size="small" style={{ background: "linear-gradient(135deg, #fff2e8 0%, #ffbb96 100%)", border: "none" }}>
              <Statistic
                title={<span style={{ fontSize: 11, color: "#d4380d" }}>Near Expiry</span>}
                value={summaryStats.nearExpiry}
                styles={{ content: { fontSize: 18, color: "#d4380d" } }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
        </Row>
        {(summaryStats.expired > 0 || summaryStats.nearExpiry > 0) && (
          <Alert
            message={
              summaryStats.expired > 0
                ? `${summaryStats.expired} batch(es) have expired!`
                : `${summaryStats.nearExpiry} batch(es) expiring soon (within 30 days).`
            }
            type={summaryStats.expired > 0 ? "error" : "warning"}
            showIcon
            style={{ marginTop: 12 }}
          />
        )}
      </div>
    ),
    [summaryStats]
  );

  // Form initial values
  const formInitialValues = useMemo(() => {
    if (drawerMode === "create") {
      return {
        batchNumber: `BATCH-${Date.now().toString().slice(-8)}`,
        qcStatus: "Quarantine",
      };
    }

    if (currentBatch) {
      return {
        ...currentBatch,
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
    (record: RawMaterialBatch) => {
      setCurrentBatch(record);
      setDrawerMode("edit");
      setDrawerOpen(true);
    },
    []
  );

  const handleView = useCallback((record: RawMaterialBatch) => {
    setCurrentBatch(record);
    setDocumentViewerOpen(true);
  }, []);

  const handleDelete = useCallback(
    (record: RawMaterialBatch) => {
      modal.confirm({
        title: "Delete Batch",
        content: `Are you sure you want to delete "${record.batchNumber}"? This action cannot be undone.`,
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
    [deleteBatch, modal, message]
  );

  const handleBulkDelete = useCallback(
    async (records: RawMaterialBatch[]) => {
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
    [deleteBatch, modal, message]
  );

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      const data: CreateRawMaterialBatchDto = {
        ...values,
        expiryDate: values.expiryDate
          ? (values.expiryDate as dayjs.Dayjs).format("YYYY-MM-DD")
          : undefined,
      } as CreateRawMaterialBatchDto;

      try {
        if (drawerMode === "create") {
          await createBatch.mutateAsync(data);
          message.success("Batch added successfully");
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

    const materialName = getMaterialName(currentBatch.inventoryId);

    return [
      {
        title: "Batch Information",
        items: [
          { label: "Batch Number", value: <Text strong style={{ fontSize: 16 }}>{currentBatch.batchNumber}</Text> },
          { label: "QC Status", value: <Tag color={qcStatusColors[currentBatch.qcStatus || ""] || "default"} style={{ fontSize: 13 }}>{currentBatch.qcStatus}</Tag> },
          { label: "Material", value: <Text strong>{materialName}</Text> },
        ],
      },
      {
        title: "Stock Details",
        items: [
          { label: "Quantity Available", value: <Text strong style={{ color: "#52c41a", fontSize: 18 }}>{currentBatch.quantityAvailable?.toLocaleString()}</Text> },
          { label: "Expiry Date", value: currentBatch.expiryDate ? dayjs(currentBatch.expiryDate).format("MMMM DD, YYYY") : "N/A" },
          { label: "Warehouse Location", value: currentBatch.warehouseLocation },
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
  }, [currentBatch, getMaterialName]);

  // Build inventory options with material names
  const inventoryOptions = useMemo(() => {
    return inventoryConfigs.map(inv => {
      const mat = materials.find(m => m.id === inv.materialId);
      return {
        value: inv.id,
        label: mat?.name || `Material ID: ${inv.materialId}`,
      };
    });
  }, [inventoryConfigs, materials]);

  return (
    <div style={{ padding: 24 }}>
      <EnterpriseDataTable<RawMaterialBatch>
        title="Batch Tracking"
        subtitle="Manage raw material batches with QC status and expiry tracking"
        tableKey="raw-material-batches"
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
        exportFileName="raw_material_batches"
        showSelection
        showActions
        summary={summaryComponent}
      />

      {/* Create/Edit Drawer */}
      <FormDrawer
        title="Raw Material Batch"
        formKey="raw-material-batch-v2"
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
          expiryDate: data.expiryDate && typeof data.expiryDate === 'string' ? dayjs(data.expiryDate) : data.expiryDate,
        })}
      >
        <Divider titlePlacement="left" style={{ fontSize: 13 }}>
          <AppstoreOutlined /> Batch Details
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="batchNumber"
              label="Batch Number"
              rules={[{ required: true, message: "Required" }]}
              tooltip="Unique batch identifier"
            >
              <Input placeholder="BATCH-XXXXXXXX" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="qcStatus"
              label="QC Status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select placeholder="Select QC status">
                <Option value="Quarantine">Quarantine</Option>
                <Option value="Approved">Approved</Option>
                <Option value="Rejected">Rejected</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="inventoryId"
              label="Material (Inventory Config)"
              rules={[{ required: true, message: "Please select a material" }]}
              tooltip="Select the material this batch belongs to"
            >
              <Select
                placeholder="Select material"
                showSearch
                optionFilterProp="label"
                options={inventoryOptions}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left" style={{ fontSize: 13 }}>
          <ExperimentOutlined /> Stock Information
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="quantityAvailable"
              label="Quantity Available"
              rules={[{ required: true, message: "Please enter quantity" }]}
              tooltip="Current available quantity"
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="0"
                min={0}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="expiryDate"
              label="Expiry Date"
              tooltip="Batch expiration date"
            >
              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left" style={{ fontSize: 13 }}>
          <EnvironmentOutlined /> Location
        </Divider>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="warehouseLocation"
              label="Warehouse Location"
              tooltip="Physical location of this batch"
            >
              <Input placeholder="e.g., Warehouse A, Rack 5, Shelf 3" />
            </Form.Item>
          </Col>
        </Row>
      </FormDrawer>

      {/* Document Viewer */}
      {currentBatch && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Batch Record"
          documentNumber={currentBatch.batchNumber}
          documentDate={
            currentBatch.createdAt
              ? dayjs(currentBatch.createdAt).format("MMMM DD, YYYY")
              : undefined
          }
          status={
            currentBatch.qcStatus
              ? {
                  text: currentBatch.qcStatus,
                  color: qcStatusColors[currentBatch.qcStatus] || "default",
                }
              : undefined
          }
          sections={documentSections}
          signatures={[
            { title: "Received By" },
            { title: "QC Verified By" },
            { title: "Approved By" },
          ]}
          fileName="batch_record"
        />
      )}
    </div>
  );
}
