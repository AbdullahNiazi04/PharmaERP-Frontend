"use client";

import React from "react";
import { Modal, Button, Space, Typography } from "antd";
import {
  PrinterOutlined,
  DownloadOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface PDFPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  pdfUrl: string;
  title?: string;
  onPrint?: () => void;
  onDownload?: () => void;
}

export default function PDFPreviewModal({
  visible,
  onClose,
  pdfUrl,
  title = "PDF Preview",
  onPrint,
  onDownload,
}: PDFPreviewModalProps) {
  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingRight: 16,
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            {title}
          </Title>
          <Space>
            {onPrint && (
              <Button icon={<PrinterOutlined />} onClick={onPrint}>
                Print
              </Button>
            )}
            {onDownload && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={onDownload}
              >
                Download
              </Button>
            )}
          </Space>
        </div>
      }
      width="80%"
      style={{ top: 20 }}
      footer={null}
      closeIcon={<CloseOutlined />}
    >
      <div
        style={{
          height: "75vh",
          borderRadius: 8,
          overflow: "hidden",
          background: "#f5f5f5",
        }}
      >
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title="PDF Preview"
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Text type="secondary">No PDF to preview</Text>
          </div>
        )}
      </div>
    </Modal>
  );
}
