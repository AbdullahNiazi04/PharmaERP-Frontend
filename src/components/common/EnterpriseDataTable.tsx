"use client";

import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Dropdown,
  Tooltip,
  Checkbox,
  Popover,
  Badge,
  Typography,
  Skeleton,
  Divider,
  message,
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
  FilterOutlined,
  ColumnHeightOutlined,
  CheckSquareOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { FilterValue, SorterResult, TableRowSelection } from "antd/es/table/interface";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { tableStorage, TablePreferences } from "@/lib/storage";
import { soundManager } from "@/lib/sounds";

const { Text } = Typography;

// Column filter component for each column
const ColumnFilter: React.FC<{
  column: string;
  value: string;
  onChange: (column: string, value: string) => void;
  placeholder?: string;
}> = ({ column, value, onChange, placeholder }) => (
  <Input
    size="small"
    placeholder={placeholder || `Filter...`}
    value={value}
    onChange={(e) => onChange(column, e.target.value)}
    allowClear
    style={{ width: "100%", marginTop: 4 }}
    prefix={<FilterOutlined style={{ color: "#bfbfbf", fontSize: 11 }} />}
  />
);

interface EnterpriseDataTableProps<T> {
  // Basic props
  title: string;
  subtitle?: string;
  tableKey: string; // Unique key for storing preferences
  columns: ColumnsType<T>;
  data: T[];
  loading?: boolean;
  rowKey: string | ((record: T) => string);
  
  // Actions
  onRefresh?: () => void;
  onAdd?: () => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onView?: (record: T) => void;
  onBulkDelete?: (records: T[]) => void;
  onBulkExport?: (records: T[]) => void;
  
  // Export
  exportFileName?: string;
  
  // Customization
  showActions?: boolean;
  showSelection?: boolean;
  customActions?: (record: T) => React.ReactNode;
  summary?: React.ReactNode;
  
  // Server-side features
  serverSide?: boolean;
  total?: number;
  onTableChange?: (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[]
  ) => void;
}

