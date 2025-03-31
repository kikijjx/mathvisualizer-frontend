import React from 'react';
import { Button, List, Space, Typography, Collapse } from 'antd';
import { MathJax } from 'better-react-mathjax';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { TaskWithParams, MethodWithParams, ThemeWithParams } from './taskUtils';

const { Text, Title } = Typography;
const { Panel } = Collapse;

interface TaskListProps {
  themes: ThemeWithParams[];
  tasks: TaskWithParams[];
  methods: MethodWithParams[];
  isEditable: boolean;
  onEditTask: (task: TaskWithParams) => void;
  onDeleteTask: (taskId: number) => void;
  onGenerateVariants: (task: TaskWithParams) => void;
  onAddSubtask: (taskId: number) => void;
  onDeleteSubtask: (subtaskId: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  themes,
  tasks,
  methods,
  isEditable,
  onEditTask,
  onDeleteTask,
  onGenerateVariants,
  onAddSubtask,
  onDeleteSubtask,
}) => {
  const renderTaskParams = (params: Record<string, any>) => {
    const sortedParams = Object.entries(params).sort(([keyA], [keyB]) => {
      const paramA = themes.flatMap((theme) => theme.params).find((p) => p.name === keyA);
      const paramB = themes.flatMap((theme) => theme.params).find((p) => p.name === keyB);
      if (paramA?.type === 'latex' && paramB?.type !== 'latex') return -1;
      if (paramA?.type !== 'latex' && paramB?.type === 'latex') return 1;
      return keyA.localeCompare(keyB);
    });

    return sortedParams.map(([key, value]) => {
      const param = themes.flatMap((theme) => theme.params).find((p) => p.name === key);
      if (!param || value === null || value === undefined) return null;

      switch (param.type) {
        case 'latex':
          return <MathJax key={key}>{`\\( ${key} = ${value} \\)`}</MathJax>;
        case 'number':
        case 'text':
        default:
          return <Text key={key}>{`${key} = ${value}`}</Text>;
      }
    });
  };

  const formatParams = (params: Record<string, any>) => {
    const sortedParams = Object.entries(params).sort(([keyA], [keyB]) => {
      const paramA = methods.flatMap((method) => method.params).find((p) => p.name === keyA);
      const paramB = methods.flatMap((method) => method.params).find((p) => p.name === keyB);
      if (paramA?.type === 'latex' && paramB?.type !== 'latex') return -1;
      if (paramA?.type !== 'latex' && paramB?.type === 'latex') return 1;
      return keyA.localeCompare(keyB);
    });

    return sortedParams.map(([key, value]) => `${key} = ${value}`).join(', ');
  };

  const groupedTasks = themes.map((theme) => ({
    theme,
    tasks: tasks.filter((task) => task.theme_id === theme.id),
  }));

  return (
    <Collapse defaultActiveKey={themes.map((theme) => theme.id.toString())}>
      {groupedTasks.map(({ theme, tasks: themeTasks }) => (
        <Panel header={<Title level={4}>{theme.name}</Title>} key={theme.id.toString()}>
          <List
            dataSource={themeTasks}
            renderItem={(task) => (
              <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', width: '100%' }}>
                  <Space direction="vertical" size="small" style={{ flex: 1 }}>
                    <Text strong>{task.name}</Text>
                    <MathJax>{task.description}</MathJax>
                    {task.params && (
                      <Space size="small" wrap>
                        {renderTaskParams(task.params)}
                      </Space>
                    )}
                    {task.subtasks.length > 0 && (
                      <List
                        size="small"
                        dataSource={task.subtasks}
                        renderItem={(subtask, index) => {
                          const method = methods.find((m) => m.id === subtask.method_id);
                          return (
                            <List.Item
                              style={{ borderBottom: '1px solid #f0f0f0', padding: '4px 0' }}
                              actions={
                                isEditable
                                  ? [
                                      <Button
                                        type="link"
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => onDeleteSubtask(subtask.id)}
                                      />,
                                    ]
                                  : []
                              }
                            >
                              <Text>
                                {index + 1}) {method ? method.description : 'Метод не найден'}{' '}
                                {subtask.params && `(${formatParams(subtask.params)})`}
                              </Text>
                            </List.Item>
                          );
                        }}
                      />
                    )}
                  </Space>
                  {isEditable && (
                    <Space
                      direction="vertical"
                      size="small"
                      style={{
                        width: '120px',
                        flexShrink: 0,
                        paddingLeft: '16px',
                        borderLeft: '1px solid #d9d9d9',
                      }}
                    >
                      <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => onEditTask(task)}
                      >
                        Редактировать
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDeleteTask(task.id)}
                      >
                        Удалить
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => onGenerateVariants(task)}
                      >
                        Варианты
                      </Button>
                      <Button
                        type="dashed"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => onAddSubtask(task.id)}
                      >
                        Подзадача
                      </Button>
                    </Space>
                  )}
                </div>
              </List.Item>
            )}
          />
        </Panel>
      ))}
    </Collapse>
  );
};

export default TaskList;