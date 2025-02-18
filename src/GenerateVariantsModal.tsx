import React from 'react';
import { Modal, Form, InputNumber, Checkbox } from 'antd';

interface GenerateVariantsModalProps {
  visible: boolean;
  onCancel: () => void;
  onGenerate: (count: number, params: string[]) => void;
}

const GenerateVariantsModal: React.FC<GenerateVariantsModalProps> = ({
  visible,
  onCancel,
  onGenerate,
}) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      onGenerate(values.variantCount, values.selectedParams);
      form.resetFields();
    });
  };

  return (
    <Modal
      title="Генерация вариантов"
      visible={visible}
      onOk={handleOk}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="variantCount"
          label="Количество вариантов"
          rules={[{ required: true, message: 'Введите количество вариантов' }]}
        >
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item
          name="selectedParams"
          label="Параметры для изменения"
          rules={[{ required: true, message: 'Выберите параметры' }]}
        >
          <Checkbox.Group>
            <Checkbox value="integral">Интеграл</Checkbox>
            <Checkbox value="n">Количество разбиений</Checkbox>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GenerateVariantsModal;