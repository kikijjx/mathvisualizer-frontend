import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:8000/api'; // Замените на ваш URL FastAPI

export interface Theme {
  id: number;
  name: string;
}

export interface Method {
  id: number;
  name: string;
  description: string;
  theme_id: number;
  params: MethodParam[];
}

export interface MethodParam {
  id: number;
  name: string;
  type: string;
  default_value: string | null;
}

export interface Task {
  id: number;
  name: string;
  description: string;
  theme_id: number;
  subtasks: Subtask[];
  params?: Record<string, any>;
}

export interface Subtask {
  id: number;
  task_id: number;
  method_id: number;
  params: Record<string, any>;
}

export interface ThemeParam {
  id: number;
  theme_id: number;
  name: string;
  type: string;
  default_value: string | null;
}

export interface TaskParam {
  id: number;
  task_id: number;
  param_name: string;
  param_value: string;
}

// Вспомогательная функция для обработки запросов с учетом состояния сервера
const apiRequest = async <T>(
  request: () => Promise<T>,
  setServerAvailable: (available: boolean) => void
): Promise<T> => {
  try {
    const result = await request();
    setServerAvailable(true);
    return result;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('API request error:', axiosError.message);
    setServerAvailable(false);
    throw error; // Передаем ошибку дальше для обработки в компонентах
  }
};

// Темы
export const getThemes = async (setServerAvailable: (available: boolean) => void): Promise<Theme[]> => {
  return apiRequest(
    () => axios.get(`${API_URL}/themes/`).then((response) => response.data),
    setServerAvailable
  );
};

export const createTheme = async (
  theme: Omit<Theme, 'id'>,
  setServerAvailable: (available: boolean) => void
): Promise<Theme> => {
  return apiRequest(
    () => axios.post(`${API_URL}/themes/`, theme).then((response) => response.data),
    setServerAvailable
  );
};

export const updateTheme = async (
  themeId: number,
  theme: Partial<Theme>,
  setServerAvailable: (available: boolean) => void
): Promise<Theme> => {
  return apiRequest(
    () => axios.put(`${API_URL}/themes/${themeId}`, theme).then((response) => response.data),
    setServerAvailable
  );
};

export const deleteTheme = async (themeId: number, setServerAvailable: (available: boolean) => void): Promise<void> => {
  return apiRequest(
    () => axios.delete(`${API_URL}/themes/${themeId}`).then(() => undefined),
    setServerAvailable
  );
};

// Параметры тем
export const getThemeParams = async (
  themeId: number,
  setServerAvailable: (available: boolean) => void
): Promise<ThemeParam[]> => {
  return apiRequest(
    () => axios.get(`${API_URL}/theme-params/${themeId}`).then((response) => response.data),
    setServerAvailable
  );
};

export const createThemeParam = async (
  param: Omit<ThemeParam, 'id'>,
  setServerAvailable: (available: boolean) => void
): Promise<ThemeParam> => {
  return apiRequest(
    () => axios.post(`${API_URL}/theme-params/`, param).then((response) => response.data),
    setServerAvailable
  );
};

export const updateThemeParam = async (
  paramId: number,
  param: Partial<ThemeParam>,
  setServerAvailable: (available: boolean) => void
): Promise<ThemeParam> => {
  return apiRequest(
    () => axios.put(`${API_URL}/theme-params/${paramId}`, param).then((response) => response.data),
    setServerAvailable
  );
};

export const deleteThemeParam = async (
  paramId: number,
  setServerAvailable: (available: boolean) => void
): Promise<void> => {
  return apiRequest(
    () => axios.delete(`${API_URL}/theme-params/${paramId}`).then(() => undefined),
    setServerAvailable
  );
};

// Методы
export const getMethods = async (
  themeId: number,
  setServerAvailable: (available: boolean) => void
): Promise<Method[]> => {
  return apiRequest(
    () =>
      axios
        .get(`${API_URL}/methods/`, {
          params: { theme_id: themeId },
        })
        .then((response) => response.data),
    setServerAvailable
  );
};

export const createMethod = async (
  method: Omit<Method, 'id' | 'params'>,
  setServerAvailable: (available: boolean) => void
): Promise<Method> => {
  return apiRequest(
    () => axios.post(`${API_URL}/methods/`, method).then((response) => response.data),
    setServerAvailable
  );
};

export const updateMethod = async (
  methodId: number,
  method: Partial<Method>,
  setServerAvailable: (available: boolean) => void
): Promise<Method> => {
  return apiRequest(
    () => axios.put(`${API_URL}/methods/${methodId}`, method).then((response) => response.data),
    setServerAvailable
  );
};

