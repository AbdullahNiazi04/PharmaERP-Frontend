"use client";

import React, { useState } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Badge,
  Input,
  Tooltip,
  Breadcrumb,
  Typography,
} from "antd";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  ShopOutlined,
  InboxOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  ProfileOutlined,
  FileTextOutlined,
  DollarOutlined,
  ReconciliationOutlined,
  CarOutlined,
  HomeOutlined,
  AppstoreOutlined,
  UsergroupAddOutlined,
  ApartmentOutlined,
  IdcardOutlined,
  ScheduleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>["items"][number];

const getMenuItems = (): MenuItem[] => [
  {
    key: "/",
    icon: <DashboardOutlined />,
    label: <Link href="/">Dashboard</Link>,
  },
  {
    key: "procurement",
    icon: <ShoppingCartOutlined />,
    label: "Procurement",
    children: [
      {
        key: "/procurement",
        icon: <DashboardOutlined />,
        label: <Link href="/procurement">Dashboard</Link>,
      },
      {
        key: "/procurement/vendors",
        icon: <ShopOutlined />,
        label: <Link href="/procurement/vendors">Vendors</Link>,
      },
      {
        key: "/procurement/requisitions",
        icon: <FileTextOutlined />,
        label: <Link href="/procurement/requisitions">Purchase Requisitions</Link>,
      },
      {
        key: "/procurement/purchase-orders",
        icon: <ReconciliationOutlined />,
        label: <Link href="/procurement/purchase-orders">Purchase Orders</Link>,
      },
      {
        key: "/procurement/grn",
        icon: <InboxOutlined />,
        label: <Link href="/procurement/grn">Goods Receipt Notes</Link>,
      },
      {
        key: "/procurement/invoices",
        icon: <FileTextOutlined />,
        label: <Link href="/procurement/invoices">Invoices</Link>,
      },
      {
        key: "/procurement/payments",
        icon: <DollarOutlined />,
        label: <Link href="/procurement/payments">Payments</Link>,
      },
    ],
  },
  {
    key: "inventory",
    icon: <AppstoreOutlined />,
    label: "Inventory",
    children: [
      {
        key: "/raw-materials",
        icon: <InboxOutlined />,
        label: <Link href="/raw-materials">Raw Materials</Link>,
      },
      {
        key: "/finished-goods",
        icon: <AppstoreOutlined />,
        label: <Link href="/finished-goods">Finished Goods</Link>,
      },
      {
        key: "/warehouses",
        icon: <HomeOutlined />,
        label: <Link href="/warehouses">Warehouses</Link>,
      },
    ],
  },
  {
    key: "sales",
    icon: <DollarOutlined />,
    label: "Sales & Marketing",
    children: [
      {
        key: "/sales",
        icon: <DashboardOutlined />,
        label: <Link href="/sales">Dashboard</Link>,
      },
      {
        key: "/sales/customers",
        icon: <TeamOutlined />,
        label: <Link href="/sales/customers">Customers</Link>,
      },
      {
        key: "/sales/orders",
        icon: <ShoppingCartOutlined />,
        label: <Link href="/sales/orders">Sales Orders</Link>,
      },
      {
        key: "/sales/invoices",
        icon: <FileTextOutlined />,
        label: <Link href="/sales/invoices">Invoices</Link>,
      },
      {
        key: "/sales/dispatches",
        icon: <CarOutlined />,
        label: <Link href="/sales/dispatches">Dispatches</Link>,
      },
    ],
  },
  {
    key: "hrm",
    icon: <UsergroupAddOutlined />,
    label: "HRM",
    children: [
      {
        key: "/hrm",
        icon: <DashboardOutlined />,
        label: <Link href="/hrm">Dashboard</Link>,
      },
      {
        key: "/hrm/employees",
        icon: <UserOutlined />,
        label: <Link href="/hrm/employees">Employees</Link>,
      },
      {
        key: "/hrm/departments",
        icon: <ApartmentOutlined />,
        label: <Link href="/hrm/departments">Departments</Link>,
      },
      {
        key: "/hrm/designations",
        icon: <IdcardOutlined />,
        label: <Link href="/hrm/designations">Designations</Link>,
      },
      {
        key: "/hrm/attendance",
        icon: <ScheduleOutlined />,
        label: <Link href="/hrm/attendance">Attendance</Link>,
      },
      {
        key: "/hrm/leaves",
        icon: <CalendarOutlined />,
        label: <Link href="/hrm/leaves">Leave Management</Link>,
      },
      {
        key: "/hrm/payroll",
        icon: <DollarOutlined />,
        label: <Link href="/hrm/payroll">Payroll</Link>,
      },
    ],
  },
  {
    key: "/settings",
    icon: <SettingOutlined />,
    label: <Link href="/settings">Settings</Link>,
  },
];

