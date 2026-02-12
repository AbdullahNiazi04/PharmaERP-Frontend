"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { rmqcApi, RmqcInspection } from "@/lib/services";
import { EnterpriseDataTable } from "@/components/common";
import { Tag, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

const statusColors: Record<string, string> = {
  Pending: "orange",
  Passed: "green",
  Failed: "red",
};

export default function RmqcListPage() {
  const router = useRouter();
  const { data: inspections = [], isLoading, refetch } = useQuery({
    queryKey: ['rmqc-inspections'],
    queryFn: rmqcApi.getAll,
  });

  const columns = [
    {
      title: "Inspection ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id: string) => id.slice(0, 8),
    },
    {
      title: "GRN Number",
      dataIndex: ["goods_receipt_notes", "grn_number"],
      key: "grn_number",
      width: 150,
      render: (text: string) => text || "N/A",
    },
    {
      title: "Received By",
      dataIndex: ["goods_receipt_notes", "received_by"],
      key: "received_by",
      width: 150,
    },
    {
      title: "Batch Number",
      dataIndex: ["raw_material_batches", "batch_number"],
      key: "batch_number",
      width: 150,
      render: (text: string) => text || "N/A",
    },
    {
      title: "Material",
      key: "material_name",
      width: 200,
      render: (_: any, record: RmqcInspection) => 
        record.raw_material_batches?.raw_material_inventory?.raw_materials?.name || "N/A",
    },
    {
      title: "Inspection Date",
      dataIndex: "inspection_date",
      key: "inspection_date",
      width: 150,
      render: (date: string) => dayjs(date).format("YYYY-MM-DD"),
    },
    {
      title: "Inspector",
      dataIndex: "inspector_name",
      key: "inspector_name",
      width: 150,
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
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right" as const,
      render: (_: any, record: RmqcInspection) => (
        <Button 
          type="text" 
          icon={<EyeOutlined />} 
          onClick={() => router.push(`/procurement/rmqc/${record.id}`)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <EnterpriseDataTable
        title="RMQC Inspections"
        subtitle="Manage Raw Material Quality Checks"
        tableKey="rmqc"
        columns={columns}
        data={inspections}
        loading={isLoading}
        rowKey="id"
        onRefresh={refetch}
        showSelection={false}
        showActions={false}
      />
    </div>
  );
}
