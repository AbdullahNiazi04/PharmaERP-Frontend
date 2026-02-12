"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Drawer,
  Form,
  Button,
  Space,
  Typography,
  Tooltip,
  Alert,
  Divider,
  Popconfirm,
  Steps,
} from "antd";
import {
  CloseOutlined,
  SaveOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { formStorage } from "@/lib/storage";
import { soundManager } from "@/lib/sounds";

const { Title, Text } = Typography;

interface FormDrawerProps {
  title: string;
  subtitle?: string;
  formKey: string; // Unique key for form persistence
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
  onDelete?: () => void;
  loading?: boolean;
  mode: "create" | "edit" | "view";
  width?: number | string;
  children: React.ReactNode;
  form: ReturnType<typeof Form.useForm>[0];
  initialValues?: object;
  entityId?: string;
  
  // Step-based form support
  steps?: { title: string; description?: string }[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  
  // Optional transform for draft data (e.g. converting date strings to dayjs)
  onDraftLoaded?: (data: Record<string, unknown>) => Record<string, unknown>;
  
  // Optional listener for form changes
  onValuesChange?: (changedValues: any, allValues: any) => void;
}

export default function FormDrawer({
  title,
  subtitle,
  formKey,
  open,
  onClose,
  onSubmit,
  onDelete,
  loading = false,
  mode,
  width = 600,
  children,
  form,
  initialValues,
  entityId,
  steps,
  currentStep = 0,
  onStepChange,
  onDraftLoaded,
  onValuesChange,
}: FormDrawerProps) {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftAge, setDraftAge] = useState<string | null>(null);
  const [formChanged, setFormChanged] = useState(false);

  // Generate storage key based on mode and entity
  const storageKey = `${formKey}_${mode}${entityId ? `_${entityId}` : ""}`;

  // Check for existing draft on mount
  useEffect(() => {
    if (open && mode !== "view") {
      const draft = formStorage.load(storageKey);
      if (draft) {
        setHasDraft(true);
        setDraftAge(formStorage.getAge(storageKey));
      } else {
        setHasDraft(false);
        setDraftAge(null);
      }
    }
  }, [open, storageKey, mode]);

  // Initialize form with initial values or draft
  useEffect(() => {
    if (open) {
      if (mode === "create") {
        const draft = formStorage.load(storageKey);
        if (draft) {
          const data = onDraftLoaded ? onDraftLoaded(draft.data) : draft.data;
          form.setFieldsValue(data);
        } else if (initialValues) {
          form.setFieldsValue(initialValues);
        } else {
          form.resetFields();
        }
      } else if (initialValues) {
        form.setFieldsValue(initialValues);
      }
      setFormChanged(false);
    }
  }, [open, form, initialValues, mode, storageKey, onDraftLoaded]);

  // Auto-save draft on form changes
  const handleValuesChange = useCallback((changedValues: any, allValues: any) => {
    if (mode === "view") return;
    
    // Call parent listener if provided
    if (onValuesChange) {
      onValuesChange(changedValues, allValues);
    }
    
    setFormChanged(true);
    // Use allValues directly or getFieldsValue (which might be same)
    formStorage.save(storageKey, allValues, entityId);
  }, [form, storageKey, entityId, mode, onValuesChange]);

  // Restore draft
  const handleRestoreDraft = useCallback(() => {
    const draft = formStorage.load(storageKey);
    if (draft) {
      const data = onDraftLoaded ? onDraftLoaded(draft.data) : draft.data;
      form.setFieldsValue(data);
      soundManager.playSuccess();
    }
  }, [form, storageKey, onDraftLoaded]);

  // Discard draft
  const handleDiscardDraft = useCallback(() => {
    formStorage.clear(storageKey);
    form.resetFields();
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
    setHasDraft(false);
    setFormChanged(false);
    soundManager.playDelete();
  }, [form, initialValues, storageKey]);

  // Handle close with confirmation if form changed
  const handleClose = useCallback(() => {
    if (formChanged && mode !== "view") {
      // Draft is auto-saved, so just close
      soundManager.playClick();
    } else {
      // Clear draft on normal close without changes
      if (mode === "create" && !formChanged) {
        formStorage.clear(storageKey);
      }
    }
    onClose();
  }, [formChanged, mode, onClose, storageKey]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values as Record<string, unknown>);
      
      // Clear draft on successful submit
      formStorage.clear(storageKey);
      setFormChanged(false);
      soundManager.playSuccess();
    } catch (error) {
      soundManager.playError();
      console.error("Form validation failed:", error);
    }
  }, [form, onSubmit, storageKey]);

  // Handle delete
  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete();
      soundManager.playDelete();
    }
  }, [onDelete]);

  // Get mode-specific title prefix
  const getModeLabel = () => {
    switch (mode) {
      case "create":
        return "Create New";
      case "edit":
        return "Edit";
      case "view":
        return "View";
      default:
        return "";
    }
  };

  // Header actions
  const headerActions = (
    <Space>
      {mode !== "view" && formChanged && (
        <Tooltip title="Form data is auto-saved">
          <Text type="secondary" style={{ fontSize: 12 }}>
            <SaveOutlined style={{ marginRight: 4 }} />
            Auto-saved
          </Text>
        </Tooltip>
      )}
      <Button
        type="text"
        icon={<CloseOutlined />}
        onClick={handleClose}
      />
    </Space>
  );

  return (
    <Drawer
      title={
        <div>
          <Title level={5} style={{ margin: 0 }}>
            {getModeLabel()} {title}
          </Title>
          {subtitle && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {subtitle}
            </Text>
          )}
        </div>
      }
      placement="right"
      onClose={handleClose}
      open={open}
      extra={headerActions}
      destroyOnClose={false}
      maskClosable={false}
      styles={{
        wrapper: { width },
        body: { paddingBottom: 80 },
        header: {
          borderBottom: "1px solid #f0f0f0",
          padding: "16px 20px",
        },
      }}
      footer={
        mode !== "view" && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0",
            }}
          >
            <Space>
              {mode === "edit" && onDelete && (
                <Popconfirm
                  title="Delete this record?"
                  description="This action cannot be undone."
                  onConfirm={handleDelete}
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Popconfirm>
              )}
            </Space>
            <Space>
              <Button onClick={handleClose}>Cancel</Button>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                icon={<SaveOutlined />}
              >
                {mode === "create" ? "Create" : "Save Changes"}
              </Button>
            </Space>
          </div>
        )
      }
    >
      {/* Draft restoration alert */}
      {hasDraft && mode === "create" && (
        <Alert
          title={
            <Space>
              <HistoryOutlined />
              <span>You have unsaved data from {draftAge}</span>
            </Space>
          }
          type="info"
          showIcon={false}
          style={{ marginBottom: 16 }}
          action={
            <Space size="small">
              <Button size="small" type="link" onClick={handleRestoreDraft}>
                Restore
              </Button>
              <Button size="small" type="link" danger onClick={handleDiscardDraft}>
                Discard
              </Button>
            </Space>
          }
        />
      )}

      {/* Steps for multi-step forms */}
      {steps && steps.length > 1 && (
        <>
          <Steps
            current={currentStep}
            size="small"
            onChange={onStepChange}
            items={steps.map((step) => ({
              title: step.title,
              description: step.description,
            }))}
            style={{ marginBottom: 24 }}
          />
          <Divider style={{ margin: "16px 0" }} />
        </>
      )}

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        disabled={mode === "view"}
        requiredMark={(label, { required }) => (
          <>
            {label}
            {required && (
              <span style={{ color: "#ff4d4f", marginLeft: 4 }}>*</span>
            )}
          </>
        )}
      >
        {children}
      </Form>

      {/* View mode footer */}
      {mode === "view" && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "12px 20px",
            background: "#fff",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Button block onClick={handleClose}>
            Close
          </Button>
        </div>
      )}
    </Drawer>
  );
}
