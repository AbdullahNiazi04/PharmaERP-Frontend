"use client";

import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  Button,
  Space,
  Spin,
  Row,
  Col,
  Divider,
  Typography,
  Tooltip,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import type { FormInstance } from "antd";

const { TextArea } = Input;
const { Text } = Typography;

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "textarea"
    | "select"
    | "date"
    | "switch"
    | "phone";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { label: string; value: string | number }[];
  tooltip?: string;
  rules?: object[];
  span?: number;
  min?: number;
  max?: number;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

interface FormModalProps {
  title: string;
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>) => void;
  fields: FormField[];
  initialValues?: Record<string, unknown>;
  loading?: boolean;
  width?: number | string;
  mode?: "create" | "edit" | "view";
}

export default function FormModal({
  title,
  visible,
  onCancel,
  onSubmit,
  fields,
  initialValues,
  loading = false,
  width = 720,
  mode = "create",
}: FormModalProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const renderFormField = (field: FormField) => {
    const isViewMode = mode === "view";

    const label = (
      <Space>
        {field.label}
        {field.tooltip && (
          <Tooltip title={field.tooltip}>
            <InfoCircleOutlined style={{ color: "#999" }} />
          </Tooltip>
        )}
      </Space>
    );

    const commonRules = field.required
      ? [{ required: true, message: `Please enter ${field.label.toLowerCase()}` }]
      : [];

    const rules = field.rules ? [...commonRules, ...field.rules] : commonRules;

    switch (field.type) {
      case "text":
      case "email":
      case "password":
      case "phone":
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={label}
            rules={rules}
          >
            <Input
              type={field.type === "password" ? "password" : "text"}
              placeholder={field.placeholder}
              disabled={field.disabled || isViewMode}
              prefix={field.prefix}
              suffix={field.suffix}
            />
          </Form.Item>
        );

      case "number":
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={label}
            rules={rules}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder={field.placeholder}
              disabled={field.disabled || isViewMode}
              min={field.min}
              max={field.max}
              prefix={field.prefix}
            />
          </Form.Item>
        );

      case "textarea":
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={label}
            rules={rules}
          >
            <TextArea
              rows={4}
              placeholder={field.placeholder}
              disabled={field.disabled || isViewMode}
            />
          </Form.Item>
        );

      case "select":
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={label}
            rules={rules}
          >
            <Select
              placeholder={field.placeholder}
              disabled={field.disabled || isViewMode}
              options={field.options}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        );

      case "date":
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={label}
            rules={rules}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder={field.placeholder}
              disabled={field.disabled || isViewMode}
            />
          </Form.Item>
        );

      case "switch":
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={label}
            valuePropName="checked"
          >
            <Switch disabled={field.disabled || isViewMode} />
          </Form.Item>
        );

      default:
        return null;
    }
  };

  const modalFooter = (isViewMode: boolean) => (
    <Space>
      <Button onClick={onCancel}>
        {isViewMode ? "Close" : "Cancel"}
      </Button>
      {!isViewMode && (
        <Button type="primary" onClick={handleOk} loading={loading}>
          {mode === "create" ? "Create" : "Save Changes"}
        </Button>
      )}
    </Space>
  );

  const isViewMode = mode === "view";

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      footer={modalFooter(isViewMode)}
      width={width}
      destroyOnClose
      centered
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            {fields.map((field) => (
              <Col span={field.span ?? 12} key={field.name}>
                {renderFormField(field)}
              </Col>
            ))}
          </Row>
        </Form>
      </Spin>
    </Modal>
  );
}
