"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Form,
  Input,
  InputNumber,
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
  DatePicker,
  Button,
  Space,
  Table,
} from "antd";
import {
  ShoppingCartOutlined,
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CarOutlined,
  PlusOutlined,
  DeleteOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer } from "@/components/common";
import {
  useCustomers,
  useSalesOrders,
  useCreateSalesOrder,
  useUpdateSalesOrder,
  useDeleteSalesOrder,
  SalesOrder,
  CreateSalesOrderDto,
} from "@/hooks/useSales";
import { useFinishedGoods } from "@/hooks/useFinishedGoods";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;
const { Text } = Typography;

// Order status color mapping
const orderStatusColors: Record<string, string> = {
  Draft: "default",
  Confirmed: "blue",
  Dispatched: "purple",
  Delivered: "green",
  Cancelled: "red",
};

export default function SalesOrdersPage() {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentOrder, setCurrentOrder] = useState<SalesOrder | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  // API Hooks
  const { data: customers = [] } = useCustomers();
  const { data: salesOrders = [], isLoading, refetch } = useSalesOrders();
  const { data: finishedGoods = [] } = useFinishedGoods();
  const createOrder = useCreateSalesOrder();
  const updateOrder = useUpdateSalesOrder();
  const deleteOrder = useDeleteSalesOrder();

  // Customer options for select
  const customerOptions = useMemo(() => {
    return customers.map((c) => ({
      value: c.id,
      label: c.name,
    }));
  }, [customers]);

  // Product options for select
  const productOptions = useMemo(() => {
    return finishedGoods.map((fg) => ({
      value: fg.id,
      label: `${fg.itemCode} - ${fg.itemName}`,
      mrp: Number(fg.mrp) || 0,
    }));
  }, [finishedGoods]);

  // Get product name by ID
  const getProductName = useCallback((itemId: string) => {
    const product = finishedGoods.find((fg) => fg.id === itemId);
    return product ? `${product.itemCode} - ${product.itemName}` : itemId;
  }, [finishedGoods]);

  // Get customer name by ID
  const getCustomerName = useCallback((customerId: string) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : customerId;
  }, [customers]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = salesOrders.length;
    const draftCount = salesOrders.filter((o) => o.status === "Draft").length;
    const confirmedCount = salesOrders.filter((o) => o.status === "Confirmed").length;
    const dispatchedCount = salesOrders.filter((o) => o.status === "Dispatched").length;
    const deliveredCount = salesOrders.filter((o) => o.status === "Delivered").length;
    const totalRevenue = salesOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    return { total, draftCount, confirmedCount, dispatchedCount, deliveredCount, totalRevenue };
  }, [salesOrders]);

  // Table columns
  const columns: ColumnsType<SalesOrder> = useMemo(
    () => [
      {
        title: "Order ID",
        dataIndex: "id",
        key: "id",
        width: 280,
        fixed: "left",
        render: (text: string) => (
          <Text strong style={{ color: "#fa541c", fontSize: 11 }}>
            {text?.slice(0, 8)}...
          </Text>
        ),
      },
      {
        title: "Customer",
        dataIndex: "customerId",
        key: "customerId",
        width: 200,
        render: (customerId: string) => <Text>{getCustomerName(customerId)}</Text>,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (status: string) => {
          const icon =
            status === "Delivered" ? <CheckCircleOutlined /> :
            status === "Dispatched" ? <CarOutlined /> :
            status === "Confirmed" ? <CheckCircleOutlined /> :
            <ClockCircleOutlined />;
          return (
            <Tag color={orderStatusColors[status] || "default"}>
              {icon} {status}
            </Tag>
          );
        },
      },
      {
        title: "Order Date",
        dataIndex: "orderDate",
        key: "orderDate",
        width: 120,
        render: (date: string) =>
          date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
      {
        title: "Delivery Date",
        dataIndex: "deliveryDate",
        key: "deliveryDate",
        width: 120,
        render: (date: string) =>
          date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
      {
        title: "Total Amount",
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 120,
        render: (amount: number) => (amount ? `₨ ${Number(amount).toLocaleString()}` : "-"),
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
    [getCustomerName]
  );

  // Summary component
  const summaryComponent = useMemo(
    () => (
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff2e8 0%, #ffbb96 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#d4380d" }}>Total Orders</span>}
              value={summaryStats.total}
              styles={{ content: { fontSize: 18, color: "#d4380d" } }}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f5f5f5 0%, #d9d9d9 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#595959" }}>Draft</span>}
              value={summaryStats.draftCount}
              styles={{ content: { fontSize: 18, color: "#595959" } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #e6f4ff 0%, #91caff 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#0958d9" }}>Confirmed</span>}
              value={summaryStats.confirmedCount}
              styles={{ content: { fontSize: 18, color: "#0958d9" } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#722ed1" }}>Dispatched</span>}
              value={summaryStats.dispatchedCount}
              styles={{ content: { fontSize: 18, color: "#722ed1" } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#389e0d" }}>Delivered</span>}
              value={summaryStats.deliveredCount}
              styles={{ content: { fontSize: 18, color: "#389e0d" } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #e6f4ff 0%, #91caff 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#0958d9" }}>Revenue</span>}
              value={summaryStats.totalRevenue}
              styles={{ content: { fontSize: 18, color: "#0958d9" } }}
              prefix="₨"
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
        orderDate: dayjs(),
      };
    }

    if (currentOrder) {
      return {
        ...currentOrder,
        orderDate: currentOrder.orderDate ? dayjs(currentOrder.orderDate) : undefined,
        deliveryDate: currentOrder.deliveryDate ? dayjs(currentOrder.deliveryDate) : undefined,
      };
    }
    
    return undefined;
  }, [drawerMode, currentOrder, drawerOpen]);

  // Handlers
  const handleAdd = useCallback(() => {
    setCurrentOrder(null);
    setDrawerMode("create");
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback(
    (record: SalesOrder) => {
      setCurrentOrder(record);
      setDrawerMode("edit");
      setDrawerOpen(true);
    },
    []
  );

  const handleView = useCallback((record: SalesOrder) => {
    setCurrentOrder(record);
    setDocumentViewerOpen(true);
  }, []);

  const handleDelete = useCallback(
    (record: SalesOrder) => {
      modal.confirm({
        title: "Delete Sales Order",
        content: `Are you sure you want to delete this order? This action cannot be undone.`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await deleteOrder.mutateAsync(record.id);
            message.success("Sales order deleted successfully");
          } catch (error: any) {
             message.error(error.message || "Failed to delete sales order");
          }
        },
      });
    },
    [deleteOrder, modal, message]
  );

  const handleBulkDelete = useCallback(
    async (records: SalesOrder[]) => {
      modal.confirm({
        title: "Delete Selected Orders",
        content: `Are you sure you want to delete ${records.length} orders? This action cannot be undone.`,
        okText: "Delete All",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            for (const record of records) {
              await deleteOrder.mutateAsync(record.id);
            }
            message.success("Selected orders deleted successfully");
          } catch (error: any) {
             message.error(error.message || "Failed to delete some orders");
          }
        },
      });
    },
    [deleteOrder, modal, message]
  );

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      // Build items array from form
      const formItems = (values.items as Array<{
        itemId: string;
        quantity: number;
        unitPrice: number;
        discount?: number;
        tax?: number;
      }>) || [];

      const data: CreateSalesOrderDto = {
        customerId: values.customerId as string,
        orderDate: (values.orderDate as dayjs.Dayjs)?.format("YYYY-MM-DD"),
        deliveryDate: (values.deliveryDate as dayjs.Dayjs)?.format("YYYY-MM-DD"),
        items: formItems.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity || 0,
          unitPrice: item.unitPrice || 0,
          discount: item.discount || 0,
          tax: item.tax || 0,
        })),
      };

      try {
        if (drawerMode === "create") {
          await createOrder.mutateAsync(data);
          message.success("Sales order created successfully");
        } else if (drawerMode === "edit" && currentOrder) {
          await updateOrder.mutateAsync({ id: currentOrder.id, data });
           message.success("Sales order updated successfully");
        }

        setDrawerOpen(false);
        form.resetFields();
      } catch (error: any) {
         message.error(error.message || "Failed to save sales order");
      }
    },
    [createOrder, updateOrder, drawerMode, currentOrder, form, message]
  );

  // Document viewer sections
  const documentSections = useMemo(() => {
    if (!currentOrder) return [];

    return [
      {
        title: "Order Information",
        items: [
          { label: "Order ID", value: <Text strong style={{ fontSize: 14 }}>{currentOrder.id?.slice(0, 8)}...</Text> },
          { label: "Customer", value: <Text strong>{getCustomerName(currentOrder.customerId)}</Text> },
          { 
            label: "Status", 
            value: (
              <Tag color={orderStatusColors[currentOrder.status || "Draft"]} style={{ fontSize: 13 }}>
                {currentOrder.status}
              </Tag>
            ) 
          },
          { label: "Created By", value: currentOrder.createdBy },
        ],
      },
      {
        title: "Dates & Amount",
        items: [
          { label: "Order Date", value: currentOrder.orderDate ? dayjs(currentOrder.orderDate).format("MMMM DD, YYYY") : null },
          { label: "Delivery Date", value: currentOrder.deliveryDate ? dayjs(currentOrder.deliveryDate).format("MMMM DD, YYYY") : null },
          { label: "Total Amount", value: currentOrder.totalAmount ? `₨ ${Number(currentOrder.totalAmount).toLocaleString()}` : null },
        ],
      },
      {
        title: "Audit Trail",
        items: [
          { label: "Created At", value: currentOrder.createdAt ? dayjs(currentOrder.createdAt).format("MMMM DD, YYYY HH:mm") : null },
          { label: "Last Updated", value: currentOrder.updatedAt ? dayjs(currentOrder.updatedAt).format("MMMM DD, YYYY HH:mm") : null },
        ],
      },
    ];
  }, [currentOrder, getCustomerName]);

  return (
    <div style={{ padding: 24 }}>
      <EnterpriseDataTable<SalesOrder>
        title="Sales Orders"
        subtitle="Create and manage sales orders"
        tableKey="sales-orders"
        columns={columns}
        data={salesOrders}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        exportFileName="sales_orders"
        showSelection
        showActions
        summary={summaryComponent}
      />

      {/* Create/Edit Drawer */}
      <FormDrawer
        title="Sales Order"
        formKey="sales-order-v3"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        onDelete={drawerMode === "edit" && currentOrder ? () => handleDelete(currentOrder) : undefined}
        loading={createOrder.isPending || updateOrder.isPending}
        mode={drawerMode}
        width={800}
        form={form}
        initialValues={formInitialValues}
        entityId={currentOrder?.id}
        onDraftLoaded={(data) => ({
          ...data,
          orderDate: data.orderDate && typeof data.orderDate === 'string' ? dayjs(data.orderDate) : data.orderDate,
          deliveryDate: data.deliveryDate && typeof data.deliveryDate === 'string' ? dayjs(data.deliveryDate) : data.deliveryDate,
        })}
      >
        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <FileTextOutlined /> Order Information
        </Divider>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="customerId"
              label="Customer"
              rules={[{ required: true, message: "Please select a customer" }]}
            >
              <Select
                placeholder="Select customer"
                options={customerOptions}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <CalendarOutlined /> Dates
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="orderDate"
              label="Order Date"
              rules={[{ required: true, message: "Required" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="deliveryDate"
              label="Expected Delivery Date"
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <DollarOutlined /> Order Details
        </Divider>

        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => {
                return (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 12, background: "#fafafa" }}
                    bodyStyle={{ padding: 12 }}
                  >
                    <Row gutter={12} align="middle">
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, "itemId"]}
                          label="Product"
                          rules={[{ required: true, message: "Select product" }]}
                          style={{ marginBottom: 0 }}
                        >
                          <Select
                            placeholder="Select product"
                            options={productOptions}
                            showSearch
                            filterOption={(input, option) =>
                              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                            }
                            onChange={(value) => {
                              // Auto-fill unit price from MRP
                              const product = productOptions.find((p) => p.value === value);
                              if (product) {
                                const items = form.getFieldValue("items") || [];
                                items[name] = { ...items[name], unitPrice: product.mrp };
                                form.setFieldsValue({ items });
                              }
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          name={[name, "quantity"]}
                          label="Qty"
                          rules={[{ required: true, message: "Required" }]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber min={1} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, "unitPrice"]}
                          label="Unit Price"
                          rules={[{ required: true, message: "Required" }]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber min={0} style={{ width: "100%" }} prefix="₨" />
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          name={[name, "discount"]}
                          label="Discount"
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={3}>
                        <Form.Item
                          {...restField}
                          name={[name, "tax"]}
                          label="Tax"
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber min={0} style={{ width: "100%" }} />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                          style={{ marginTop: 22 }}
                        />
                      </Col>
                    </Row>
                  </Card>
                );
              })}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add Product Item
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </FormDrawer>

      {/* Document Viewer */}
      {currentOrder && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Sales Order"
          documentNumber={currentOrder.id?.slice(0, 8) || ""}
          documentDate={
            currentOrder.orderDate
              ? dayjs(currentOrder.orderDate).format("MMMM DD, YYYY")
              : undefined
          }
          status={{
            text: currentOrder.status || "Draft",
            color: orderStatusColors[currentOrder.status || "Draft"] || "default",
          }}
          sections={documentSections}
          signatures={[
            { title: "Sales Rep" },
            { title: "Approved By" },
            { title: "Customer" },
          ]}
          fileName="sales_order"
        />
      )}
    </div>
  );
}