export const deleteMethod = async (
  methodId: number,
  setServerAvailable: (available: boolean) => void
): Promise<void> => {
  return apiRequest(
    () => axios.delete(`${API_URL}/methods/${methodId}`).then(() => undefined),
    setServerAvailable
  );
};

// Параметры методов
export const getMethodParams = async (
  methodId: number,
  setServerAvailable: (available: boolean) => void
): Promise<MethodParam[]> => {
  return apiRequest(
    () => axios.get(`${API_URL}/methods/${methodId}/params/`).then((response) => response.data),
    setServerAvailable
  );
};

export const createMethodParam = async (
  param: Omit<MethodParam, 'id'>,
  methodId: number | null,
  setServerAvailable: (available: boolean) => void
): Promise<MethodParam> => {
  return apiRequest(
    () => axios.post(`${API_URL}/methods/${methodId}/params/`, param).then((response) => response.data),
    setServerAvailable
  );
};

export const updateMethodParam = async (
  paramId: number,
  param: Partial<MethodParam>,
  setServerAvailable: (available: boolean) => void
): Promise<MethodParam> => {
  return apiRequest(
    () => axios.put(`${API_URL}/method-params/${paramId}`, param).then((response) => response.data),
    setServerAvailable
  );
};

export const deleteMethodParam = async (
  paramId: number,
  setServerAvailable: (available: boolean) => void
): Promise<void> => {
  return apiRequest(
    () => axios.delete(`${API_URL}/method-params/${paramId}`).then(() => undefined),
    setServerAvailable
  );
};

// Задачи
export const getTasks = async (setServerAvailable: (available: boolean) => void): Promise<Task[]> => {
  return apiRequest(
    () => axios.get(`${API_URL}/tasks/`).then((response) => response.data),
    setServerAvailable
  );
};

export const createTask = async (
  task: Omit<Task, 'id'>,
  setServerAvailable: (available: boolean) => void
): Promise<Task> => {
  return apiRequest(
    () => axios.post(`${API_URL}/tasks/`, task).then((response) => response.data),
    setServerAvailable
  );
};

export const updateTask = async (
  taskId: number,
  task: Partial<Task>,
  setServerAvailable: (available: boolean) => void
): Promise<Task> => {
  return apiRequest(
    () => axios.put(`${API_URL}/tasks/${taskId}`, task).then((response) => response.data),
    setServerAvailable
  );
};

export const deleteTask = async (taskId: number, setServerAvailable: (available: boolean) => void): Promise<void> => {
  return apiRequest(
    () => axios.delete(`${API_URL}/tasks/${taskId}`).then(() => undefined),
    setServerAvailable
  );
};

// Подзадачи
export const createSubtask = async (
  subtask: Omit<Subtask, 'id'>,
  setServerAvailable: (available: boolean) => void
): Promise<Subtask> => {
  return apiRequest(
    () => axios.post(`${API_URL}/subtasks/`, subtask).then((response) => response.data),
    setServerAvailable
  );
};

export const deleteSubtask = async (
  subtaskId: number,
  setServerAvailable: (available: boolean) => void
): Promise<void> => {
  return apiRequest(
    () => axios.delete(`${API_URL}/subtasks/${subtaskId}`).then(() => undefined),
    setServerAvailable
  );
};

// Параметры задач
export const getTaskParams = async (
  taskId: number,
  setServerAvailable: (available: boolean) => void
): Promise<TaskParam[]> => {
  return apiRequest(
    () => axios.get(`${API_URL}/task-params/${taskId}`).then((response) => response.data),
    setServerAvailable
  );
};

export const createTaskParam = async (
  taskParam: { task_id: number; param_name: string; param_value: string },
  setServerAvailable: (available: boolean) => void
): Promise<TaskParam> => {
  return apiRequest(
    () => axios.post(`${API_URL}/task-params/`, taskParam).then((response) => response.data),
    setServerAvailable
  );
};

export const updateTaskParam = async (
  paramId: number,
  param: Partial<TaskParam>,
  setServerAvailable: (available: boolean) => void
): Promise<TaskParam> => {
  return apiRequest(
    () => axios.put(`${API_URL}/task-params/${paramId}`, param).then((response) => response.data),
    setServerAvailable
  );
};

export const deleteTaskParam = async (
  paramId: number,
  setServerAvailable: (available: boolean) => void
): Promise<void> => {
  return apiRequest(
    () => axios.delete(`${API_URL}/task-params/${paramId}`).then(() => undefined),
    setServerAvailable
  );
};

export const getThemeWithDetails = async (
  themeId: number,
  setServerAvailable: (available: boolean) => void
): Promise<{
  id: number;
  name: string;
  params: ThemeParam[];
  methods: Method[];
}> => {
  return apiRequest(
    () => axios.get(`${API_URL}/themes/${themeId}`).then((response) => response.data),
    setServerAvailable
  );
};