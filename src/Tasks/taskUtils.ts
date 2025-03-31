import { message } from 'antd';
import {
  getThemes,
  getMethods,
  createTask,
  createSubtask,
  getTasks,
  getThemeParams,
  createTaskParam,
  getTaskParams,
  updateTask,
  Method,
  Theme,
  Task,
  Subtask,
  MethodParam,
  ThemeParam,
  TaskParam,
} from '../api';

export interface MethodWithParams extends Method {
  params: MethodParam[];
}

export interface ThemeWithParams extends Theme {
  params: ThemeParam[];
}

export interface TaskWithParams extends Task {
  params: Record<string, any>;
}
export interface ReportTemplate {
  id: number;
  task_id: number; // Связь с задачей
  name: string; // Название шаблона
  content: ReportContent[]; // Содержимое шаблона
}

export interface ReportContent {
  type: 'text' | 'table' | 'image'; // Тип элемента
  value: string | TableData | ImageData; // Значение в зависимости от типа
}

export interface TableData {
  columns: string[];
  rows: string[][];
}

export interface ImageData {
  url: string; // URL изображения
  alt?: string; // Альтернативный текст
}
export const fetchInitialData = async (
  setThemes: (themes: ThemeWithParams[]) => void,
  setTasks: (tasks: TaskWithParams[]) => void,
  setMethods: (methods: MethodWithParams[]) => void,
  selectedThemeId: number | null,
  setServerAvailable: (available: boolean) => void
) => {
  try {
    const themes = await getThemes(setServerAvailable);
    const themesWithParams = await Promise.all(
      themes.map(async (theme) => {
        const params = await getThemeParams(theme.id, setServerAvailable);
        return { ...theme, params };
      })
    );
    setThemes(themesWithParams);

    const tasks = await getTasks(setServerAvailable);
    const tasksWithParams = await Promise.all(
      tasks.map(async (task) => {
        const params = await getTaskParams(task.id, setServerAvailable);
        return {
          ...task,
          params: params.reduce((acc, param: TaskParam) => {
            acc[param.param_name] = param.param_value;
            return acc;
          }, {} as Record<string, any>),
        };
      })
    );
    setTasks(tasksWithParams);

    // Загружаем методы для первого theme_id, если selectedThemeId отсутствует
    const themeIdToUse = selectedThemeId || themes[0]?.id;
    if (themeIdToUse) {
      const methods = await getMethods(themeIdToUse, setServerAvailable);
      const methodsWithParams = methods.map((method) => ({ ...method, params: method.params || [] }));
      setMethods(methodsWithParams);
    }
  } catch (error) {
    message.error('Ошибка при загрузке данных');
  }
};

export const handleTaskCreation = async (
  form: any,
  selectedThemeId: number | null,
  themes: ThemeWithParams[],
  tasks: TaskWithParams[],
  setTasks: (tasks: TaskWithParams[]) => void,
  setIsTaskModalOpen: (open: boolean) => void,
  setServerAvailable: (available: boolean) => void
) => {
  try {
    const values = await form.validateFields();
    const selectedTheme = themes.find((theme) => theme.id === selectedThemeId);

    const newTask = await createTask(
      {
        name: values.name,
        description: values.description,
        theme_id: selectedThemeId!,
        subtasks: [],
      },
      setServerAvailable
    );

    if (selectedTheme) {
      await Promise.all(
        selectedTheme.params.map(async (param) => {
          const paramValue = values[param.name];
          if (paramValue !== null && paramValue !== undefined) {
            await createTaskParam(
              {
                task_id: newTask.id,
                param_name: param.name,
                param_value: paramValue,
              },
              setServerAvailable
            );
          }
        })
      );
    }

    setTasks([...tasks, { ...newTask, params: values, subtasks: [] }]);
    setIsTaskModalOpen(false);
    form.resetFields();
    message.success('Задача успешно создана');
  } catch (error) {
    console.error('Ошибка при создании задачи:', error);
    message.error('Ошибка при создании задачи');
  }
};

export const handleTaskEdit = async (
  form: any,
  taskId: number,
  selectedThemeId: number | null,
  themes: ThemeWithParams[],
  tasks: TaskWithParams[],
  setTasks: (tasks: TaskWithParams[]) => void,
  setIsTaskModalOpen: (open: boolean) => void,
  setServerAvailable: (available: boolean) => void
) => {
  try {
    const values = await form.validateFields();
    const selectedTheme = themes.find((theme) => theme.id === selectedThemeId);

    const updatedTask = await updateTask(
      taskId,
      {
        name: values.name,
        description: values.description,
        theme_id: selectedThemeId!,
        subtasks: tasks.find((t) => t.id === taskId)?.subtasks || [],
      },
      setServerAvailable
    );

    if (selectedTheme) {
      await Promise.all(
        selectedTheme.params.map(async (param) => {
          const paramValue = values[param.name];
          if (paramValue !== null && paramValue !== undefined) {
            await createTaskParam(
              {
                task_id: updatedTask.id,
                param_name: param.name,
                param_value: paramValue,
              },
              setServerAvailable
            );
          }
        })
      );
    }

    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...updatedTask, params: values, subtasks: task.subtasks } : task
      )
    );
    setIsTaskModalOpen(false);
    form.resetFields();
    message.success('Задача успешно обновлена');
  } catch (error) {
    console.error('Ошибка при обновлении задачи:', error);
    message.error('Ошибка при обновлении задачи');
  }
};

export const handleSubtaskCreation = async (
  selectedTaskId: number | null,
  selectedMethodId: number | null,
  methods: MethodWithParams[],
  subtaskParams: Record<string, any>,
  tasks: TaskWithParams[],
  setTasks: (tasks: TaskWithParams[]) => void,
  setIsSubtaskModalOpen: (open: boolean) => void,
  setSubtaskParams: (params: Record<string, any>) => void,
  setServerAvailable: (available: boolean) => void
) => {
  if (selectedTaskId !== null && selectedMethodId !== null) {
    try {
      const method = methods.find((m) => m.id === selectedMethodId);
      if (!method) {
        message.error('Метод не найден');
        return;
      }

      const finalParams = method.params.reduce((acc, param) => {
        if (subtaskParams[param.name] !== undefined && subtaskParams[param.name] !== '') {
          acc[param.name] = subtaskParams[param.name];
        }
        return acc;
      }, {} as Record<string, any>);

      const newSubtask = await createSubtask(
        {
          task_id: selectedTaskId,
          method_id: selectedMethodId,
          params: finalParams,
        },
        setServerAvailable
      );

      const updatedTasks = tasks.map((task) =>
        task.id === selectedTaskId
          ? { ...task, subtasks: [...(task.subtasks || []), newSubtask] }
          : task
      );
      setTasks(updatedTasks);
      setIsSubtaskModalOpen(false);
      setSubtaskParams({});
      message.success('Подзадача успешно добавлена');
    } catch (error) {
      message.error('Ошибка при добавлении подзадачи');
    }
  } else {
    message.error('Выберите задачу и метод');
  }
};