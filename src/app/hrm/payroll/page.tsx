"use client";

import React, { useMemo } from "react";
import {
  Row,
  Col,
  Typography,
  Card,
  Statistic,
  Tag,
  Table,
  Alert,
  Button,
  Space,
} from "antd";
import {
  DollarOutlined,
  TeamOutlined,
  CalendarOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useEmployees, useDepartments } from "@/hooks/useHRM";
import type { ColumnsType } from "antd/es/table";

const { Title, Text, Paragraph } = Typography;

interface PayrollSummary {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
}

export default function PayrollPage() {
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: departments = [] } = useDepartments();

  const getDepartmentName = (id: string) => departments.find(d => d.id === id)?.name || id;

  // Generate payroll summary from employees
  const payrollData: PayrollSummary[] = useMemo(() => {
    return employees
      .filter(e => e.status === "Active")
      .map(e => {
        const basicSalary = Number(e.basicSalary) || 0;
        const allowances = Math.round(basicSalary * 0.1); // 10% allowance
        const deductions = Math.round(basicSalary * 0.05); // 5% deductions
        const netSalary = basicSalary + allowances - deductions;

        return {
          id: e.id,
          employeeCode: e.employeeCode,
          fullName: e.fullName,
          department: getDepartmentName(e.departmentId),
          basicSalary,
          allowances,
          deductions,
          netSalary,
        };
      });
  }, [employees, departments]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalBasic = payrollData.reduce((sum, p) => sum + p.basicSalary, 0);
    const totalAllowances = payrollData.reduce((sum, p) => sum + p.allowances, 0);
    const totalDeductions = payrollData.reduce((sum, p) => sum + p.deductions, 0);
    const totalNet = payrollData.reduce((sum, p) => sum + p.netSalary, 0);
    const employeeCount = payrollData.length;

    return { totalBasic, totalAllowances, totalDeductions, totalNet, employeeCount };
  }, [payrollData]);

  const columns: ColumnsType<PayrollSummary> = [
    {
      title: "Employee Code",
      dataIndex: "employeeCode",
      key: "employeeCode",
      width: 130,
      render: (text: string) => <Text strong style={{ color: "#13c2c2" }}>{text}</Text>,
    },
    {
      title: "Employee Name",
      dataIndex: "fullName",
      key: "fullName",
      width: 180,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 150,
    },
    {
      title: "Basic Salary",
      dataIndex: "basicSalary",
      key: "basicSalary",
      width: 120,
      align: "right",
      render: (val: number) => `₨ ${val.toLocaleString()}`,
    },
    {
      title: "Allowances",
      dataIndex: "allowances",
      key: "allowances",
      width: 110,
      align: "right",
      render: (val: number) => <Text type="success">+₨ {val.toLocaleString()}</Text>,
    },
    {
      title: "Deductions",
      dataIndex: "deductions",
      key: "deductions",
      width: 110,
      align: "right",
      render: (val: number) => <Text type="danger">-₨ {val.toLocaleString()}</Text>,
    },
    {
      title: "Net Salary",
      dataIndex: "netSalary",
      key: "netSalary",
      width: 130,
      align: "right",
      render: (val: number) => <Text strong>₨ {val.toLocaleString()}</Text>,
    },
  ];

  const currentMonth = dayjs().format("MMMM YYYY");

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Payroll Management
        </Title>
        <Text type="secondary">
          Generate and process employee salaries
        </Text>
      </div>

      {/* Period Selection */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <CalendarOutlined style={{ fontSize: 20, color: "#13c2c2" }} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Current Period</Text>
                <br />
                <Text strong style={{ fontSize: 16 }}>{currentMonth}</Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Tag color="blue">Draft</Tag>
          </Col>
        </Row>
      </Card>

      {/* Summary Stats */}
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
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Employees</span>}
              value={totals.employeeCount}
              styles={{ content: { color: "#fff", fontSize: 28 } }}
              prefix={<TeamOutlined />}
            />
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
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Total Basic</span>}
              value={totals.totalBasic}
              styles={{ content: { color: "#fff", fontSize: 24 } }}
              prefix="₨"
            />
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
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Total Allowances</span>}
              value={totals.totalAllowances}
              styles={{ content: { color: "#fff", fontSize: 24 } }}
              prefix="+₨"
            />
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
              title={<span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Total Net Payable</span>}
              value={totals.totalNet}
              styles={{ content: { color: "#fff", fontSize: 24 } }}
              prefix="₨"
            />
          </Card>
        </Col>
      </Row>

      {/* Info Alert */}
      <Alert
        message="Payroll Calculation Preview"
        description="This is a preview of the payroll calculation for active employees. Allowances are calculated at 10% and deductions at 5% of basic salary. Click 'Process Payroll' to generate pay slips."
        type="info"
        showIcon
        icon={<CalculatorOutlined />}
        style={{ marginBottom: 16, borderRadius: 8 }}
        action={
          <Button type="primary" disabled>
            Process Payroll
          </Button>
        }
      />

      {/* Payroll Table */}
      <Card
        title={
          <Space>
            <DollarOutlined style={{ color: "#13c2c2" }} />
            <span>Payroll Summary - {currentMonth}</span>
          </Space>
        }
        extra={
          <Button type="default" disabled>
            Export Pay Slips
          </Button>
        }
        style={{ borderRadius: 12 }}
      >
        <Table
          columns={columns}
          dataSource={payrollData}
          loading={employeesLoading}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 900 }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row style={{ background: "#fafafa" }}>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <Text strong>Total</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <Text strong>₨ {totals.totalBasic.toLocaleString()}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <Text type="success" strong>+₨ {totals.totalAllowances.toLocaleString()}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  <Text type="danger" strong>-₨ {totals.totalDeductions.toLocaleString()}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="right">
                  <Text strong style={{ fontSize: 16 }}>₨ {totals.totalNet.toLocaleString()}</Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  );
}
