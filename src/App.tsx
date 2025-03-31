import React, { useState, useEffect } from 'react';
import { Tabs } from 'antd';
import { MathJaxContext } from 'better-react-mathjax';
import TrapezoidalIntegration from './Integration/TrapezoidalIntegration';
import LeftRectanglesIntegration from './Integration/LeftRectanglesIntegration';
import RightRectanglesIntegration from './Integration/RightRectanglesIntegration';
import MidpointRectanglesIntegration from './Integration/MidpointRectanglesIntegration';
import SimpsonIntegration from './Integration/SimpsonIntegration';
import Tasks from './Tasks/Tasks';
import AdminPanel from './AdminPanel';
import { getThemes, getTasks, getMethods, Theme, Task, Method } from './api';
import './App.css';

const App: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [methods, setMethods] = useState<Method[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const themesData = await getThemes();
        const tasksData = await getTasks();
        setThemes(themesData);
        setTasks(tasksData);
        // Методы зависят от выбранной темы, поэтому их загрузим в Tasks
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };
    fetchData();
  }, []);

  const refreshData = async () => {
    try {
      const themesData = await getThemes();
      const tasksData = await getTasks();
      setThemes(themesData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Ошибка при обновлении данных:', error);
    }
  };

  const methodsItems = [
    {
      key: 'trapezoidal',
      label: 'Метод трапеций',
      children: <TrapezoidalIntegration />,
    },
    {
      key: 'left-rectangles',
      label: 'Левые прямоугольники',
      children: <LeftRectanglesIntegration />,
    },
    {
      key: 'right-rectangles',
      label: 'Правые прямоугольники',
      children: <RightRectanglesIntegration />,
    },
    {
      key: 'midpoint-rectangles',
      label: 'Средние прямоугольники',
      children: <MidpointRectanglesIntegration />,
    },
    {
      key: 'simpson',
      label: 'Метод Симпсона',
      children: <SimpsonIntegration />,
    },
  ];

  const mainItems = [
    {
      key: 'tasks',
      label: 'Задачи',
      children: <Tasks themes={themes} tasks={tasks} methods={methods} setThemes={setThemes} setTasks={setTasks} setMethods={setMethods} />,
    },
    {
      key: 'methods',
      label: 'Методы',
      children:  <Tabs tabPosition="left" items={methodsItems} /> ,
    },
    {
      key: 'admin',
      label: 'Админ-панель',
      children: <AdminPanel onDataChange={refreshData} />,
    },
  ];

  return (
    <MathJaxContext>
      <div style={{ padding: '24px' }}>
        <Tabs defaultActiveKey="methods" items={mainItems} />
      </div>
    </MathJaxContext>
  );
};

export default App;