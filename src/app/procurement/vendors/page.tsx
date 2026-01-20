"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Switch,
  Rate,
  Row,
  Col,
  Divider,
  Tag,
  Tooltip,
  Modal,
  Popconfirm,
} from "antd";
import {
  UserOutlined,
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer } from "@/components/common";
import {
  useVendors,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
} from "@/hooks/useProcurement";
import { Vendor, CreateVendorDto } from "@/lib/services";
import type { ColumnsType } from "antd/es/table";

const { TextArea } = Input;
const { Option } = Select;

// Status color mapping
const statusColors: Record<string, string> = {
  Active: "green",
  Inactive: "default",
  Blacklisted: "red",
};

// Audit status colors
const auditColors: Record<string, string> = {
  Pending: "orange",
  Cleared: "green",
  Failed: "red",
};

// Risk category colors
const riskColors: Record<string, string> = {
  Low: "green",
  Medium: "orange",
  High: "red",
};

export default function VendorsPage() {
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  // API Hooks
  const { data: vendors = [], isLoading, refetch } = useVendors();
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();

  // Table columns
  const columns: ColumnsType<Vendor> = useMemo(
    () => [
      {
        title: "Legal Name",
        dataIndex: "legalName",
        key: "legalName",
        width: 200,
        fixed: "left",
        render: (text: string, record: Vendor) => (
          <div>
            <strong>{text}</strong>
            {record.isGmpCertified && (
              <Tooltip title="GMP Certified">
                <SafetyCertificateOutlined
                  style={{ color: "#52c41a", marginLeft: 8 }}
                />
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        title: "Vendor Type",
        dataIndex: "vendorType",
        key: "vendorType",
        width: 130,
        render: (type: string) => (
          <Tag color="blue">{type || "N/A"}</Tag>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 110,
        render: (status: string) => (
          <Tag color={statusColors[status] || "default"}>
            {status || "N/A"}
          </Tag>
        ),
      },
      {
        title: "Contact Person",
        dataIndex: "contactPerson",
        key: "contactPerson",
        width: 150,
      },
      {
        title: "Phone",
        dataIndex: "contactNumber",
        key: "contactNumber",
        width: 130,
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        width: 180,
        render: (email: string) =>
          email ? (
            <a href={`mailto:${email}`}>{email}</a>
          ) : (
            "-"
          ),
      },
      {
        title: "City",
        dataIndex: "city",
        key: "city",
        width: 100,
      },
      {
        title: "Country",
        dataIndex: "country",
        key: "country",
        width: 100,
      },
      {
        title: "Quality Rating",
        dataIndex: "qualityRating",
        key: "qualityRating",
        width: 150,
        render: (rating: number) => (
          <Rate disabled value={rating || 0} style={{ fontSize: 12 }} />
        ),
      },
      {
        title: "Audit Status",
        dataIndex: "auditStatus",
        key: "auditStatus",
        width: 110,
        render: (status: string) => (
          <Tag color={auditColors[status] || "default"}>
            {status || "Pending"}
          </Tag>
        ),
      },
      {
        title: "Risk",
        dataIndex: "riskCategory",
        key: "riskCategory",
        width: 90,
        render: (risk: string) => (
          <Tag color={riskColors[risk] || "default"}>
            {risk || "N/A"}
          </Tag>
        ),
      },
      {
        title: "Credit Limit",
        dataIndex: "creditLimit",
        key: "creditLimit",
        width: 120,
        render: (value: number) =>
          value ? `$${value.toLocaleString()}` : "-",
      },
      {
        title: "Payment Terms",
        dataIndex: "paymentTerms",
        key: "paymentTerms",
        width: 120,
      },
    ],
    []
  );

  // Handlers
  const handleAdd = useCallback(() => {
    setCurrentVendor(null);
    setDrawerMode("create");
    form.resetFields();
    setDrawerOpen(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: Vendor) => {
      setCurrentVendor(record);
      setDrawerMode("edit");
      form.setFieldsValue({
        ...record,
        licenseExpiryDate: record.licenseExpiryDate
          ? dayjs(record.licenseExpiryDate)
          : undefined,
      });
      setDrawerOpen(true);
    },
    [form]
  );

  const handleView = useCallback((record: Vendor) => {
    setCurrentVendor(record);
    setDocumentViewerOpen(true);
  }, []);

  const handleDelete = useCallback(
    (record: Vendor) => {
      Modal.confirm({
        title: "Delete Vendor",
        content: `Are you sure you want to delete "${record.legalName}"? This action cannot be undone.`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          await deleteVendor.mutateAsync(record.id);
        },
      });
    },
    [deleteVendor]
  );

  const handleBulkDelete = useCallback(
    async (records: Vendor[]) => {
      Modal.confirm({
        title: "Delete Selected Vendors",
        content: `Are you sure you want to delete ${records.length} vendors? This action cannot be undone.`,
        okText: "Delete All",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          for (const record of records) {
            await deleteVendor.mutateAsync(record.id);
          }
        },
      });
    },
    [deleteVendor]
  );

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      const data: CreateVendorDto = {
        ...values,
        licenseExpiryDate: values.licenseExpiryDate
          ? (values.licenseExpiryDate as dayjs.Dayjs).format("YYYY-MM-DD")
          : undefined,
      } as CreateVendorDto;

      if (drawerMode === "create") {
        await createVendor.mutateAsync(data);
      } else if (drawerMode === "edit" && currentVendor) {
        await updateVendor.mutateAsync({ id: currentVendor.id, data });
      }

      setDrawerOpen(false);
      form.resetFields();
    },
    [createVendor, updateVendor, drawerMode, currentVendor, form]
  );

  // Document viewer sections
  const documentSections = useMemo(() => {
    if (!currentVendor) return [];

    return [
      {
        title: "Basic Information",
        items: [
          { label: "Legal Name", value: currentVendor.legalName },
          { label: "Vendor Type", value: currentVendor.vendorType },
          { label: "Business Category", value: currentVendor.businessCategory },
          { label: "Registration Number", value: currentVendor.registrationNumber },
          { label: "NTN/VAT/GST", value: currentVendor.ntnVatGst },
          { label: "Status", value: <Tag color={statusColors[currentVendor.status || ""] || "default"}>{currentVendor.status}</Tag> },
        ],
      },
      {
        title: "Contact Information",
        items: [
          { label: "Contact Person", value: currentVendor.contactPerson },
          { label: "Contact Number", value: currentVendor.contactNumber },
          { label: "Email", value: currentVendor.email },
          { label: "Website", value: currentVendor.website ? <a href={currentVendor.website} target="_blank" rel="noopener noreferrer">{currentVendor.website}</a> : null },
          { label: "Address", value: currentVendor.address, span: 2 },
          { label: "City", value: currentVendor.city },
          { label: "Country", value: currentVendor.country },
        ],
      },
      {
        title: "Compliance & Quality",
        items: [
          { label: "GMP Certified", value: currentVendor.isGmpCertified ? <Tag color="green"><CheckCircleOutlined /> Yes</Tag> : <Tag color="red"><CloseCircleOutlined /> No</Tag> },
          { label: "Blacklisted", value: currentVendor.isBlacklisted ? <Tag color="red"><WarningOutlined /> Yes</Tag> : <Tag color="green">No</Tag> },
          { label: "Regulatory License", value: currentVendor.regulatoryLicense },
          { label: "License Expiry", value: currentVendor.licenseExpiryDate },
          { label: "Quality Rating", value: <Rate disabled value={currentVendor.qualityRating || 0} style={{ fontSize: 14 }} /> },
          { label: "Audit Status", value: <Tag color={auditColors[currentVendor.auditStatus || ""] || "default"}>{currentVendor.auditStatus}</Tag> },
          { label: "Risk Category", value: <Tag color={riskColors[currentVendor.riskCategory || ""] || "default"}>{currentVendor.riskCategory}</Tag> },
        ],
      },
      {
        title: "Financial Information",
        items: [
          { label: "Bank Name", value: currentVendor.bankName },
          { label: "Account Title", value: currentVendor.accountTitle },
          { label: "Account Number", value: currentVendor.accountNumber },
          { label: "Currency", value: currentVendor.currency },
          { label: "Payment Terms", value: currentVendor.paymentTerms },
          { label: "Credit Limit", value: currentVendor.creditLimit ? `$${currentVendor.creditLimit.toLocaleString()}` : null },
          { label: "Tax Withholding %", value: currentVendor.taxWithholdingPercent ? `${currentVendor.taxWithholdingPercent}%` : null },
        ],
      },
    ];
  }, [currentVendor]);

  return (
    <div style={{ padding: 24 }}>
      <EnterpriseDataTable<Vendor>
        title="Vendor Management"
        subtitle="Manage your suppliers and vendors"
        tableKey="vendors"
        columns={columns}
        data={vendors}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        exportFileName="vendors"
        showSelection
        showActions
      />

      {/* Create/Edit Drawer */}
      <FormDrawer
        title="Vendor"
        formKey="vendor"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        onDelete={drawerMode === "edit" && currentVendor ? () => handleDelete(currentVendor) : undefined}
        loading={createVendor.isPending || updateVendor.isPending}
        mode={drawerMode}
        width={700}
        form={form}
        initialValues={currentVendor || undefined}
        entityId={currentVendor?.id}
      >
        <Divider titlePlacement="left" style={{ fontSize: 13 }}>
          <ShopOutlined /> Basic Information
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="legalName"
              label="Legal Name"
              rules={[{ required: true, message: "Please enter legal name" }]}
              tooltip="Official registered name of the vendor"
            >
              <Input placeholder="Enter legal name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="vendorType"
              label="Vendor Type"
              tooltip="Category of materials/services provided"
            >
              <Select placeholder="Select type">
                <Option value="Raw Material">Raw Material</Option>
                <Option value="Packaging">Packaging</Option>
                <Option value="Services">Services</Option>
                <Option value="Equipment">Equipment</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="businessCategory" label="Business Category">
              <Input placeholder="e.g., Pharmaceutical API" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="registrationNumber" label="Registration Number">
              <Input placeholder="Company registration #" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="ntnVatGst" label="NTN/VAT/GST">
              <Input placeholder="Tax identification number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label="Status">
              <Select placeholder="Select status">
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
                <Option value="Blacklisted">Blacklisted</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left" style={{ fontSize: 13 }}>
          <UserOutlined /> Contact Information
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="contactPerson" label="Contact Person">
              <Input prefix={<UserOutlined />} placeholder="Primary contact" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="contactNumber" label="Contact Number">
              <Input prefix={<PhoneOutlined />} placeholder="+92 xxx xxxxxxx" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: "email", message: "Please enter a valid email" }]}
            >
              <Input prefix={<MailOutlined />} placeholder="vendor@example.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="website" label="Website">
              <Input prefix={<GlobalOutlined />} placeholder="https://example.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="city" label="City">
              <Input placeholder="City" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="country" label="Country">
              <Input placeholder="Country" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="address" label="Address">
          <TextArea rows={2} placeholder="Full address" />
        </Form.Item>

        <Divider titlePlacement="left" style={{ fontSize: 13 }}>
          <SafetyCertificateOutlined /> Compliance & Quality
        </Divider>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="isGmpCertified" label="GMP Certified" valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="isBlacklisted" label="Blacklisted" valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="qualityRating" label="Quality Rating">
              <Rate />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="regulatoryLicense" label="Regulatory License">
              <Input placeholder="License #" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="licenseExpiryDate" label="License Expiry">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="auditStatus" label="Audit Status">
              <Select placeholder="Select status">
                <Option value="Pending">Pending</Option>
                <Option value="Cleared">Cleared</Option>
                <Option value="Failed">Failed</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="riskCategory" label="Risk Category">
              <Select placeholder="Select risk">
                <Option value="Low">Low</Option>
                <Option value="Medium">Medium</Option>
                <Option value="High">High</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left" style={{ fontSize: 13 }}>
          <BankOutlined /> Financial Information
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="bankName" label="Bank Name">
              <Input placeholder="Bank name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="accountTitle" label="Account Title">
              <Input placeholder="Account holder name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="accountNumber" label="Account Number">
              <Input placeholder="Bank account number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="currency" label="Currency">
              <Select placeholder="Select currency">
                <Option value="USD">USD - US Dollar</Option>
                <Option value="EUR">EUR - Euro</Option>
                <Option value="PKR">PKR - Pakistani Rupee</Option>
                <Option value="GBP">GBP - British Pound</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="paymentTerms" label="Payment Terms">
              <Select placeholder="Select terms">
                <Option value="Net-30">Net 30 Days</Option>
                <Option value="Net-60">Net 60 Days</Option>
                <Option value="Advanced">Advanced Payment</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="creditLimit" label="Credit Limit">
              <InputNumber
                style={{ width: "100%" }}
                prefix="$"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => (Number(value?.replace(/\$\s?|(,*)/g, "")) || 0) as 0}
                placeholder="0"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="taxWithholdingPercent" label="Tax Withholding %">
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={100}
                suffix="%"
                placeholder="0"
              />
            </Form.Item>
          </Col>
        </Row>
      </FormDrawer>

      {/* Document Viewer */}
      {currentVendor && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Vendor Profile"
          documentNumber={currentVendor.id.slice(-8).toUpperCase()}
          documentDate={currentVendor.createdAt ? new Date(currentVendor.createdAt).toLocaleDateString() : undefined}
          status={
            currentVendor.status
              ? {
                  text: currentVendor.status,
                  color: statusColors[currentVendor.status] || "default",
                }
              : undefined
          }
          sections={documentSections}
          signatures={[
            { title: "Prepared By" },
            { title: "Reviewed By" },
            { title: "Approved By" },
          ]}
          fileName="vendor_profile"
        />
      )}
    </div>
  );
}
