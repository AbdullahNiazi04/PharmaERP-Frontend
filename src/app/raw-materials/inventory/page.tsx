"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
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
  DatabaseOutlined,
  ExperimentOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer } from "@/components/common";
import {
  useRawMaterialInventory,
  useCreateRawMaterialInventory,
  useUpdateRawMaterialInventory,
  useDeleteRawMaterialInventory,
  useRawMaterials,
} from "@/hooks/useRawMaterials";
import { RawMaterialInventory, CreateRawMaterialInventoryDto } from "@/lib/services";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;
const { Text } = Typography;

// Status color mapping
const statusColors: Record<string, string> = {
  Active: "green",
  Inactive: "default",
};

export default function InventoryPage() {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentInventory, setCurrentInventory] = useState<RawMaterialInventory | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  // API Hooks
  const { data: inventoryConfigs = [], isLoading, refetch } = useRawMaterialInventory();
  const { data: materials = [] } = useRawMaterials();
  const createInventory = useCreateRawMaterialInventory();
  const updateInventory = useUpdateRawMaterialInventory();
  const deleteInventory = useDeleteRawMaterialInventory();

  // Helper to get material info
  const getMaterial = useCallback((materialId: string) => {
    return materials.find(m => m.id === materialId);
  }, [materials]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = inventoryConfigs.length;
    const active = inventoryConfigs.filter(i => i.status === "Active").length;
    const inactive = inventoryConfigs.filter(i => i.status === "Inactive").length;
    const withReorderLevel = inventoryConfigs.filter(i => i.reorderLevel && i.reorderLevel > 0).length;

    return { total, active, inactive, withReorderLevel };
  }, [inventoryConfigs]);

  // Table columns
  const columns: ColumnsType<RawMaterialInventory> = useMemo(
    () => [
      {
        title: "Material",
        dataIndex: "materialId",
        key: "material",
        width: 220,
        fixed: "left",
        render: (materialId: string) => {
          const mat = getMaterial(materialId);
          return (
            <div>
              <Text strong>{mat?.name || "Unknown"}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 11 }}>{mat?.code}</Text>
            </div>
          );
        },
      },
      {
        title: "Type",
        dataIndex: "materialId",
        key: "type",
        width: 120,
        render: (materialId: string) => {
          const mat = getMaterial(materialId);
          const typeColors: Record<string, string> = {
            API: "blue",
            Excipient: "purple",
            Packaging: "orange",
          };
          return (
            <Tag color={typeColors[mat?.type || ""] || "default"}>
              {mat?.type || "N/A"}
            </Tag>
          );
        },
      },
      {
        title: "Storage Condition",
        dataIndex: "storageCondition",
        key: "storageCondition",
        width: 150,
        ellipsis: true,
      },
      {
        title: "Reorder Level",
        dataIndex: "reorderLevel",
        key: "reorderLevel",
        width: 120,
        render: (value: number) => (
          <Text type={value ? undefined : "secondary"}>
            {value || "Not set"}
          </Text>
        ),
      },
      {
        title: "Safety Stock",
        dataIndex: "safetyStock",
        key: "safetyStock",
        width: 120,
        render: (value: number) => (
          <Text type={value ? undefined : "secondary"}>
            {value || "Not set"}
          </Text>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (status: string) => (
          <Tag color={statusColors[status] || "default"}>
            {status || "Active"}
          </Tag>
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
    [getMaterial]
  );

  // Summary component
  const summaryComponent = useMemo(
    () => (
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#0958d9" }}>Total Configs</span>}
              value={summaryStats.total}
              styles={{ content: { fontSize: 18, color: "#0958d9" } }}
              prefix={<DatabaseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#389e0d" }}>Active</span>}
              value={summaryStats.active}
              styles={{ content: { fontSize: 18, color: "#389e0d" } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#722ed1" }}>With Reorder Level</span>}
              value={summaryStats.withReorderLevel}
              styles={{ content: { fontSize: 18, color: "#722ed1" } }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#d46b08" }}>Inactive</span>}
              value={summaryStats.inactive}
              styles={{ content: { fontSize: 18, color: "#d46b08" } }}
            />
          </Card>
        </Col>
      </Row>
    ),
    [summaryStats]
  );

  // Handlers
  const handleAdd = useCallback(() => {
    setCurrentInventory(null);
    setDrawerMode("create");
    form.resetFields();
    form.setFieldsValue({
      status: "Active",
    });
    setDrawerOpen(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: RawMaterialInventory) => {
      setCurrentInventory(record);
      setDrawerMode("edit");
      form.setFieldsValue({
        ...record,
      });
      setDrawerOpen(true);
    },
    [form]
  );

  const handleView = useCallback((record: RawMaterialInventory) => {
    setCurrentInventory(record);
    setDocumentViewerOpen(true);
  }, []);

  const handleDelete = useCallback(
    (record: RawMaterialInventory) => {
      modal.confirm({
        title: "Delete Inventory Configuration",
        content: `Are you sure you want to delete this inventory configuration? This action cannot be undone.`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await deleteInventory.mutateAsync(record.id);
            message.success("Inventory configuration deleted successfully");
          } catch (error: any) {
             message.error(error.message || "Failed to delete inventory configuration");
          }
        },
      });
    },
    [deleteInventory, modal, message]
  );

  const handleBulkDelete = useCallback(
    async (records: RawMaterialInventory[]) => {
      modal.confirm({
        title: "Delete Selected Configurations",
        content: `Are you sure you want to delete ${records.length} configurations? This action cannot be undone.`,
        okText: "Delete All",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            for (const record of records) {
              await deleteInventory.mutateAsync(record.id);
            }
            message.success("Selected configurations deleted successfully");
          } catch (error: any) {
             message.error(error.message || "Failed to delete some configurations");
          }
        },
      });
    },
    [deleteInventory, modal, message]
  );

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      const data = values as CreateRawMaterialInventoryDto;

      try {
        if (drawerMode === "create") {
          await createInventory.mutateAsync(data);
          message.success("Inventory configuration created successfully");
        } else if (drawerMode === "edit" && currentInventory) {
          await updateInventory.mutateAsync({ id: currentInventory.id, data });
           message.success("Inventory configuration updated successfully");
        }

        setDrawerOpen(false);
        form.resetFields();
      } catch (error: any) {
        message.error(error.message || "Failed to save inventory configuration");
      }
    },
    [createInventory, updateInventory, drawerMode, currentInventory, form, message]
  );

  // Document viewer sections
  const documentSections = useMemo(() => {
    if (!currentInventory) return [];

    const mat = getMaterial(currentInventory.materialId);

    return [
      {
        title: "Material Information",
        items: [
          { label: "Material Name", value: <Text strong style={{ fontSize: 16 }}>{mat?.name}</Text> },
          { label: "Material Code", value: mat?.code },
          { label: "Material Type", value: mat?.type },
          { label: "Unit of Measure", value: mat?.unitOfMeasure },
        ],
      },
      {
        title: "Inventory Settings",
        items: [
          { label: "Storage Condition", value: currentInventory.storageCondition },
          { label: "Reorder Level", value: currentInventory.reorderLevel?.toString() || "Not set" },
          { label: "Safety Stock", value: currentInventory.safetyStock?.toString() || "Not set" },
          { label: "Status", value: <Tag color={statusColors[currentInventory.status || ""] || "default"}>{currentInventory.status}</Tag> },
        ],
      },
      {
        title: "Audit Trail",
        items: [
          { label: "Created At", value: currentInventory.createdAt ? dayjs(currentInventory.createdAt).format("MMMM DD, YYYY HH:mm") : null },
          { label: "Last Updated", value: currentInventory.updatedAt ? dayjs(currentInventory.updatedAt).format("MMMM DD, YYYY HH:mm") : null },
        ],
      },
    ];
  }, [currentInventory, getMaterial]);

  // Build material options (only materials that don't have inventory config yet)
  const materialOptions = useMemo(() => {
    const existingMaterialIds = inventoryConfigs.map(i => i.materialId);
    return materials
      .filter(m => !existingMaterialIds.includes(m.id) || (currentInventory && m.id === currentInventory.materialId))
      .map(m => ({
        value: m.id,
        label: `${m.name} (${m.code})`,
      }));
  }, [materials, inventoryConfigs, currentInventory]);

  return (
    <div style={{ padding: 24 }}>
      <EnterpriseDataTable<RawMaterialInventory>
        title="Inventory Configuration"
        subtitle="Configure inventory settings for raw materials"
        tableKey="raw-material-inventory"
        columns={columns}
        data={inventoryConfigs}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        exportFileName="raw_material_inventory"
        showSelection
        showActions
        summary={summaryComponent}
      />

      {/* Create/Edit Drawer */}
      <FormDrawer
        title="Inventory Configuration"
        formKey="raw-material-inventory"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        onDelete={drawerMode === "edit" && currentInventory ? () => handleDelete(currentInventory) : undefined}
        loading={createInventory.isPending || updateInventory.isPending}
        mode={drawerMode}
        width={550}
        form={form}
        initialValues={currentInventory || undefined}
        entityId={currentInventory?.id}
      >
        <Divider titlePlacement="left" style={{ fontSize: 13 }}>
          <ExperimentOutlined /> Material Selection
        </Divider>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="materialId"
              label="Raw Material"
              rules={[{ required: true, message: "Please select a material" }]}
              tooltip="Select the raw material for this inventory configuration"
            >
              <Select
                placeholder="Select material"
                showSearch
                optionFilterProp="label"
                options={materialOptions}
                disabled={drawerMode === "edit"}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left" style={{ fontSize: 13 }}>
          <DatabaseOutlined /> Inventory Settings
        </Divider>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="storageCondition"
              label="Storage Condition"
              tooltip="Specify storage requirements (e.g., 2-8°C, Room Temperature)"
            >
              <Select placeholder="Select storage condition" allowClear>
                <Option value="Room Temperature">Room Temperature (15-25°C)</Option>
                <Option value="Refrigerated">Refrigerated (2-8°C)</Option>
                <Option value="Frozen">Frozen (-20°C)</Option>
                <Option value="Cool Dry Place">Cool Dry Place</Option>
                <Option value="Protected from Light">Protected from Light</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="reorderLevel"
              label="Reorder Level"
              tooltip="Minimum quantity that triggers reorder alert"
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
              name="safetyStock"
              label="Safety Stock"
              tooltip="Buffer stock to prevent stockout"
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="0"
                min={0}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Status"
            >
              <Select placeholder="Select status">
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </FormDrawer>

      {/* Document Viewer */}
      {currentInventory && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Inventory Configuration"
          documentNumber={getMaterial(currentInventory.materialId)?.code || "N/A"}
          documentDate={
            currentInventory.createdAt
              ? dayjs(currentInventory.createdAt).format("MMMM DD, YYYY")
              : undefined
          }
          status={
            currentInventory.status
              ? {
                  text: currentInventory.status,
                  color: statusColors[currentInventory.status] || "default",
                }
              : undefined
          }
          sections={documentSections}
          signatures={[
            { title: "Configured By" },
            { title: "Reviewed By" },
            { title: "Approved By" },
          ]}
          fileName="inventory_config"
        />
      )}
    </div>
  );
}
