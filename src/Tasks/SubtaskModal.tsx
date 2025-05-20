import React from 'react';
import { Modal, Select, Form, Input } from 'antd';
import { MethodWithParams } from './taskUtils';

const { Option } = Select;

interface SubtaskModalProps {
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
  methods: MethodWithParams[];
  selectedMethodId: number | null;
  setSelectedMethodId: (id: number | null) => void;
  subtaskParams: Record<string, any>;
  setSubtaskParams: (params: Record<string, any>) => void;
}

const SubtaskModal: React.FC<SubtaskModalProps> = ({
  open,
  onOk,
  onCancel,
  methods,
  selectedMethodId,
  setSelectedMethodId,
  subtaskParams,
  setSubtaskParams,
}) => {
  const handleMethodChange = (methodId: number) => {
    setSelectedMethodId(methodId);
    setSubtaskParams({});
  };

  const handleParamChange = (paramName: string, value: any) => {
    setSubtaskParams((prevParams: any) => ({
      ...prevParams,
      [paramName]: value === '' ? undefined : value,
    }));
  };

  const renderParamInputs = () => {
    const method = methods.find((m) => m.id === selectedMethodId);
    if (!method || !method.params) return null;

    return method.params.map((param) => (
      <Form.Item key={param.id} label={param.name}>
        <Input
          type={param.type === 'number' ? 'number' : 'text'}
          value={subtaskParams[param.name]}
          onChange={(e) => handleParamChange(param.name, e.target.value)}
        />
      </Form.Item>
    ));
  };

  return (
    <Modal title="Добавить метод" open={open} onOk={onOk} onCancel={onCancel}>
      <Select
        placeholder="Выберите метод"
        style={{ width: '100%', marginBottom: '12px' }}
        onChange={handleMethodChange}
      >
        {methods?.length > 0 ? (
          methods.map((method) => (
            <Option key={method.id} value={method.id}>
              {method.description}
            </Option>
          ))
        ) : (
          <Option disabled value="no-methods">
            Методы не найдены
          </Option>
        )}
      </Select>
      {renderParamInputs()}
    </Modal>
  );
};

export default SubtaskModal;