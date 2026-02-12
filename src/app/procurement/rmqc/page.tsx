"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RmqcInspection, rmqcApi } from "@/lib/services";
import RmqcEditDrawer from "@/components/procurement/rmqc/RmqcEditDrawer";
import { EnterpriseDataTable } from "@/components/common";
import { Tag, Button, Typography, Space, Tooltip, Popconfirm, message } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import classNames from "classnames";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

const statusColors: Record<string, string> = {
  Pending: "orange",
  Passed: "green",
  Failed: "red",
};

const { Text } = Typography;

export default function RmqcListPage() {
  const router = useRouter();
  const { data: inspections = [], isLoading, refetch } = useQuery({
    queryKey: ['rmqc-inspections'],
    queryFn: rmqcApi.getAll,
  });

  const [selectedInspection, setSelectedInspection] = useState<RmqcInspection | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      await rmqcApi.delete(id);
      message.success("Inspection deleted successfully");
      refetch();
    } catch (error) {
      message.error("Failed to delete inspection");
    }
  };

  const handleEdit = (record: RmqcInspection) => {
    setSelectedInspection(record);
    setDrawerOpen(true);
  };

  const handleDrawerSuccess = () => {
    refetch();
  };

  const columns: ColumnsType<RmqcInspection> = [
    {
      title: "Inspection ID",
      dataIndex: "id",
      key: "id",
      render: (id: string) => id.slice(0, 8),
    },
    {
      title: "GRN Number",
      key: "grn_number",
      render: (_: any, record: RmqcInspection) => record.goodsReceiptNotes?.grnNumber || "N/A",
    },
    {
      title: "Received By",
      key: "received_by",
      render: (_: any, record: RmqcInspection) => record.goodsReceiptNotes?.receivedBy || "N/A",
    },
    {
      title: "Batch Number",
      key: "batch_number",
      render: (_: any, record: RmqcInspection) => record.rawMaterialBatches?.batchNumber || "N/A",
    },
    {
      title: "Material",
      key: "material_name",
      render: (_: any, record: RmqcInspection) => 
        record.rawMaterialBatches?.rawMaterialInventory?.rawMaterials?.name || "N/A",
    },
    {
      title: "Inspection Date",
      dataIndex: "inspection_date",
      key: "inspection_date",
      render: (date: string) => date ? dayjs(date).format("YYYY-MM-DD HH:mm") : "N/A",
      sorter: (a: RmqcInspection, b: RmqcInspection) => dayjs(a.inspection_date).unix() - dayjs(b.inspection_date).unix(),
    },
    {
      title: "Inspector",
      dataIndex: "inspector_name",
      key: "inspector_name",
    },
    {
      title: "Item Details",
      dataIndex: "description",
      key: "description",
      render: (text: string) => <Text type="secondary" style={{ fontSize: 11 }}>{text || "N/A"}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span
          className={classNames("px-2 py-1 rounded-full text-xs font-medium", {
            "bg-green-100 text-green-800": status === "Passed",
            "bg-red-100 text-red-800": status === "Failed",
            "bg-yellow-100 text-yellow-800": status === "Pending",
          })}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right" as const,
      render: (_: any, record: RmqcInspection) => (
        <Space>
          <Tooltip title="View">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => router.push(`/procurement/rmqc/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit">
             <Button
               type="text"
               icon={<EditOutlined className="text-blue-500" />}
               onClick={() => handleEdit(record)}
             />
          </Tooltip>
          <Tooltip title="Delete">
             <Popconfirm
                title="Delete Inspection"
                description="Are you sure you want to delete this inspection?"
                onConfirm={() => handleDelete(record.id)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Button type="text" danger icon={<DeleteOutlined className="text-red-500" />} />
              </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <EnterpriseDataTable<RmqcInspection>
        title="RMQC Inspections"
        subtitle="Manage raw material quality control inspections"
        tableKey="rmqc-list"
        columns={columns}
        data={inspections}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
      />
      <RmqcEditDrawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        inspection={selectedInspection} 
        onSuccess={handleDrawerSuccess} 
      />
    </div>
  );
}
