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
  Button,
  Space,
  Table,
  AutoComplete,
} from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer, DynamicSelect } from "@/components/common";
import {
  usePurchaseRequisitions,
  useCreatePurchaseRequisition,
  useUpdatePurchaseRequisition,
  useDeletePurchaseRequisition,
} from "@/hooks/useProcurement";
import { useRawMaterials } from "@/hooks/useRawMaterials";
import { PurchaseRequisition, CreatePurchaseRequisitionDto, PurchaseRequisitionItem, purchaseRequisitionsApi } from "@/lib/services";
import type { ColumnsType } from "antd/es/table";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

// Status color mapping
const statusColors: Record<string, string> = {
  Draft: "default",
  Pending_Approval: "processing",
  Approved: "success",
  Rejected: "error",
  Converted: "purple",
};

// Priority color mapping
const priorityColors: Record<string, string> = {
  Normal: "blue",
  Urgent: "red",
};

export default function PurchaseRequisitionsPage() {
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentRequisition, setCurrentRequisition] = useState<PurchaseRequisition | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [items, setItems] = useState<(PurchaseRequisitionItem & { key: string })[]>([]);

  // API Hooks
  const { data: requisitions = [], isLoading, refetch } = usePurchaseRequisitions();
  const { data: materials = [] } = useRawMaterials();
  const createRequisition = useCreatePurchaseRequisition();
  const updateRequisition = useUpdatePurchaseRequisition();
  const deleteRequisition = useDeletePurchaseRequisition();

  // Table columns
  const columns: ColumnsType<PurchaseRequisition> = useMemo(
    () => [
      {
        title: "Requisition #",
        dataIndex: "reqNumber",
        key: "reqNumber",
        width: 150,
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
        width: 120,
        render: (status: string) => (
          <Tag color={statusColors[status] || "default"}>
            {status || "Draft"}
          </Tag>
        ),
      },
      {
        title: "Priority",
        dataIndex: "priority",
        key: "priority",
        width: 100,
        render: (priority: string) => (
          <Tag color={priorityColors[priority] || "default"}>
            {priority || "Normal"}
          </Tag>
        ),
      },
      {
        title: "Requested By",
        dataIndex: "requestedBy",
        key: "requestedBy",
        width: 150,
      },
      {
        title: "Department",
        dataIndex: "department",
        key: "department",
        width: 130,
      },
      {
        title: "Requisition Date",
        dataIndex: "requisitionDate",
        key: "requisitionDate",
        width: 140,
        render: (date: string) =>
          date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
      {
        title: "Expected Delivery",
        dataIndex: "expectedDeliveryDate",
        key: "expectedDeliveryDate",
        width: 140,
        render: (date: string) =>
          date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
      {
        title: "Total Cost",
        dataIndex: "totalEstimatedCost",
        key: "totalEstimatedCost",
        width: 130,
        render: (value: number) =>
          value ? `₨ ${Number(value).toLocaleString()}` : "-",
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
    []
  );

  // Add item to list
  const addItem = useCallback(() => {
    setItems(prev => [
      ...prev,
      {
        key: `new-${Date.now()}-${Math.random()}`,
        itemName: "",
        itemCode: "",
        category: "",
        uom: "Kg",
        quantity: 1,
        estimatedUnitCost: 0,
        specification: "",
      }
    ]);
  }, []);

  // Remove item from list
  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Update item in list
  const updateItem = useCallback((index: number, field: keyof PurchaseRequisitionItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  }, []);

  // Handlers
  // Form initial values
  const formInitialValues = useMemo(() => {
    if (drawerMode === "create") {
      return {
        reqNumber: `PR-${Date.now().toString().slice(-8)}`,
        requisitionDate: dayjs(),
        priority: "Normal",
      };
    }

    if (currentRequisition) {
      return {
        ...currentRequisition,
        requisitionDate: currentRequisition.requisitionDate ? dayjs(currentRequisition.requisitionDate) : undefined,
        expectedDeliveryDate: currentRequisition.expectedDeliveryDate ? dayjs(currentRequisition.expectedDeliveryDate) : undefined,
      };
    }
    
    return undefined;
  }, [drawerMode, currentRequisition, drawerOpen]);

  // Handlers
  const handleAdd = useCallback(() => {
    setCurrentRequisition(null);
    setDrawerMode("create");
    setItems([{ key: `init-${Date.now()}`, itemName: "", itemCode: "", category: "", uom: "Kg", quantity: 1, estimatedUnitCost: 0, specification: "" }]);
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback(
    (record: PurchaseRequisition) => {
      setCurrentRequisition(record);
      setDrawerMode("edit");
      setItems(record.items?.map((item, idx) => ({ ...item, key: item.id || `edit-${idx}-${Date.now()}` })) || []);
      setDrawerOpen(true);
    },
    []
  );

  const handleView = useCallback(async (record: PurchaseRequisition) => {
    try {
      // Fetch full PR with items from API
      const fullPR = await purchaseRequisitionsApi.getById(record.id);
      setCurrentRequisition(fullPR);
      setDocumentViewerOpen(true);
    } catch (error) {
      console.error("Failed to fetch PR details", error);
      modal.error({ title: "Error", content: "Failed to load requisition details" });
    }
  }, [modal]);

  const handleDelete = useCallback(
    (record: PurchaseRequisition) => {
      modal.confirm({
        title: "Delete Purchase Requisition",
        content: `Are you sure you want to delete "${record.reqNumber}"? This action cannot be undone.`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          await deleteRequisition.mutateAsync(record.id);
        },
      });
    },
    [deleteRequisition, modal]
  );

  const handleBulkDelete = useCallback(
    async (records: PurchaseRequisition[]) => {
      modal.confirm({
        title: "Delete Selected Requisitions",
        content: `Are you sure you want to delete ${records.length} requisitions? This action cannot be undone.`,
        okText: "Delete All",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          for (const record of records) {
            await deleteRequisition.mutateAsync(record.id);
          }
        },
      });
    },
    [deleteRequisition, modal]
  );

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      // Validate items
      if (items.length === 0 || !items.some(item => item.itemName)) {
        modal.error({
          title: "Validation Error",
          content: "Please add at least one item to the requisition.",
        });
        return;
      }

      const data: CreatePurchaseRequisitionDto = {
        reqNumber: values.reqNumber as string,
        requisitionDate: (values.requisitionDate as dayjs.Dayjs).format("YYYY-MM-DD"),
        requestedBy: values.requestedBy as string,
        department: values.department as string | undefined,
        costCenter: values.costCenter as string | undefined,
        priority: values.priority as "Normal" | "Urgent" | undefined,
        expectedDeliveryDate: values.expectedDeliveryDate 
          ? (values.expectedDeliveryDate as dayjs.Dayjs).format("YYYY-MM-DD")
          : undefined,
        budgetReference: values.budgetReference as string | undefined,
        items: items
          .filter(item => item.itemName)
          .map(({ key, id, ...rest }) => rest), // Strip React key and id before sending
      };

      if (drawerMode === "create") {
        await createRequisition.mutateAsync(data);
      } else if (drawerMode === "edit" && currentRequisition) {
        await updateRequisition.mutateAsync({ id: currentRequisition.id, data });
      }

      setDrawerOpen(false);
      form.resetFields();
      setItems([]);
    },
    [createRequisition, updateRequisition, drawerMode, currentRequisition, form, items]
  );

  // Document viewer sections
  const documentSections = useMemo(() => {
    if (!currentRequisition) return [];

    const sections: any[] = [
      {
        title: "Requisition Details",
        items: [
          { label: "Requisition Number", value: <Text strong>{currentRequisition.reqNumber}</Text> },
          { label: "Status", value: <Tag color={statusColors[currentRequisition.status || ""] || "default"}>{currentRequisition.status}</Tag> },
          { label: "Priority", value: <Tag color={priorityColors[currentRequisition.priority || ""] || "default"}>{currentRequisition.priority}</Tag> },
          { label: "Requisition Date", value: currentRequisition.requisitionDate ? dayjs(currentRequisition.requisitionDate).format("MMMM DD, YYYY") : null },
          { label: "Expected Delivery", value: currentRequisition.expectedDeliveryDate ? dayjs(currentRequisition.expectedDeliveryDate).format("MMMM DD, YYYY") : null },
        ],
      },
      {
        title: "Requestor Information",
        items: [
          { label: "Requested By", value: currentRequisition.requestedBy },
          { label: "Department", value: currentRequisition.department },
          { label: "Cost Center", value: currentRequisition.costCenter },
          { label: "Budget Reference", value: currentRequisition.budgetReference },
        ],
      },
      {
        title: "Financial Summary",
        items: [
          { label: "Total Estimated Cost", value: currentRequisition.totalEstimatedCost ? <Text strong style={{ color: "#1890ff", fontSize: 16 }}>₨ {Number(currentRequisition.totalEstimatedCost).toLocaleString()}</Text> : null },
        ],
      },
    ];

    // Add items table if PR has items
    if (currentRequisition.items && currentRequisition.items.length > 0) {
      sections.push({
        title: "Requested Items",
        table: {
          columns: [
            { title: "Item Code", dataIndex: "itemCode", render: (val: unknown) => String(val || "-") },
            { title: "Item Name", dataIndex: "itemName", render: (val: unknown) => String(val || "-") },
            { title: "Category", dataIndex: "category", render: (val: unknown) => String(val || "-") },
            { title: "UOM", dataIndex: "uom", render: (val: unknown) => String(val || "-") },
            { title: "Quantity", dataIndex: "quantity", render: (val: unknown) => <Text strong>{String(val ?? 0)}</Text> },
            { title: "Est. Unit Cost", dataIndex: "estimatedUnitCost", render: (val: unknown) => val ? `₨ ${Number(val).toLocaleString()}` : "-" },
            { title: "Total Cost", dataIndex: "totalCost", render: (val: unknown) => val ? <Text strong style={{ color: "#52c41a" }}>₨ {Number(val).toLocaleString()}</Text> : "-" },
          ],
          data: currentRequisition.items.map((item, index) => ({ ...item, key: item.id || index })),
        },
      });
    }

    return sections;
  }, [currentRequisition]);

  // Items table columns for drawer
  const itemColumns = [
    {
      title: "Item Name *",
      dataIndex: "itemName",
      key: "itemName",
      render: (_: string, __: PurchaseRequisitionItem, index: number) => (
        <AutoComplete
          placeholder="Enter material name"
          size="small"
          style={{ width: "100%" }}
          value={items[index]?.itemName || ""}
          options={materials.map(m => ({ label: `${m.name} (${m.code})`, value: m.name }))}
          onSelect={(val) => {
            const material = materials.find(m => m.name === val);
            if (material) {
              updateItem(index, "itemName", material.name);
              updateItem(index, "itemCode", material.code);
              updateItem(index, "uom", material.unitOfMeasure);
              updateItem(index, "category", material.type || "");
            }
          }}
          onChange={(val) => {
            updateItem(index, "itemName", val);
          }}
          filterOption={(inputValue, option) =>
            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
        />
      ),
    },
    {
      title: "Item Code",
      dataIndex: "itemCode",
      key: "itemCode",
      width: 120,
      render: (_: string, __: PurchaseRequisitionItem, index: number) => (
        <Input
          value={items[index]?.itemCode}
          onChange={(e) => updateItem(index, "itemCode", e.target.value)}
          placeholder="Code"
          size="small"
          disabled
        />
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (_: string, __: PurchaseRequisitionItem, index: number) => (
        <DynamicSelect
          type="pr_category"
          value={items[index]?.category}
          onChange={(val) => updateItem(index, "category", val)}
          placeholder="Select"
          style={{ width: "100%" }}
          allowClear
        />
      ),
    },

    {
      title: "Qty *",
      dataIndex: "quantity",
      key: "quantity",
      width: 80,
      render: (_: number, __: PurchaseRequisitionItem, index: number) => (
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
      title: "UOM",
      dataIndex: "uom",
      key: "uom",
      width: 80,
      render: (_: string, __: PurchaseRequisitionItem, index: number) => (
        <DynamicSelect
          type="UOM"
          value={items[index]?.uom}
          onChange={(val) => updateItem(index, "uom", val)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Est. Cost",
      dataIndex: "estimatedUnitCost",
      key: "estimatedUnitCost",
      width: 100,
      render: (_: number, __: PurchaseRequisitionItem, index: number) => (
        <InputNumber
          value={items[index]?.estimatedUnitCost}
          onChange={(val) => updateItem(index, "estimatedUnitCost", val || 0)}
          min={0}
          size="small"
          style={{ width: "100%" }}
          prefix="₨"
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 40,
      render: (_: unknown, __: PurchaseRequisitionItem, index: number) => (
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
      <EnterpriseDataTable<PurchaseRequisition>
        title="Purchase Requisitions"
        subtitle="Manage purchase requests from departments"
        tableKey="purchase-requisitions"
        columns={columns}
        data={requisitions}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        exportFileName="purchase_requisitions"
        showSelection
        showActions
      />

      {/* Create/Edit Drawer */}
      <FormDrawer
        title="Purchase Requisition"
        formKey="purchase-requisition-v2"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        onDelete={drawerMode === "edit" && currentRequisition ? () => handleDelete(currentRequisition) : undefined}
        loading={createRequisition.isPending || updateRequisition.isPending}
        mode={drawerMode}
        width={750}
        form={form}
        initialValues={formInitialValues}
        entityId={currentRequisition?.id}
        onDraftLoaded={(data) => ({
          ...data,
          requisitionDate: data.requisitionDate && typeof data.requisitionDate === 'string' ? dayjs(data.requisitionDate) : data.requisitionDate,
          expectedDeliveryDate: data.expectedDeliveryDate && typeof data.expectedDeliveryDate === 'string' ? dayjs(data.expectedDeliveryDate) : data.expectedDeliveryDate,
        })}
      >
        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <FileTextOutlined /> Requisition Details
        </Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="reqNumber"
              label="Requisition Number"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="PR-XXXXXXXX" disabled={drawerMode === "edit"} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="requisitionDate"
              label="Requisition Date"
              rules={[{ required: true, message: "Required" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="priority" label="Priority">
              <DynamicSelect 
                type="PRIORITY" 
                placeholder="Select priority" 
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <UserOutlined /> Requestor Information
        </Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="requestedBy"
              label="Requested By"
              rules={[{ required: true, message: "Please enter requestor name" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Name of requestor" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="department" label="Department">
              <DynamicSelect 
                type="DEPARTMENT" 
                placeholder="Select department" 
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="costCenter" label="Cost Center">
              <Input placeholder="Cost center" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="expectedDeliveryDate" label="Expected Delivery">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="budgetReference" label="Budget Reference">
              <Input placeholder="Budget code" />
            </Form.Item>
          </Col>
        </Row>

        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <ShoppingOutlined /> Requested Items
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

        <Button
          type="dashed"
          onClick={addItem}
          icon={<PlusOutlined />}
          style={{ width: "100%" }}
        >
          Add Item
        </Button>
      </FormDrawer>

      {/* Document Viewer */}
      {currentRequisition && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Purchase Requisition"
          documentNumber={currentRequisition.reqNumber}
          documentDate={
            currentRequisition.createdAt
              ? dayjs(currentRequisition.createdAt).format("MMMM DD, YYYY")
              : undefined
          }
          status={
            currentRequisition.status
              ? {
                  text: currentRequisition.status,
                  color: statusColors[currentRequisition.status] || "default",
                }
              : undefined
          }
          sections={documentSections}
          signatures={[
            { title: "Requested By", name: currentRequisition.requestedBy },
            { title: "Department Head" },
            { title: "Procurement Manager" },
          ]}
          fileName="purchase_requisition"
        />
      )}
    </div>
  );
}
