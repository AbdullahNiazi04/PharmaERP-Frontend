"use client";

import { App } from "antd";
import type { NotificationArgsProps } from "antd";
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  InfoCircleOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';

type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationOptions {
  title: string;
  message?: string;
  duration?: number;
  placement?: NotificationArgsProps["placement"];
}

export function useNotification() {
  const { notification, message, modal } = App.useApp();

  const showNotification = (
    type: NotificationType,
    options: NotificationOptions
  ) => {
    const icons = {
      success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      error: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      info: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
      warning: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
    };

    notification[type]({
      message: options.title,
      description: options.message,
      duration: options.duration ?? 4,
      placement: options.placement ?? "topRight",
      icon: icons[type],
    });
  };

  const showMessage = (type: NotificationType, content: string) => {
    message[type](content);
  };

  const showConfirm = (options: {
    title: string;
    content?: string;
    onOk: () => void;
    onCancel?: () => void;
    okText?: string;
    cancelText?: string;
    danger?: boolean;
  }) => {
    modal.confirm({
      title: options.title,
      content: options.content,
      onOk: options.onOk,
      onCancel: options.onCancel,
      okText: options.okText ?? "Confirm",
      cancelText: options.cancelText ?? "Cancel",
      okButtonProps: { danger: options.danger },
    });
  };

  return {
    // Notifications
    success: (options: NotificationOptions) =>
      showNotification("success", options),
    error: (options: NotificationOptions) => showNotification("error", options),
    info: (options: NotificationOptions) => showNotification("info", options),
    warning: (options: NotificationOptions) =>
      showNotification("warning", options),

    // Quick messages
    successMsg: (content: string) => showMessage("success", content),
    errorMsg: (content: string) => showMessage("error", content),
    infoMsg: (content: string) => showMessage("info", content),
    warningMsg: (content: string) => showMessage("warning", content),

    // Confirm dialog
    confirm: showConfirm,

    // CRUD specific
    onCreateSuccess: (entity: string) =>
      showNotification("success", {
        title: `${entity} Created`,
        message: `New ${entity.toLowerCase()} has been created successfully.`,
      }),

    onUpdateSuccess: (entity: string) =>
      showNotification("success", {
        title: `${entity} Updated`,
        message: `${entity} has been updated successfully.`,
      }),

    onDeleteSuccess: (entity: string) =>
      showNotification("success", {
        title: `${entity} Deleted`,
        message: `${entity} has been deleted successfully.`,
      }),

    onError: (error: string) =>
      showNotification("error", {
        title: "Error",
        message: error,
      }),

    confirmDelete: (entity: string, onConfirm: () => void) =>
      showConfirm({
        title: `Delete ${entity}?`,
        content: `Are you sure you want to delete this ${entity.toLowerCase()}? This action cannot be undone.`,
        onOk: onConfirm,
        okText: "Delete",
        danger: true,
      }),
  };
}

export default useNotification;
