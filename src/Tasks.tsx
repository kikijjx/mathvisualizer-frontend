import React, { useState, useEffect } from 'react';
import { Button, Modal, Input, Select, Form, Typography, Divider, Tabs, message } from 'antd';
import { MathJax } from 'better-react-mathjax';
import {
  getThemes,
  getMethods,
  createTask,
  createSubtask,
  getTasks,
  Theme,
  Method,
  Task,
  deleteTask as apiDeleteTask,
  deleteSubtask as apiDeleteSubtask,
  getThemeParams,
  createTaskParam,
  getTaskParams,
} from './api';
import VariantGenerator from './VariantGenerator';

const { Option } = Select;
const { Text } = Typography;

interface ThemeParam {
  id: number;
  theme_id: number;
  name: string;
  type: string; // 'number', 'string', 'latex', etc.
}

interface MethodParam {
  id: number;
  method_id: number;
  name: string;
  type: string; // 'number', 'string', 'latex', etc.
}

interface MethodWithParams extends Method {
  params: MethodParam[];
}

interface ThemeWithParams extends Theme {
  params: ThemeParam[];
}

interface TaskWithParams extends Task {
  params: Record<string, any>;
}

const Tasks: React.FC = () => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [themes, setThemes] = useState<ThemeWithParams[]>([]);
  const [methods, setMethods] = useState<MethodWithParams[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<TaskWithParams[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [subtaskParams, setSubtaskParams] = useState<Record<string, any>>({});
  const [form] = Form.useForm();

  // Загрузить темы и задачи при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        const themes = await getThemes();
        const themesWithParams = await Promise.all(
          themes.map(async (theme) => {
            const params = await getThemeParams(theme.id);
            return { ...theme, params };
          })
        );
        setThemes(themesWithParams);

        const tasks = await getTasks();
        const tasksWithParams = await Promise.all(
          tasks.map(async (task) => {
            const params = await getTaskParams(task.id);
            return {
              ...task,
              params: params.reduce((acc, param) => {
                acc[param.param_name] = param.param_value;
                return acc;
              }, {}),
            };
          })
        );
        setTasks(tasksWithParams);

        // Загружаем методы для всех задач
        const methods = await getMethods(selectedThemeId || 1); // Используем selectedThemeId или тему по умолчанию
        setMethods(methods || []);
      } catch (error) {
        message.error('Ошибка при загрузке данных');
      }
    };
    fetchData();
  }, []);

  // Загрузить методы для выбранной темы
  useEffect(() => {
    if (selectedThemeId !== null) {
      const fetchMethods = async () => {
        try {
          const methods = await getMethods(selectedThemeId);
          setMethods(methods || []);
        } catch (error) {
          message.error('Ошибка при загрузке методов');
        }
      };
      fetchMethods();
    }
  }, [selectedThemeId]);

  // Открыть модальное окно для добавления задачи
  const showTaskModal = () => {
    setIsTaskModalOpen(true);
  };

  // Сохранить задачу
  const handleTaskOk = async () => {
    try {
      const values = await form.validateFields();
      console.log('Form values:', values); // Логируем значения формы

      const selectedTheme = themes.find((theme) => theme.id === selectedThemeId);

      const newTask = await createTask({
        name: values.name,
        description: values.description,
        theme_id: selectedThemeId!,
      });

      // Сохраняем параметры задачи
      if (selectedTheme) {
        await Promise.all(
          selectedTheme.params.map(async (param) => {
            const paramValue = values[param.name];
            console.log(`Param: ${param.name}, Value: ${paramValue}`); // Логируем параметры

            if (paramValue !== null && paramValue !== undefined) {
              await createTaskParam({
                task_id: newTask.id,
                param_name: param.name,
                param_value: paramValue,
              });
            }
          })
        );
      }

      // Обновляем список задач
      const updatedTasks = [...tasks, { ...newTask, params: values }];
      setTasks(updatedTasks);

      setIsTaskModalOpen(false);
      form.resetFields();
      message.success('Задача успешно создана');
    } catch (error) {
      console.error('Ошибка при создании задачи:', error); // Логируем ошибку
      message.error('Ошибка при создании задачи');
    }
  };

  // Закрыть модальное окно для добавления задачи
  const handleTaskCancel = () => {
    setIsTaskModalOpen(false);
    form.resetFields();
  };

  // Открыть модальное окно для добавления подзадачи
  const showSubtaskModal = async (taskId: number) => {
    setSelectedTaskId(taskId);
    setIsSubtaskModalOpen(true);

    // Загружаем методы при открытии модального окна
    try {
      const methods = await getMethods(selectedThemeId!);
      setMethods(methods || []);
    } catch (error) {
      message.error('Ошибка при загрузке методов');
    }
  };

  // Сохранить подзадачу
  const handleSubtaskOk = async (methodId: number, params: Record<string, any>) => {
    if (selectedTaskId !== null) {
      try {
        const method = methods.find((m) => m.id === methodId);
        if (!method) {
          message.error('Метод не найден');
          return;
        }

        // Применяем только те параметры, которые были введены пользователем
        const finalParams = method.params.reduce((acc, param) => {
          if (params[param.name] !== undefined && params[param.name] !== '') {
            acc[param.name] = params[param.name];
          }
          return acc;
        }, {} as Record<string, any>);

        const newSubtask = await createSubtask({
          task_id: selectedTaskId,
          method_id: methodId,
          params: finalParams,
        });

        // Обновляем задачу, чтобы загрузить подзадачи
        const updatedTasks = tasks.map((task) =>
          task.id === selectedTaskId
            ? { ...task, subtasks: [...task.subtasks, newSubtask] }
            : task
        );
        setTasks(updatedTasks);

        // Закрываем модальное окно
        setIsSubtaskModalOpen(false);
        setSubtaskParams({});

        message.success('Подзадача успешно добавлена');
      } catch (error) {
        message.error('Ошибка при добавлении подзадачи');
      }
    }
  };

  // Закрыть модальное окно для добавления подзадачи
  const handleSubtaskCancel = () => {
    setIsSubtaskModalOpen(false);
    setSubtaskParams({});
  };

  // Удалить задачу
  const deleteTask = async (taskId: number) => {
    try {
      await apiDeleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      message.success('Задача успешно удалена');
    } catch (error) {
      message.error('Ошибка при удалении задачи');
    }
  };

  // Удалить подзадачу
  const deleteSubtask = async (subtaskId: number) => {
    try {
      await apiDeleteSubtask(subtaskId);
      setTasks((prevTasks) =>
        prevTasks.map((task) => ({
          ...task,
          subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
        }))
      );
      message.success('Подзадача успешно удалена');
    } catch (error) {
      message.error('Ошибка при удалении подзадачи');
    }
  };

  // Обработчик изменения метода
  const handleMethodChange = (methodId: number) => {
    setSelectedMethodId(methodId);
    setSubtaskParams({});
  };

  // Обработчик изменения параметров
  const handleParamChange = (paramName: string, value: any) => {
    setSubtaskParams((prevParams) => ({
      ...prevParams,
      [paramName]: value === '' ? undefined : value,
    }));
  };

  // Рендер полей для параметров темы
  const renderThemeParamInputs = () => {
    const selectedTheme = themes.find((theme) => theme.id === selectedThemeId);
    if (!selectedTheme) return null;

    return selectedTheme.params.map((param) => (
      <Form.Item key={param.id} label={param.name} name={param.name}>
        <Input
          type={param.type === 'number' ? 'number' : 'text'}
          onChange={(e) => form.setFieldsValue({ [param.name]: e.target.value })}
        />
      </Form.Item>
    ));
  };

  // Рендер полей для параметров подзадачи
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

  // Форматирование параметров задачи
  const renderTaskParams = (params: Record<string, any>) => {
    // Сортируем параметры: сначала latex, потом number, внутри категорий по алфавиту
    const sortedParams = Object.entries(params).sort(([keyA], [keyB]) => {
      const paramA = themes
        .flatMap((theme) => theme.params)
        .find((p) => p.name === keyA);
      const paramB = themes
        .flatMap((theme) => theme.params)
        .find((p) => p.name === keyB);

      if (paramA?.type === 'latex' && paramB?.type !== 'latex') return -1;
      if (paramA?.type !== 'latex' && paramB?.type === 'latex') return 1;
      return keyA.localeCompare(keyB);
    });

    return sortedParams.map(([key, value]) => {
      const param = themes
        .flatMap((theme) => theme.params)
        .find((p) => p.name === key);

      if (!param || value === null || value === undefined) return null; // Пропускаем пустые значения

      switch (param.type) {
        case 'latex':
          return (
            <div key={key}>
              <MathJax>{`\\( ${value} \\)`}</MathJax>
            </div>
          );
        case 'number':
        case 'text':
        default:
          return (
            <div key={key}>
              <Text>{`${key} = ${value}`}</Text>
            </div>
          );
      }
    });
  };

  // Форматирование параметров подзадачи
  const formatParams = (params: Record<string, any>) => {
    // Сортируем параметры: сначала latex, потом number, внутри категорий по алфавиту
    const sortedParams = Object.entries(params).sort(([keyA], [keyB]) => {
      const paramA = methods
        .flatMap((method) => method.params)
        .find((p) => p.name === keyA);
      const paramB = methods
        .flatMap((method) => method.params)
        .find((p) => p.name === keyB);

      if (paramA?.type === 'latex' && paramB?.type !== 'latex') return -1;
      if (paramA?.type !== 'latex' && paramB?.type === 'latex') return 1;
      return keyA.localeCompare(keyB);
    });

    return sortedParams
      .map(([key, value]) => `${key} = ${value}`)
      .join(', ');
  };

  // Формируем данные для вкладок
  const taskItems = tasks?.map((task) => ({
    key: task.id.toString(),
    label: task.name,
    children: (
      <div>
        <MathJax>{task.description}</MathJax>
        {task.params && renderTaskParams(task.params)}
        {task.subtasks?.map((subtask, index) => {
          const method = methods.find((m) => m.id === subtask.method_id);
          return (
            <div key={index} style={{ marginTop: '12px' }}>
              <Text>
                {index + 1}) {method ? method.description : 'Метод не найден'}{' '}
                {subtask.params && `(${formatParams(subtask.params)})`}
                <Button
                  type="link"
                  danger
                  onClick={() => deleteSubtask(subtask.id)}
                >
                  Удалить
                </Button>
              </Text>
            </div>
          );
        })}
        <Divider />
        <Button type="dashed" onClick={() => showSubtaskModal(task.id)}>
          Добавить подзадачу
        </Button>
        <Button
          type="link"
          danger
          onClick={() => deleteTask(task.id)}
          style={{ marginLeft: '10px' }}
        >
          Удалить задачу
        </Button>
        <VariantGenerator task={task} methods={methods} />
      </div>
    ),
  })) || [];

  return (
    <div>
      {/* Кнопка для добавления задачи */}
      <Button type="primary" onClick={showTaskModal}>
        Добавить задачу
      </Button>

      {/* Модальное окно для добавления задачи */}
      <Modal
        title="Добавить задачу"
        open={isTaskModalOpen}
        onOk={handleTaskOk}
        onCancel={handleTaskCancel}
      >
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
            <Select
              placeholder="Выберите тему"
              onChange={(value) => setSelectedThemeId(value)}
            >
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

      {/* Модальное окно для добавления подзадачи */}
      <Modal
        title="Добавить подзадачу"
        open={isSubtaskModalOpen}
        onCancel={handleSubtaskCancel}
        onOk={() => {
          if (selectedMethodId !== null) {
            const method = methods.find((m) => m.id === selectedMethodId);
            if (method) {
              handleSubtaskOk(method.id, subtaskParams);
            }
          } else {
            message.error('Выберите метод');
          }
        }}
      >
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

      {/* Список задач */}
      <Tabs tabPosition="left" items={taskItems} style={{ marginTop: '24px' }} />
    </div>
  );
};

export default Tasks;