const userMenuItems: MenuProps["items"] = [
  {
    key: "profile",
    icon: <ProfileOutlined />,
    label: "Profile",
  },
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: "Settings",
  },
  {
    type: "divider",
  },
  {
    key: "logout",
    icon: <LogoutOutlined />,
    label: "Logout",
    danger: true,
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const getBreadcrumbItems = (pathname: string) => {
  const pathParts = pathname.split("/").filter(Boolean);
  const items = [
    {
      title: (
        <Link href="/">
          <HomeOutlined />
        </Link>
      ),
    },
  ];

  let currentPath = "";
  pathParts.forEach((part, index) => {
    currentPath += `/${part}`;
    const title = part
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    if (index === pathParts.length - 1) {
      items.push({ title: <span>{title}</span> });
    } else {
      items.push({
        title: <Link href={currentPath}>{title}</Link>,
      });
    }
  });

  return items;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = getMenuItems();

  // Get open keys based on current path
  const getOpenKeys = () => {
    if (pathname.startsWith("/procurement")) {
      return ["procurement"];
    }
    if (
      pathname.includes("/raw-materials") ||
      pathname.includes("/finished-goods") ||
      pathname.includes("/warehouses")
    ) {
      return ["inventory"];
    }
    if (
      pathname.includes("/customers") ||
      pathname.includes("/sales") ||
      pathname.includes("/invoices") ||
      pathname.includes("/payments")
    ) {
      return ["sales"];
    }
    if (pathname.includes("/hrm")) {
      return ["hrm"];
    }
    return [];
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0" : "0 24px",
            background: "rgba(255, 255, 255, 0.05)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {collapsed ? (
            <Text
              style={{
                color: "#1890ff",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              P
            </Text>
          ) : (
            <Text
              style={{
                color: "#fff",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "-0.5px",
              }}
            >
              💊 <span style={{ color: "#1890ff" }}>Pharma</span>ERP
            </Text>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          style={{
            borderRight: 0,
            marginTop: 8,
          }}
        />
      </Sider>

      {/* Main Layout */}
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 260,
          transition: "margin-left 0.2s",
        }}
      >
        {/* Header */}
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
            position: "sticky",
            top: 0,
            zIndex: 99,
          }}
        >
          {/* Left Side */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Tooltip title={collapsed ? "Expand" : "Collapse"}>
              {React.createElement(
                collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
                {
                  className: "trigger",
                  onClick: () => setCollapsed(!collapsed),
                  style: {
                    fontSize: 20,
                    cursor: "pointer",
                    padding: 8,
                    borderRadius: 6,
                    transition: "all 0.3s",
                  },
                }
              )}
            </Tooltip>
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              style={{
                width: 300,
                borderRadius: 20,
              }}
            />
          </div>

          {/* Right Side */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Tooltip title="Notifications">
              <Badge count={5} size="small">
                <BellOutlined
                  style={{
                    fontSize: 20,
                    cursor: "pointer",
                    padding: 8,
                    borderRadius: 6,
                    transition: "all 0.3s",
                  }}
                />
              </Badge>
            </Tooltip>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: "4px 12px",
                  borderRadius: 8,
                  transition: "all 0.3s",
                }}
              >
                <Avatar size="small" icon={<UserOutlined />} />
                <span style={{ fontWeight: 500 }}>Admin User</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content style={{ margin: 24, minHeight: 280 }}>
          {/* Breadcrumb */}
          <Breadcrumb
            items={getBreadcrumbItems(pathname)}
            style={{ marginBottom: 16 }}
          />

          {/* Main Content */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              minHeight: "calc(100vh - 200px)",
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
