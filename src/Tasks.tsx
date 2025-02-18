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
} from './api';

const { Option } = Select;
const { Text } = Typography;

interface MethodParam {
  id: number;
  method_id: number;
  name: string;
  type: string; // 'number', 'string', etc.
  default_value: string;
}

interface MethodWithParams extends Method {
  params: MethodParam[];
}

const Tasks: React.FC = () => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [methods, setMethods] = useState<MethodWithParams[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [subtaskParams, setSubtaskParams] = useState<Record<string, any>>({});
  const [form] = Form.useForm();

  // Загрузить темы и задачи при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        const themes = await getThemes();
        setThemes(themes || []);

        const tasks = await getTasks();
        setTasks(tasks || []);

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
      const selectedTheme = themes.find((theme) => theme.id === selectedThemeId);

      // Формируем описание задачи
      let description = values.description || '';
      if (selectedTheme?.name === 'Интегрирование') {
        description = `Найти определенный интеграл \\( \\int_{${values.a}}^{${values.b}} ${values.integral} \\, dx \\)`;
      }

      const newTask = await createTask({
        name: values.name,
        description,
        theme_id: selectedThemeId!,
        subtasks: [],
        ...(selectedTheme?.name === 'Интегрирование' && {
          integral: values.integral,
          a: values.a,
          b: values.b,
        }),
      });
      setTasks([...tasks, newTask]);
      setIsTaskModalOpen(false);
      form.resetFields();
      message.success('Задача успешно создана');
    } catch (error) {
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

        // Применяем значения по умолчанию, если параметры не были изменены
        const finalParams = method.params.reduce((acc, param) => {
          // Если параметр не был изменен, используем значение по умолчанию
          if (params[param.name] === undefined || params[param.name] === '') {
            acc[param.name] = param.default_value;
          } else {
            acc[param.name] = params[param.name];
          }
          return acc;
        }, {} as Record<string, any>);

        const newSubtask = await createSubtask({
          task_id: selectedTaskId,
          method_id: methodId,
          params: finalParams, // Используем finalParams с примененными значениями по умолчанию
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
        setSubtaskParams({}); // Сбросим параметры после успешного добавления

        // Выводим уведомление
        message.success('Подзадача успешно добавлена');
      } catch (error) {
        message.error('Ошибка при добавлении подзадачи');
      }
    }
  };

  // Закрыть модальное окно для добавления подзадачи
  const handleSubtaskCancel = () => {
    setIsSubtaskModalOpen(false);
    setSubtaskParams({}); // Сбросим параметры при закрытии
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
    // Сбросим параметры при изменении метода
    setSubtaskParams({});
  };

  // Обработчик изменения параметров
  const handleParamChange = (paramName: string, value: any) => {
    setSubtaskParams((prevParams) => ({
      ...prevParams,
      [paramName]: value === '' ? undefined : value, // Сохраняем undefined для пустых значений
    }));
  };

  // Рендер полей для параметров в зависимости от выбранного метода
  const renderParamInputs = () => {
    const method = methods.find((m) => m.id === selectedMethodId);
    if (!method || !method.params) return null;

    return method.params.map((param) => (
      <Form.Item key={param.id} label={param.name}>
        <Input
          type={param.type === 'number' ? 'number' : 'text'}
          value={subtaskParams[param.name] ?? param.default_value} // Используем ?? вместо ||
          onChange={(e) => handleParamChange(param.name, e.target.value)}
        />
      </Form.Item>
    ));
  };

  // Форматирование параметров подзадачи
  const formatParams = (params: Record<string, any>) => {
    return Object.entries(params)
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
          {selectedThemeId && themes.find((theme) => theme.id === selectedThemeId)?.name === 'Интегрирование' && (
            <>
              <Form.Item
                name="integral"
                label="Интеграл"
                rules={[{ required: true, message: 'Введите интеграл' }]}
              >
                <Input placeholder="Например, sin(x)" />
              </Form.Item>
              <Form.Item
                name="a"
                label="Нижний предел (a)"
                rules={[{ required: true, message: 'Введите a' }]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item
                name="b"
                label="Верхний предел (b)"
                rules={[{ required: true, message: 'Введите b' }]}
              >
                <Input type="number" />
              </Form.Item>
            </>
          )}
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
                {method.description} {/* Используем описание метода */}
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