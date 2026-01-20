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
import { IdcardOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { EnterpriseDataTable, FormDrawer, DocumentViewer } from "@/components/common";
import {
  useDesignations,
  useCreateDesignation,
  useUpdateDesignation,
  useDeleteDesignation,
  useEmployees,
  Designation,
  CreateDesignationDto,
} from "@/hooks/useHRM";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;
const { Text } = Typography;

const levelColors: Record<string, string> = {
  Junior: "green",
  Mid: "blue",
  Senior: "purple",
  Lead: "orange",
  Executive: "red",
};

export default function DesignationsPage() {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | "view">("create");
  const [currentDesig, setCurrentDesig] = useState<Designation | null>(null);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);

  const { data: designations = [], isLoading, refetch } = useDesignations();
  const { data: employees = [] } = useEmployees();
  const createDesig = useCreateDesignation();
  const updateDesig = useUpdateDesignation();
  const deleteDesig = useDeleteDesignation();

  const getEmployeeCount = useCallback((desigId: string) => {
    return employees.filter(e => e.designationId === desigId).length;
  }, [employees]);

  const summaryStats = useMemo(() => ({
    total: designations.length,
  }), [designations]);

  const columns: ColumnsType<Designation> = useMemo(
    () => [
      {
        title: "Designation Title",
        dataIndex: "title",
        key: "title",
        width: 200,
        fixed: "left",
        render: (text: string) => <Text strong style={{ color: "#13c2c2" }}>{text}</Text>,
      },
      {
        title: "Level",
        dataIndex: "level",
        key: "level",
        width: 120,
        render: (level: string) => level ? (
          <Tag color={levelColors[level] || "default"}>{level}</Tag>
        ) : <Text type="secondary">-</Text>,
      },
      {
        title: "Employees",
        key: "employeeCount",
        width: 120,
        render: (_: unknown, record: Designation) => (
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
    [getEmployeeCount]
  );

  const summaryComponent = useMemo(
    () => (
      <Row gutter={16} style={{ marginBottom: 8 }}>
        <Col span={24}>
          <Card size="small" style={{ background: "linear-gradient(135deg, #e6fffb 0%, #87e8de 100%)", border: "none" }}>
            <Statistic
              title={<span style={{ fontSize: 11, color: "#006d75" }}>Total Designations</span>}
              value={summaryStats.total}
              styles={{ content: { fontSize: 18, color: "#006d75" } }}
              prefix={<IdcardOutlined />}
            />
          </Card>
        </Col>
      </Row>
    ),
    [summaryStats]
  );

  const handleAdd = useCallback(() => {
    setCurrentDesig(null);
    setDrawerMode("create");
    form.resetFields();
    setDrawerOpen(true);
  }, [form]);

  const handleEdit = useCallback((record: Designation) => {
    setCurrentDesig(record);
    setDrawerMode("edit");
    form.setFieldsValue(record);
    setDrawerOpen(true);
  }, [form]);

  const handleView = useCallback((record: Designation) => {
    setCurrentDesig(record);
    setDocumentViewerOpen(true);
  }, []);

  const handleDelete = useCallback((record: Designation) => {
    modal.confirm({
      title: "Delete Designation",
      content: `Are you sure you want to delete "${record.title}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteDesig.mutateAsync(record.id);
          message.success("Designation deleted successfully");
        } catch (error: any) {
          message.error(error.message || "Failed to delete designation");
        }
      },
    });
  }, [deleteDesig, modal, message]);

  const handleSubmit = useCallback(async (values: Record<string, unknown>) => {
    const data: CreateDesignationDto = {
      title: values.title as string,
      level: values.level as string | undefined,
    };

    try {
      if (drawerMode === "create") {
        await createDesig.mutateAsync(data);
        message.success("Designation created successfully");
      } else if (drawerMode === "edit" && currentDesig) {
        await updateDesig.mutateAsync({ id: currentDesig.id, data });
        message.success("Designation updated successfully");
      }

      setDrawerOpen(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || "Failed to save designation");
    }
  }, [createDesig, updateDesig, drawerMode, currentDesig, form, message]);

  const documentSections = useMemo(() => {
    if (!currentDesig) return [];
    return [
      {
        title: "Designation Information",
        items: [
          { label: "Title", value: <Text strong style={{ fontSize: 16 }}>{currentDesig.title}</Text> },
          { label: "Level", value: currentDesig.level ? <Tag color={levelColors[currentDesig.level]}>{currentDesig.level}</Tag> : "Not Set" },
          { label: "Employee Count", value: <Tag color="blue">{getEmployeeCount(currentDesig.id)} employees</Tag> },
        ],
      },
    ];
  }, [currentDesig, getEmployeeCount]);

  return (
    <div style={{ padding: 24 }}>
      <EnterpriseDataTable<Designation>
        title="Designations"
        subtitle="Define job titles and levels"
        tableKey="hrm-designations"
        columns={columns}
        data={designations}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        exportFileName="designations"
        showSelection
        showActions
        summary={summaryComponent}
      />

      <FormDrawer
        title="Designation"
        formKey="hrm-designation"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        onDelete={drawerMode === "edit" && currentDesig ? () => handleDelete(currentDesig) : undefined}
        loading={createDesig.isPending || updateDesig.isPending}
        mode={drawerMode}
        width={400}
        form={form}
        initialValues={currentDesig || undefined}
        entityId={currentDesig?.id}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="title" label="Designation Title" rules={[{ required: true, message: "Required" }]}>
              <Input placeholder="e.g., Software Engineer" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="level" label="Level">
              <Select placeholder="Select level (optional)" allowClear>
                <Option value="Junior">Junior</Option>
                <Option value="Mid">Mid</Option>
                <Option value="Senior">Senior</Option>
                <Option value="Lead">Lead</Option>
                <Option value="Executive">Executive</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </FormDrawer>

      {currentDesig && (
        <DocumentViewer
          open={documentViewerOpen}
          onClose={() => setDocumentViewerOpen(false)}
          documentType="Designation Profile"
          documentNumber={currentDesig.title}
          sections={documentSections}
          fileName="designation_profile"
        />
      )}
    </div>
  );
}
