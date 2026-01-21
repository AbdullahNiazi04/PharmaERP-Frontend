import React, { useState } from 'react';
import { Select, Button, Divider, Input, Form, Modal, Popconfirm, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useProcurementOptions, useCreateProcurementOption, useDeleteProcurementOption } from '@/hooks/useProcurement';

interface DynamicSelectProps {
  type: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  style?: React.CSSProperties;
  showSearch?: boolean;
  disabled?: boolean;
}

export const DynamicSelect: React.FC<DynamicSelectProps> = ({
  type,
  value,
  onChange,
  placeholder,
  allowClear,
  style,
  showSearch = true,
  disabled
}) => {
  const { data: options = [], isLoading } = useProcurementOptions(type);
  const createOption = useCreateProcurementOption();
  const deleteOption = useDeleteProcurementOption();

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await createOption.mutateAsync({
        type,
        label: values.label,
        value: values.label, // Use label as value for simplicity
      });
      setIsModalOpen(false);
      form.resetFields();
    } catch (err) {
      // Validate error
    }
  };
  
  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      e.preventDefault();
      deleteOption.mutate(id);
  }

  return (
    <>
      <Select
        style={style}
        placeholder={placeholder}
        allowClear={allowClear}
        showSearch={showSearch}
        value={value}
        onChange={onChange}
        loading={isLoading}
        disabled={disabled}
        optionFilterProp="children"
        dropdownRender={(menu) => (
          <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ padding: '0 8px 4px', cursor: 'pointer', color: '#1677ff' }} onClick={() => setIsModalOpen(true)}>
              <PlusOutlined /> Add new item
            </div>
          </>
        )}
      >
        {options.map((opt) => (
           <Select.Option key={opt.id} value={opt.value}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{opt.label}</span>
                  <Popconfirm 
                      title="Delete option?"
                      onConfirm={(e: any) => handleDelete(e, opt.id)}
                      onCancel={(e) => e?.stopPropagation()}
                      okText="Yes"
                      cancelText="No"
                  >
                      <DeleteOutlined 
                          style={{ color: '#ff4d4f', fontSize: 12, cursor: 'pointer' }} 
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} 
                      />
                  </Popconfirm>
              </div>
           </Select.Option>
        ))}
      </Select>

      <Modal
        title={`Add New ${type.replace(/_/g, ' ')}`}
        open={isModalOpen}
        onOk={handleCreate}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={createOption.isPending}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
             name="label"
             label="Name"
             rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder="Enter new option name" autoFocus />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
