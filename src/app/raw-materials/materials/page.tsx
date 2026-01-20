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
} from "antd";
import {
  ExperimentOutlined,
  TagOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer } from "@/components/common";
import {
  useRawMaterials,
  useCreateRawMaterial,
  useUpdateRawMaterial,
  useDeleteRawMaterial,
} from "@/hooks/useRawMaterials";
import { RawMaterial, CreateRawMaterialDto } from "@/lib/services";
import type { ColumnsType } from "antd/es/table";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

// Type color mapping
const typeColors: Record<string, string> = {
  API: "blue",
  Excipient: "purple",
  Packaging: "orange",
};

export default function MaterialMasterPage() {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentMaterial, setCurrentMaterial] = useState<RawMaterial | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  // API Hooks
  const { data: rawMaterials = [], isLoading, refetch } = useRawMaterials();
  const createMaterial = useCreateRawMaterial();
  const updateMaterial = useUpdateRawMaterial();
  const deleteMaterial = useDeleteRawMaterial();

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = rawMaterials.length;
    const apiCount = rawMaterials.filter(m => m.type === "API").length;
    const excipientCount = rawMaterials.filter(m => m.type === "Excipient").length;
    const packagingCount = rawMaterials.filter(m => m.type === "Packaging").length;

    return { total, apiCount, excipientCount, packagingCount };
  }, [rawMaterials]);

  // Table columns
  const columns: ColumnsType<RawMaterial> = useMemo(
    () => [
      {
        title: "Code",
        dataIndex: "code",
        key: "code",
        width: 120,
        fixed: "left",
        render: (text: string) => (
          <Text strong style={{ color: "#1890ff" }}>
            {text}
          </Text>
        ),
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: 220,
        render: (text: string) => <Text strong>{text}</Text>,
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        width: 120,
        render: (type: string) => (
          <Tag color={typeColors[type] || "default"}>
            {type || "N/A"}
          </Tag>
        ),
      },
      {
        title: "Unit of Measure",
        dataIndex: "unitOfMeasure",
        key: "unitOfMeasure",
        width: 130,
      },
      {
        title: "Description",
        dataIndex: "description",
        key: "description",
        width: 250,
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
    []
  );

  // Summary component
  const summaryComponent = useMemo(
    () => (
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#389e0d" }}>Total Materials</span>}
              value={summaryStats.total}
              styles={{ content: { fontSize: 18, color: "#389e0d" } }}
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #e6f4ff 0%, #91caff 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#0958d9" }}>API</span>}
              value={summaryStats.apiCount}
              styles={{ content: { fontSize: 18, color: "#0958d9" } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#722ed1" }}>Excipient</span>}
              value={summaryStats.excipientCount}
              styles={{ content: { fontSize: 18, color: "#722ed1" } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#d46b08" }}>Packaging</span>}
              value={summaryStats.packagingCount}
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
    setCurrentMaterial(null);
    setDrawerMode("create");
    form.resetFields();
    form.setFieldsValue({
      code: `RM-${Date.now().toString().slice(-6)}`,
    });
    setDrawerOpen(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: RawMaterial) => {
      setCurrentMaterial(record);
      setDrawerMode("edit");
      form.setFieldsValue({
        ...record,
      });
      setDrawerOpen(true);
    },
    [form]
  );

  const handleView = useCallback((record: RawMaterial) => {
    setCurrentMaterial(record);
    setDocumentViewerOpen(true);
  }, []);

  const handleDelete = useCallback(
    (record: RawMaterial) => {
      modal.confirm({
        title: "Delete Raw Material",
        content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await deleteMaterial.mutateAsync(record.id);
            message.success("Raw material deleted successfully");
          } catch (error: any) {
             message.error(error.message || "Failed to delete raw material");
          }
        },
      });
    },
    [deleteMaterial, modal, message]
  );

  const handleBulkDelete = useCallback(
    async (records: RawMaterial[]) => {
      modal.confirm({
        title: "Delete Selected Materials",
        content: `Are you sure you want to delete ${records.length} materials? This action cannot be undone.`,
        okText: "Delete All",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            for (const record of records) {
              await deleteMaterial.mutateAsync(record.id);
            }
            message.success("Selected materials deleted successfully");
          } catch (error: any) {
             message.error(error.message || "Failed to delete some materials");
          }
        },
      });
    },
    [deleteMaterial, modal, message]
  );

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      const data = values as CreateRawMaterialDto;

      try {
        if (drawerMode === "create") {
          await createMaterial.mutateAsync(data);
          message.success("Raw material created successfully");
        } else if (drawerMode === "edit" && currentMaterial) {
          await updateMaterial.mutateAsync({ id: currentMaterial.id, data });
           message.success("Raw material updated successfully");
        }

        setDrawerOpen(false);
        form.resetFields();
      } catch (error: any) {
        message.error(error.message || "Failed to save raw material");
      }
    },
    [createMaterial, updateMaterial, drawerMode, currentMaterial, form, message]
  );

  // Document viewer sections
  const documentSections = useMemo(() => {
    if (!currentMaterial) return [];

    return [
      {
        title: "Material Information",
        items: [
          { label: "Material Code", value: <Text strong style={{ fontSize: 16 }}>{currentMaterial.code}</Text> },
          { label: "Material Name", value: <Text strong>{currentMaterial.name}</Text> },
          { label: "Type", value: <Tag color={typeColors[currentMaterial.type || ""] || "default"} style={{ fontSize: 13 }}>{currentMaterial.type}</Tag> },
          { label: "Unit of Measure", value: currentMaterial.unitOfMeasure },
        ],
      },
      {
        title: "Additional Details",
        items: [
          { label: "Description", value: currentMaterial.description, span: 2 },
        ],
      },
      {
        title: "Audit Trail",
        items: [
          { label: "Created At", value: currentMaterial.createdAt ? dayjs(currentMaterial.createdAt).format("MMMM DD, YYYY HH:mm") : null },
          { label: "Last Updated", value: currentMaterial.updatedAt ? dayjs(currentMaterial.updatedAt).format("MMMM DD, YYYY HH:mm") : null },
        ],
      },
    ];
  }, [currentMaterial]);

  return (
    <div style={{ padding: 24 }}>
      <EnterpriseDataTable<RawMaterial>
        title="Raw Material Master"
        subtitle="Define and manage raw material definitions"
        tableKey="raw-materials-master"
        columns={columns}
        data={rawMaterials}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        exportFileName="raw_materials_master"
        showSelection
        showActions
        summary={summaryComponent}
      />

      {/* Create/Edit Drawer */}
      <FormDrawer
        title="Raw Material"
        formKey="raw-material-master"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        onDelete={drawerMode === "edit" && currentMaterial ? () => handleDelete(currentMaterial) : undefined}
        loading={createMaterial.isPending || updateMaterial.isPending}
        mode={drawerMode}
        width={550}
        form={form}
        initialValues={currentMaterial || undefined}
        entityId={currentMaterial?.id}
      >
        <Divider titlePlacement="left" style={{ fontSize: 13 }}>
          <ExperimentOutlined /> Basic Information
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="code"
              label="Material Code"
              rules={[{ required: true, message: "Required" }]}
              tooltip="Unique code for this material"
            >
              <Input placeholder="RM-XXXXXX" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="type"
              label="Material Type"
              rules={[{ required: true, message: "Please select type" }]}
            >
              <Select placeholder="Select type">
                <Option value="API">API (Active Pharmaceutical Ingredient)</Option>
                <Option value="Excipient">Excipient</Option>
                <Option value="Packaging">Packaging</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Material Name"
              rules={[{ required: true, message: "Please enter material name" }]}
            >
              <Input placeholder="Enter material name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="unitOfMeasure"
              label="Unit of Measure"
              rules={[{ required: true, message: "Required" }]}
              tooltip="Standard unit for this material"
            >
              <Select placeholder="Select unit" showSearch>
                <Option value="kg">Kilogram (kg)</Option>
                <Option value="g">Gram (g)</Option>
                <Option value="mg">Milligram (mg)</Option>
                <Option value="L">Liter (L)</Option>
                <Option value="mL">Milliliter (mL)</Option>
                <Option value="pcs">Pieces (pcs)</Option>
                <Option value="rolls">Rolls</Option>
                <Option value="boxes">Boxes</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left" style={{ fontSize: 13 }}>
          <FileTextOutlined /> Description
        </Divider>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="description"
              label="Description"
              tooltip="Optional description for this material"
            >
              <TextArea
                rows={3}
                placeholder="Enter material description..."
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>
      </FormDrawer>

      {/* Document Viewer */}
      {currentMaterial && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Raw Material Master"
          documentNumber={currentMaterial.code}
          documentDate={
            currentMaterial.createdAt
              ? dayjs(currentMaterial.createdAt).format("MMMM DD, YYYY")
              : undefined
          }
          status={{
            text: currentMaterial.type || "N/A",
            color: typeColors[currentMaterial.type || ""] || "default",
          }}
          sections={documentSections}
          signatures={[
            { title: "Prepared By" },
            { title: "Reviewed By" },
            { title: "Approved By" },
          ]}
          fileName="raw_material_master"
        />
      )}
    </div>
  );
}
