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
  TeamOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer } from "@/components/common";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  Customer,
  CreateCustomerDto,
} from "@/hooks/useSales";
import type { ColumnsType } from "antd/es/table";

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

// Customer type color mapping
const customerTypeColors: Record<string, string> = {
  Distributor: "blue",
  Hospital: "green",
  Pharmacy: "purple",
};

// Status color mapping
const statusColors: Record<string, string> = {
  Active: "green",
  Inactive: "default",
};

export default function CustomersPage() {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  // API Hooks
  const { data: customers = [], isLoading, refetch } = useCustomers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = customers.length;
    const distributorCount = customers.filter((c) => c.type === "Distributor").length;
    const hospitalCount = customers.filter((c) => c.type === "Hospital").length;
    const pharmacyCount = customers.filter((c) => c.type === "Pharmacy").length;
    const activeCount = customers.filter((c) => c.status === "Active").length;

    return { total, distributorCount, hospitalCount, pharmacyCount, activeCount };
  }, [customers]);

  // Table columns
  const columns: ColumnsType<Customer> = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: 200,
        fixed: "left",
        render: (text: string) => (
          <Text strong style={{ color: "#fa541c" }}>
            {text}
          </Text>
        ),
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        width: 120,
        render: (type: string) => (
          <Tag color={customerTypeColors[type] || "default"}>
            {type || "N/A"}
          </Tag>
        ),
      },
      {
        title: "Contact Person",
        dataIndex: "contactPerson",
        key: "contactPerson",
        width: 150,
        render: (text: string) => text || "-",
      },
      {
        title: "Phone",
        dataIndex: "phone",
        key: "phone",
        width: 130,
        render: (text: string) => text || "-",
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        width: 180,
        render: (text: string) => text || "-",
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
        width: 130,
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
        <Col span={5}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff2e8 0%, #ffbb96 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#d4380d" }}>Total Customers</span>}
              value={summaryStats.total}
              styles={{ content: { fontSize: 18, color: "#d4380d" } }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #e6f4ff 0%, #91caff 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#0958d9" }}>Distributors</span>}
              value={summaryStats.distributorCount}
              styles={{ content: { fontSize: 18, color: "#0958d9" } }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#389e0d" }}>Hospitals</span>}
              value={summaryStats.hospitalCount}
              styles={{ content: { fontSize: 18, color: "#389e0d" } }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#722ed1" }}>Pharmacies</span>}
              value={summaryStats.pharmacyCount}
              styles={{ content: { fontSize: 18, color: "#722ed1" } }}
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
      </Row>
    ),
    [summaryStats]
  );

  // Handlers
  const handleAdd = useCallback(() => {
    setCurrentCustomer(null);
    setDrawerMode("create");
    form.resetFields();
    setDrawerOpen(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: Customer) => {
      setCurrentCustomer(record);
      setDrawerMode("edit");
      form.setFieldsValue({
        ...record,
      });
      setDrawerOpen(true);
    },
    [form]
  );

  const handleView = useCallback((record: Customer) => {
    setCurrentCustomer(record);
    setDocumentViewerOpen(true);
  }, []);

  const handleDelete = useCallback(
    (record: Customer) => {
      modal.confirm({
        title: "Delete Customer",
        content: `Are you sure you want to delete "${record.name}"? This action cannot be undone.`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await deleteCustomer.mutateAsync(record.id);
            message.success("Customer deleted successfully");
          } catch (error: any) {
             message.error(error.message || "Failed to delete customer");
          }
        },
      });
    },
    [deleteCustomer, modal, message]
  );

  const handleBulkDelete = useCallback(
    async (records: Customer[]) => {
      modal.confirm({
        title: "Delete Selected Customers",
        content: `Are you sure you want to delete ${records.length} customers? This action cannot be undone.`,
        okText: "Delete All",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            for (const record of records) {
              await deleteCustomer.mutateAsync(record.id);
            }
            message.success("Selected customers deleted successfully");
          } catch (error: any) {
             message.error(error.message || "Failed to delete some customers");
          }
        },
      });
    },
    [deleteCustomer, modal, message]
  );

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      const data = values as CreateCustomerDto;

      try {
        if (drawerMode === "create") {
          await createCustomer.mutateAsync(data);
          message.success("Customer created successfully");
        } else if (drawerMode === "edit" && currentCustomer) {
          await updateCustomer.mutateAsync({ id: currentCustomer.id, data });
           message.success("Customer updated successfully");
        }

        setDrawerOpen(false);
        form.resetFields();
      } catch (error: any) {
        message.error(error.message || "Failed to save customer");
      }
    },
    [createCustomer, updateCustomer, drawerMode, currentCustomer, form, message]
  );

  // Document viewer sections
  const documentSections = useMemo(() => {
    if (!currentCustomer) return [];

    return [
      {
        title: "Customer Information",
        items: [
          { label: "Customer Name", value: <Text strong style={{ fontSize: 16 }}>{currentCustomer.name}</Text> },
          { label: "Type", value: <Tag color={customerTypeColors[currentCustomer.type] || "default"} style={{ fontSize: 13 }}>{currentCustomer.type}</Tag> },
          { label: "Contact Person", value: currentCustomer.contactPerson },
          { label: "Status", value: <Tag color={statusColors[currentCustomer.status || "Active"]}>{currentCustomer.status || "Active"}</Tag> },
        ],
      },
      {
        title: "Contact Details",
        items: [
          { label: "Phone", value: currentCustomer.phone },
          { label: "Email", value: currentCustomer.email },
          { label: "Tax ID", value: currentCustomer.taxId },
        ],
      },
      {
        title: "Address",
        items: [
          { label: "Billing Address", value: currentCustomer.billingAddress, span: 2 },
          { label: "Shipping Address", value: currentCustomer.shippingAddress, span: 2 },
        ],
      },
      {
        title: "Audit Trail",
        items: [
          { label: "Created At", value: currentCustomer.createdAt ? dayjs(currentCustomer.createdAt).format("MMMM DD, YYYY HH:mm") : null },
          { label: "Last Updated", value: currentCustomer.updatedAt ? dayjs(currentCustomer.updatedAt).format("MMMM DD, YYYY HH:mm") : null },
        ],
      },
    ];
  }, [currentCustomer]);

  return (
    <div style={{ padding: 24 }}>
      <EnterpriseDataTable<Customer>
        title="Customer Management"
        subtitle="Manage customer accounts and contact information"
        tableKey="customers-master"
        columns={columns}
        data={customers}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        exportFileName="customers"
        showSelection
        showActions
        summary={summaryComponent}
      />

      {/* Create/Edit Drawer */}
      <FormDrawer
        title="Customer"
        formKey="customer"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        onDelete={drawerMode === "edit" && currentCustomer ? () => handleDelete(currentCustomer) : undefined}
        loading={createCustomer.isPending || updateCustomer.isPending}
        mode={drawerMode}
        width={600}
        form={form}
        initialValues={currentCustomer || undefined}
        entityId={currentCustomer?.id}
      >
        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <UserOutlined /> Basic Information
        </Divider>

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="name"
              label="Customer Name"
              rules={[{ required: true, message: "Please enter customer name" }]}
            >
              <Input placeholder="Enter customer name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="type"
              label="Customer Type"
              rules={[{ required: true, message: "Please select type" }]}
            >
              <Select placeholder="Select type">
                <Option value="Distributor">Distributor</Option>
                <Option value="Hospital">Hospital</Option>
                <Option value="Pharmacy">Pharmacy</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contactPerson"
              label="Contact Person"
            >
              <Input placeholder="Contact person name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="taxId"
              label="Tax ID / NTN"
            >
              <Input placeholder="Tax identification number" />
            </Form.Item>
          </Col>
        </Row>

        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <PhoneOutlined /> Contact Details
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Phone"
            >
              <Input placeholder="Phone number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: "email", message: "Please enter valid email" }]}
            >
              <Input placeholder="Email address" />
            </Form.Item>
          </Col>
        </Row>

        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <HomeOutlined /> Address Information
        </Divider>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="billingAddress"
              label="Billing Address"
            >
              <TextArea rows={2} placeholder="Enter billing address" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="shippingAddress"
              label="Shipping Address"
            >
              <TextArea rows={2} placeholder="Enter shipping address" />
            </Form.Item>
          </Col>
        </Row>
      </FormDrawer>

      {/* Document Viewer */}
      {currentCustomer && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Customer Profile"
          documentNumber={currentCustomer.name}
          documentDate={
            currentCustomer.createdAt
              ? dayjs(currentCustomer.createdAt).format("MMMM DD, YYYY")
              : undefined
          }
          status={{
            text: currentCustomer.type || "N/A",
            color: customerTypeColors[currentCustomer.type] || "default",
          }}
          sections={documentSections}
          signatures={[
            { title: "Sales Rep" },
            { title: "Approved By" },
          ]}
          fileName="customer_profile"
        />
      )}
    </div>
  );
}
