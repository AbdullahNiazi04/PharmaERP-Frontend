"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRmqcInspection, useUpdateRmqc, usePassRmqc, useFailRmqc } from "@/hooks/useProcurement";
import {
  Card,
  Descriptions,
  Button,
  Tag,
  Divider,
  List,
  Typography,
  Image,
  Space,
  Modal,
  Form,
  Input,
  Upload,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function RmqcDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { data: inspection, isLoading } = useRmqcInspection(id);
  
  const updateMutation = useUpdateRmqc();
  const passMutation = usePassRmqc();
  const failMutation = useFailRmqc();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (inspection) {
      form.setFieldsValue({
        description: inspection.description,
        inspector_name: inspection.inspectorName,
      });
    }
  }, [inspection, form]);

  if (isLoading) return <div>Loading...</div>;
  if (!inspection) return <div>Inspection not found</div>;

  const handlePass = () => {
    Modal.confirm({
      title: "Confirm Pass",
      content: "Are you sure you want to pass this inspection? This will update the GRN status.",
      okText: "Pass",
      okType: "primary",
      onOk: () => passMutation.mutate(id),
    });
  };

  const handleFail = () => {
    Modal.confirm({
      title: "Confirm Fail",
      content: "Are you sure you want to fail this inspection? This will flag the GRN and Batch as rejected.",
      okText: "Fail",
      okType: "danger",
      onOk: () => failMutation.mutate(id),
    });
  };

  const handleUpdate = (values: any) => {
    updateMutation.mutate(
      { id, data: values },
      {
        onSuccess: () => {
            setIsEditModalOpen(false);
        }
      }
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()} style={{ marginBottom: 16 }}>
        Back to List
      </Button>

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card
          title={
            <Space>
              <Title level={4} style={{ margin: 0 }}>Inspection Details</Title>
              <Tag color={inspection.status === 'Passed' ? 'green' : inspection.status === 'Failed' ? 'red' : 'orange'}>
                {inspection.status}
              </Tag>
            </Space>
          }
          extra={
            inspection.status === 'Pending' && (
              <Space>
                <Button icon={<EditOutlined />} onClick={() => setIsEditModalOpen(true)}>
                  Edit Details
                </Button>
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={handlePass} style={{ backgroundColor: '#52c41a' }}>
                  Pass
                </Button>
                <Button type="primary" danger icon={<CloseCircleOutlined />} onClick={handleFail}>
                  Fail
                </Button>
              </Space>
            )
          }
        >
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Inspection ID">{inspection.id}</Descriptions.Item>
            <Descriptions.Item label="Date">{dayjs(inspection.inspectionDate).format("YYYY-MM-DD HH:mm")}</Descriptions.Item>
            <Descriptions.Item label="Inspector">{inspection.inspectorName}</Descriptions.Item>
            <Descriptions.Item label="GRN Number">{inspection.goodsReceiptNotes?.grnNumber}</Descriptions.Item>
            <Descriptions.Item label="Batch Number">{inspection.rawMaterialBatches?.batchNumber || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Material">
              {inspection.rawMaterialBatches?.rawMaterialInventory?.rawMaterials?.name || 'N/A'} 
              <Text type="secondary" style={{ marginLeft: 8 }}>
                ({inspection.rawMaterialBatches?.rawMaterialInventory?.rawMaterials?.code})
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>{inspection.description || 'No description provided'}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Attachments & Images">
          {inspection.images && inspection.images.length > 0 ? (
            <Image.PreviewGroup>
              <Space wrap size="large">
                {inspection.images.map((img, idx) => (
                  <Image key={idx} width={200} src={img} alt={`Inspection Image ${idx + 1}`} />
                ))}
              </Space>
            </Image.PreviewGroup>
          ) : (
            <Text type="secondary">No images uploaded.</Text>
          )}

          <Divider />

          {inspection.documents && inspection.documents.length > 0 ? (
            <List
              dataSource={inspection.documents}
              renderItem={(doc, idx) => (
                <List.Item>
                  <Button type="link" icon={<FileTextOutlined />} href={doc} target="_blank">
                    Document {idx + 1}
                  </Button>
                </List.Item>
              )}
            />
          ) : (
             <Text type="secondary">No documents uploaded.</Text>
          )}
        </Card>
      </Space>

      <Modal
        title="Edit Inspection Details"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="inspector_name" label="Inspector Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          {/* Note: File upload logic would go here, updating 'images' array in values */}
          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
               <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
               <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>Save Changes</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
