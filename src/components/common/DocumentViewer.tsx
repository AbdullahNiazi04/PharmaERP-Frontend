"use client";

import React, { useRef, useCallback } from "react";
import {
  Modal,
  Button,
  Space,
  Typography,
  Divider,
  Descriptions,
  Tag,
  Row,
  Col,
  Card,
  Table,
} from "antd";
import {
  PrinterOutlined,
  DownloadOutlined,
  CloseOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const { Title, Text } = Typography;

interface SectionItem {
  label: string;
  value: React.ReactNode;
  span?: number;
}

interface DocumentSection {
  title: string;
  items?: SectionItem[];
  content?: React.ReactNode;
  table?: {
    columns: { title: string; dataIndex: string; render?: (value: unknown, record: unknown) => React.ReactNode }[];
    data: Record<string, unknown>[];
  };
}

interface DocumentViewerProps {
  open: boolean;
  onClose: () => void;
  
  // Document header
  documentType: string; // e.g., "Purchase Order", "GRN", etc.
  documentNumber: string;
  documentDate?: string;
  status?: {
    text: string;
    color: string;
  };
  
  // Company info
  companyName?: string;
  companyAddress?: string;
  companyLogo?: string;
  
  // Document sections
  sections: DocumentSection[];
  
  // Footer
  footer?: React.ReactNode;
  signatures?: { title: string; name?: string }[];
  
  // Export file name
  fileName?: string;
}

export default function DocumentViewer({
  open,
  onClose,
  documentType,
  documentNumber,
  documentDate,
  status,
  companyName = "PharmaERP",
  companyAddress = "Pharmaceutical Enterprise Resource Planning System",
  sections,
  footer,
  signatures,
  fileName = "document",
}: DocumentViewerProps) {
  const documentRef = useRef<HTMLDivElement>(null);

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: documentRef,
    documentTitle: `${documentType}_${documentNumber}`,
  });

  // PDF download
  const handleDownloadPDF = useCallback(async () => {
    if (!documentRef.current) return;

    try {
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${fileName}_${documentNumber}_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  }, [fileName, documentNumber]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={900}
      footer={null}
      title={null}
      closeIcon={null}
      styles={{
        body: { padding: 0, borderRadius: 12, overflow: "hidden" },
      }}
    >
      {/* Action Bar */}
      <div
        style={{
          background: "linear-gradient(135deg, #001529 0%, #003a70 100%)",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={5} style={{ color: "#fff", margin: 0 }}>
          {documentType} - {documentNumber}
        </Title>
        <Space>
          <Button
            icon={<PrinterOutlined />}
            onClick={() => handlePrint()}
            style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff" }}
          >
            Print
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadPDF}
            type="primary"
          >
            Download PDF
          </Button>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            style={{ color: "#fff" }}
          />
        </Space>
      </div>

      {/* Document Content */}
      <div
        style={{
          maxHeight: "calc(100vh - 200px)",
          overflow: "auto",
          background: "#f5f5f5",
          padding: 24,
        }}
      >
        <div
          ref={documentRef}
          style={{
            background: "#fff",
            padding: 40,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            borderRadius: 4,
            minHeight: 800,
          }}
        >
          {/* Document Header */}
          <div
            style={{
              borderBottom: "3px solid #1890ff",
              paddingBottom: 20,
              marginBottom: 30,
            }}
          >
            <Row justify="space-between" align="top">
              <Col>
                <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
                  {companyName}
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {companyAddress}
                </Text>
              </Col>
              <Col style={{ textAlign: "right" }}>
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: "#262626",
                  }}
                >
                  {documentType}
                </Title>
                <div style={{ marginTop: 8 }}>
                  <Text strong style={{ fontSize: 16 }}>
                    #{documentNumber}
                  </Text>
                </div>
                {documentDate && (
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Date: {documentDate}
                    </Text>
                  </div>
                )}
                {status && (
                  <div style={{ marginTop: 8 }}>
                    <Tag color={status.color} style={{ fontSize: 12 }}>
                      {status.text}
                    </Tag>
                  </div>
                )}
              </Col>
            </Row>
          </div>

          {/* Document Sections */}
          {sections.map((section, index) => (
            <div key={index} style={{ marginBottom: 30 }}>
              <Title
                level={5}
                style={{
                  borderBottom: "1px solid #e8e8e8",
                  paddingBottom: 8,
                  marginBottom: 16,
                  color: "#434343",
                  fontSize: 14,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {section.title}
              </Title>

              {section.items && (
                <Descriptions
                  column={{ xs: 1, sm: 2, md: 3 }}
                  size="small"
                  styles={{
                    label: {
                      fontWeight: 600,
                      color: "#8c8c8c",
                      fontSize: 12,
                    },
                    content: {
                      color: "#262626",
                      fontSize: 13,
                    },
                  }}
                >
                  {section.items.map((item, itemIndex) => (
                    <Descriptions.Item
                      key={itemIndex}
                      label={item.label}
                      span={item.span || 1}
                    >
                      {item.value || "-"}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              )}

              {section.content && (
                <div style={{ marginTop: 12 }}>{section.content}</div>
              )}

              {section.table && (
                <Table
                  dataSource={section.table.data}
                  columns={section.table.columns.map((col) => ({
                    ...col,
                    title: (
                      <span style={{ fontSize: 11, fontWeight: 600 }}>
                        {col.title}
                      </span>
                    ),
                  }))}
                  pagination={false}
                  size="small"
                  bordered
                  style={{ marginTop: 12 }}
                  rowKey={(_, index) => index?.toString() || '0'}
                />
              )}
            </div>
          ))}

          {/* Signatures */}
          {signatures && signatures.length > 0 && (
            <div style={{ marginTop: 60 }}>
              <Row gutter={48}>
                {signatures.map((sig, index) => (
                  <Col key={index} span={24 / signatures.length}>
                    <div
                      style={{
                        borderTop: "1px solid #d9d9d9",
                        paddingTop: 12,
                        textAlign: "center",
                      }}
                    >
                      <Text strong style={{ fontSize: 12 }}>
                        {sig.title}
                      </Text>
                      {sig.name && (
                        <div>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {sig.name}
                          </Text>
                        </div>
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* Footer */}
          {footer && (
            <div
              style={{
                marginTop: 40,
                paddingTop: 20,
                borderTop: "1px solid #e8e8e8",
              }}
            >
              {footer}
            </div>
          )}

          {/* Document Footer */}
          <div
            style={{
              marginTop: 60,
              paddingTop: 16,
              borderTop: "1px solid #e8e8e8",
              textAlign: "center",
            }}
          >
            <Text type="secondary" style={{ fontSize: 10 }}>
              This is a computer-generated document. No signature is required.
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 10 }}>
              Generated on {new Date().toLocaleString()} | PharmaERP System
            </Text>
          </div>
        </div>
      </div>
    </Modal>
  );
}
