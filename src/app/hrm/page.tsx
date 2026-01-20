"use client";

import React, { useMemo, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Statistic,
  Tag,
  Space,
  Button,
  Skeleton,
  Alert,
} from "antd";
import {
  TeamOutlined,
  ApartmentOutlined,
  IdcardOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  DollarOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useEmployees, useDepartments, useDesignations, useLeaveRequests, usePrefetchHRM } from "@/hooks/useHRM";

const { Title, Text, Paragraph } = Typography;

// Module cards configuration
const moduleCards = [
  {
    title: "Employees",
    description: "Manage employee records and information",
    icon: <TeamOutlined style={{ fontSize: 32, color: "#13c2c2" }} />,
    href: "/hrm/employees",
    color: "#e6fffb",
    borderColor: "#87e8de",
  },
  {
    title: "Departments",
    description: "Organize company departments",
    icon: <ApartmentOutlined style={{ fontSize: 32, color: "#52c41a" }} />,
    href: "/hrm/departments",
    color: "#f6ffed",
    borderColor: "#b7eb8f",
  },
  {
    title: "Attendance",
    description: "Track daily attendance and overtime",
    icon: <CalendarOutlined style={{ fontSize: 32, color: "#1890ff" }} />,
    href: "/hrm/attendance",
    color: "#e6f4ff",
    borderColor: "#91caff",
  },
  {
    title: "Leave Management",
    description: "Handle leave requests and approvals",
    icon: <ScheduleOutlined style={{ fontSize: 32, color: "#722ed1" }} />,
    href: "/hrm/leaves",
    color: "#f9f0ff",
    borderColor: "#d3adf7",
  },
];

// Status colors
const employeeStatusColors: Record<string, string> = {
  Active: "#52c41a",
  "On Leave": "#faad14",
  Terminated: "#ff4d4f",
  Resigned: "#8c8c8c",
};

