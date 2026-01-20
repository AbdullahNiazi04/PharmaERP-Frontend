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
  Typography,
  Card,
  Statistic,
  DatePicker,
  InputNumber,
  App,
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  IdcardOutlined,
  BankOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer } from "@/components/common";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useDepartments,
  useDesignations,
  Employee,
  CreateEmployeeDto,
} from "@/hooks/useHRM";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;
const { Text } = Typography;

// Status color mapping
const statusColors: Record<string, string> = {
  Active: "green",
  "On Leave": "gold",
  Terminated: "red",
  Resigned: "default",
};

// Employment type colors
const employmentTypeColors: Record<string, string> = {
  Permanent: "blue",
  Contract: "orange",
  "Daily Wager": "purple",
};

// Gender colors
const genderColors: Record<string, string> = {
  Male: "blue",
  Female: "magenta",
  Other: "purple",
};

export default function EmployeesPage() {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  // API Hooks
  const { data: employees = [], isLoading, refetch } = useEmployees();
  const { data: departments = [] } = useDepartments();
  const { data: designations = [] } = useDesignations();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  // Dropdown options
  const departmentOptions = useMemo(() => departments.map(d => ({ value: d.id, label: d.name })), [departments]);
  const designationOptions = useMemo(() => designations.map(d => ({ value: d.id, label: d.title })), [designations]);

  // Helper functions
  const getDepartmentName = useCallback((id: string) => departments.find(d => d.id === id)?.name || id, [departments]);
  const getDesignationTitle = useCallback((id: string) => designations.find(d => d.id === id)?.title || id, [designations]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = employees.length;
    const activeCount = employees.filter((e) => e.status === "Active").length;
    const permanentCount = employees.filter((e) => e.employmentType === "Permanent").length;
    const contractCount = employees.filter((e) => e.employmentType === "Contract").length;
    const onLeaveCount = employees.filter((e) => e.status === "On Leave").length;

    return { total, activeCount, permanentCount, contractCount, onLeaveCount };
  }, [employees]);

  // Table columns
  const columns: ColumnsType<Employee> = useMemo(
    () => [
      {
        title: "Employee Code",
        dataIndex: "employeeCode",
        key: "employeeCode",
        width: 130,
        fixed: "left",
        render: (text: string) => (
          <Text strong style={{ color: "#13c2c2" }}>
            {text}
          </Text>
        ),
      },
      {
        title: "Full Name",
        dataIndex: "fullName",
        key: "fullName",
        width: 180,
        render: (text: string) => <Text strong>{text}</Text>,
      },
      {
        title: "Department",
        dataIndex: "departmentId",
        key: "departmentId",
        width: 150,
        render: (id: string) => getDepartmentName(id),
      },
      {
        title: "Designation",
        dataIndex: "designationId",
        key: "designationId",
        width: 150,
        render: (id: string) => getDesignationTitle(id),
      },
      {
        title: "Employment Type",
        dataIndex: "employmentType",
        key: "employmentType",
        width: 130,
        render: (type: string) => (
          <Tag color={employmentTypeColors[type] || "default"}>{type}</Tag>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        render: (status: string) => (
          <Tag color={statusColors[status] || "default"}>{status}</Tag>
        ),
      },
      {
        title: "Joining Date",
        dataIndex: "joiningDate",
        key: "joiningDate",
        width: 120,
        render: (date: string) => date ? dayjs(date).format("MMM DD, YYYY") : "-",
      },
      {
        title: "Basic Salary",
        dataIndex: "basicSalary",
        key: "basicSalary",
        width: 120,
        render: (salary: number) => `₨ ${Number(salary || 0).toLocaleString()}`,
      },
    ],
    [getDepartmentName, getDesignationTitle]
  );

  // Summary component
  const summaryComponent = useMemo(
    () => (
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={5}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #e6fffb 0%, #87e8de 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#006d75" }}>Total Employees</span>}
              value={summaryStats.total}
              styles={{ content: { fontSize: 18, color: "#006d75" } }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#389e0d" }}>Active</span>}
              value={summaryStats.activeCount}
              styles={{ content: { fontSize: 18, color: "#389e0d" } }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #e6f4ff 0%, #91caff 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#0958d9" }}>Permanent</span>}
              value={summaryStats.permanentCount}
              styles={{ content: { fontSize: 18, color: "#0958d9" } }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#d46b08" }}>Contract</span>}
              value={summaryStats.contractCount}
              styles={{ content: { fontSize: 18, color: "#d46b08" } }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#d48806" }}>On Leave</span>}
              value={summaryStats.onLeaveCount}
              styles={{ content: { fontSize: 18, color: "#d48806" } }}
            />
          </Card>
        </Col>
      </Row>
    ),
    [summaryStats]
  );

  // Handlers
  const handleAdd = useCallback(() => {
    setCurrentEmployee(null);
    setDrawerMode("create");
    form.resetFields();
    form.setFieldsValue({
      employeeCode: `EMP-${Date.now().toString().slice(-6)}`,
      status: "Active",
      employmentType: "Permanent",
    });
    setDrawerOpen(true);
  }, [form]);

  const handleEdit = useCallback(
    (record: Employee) => {
      setCurrentEmployee(record);
      setDrawerMode("edit");
      setDrawerOpen(true);
    },
    []
  );

  const handleView = useCallback((record: Employee) => {
    setCurrentEmployee(record);
    setDocumentViewerOpen(true);
  }, []);

  const handleDelete = useCallback(
    (record: Employee) => {
      modal.confirm({
        title: "Delete Employee",
        content: `Are you sure you want to delete "${record.fullName}"? This action cannot be undone.`,
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await deleteEmployee.mutateAsync(record.id);
            message.success("Employee deleted successfully");
          } catch (error: any) {
            message.error(error.message || "Failed to delete employee");
          }
        },
      });
    },
    [deleteEmployee, modal, message]
  );

  const handleBulkDelete = useCallback(
    async (records: Employee[]) => {
      modal.confirm({
        title: "Delete Selected Employees",
        content: `Are you sure you want to delete ${records.length} employees?`,
        okText: "Delete All",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            for (const record of records) {
              await deleteEmployee.mutateAsync(record.id);
            }
            message.success("Selected employees deleted successfully");
          } catch (error: any) {
            message.error(error.message || "Failed to delete some employees");
          }
        },
      });
    },
    [deleteEmployee, modal, message]
  );

  const handleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      const data: CreateEmployeeDto = {
        employeeCode: values.employeeCode as string,
        fullName: values.fullName as string,
        cnicPassport: values.cnicPassport as string,
        dateOfBirth: (values.dateOfBirth as dayjs.Dayjs)?.format("YYYY-MM-DD"),
        gender: values.gender as "Male" | "Female" | "Other",
        departmentId: values.departmentId as string,
        designationId: values.designationId as string,
        joiningDate: (values.joiningDate as dayjs.Dayjs)?.format("YYYY-MM-DD"),
        employmentType: values.employmentType as "Permanent" | "Contract" | "Daily Wager",
        status: values.status as "Active" | "On Leave" | "Terminated" | "Resigned",
        basicSalary: values.basicSalary as number,
        bankAccount: values.bankAccount as string,
        socialSecurityNo: values.socialSecurityNo as string,
      };

      try {
        if (drawerMode === "create") {
          await createEmployee.mutateAsync(data);
          message.success("Employee created successfully");
        } else if (drawerMode === "edit" && currentEmployee) {
          await updateEmployee.mutateAsync({ id: currentEmployee.id, data });
          message.success("Employee updated successfully");
        }

        setDrawerOpen(false);
        form.resetFields();
      } catch (error: any) {
        message.error(error.message || "Failed to save employee");
      }
    },
    [createEmployee, updateEmployee, drawerMode, currentEmployee, form, message]
  );

  // Document viewer sections
  const documentSections = useMemo(() => {
    if (!currentEmployee) return [];

    return [
      {
        title: "Personal Information",
        items: [
          { label: "Employee Code", value: <Text strong style={{ fontSize: 16 }}>{currentEmployee.employeeCode}</Text> },
          { label: "Full Name", value: <Text strong>{currentEmployee.fullName}</Text> },
          { label: "CNIC/Passport", value: currentEmployee.cnicPassport },
          { label: "Date of Birth", value: currentEmployee.dateOfBirth ? dayjs(currentEmployee.dateOfBirth).format("MMMM DD, YYYY") : null },
          { label: "Gender", value: currentEmployee.gender ? <Tag color={genderColors[currentEmployee.gender]}>{currentEmployee.gender}</Tag> : null },
        ],
      },
      {
        title: "Employment Details",
        items: [
          { label: "Department", value: getDepartmentName(currentEmployee.departmentId) },
          { label: "Designation", value: getDesignationTitle(currentEmployee.designationId) },
          { label: "Joining Date", value: currentEmployee.joiningDate ? dayjs(currentEmployee.joiningDate).format("MMMM DD, YYYY") : null },
          { label: "Employment Type", value: <Tag color={employmentTypeColors[currentEmployee.employmentType || ""]}>{currentEmployee.employmentType}</Tag> },
          { label: "Status", value: <Tag color={statusColors[currentEmployee.status || ""]}>{currentEmployee.status}</Tag> },
        ],
      },
      {
        title: "Financial Information",
        items: [
          { label: "Basic Salary", value: <Text strong>₨ {Number(currentEmployee.basicSalary || 0).toLocaleString()}</Text> },
          { label: "Bank Account", value: currentEmployee.bankAccount },
          { label: "Social Security No", value: currentEmployee.socialSecurityNo },
        ],
      },
    ];
  }, [currentEmployee, getDepartmentName, getDesignationTitle]);

  return (
    <div style={{ padding: 24 }}>
      <EnterpriseDataTable<Employee>
        title="Employee Management"
        subtitle="Manage employee records and information"
        tableKey="hrm-employees"
        columns={columns}
        data={employees}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        exportFileName="employees"
        showSelection
        showActions
        summary={summaryComponent}
      />

      {/* Create/Edit Drawer */}

        <FormDrawer
        title="Employee"
        formKey="hrm-employee-v2"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        onDelete={drawerMode === "edit" && currentEmployee ? () => handleDelete(currentEmployee) : undefined}
        loading={createEmployee.isPending || updateEmployee.isPending}
        mode={drawerMode}
        width={650}
        form={form}

        initialValues={useMemo(() => {
          if (!currentEmployee) return undefined;
          return {
            ...currentEmployee,
            dateOfBirth: currentEmployee.dateOfBirth ? dayjs(currentEmployee.dateOfBirth) : undefined,
            joiningDate: currentEmployee.joiningDate ? dayjs(currentEmployee.joiningDate) : undefined,
          };
        }, [currentEmployee])}
        entityId={currentEmployee?.id}

        onDraftLoaded={(data) => ({
          ...data,
          dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth as string) : undefined,
          joiningDate: data.joiningDate ? dayjs(data.joiningDate as string) : undefined,
        })}
      >
        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <UserOutlined /> Personal Information
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="employeeCode"
              label="Employee Code"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="EMP-XXXXXX" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="cnicPassport"
              label="CNIC / Passport"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="Enter CNIC or passport number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: "Required" }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="gender" label="Gender">
              <Select placeholder="Select">
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="dateOfBirth"
              label="Date of Birth"
              rules={[{ required: true, message: "Required" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="joiningDate"
              label="Joining Date"
              rules={[{ required: true, message: "Required" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <IdcardOutlined /> Employment Details
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="departmentId"
              label="Department"
              rules={[{ required: true, message: "Required" }]}
            >
              <Select placeholder="Select department" options={departmentOptions} showSearch filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="designationId"
              label="Designation"
              rules={[{ required: true, message: "Required" }]}
            >
              <Select placeholder="Select designation" options={designationOptions} showSearch filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="employmentType" label="Employment Type" initialValue="Permanent">
              <Select>
                <Option value="Permanent">Permanent</Option>
                <Option value="Contract">Contract</Option>
                <Option value="Daily Wager">Daily Wager</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label="Status" initialValue="Active">
              <Select>
                <Option value="Active">Active</Option>
                <Option value="On Leave">On Leave</Option>
                <Option value="Terminated">Terminated</Option>
                <Option value="Resigned">Resigned</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider styles={{ content: { margin: 0 } }} style={{ fontSize: 13 }}>
          <BankOutlined /> Financial Information
        </Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="basicSalary"
              label="Basic Salary (₨)"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} placeholder="Enter basic salary" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="bankAccount" label="Bank Account">
              <Input placeholder="Bank account number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="socialSecurityNo" label="Social Security No">
              <Input placeholder="Social security number" />
            </Form.Item>
          </Col>
        </Row>
      </FormDrawer>

      {/* Document Viewer */}
      {currentEmployee && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Employee Profile"
          documentNumber={currentEmployee.employeeCode}
          documentDate={
            currentEmployee.joiningDate
              ? dayjs(currentEmployee.joiningDate).format("MMMM DD, YYYY")
              : undefined
          }
          status={{
            text: currentEmployee.status || "Active",
            color: statusColors[currentEmployee.status || "Active"] || "default",
          }}
          sections={documentSections}
          signatures={[
            { title: "HR Manager" },
            { title: "Department Head" },
          ]}
          fileName="employee_profile"
        />
      )}
    </div>
  );
}
