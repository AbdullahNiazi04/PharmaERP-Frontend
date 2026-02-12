"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
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
  App,
  Typography,
  Card,
  Statistic,
  Button,
} from "antd";
import {
  GlobalOutlined,
  DollarOutlined,
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer, DynamicSelect } from "@/components/common";
import {
  useImportOrders,
  useCreateImportOrder,
  useUpdateImportOrder,
  useDeleteImportOrder,
  useVendors,
} from "@/hooks/useProcurement";
import { ImportOrder, CreateImportOrderDto } from "@/lib/services";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;
const { Text, Title } = Typography;

// Status color mapping
const statusColors: Record<string, string> = {
  Pending: "default",
  "In Transit": "processing",
  "At Port": "warning",
  "Customs Clearance": "purple",
  Cleared: "success",
  Received: "green",
};

export default function ImportsPage() {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentImport, setCurrentImport] = useState<ImportOrder | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  // API Hooks
  const { data: importOrders = [], isLoading } = useImportOrders();
  const { data: vendors = [] } = useVendors();
  const createImport = useCreateImportOrder();
  const updateImport = useUpdateImportOrder();
  const deleteImport = useDeleteImportOrder();

  // Helper to get vendor name
  const getVendorName = useCallback((vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor?.legalName || vendorId || "-";
  }, [vendors]);

  // Handle Form Values Change for Calculation
  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.amountUsd !== undefined || changedValues.exchangeRate !== undefined) {
      const usd = allValues.amountUsd || 0;
      const rate = allValues.exchangeRate || 0;
      form.setFieldsValue({ amountPkr: (usd * rate).toFixed(2) });
    }
  };

  // Drawer Actions
  const handleAdd = () => {
    setDrawerMode("create");
    setCurrentImport(null);
    form.resetFields();
    // Set default currency if needed
    form.setFieldsValue({ currency: 'USD', status: 'Pending' });
    setDrawerOpen(true);
  };

  const handleEdit = (record: ImportOrder) => {
    setDrawerMode("edit");
    setCurrentImport(record);
    form.setFieldsValue({
      ...record,
      eta: record.eta ? dayjs(record.eta) : null,
      arrivalDate: record.arrivalDate ? dayjs(record.arrivalDate) : null,
      clearanceDate: record.clearanceDate ? dayjs(record.clearanceDate) : null,
      amountPkr: (record.amountUsd * record.exchangeRate).toFixed(2), // Ensure consistent display
    });
    setDrawerOpen(true);
  };

  const handleDelete = (record: ImportOrder) => {
    modal.confirm({
      title: "Delete Import Order",
      content: `Are you sure you want to delete import order ${record.importNumber}?`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteImport.mutateAsync(record.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    const payload: CreateImportOrderDto = {
      ...values,
      amountUsd: Number(values.amountUsd),
      exchangeRate: Number(values.exchangeRate),
      // amountPkr is calculated on backend, but we displayed it. 
      // format dates
      eta: values.eta?.toISOString(),
      arrivalDate: values.arrivalDate?.toISOString(),
      clearanceDate: values.clearanceDate?.toISOString(),
    };

    // Remove amountPkr from payload to avoid schema issues if strict 
    // (DTO doesn't have amountPkr, so it's fine, but good practice to be clean)
    // delete (payload as any).amountPkr;

    try {
      if (drawerMode === "create") {
        await createImport.mutateAsync(payload);
      } else if (drawerMode === "edit" && currentImport) {
        await updateImport.mutateAsync({ id: currentImport.id, data: payload });
      }
      setDrawerOpen(false);
    } catch (error) {
       // Hook handles error
    }
  };

  // Table Columns
  const columns: ColumnsType<ImportOrder> = useMemo(
    () => [
      {
        title: "Import Number",
        dataIndex: "importNumber",
        key: "importNumber",
        width: 150,
        fixed: "left",
        render: (text) => <Text strong style={{ color: "#1890ff" }}>{text}</Text>,
      },
      {
        title: "Vendor",
        dataIndex: "vendorId",
        key: "vendorId",
        width: 200,
        render: (id) => getVendorName(id),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 150,
        render: (status) => <Tag color={statusColors[status] || "default"}>{status}</Tag>,
      },
      {
        title: "Amount (USD)",
        dataIndex: "amountUsd",
        key: "amountUsd",
        width: 120,
        align: 'right',
        render: (val) => val ? `$ ${Number(val).toLocaleString()}` : '-',
      },
      {
        title: "Ex. Rate",
        dataIndex: "exchangeRate",
        key: "exchangeRate",
        width: 100,
        align: 'right',
        render: (val) => val ? `₨ ${Number(val).toLocaleString()}` : '-',
      },
      {
        title: "Amount (PKR)",
        dataIndex: "amountPkr",
        key: "amountPkr",
        width: 150,
        align: 'right',
        render: (val) => <Text strong>{val ? `₨ ${Number(val).toLocaleString()}` : '-'}</Text>,
      },
      {
        title: "ETA",
        dataIndex: "eta",
        key: "eta",
        width: 120,
        render: (date) => date ? dayjs(date).format("MMM DD, YYYY") : '-',
      },
      {
        title: "Bill of Lading",
        dataIndex: "billOfLading",
        key: "billOfLading",
        width: 150,
      },
    ],
    [getVendorName]
  );

  // Summary Stats
  const summary = useMemo(() => {
    const total = importOrders.length;
    const pending = importOrders.filter(i => i.status === 'Pending').length;
    const transit = importOrders.filter(i => i.status === 'In Transit').length;
    const totalUsd = importOrders.reduce((acc, curr) => acc + Number(curr.amountUsd), 0);
    return { total, pending, transit, totalUsd };
  }, [importOrders]);

  const summaryComponent = (
    <Row gutter={16} style={{ marginBottom: 16 }}>
       <Col span={6}>
          <Card size="small" bordered={false} style={{ background: '#f0f5ff' }}>
            <Statistic title="Total Imports" value={summary.total} prefix={<GlobalOutlined />} />
          </Card>
       </Col>
       <Col span={6}>
          <Card size="small" bordered={false} style={{ background: '#fff7e6' }}>
            <Statistic title="Pending" value={summary.pending} valueStyle={{ color: '#fa8c16' }} />
          </Card>
       </Col>
       <Col span={6}>
          <Card size="small" bordered={false} style={{ background: '#e6fffb' }}>
            <Statistic title="In Transit" value={summary.transit} valueStyle={{ color: '#13c2c2' }} />
          </Card>
       </Col>
       <Col span={6}>
          <Card size="small" bordered={false} style={{ background: '#f9f0ff' }}>
            <Statistic 
              title="Total Value (USD)" 
              value={summary.totalUsd} 
              precision={2} 
              prefix={<DollarOutlined />} 
              valueStyle={{ color: '#722ed1' }} 
            />
          </Card>
       </Col>
    </Row>
  );

  return (
    <div style={{ padding: 24, minHeight: "100vh", background: "#f0f2f5" }}>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Import Management</Title>
          <Text type="secondary">Manage international orders, shipments, and customs</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          New Import Order
        </Button>
      </div>

      {summaryComponent}

      <EnterpriseDataTable
        columns={columns}
        data={importOrders}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search by Import Number, Vendor, or BL..."
      />

      <FormDrawer
        title={drawerMode === "create" ? "New Import Order" : "Edit Import Order"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={720}
        footer={
          <div style={{ textAlign: "right" }}>
            <Button onClick={() => setDrawerOpen(false)} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" onClick={form.submit} loading={createImport.isPending || updateImport.isPending}>
              {drawerMode === "create" ? "Create Order" : "Update Changes"}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleValuesChange}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="importNumber" label="Import Number" rules={[{ required: true, message: 'Please enter Import Number' }]}>
                <Input placeholder="e.g. IMP-2023-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="vendorId" label="Vendor" rules={[{ required: true, message: 'Please select Vendor' }]}>
                <Select showSearch placeholder="Select Vendor" optionFilterProp="children">
                   {vendors.map(v => <Option key={v.id} value={v.id}>{v.legalName}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Currency & Amount</Divider>
          
          <Row gutter={16}>
             <Col span={6}>
               <Form.Item name="currency" label="Currency" initialValue="USD">
                 <Select>
                   <Option value="USD">USD</Option>
                   <Option value="EUR">EUR</Option>
                   <Option value="GBP">GBP</Option>
                 </Select>
               </Form.Item>
             </Col>
             <Col span={6}>
               <Form.Item name="exchangeRate" label="Exchange Rate" rules={[{ required: true }]}>
                 <InputNumber style={{ width: '100%' }} min={0} step={0.01} placeholder="PKR/USD" />
               </Form.Item>
             </Col>
             <Col span={6}>
               <Form.Item name="amountUsd" label="Amount (USD)" rules={[{ required: true }]}>
                 <InputNumber style={{ width: '100%' }} min={0} step={0.01} prefix="$" />
               </Form.Item>
             </Col>
             <Col span={6}>
               <Form.Item name="amountPkr" label="Amount (PKR)">
                 <InputNumber style={{ width: '100%' }} readOnly disabled prefix="₨" />
               </Form.Item>
             </Col>
          </Row>

          <Divider orientation="left">Shipment Details</Divider>

          <Row gutter={16}>
             <Col span={8}>
               <Form.Item name="status" label="Status" initialValue="Pending">
                 <Select>
                   {Object.keys(statusColors).map(s => <Option key={s} value={s}>{s}</Option>)}
                 </Select>
               </Form.Item>
             </Col>
             <Col span={8}>
               <Form.Item name="portOfEntry" label="Port of Entry">
                 <Input placeholder="e.g. Karachi Port" />
               </Form.Item>
             </Col>
             <Col span={8}>
               <Form.Item name="customsRef" label="Customs Ref / GD">
                 <Input placeholder="e.g. GD-12345" />
               </Form.Item>
             </Col>
          </Row>
          
          <Row gutter={16}>
             <Col span={8}>
               <Form.Item name="billOfLading" label="Bill of Lading">
                 <Input />
               </Form.Item>
             </Col>
             <Col span={8}>
               <Form.Item name="lcNumber" label="LC Number">
                 <Input />
               </Form.Item>
             </Col>
             <Col span={8}>
                 {/* Empty col for spacing or Reference PO */}
                 <Form.Item name="referencePoId" label="Reference PO (Optional)">
                    <Input placeholder="Enter PO ID (Future: Select)" />
                 </Form.Item>
             </Col>
          </Row>

          <Row gutter={16}>
             <Col span={8}>
               <Form.Item name="eta" label="Estimated Arrival (ETA)">
                 <DatePicker style={{ width: '100%' }} />
               </Form.Item>
             </Col>
             <Col span={8}>
               <Form.Item name="arrivalDate" label="Actual Arrival">
                 <DatePicker style={{ width: '100%' }} />
               </Form.Item>
             </Col>
             <Col span={8}>
               <Form.Item name="clearanceDate" label="Clearance Date">
                 <DatePicker style={{ width: '100%' }} />
               </Form.Item>
             </Col>
          </Row>

          {drawerMode === 'edit' && (
            <div style={{ marginTop: 16, textAlign: 'right' }}>
               <Button icon={<FileTextOutlined />} onClick={() => setDocumentViewerOpen(true)}>
                 Manage Documents {currentImport?.import_documents?.length ? `(${currentImport.import_documents.length})` : ''}
               </Button>
            </div>
          )}

        </Form>
      </FormDrawer>

      <DocumentViewer
        open={documentViewerOpen}
        onClose={() => setDocumentViewerOpen(false)}
        documents={[]} // TODO: wire up documents from currentImport properly
        readOnly={false}
        onUpload={async (file) => {
          message.info("Upload not implemented in this demo");
        }}
        onDelete={async (id) => {
            message.info("Delete not implemented in this demo");
        }}
      />
    </div>
  );
}
