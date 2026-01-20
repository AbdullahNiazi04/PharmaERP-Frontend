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
  TimePicker,
  InputNumber,
  Input,
  App,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer } from "@/components/common";
import {
  useAttendance,
  useCreateAttendance,
  useUpdateAttendance,
  useDeleteAttendance,
  useEmployees,
  Attendance,
  CreateAttendanceDto,
} from "@/hooks/useHRM";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;
const { Text } = Typography;

const statusColors: Record<string, string> = {
  Present: "green",
  Absent: "red",
  Late: "orange",
  "Half-Day": "gold",
};

const statusIcons: Record<string, React.ReactNode> = {
  Present: <CheckCircleOutlined />,
  Absent: <CloseCircleOutlined />,
  Late: <ClockCircleOutlined />,
  "Half-Day": <ClockCircleOutlined />,
};

export default function AttendancePage() {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentRecord, setCurrentRecord] = useState<Attendance | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  const { data: attendance = [], isLoading, refetch } = useAttendance();
  const { data: employees = [] } = useEmployees();
  const createAttendance = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();
  const deleteAttendance = useDeleteAttendance();

  const employeeOptions = useMemo(() => employees.map(e => ({ value: e.id, label: `${e.employeeCode} - ${e.fullName}` })), [employees]);
  const getEmployeeName = useCallback((id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.fullName : id;
  }, [employees]);

  const summaryStats = useMemo(() => {
    const total = attendance.length;
    const presentCount = attendance.filter(a => a.status === "Present").length;
    const absentCount = attendance.filter(a => a.status === "Absent").length;
    const lateCount = attendance.filter(a => a.status === "Late").length;
    return { total, presentCount, absentCount, lateCount };
  }, [attendance]);

  const columns: ColumnsType<Attendance> = useMemo(
    () => [
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        width: 120,
        fixed: "left",
        render: (date: string) => <Text strong style={{ color: "#13c2c2" }}>{dayjs(date).format("MMM DD, YYYY")}</Text>,
      },
      {
        title: "Employee",
        dataIndex: "employeeId",
        key: "employeeId",
        width: 200,
        render: (id: string) => getEmployeeName(id),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (status: string) => (
          <Tag color={statusColors[status] || "default"}>
            {statusIcons[status]} {status}
          </Tag>
        ),
      },
      {
        title: "Check In",
        dataIndex: "checkIn",
        key: "checkIn",
        width: 100,
        render: (time: string) => time ? dayjs(time).format("HH:mm") : "-",
      },
      {
        title: "Check Out",
        dataIndex: "checkOut",
        key: "checkOut",
        width: 100,
        render: (time: string) => time ? dayjs(time).format("HH:mm") : "-",
      },
      {
        title: "Overtime",
        dataIndex: "overtimeHours",
        key: "overtimeHours",
        width: 100,
        render: (hours: number) => hours ? `${hours} hrs` : "-",
      },
      {
        title: "Remarks",
        dataIndex: "remarks",
        key: "remarks",
        width: 200,
        ellipsis: true,
      },
    ],
    [getEmployeeName]
  );

  const summaryComponent = useMemo(
    () => (
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #e6fffb 0%, #87e8de 100%)", border: "none" }}>
            <Statistic title={<span style={{ fontSize: 11, color: "#006d75" }}>Total Records</span>} value={summaryStats.total} styles={{ content: { fontSize: 18, color: "#006d75" } }} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #f6ffed 0%, #b7eb8f 100%)", border: "none" }}>
            <Statistic title={<span style={{ fontSize: 11, color: "#389e0d" }}>Present</span>} value={summaryStats.presentCount} styles={{ content: { fontSize: 18, color: "#389e0d" } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff1f0 0%, #ffa39e 100%)", border: "none" }}>
            <Statistic title={<span style={{ fontSize: 11, color: "#cf1322" }}>Absent</span>} value={summaryStats.absentCount} styles={{ content: { fontSize: 18, color: "#cf1322" } }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)", border: "none" }}>
            <Statistic title={<span style={{ fontSize: 11, color: "#d46b08" }}>Late</span>} value={summaryStats.lateCount} styles={{ content: { fontSize: 18, color: "#d46b08" } }} />
          </Card>
        </Col>
      </Row>
    ),
    [summaryStats]
  );

  const handleAdd = useCallback(() => {
    setCurrentRecord(null);
    setDrawerMode("create");
    form.resetFields();
    form.setFieldsValue({ date: dayjs(), status: "Present" });
    setDrawerOpen(true);
  }, [form]);

  const handleEdit = useCallback((record: Attendance) => {
    setCurrentRecord(record);
    setDrawerMode("edit");
    setDrawerOpen(true);
  }, []);

  const handleView = useCallback((record: Attendance) => {
    setCurrentRecord(record);
    setDocumentViewerOpen(true);
  }, []);

  const handleDelete = useCallback((record: Attendance) => {
    modal.confirm({
      title: "Delete Attendance Record",
      content: "Are you sure you want to delete this record?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteAttendance.mutateAsync(record.id);
          message.success("Attendance record deleted");
        } catch (error: any) {
          message.error(error.message || "Failed to delete attendance");
        }
      },
    });
  }, [deleteAttendance, modal, message]);

  const handleSubmit = useCallback(async (values: Record<string, unknown>) => {
    const data: CreateAttendanceDto = {
      employeeId: values.employeeId as string,
      date: (values.date as dayjs.Dayjs)?.format("YYYY-MM-DD"),
      checkIn: (values.checkIn as dayjs.Dayjs)?.toISOString(),
      checkOut: (values.checkOut as dayjs.Dayjs)?.toISOString(),
      status: values.status as "Present" | "Absent" | "Late" | "Half-Day",
      overtimeHours: values.overtimeHours as number,
      remarks: values.remarks as string,
    };

    try {
      if (drawerMode === "create") {
        await createAttendance.mutateAsync(data);
        message.success("Attendance recorded successfully");
      } else if (drawerMode === "edit" && currentRecord) {
        await updateAttendance.mutateAsync({ id: currentRecord.id, data });
        message.success("Attendance updated successfully");
      }

      setDrawerOpen(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || "Failed to save attendance");
    }
  }, [createAttendance, updateAttendance, drawerMode, currentRecord, form, message]);

  const documentSections = useMemo(() => {
    if (!currentRecord) return [];
    return [
      {
        title: "Attendance Details",
        items: [
          { label: "Date", value: <Text strong>{dayjs(currentRecord.date).format("MMMM DD, YYYY")}</Text> },
          { label: "Employee", value: getEmployeeName(currentRecord.employeeId) },
          { label: "Status", value: <Tag color={statusColors[currentRecord.status || ""]}>{currentRecord.status}</Tag> },
          { label: "Check In", value: currentRecord.checkIn ? dayjs(currentRecord.checkIn).format("HH:mm") : "-" },
          { label: "Check Out", value: currentRecord.checkOut ? dayjs(currentRecord.checkOut).format("HH:mm") : "-" },
          { label: "Overtime Hours", value: currentRecord.overtimeHours || 0 },
          { label: "Remarks", value: currentRecord.remarks, span: 2 },
        ],
      },
    ];
  }, [currentRecord, getEmployeeName]);

  return (
    <div style={{ padding: 24 }}>
      <EnterpriseDataTable<Attendance>
        title="Attendance Tracking"
        subtitle="Record and manage daily attendance"
        tableKey="hrm-attendance"
        columns={columns}
        data={attendance}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        exportFileName="attendance"
        showSelection
        showActions
        summary={summaryComponent}
      />


        <FormDrawer
        title="Attendance Record"
        formKey="hrm-attendance-v2"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        onDelete={drawerMode === "edit" && currentRecord ? () => handleDelete(currentRecord) : undefined}
        loading={createAttendance.isPending || updateAttendance.isPending}
        mode={drawerMode}
        width={500}
        form={form}

        initialValues={useMemo(() => {
          if (!currentRecord) return undefined;
          return {
            ...currentRecord,
            date: currentRecord.date ? dayjs(currentRecord.date) : undefined,
            checkIn: currentRecord.checkIn ? dayjs(currentRecord.checkIn) : undefined,
            checkOut: currentRecord.checkOut ? dayjs(currentRecord.checkOut) : undefined,
          };
        }, [currentRecord])}
        entityId={currentRecord?.id}
        onDraftLoaded={(data) => ({
          ...data,
          date: data.date ? dayjs(data.date as string) : undefined,
          checkIn: data.checkIn ? dayjs(data.checkIn as string) : undefined,
          checkOut: data.checkOut ? dayjs(data.checkOut as string) : undefined,
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
          <Col span={12}>
            <Form.Item name="date" label="Date" rules={[{ required: true, message: "Required" }]}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label="Status" initialValue="Present">
              <Select>
                <Option value="Present">Present</Option>
                <Option value="Absent">Absent</Option>
                <Option value="Late">Late</Option>
                <Option value="Half-Day">Half-Day</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="checkIn" label="Check In">
              <TimePicker style={{ width: "100%" }} format="HH:mm" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="checkOut" label="Check Out">
              <TimePicker style={{ width: "100%" }} format="HH:mm" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="overtimeHours" label="Overtime Hours">
              <InputNumber min={0} max={24} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="remarks" label="Remarks">
              <Input.TextArea rows={2} placeholder="Optional remarks" />
            </Form.Item>
          </Col>
        </Row>
      </FormDrawer>

      {currentRecord && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Attendance Record"
          documentNumber={dayjs(currentRecord.date).format("YYYY-MM-DD")}
          sections={documentSections}
          fileName="attendance_record"
        />
      )}
    </div>
  );
}
