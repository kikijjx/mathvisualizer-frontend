import React, { useRef, useEffect, useState } from 'react';
import { Button, Modal, Form, InputNumber, Checkbox, Slider, Typography, Divider, message } from 'antd';
import { MathJax } from 'better-react-mathjax';
import { Task, getThemeParams } from '../api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';

const { Text } = Typography;

interface ParamSettings {
  min?: number;
  max?: number;
  complexity?: number;
}

interface LatexOptions {
  recursive: boolean;
  linear: boolean;
  numbers: boolean;
}

interface VariantModalProps {
  open: boolean;
  onCancel: () => void;
  task: Task | null;
  methods: Method[];
  numVariants: number;
  setNumVariants: (value: number) => void;
  generatedVariants: Task[];
  setGeneratedVariants: (variants: Task[]) => void;
  selectedParams: Record<string, boolean>;
  setSelectedParams: (params: Record<string, boolean>) => void;
  paramSettings: Record<string, ParamSettings>;
  setParamSettings: (settings: Record<string, ParamSettings>) => void;
  themeParams: { name: string; type: string; id: number }[];
  setThemeParams: (params: { name: string; type: string; id: number }[]) => void;
  setServerAvailable: (available: boolean) => void; // Добавляем пропс
}

const VariantModal: React.FC<VariantModalProps> = ({
  open,
  onCancel,
  task,
  methods,
  numVariants,
  setNumVariants,
  generatedVariants,
  setGeneratedVariants,
  selectedParams,
  setSelectedParams,
  paramSettings,
  setParamSettings,
  themeParams,
  setThemeParams,
  setServerAvailable, // Добавляем в деструктуризацию
}) => {
  const [form] = Form.useForm();
  const contentRef = useRef<HTMLDivElement>(null);
  const [latexOptions, setLatexOptions] = useState<Record<string, LatexOptions>>({});

  useEffect(() => {
    if (task && !themeParams.length) {
      const fetchThemeParams = async () => {
        try {
          const params = await getThemeParams(task.theme_id, setServerAvailable); // Передаем setServerAvailable
          setThemeParams(params);
          initializeSelectedParams(params);
        } catch (error) {
          console.error('Ошибка загрузки параметров темы:', error);
          message.error('Ошибка загрузки параметров темы');
        }
      };
      fetchThemeParams();
    } else {
      initializeSelectedParams(themeParams);
    }
  }, [task, themeParams, setThemeParams, setServerAvailable]); // Добавляем setServerAvailable в зависимости

  const initializeSelectedParams = (params: { name: string; type: string; id: number }[]) => {
    const selected: Record<string, boolean> = {};
    const settings: Record<string, ParamSettings> = {};
    const options: Record<string, LatexOptions> = {};

    params.forEach((param) => {
      const paramKey = `param_${param.id}`;
      selected[paramKey] = false;
      if (param.type === 'number') {
        settings[paramKey] = { min: 1, max: 10 };
      } else if (param.type === 'latex') {
        settings[paramKey] = { complexity: 1 };
        options[paramKey] = { recursive: true, linear: true, numbers: true };
      }
    });

    setSelectedParams(selected);
    setParamSettings(settings);
    setLatexOptions(options);
  };

  const generateVariants = () => {
    if (!task) return;
    if (numVariants < 1) {
      message.error('Количество вариантов должно быть больше 0');
      return;
    }

    const variants = Array.from({ length: numVariants }, (_, index) =>
      generateTaskVariant(task, index + 1)
    );
    setGeneratedVariants(variants);

    // Собираем уникальные LaTeX-выражения
    const latexExpressions = new Set<string>();
    const maxAttempts = numVariants * 10; // Лимит попыток, чтобы избежать бесконечного цикла
    let attempts = 0;

    variants.forEach((variant) => {
      if (variant.params) {
        Object.entries(variant.params).forEach(([key, value]) => {
          const param = themeParams.find((p) => p.name === key);
          if (param?.type === 'latex' && typeof value === 'string') {
            latexExpressions.add(value);
          }
        });
      }
      variant.subtasks.forEach((subtask) => {
        if (subtask.params) {
          Object.values(subtask.params).forEach((value) => {
            if (typeof value === 'string' && value.startsWith('\\')) {
              latexExpressions.add(value);
            }
          });
        }
      });
    });

    // Если уникальных выражений меньше, чем нужно, генерируем дополнительные
    const latexParamKeys = themeParams
      .filter((p) => p.type === 'latex' && selectedParams[`param_${p.id}`])
      .map((p) => `param_${p.id}`);

    while (latexExpressions.size < numVariants && attempts < maxAttempts && latexParamKeys.length > 0) {
      const paramKey = latexParamKeys[Math.floor(Math.random() * latexParamKeys.length)];
      const newExpr = generateComplexLatex(paramSettings[paramKey]?.complexity || 1, latexOptions[paramKey]);
      latexExpressions.add(newExpr);
      attempts++;
    }

    const latexArray = Array.from(latexExpressions);
    console.log('Сгенерированные уникальные LaTeX-выражения:', latexArray);

    if (latexExpressions.size < numVariants) {
      console.warn(`Не удалось сгенерировать ${numVariants} уникальных выражений, получено только ${latexExpressions.size}`);
    }
  };

  const generateTaskVariant = (task: Task, variantIndex: number): Task => {
    const newTask = { ...task, id: task.id * 1000 + variantIndex };

    if (task.params) {
      newTask.params = { ...task.params };
      themeParams.forEach((param) => {
        if (selectedParams[`param_${param.id}`]) {
          newTask.params[param.name] = generateParamValue(param, `param_${param.id}`);
        }
      });
    }

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

  const generateParamValue = (param: { type: string }, paramKey: string): any => {
    const settings = paramSettings[paramKey] || {};
    const options = latexOptions[paramKey] || { recursive: true, linear: true, numbers: true };

    switch (param.type) {
      case 'number':
        return Math.floor(Math.random() * ((settings.max || 10) - (settings.min || 1) + 1)) + (settings.min || 1);
      case 'latex':
        return generateComplexLatex(settings.complexity || 1, options);
      default:
        return '';
    }
  };

  const generateComplexLatex = (complexity: number, options: LatexOptions): string => {
    const basicFunctions = ['\\sin', '\\cos', '\\tan', '\\sqrt', '\\ln', 'e', 'x'];
    const operations = ['+', '-', '*', '/'];
    const maxCoefficient = 5;
    const maxPower = 3;
  
    const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
    const getCoefficient = () => {
      if (!options.numbers) return '';
      const coeff = getRandomNumber(-maxCoefficient, maxCoefficient);
      if (coeff === 0) return '';
      if (coeff === 1) return '';
      if (coeff === -1) return '-';
      return coeff.toString();
    };
  
    const getPower = () => (options.numbers ? getRandomNumber(2, maxPower) : '');
  
    // Проверка на тривиальность для двух выражений
    const isTrivialPair = (left: string, right: string, operation: string): boolean => {
      if (left === right) return true; // Полное совпадение
      const leftBase = left.replace(/^-?\d*\\?/, '').replace(/\(.*\)/, '').replace(/\^{[^}]+}/, '');
      const rightBase = right.replace(/^-?\d*\\?/, '').replace(/\(.*\)/, '').replace(/\^{[^}]+}/, '');
      return leftBase === rightBase && (operation === '+' || operation === '-' || operation === '*');
    };
  
    // Подсчёт количества x (x-атомов)
    const calculateXCount = (expr: string): number => {
      const xCount = (expr.match(/x/g) || []).length;
      return xCount;
    };
  
    // Подсчёт количества x и проверка на избыточные повторы
    const analyzeExpression = (expr: string): { xCount: number; isTrivial: boolean } => {
      const xCount = calculateXCount(expr);
      const parts = expr.split(/\s*[\+\-\*\/]\s*/).filter(Boolean); // Разделяем по операциям
      const bases = parts.map(part => part.replace(/^-?\d*\\?/, '').replace(/\(.*\)/, '').replace(/\^{[^}]+}/, ''));
      const uniqueBases = new Set(bases);
      
      const isTrivial = uniqueBases.size < parts.length / 2;
      return { xCount, isTrivial };
    };
  
    // Генерация базового выражения с одним x
    const generateBase = (): string => {
      const func = basicFunctions[Math.floor(Math.random() * basicFunctions.length)];
      const coefficient = getCoefficient();
      let expr = '';
  
      if (func === 'x') {
        const power = getPower();
        expr = `${coefficient}x${power ? `^{${power}}` : ''}`;
      } else if (func === 'e') {
        expr = `${coefficient}e^{x}`;
      } else {
        expr = `${coefficient}${func}(x)`;
      }
  
      return expr || 'x';
    };
  
    // Основная генерация
    const generate = (targetComplexity: number): string => {
      if (targetComplexity <= 1) {
        return generateBase();
      }
  
      const availableOptions = [];
      if (options.recursive) availableOptions.push('recursive');
      if (options.linear) availableOptions.push('linear');
      if (!availableOptions.length) availableOptions.push('linear');
  
      const choice = availableOptions[Math.floor(Math.random() * availableOptions.length)];
  
      if (choice === 'recursive') {
        const outerFunc = basicFunctions[Math.floor(Math.random() * basicFunctions.length)];
        const coefficient = getCoefficient();
        const innerExpr = generate(targetComplexity - 1);
  
        if (outerFunc === '\\sqrt') {
          return `${coefficient}\\sqrt{(${innerExpr})^{2}}`;
        } else if (outerFunc === '\\ln') {
          return `${coefficient}\\ln((${innerExpr})^{2} + 1)`;
        } else if (outerFunc === 'x') {
          const power = getPower();
          return `${coefficient}x^{${power || innerExpr}}`;
        } else if (outerFunc === 'e') {
          return `${coefficient}e^{${innerExpr}}`;
        }
        return `${coefficient}${outerFunc}(${innerExpr})`;
      } else {
        const parts: string[] = [];
        let remainingComplexity = targetComplexity;
  
        while (remainingComplexity > 0) {
          const partComplexity = Math.min(remainingComplexity, Math.floor(Math.random() * remainingComplexity) + 1);
          parts.push(generate(partComplexity));
          remainingComplexity -= partComplexity;
        }
  
        let expr = parts[0];
        for (let i = 1; i < parts.length; i++) {
          const operation = operations[Math.floor(Math.random() * operations.length)];
          let right = parts[i];
  
          let attempts = 0;
          const maxAttempts = 10;
          while (isTrivialPair(expr, right, operation) && attempts < maxAttempts) {
            right = generate(calculateXCount(parts[i])); // Перегенерируем с той же сложностью
            attempts++;
          }
  
          if (operation === '/') {
            right = `((${right})^{2} + 1)`;
          }
  
          if (operation === '+' && right.startsWith('-')) {
            expr = `${expr} - ${right.substring(1)}`;
          } else if (operation === '-' && right.startsWith('-')) {
            expr = `${expr} + ${right.substring(1)}`;
          } else {
            expr = `${expr} ${operation} ${right}`;
          }
        }
  
        return expr;
      }
    };
  
    let result = generate(complexity);
    let attempts = 0;
    const maxAttempts = 50;
    let analysis = analyzeExpression(result);
  
    while ((analysis.xCount !== complexity || analysis.isTrivial) && attempts < maxAttempts) {
      result = generate(complexity);
      analysis = analyzeExpression(result);
      attempts++;
    }
  
    if (attempts >= maxAttempts) {
      console.warn(`Не удалось сгенерировать нетривиальное выражение с точным количеством x = ${complexity}, возвращаем последнее: ${result}`);
    }
  
    return result;
  };
  const countDuplicates = (expressions) => {
    const expressionCount = {};
    expressions.forEach(expr => {
      expressionCount[expr] = (expressionCount[expr] || 0) + 1;
    });
    return Object.values(expressionCount).reduce((sum, count) => sum + (count > 1 ? count - 1 : 0), 0);
  };
  
  // Функция для вычисления среднего числа дубликатов по 10 прогонам
  const getAverageDuplicates = (N, C, option) => {
    const runs = 10;
    let totalDuplicates = 0;
  
    for (let i = 0; i < runs; i++) {
      const expressions = Array.from({ length: N }, () => generateComplexLatex(C, option));
      totalDuplicates += countDuplicates(expressions);
    }
  
    return (totalDuplicates / runs).toFixed(2); // Среднее с двумя знаками после запятой
  };
  
  // Компактный перебор и вывод с усреднением
  const testVariantsCompactWithAverage = () => {
    const Ns = [5, 10, 50];
    const Cs = [1, 2, 3, 4, 5];
    const optionCombinations = [
      { recursive: false, linear: false, numbers: false, name: 'Без опций' },
      { recursive: false, linear: false, numbers: true, name: 'Коэф.' },
      { recursive: true, linear: false, numbers: false, name: 'Рек.' },
      { recursive: false, linear: true, numbers: false, name: 'Лин.' },
      { recursive: true, linear: false, numbers: true, name: 'Рек. + Коэф.' },
      { recursive: false, linear: true, numbers: true, name: 'Лин. + Коэф.' },
      { recursive: true, linear: true, numbers: false, name: 'Рек. + Лин.' },
      { recursive: true, linear: true, numbers: true, name: 'Все' },
    ];
  
    // Заголовок
    let header = 'Активные опции';
    Ns.forEach(N => {
      Cs.forEach(C => {
        header += `\tN=${N} C=${C}`;
      });
    });
    console.log(header);
  
    // Данные с усреднением
    optionCombinations.forEach(option => {
      let row = option.name;
      Ns.forEach(N => {
        Cs.forEach(C => {
          const avgDuplicates = getAverageDuplicates(N, C, option);
          row += `\t${avgDuplicates}`;
        });
      });
      console.log(row);
    });
  };
  
  // Запуск теста

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

  const downloadWord = () => {
    const paragraphs = generatedVariants.map((variant, index) => {
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

  const updateParamSettings = (paramKey: string, settings: ParamSettings) => {
    setParamSettings((prev) => ({
      ...prev,
      [paramKey]: settings,
    }));
  };

  const updateLatexOptions = (paramKey: string, option: keyof LatexOptions, value: boolean) => {
    setLatexOptions((prev) => ({
      ...prev,
      [paramKey]: {
        ...prev[paramKey],
        [option]: value,
      },
    }));
  };

  return (
    <Modal
      title="Генерация вариантов"
      open={open}
      onCancel={onCancel}
      width="80%"
      footer={[
        <Button key="cancel" onClick={onCancel}>
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
        initialValues={{ numVariants: 1 }}
      >
        <Form.Item
          name="numVariants"
          label="Количество вариантов"
          rules={[{ required: true, message: 'Введите количество вариантов' }]}
        >
          <InputNumber
            min={1}
            max={50}
            onChange={(value) => setNumVariants(value || 1)}
          />
        </Form.Item>

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
                        <>
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
                          <div>
                            <Checkbox
                              checked={latexOptions[paramKey]?.recursive}
                              onChange={(e) => updateLatexOptions(paramKey, 'recursive', e.target.checked)}
                            >
                              Рекурсивный подход
                            </Checkbox>
                            <Checkbox
                              checked={latexOptions[paramKey]?.linear}
                              onChange={(e) => updateLatexOptions(paramKey, 'linear', e.target.checked)}
                            >
                              Линейный подход
                            </Checkbox>
                            <Checkbox
                              checked={latexOptions[paramKey]?.numbers}
                              onChange={(e) => updateLatexOptions(paramKey, 'numbers', e.target.checked)}
                            >
                              Использовать числа
                            </Checkbox>
                          </div>
                        </>
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
                        {typeof value === 'string' ? (
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
  );
};

export default VariantModal;