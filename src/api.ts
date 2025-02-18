// api.ts
import axios from 'axios';

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
  default_value: string;
}

export interface Task {
  id: number;
  name: string;
  description: string;
  theme_id: number;
  subtasks: Subtask[];
}

export interface Subtask {
  id: number;
  task_id: number;
  method_id: number;
  params: Record<string, any>;
}

// Получить список тем
export const getThemes = async (): Promise<Theme[]> => {
  const response = await axios.get(`${API_URL}/themes`);
  return response.data;
};

// Получить методы для темы
export const getMethods = async (themeId: number): Promise<Method[]> => {
    try {
      const response = await axios.get(`${API_URL}/methods`, {
        params: { theme_id: themeId },
      });
      console.log('Methods response:', response.data); // Логируем ответ
      return response.data;
    } catch (error) {
      console.error('Error fetching methods:', error);
      throw error;
    }
  };

// Создать задачу
export const createTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
  const response = await axios.post(`${API_URL}/tasks`, task);
  return response.data;
};

// Создать подзадачу
export const createSubtask = async (subtask: Omit<Subtask, 'id'>): Promise<Subtask> => {
  const response = await axios.post(`${API_URL}/subtasks`, subtask);
  return response.data;
};

// Получить список задач
export const getTasks = async (): Promise<Task[]> => {
  const response = await axios.get(`${API_URL}/tasks`);
  return response.data;
};

// Удалить задачу
export const deleteTask = async (taskId: number): Promise<void> => {
    await axios.delete(`${API_URL}/tasks/${taskId}`);
  };
  
  // Удалить подзадачу
  export const deleteSubtask = async (subtaskId: number): Promise<void> => {
    await axios.delete(`${API_URL}/subtasks/${subtaskId}`);
  };
  