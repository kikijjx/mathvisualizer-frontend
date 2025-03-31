import React from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { ThemeWithParams } from './taskUtils';

const { Option } = Select;

interface TaskModalProps {
  title: string;
  open: boolean;
  onOk: () => void;
  onCancel: () => void;
  form: any;
  themes: ThemeWithParams[];
  selectedThemeId: number | null;
  setSelectedThemeId: (id: number | null) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({
  title,
  open,
  onOk,
  onCancel,
  form,
  themes,
  selectedThemeId,
  setSelectedThemeId,
}) => {
  const renderThemeParamInputs = () => {
    const selectedTheme = themes.find((theme) => theme.id === selectedThemeId);
    if (!selectedTheme) return null;

    return selectedTheme.params.map((param) => (
      <Form.Item key={param.id} label={param.name} name={param.name}>
        <Input type={param.type === 'number' ? 'number' : 'text'} />
      </Form.Item>
    ));
  };

  return (
    <Modal title={title} open={open} onOk={onOk} onCancel={onCancel}>
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Название задачи"
          rules={[{ required: true, message: 'Введите название задачи' }]}
        >
          <Input placeholder="Например, Интеграл sin(x)" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Описание задачи"
          rules={[{ required: true, message: 'Введите описание задачи' }]}
        >
          <Input.TextArea placeholder="Например, Вычислить интеграл" />
        </Form.Item>
        <Form.Item
          name="theme_id"
          label="Тема"
          rules={[{ required: true, message: 'Выберите тему' }]}
        >
          <Select placeholder="Выберите тему" onChange={(value) => setSelectedThemeId(value)}>
            {themes?.map((theme) => (
              <Option key={theme.id} value={theme.id}>
                {theme.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {renderThemeParamInputs()}
      </Form>
    </Modal>
  );
};

export default TaskModal;