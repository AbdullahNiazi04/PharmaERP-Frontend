"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Tag,
  Modal,
  Typography,
  Card,
  Statistic,
  App,
} from "antd";
import {
  ApartmentOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer } from "@/components/common";
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  useEmployees,
  Department,
  CreateDepartmentDto,
} from "@/hooks/useHRM";
import type { ColumnsType } from "antd/es/table";

const { Text } = Typography;

export default function DepartmentsPage() {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentDept, setCurrentDept] = useState<Department | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  // API Hooks
  const { data: departments = [], isLoading, refetch } = useDepartments();
  const { data: employees = [] } = useEmployees();
  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();

  // Get employee count per department
  const getEmployeeCount = useCallback((deptId: string) => {
    return employees.filter(e => e.departmentId === deptId).length;
  }, [employees]);

  // Get manager name
  const getManagerName = useCallback((managerId?: string) => {
    if (!managerId) return null;
    const manager = employees.find(e => e.id === managerId);
    return manager ? manager.fullName : managerId;
  }, [employees]);

  // Manager options
  const managerOptions = useMemo(() => {
    return employees.map(e => ({ value: e.id, label: `${e.employeeCode} - ${e.fullName}` }));
  }, [employees]);

  // Summary stats
  const summaryStats = useMemo(() => ({
    total: departments.length,
    totalEmployees: employees.length,
  }), [departments, employees]);

  // Table columns
  const columns: ColumnsType<Department> = useMemo(
    () => [
      {
        title: "Department Name",
        dataIndex: "name",
        key: "name",
        width: 200,
        fixed: "left",
        render: (text: string) => (
          <Text strong style={{ color: "#13c2c2" }}>
            {text}
          </Text>
        ),
      },
      {
        title: "Manager",
        dataIndex: "managerId",
        key: "managerId",
        width: 200,
        render: (id: string) => getManagerName(id) || <Text type="secondary">Not Assigned</Text>,
      },
      {
        title: "Employees",
        key: "employeeCount",
        width: 120,
        render: (_: unknown, record: Department) => (
          <Tag color="blue">{getEmployeeCount(record.id)} employees</Tag>
        ),
      },
      {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 150,
        render: (date: string) => date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
    ],
    [getManagerName, getEmployeeCount]
  );

  // Summary component
  const summaryComponent = useMemo(
    () => (
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={12}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #e6fffb 0%, #87e8de 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#006d75" }}>Total Departments</span>}
              value={summaryStats.total}
              styles={{ content: { fontSize: 18, color: "#006d75" } }}
              prefix={<ApartmentOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#389e0d" }}>Total Employees</span>}
              value={summaryStats.totalEmployees}
              styles={{ content: { fontSize: 18, color: "#389e0d" } }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>
    ),
    [summaryStats]
  );

  // Handlers
  const handleAdd = useCallback(() => {
    setCurrentDept(null);
    setDrawerMode("create");
    form.resetFields();
    setDrawerOpen(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: Department) => {
      setCurrentDept(record);
      setDrawerMode("edit");
      form.setFieldsValue(record);
      setDrawerOpen(true);
    },
    [form]
  );

  const handleView = useCallback((record: Department) => {
    setCurrentDept(record);
    setDocumentViewerOpen(true);
  }, []);

  const handleDelete = useCallback(
    (record: Department) => {
      modal.confirm({
        title: "Delete Department",
        content: `Are you sure you want to delete "${record.name}"?`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await deleteDept.mutateAsync(record.id);
            message.success("Department deleted successfully");
          } catch (error: any) {
            message.error(error.message || "Failed to delete department");
          }
        },
      });
    },
    [deleteDept, modal, message]
  );

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      const data: CreateDepartmentDto = {
        name: values.name as string,
        managerId: values.managerId as string | undefined,
      };

      try {
        if (drawerMode === "create") {
          await createDept.mutateAsync(data);
          message.success("Department created successfully");
        } else if (drawerMode === "edit" && currentDept) {
          await updateDept.mutateAsync({ id: currentDept.id, data });
          message.success("Department updated successfully");
        }

        setDrawerOpen(false);
        form.resetFields();
      } catch (error: any) {
        message.error(error.message || "Failed to save department");
      }
    },
    [createDept, updateDept, drawerMode, currentDept, form, message]
  );

  // Document sections
  const documentSections = useMemo(() => {
    if (!currentDept) return [];
    return [
      {
        title: "Department Information",
        items: [
          { label: "Department Name", value: <Text strong style={{ fontSize: 16 }}>{currentDept.name}</Text> },
          { label: "Manager", value: getManagerName(currentDept.managerId) || "Not Assigned" },
          { label: "Employee Count", value: <Tag color="blue">{getEmployeeCount(currentDept.id)} employees</Tag> },
        ],
      },
      {
        title: "Audit Trail",
        items: [
          { label: "Created At", value: currentDept.createdAt ? dayjs(currentDept.createdAt).format("MMMM DD, YYYY HH:mm") : null },
          { label: "Last Updated", value: currentDept.updatedAt ? dayjs(currentDept.updatedAt).format("MMMM DD, YYYY HH:mm") : null },
        ],
      },
    ];
  }, [currentDept, getManagerName, getEmployeeCount]);

  return (
    <div style={{ padding: 24 }}>
      <EnterpriseDataTable<Department>
        title="Departments"
        subtitle="Organize company departments"
        tableKey="hrm-departments"
        columns={columns}
        data={departments}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        exportFileName="departments"
        showSelection
        showActions
        summary={summaryComponent}
      />

      <FormDrawer
        title="Department"
        formKey="hrm-department"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        onDelete={drawerMode === "edit" && currentDept ? () => handleDelete(currentDept) : undefined}
        loading={createDept.isPending || updateDept.isPending}
        mode={drawerMode}
        width={450}
        form={form}
        initialValues={currentDept || undefined}
        entityId={currentDept?.id}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Department Name"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="Enter department name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="managerId" label="Department Manager">
              <Select
                placeholder="Select manager (optional)"
                options={managerOptions}
                allowClear
                showSearch
                filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
              />
            </Form.Item>
          </Col>
        </Row>
      </FormDrawer>

      {currentDept && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Department Profile"
          documentNumber={currentDept.name}
          sections={documentSections}
          signatures={[{ title: "HR Director" }]}
          fileName="department_profile"
        />
      )}
    </div>
  );
}
