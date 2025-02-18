import React from 'react';
import { Tabs, Card } from 'antd';
import { MathJaxContext } from 'better-react-mathjax';
import TrapezoidalIntegration from './TrapezoidalIntegration';
import LeftRectanglesIntegration from './LeftRectanglesIntegration';
import RightRectanglesIntegration from './RightRectanglesIntegration';
import MidpointRectanglesIntegration from './MidpointRectanglesIntegration';
import SimpsonIntegration from './SimpsonIntegration';
import LagrangeInterpolation from './LagrangeInterpolation';
import AitkenInterpolation from './AitkenInterpolation';

import Tasks from './Tasks';
import './App.css';

const App: React.FC = () => {
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
    {
      key: 'lagrange',
      label: 'Интерполяция Лагранжа',
      children: <LagrangeInterpolation />,
    },
    {
      key: 'aitken',
      label: 'Интерполяция Эйткена',
      children: <AitkenInterpolation />,
    },
  ];

  const mainItems = [
    {
      key: 'tasks',
      label: 'Задачи',
      children: <Tasks />,
    },
    {
      key: 'methods',
      label: 'Методы',
      children: <Tabs tabPosition="left" items={methodsItems} />,
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