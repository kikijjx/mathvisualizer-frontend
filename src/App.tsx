import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme as antdTheme, Button } from 'antd';
import { MathJaxContext } from 'better-react-mathjax';
import { BookOutlined, FunctionOutlined, SettingOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import TrapezoidalIntegration from './Integration/TrapezoidalIntegration';
import LeftRectanglesIntegration from './Integration/LeftRectanglesIntegration';
import RightRectanglesIntegration from './Integration/RightRectanglesIntegration';
import MidpointRectanglesIntegration from './Integration/MidpointRectanglesIntegration';
import SimpsonIntegration from './Integration/SimpsonIntegration';
import EulerDiffur from './Diffurs/EulerDiffur';
import KoshiDiffur from './Diffurs/KoshiDiffur';
import KoshiHalfDiffur from './Diffurs/KoshiHalfDiffur';
import RungeDiffur from './Diffurs/RungeDiffur';

import Tasks from './Tasks/Tasks';
import AdminPanel from './AdminPanel';
import { getThemes, getTasks, Theme, Task, Method } from './api';
import './App.css';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<string>('methods');
  const [activeMethodTab, setActiveMethodTab] = useState<string>('trapezoidal');
  const [collapsed, setCollapsed] = useState<boolean>(window.innerWidth < 768);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  const { token } = antdTheme.useToken();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const themesData = await getThemes();
        const tasksData = await getTasks();
        setThemes(themesData);
        setTasks(tasksData);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };
    fetchData();

    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setCollapsed(mobile ? true : false); // Collapse on mobile, expand on desktop
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const refreshData = async () => {
    try {
      const themesData = await getThemes();
      const tasksData = await getTasks();
      setThemes(themesData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Ошибка обновления данных:', error);
    }
  };

  const integrationMethods = [
    { key: 'trapezoidal', label: 'Метод трапеций', component: <TrapezoidalIntegration /> },
    { key: 'left-rectangles', label: 'Левые прямоугольники', component: <LeftRectanglesIntegration /> },
    { key: 'right-rectangles', label: 'Правые прямоугольники', component: <RightRectanglesIntegration /> },
    { key: 'midpoint-rectangles', label: 'Средние прямоугольники', component: <MidpointRectanglesIntegration /> },
    { key: 'simpson', label: 'Метод Симпсона', component: <SimpsonIntegration /> },
  ];

  const diffurMethods = [
    { key: 'euler', label: 'Метод Эйлера', component: <EulerDiffur /> },
    { key: 'koshi', label: 'Метод Эйлера-Коши', component: <KoshiDiffur /> },
    { key: 'koshihalf', label: 'Метод Эйлера-Коши на полуцелой сетке', component: <KoshiHalfDiffur /> },
    { key: 'runge', label: 'Метод Рунге-Кутта', component: <RungeDiffur /> },
  ];

  const methodCategories = [
    {
      key: 'integration',
      label: 'Численное интегрирование',
      methods: integrationMethods,
    },
    {
      key: 'diffur',
      label: 'Дифференциальные уравнения',
      methods: diffurMethods,
    },
  ];

  const mainItems = [
    {
      key: 'tasks',
      label: 'Задачи',
      icon: <BookOutlined />,
      component: (
        <Tasks
          themes={themes}
          tasks={tasks}
          methods={[]}
          setThemes={setThemes}
          setTasks={setTasks}
          setMethods={() => {}}
        />
      ),
    },
    {
      key: 'methods',
      label: 'Численные методы',
      icon: <FunctionOutlined />,
      component: null,
    },
    {
      key: 'admin',
      label: 'Админ-панель',
      icon: <SettingOutlined />,
      component: <AdminPanel onDataChange={refreshData} />,
    },
  ];

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'methods') {
      setActiveMethodTab('trapezoidal');
    } else {
      setActiveMethodTab('');
    }
    if (isMobile) {
      setCollapsed(true); // Auto-collapse on mobile after selection
    }
  };

  const handleMethodChange = (key: string) => {
    setActiveMethodTab(key);
    if (isMobile) {
      setCollapsed(true); // Auto-collapse on mobile after selection
    }
  };

  const renderContent = () => {
    if (activeTab === 'tasks') {
      return mainItems.find(item => item.key === 'tasks')?.component;
    }
    if (activeTab === 'admin') {
      return mainItems.find(item => item.key === 'admin')?.component;
    }
    if (activeTab === 'methods' && activeMethodTab) {
      const method = integrationMethods.find(m => m.key === activeMethodTab) ||
                     diffurMethods.find(m => m.key === activeMethodTab);
      if (method) {
        return method.component;
      }
    }
    return <div className="welcome-message">Выберите метод или задачу для начала работы</div>;
  };

  const menuItems = mainItems.map(item => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
  }));

  const methodMenuItems = methodCategories.map(category => ({
    key: category.key,
    label: category.label,
    children: category.methods.map(method => ({
      key: method.key,
      label: method.label,
    })),
  }));

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <MathJaxContext>
      <Layout style={{ minHeight: '100vh' }}>
        
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          width={300}
          collapsedWidth={isMobile ? 0 : 80} // Fully hide on mobile, icon-only on desktop
          style={{
            background: token.colorBgContainer,
            position: isMobile ? 'fixed' : 'relative',
            height: isMobile ? '100vh' : 'auto',
            zIndex: 1000,
            width: isMobile && !collapsed ? '100vw' : undefined,
            transition: 'all 0.2s',
            borderRight: 1
          }}
        >
          <Header
            style={{
              background: token.colorBgContainer,
              padding: '0 16px',
              display: 'flex',
              alignItems: 'left',
              height: 64,
              position: 'sticky',
              top: 0,
              zIndex: 1000,
              
            }}
          >
            <Button
              type="secondary"
              onClick={toggleCollapsed}
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              style={{ marginLeft: 7, minWidth: 20 }}
            >
            </Button>
          </Header>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[activeTab]}
            onClick={({ key }) => handleTabChange(key)}
            items={menuItems}
          />
          {activeTab === 'methods' && (
            <Menu
              mode="inline"
              selectedKeys={[activeMethodTab]}
              onClick={({ key }) => handleMethodChange(key)}
              items={methodMenuItems}
              style={{ marginTop: 16 }}
            />
          )}
        </Sider>
        <Layout>
          
          <Content style={{ margin: '0 1px', padding: 24, background: token.colorBgContainer }}>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </MathJaxContext>
  );
};

export default App;