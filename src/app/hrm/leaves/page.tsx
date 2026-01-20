"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Form,
  Select,
  Row,
  Col,
  Tag,
  Modal,
  Typography,
  Card,
  Statistic,
  DatePicker,
  Input,
  Button,
  Space,
  App,
} from "antd";
import {
  ScheduleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer } from "@/components/common";
import {
  useLeaveRequests,
  useCreateLeaveRequest,
  useApproveLeaveRequest,
  useRejectLeaveRequest,
  useDeleteLeaveRequest,
  useEmployees,
  LeaveRequest,
  CreateLeaveRequestDto,
} from "@/hooks/useHRM";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;
const { Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const statusColors: Record<string, string> = {
  Pending: "gold",
  Approved: "green",
  Rejected: "red",
};

const leaveTypeColors: Record<string, string> = {
  Sick: "red",
  Casual: "blue",
  Annual: "green",
  Maternity: "magenta",
};

export default function LeavesPage() {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentLeave, setCurrentLeave] = useState<LeaveRequest | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  const { data: leaves = [], isLoading, refetch } = useLeaveRequests();
  const { data: employees = [] } = useEmployees();
  const createLeave = useCreateLeaveRequest();
  const approveLeave = useApproveLeaveRequest();
  const rejectLeave = useRejectLeaveRequest();
  const deleteLeave = useDeleteLeaveRequest();

  const employeeOptions = useMemo(() => employees.map(e => ({ value: e.id, label: `${e.employeeCode} - ${e.fullName}` })), [employees]);
  
  const getEmployeeName = useCallback((id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.fullName : id;
  }, [employees]);

  const summaryStats = useMemo(() => {
    const total = leaves.length;
    const pendingCount = leaves.filter(l => l.status === "Pending").length;
    const approvedCount = leaves.filter(l => l.status === "Approved").length;
    const rejectedCount = leaves.filter(l => l.status === "Rejected").length;
    return { total, pendingCount, approvedCount, rejectedCount };
  }, [leaves]);

  const columns: ColumnsType<LeaveRequest> = useMemo(
    () => [
      {
        title: "Employee",
        dataIndex: "employeeId",
        key: "employeeId",
        width: 180,
        fixed: "left",
        render: (id: string) => <Text strong>{getEmployeeName(id)}</Text>,
      },
      {
        title: "Leave Type",
        dataIndex: "leaveType",
        key: "leaveType",
        width: 110,
        render: (type: string) => <Tag color={leaveTypeColors[type] || "default"}>{type}</Tag>,
      },
      {
        title: "Start Date",
        dataIndex: "startDate",
        key: "startDate",
        width: 120,
        render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
      },
      {
        title: "End Date",
        dataIndex: "endDate",
        key: "endDate",
        width: 120,
        render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
      },
      {
        title: "Days",
        dataIndex: "totalDays",
        key: "totalDays",
        width: 80,
        render: (days: number) => <Tag>{days} days</Tag>,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (status: string) => (
          <Tag color={statusColors[status] || "default"}>
            {status === "Approved" ? <CheckCircleOutlined /> : status === "Rejected" ? <CloseCircleOutlined /> : <ClockCircleOutlined />} {status}
          </Tag>
        ),
      },
      {
        title: "Reason",
        dataIndex: "reason",
        key: "reason",
        width: 200,
        ellipsis: true,
      },
      {
        title: "Actions",
        key: "approvalActions",
        width: 150,
        render: (_: unknown, record: LeaveRequest) => {
          if (record.status === "Pending") {
            return (
              <Space size="small">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(record);
                  }}
                >
                  Approve
                </Button>
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject(record);
                  }}
                >
                  Reject
                </Button>
              </Space>
            );
          }
          return null;
        },
      },
    ],
    [getEmployeeName]
  );

  const summaryComponent = useMemo(
    () => (
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%)", border: "none" }}>
            <Statistic title={<span style={{ fontSize: 11, color: "#531dab" }}>Total Requests</span>} value={summaryStats.total} styles={{ content: { fontSize: 18, color: "#531dab" } }} prefix={<ScheduleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)", border: "none" }}>
            <Statistic title={<span style={{ fontSize: 11, color: "#d46b08" }}>Pending</span>} value={summaryStats.pendingCount} styles={{ content: { fontSize: 18, color: "#d46b08" } }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic title={<span style={{ fontSize: 11, color: "#389e0d" }}>Approved</span>} value={summaryStats.approvedCount} styles={{ content: { fontSize: 18, color: "#389e0d" } }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff1f0 0%, #ffa39e 100%)", border: "none" }}>
            <Statistic title={<span style={{ fontSize: 11, color: "#cf1322" }}>Rejected</span>} value={summaryStats.rejectedCount} styles={{ content: { fontSize: 18, color: "#cf1322" } }} prefix={<CloseCircleOutlined />} />
          </Card>
        </Col>
      </Row>
    ),
    [summaryStats]
  );

  const handleAdd = useCallback(() => {
    setCurrentLeave(null);
    setDrawerMode("create");
    form.resetFields();
    setDrawerOpen(true);
  }, [form]);

  const handleView = useCallback((record: LeaveRequest) => {
    setCurrentLeave(record);
    setDocumentViewerOpen(true);
  }, []);

  const handleDelete = useCallback((record: LeaveRequest) => {
    modal.confirm({
      title: "Delete Leave Request",
      content: "Are you sure you want to delete this leave request?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteLeave.mutateAsync(record.id);
          message.success("Leave request deleted");
        } catch (error: any) {
          message.error(error.message || "Failed to delete leave request");
        }
      },
    });
  }, [deleteLeave, modal, message]);

  const handleApprove = useCallback((record: LeaveRequest) => {
    modal.confirm({
      title: "Approve Leave Request",
      content: `Approve ${getEmployeeName(record.employeeId)}'s ${record.leaveType} leave for ${record.totalDays} days?`,
      okText: "Approve",
      okType: "primary",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await approveLeave.mutateAsync(record.id);
          message.success("Leave request approved");
        } catch (error: any) {
          message.error(error.message || "Failed to approve leave request");
        }
      },
    });
  }, [approveLeave, getEmployeeName, modal, message]);

  const handleReject = useCallback((record: LeaveRequest) => {
    modal.confirm({
      title: "Reject Leave Request",
      content: `Reject ${getEmployeeName(record.employeeId)}'s ${record.leaveType} leave request?`,
      okText: "Reject",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await rejectLeave.mutateAsync(record.id);
          message.success("Leave request rejected");
        } catch (error: any) {
          message.error(error.message || "Failed to reject leave request");
        }
      },
    });
  }, [rejectLeave, getEmployeeName, modal, message]);

  const handleSubmit = useCallback(async (values: Record<string, unknown>) => {
    const dateRange = values.dateRange as [dayjs.Dayjs, dayjs.Dayjs];
    const startDate = dateRange[0];
    const endDate = dateRange[1];
    const totalDays = endDate.diff(startDate, "day") + 1;

    const data: CreateLeaveRequestDto = {
      employeeId: values.employeeId as string,
      leaveType: values.leaveType as "Sick" | "Casual" | "Annual" | "Maternity",
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
      totalDays,
      reason: values.reason as string,
    };

    try {
      await createLeave.mutateAsync(data);
      message.success("Leave request submitted successfully");
      setDrawerOpen(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || "Failed to submit leave request");
    }
  }, [createLeave, form, message]);

  const documentSections = useMemo(() => {
    if (!currentLeave) return [];
    return [
      {
        title: "Leave Request Details",
        items: [
          { label: "Employee", value: <Text strong>{getEmployeeName(currentLeave.employeeId)}</Text> },
          { label: "Leave Type", value: <Tag color={leaveTypeColors[currentLeave.leaveType]}>{currentLeave.leaveType}</Tag> },
          { label: "Status", value: <Tag color={statusColors[currentLeave.status || ""]}>{currentLeave.status}</Tag> },
        ],
      },
      {
        title: "Duration",
        items: [
          { label: "Start Date", value: dayjs(currentLeave.startDate).format("MMMM DD, YYYY") },
          { label: "End Date", value: dayjs(currentLeave.endDate).format("MMMM DD, YYYY") },
          { label: "Total Days", value: `${currentLeave.totalDays} days` },
        ],
      },
      {
        title: "Details",
        items: [
          { label: "Reason", value: currentLeave.reason, span: 2 },
          { label: "Approved By", value: currentLeave.approvedBy ? getEmployeeName(currentLeave.approvedBy) : "-" },
        ],
      },
    ];
  }, [currentLeave, getEmployeeName]);

  return (
    <div style={{ padding: 24 }}>
      <EnterpriseDataTable<LeaveRequest>
        title="Leave Management"
        subtitle="Handle leave requests and approvals"
        tableKey="hrm-leaves"
        columns={columns}
        data={leaves}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onAdd={handleAdd}
        onView={handleView}
        onDelete={handleDelete}
        exportFileName="leave_requests"
        showSelection
        showActions
        summary={summaryComponent}
      />

      <FormDrawer
        title="Leave Request"
        formKey="hrm-leave-v2"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        loading={createLeave.isPending}
        mode={drawerMode}
        width={500}
        form={form}
        initialValues={currentLeave || undefined}
        entityId={currentLeave?.id}
        onDraftLoaded={(data) => ({
          ...data,
          dateRange: data.dateRange && Array.isArray(data.dateRange)
            ? [dayjs(data.dateRange[0] as string), dayjs(data.dateRange[1] as string)]
            : undefined,
        })}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="employeeId" label="Employee" rules={[{ required: true, message: "Required" }]}>
              <Select placeholder="Select employee" options={employeeOptions} showSearch filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="leaveType" label="Leave Type" rules={[{ required: true, message: "Required" }]}>
              <Select placeholder="Select leave type">
                <Option value="Sick">Sick Leave</Option>
                <Option value="Casual">Casual Leave</Option>
                <Option value="Annual">Annual Leave</Option>
                <Option value="Maternity">Maternity Leave</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="dateRange" label="Leave Period" rules={[{ required: true, message: "Required" }]}>
              <RangePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="reason" label="Reason">
              <TextArea rows={3} placeholder="Reason for leave" />
            </Form.Item>
          </Col>
        </Row>
      </FormDrawer>

      {currentLeave && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Leave Request"
          documentNumber={`LR-${currentLeave.id.slice(0, 6).toUpperCase()}`}
          status={{ text: currentLeave.status || "Pending", color: statusColors[currentLeave.status || "Pending"] }}
          sections={documentSections}
          signatures={[{ title: "Employee" }, { title: "HR Manager" }]}
          fileName="leave_request"
        />
      )}
    </div>
  );
}
