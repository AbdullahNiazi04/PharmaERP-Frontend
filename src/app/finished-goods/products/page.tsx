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
} from "antd";
import {
  MedicineBoxOutlined,
  TagOutlined,
  FileTextOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer } from "@/components/common";
import {
  useFinishedGoods,
  useCreateFinishedGood,
  useUpdateFinishedGood,
  useDeleteFinishedGood,
} from "@/hooks/useFinishedGoods";
import { FinishedGood, CreateFinishedGoodDto } from "@/lib/services";
import type { ColumnsType } from "antd/es/table";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

// Dosage form color mapping
const dosageFormColors: Record<string, string> = {
  Tablet: "blue",
  Capsule: "green",
  Syrup: "gold",
  Injection: "red",
  Cream: "magenta",
  Other: "purple",
};

// Status color mapping
const statusColors: Record<string, string> = {
  Active: "green",
  Inactive: "default",
};

export default function FinishedGoodsProductsPage() {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentProduct, setCurrentProduct] = useState<FinishedGood | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  // API Hooks
  const { data: products = [], isLoading, refetch } = useFinishedGoods();
  const createProduct = useCreateFinishedGood();
  const updateProduct = useUpdateFinishedGood();
  const deleteProduct = useDeleteFinishedGood();

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = products.length;
    const activeCount = products.filter((p) => p.status === "Active").length;
    const tabletCount = products.filter((p) => p.dosageForm === "Tablet").length;
    const capsuleCount = products.filter((p) => p.dosageForm === "Capsule").length;
    const syrupCount = products.filter((p) => p.dosageForm === "Syrup").length;
    const inactiveCount = products.filter((p) => p.status === "Inactive").length;

    return { total, activeCount, tabletCount, capsuleCount, syrupCount, inactiveCount };
  }, [products]);

  // Table columns
  const columns: ColumnsType<FinishedGood> = useMemo(
    () => [
      {
        title: "Item Code",
        dataIndex: "itemCode",
        key: "itemCode",
        width: 120,
        fixed: "left",
        render: (text: string) => (
          <Text strong style={{ color: "#722ed1" }}>
            {text}
          </Text>
        ),
      },
      {
        title: "Product Name",
        dataIndex: "itemName",
        key: "itemName",
        width: 220,
        render: (text: string) => <Text strong>{text}</Text>,
      },
      {
        title: "Dosage Form",
        dataIndex: "dosageForm",
        key: "dosageForm",
        width: 120,
        render: (form: string) => (
          <Tag color={dosageFormColors[form] || "default"}>
            {form || "N/A"}
          </Tag>
        ),
      },
      {
        title: "Strength",
        dataIndex: "strength",
        key: "strength",
        width: 100,
        render: (text: string) => text || "-",
      },
      {
        title: "Pack Size",
        dataIndex: "packSize",
        key: "packSize",
        width: 130,
        render: (text: string) => text || "-",
      },
      {
        title: "MRP",
        dataIndex: "mrp",
        key: "mrp",
        width: 100,
        render: (mrp: number) => (mrp ? `₨ ${Number(mrp).toLocaleString()}` : "-"),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (status: string) => (
          <Tag color={statusColors[status] || "default"}>{status || "Active"}</Tag>
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
    []
  );

  // Summary component
  const summaryComponent = useMemo(
    () => (
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#531dab" }}>Total Products</span>}
              value={summaryStats.total}
              styles={{ content: { fontSize: 18, color: "#531dab" } }}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#389e0d" }}>Active</span>}
              value={summaryStats.activeCount}
              styles={{ content: { fontSize: 18, color: "#389e0d" } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #e6f4ff 0%, #91caff 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#0958d9" }}>Tablets</span>}
              value={summaryStats.tabletCount}
              styles={{ content: { fontSize: 18, color: "#0958d9" } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#389e0d" }}>Capsules</span>}
              value={summaryStats.capsuleCount}
              styles={{ content: { fontSize: 18, color: "#389e0d" } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#d46b08" }}>Syrups</span>}
              value={summaryStats.syrupCount}
              styles={{ content: { fontSize: 18, color: "#d46b08" } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f5f5f5 0%, #d9d9d9 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#595959" }}>Inactive</span>}
              value={summaryStats.inactiveCount}
              styles={{ content: { fontSize: 18, color: "#595959" } }}
            />
          </Card>
        </Col>
      </Row>
    ),
    [summaryStats]
  );

  // Handlers
  const handleAdd = useCallback(() => {
    setCurrentProduct(null);
    setDrawerMode("create");
    form.resetFields();
    form.setFieldsValue({
      itemCode: `FG-${Date.now().toString().slice(-6)}`,
      status: "Active",
    });
    setDrawerOpen(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: FinishedGood) => {
      setCurrentProduct(record);
      setDrawerMode("edit");
      form.setFieldsValue({
        ...record,
      });
      setDrawerOpen(true);
    },
    [form]
  );

  const handleView = useCallback((record: FinishedGood) => {
    setCurrentProduct(record);
    setDocumentViewerOpen(true);
  }, []);

  const handleDelete = useCallback(
    (record: FinishedGood) => {
      modal.confirm({
        title: "Delete Product",
        content: `Are you sure you want to delete "${record.itemName}"? This action cannot be undone.`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await deleteProduct.mutateAsync(record.id);
            message.success("Product deleted successfully");
          } catch (error: any) {
             message.error(error.message || "Failed to delete product");
          }
        },
      });
    },
    [deleteProduct, modal, message]
  );

  const handleBulkDelete = useCallback(
    async (records: FinishedGood[]) => {
      modal.confirm({
        title: "Delete Selected Products",
        content: `Are you sure you want to delete ${records.length} products? This action cannot be undone.`,
        okText: "Delete All",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            for (const record of records) {
              await deleteProduct.mutateAsync(record.id);
            }
            message.success("Selected products deleted successfully");
          } catch (error: any) {
             message.error(error.message || "Failed to delete some products");
          }
        },
      });
    },
    [deleteProduct, modal, message]
  );

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      const data = values as CreateFinishedGoodDto;

      try {
        if (drawerMode === "create") {
          await createProduct.mutateAsync(data);
          message.success("Product created successfully");
        } else if (drawerMode === "edit" && currentProduct) {
          await updateProduct.mutateAsync({ id: currentProduct.id, data });
           message.success("Product updated successfully");
        }

        setDrawerOpen(false);
        form.resetFields();
      } catch (error: any) {
        message.error(error.message || "Failed to save product");
      }
    },
    [createProduct, updateProduct, drawerMode, currentProduct, form, message]
  );

  // Document viewer sections
  const documentSections = useMemo(() => {
    if (!currentProduct) return [];

    return [
      {
        title: "Product Information",
        items: [
          { label: "Item Code", value: <Text strong style={{ fontSize: 16 }}>{currentProduct.itemCode}</Text> },
          { label: "Product Name", value: <Text strong>{currentProduct.itemName}</Text> },
          { label: "Dosage Form", value: <Tag color={dosageFormColors[currentProduct.dosageForm || ""] || "default"} style={{ fontSize: 13 }}>{currentProduct.dosageForm}</Tag> },
          { label: "Strength", value: currentProduct.strength },
        ],
      },
      {
        title: "Packaging & Pricing",
        items: [
          { label: "Pack Size", value: currentProduct.packSize },
          { label: "Shelf Life", value: currentProduct.shelfLife ? `${currentProduct.shelfLife} months` : null },
          { label: "MRP", value: currentProduct.mrp ? `₨ ${Number(currentProduct.mrp).toLocaleString()}` : null },
          { label: "Status", value: <Tag color={statusColors[currentProduct.status || "Active"]}>{currentProduct.status || "Active"}</Tag> },
        ],
      },
      {
        title: "Audit Trail",
        items: [
          { label: "Created At", value: currentProduct.createdAt ? dayjs(currentProduct.createdAt).format("MMMM DD, YYYY HH:mm") : null },
          { label: "Last Updated", value: currentProduct.updatedAt ? dayjs(currentProduct.updatedAt).format("MMMM DD, YYYY HH:mm") : null },
        ],
      },
    ];
  }, [currentProduct]);

  return (
    <div style={{ padding: 24 }}>
      <EnterpriseDataTable<FinishedGood>
        title="Product Master"
        subtitle="Define and manage finished product definitions"
        tableKey="finished-goods-products"
        columns={columns}
        data={products}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        exportFileName="finished_goods_products"
        showSelection
        showActions
        summary={summaryComponent}
      />

      {/* Create/Edit Drawer */}
      <FormDrawer
        title="Finished Product"
        formKey="finished-goods-product"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        onDelete={drawerMode === "edit" && currentProduct ? () => handleDelete(currentProduct) : undefined}
        loading={createProduct.isPending || updateProduct.isPending}
        mode={drawerMode}
        width={550}
        form={form}
        initialValues={currentProduct || undefined}
        entityId={currentProduct?.id}
      >
        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <MedicineBoxOutlined /> Basic Information
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="itemCode"
              label="Item Code"
              rules={[{ required: true, message: "Required" }]}
              tooltip="Unique code for this product"
            >
              <Input placeholder="FG-XXXXXX" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dosageForm"
              label="Dosage Form"
            >
              <Select placeholder="Select dosage form" allowClear>
                <Option value="Tablet">Tablet</Option>
                <Option value="Capsule">Capsule</Option>
                <Option value="Syrup">Syrup</Option>
                <Option value="Injection">Injection</Option>
                <Option value="Cream">Cream</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="itemName"
              label="Product Name"
              rules={[{ required: true, message: "Please enter product name" }]}
            >
              <Input placeholder="Enter product name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="strength"
              label="Strength"
            >
              <Input placeholder="e.g., 500mg" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="packSize"
              label="Pack Size"
            >
              <Input placeholder="e.g., 10 tablets/strip" />
            </Form.Item>
          </Col>
        </Row>

        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <DollarOutlined /> Pricing & Status
        </Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="shelfLife"
              label="Shelf Life (months)"
            >
              <InputNumber min={1} max={120} style={{ width: "100%" }} placeholder="e.g., 24" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="mrp"
              label="MRP (₨)"
            >
              <InputNumber min={0} style={{ width: "100%" }} placeholder="e.g., 150" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="status"
              label="Status"
              initialValue="Active"
            >
              <Select>
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </FormDrawer>

      {/* Document Viewer */}
      {currentProduct && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Finished Good Product"
          documentNumber={currentProduct.itemCode}
          documentDate={
            currentProduct.createdAt
              ? dayjs(currentProduct.createdAt).format("MMMM DD, YYYY")
              : undefined
          }
          status={{
            text: currentProduct.dosageForm || "N/A",
            color: dosageFormColors[currentProduct.dosageForm || ""] || "default",
          }}
          sections={documentSections}
          signatures={[
            { title: "Prepared By" },
            { title: "Reviewed By" },
            { title: "Approved By" },
          ]}
          fileName="finished_good_product"
        />
      )}
    </div>
  );
}
