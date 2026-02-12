import React, { useEffect, useState } from 'react';
import { Drawer, Form, Button, Select, Input, message, Spin } from 'antd';
import { RmqcInspection, QcInspector, qcInspectorsApi, rmqcApi } from '@/lib/services';

interface RmqcEditDrawerProps {
  open: boolean;
  onClose: () => void;
  inspection: RmqcInspection | null;
  onSuccess: () => void;
}

const { Option } = Select;
const { TextArea } = Input;

export default function RmqcEditDrawer({ open, onClose, inspection, onSuccess }: RmqcEditDrawerProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [inspectors, setInspectors] = useState<QcInspector[]>([]);
  const [loadingInspectors, setLoadingInspectors] = useState(false);

  useEffect(() => {
    if (open) {
      fetchInspectors();
      if (inspection) {
        form.setFieldsValue({
          inspector_id: inspection.inspectorId,
          status: inspection.status,
          description: inspection.description,
        });
      }
    } else {
      form.resetFields();
    }
  }, [open, inspection, form]);

  const fetchInspectors = async () => {
    setLoadingInspectors(true);
    try {
      const data = await qcInspectorsApi.getAll();
      setInspectors(data);
    } catch (error) {
      message.error('Failed to load inspectors');
    } finally {
      setLoadingInspectors(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!inspection) return;
    setLoading(true);
    try {
        // Values are already snake_case if form items are named snake_case.
        // If form items are camel, we need to map them.
        // Form items are: inspector_id, status, description.
        // So values = { inspector_id: "...", ... } which matches backend DTO.
      await rmqcApi.update(inspection.id, values);
      message.success('Inspection updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      message.error('Failed to update inspection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title="Edit RMQC Inspection"
      width={500}
      onClose={onClose}
      open={open}
      bodyStyle={{ paddingBottom: 80 }}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          name="inspector_id"
          label="Inspector"
          rules={[{ required: true, message: 'Please select an inspector' }]}
        >
          <Select
            placeholder="Select an inspector"
            loading={loadingInspectors}
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
            }
          >
            {inspectors.map((inspector) => (
              <Option key={inspector.id} value={inspector.id}>
                {inspector.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select placeholder="Select status">
            <Option value="Pending">Pending</Option>
            <Option value="Passed">Passed</Option>
            <Option value="Failed">Failed</Option>
          </Select>
        </Form.Item>

        <Form.Item name="description" label="Description / Remarks">
          <TextArea rows={4} placeholder="Enter inspection details or remarks" />
        </Form.Item>

        <Form.Item>
            <div style={{ textAlign: 'right' }}>
                <Button onClick={onClose} style={{ marginRight: 8 }}>
                    Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Save Changes
                </Button>
            </div>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
