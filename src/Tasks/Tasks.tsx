import React, { useState, useEffect } from 'react';
import { Button, Space, Form } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getMethods, deleteTask as apiDeleteTask, deleteSubtask as apiDeleteSubtask, getThemeParams } from '../api';
import { fetchInitialData, handleTaskCreation, handleTaskEdit, handleSubtaskCreation, MethodWithParams, ThemeWithParams, TaskWithParams } from './taskUtils';
import TaskList from './TaskList';
import TaskModal from './TaskModal';
import SubtaskModal from './SubtaskModal';
import VariantModal from './VariantModal';
import { useServer } from '../ServerContext';

interface ParamSettings {
  min?: number;
  max?: number;
  complexity?: number;
}

const Tasks: React.FC = () => {
  const { isServerAvailable, setServerAvailable } = useServer();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [themes, setThemes] = useState<ThemeWithParams[]>([]);
  const [methods, setMethods] = useState<MethodWithParams[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<TaskWithParams[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [subtaskParams, setSubtaskParams] = useState<Record<string, any>>({});
  const [numVariants, setNumVariants] = useState<number>(1);
  const [generatedVariants, setGeneratedVariants] = useState<TaskWithParams[]>([]);
  const [selectedParams, setSelectedParams] = useState<Record<string, boolean>>({});
  const [paramSettings, setParamSettings] = useState<Record<string, ParamSettings>>({});
  const [themeParams, setThemeParams] = useState<{ name: string; type: string; id: number }[]>([]);
  const [form] = Form.useForm();

  const isEditable = true;

  useEffect(() => {
    if (isServerAvailable) {
      fetchInitialData(setThemes, setTasks, setMethods, selectedThemeId, setServerAvailable);
    }
  }, [isServerAvailable]);

  useEffect(() => { 
    if (selectedThemeId !== null && isServerAvailable) {
      const fetchMethods = async () => {
        try {
          const methods = await getMethods(selectedThemeId, setServerAvailable);
          setMethods(methods.map((method) => ({ ...method, params: method.params || [] })));
        } catch (error) {
          // Ошибка уже обработана в apiRequest
        }
      };
      fetchMethods();
    } 
  }, [selectedThemeId, isServerAvailable]);

  const showTaskModal = () => isEditable && isServerAvailable && setIsTaskModalOpen(true); 

  const showEditModal = (task: TaskWithParams) => {
    if (!isEditable || !isServerAvailable) return;
    setSelectedTaskId(task.id);
    setSelectedThemeId(task.theme_id);
    form.setFieldsValue({
      name: task.name,
      description: task.description,
      theme_id: task.theme_id,
      ...task.params,
    });
    setIsEditModalOpen(true);
  };

  const handleTaskCancel = () => {
    setIsTaskModalOpen(false);
    setIsEditModalOpen(false);
    form.resetFields();
  };

  const showSubtaskModal = (taskId: number) => {
    if (!isEditable || !isServerAvailable) return;
    setSelectedTaskId(taskId);
    setIsSubtaskModalOpen(true);
  };

  const handleSubtaskCancel = () => {
    setIsSubtaskModalOpen(false);
    setSubtaskParams({});
  };

  const deleteTask = async (taskId: number) => {
    if (!isEditable || !isServerAvailable) return;
    try {
      await apiDeleteTask(taskId, setServerAvailable);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      // Ошибка уже обработана в apiRequest
    }
  };

  const deleteSubtask = async (subtaskId: number) => {
    if (!isEditable || !isServerAvailable) return;
    try {
      await apiDeleteSubtask(subtaskId, setServerAvailable);
      setTasks((prevTasks) =>
        prevTasks.map((task) => ({
          ...task,
          subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId),
        }))
      );
    } catch (error) {
      // Ошибка уже обработана в apiRequest
    }
  };

  const showVariantModal = async (task: TaskWithParams) => {
    if (!isEditable || !isServerAvailable) return;
    setSelectedTaskId(task.id);
    setIsVariantModalOpen(true);
    try {
      const params = await getThemeParams(task.theme_id, setServerAvailable);
      setThemeParams(params);
      const selected: Record<string, boolean> = {};
      const settings: Record<string, ParamSettings> = {};
      params.forEach((param) => {
        selected[`param_${param.id}`] = false;
        if (param.type === 'number') {
          settings[`param_${param.id}`] = { min: 1, max: 10 };
        } else if (param.type === 'latex') {
          settings[`param_${param.id}`] = { complexity: 1 };
        }
      });
      setSelectedParams(selected);
      setParamSettings(settings);
      setGeneratedVariants([]);
    } catch (error) {
      // Ошибка уже обработана в apiRequest
    }
  };

  const handleVariantCancel = () => {
    setIsVariantModalOpen(false);
    setGeneratedVariants([]);
    setSelectedParams({});
    setParamSettings({});
  };

  if (isServerAvailable === null) {
    return <div>Проверка подключения к серверу...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {isServerAvailable && isEditable && (
          <Button type="primary" icon={<PlusOutlined />} onClick={showTaskModal}>
            Добавить задачу
          </Button>
        )}
        {!isServerAvailable && (
          <div style={{ textAlign: 'center', color: 'red' }}>
            Сервер недоступен. Пожалуйста, проверьте подключение.
          </div>
        )}
        <TaskList
          themes={themes}
          tasks={tasks}
          methods={methods}
          isEditable={isEditable && isServerAvailable}
          onEditTask={showEditModal}
          onDeleteTask={deleteTask}
          onGenerateVariants={showVariantModal}
          onAddSubtask={showSubtaskModal}
          onDeleteSubtask={deleteSubtask}
        />
      </Space>

      <TaskModal
        title="Добавить задачу"
        open={isTaskModalOpen}
        onOk={() => handleTaskCreation(form, selectedThemeId, themes, tasks, setTasks, setIsTaskModalOpen, setServerAvailable)}
        onCancel={handleTaskCancel}
        form={form}
        themes={themes}
        selectedThemeId={selectedThemeId}
        setSelectedThemeId={setSelectedThemeId}
      />

      <TaskModal
        title="Редактировать задачу"
        open={isEditModalOpen}
        onOk={() =>
          handleTaskEdit(form, selectedTaskId!, selectedThemeId, themes, tasks, setTasks, setIsEditModalOpen, setServerAvailable)
        }
        onCancel={handleTaskCancel}
        form={form}
        themes={themes}
        selectedThemeId={selectedThemeId}
        setSelectedThemeId={setSelectedThemeId}
      />

      <SubtaskModal
        open={isSubtaskModalOpen}
        onOk={() =>
          handleSubtaskCreation(
            selectedTaskId,
            selectedMethodId,
            methods,
            subtaskParams,
            tasks,
            setTasks,
            setIsSubtaskModalOpen,
            setSubtaskParams,
            setServerAvailable
          )
        }
        onCancel={handleSubtaskCancel}
        methods={methods}
        selectedMethodId={selectedMethodId}
        setSelectedMethodId={setSelectedMethodId}
        subtaskParams={subtaskParams}
        setSubtaskParams={setSubtaskParams}
      />

      <VariantModal
        open={isVariantModalOpen}
        onCancel={handleVariantCancel}
        task={tasks.find((t) => t.id === selectedTaskId) || null}
        methods={methods}
        numVariants={numVariants}
        setNumVariants={setNumVariants}
        generatedVariants={generatedVariants}
        setGeneratedVariants={setGeneratedVariants}
        selectedParams={selectedParams}
        setSelectedParams={setSelectedParams}
        paramSettings={paramSettings}
        setParamSettings={setParamSettings}
        themeParams={themeParams}
        setThemeParams={setThemeParams}
        setServerAvailable={setServerAvailable} // Передаем setServerAvailable
      />
    </div>
  );
};

export default Tasks;