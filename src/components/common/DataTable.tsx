"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Dropdown,
  Tooltip,
  Modal,
  Typography,
  Tag,
  Card,
} from "antd";
import {
  SearchOutlined,
  ExportOutlined,
  FilePdfOutlined,
  PrinterOutlined,
  DownloadOutlined,
  ReloadOutlined,
  SettingOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue, SorterResult } from "antd/es/table/interface";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { Title, Text } = Typography;

interface DataTableProps<T> {
  title: string;
  subtitle?: string;
  columns: ColumnsType<T>;
  data: T[];
  loading?: boolean;
  rowKey: string | ((record: T) => string);
  onRefresh?: () => void;
  onAdd?: () => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onView?: (record: T) => void;
  exportFileName?: string;
  showActions?: boolean;
  customActions?: (record: T) => React.ReactNode;
  summary?: React.ReactNode;
}

export default function DataTable<T extends Record<string, unknown>>({
  title,
  subtitle,
  columns,
  data,
  loading = false,
  rowKey,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onView,
  exportFileName = "data",
  showActions = true,
  customActions,
  summary,
}: DataTableProps<T>) {
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  });
  const [previewVisible, setPreviewVisible] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchText) return data;

    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchText.toLowerCase())
      )
    );
  }, [data, searchText]);

  // Handle table changes
  const handleTableChange = (
    newPagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[]
  ) => {
    setPagination(newPagination);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = filteredData.map((item) => {
      const row: Record<string, unknown> = {};
      columns.forEach((col) => {
        if ("dataIndex" in col && col.dataIndex) {
          const key =
            typeof col.dataIndex === "string"
              ? col.dataIndex
              : Array.isArray(col.dataIndex)
              ? col.dataIndex.join(".")
              : String(col.dataIndex);
          row[col.title as string] = item[key as keyof T];
        }
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${exportFileName}_${Date.now()}.xlsx`);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const exportData = filteredData.map((item) => {
      const row: Record<string, unknown> = {};
      columns.forEach((col) => {
        if ("dataIndex" in col && col.dataIndex) {
          const key =
            typeof col.dataIndex === "string"
              ? col.dataIndex
              : Array.isArray(col.dataIndex)
              ? col.dataIndex.join(".")
              : String(col.dataIndex);
          row[col.title as string] = item[key as keyof T];
        }
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${exportFileName}_${Date.now()}.csv`);
  };

  // Generate PDF
  const generatePDF = (download = true) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(24, 144, 255);
    doc.text(title, 14, 22);

    if (subtitle) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(subtitle, 14, 30);
    }

    // Table headers
    const headers = columns
      .filter((col) => "dataIndex" in col && col.dataIndex)
      .map((col) => col.title as string);

    // Table data
    const tableData = filteredData.map((item) =>
      columns
        .filter((col) => "dataIndex" in col && col.dataIndex)
        .map((col) => {
          const key =
            typeof (col as { dataIndex: string | string[] }).dataIndex ===
            "string"
              ? (col as { dataIndex: string }).dataIndex
              : (col as { dataIndex: string[] }).dataIndex.join(".");
          return String(item[key as keyof T] ?? "");
        })
    );

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: subtitle ? 38 : 30,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [24, 144, 255],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 20 },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    if (download) {
      doc.save(`${exportFileName}_${Date.now()}.pdf`);
    }

    return doc;
  };

  // PDF Preview
  const handlePDFPreview = () => {
    const doc = generatePDF(false);
    const pdfDataUri = doc.output("datauristring");
    window.open(pdfDataUri, "_blank");
  };

  // Print
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: exportFileName,
  });

  // Export menu items
  const exportMenuItems = [
    {
      key: "excel",
      icon: <FileExcelOutlined />,
      label: "Export to Excel",
      onClick: handleExportExcel,
    },
    {
      key: "csv",
      icon: <ExportOutlined />,
      label: "Export to CSV",
      onClick: handleExportCSV,
    },
    {
      type: "divider" as const,
    },
    {
      key: "pdf-preview",
      icon: <EyeOutlined />,
      label: "PDF Preview",
      onClick: handlePDFPreview,
    },
    {
      key: "pdf-download",
      icon: <DownloadOutlined />,
      label: "Download PDF",
      onClick: () => generatePDF(true),
    },
    {
      key: "print",
      icon: <PrinterOutlined />,
      label: "Print",
      onClick: () => handlePrint(),
    },
  ];

  // Action column
  const actionColumn: ColumnsType<T>[0] = {
    title: "Actions",
    key: "actions",
    width: 120,
    fixed: "right",
    render: (_, record: T) => {
      if (customActions) {
        return customActions(record);
      }

      const actionItems = [];

      if (onView) {
        actionItems.push({
          key: "view",
          icon: <EyeOutlined />,
          label: "View",
          onClick: () => onView(record),
        });
      }

      if (onEdit) {
        actionItems.push({
          key: "edit",
          icon: <EditOutlined />,
          label: "Edit",
          onClick: () => onEdit(record),
        });
      }

      if (onDelete) {
        actionItems.push({
          key: "delete",
          icon: <DeleteOutlined />,
          label: "Delete",
          danger: true,
          onClick: () => onDelete(record),
        });
      }

      return (
        <Dropdown
          menu={{ items: actionItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined style={{ fontSize: 18 }} />}
          />
        </Dropdown>
      );
    },
  };

  const finalColumns = showActions ? [...columns, actionColumn] : columns;

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {title}
          </Title>
          {subtitle && (
            <Text type="secondary" style={{ marginTop: 4, display: "block" }}>
              {subtitle}
            </Text>
          )}
        </div>

        <Space wrap>
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />

          <Tooltip title="Refresh">
            <Button
              icon={<ReloadOutlined spin={loading} />}
              onClick={onRefresh}
            />
          </Tooltip>

          <Dropdown menu={{ items: exportMenuItems }} trigger={["click"]}>
            <Tooltip title="Export">
              <Button icon={<ExportOutlined />}>Export</Button>
            </Tooltip>
          </Dropdown>

          {onAdd && (
            <Button type="primary" onClick={onAdd}>
              + Add New
            </Button>
          )}
        </Space>
      </div>

      {/* Summary Cards */}
      {summary && <div style={{ marginBottom: 24 }}>{summary}</div>}

      {/* Table */}
      <Table
        columns={finalColumns}
        dataSource={filteredData}
        rowKey={rowKey}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: "max-content" }}
        size="middle"
        bordered={false}
        style={{
          background: "#fff",
          borderRadius: 8,
        }}
      />

      {/* Hidden Print Content */}
      <div style={{ display: "none" }}>
        <div ref={printRef} style={{ padding: 20 }}>
          <h2 style={{ color: "#1890ff", marginBottom: 8 }}>{title}</h2>
          {subtitle && (
            <p style={{ color: "#666", marginBottom: 16 }}>{subtitle}</p>
          )}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#1890ff", color: "#fff" }}>
                {columns
                  .filter((col) => "dataIndex" in col && col.dataIndex)
                  .map((col, index) => (
                    <th
                      key={index}
                      style={{ padding: 8, border: "1px solid #ddd" }}
                    >
                      {col.title as string}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  style={{
                    backgroundColor: rowIndex % 2 === 0 ? "#f5f5f5" : "#fff",
                  }}
                >
                  {columns
                    .filter((col) => "dataIndex" in col && col.dataIndex)
                    .map((col, colIndex) => {
                      const key =
                        typeof (col as { dataIndex: string | string[] })
                          .dataIndex === "string"
                          ? (col as { dataIndex: string }).dataIndex
                          : (col as { dataIndex: string[] }).dataIndex.join(
                              "."
                            );
                      return (
                        <td
                          key={colIndex}
                          style={{ padding: 8, border: "1px solid #ddd" }}
                        >
                          {String(item[key as keyof T] ?? "")}
                        </td>
                      );
                    })}
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ marginTop: 16, fontSize: 10, color: "#999" }}>
            Generated on {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