export default function EnterpriseDataTable<T extends object>({
  title,
  subtitle,
  tableKey,
  columns,
  data,
  loading = false,
  rowKey,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onBulkDelete,
  onBulkExport,
  exportFileName = "data",
  showActions = true,
  showSelection = true,
  customActions,
  summary,
  serverSide = false,
  total,
  onTableChange,
}: EnterpriseDataTableProps<T>) {
  // State
  const [globalSearch, setGlobalSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 15,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ["10", "15", "25", "50", "100"],
    showTotal: (total, range) => (
      <Text type="secondary" style={{ fontSize: 12 }}>
        Showing {range[0]}-{range[1]} of {total} entries
      </Text>
    ),
  });
  
  const printRef = useRef<HTMLDivElement>(null);

  // Load saved preferences
  useEffect(() => {
    const prefs = tableStorage.load(tableKey);
    if (prefs) {
      if (prefs.visibleColumns?.length) {
        setVisibleColumns(prefs.visibleColumns);
      } else {
        setVisibleColumns(columns.map((col) => (col as { dataIndex?: string }).dataIndex || (col as { key?: string }).key || '').filter(Boolean));
      }
      if (prefs.pageSize) {
        setPagination((prev) => ({ ...prev, pageSize: prefs.pageSize }));
      }
    } else {
      setVisibleColumns(columns.map((col) => (col as { dataIndex?: string }).dataIndex || (col as { key?: string }).key || '').filter(Boolean));
    }
  }, [tableKey, columns]);

  // Get all column keys
  const allColumnKeys = useMemo(() => 
    columns.map((col) => (col as { dataIndex?: string }).dataIndex || (col as { key?: string }).key || '').filter(Boolean),
    [columns]
  );

  // Column filter handler
  const handleColumnFilter = useCallback((column: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
  }, []);

  // Filter data based on search and column filters
  const filteredData = useMemo(() => {
    if (serverSide) return data;

    let result = data;

    // Global search
    if (globalSearch) {
      result = result.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(globalSearch.toLowerCase())
        )
      );
    }

    // Column filters
    Object.entries(columnFilters).forEach(([column, filterValue]) => {
      if (filterValue) {
        result = result.filter((item) =>
          String(item[column as keyof T] ?? "")
            .toLowerCase()
            .includes(filterValue.toLowerCase())
        );
      }
    });

    return result;
  }, [data, globalSearch, columnFilters, serverSide]);

  // Enhanced columns with filters
  const enhancedColumns = useMemo(() => {
    const filtered = columns
      .filter((col) => {
        const key = (col as { dataIndex?: string }).dataIndex || (col as { key?: string }).key;
        return visibleColumns.includes(key as string);
      })
      .map((col) => {
        const dataIndex = (col as { dataIndex?: string }).dataIndex;
        if (!dataIndex) return col;

        return {
          ...col,
          title: (
            <div style={{ minWidth: 100 }}>
              <div>{col.title as React.ReactNode}</div>
              <ColumnFilter
                column={dataIndex as string}
                value={columnFilters[dataIndex as string] || ""}
                onChange={handleColumnFilter}
              />
            </div>
          ),
          sorter: !serverSide
            ? (a: T, b: T) => {
                const aVal = String(a[dataIndex as keyof T] ?? "");
                const bVal = String(b[dataIndex as keyof T] ?? "");
                return aVal.localeCompare(bVal);
              }
            : true,
        };
      });

    return filtered;
  }, [columns, visibleColumns, columnFilters, handleColumnFilter, serverSide]);

  // Handle table changes
  const handleTableChange = (
    newPagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<T> | SorterResult<T>[]
  ) => {
    setPagination(newPagination);
    
    // Save preferences
    tableStorage.save(tableKey, {
      pageSize: newPagination.pageSize,
      sortField: Array.isArray(sorter) ? undefined : (sorter.field as string),
      sortOrder: Array.isArray(sorter) ? undefined : (sorter.order as 'ascend' | 'descend'),
    });

    if (onTableChange) {
      onTableChange(newPagination, filters, sorter);
    }
  };

  // Row selection
  const rowSelection: TableRowSelection<T> | undefined = showSelection
    ? {
        selectedRowKeys,
        onChange: (keys) => {
          setSelectedRowKeys(keys);
          soundManager.playClick();
        },
        selections: [
          Table.SELECTION_ALL,
          Table.SELECTION_INVERT,
          Table.SELECTION_NONE,
        ],
      }
    : undefined;

  // Export functions
  const handleExportExcel = useCallback((selectedOnly = false) => {
    const exportData = (selectedOnly ? filteredData.filter((_, i) => selectedRowKeys.includes(i)) : filteredData);
    
    const rows = exportData.map((item) => {
      const row: Record<string, unknown> = {};
      columns.forEach((col) => {
        const dataIndex = (col as { dataIndex?: string }).dataIndex;
        if (dataIndex) {
          row[col.title as string] = item[dataIndex as keyof T];
        }
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${exportFileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    message.success(`Exported ${rows.length} records to Excel`);
    soundManager.playSuccess();
  }, [filteredData, selectedRowKeys, columns, exportFileName]);

  const handleExportCSV = useCallback(() => {
    const rows = filteredData.map((item) => {
      const row: Record<string, unknown> = {};
      columns.forEach((col) => {
        const dataIndex = (col as { dataIndex?: string }).dataIndex;
        if (dataIndex) {
          row[col.title as string] = item[dataIndex as keyof T];
        }
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${exportFileName}_${new Date().toISOString().split('T')[0]}.csv`);
    
    message.success(`Exported ${rows.length} records to CSV`);
    soundManager.playSuccess();
  }, [filteredData, columns, exportFileName]);

  const generatePDF = useCallback((download = true) => {
    const doc = new jsPDF({ orientation: 'landscape' });

    // Header with gradient effect
    doc.setFillColor(24, 144, 255);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 25, 'F');
    
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(title, 14, 16);

    if (subtitle) {
      doc.setFontSize(9);
      doc.setTextColor(200, 200, 200);
      doc.text(subtitle, 14, 22);
    }

    // Table headers
    const headers = columns
      .filter((col) => (col as { dataIndex?: string }).dataIndex && visibleColumns.includes((col as { dataIndex?: string }).dataIndex as string))
      .map((col) => col.title as string);

    // Table data
    const tableData = filteredData.map((item) =>
      columns
        .filter((col) => (col as { dataIndex?: string }).dataIndex && visibleColumns.includes((col as { dataIndex?: string }).dataIndex as string))
        .map((col) => {
          const dataIndex = (col as { dataIndex: string }).dataIndex;
          return String(item[dataIndex as keyof T] ?? "");
        })
    );

    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [24, 144, 255],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 30, left: 10, right: 10 },
      tableWidth: 'auto',
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount} | PharmaERP`,
        14,
        doc.internal.pageSize.getHeight() - 8
      );
    }

    if (download) {
      doc.save(`${exportFileName}_${new Date().toISOString().split('T')[0]}.pdf`);
      message.success('PDF downloaded successfully');
      soundManager.playSuccess();
    }

    return doc;
  }, [title, subtitle, columns, visibleColumns, filteredData, exportFileName]);

  const handlePDFPreview = useCallback(() => {
    const doc = generatePDF(false);
    const pdfDataUri = doc.output("datauristring");
    window.open(pdfDataUri, "_blank");
  }, [generatePDF]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: exportFileName,
    onAfterPrint: () => {
      message.success('Document sent to printer');
      soundManager.playSuccess();
    },
  });

  // Column visibility toggle
  const handleColumnToggle = useCallback((columnKey: string) => {
    setVisibleColumns((prev) => {
      const newColumns = prev.includes(columnKey)
        ? prev.filter((c) => c !== columnKey)
        : [...prev, columnKey];
      
      tableStorage.save(tableKey, { visibleColumns: newColumns });
      return newColumns;
    });
  }, [tableKey]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setGlobalSearch("");
    setColumnFilters({});
    soundManager.playClick();
  }, []);

  // Bulk actions
  const handleBulkDelete = useCallback(() => {
    if (onBulkDelete && selectedRowKeys.length > 0) {
      const selectedRecords = filteredData.filter((_, i) => selectedRowKeys.includes(i));
      onBulkDelete(selectedRecords as T[]);
      setSelectedRowKeys([]);
    }
  }, [onBulkDelete, selectedRowKeys, filteredData]);

  // Action column
  const actionColumn: ColumnsType<T>[0] = {
    title: "Actions",
    key: "actions",
    width: 100,
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
          label: "View Details",
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
          type: "divider" as const,
        });
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
            size="small"
            icon={<MoreOutlined style={{ fontSize: 16 }} />}
          />
        </Dropdown>
      );
    },
  };

  const finalColumns = showActions ? [...enhancedColumns, actionColumn] : enhancedColumns;

  // Export menu items
  const exportMenuItems = [
    {
      key: "excel-all",
      icon: <FileExcelOutlined />,
      label: "Export All to Excel",
      onClick: () => handleExportExcel(false),
    },
    ...(selectedRowKeys.length > 0
      ? [{
          key: "excel-selected",
          icon: <CheckSquareOutlined />,
          label: `Export Selected (${selectedRowKeys.length})`,
          onClick: () => handleExportExcel(true),
        }]
      : []),
    {
      key: "csv",
      icon: <ExportOutlined />,
      label: "Export to CSV",
      onClick: handleExportCSV,
    },
    { type: "divider" as const },
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

  // Column settings content
  const columnSettingsContent = (
    <div style={{ maxHeight: 300, overflow: 'auto', minWidth: 180 }}>
      <div style={{ marginBottom: 8 }}>
        <Text strong style={{ fontSize: 12 }}>Visible Columns</Text>
      </div>
      {allColumnKeys.map((key) => {
        const col = columns.find(
          (c) => (c as { dataIndex?: string }).dataIndex === key || (c as { key?: string }).key === key
        );
        return (
          <div key={key} style={{ marginBottom: 4 }}>
            <Checkbox
              checked={visibleColumns.includes(key)}
              onChange={() => handleColumnToggle(key)}
            >
              <Text style={{ fontSize: 12 }}>{col?.title as string}</Text>
            </Checkbox>
          </div>
        );
      })}
    </div>
  );

  const hasActiveFilters = globalSearch || Object.values(columnFilters).some(Boolean);

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <Typography.Title level={4} style={{ margin: 0, fontSize: 18 }}>
            {title}
          </Typography.Title>
          {subtitle && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {subtitle}
            </Text>
          )}
        </div>

        <Space wrap size="small">
          {/* Global Search */}
          <Input
            placeholder="Global search..."
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            style={{ width: 200 }}
            allowClear
            size="middle"
          />

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Tooltip title="Clear all filters">
              <Button
                icon={<CloseOutlined />}
                onClick={handleClearFilters}
                size="middle"
              >
                Clear
              </Button>
            </Tooltip>
          )}

          {/* Refresh */}
          <Tooltip title="Refresh data">
            <Button
              icon={<ReloadOutlined spin={loading} />}
              onClick={() => {
                onRefresh?.();
                soundManager.playClick();
              }}
              size="middle"
            />
          </Tooltip>

          {/* Column Settings */}
          <Popover
            content={columnSettingsContent}
            trigger="click"
            placement="bottomRight"
            title={null}
          >
            <Tooltip title="Column settings">
              <Button icon={<SettingOutlined />} size="middle" />
            </Tooltip>
          </Popover>

          {/* Export */}
          <Dropdown menu={{ items: exportMenuItems }} trigger={["click"]}>
            <Button icon={<ExportOutlined />} size="middle">
              Export
            </Button>
          </Dropdown>

          {/* Add New */}
          {onAdd && (
            <Button
              type="primary"
              onClick={() => {
                onAdd();
                soundManager.playClick();
              }}
              size="middle"
            >
              + Add New
            </Button>
          )}
        </Space>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRowKeys.length > 0 && (
        <div
          style={{
            background: "linear-gradient(135deg, #e6f4ff 0%, #f0f7ff 100%)",
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid #91caff",
          }}
        >
          <Space>
            <Badge count={selectedRowKeys.length} style={{ backgroundColor: "#1890ff" }} />
            <Text strong style={{ fontSize: 13 }}>
              {selectedRowKeys.length} item{selectedRowKeys.length > 1 ? "s" : ""} selected
            </Text>
          </Space>
          <Space>
            {onBulkDelete && (
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            )}
            <Button
              size="small"
              icon={<FileExcelOutlined />}
              onClick={() => handleExportExcel(true)}
            >
              Export Selected
            </Button>
            <Button
              size="small"
              type="text"
              onClick={() => setSelectedRowKeys([])}
            >
              Clear Selection
            </Button>
          </Space>
        </div>
      )}

      {/* Summary Cards */}
      {summary && <div style={{ marginBottom: 16 }}>{summary}</div>}

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: 24 }}>
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        ) : (
          <Table
            columns={finalColumns}
            dataSource={filteredData}
            rowKey={rowKey}
            loading={false}
            pagination={{
              ...pagination,
              total: serverSide ? total : filteredData.length,
            }}
            onChange={handleTableChange}
            rowSelection={rowSelection}
            scroll={{ x: "max-content" }}
            size="small"
            bordered={false}
            sticky={{ offsetHeader: 0 }}
            style={{ fontSize: 12 }}
          />
        )}
      </div>

      {/* Hidden Print Content */}
      <div style={{ display: "none" }}>
        <div ref={printRef} style={{ padding: 30 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              padding: "20px 30px",
              marginBottom: 20,
              borderRadius: 8,
            }}
          >
            <h1 style={{ color: "#fff", margin: 0, fontSize: 24 }}>{title}</h1>
            {subtitle && (
              <p style={{ color: "rgba(255,255,255,0.85)", margin: "8px 0 0 0", fontSize: 14 }}>
                {subtitle}
              </p>
            )}
          </div>
          
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 11,
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#fafafa" }}>
                {columns
                  .filter((col) => visibleColumns.includes((col as { dataIndex?: string }).dataIndex as string))
                  .map((col, index) => (
                    <th
                      key={index}
                      style={{
                        padding: "10px 8px",
                        border: "1px solid #e8e8e8",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: 11,
                      }}
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
                    backgroundColor: rowIndex % 2 === 0 ? "#fff" : "#fafafa",
                  }}
                >
                  {columns
                    .filter((col) => visibleColumns.includes((col as { dataIndex?: string }).dataIndex as string))
                    .map((col, colIndex) => {
                      const dataIndex = (col as { dataIndex: string }).dataIndex;
                      return (
                        <td
                          key={colIndex}
                          style={{
                            padding: "8px",
                            border: "1px solid #e8e8e8",
                            fontSize: 10,
                          }}
                        >
                          {String(item[dataIndex as keyof T] ?? "")}
                        </td>
                      );
                    })}
                </tr>
              ))}
            </tbody>
          </table>
          
          <div
            style={{
              marginTop: 20,
              paddingTop: 15,
              borderTop: "1px solid #e8e8e8",
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              color: "#8c8c8c",
            }}
          >
            <span>Total Records: {filteredData.length}</span>
            <span>Generated on {new Date().toLocaleString()} | PharmaERP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
