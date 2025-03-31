import React, { useState, useEffect } from 'react';
import { Modal, Button, Tabs, Table, Input, Select, Form, message, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getThemes, createTheme, updateTheme, deleteTheme,
  getThemeParams, createThemeParam, updateThemeParam, deleteThemeParam,
  getMethods, createMethod, updateMethod, deleteMethod,
  getMethodParams, createMethodParam, updateMethodParam, deleteMethodParam,
  getTasks, createTask, updateTask, deleteTask,
  getTaskParams, createTaskParam, updateTaskParam, deleteTaskParam,
} from './api';
import { useServer } from './ServerContext';

const { Option } = Select;
const { TabPane } = Tabs;

interface ThemeData {
  id: number;
  name: string;
}

interface ThemeParamData {
  id: number;
  theme_id: number;
  name: string;
  type: string;
  default_value: string | null;
}

interface MethodData {
  id: number;
  name: string;
  description: string;
  theme_id: number;
}

interface MethodParamData {
  id: number;
  name: string;
  type: string;
  default_value: string | null;
}

interface TaskData {
  id: number;
  name: string;
}

interface TaskParamData {
  id: number;
  task_id: number;
  param_name: string;
  param_value: string;
}

interface AdminPanelProps {
  onDataChange: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onDataChange }) => {
  const { isServerAvailable, setServerAvailable } = useServer();
  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [themeParams, setThemeParams] = useState<ThemeParamData[]>([]);
  const [methods, setMethods] = useState<MethodData[]>([]);
  const [methodParams, setMethodParams] = useState<MethodParamData[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [taskParams, setTaskParams] = useState<TaskParamData[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedThemeForMethodParams, setSelectedThemeForMethodParams] = useState<number | null>(null);
  const [methodsForParams, setMethodsForParams] = useState<MethodData[]>([]);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isThemeParamModalOpen, setIsThemeParamModalOpen] = useState(false);
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [isMethodParamModalOpen, setIsMethodParamModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTaskParamModalOpen, setIsTaskParamModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeData | null>(null);
  const [editingThemeParam, setEditingThemeParam] = useState<ThemeParamData | null>(null);
  const [editingMethod, setEditingMethod] = useState<MethodData | null>(null);
  const [editingMethodParam, setEditingMethodParam] = useState<MethodParamData | null>(null);
  const [editingTask, setEditingTask] = useState<TaskData | null>(null);
  const [editingTaskParam, setEditingTaskParam] = useState<TaskParamData | null>(null);
  const [form] = Form.useForm();

  // Загрузка данных только если сервер доступен
  useEffect(() => {
    if (isServerAvailable) {
      fetchThemes();
      fetchTasks();
    } else {
      setThemes([]);
      setTasks([]);
      setThemeParams([]);
      setMethods([]);
      setMethodParams([]);
      setTaskParams([]);
    }
  }, [isServerAvailable]);

  const fetchThemes = async () => {
    try {
      const themesData = await getThemes(setServerAvailable);
      setThemes(Array.isArray(themesData) ? themesData : []);
    } catch (error) {
      console.error('Ошибка при загрузке тем:', error);
      message.error('Ошибка при загрузке тем');
      setThemes([]);
    }
  };

  const fetchTasks = async () => {
    try {
      const tasksData = await getTasks(setServerAvailable);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      console.error('Ошибка при загрузке задач:', error);
      message.error('Ошибка при загрузке задач');
      setTasks([]);
    }
  };

  const fetchThemeParams = async (themeId: number | null) => {
    if (themeId === null || !isServerAvailable) {
      setThemeParams([]);
      return;
    }
    try {
      const params = await getThemeParams(themeId, setServerAvailable);
      setThemeParams(Array.isArray(params) ? params : []);
    } catch (error) {
      console.error('Ошибка при загрузке параметров темы:', error);
      message.error('Ошибка при загрузке параметров темы');
      setThemeParams([]);
    }
  };

  const fetchMethods = async (themeId: number | null) => {
    if (themeId === null || !isServerAvailable) {
      setMethods([]);
      return;
    }
    try {
      const methodsData = await getMethods(themeId, setServerAvailable);
      setMethods(Array.isArray(methodsData) ? methodsData : []);
    } catch (error) {
      console.error('Ошибка при загрузке методов:', error);
      message.error('Ошибка при загрузке методов');
      setMethods([]);
    }
  };

  const fetchMethodsForParams = async (themeId: number | null) => {
    if (themeId === null || !isServerAvailable) {
      setMethodsForParams([]);
      setMethodParams([]);
      setSelectedMethodId(null);
      return;
    }
    try {
      const methodsData = await getMethods(themeId, setServerAvailable);
      setMethodsForParams(Array.isArray(methodsData) ? methodsData : []);
      setMethodParams([]);
      setSelectedMethodId(null);
    } catch (error) {
      console.error('Ошибка при загрузке методов для параметров:', error);
      message.error('Ошибка при загрузке методов для параметров');
      setMethodsForParams([]);
    }
  };

  const fetchMethodParams = async (methodId: number | null) => {
    if (methodId === null || !isServerAvailable) {
      setMethodParams([]);
      return;
    }
    try {
      const params = await getMethodParams(methodId, setServerAvailable);
      console.log('Fetched method params:', params);
      setMethodParams(Array.isArray(params) ? params : []);
    } catch (error) {
      console.error('Ошибка при загрузке параметров метода:', error);
      message.error('Ошибка при загрузке параметров метода');
      setMethodParams([]);
    }
  };

  const fetchTaskParams = async (taskId: number | null) => {
    if (taskId === null || !isServerAvailable) {
      setTaskParams([]);
      return;
    }
    try {
      const params = await getTaskParams(taskId, setServerAvailable);
      setTaskParams(Array.isArray(params) ? params : []);
    } catch (error) {
      console.error('Ошибка при загрузке параметров задачи:', error);
      message.error('Ошибка при загрузке параметров задачи');
      setTaskParams([]);
    }
  };

  const handleThemeSubmit = async (values: any) => {
    if (!isServerAvailable) {
      message.error('Сервер недоступен');
      return;
    }
    try {
      if (editingTheme) {
        await updateTheme(editingTheme.id, values, setServerAvailable);
        setThemes(themes.map((t) => (t.id === editingTheme.id ? { ...t, ...values } : t)));
        message.success('Тема обновлена');
      } else {
        const newTheme = await createTheme(values, setServerAvailable);
        setThemes([...themes, newTheme]);
        message.success('Тема создана');
      }
      setIsThemeModalOpen(false);
      form.resetFields();
      setEditingTheme(null);
      onDataChange();
    } catch (error) {
      console.error('Ошибка при сохранении темы:', error);
      message.error('Ошибка при сохранении темы');
    }
  };

  const handleThemeParamSubmit = async (values: any) => {
    if (!isServerAvailable) {
      message.error('Сервер недоступен');
      return;
    }
    try {
      if (editingThemeParam) {
        await updateThemeParam(editingThemeParam.id, values, setServerAvailable);
        setThemeParams(themeParams.map((p) => (p.id === editingThemeParam.id ? { ...p, ...values } : p)));
        message.success('Параметр темы обновлён');
      } else {
        const newParam = await createThemeParam({ ...values, theme_id: selectedThemeId }, setServerAvailable);
        setThemeParams([...themeParams, newParam]);
        message.success('Параметр темы создан');
      }
      setIsThemeParamModalOpen(false);
      form.resetFields();
      setEditingThemeParam(null);
      fetchThemeParams(selectedThemeId);
      onDataChange();
    } catch (error) {
      console.error('Ошибка при сохранении параметра темы:', error);
      message.error('Ошибка при сохранении параметра темы');
    }
  };

  const handleMethodSubmit = async (values: any) => {
    if (!isServerAvailable) {
      message.error('Сервер недоступен');
      return;
    }
    try {
      if (editingMethod) {
        await updateMethod(editingMethod.id, values, setServerAvailable);
        setMethods(methods.map((m) => (m.id === editingMethod.id ? { ...m, ...values } : m)));
        message.success('Метод обновлён');
      } else {
        const newMethod = await createMethod({ ...values, theme_id: selectedThemeId }, setServerAvailable);
        setMethods([...methods, newMethod]);
        message.success('Метод создан');
      }
      setIsMethodModalOpen(false);
      form.resetFields();
      setEditingMethod(null);
      fetchMethods(selectedThemeId);
      onDataChange();
    } catch (error) {
      console.error('Ошибка при сохранении метода:', error);
      message.error('Ошибка при сохранении метода');
    }
  };

  const handleMethodParamSubmit = async (values: any) => {
    if (!isServerAvailable) {
      message.error('Сервер недоступен');
      return;
    }
    try {
      if (editingMethodParam) {
        await updateMethodParam(editingMethodParam.id, values, setServerAvailable);
        setMethodParams(methodParams.map((p) => (p.id === editingMethodParam.id ? { ...p, ...values } : p)));
        message.success('Параметр метода обновлён');
      } else {
        const newParam = await createMethodParam(values, selectedMethodId, setServerAvailable);
        setMethodParams([...methodParams, newParam]);
        message.success('Параметр метода создан');
      }
      setIsMethodParamModalOpen(false);
      form.resetFields();
      setEditingMethodParam(null);
      fetchMethodParams(selectedMethodId);
      onDataChange();
    } catch (error) {
      console.error('Ошибка при сохранении параметра метода:', error);
      message.error('Ошибка при сохранении параметра метода');
    }
  };

  const handleTaskSubmit = async (values: any) => {
    if (!isServerAvailable) {
      message.error('Сервер недоступен');
      return;
    }
    try {
      if (editingTask) {
        await updateTask(editingTask.id, values, setServerAvailable);
        setTasks(tasks.map((t) => (t.id === editingTask.id ? { ...t, ...values } : t)));
        message.success('Задача обновлена');
      } else {
        const newTask = await createTask(values, setServerAvailable);
        setTasks([...tasks, newTask]);
        message.success('Задача создана');
      }
      setIsTaskModalOpen(false);
      form.resetFields();
      setEditingTask(null);
      onDataChange();
    } catch (error) {
      console.error('Ошибка при сохранении задачи:', error);
      message.error('Ошибка при сохранении задачи');
    }
  };

  const handleTaskParamSubmit = async (values: any) => {
    if (!isServerAvailable) {
      message.error('Сервер недоступен');
      return;
    }
    try {
      if (editingTaskParam) {
        await updateTaskParam(editingTaskParam.id, values, setServerAvailable);
        setTaskParams(taskParams.map((p) => (p.id === editingTaskParam.id ? { ...p, ...values } : p)));
        message.success('Параметр задачи обновлён');
      } else {
        const newParam = await createTaskParam(values, setServerAvailable);
        setTaskParams([...taskParams, newParam]);
        message.success('Параметр задачи создан');
      }
      setIsTaskParamModalOpen(false);
      form.resetFields();
      setEditingTaskParam(null);
      fetchTaskParams(selectedTaskId);
      onDataChange();
    } catch (error) {
      console.error('Ошибка при сохранении параметра задачи:', error);
      message.error('Ошибка при сохранении параметра задачи');
    }
  };

  const columnsThemes = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Название', dataIndex: 'name', key: 'name' },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: ThemeData) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingTheme(record);
              form.setFieldsValue(record);
              setIsThemeModalOpen(true);
            }}
            disabled={!isServerAvailable}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={async () => {
              if (!isServerAvailable) {
                message.error('Сервер недоступен');
                return;
              }
              try {
                await deleteTheme(record.id, setServerAvailable);
                setThemes(themes.filter((t) => t.id !== record.id));
                message.success('Тема удалена');
                onDataChange();
              } catch (error) {
                message.error('Ошибка при удалении темы');
              }
            }}
          />
        </Space>
      ),
    },
  ];

  const columnsThemeParams = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'Тип', dataIndex: 'type', key: 'type' },
    { title: 'Значение по умолчанию', dataIndex: 'default_value', key: 'default_value' },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: ThemeParamData) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingThemeParam(record);
              form.setFieldsValue(record);
              setIsThemeParamModalOpen(true);
            }}
            disabled={!isServerAvailable}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={async () => {
              if (!isServerAvailable) {
                message.error('Сервер недоступен');
                return;
              }
              try {
                await deleteThemeParam(record.id, setServerAvailable);
                setThemeParams(themeParams.filter((p) => p.id !== record.id));
                message.success('Параметр удалён');
                onDataChange();
              } catch (error) {
                message.error('Ошибка при удалении параметра');
              }
            }}
          />
        </Space>
      ),
    },
  ];

  const columnsMethods = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'Описание', dataIndex: 'description', key: 'description' },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: MethodData) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingMethod(record);
              form.setFieldsValue(record);
              setIsMethodModalOpen(true);
            }}
            disabled={!isServerAvailable}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={async () => {
              if (!isServerAvailable) {
                message.error('Сервер недоступен');
                return;
              }
              try {
                await deleteMethod(record.id, setServerAvailable);
                setMethods(methods.filter((m) => m.id !== record.id));
                message.success('Метод удалён');
                onDataChange();
              } catch (error) {
                message.error('Ошибка при удалении метода');
              }
            }}
          />
        </Space>
      ),
    },
  ];

  const columnsMethodParams = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Название', dataIndex: 'name', key: 'name' },
    { title: 'Тип', dataIndex: 'type', key: 'type' },
    { title: 'Значение по умолчанию', dataIndex: 'default_value', key: 'default_value' },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: MethodParamData) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingMethodParam(record);
              form.setFieldsValue(record);
              setIsMethodParamModalOpen(true);
            }}
            disabled={!isServerAvailable}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={async () => {
              if (!isServerAvailable) {
                message.error('Сервер недоступен');
                return;
              }
              try {
                await deleteMethodParam(record.id, setServerAvailable);
                setMethodParams(methodParams.filter((p) => p.id !== record.id));
                message.success('Параметр удалён');
                onDataChange();
              } catch (error) {
                message.error('Ошибка при удалении параметра');
              }
            }}
          />
        </Space>
      ),
    },
  ];

  const columnsTasks = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Название', dataIndex: 'name', key: 'name' },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: TaskData) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingTask(record);
              form.setFieldsValue(record);
              setIsTaskModalOpen(true);
            }}
            disabled={!isServerAvailable}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={async () => {
              if (!isServerAvailable) {
                message.error('Сервер недоступен');
                return;
              }
              try {
                await deleteTask(record.id, setServerAvailable);
                setTasks(tasks.filter((t) => t.id !== record.id));
                message.success('Задача удалена');
                onDataChange();
              } catch (error) {
                message.error('Ошибка при удалении задачи');
              }
            }}
          />
        </Space>
      ),
    },
  ];

  const columnsTaskParams = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Название параметра', dataIndex: 'param_name', key: 'param_name' },
    { title: 'Значение', dataIndex: 'param_value', key: 'param_value' },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: TaskParamData) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingTaskParam(record);
              form.setFieldsValue(record);
              setIsTaskParamModalOpen(true);
            }}
            disabled={!isServerAvailable}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={async () => {
              if (!isServerAvailable) {
                message.error('Сервер недоступен');
                return;
              }
              try {
                await deleteTaskParam(record.id, setServerAvailable);
                setTaskParams(taskParams.filter((p) => p.id !== record.id));
                message.success('Параметр удалён');
                onDataChange();
              } catch (error) {
                message.error('Ошибка при удалении параметра');
              }
            }}
          />
        </Space>
      ),
    },
  ];

  if (isServerAvailable === null) {
    return <div>Проверка подключения к серверу...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      {!isServerAvailable && (
        <div style={{ textAlign: 'center', color: 'red', marginBottom: '16px' }}>
          Сервер недоступен. Операции редактирования недоступны.
        </div>
      )}
      <Tabs defaultActiveKey="1">
        <TabPane tab="Темы" key="1">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsThemeModalOpen(true)}
            disabled={!isServerAvailable}
          >
            Добавить тему
          </Button>
          <Table dataSource={themes} columns={columnsThemes} rowKey="id" style={{ marginTop: 16 }} />
        </TabPane>

        <TabPane tab="Параметры темы" key="2">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Select
              style={{ width: 200 }}
              placeholder="Выберите тему"
              value={selectedThemeId}
              onChange={(value) => {
                setSelectedThemeId(value);
                fetchThemeParams(value);
              }}
              allowClear
              disabled={!isServerAvailable}
            >
              {themes.map((theme) => (
                <Option key={theme.id} value={theme.id}>{theme.name}</Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsThemeParamModalOpen(true)}
              disabled={!selectedThemeId || !isServerAvailable}
            >
              Добавить параметр
            </Button>
            <Table dataSource={themeParams} columns={columnsThemeParams} rowKey="id" />
          </Space>
        </TabPane>

        <TabPane tab="Методы" key="3">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Select
              style={{ width: 200 }}
              placeholder="Выберите тему"
              value={selectedThemeId}
              onChange={(value) => {
                setSelectedThemeId(value);
                fetchMethods(value);
              }}
              allowClear
              disabled={!isServerAvailable}
            >
              {themes.map((theme) => (
                <Option key={theme.id} value={theme.id}>{theme.name}</Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsMethodModalOpen(true)}
              disabled={!selectedThemeId || !isServerAvailable}
            >
              Добавить метод
            </Button>
            <Table dataSource={methods} columns={columnsMethods} rowKey="id" />
          </Space>
        </TabPane>

        <TabPane tab="Параметры методов" key="4">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Select
              style={{ width: 200 }}
              placeholder="Выберите тему"
              value={selectedThemeForMethodParams}
              onChange={(value) => {
                setSelectedThemeForMethodParams(value);
                fetchMethodsForParams(value);
              }}
              allowClear
              disabled={!isServerAvailable}
            >
              {themes.map((theme) => (
                <Option key={theme.id} value={theme.id}>{theme.name}</Option>
              ))}
            </Select>
            <Select
              style={{ width: 200 }}
              placeholder="Выберите метод"
              value={selectedMethodId}
              onChange={(value) => {
                setSelectedMethodId(value);
                fetchMethodParams(value);
              }}
              disabled={!selectedThemeForMethodParams || !isServerAvailable}
              allowClear
            >
              {methodsForParams.map((method) => (
                <Option key={method.id} value={method.id}>{method.name}</Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsMethodParamModalOpen(true)}
              disabled={!selectedMethodId || !isServerAvailable}
            >
              Добавить параметр
            </Button>
            <Table dataSource={methodParams} columns={columnsMethodParams} rowKey="id" />
          </Space>
        </TabPane>

        <TabPane tab="Задачи" key="5">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsTaskModalOpen(true)}
            disabled={!isServerAvailable}
          >
            Добавить задачу
          </Button>
          <Table dataSource={tasks} columns={columnsTasks} rowKey="id" style={{ marginTop: 16 }} />
        </TabPane>

        <TabPane tab="Параметры задач" key="6">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Select
              style={{ width: 200 }}
              placeholder="Выберите задачу"
              value={selectedTaskId}
              onChange={(value) => {
                setSelectedTaskId(value);
                fetchTaskParams(value);
              }}
              allowClear
              disabled={!isServerAvailable}
            >
              {tasks.map((task) => (
                <Option key={task.id} value={task.id}>{task.name}</Option>
              ))}
            </Select>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsTaskParamModalOpen(true)}
              disabled={!selectedTaskId || !isServerAvailable}
            >
              Добавить параметр
            </Button>
            <Table dataSource={taskParams} columns={columnsTaskParams} rowKey="id" />
          </Space>
        </TabPane>
      </Tabs>

      <Modal
        title={editingTheme ? 'Редактировать тему' : 'Добавить тему'}
        open={isThemeModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsThemeModalOpen(false);
          setEditingTheme(null);
          form.resetFields();
        }}
        okButtonProps={{ disabled: !isServerAvailable }}
      >
        <Form form={form} onFinish={handleThemeSubmit} layout="vertical">
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingThemeParam ? 'Редактировать параметр' : 'Добавить параметр'}
        open={isThemeParamModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsThemeParamModalOpen(false);
          setEditingThemeParam(null);
          form.resetFields();
        }}
        okButtonProps={{ disabled: !isServerAvailable }}
      >
        <Form form={form} onFinish={handleThemeParamSubmit} layout="vertical">
          <Form.Item name="theme_id" label="Тема" rules={[{ required: true }]} initialValue={selectedThemeId}>
            <Select disabled>
              {themes.map((theme) => (
                <Option key={theme.id} value={theme.id}>{theme.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Тип" rules={[{ required: true }]}>
            <Select>
              <Option value="number">Число</Option>
              <Option value="text">Текст</Option>
              <Option value="latex">LaTeX</Option>
            </Select>
          </Form.Item>
          <Form.Item name="default_value" label="Значение по умолчанию">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingMethod ? 'Редактировать метод' : 'Добавить метод'}
        open={isMethodModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsMethodModalOpen(false);
          setEditingMethod(null);
          form.resetFields();
        }}
        okButtonProps={{ disabled: !isServerAvailable }}
      >
        <Form form={form} onFinish={handleMethodSubmit} layout="vertical">
          <Form.Item name="theme_id" label="Тема" rules={[{ required: true }]} initialValue={selectedThemeId}>
            <Select disabled>
              {themes.map((theme) => (
                <Option key={theme.id} value={theme.id}>{theme.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Описание" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingMethodParam ? 'Редактировать параметр' : 'Добавить параметр'}
        open={isMethodParamModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsMethodParamModalOpen(false);
          setEditingMethodParam(null);
          form.resetFields();
        }}
        okButtonProps={{ disabled: !isServerAvailable }}
      >
        <Form form={form} onFinish={handleMethodParamSubmit} layout="vertical">
          <Form.Item name="method_id" label="Метод" rules={[{ required: true }]} initialValue={selectedMethodId}>
            <Select disabled>
              {methodsForParams.map((method) => (
                <Option key={method.id} value={method.id}>{method.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Тип" rules={[{ required: true }]}>
            <Select>
              <Option value="number">Число</Option>
              <Option value="text">Текст</Option>
              <Option value="latex">LaTeX</Option>
            </Select>
          </Form.Item>
          <Form.Item name="default_value" label="Значение по умолчанию">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingTask ? 'Редактировать задачу' : 'Добавить задачу'}
        open={isTaskModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
          form.resetFields();
        }}
        okButtonProps={{ disabled: !isServerAvailable }}
      >
        <Form form={form} onFinish={handleTaskSubmit} layout="vertical">
          <Form.Item name="name" label="Название" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingTaskParam ? 'Редактировать параметр' : 'Добавить параметр'}
        open={isTaskParamModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsTaskParamModalOpen(false);
          setEditingTaskParam(null);
          form.resetFields();
        }}
        okButtonProps={{ disabled: !isServerAvailable }}
      >
        <Form form={form} onFinish={handleTaskParamSubmit} layout="vertical">
          <Form.Item name="task_id" label="Задача" rules={[{ required: true }]} initialValue={selectedTaskId}>
            <Select disabled>
              {tasks.map((task) => (
                <Option key={task.id} value={task.id}>{task.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="param_name" label="Название параметра" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="param_value" label="Значение" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPanel;