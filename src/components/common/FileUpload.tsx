"use client";

import React, { useState, useCallback } from "react";
import {
  Upload,
  Button,
  Progress,
  Typography,
  Space,
  Image,
  Modal,
  message,
  Tooltip,
} from "antd";
import {
  UploadOutlined,
  InboxOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  DeleteOutlined,
  EyeOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps, RcFile } from "antd/es/upload";
import { soundManager } from "@/lib/sounds";

const { Text } = Typography;
const { Dragger } = Upload;

interface FileUploadProps {
  value?: UploadFile[];
  onChange?: (files: UploadFile[]) => void;
  
  // Configuration
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  
  // Style
  listType?: "text" | "picture" | "picture-card";
  dragDrop?: boolean;
  
  // Callbacks
  onUpload?: (file: RcFile) => Promise<string>; // Returns uploaded URL
  onRemove?: (file: UploadFile) => Promise<boolean> | boolean;
}

// Get file icon based on type
const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return <FilePdfOutlined style={{ color: "#ff4d4f", fontSize: 24 }} />;
    case "xls":
    case "xlsx":
      return <FileExcelOutlined style={{ color: "#52c41a", fontSize: 24 }} />;
    case "doc":
    case "docx":
      return <FileWordOutlined style={{ color: "#1890ff", fontSize: 24 }} />;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
      return <FileImageOutlined style={{ color: "#722ed1", fontSize: 24 }} />;
    default:
      return <FileOutlined style={{ color: "#8c8c8c", fontSize: 24 }} />;
  }
};

// Check if file is an image
const isImage = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return ["png", "jpg", "jpeg", "gif", "webp", "bmp"].includes(ext || "");
};

// Format file size
const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function FileUpload({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 10, // 10MB default
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif",
  multiple = true,
  disabled = false,
  listType = "picture",
  dragDrop = true,
  onUpload,
  onRemove,
}: FileUploadProps) {
  const [fileList, setFileList] = useState<UploadFile[]>(value);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // Validate file before upload
  const beforeUpload = useCallback(
    (file: RcFile): boolean | Promise<boolean> => {
      // Check file count
      if (fileList.length >= maxFiles) {
        message.error(`Maximum ${maxFiles} files allowed`);
        soundManager.playError();
        return false;
      }

      // Check file size
      const isValidSize = file.size / 1024 / 1024 < maxSize;
      if (!isValidSize) {
        message.error(`File must be smaller than ${maxSize}MB`);
        soundManager.playError();
        return false;
      }

      // Check file type
      const acceptTypes = accept.split(",").map((t) => t.trim().toLowerCase());
      const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;
      const isValidType = acceptTypes.some(
        (type) => type === fileExt || type === file.type || type === "*"
      );

      if (!isValidType) {
        message.error(`File type not allowed. Accepted: ${accept}`);
        soundManager.playError();
        return false;
      }

      return true;
    },
    [fileList.length, maxFiles, maxSize, accept]
  );

  // Handle file changes
  const handleChange: UploadProps["onChange"] = useCallback(
    ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
      setFileList(newFileList);
      onChange?.(newFileList);

      // Play sound on successful upload
      const lastFile = newFileList[newFileList.length - 1];
      if (lastFile?.status === "done") {
        soundManager.playSuccess();
      } else if (lastFile?.status === "error") {
        soundManager.playError();
      }
    },
    [onChange]
  );

  // Handle file removal
  const handleRemove = useCallback(
    async (file: UploadFile) => {
      if (onRemove) {
        const result = await onRemove(file);
        if (!result) return false;
      }
      
      const newFileList = fileList.filter((f) => f.uid !== file.uid);
      setFileList(newFileList);
      onChange?.(newFileList);
      soundManager.playDelete();
      return true;
    },
    [fileList, onChange, onRemove]
  );

  // Handle preview
  const handlePreview = useCallback(async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    if (isImage(file.name)) {
      setPreviewImage(file.url || (file.preview as string));
      setPreviewTitle(file.name);
      setPreviewOpen(true);
    } else if (file.url) {
      // Open non-image files in new tab
      window.open(file.url, "_blank");
    }
  }, []);

  // Custom upload (if onUpload provided)
  const customRequest: UploadProps["customRequest"] = useCallback(
    async ({ file, onSuccess, onError, onProgress }: {
      file: RcFile | Blob | string;
      onSuccess?: (body: unknown) => void;
      onError?: (error: Error) => void;
      onProgress?: (event: { percent: number }) => void;
    }) => {
      if (onUpload) {
        try {
          onProgress?.({ percent: 30 });
          const url = await onUpload(file as RcFile);
          onProgress?.({ percent: 100 });
          onSuccess?.(url);
        } catch (error) {
          onError?.(error as Error);
        }
      } else {
        // Mock upload for demo
        setTimeout(() => {
          onProgress?.({ percent: 100 });
          onSuccess?.("ok");
        }, 500);
      }
    },
    [onUpload]
  );

  // Drag and drop uploader
  if (dragDrop) {
    return (
      <div>
        <Dragger
          fileList={fileList}
          onChange={handleChange}
          onRemove={handleRemove}
          onPreview={handlePreview}
          beforeUpload={beforeUpload}
          customRequest={customRequest}
          multiple={multiple}
          disabled={disabled}
          accept={accept}
          listType={listType}
          style={{ padding: "20px 0" }}
        >
          <p className="ant-upload-drag-icon">
            <CloudUploadOutlined style={{ color: "#1890ff", fontSize: 48 }} />
          </p>
          <p className="ant-upload-text" style={{ fontSize: 14 }}>
            Click or drag files to this area to upload
          </p>
          <p className="ant-upload-hint" style={{ fontSize: 12 }}>
            Support for single or bulk upload. Max {maxSize}MB per file.
          </p>
          <p className="ant-upload-hint" style={{ fontSize: 11, color: "#8c8c8c" }}>
            Accepted: {accept}
          </p>
        </Dragger>

        {/* Image Preview Modal */}
        <Modal
          open={previewOpen}
          title={previewTitle}
          footer={null}
          onCancel={() => setPreviewOpen(false)}
        >
          <Image
            alt={previewTitle}
            style={{ width: "100%" }}
            src={previewImage}
            preview={false}
          />
        </Modal>
      </div>
    );
  }

  // Regular upload button
  return (
    <div>
      <Upload
        fileList={fileList}
        onChange={handleChange}
        onRemove={handleRemove}
        onPreview={handlePreview}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        multiple={multiple}
        disabled={disabled}
        accept={accept}
        listType={listType}
      >
        <Button icon={<UploadOutlined />} disabled={disabled || fileList.length >= maxFiles}>
          Upload Files ({fileList.length}/{maxFiles})
        </Button>
      </Upload>

      {/* Image Preview Modal */}
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <Image
          alt={previewTitle}
          style={{ width: "100%" }}
          src={previewImage}
          preview={false}
        />
      </Modal>
    </div>
  );
}

// Helper function to convert file to base64
const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
