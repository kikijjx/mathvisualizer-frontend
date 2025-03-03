import React from 'react';
import { Tabs, Card } from 'antd';
import { MathJaxContext } from 'better-react-mathjax';
import TrapezoidalIntegration from './Integration/TrapezoidalIntegration';
import LeftRectanglesIntegration from './Integration/LeftRectanglesIntegration';
import RightRectanglesIntegration from './Integration/RightRectanglesIntegration';
import MidpointRectanglesIntegration from './Integration/MidpointRectanglesIntegration';
import SimpsonIntegration from './Integration/SimpsonIntegration';
import LagrangeInterpolation from './Interpolation/LagrangeInterpolation';
import AitkenInterpolation from './Interpolation/AitkenInterpolation';
import EulerMethod from './Diffurs/EulerMethod';

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
    {
      key: 'euler',
      label: 'Эйлер',
      children: <EulerMethod/>,
    }
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