export default function HRMDashboardPage() {
  // API Hooks
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: departments = [], isLoading: departmentsLoading } = useDepartments();
  const { data: designations = [], isLoading: designationsLoading } = useDesignations();
  const { data: leaveRequests = [], isLoading: leavesLoading } = useLeaveRequests();
  const prefetch = usePrefetchHRM();

  const isLoading = employeesLoading || departmentsLoading || designationsLoading || leavesLoading;

  // Prefetch all data on mount
  useEffect(() => {
    prefetch.prefetchAll();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e) => e.status === "Active").length;
    const onLeaveEmployees = employees.filter((e) => e.status === "On Leave").length;
    const permanentEmployees = employees.filter((e) => e.employmentType === "Permanent").length;
    const contractEmployees = employees.filter((e) => e.employmentType === "Contract").length;

    const totalDepartments = departments.length;
    const totalDesignations = designations.length;

    const pendingLeaves = leaveRequests.filter((l) => l.status === "Pending").length;
    const approvedLeaves = leaveRequests.filter((l) => l.status === "Approved").length;

    // Calculate total salary
    const totalSalary = employees.reduce((sum, e) => sum + (Number(e.basicSalary) || 0), 0);

    return {
      totalEmployees,
      activeEmployees,
      onLeaveEmployees,
      permanentEmployees,
      contractEmployees,
      totalDepartments,
      totalDesignations,
      pendingLeaves,
      approvedLeaves,
      totalSalary,
    };
  }, [employees, departments, designations, leaveRequests]);

  if (isLoading) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 2 }} />
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <Col key={i} xs={24} sm={12} lg={6}>
              <Card><Skeleton active /></Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          HR Management
        </Title>
        <Text type="secondary">
          Manage employees, departments, attendance, and payroll
        </Text>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)",
              border: "none",
              borderRadius: 12,
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Total Employees</span>}
              value={stats.totalEmployees}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
              prefix={<TeamOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                {stats.activeEmployees} Active
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              border: "none",
              borderRadius: 12,
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Departments</span>}
              value={stats.totalDepartments}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
              prefix={<ApartmentOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                {stats.totalDesignations} Designations
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
              border: "none",
              borderRadius: 12,
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Leave Requests</span>}
              value={stats.pendingLeaves}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
              prefix={<ScheduleOutlined />}
              suffix="pending"
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                {stats.approvedLeaves} Approved
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
              border: "none",
              borderRadius: 12,
            }}
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Statistic
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Monthly Payroll</span>}
              value={stats.totalSalary}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
              prefix={<DollarOutlined />}
              suffix="₨"
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="rgba(255,255,255,0.2)" style={{ color: "#fff", border: "none" }}>
                {stats.permanentEmployees} Permanent
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Module Cards */}
      <Title level={5} style={{ marginBottom: 16 }}>
        HR Modules
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {moduleCards.map((module) => (
          <Col key={module.title} xs={24} sm={12} lg={6}>
            <Link href={module.href} style={{ display: "block" }}>
              <Card
                hoverable
                style={{
                  background: module.color,
                  border: `1px solid ${module.borderColor}`,
                  borderRadius: 12,
                  height: "100%",
                }}
                styles={{ body: { padding: 20 } }}
              >
                <div style={{ marginBottom: 12 }}>{module.icon}</div>
                <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                  {module.title}
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {module.description}
                </Text>
                <div style={{ marginTop: 12 }}>
                  <Button type="link" style={{ padding: 0, fontSize: 12 }}>
                    Open Module <ArrowRightOutlined />
                  </Button>
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      {/* Alerts & Quick Actions */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: "#722ed1" }} />
                <span>Pending Leave Requests</span>
              </Space>
            }
            size="small"
            style={{ borderRadius: 12 }}
          >
            {stats.pendingLeaves === 0 ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <CheckCircleOutlined style={{ fontSize: 32, color: "#52c41a" }} />
                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                  No pending leave requests
                </Paragraph>
              </div>
            ) : (
              <Alert
                message={`${stats.pendingLeaves} Leave Requests Pending`}
                description="Review and approve or reject pending leave requests."
                type="warning"
                showIcon
                action={
                  <Link href="/hrm/leaves">
                    <Button size="small" type="primary">Review</Button>
                  </Link>
                }
              />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <UserOutlined style={{ color: "#13c2c2" }} />
                <span>Quick Actions</span>
              </Space>
            }
            size="small"
            style={{ borderRadius: 12 }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Link href="/hrm/employees">
                <Button block type="default" icon={<TeamOutlined />}>
                  Add New Employee
                </Button>
              </Link>
              <Link href="/hrm/attendance">
                <Button block type="default" icon={<CalendarOutlined />}>
                  Mark Today&apos;s Attendance
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Employment Type Distribution */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Employee Status Overview" size="small" style={{ borderRadius: 12 }}>
            <Row gutter={16}>
              <Col span={6}>
                <div style={{ textAlign: "center" }}>
                  <Statistic
                    title={<span style={{ color: employeeStatusColors["Active"] }}>Active</span>}
                    value={stats.activeEmployees}
                    styles={{ content: { color: employeeStatusColors["Active"] } }}
                  />
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: "center" }}>
                  <Statistic
                    title={<span style={{ color: employeeStatusColors["On Leave"] }}>On Leave</span>}
                    value={stats.onLeaveEmployees}
                    styles={{ content: { color: employeeStatusColors["On Leave"] } }}
                  />
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: "center" }}>
                  <Statistic
                    title={<span style={{ color: "#1890ff" }}>Permanent</span>}
                    value={stats.permanentEmployees}
                    styles={{ content: { color: "#1890ff" } }}
                  />
                </div>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: "center" }}>
                  <Statistic
                    title={<span style={{ color: "#faad14" }}>Contract</span>}
                    value={stats.contractEmployees}
                    styles={{ content: { color: "#faad14" } }}
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
