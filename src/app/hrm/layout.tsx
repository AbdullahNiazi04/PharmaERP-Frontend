"use client";

import React, { useState, useEffect } from "react";
import { Layout, Menu, Typography, Space, Button, Tooltip, Switch } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  IdcardOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  DollarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  SoundOutlined,
  SoundFilled,
  UserOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/store";
import { toggleSound, setDashboardZoom } from "@/store/slices/uiSlice";
import { soundManager } from "@/lib/sounds";

const { Sider, Content, Header } = Layout;
const { Title, Text } = Typography;

const menuItems = [
  {
    key: "/hrm",
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: "/hrm/employees",
    icon: <TeamOutlined />,
    label: "Employees",
  },
  {
    key: "/hrm/departments",
    icon: <ApartmentOutlined />,
    label: "Departments",
  },
  {
    key: "/hrm/designations",
    icon: <IdcardOutlined />,
    label: "Designations",
  },
  {
    key: "/hrm/attendance",
    icon: <CalendarOutlined />,
    label: "Attendance",
  },
  {
    key: "/hrm/leaves",
    icon: <ScheduleOutlined />,
    label: "Leave Management",
  },
  {
    key: "/hrm/payroll",
    icon: <DollarOutlined />,
    label: "Payroll",
  },
];

export default function HRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { soundEnabled, dashboardZoom } = useAppSelector((state) => state.ui);

  // Sync sound manager with Redux state
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const handleMenuClick = ({ key }: { key: string }) => {
    soundManager.playClick();
    router.push(key);
  };

  const handleToggleSound = () => {
    dispatch(toggleSound());
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={240}
        style={{
          background: "linear-gradient(180deg, #08979c 0%, #13c2c2 100%)",
          boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0" : "0 20px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Space>
            <UserOutlined
              style={{
                fontSize: 24,
                color: "#87e8de",
              }}
            />
            {!collapsed && (
              <Title
                level={5}
                style={{
                  color: "#fff",
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                HR Management
              </Title>
            )}
          </Space>
        </div>

        {/* Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          onClick={handleMenuClick}
          items={menuItems}
          style={{
            background: "transparent",
            borderRight: "none",
            marginTop: 8,
          }}
        />

        {/* Back to Home */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 0,
            right: 0,
            padding: collapsed ? "8px" : "8px 16px",
          }}
        >
          <Link href="/">
            <Button
              type="text"
              block
              icon={<HomeOutlined />}
              style={{
                color: "rgba(255,255,255,0.65)",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              {!collapsed && "Back to Dashboard"}
            </Button>
          </Link>
        </div>

        {/* Sound Toggle */}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 0,
            right: 0,
            padding: collapsed ? "8px" : "8px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
          }}
        >
          {!collapsed && (
            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
              Sound
            </Text>
          )}
          <Tooltip title={soundEnabled ? "Disable sounds" : "Enable sounds"}>
            <Switch
              size="small"
              checked={soundEnabled}
              onChange={handleToggleSound}
              checkedChildren={<SoundFilled />}
              unCheckedChildren={<SoundOutlined />}
            />
          </Tooltip>
        </div>
      </Sider>

      {/* Main Content */}
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 240,
          transition: "margin-left 0.2s",
        }}
      >
        {/* Header */}
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            position: "sticky",
            top: 0,
            zIndex: 99,
            height: 56,
          }}
        >
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18 }}
            />
            <Text type="secondary" style={{ fontSize: 13 }}>
              Human Resource Management
            </Text>
          </Space>

          <Space>
            {/* Zoom Control */}
            <Tooltip title="Adjust dashboard zoom">
              <Space size={4}>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Zoom:
                </Text>
                <Button
                  size="small"
                  type={dashboardZoom === 85 ? "primary" : "default"}
                  onClick={() => dispatch(setDashboardZoom(85))}
                  style={{ minWidth: 32, padding: "0 6px", fontSize: 11 }}
                >
                  85%
                </Button>
                <Button
                  size="small"
                  type={dashboardZoom === 90 ? "primary" : "default"}
                  onClick={() => dispatch(setDashboardZoom(90))}
                  style={{ minWidth: 32, padding: "0 6px", fontSize: 11 }}
                >
                  90%
                </Button>
                <Button
                  size="small"
                  type={dashboardZoom === 95 ? "primary" : "default"}
                  onClick={() => dispatch(setDashboardZoom(95))}
                  style={{ minWidth: 32, padding: "0 6px", fontSize: 11 }}
                >
                  95%
                </Button>
                <Button
                  size="small"
                  type={dashboardZoom === 100 ? "primary" : "default"}
                  onClick={() => dispatch(setDashboardZoom(100))}
                  style={{ minWidth: 32, padding: "0 6px", fontSize: 11 }}
                >
                  100%
                </Button>
              </Space>
            </Tooltip>
          </Space>
        </Header>

        {/* Content with zoom */}
        <Content
          style={{
            background: "#f0f2f5",
            minHeight: "calc(100vh - 56px)",
            transform: `scale(${dashboardZoom / 100})`,
            transformOrigin: "top left",
            width: `${100 / (dashboardZoom / 100)}%`,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
