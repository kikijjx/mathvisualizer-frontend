import React, { useState, useRef } from 'react';
import { Button, Modal, Checkbox, InputNumber, Typography, Divider, message, Form, Slider } from 'antd';
import { MathJax } from 'better-react-mathjax';
import { Task, Method } from './api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { getThemeParams } from './api';
import { Document, Packer, Paragraph, TextRun } from 'docx';

const { Text } = Typography;

interface VariantGeneratorProps {
  task: Task;
  methods: Method[];
}

interface ParamSettings {
  min?: number;
  max?: number;
  complexity?: number;
}

const VariantGenerator: React.FC<VariantGeneratorProps> = ({ task, methods }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [numVariants, setNumVariants] = useState<number>(1);
  const [generatedVariants, setGeneratedVariants] = useState<Task[]>([]);
  const [selectedParams, setSelectedParams] = useState<Record<string, boolean>>({});
  const [paramSettings, setParamSettings] = useState<Record<string, ParamSettings>>({});
  const [themeParams, setThemeParams] = useState<{ name: string; type: string; id: number }[]>([]);

  const [form] = Form.useForm();
  const contentRef = useRef<HTMLDivElement>(null);

  // Загрузить параметры темы при открытии модального окна
  const showModal = async () => {
    setIsModalOpen(true);
    try {
      const params = await getThemeParams(task.theme_id);
      setThemeParams(params);
      initializeSelectedParams(params);
      generateVariants();
    } catch (error) {
      message.error('Ошибка при загрузке параметров темы');
    }
  };

  // Закрыть модальное окно
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // Инициализация выбранных параметров
  const initializeSelectedParams = (params: { name: string; type: string; id: number }[]) => {
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
  };

  // Генерация вариантов
  const generateVariants = () => {
    if (numVariants < 1) {
      message.error('Количество вариантов должно быть больше 0');
      return;
    }

    const variants = Array.from({ length: numVariants }, (_, index) =>
      generateTaskVariant(task, index + 1)
    );
    setGeneratedVariants(variants);
  };

  // Генерация варианта задачи
  const generateTaskVariant = (task: Task, variantIndex: number): Task => {
    const newTask = { ...task, id: task.id * 1000 + variantIndex };

    // Генерация параметров задачи
    if (task.params) {
      newTask.params = { ...task.params };
      themeParams.forEach((param) => {
        if (selectedParams[`param_${param.id}`]) {
          newTask.params[param.name] = generateParamValue(param, `param_${param.id}`);
        }
      });
    }

    // Генерация параметров подзадач
    newTask.subtasks = task.subtasks.map((subtask) => {
      const method = methods.find((m) => m.id === subtask.method_id);
      if (!method) return subtask;

      const newSubtask = { ...subtask, params: { ...subtask.params } };
      if (method.params) {
        method.params.forEach((param) => {
          if (selectedParams[`param_${param.id}`]) {
            newSubtask.params[param.name] = generateParamValue(param, `param_${param.id}`);
          }
        });
      }

      return newSubtask;
    });

    return newTask;
  };

  // Генерация значения параметра
  const generateParamValue = (param: { type: string }, paramKey: string): any => {
    const settings = paramSettings[paramKey] || {};

    switch (param.type) {
      case 'number':
        return Math.floor(Math.random() * (settings.max - settings.min + 1)) + settings.min;
      case 'latex':
        return generateComplexLatex(settings.complexity);
      default:
        return '';
    }
  };

  // Генерация сложного LaTeX-выражения
  const generateComplexLatex = (complexity: number): string => {
    const basicFunctions = ['\\sin(x)', '\\cos(x)', '\\tan(x)', '\\sqrt{x}', 'x^{2}', 'e^{x}', '\\ln(x)'];
    const operations = ['+', '-', '*', '/'];

    let expression = basicFunctions[Math.floor(Math.random() * basicFunctions.length)];

    for (let i = 1; i < complexity; i++) {
      const operation = operations[Math.floor(Math.random() * operations.length)];
      const nextFunction = basicFunctions[Math.floor(Math.random() * basicFunctions.length)];
      expression = `${expression} ${operation} ${nextFunction}`;
    }

    return expression;
  };

  // Скачать в PDF
  const downloadPDF = async () => {
    if (!contentRef.current) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const content = contentRef.current;

    const scale = 2;
    const pageWidth = pdf.internal.pageSize.getWidth() - 20;
    const pageHeight = pdf.internal.pageSize.getHeight() - 20;

    let yOffset = 10;

    for (let i = 0; i < generatedVariants.length; i++) {
      const variant = generatedVariants[i];
      const taskElement = content.children[i] as HTMLElement;

      const canvas = await html2canvas(taskElement, { scale });
      const imgData = canvas.toDataURL('image/png');

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (yOffset + imgHeight > pageHeight) {
        pdf.addPage();
        yOffset = 10;
      }

      pdf.addImage(imgData, 'PNG', 10, yOffset, imgWidth, imgHeight);
      yOffset += imgHeight + 10;
    }

    pdf.save('variants.pdf');
  };

  // Скачать в Word
  const downloadWord = () => {
    const paragraphs = generatedVariants.map((variant, index) => {
      // Сортируем параметры: сначала latex, потом number, внутри категорий по алфавиту
      const sortedParams = Object.entries(variant.params || {})
        .sort(([keyA], [keyB]) => {
          const paramA = themeParams.find((p) => p.name === keyA);
          const paramB = themeParams.find((p) => p.name === keyB);

          if (paramA?.type === 'latex' && paramB?.type !== 'latex') return -1;
          if (paramA?.type !== 'latex' && paramB?.type === 'latex') return 1;
          return keyA.localeCompare(keyB);
        });

      const taskParams = sortedParams
        .map(([key, value]) => `${key} = ${value}`)
        .join('\n');

      const subtasks = variant.subtasks
        .map((subtask, subtaskIndex) => {
          const method = methods.find((m) => m.id === subtask.method_id);
          return `${subtaskIndex + 1}) ${method ? method.description : 'Метод не найден'}{' '}
            ${subtask.params ? `(${JSON.stringify(subtask.params)})` : ''}`;
        })
        .join('\n');

      return new Paragraph({
        children: [
          new TextRun({
            text: `Вариант ${index + 1}:`,
            bold: true,
          }),
          new TextRun({
            text: `\n${variant.description}\n${taskParams}\n${subtasks}`,
            break: 1,
          }),
        ],
      });
    });

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'variants.docx');
    });
  };

  // Обновление настроек параметра
  const updateParamSettings = (paramKey: string, settings: ParamSettings) => {
    setParamSettings((prev) => ({
      ...prev,
      [paramKey]: settings,
    }));
  };

  return (
    <div>
      <Button type="primary" onClick={showModal}>
        Генерация вариантов
      </Button>

      <Modal
        title="Генерация вариантов"
        open={isModalOpen}
        onCancel={handleCancel}
        width="80%"
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Закрыть
          </Button>,
          <Button key="pdf" onClick={downloadPDF}>
            Скачать PDF
          </Button>,
          <Button key="word" onClick={downloadWord}>
            Скачать Word
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            numVariants: 1,
          }}
        >
          <Form.Item
            name="numVariants"
            label="Количество вариантов"
            rules={[{ required: true, message: 'Введите количество вариантов' }]}
          >
            <InputNumber
              min={1}
              max={100}
              onChange={(value) => setNumVariants(value || 1)}
            />
          </Form.Item>

          {/* Параметры темы */}
          <Form.Item label="Параметры темы">
            {themeParams
              .sort((a, b) => {
                if (a.type === 'latex' && b.type !== 'latex') return -1;
                if (a.type !== 'latex' && b.type === 'latex') return 1;
                return a.name.localeCompare(b.name);
              })
              .map((param) => {
                const paramKey = `param_${param.id}`;
                const isLatex = param.type === 'latex';

                return (
                  <div key={paramKey}>
                    <Checkbox
                      checked={selectedParams[paramKey] || false}
                      onChange={(e) =>
                        setSelectedParams({
                          ...selectedParams,
                          [paramKey]: e.target.checked,
                        })
                      }
                    >
                      {param.name}
                    </Checkbox>
                    {selectedParams[paramKey] && (
                      <div style={{ marginLeft: '24px' }}>
                        {isLatex ? (
                          <Form.Item label="Сложность функции">
                            <Slider
                              min={1}
                              max={5}
                              value={paramSettings[paramKey]?.complexity}
                              onChange={(value) =>
                                updateParamSettings(paramKey, {
                                  ...paramSettings[paramKey],
                                  complexity: value,
                                })
                              }
                            />
                          </Form.Item>
                        ) : (
                          <>
                            <Form.Item label="Минимальное значение">
                              <InputNumber
                                value={paramSettings[paramKey]?.min}
                                onChange={(value) =>
                                  updateParamSettings(paramKey, {
                                    ...paramSettings[paramKey],
                                    min: value || 1,
                                  })
                                }
                              />
                            </Form.Item>
                            <Form.Item label="Максимальное значение">
                              <InputNumber
                                value={paramSettings[paramKey]?.max}
                                onChange={(value) =>
                                  updateParamSettings(paramKey, {
                                    ...paramSettings[paramKey],
                                    max: value || 10,
                                  })
                                }
                              />
                            </Form.Item>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </Form.Item>

          <Button type="primary" onClick={generateVariants}>
            Сгенерировать варианты
          </Button>
        </Form>

        {/* Отображение сгенерированных вариантов */}
        <div ref={contentRef} style={{ marginTop: '24px' }}>
          {generatedVariants.map((variant, index) => (
            <div key={variant.id} style={{ marginBottom: '24px' }}>
              <Text strong>Вариант {index + 1}</Text>
              <MathJax>{variant.description}</MathJax>
              {variant.params && (
                <div>
                  {Object.entries(variant.params)
                    .sort(([keyA], [keyB]) => {
                      const paramA = themeParams.find((p) => p.name === keyA);
                      const paramB = themeParams.find((p) => p.name === keyB);

                      if (paramA?.type === 'latex' && paramB?.type !== 'latex') return -1;
                      if (paramA?.type !== 'latex' && paramB?.type === 'latex') return 1;
                      return keyA.localeCompare(keyB);
                    })
                    .map(([key, value]) => {
                      if (key === 'name' || key === 'theme_id') return null;
                      return (
                        <div key={key}>
                          <Text>{`${key} = `}</Text>
                          {typeof value === 'string' && value.startsWith('\\') ? (
                            <MathJax inline dynamic>{`\\( ${value} \\)`}</MathJax>
                          ) : (
                            <Text>{value}</Text>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
              {variant.subtasks.map((subtask, subtaskIndex) => {
                const method = methods.find((m) => m.id === subtask.method_id);
                return (
                  <div key={subtaskIndex} style={{ marginTop: '12px' }}>
                    <Text>
                      {subtaskIndex + 1}) {method ? method.description : 'Метод не найден'}{' '}
                      {subtask.params && `(${JSON.stringify(subtask.params)})`}
                    </Text>
                  </div>
                );
              })}
              <Divider />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default VariantGenerator;