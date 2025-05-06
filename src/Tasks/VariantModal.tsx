
import React, { useRef, useEffect, useState } from 'react';
import { Button, Modal, Form, InputNumber, Checkbox, Slider, Typography, Divider, message, Input } from 'antd';
import { MathJax } from 'better-react-mathjax';
import { Task, getThemeParams } from '../api';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const { Text } = Typography;

pdfMake.vfs = pdfFonts.vfs;

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
  setServerAvailable: (available: boolean) => void;
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
  setServerAvailable,
}) => {
  const [form] = Form.useForm();
  const contentRef = useRef<HTMLDivElement>(null);
  const [latexOptions, setLatexOptions] = useState<Record<string, LatexOptions>>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [editingVariant, setEditingVariant] = useState<Task | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (task && !themeParams.length) {
      const fetchThemeParams = async () => {
        try {
          const params = await getThemeParams(task.theme_id, setServerAvailable);
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
  }, [task, themeParams, setThemeParams, setServerAvailable]);

  useEffect(() => {
    if (generatedVariants.length > 0 && startTime !== null) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`Время от нажатия кнопки до отображения вариантов: ${duration.toFixed(2)}ms`);
      setStartTime(null);
    }
  }, [generatedVariants, startTime]);

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

  const validateParamBounds = (): boolean => {
    const aKey = themeParams.find((p) => p.name === 'a') ? `param_${themeParams.find((p) => p.name === 'a')!.id}` : null;
    const bKey = themeParams.find((p) => p.name === 'b') ? `param_${themeParams.find((p) => p.name === 'b')!.id}` : null;

    if (aKey && bKey && selectedParams[aKey] && selectedParams[bKey]) {
      const aSettings = paramSettings[aKey];
      const bSettings = paramSettings[bKey];

      if (aSettings.max && bSettings.min && aSettings.max >= bSettings.min) {
        message.error('Максимальное значение параметра a должно быть меньше минимального значения параметра b');
        return false;
      }
    }
    return true;
  };

  const checkLatexValidity = (expr: string, aMin: number, aMax: number, bMin: number, bMax: number): boolean => {
    try {
      const testValues = [
        aMin, aMax, bMin, bMax,
        (aMin + aMax) / 2,
        (bMin + bMax) / 2,
      ];

      for (const x of testValues) {
        let evalExpr = expr
          .replace(/\\sin/g, 'Math.sin')
          .replace(/\\cos/g, 'Math.cos')
          .replace(/\\tan/g, 'Math.tan')
          .replace(/\\ln/g, 'Math.log')
          .replace(/e\^{([^}]+)}/g, 'Math.exp($1)')
          .replace(/x/g, x.toString())
          .replace(/\^{([^}]+)}/g, '**($1)');

        if (evalExpr.includes('/')) {
          const parts = evalExpr.split('/');
          for (let i = 1; i < parts.length; i++) {
            const denominator = eval(parts[i]);
            if (Math.abs(denominator) < 1e-10) {
              console.warn(`LaTeX-выражение "${expr}" невалидно: деление на ноль при x = ${x}`);
              return false;
            }
          }
        }

        const result = eval(evalExpr);
        if (!isFinite(result)) {
          console.warn(`LaTeX-выражение "${expr}" невалидно: бесконечное или неопределенное значение при x = ${x}`);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.warn(`Ошибка проверки LaTeX-выражения "${expr}":`, error);
      return false;
    }
  };

  const generateVariants = () => {
    if (!task) {
      message.error('Задача не выбрана');
      return;
    }
    if (numVariants < 1) {
      message.error('Количество вариантов должно быть больше 0');
      return;
    }

    if (!validateParamBounds()) {
      return;
    }

    setStartTime(performance.now());

    const variants = Array.from({ length: numVariants }, (_, index) =>
      generateTaskVariant(task, index + 1)
    );
    setGeneratedVariants(variants);

    const latexExpressions = new Set<string>();
    const maxAttempts = numVariants * 10;
    let attempts = 0;

    const aKey = themeParams.find((p) => p.name === 'a') ? `param_${themeParams.find((p) => p.name === 'a')!.id}` : null;
    const bKey = themeParams.find((p) => p.name === 'b') ? `param_${themeParams.find((p) => p.name === 'b')!.id}` : null;
    const aSettings = aKey && paramSettings[aKey] ? paramSettings[aKey] : { min: 1, max: 10 };
    const bSettings = bKey && paramSettings[bKey] ? paramSettings[bKey] : { min: 1, max: 10 };

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

    const latexParamKeys = themeParams
      .filter((p) => p.type === 'latex' && selectedParams[`param_${p.id}`])
      .map((p) => `param_${p.id}`);

    while (latexExpressions.size < numVariants && attempts < maxAttempts && latexParamKeys.length > 0) {
      const paramKey = latexParamKeys[Math.floor(Math.random() * latexParamKeys.length)];
      let newExpr = generateComplexLatex(paramSettings[paramKey]?.complexity || 1, latexOptions[paramKey]);
      if (checkLatexValidity(newExpr, aSettings.min || 1, aSettings.max || 10, bSettings.min || 1, bSettings.max || 10)) {
        latexExpressions.add(newExpr);
      } else {
        console.log(`Пропущено выражение "${newExpr}" из-за невалидности в границах a=[${aSettings.min},${aSettings.max}], b=[${bSettings.min},${bSettings.max}]`);
      }
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
      const aKey = themeParams.find((p) => p.name === 'a') ? `param_${themeParams.find((p) => p.name === 'a')!.id}` : null;
      const bKey = themeParams.find((p) => p.name === 'b') ? `param_${themeParams.find((p) => p.name === 'b')!.id}` : null;

      let aValue: number | null = null;
      if (aKey && selectedParams[aKey]) {
        const settings = paramSettings[aKey] || { min: 1, max: 10 };
        aValue = Math.floor(Math.random() * ((settings.max || 10) - (settings.min || 1) + 1)) + (settings.min || 1);
        newTask.params['a'] = aValue;
      }

      if (bKey && selectedParams[bKey]) {
        const settings = paramSettings[bKey] || { min: 1, max: 10 };
        let bMin = settings.min || 1;
        if (aValue !== null && aValue >= bMin) {
          bMin = aValue + 1;
        }
        const bValue = Math.floor(Math.random() * ((settings.max || 10) - bMin + 1)) + bMin;
        newTask.params['b'] = bValue;
      }

      themeParams.forEach((param) => {
        if (param.name !== 'a' && param.name !== 'b' && selectedParams[`param_${param.id}`]) {
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

    const isTrivialPair = (left: string, right: string, operation: string): boolean => {
      if (left === right) return true;
      const leftBase = left.replace(/^-?\d*\\?/, '').replace(/\(.*\)/, '').replace(/\^{[^}]+}/, '');
      const rightBase = right.replace(/^-?\d*\\?/, '').replace(/\(.*\)/, '').replace(/\^{[^}]+}/, '');
      return leftBase === rightBase && (operation === '+' || operation === '-' || operation === '*');
    };

    const calculateXCount = (expr: string): number => {
      return (expr.match(/x/g) || []).length;
    };

    const analyzeExpression = (expr: string): { xCount: number; isTrivial: boolean } => {
      const xCount = calculateXCount(expr);
      const parts = expr.split(/\s*[\+\-\*\/]\s*/).filter(Boolean);
      const bases = parts.map(part => part.replace(/^-?\d*\\?/, '').replace(/\(.*\)/, '').replace(/\^{[^}]+}/, ''));
      const uniqueBases = new Set(bases);

      const isTrivial = uniqueBases.size < parts.length / 2;
      return { xCount, isTrivial };
    };

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
            right = generate(calculateXCount(parts[i]));
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

  const downloadPDF = () => {
    if (!generatedVariants.length) {
      message.error('Нет сгенерированных вариантов для экспорта');
      return;
    }

    console.log('Генерация PDF с использованием встроенного шрифта Roboto');

    const cardWidth = 300;
    const margin = 7;
    const columnGap = 4;

    const content = generatedVariants.map((variant, index) => {
      const sortedParams = Object.entries(variant.params || {})
        .sort(([keyA], [keyB]) => {
          const paramA = themeParams.find((p) => p.name === keyA);
          const paramB = themeParams.find((p) => p.name === keyB);
          if (paramA?.type === 'latex' && paramB?.type !== 'latex') return -1;
          if (paramA?.type !== 'latex' && paramB?.type === 'latex') return 1;
          return keyA.localeCompare(keyB);
        })
        .filter(([key]) => key !== 'name' && key !== 'theme_id')
        .map(([key, value]) => ({
          text: `${key} = ${value}`,
          font: 'Roboto',
          italics: themeParams.find((p) => p.name === key)?.type === 'latex',
          fontSize: 10,
          margin: [0, 0, 0, 4],
          break: true,
        }));

      const subtasks = variant.subtasks
        .map((subtask, subtaskIndex) => {
          const method = methods.find((m) => m.id === subtask.method_id);
          return {
            text: `${subtaskIndex + 1}) ${method ? method.description : 'Метод не найден'}`,
            font: 'Roboto',
            fontSize: 10,
            margin: [0, 0, 0, 4],
            break: true,
          };
        });

      return {
        stack: [
          { text: `Вариант ${index + 1}`, style: 'header' },
          { text: variant.description, style: 'body', break: true },
          ...sortedParams,
          ...subtasks,
        ],
        width: cardWidth,
        style: 'card',
        unbreakable: true,
      };
    });

    const rows = [];
    for (let i = 0; i < content.length; i += 2) {
      const row = {
        columns: [
          content[i],
          i + 1 < content.length ? content[i + 1] : { text: '', width: cardWidth },
        ],
        columnGap: columnGap,
        margin: [0, 0, 0, 4],
      };
      rows.push(row);
      console.log(
        `PDF: Создана строка ${i / 2 + 1} с карточками ${i + 1} и ${
          i + 2
        }, ширина столбцов: ${cardWidth}mm, зазор: ${columnGap}mm`
      );
    }

    const documentDefinition = {
      pageSize: 'A4',
      pageMargins: [margin, margin, margin, margin],
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10,
      },
      styles: {
        header: {
          fontSize: 12,
          bold: true,
          margin: [0, 0, 0, 4],
        },
        body: {
          fontSize: 10,
          margin: [0, 0, 0, 4],
        },
        card: {
          margin: [5, 5, 5, 5],
          padding: 5,
          border: {
            left: { width: 0.5, color: '#000000' },
            right: { width: 0.5, color: '#000000' },
            top: { width: 0.5, color: '#000000' },
            bottom: { width: 0.5, color: '#000000' },
          },
        },
      },
      content: rows,
    };

    pdfMake.createPdf(documentDefinition).download('variants.pdf');
  };

  const downloadWord = () => {
    if (!generatedVariants.length) {
      message.error('Нет сгенерированных вариантов для экспорта');
      return;
    }

    console.log('Генерация Word с количеством вариантов:', generatedVariants.length);

    const cardWidth = 97 * 56.7;
    const margin = 8 * 56.7;

    const createCard = (variant: Task, index: number) => {
      const sortedParams = Object.entries(variant.params || {})
        .sort(([keyA], [keyB]) => {
          const paramA = themeParams.find((p) => p.name === keyA);
          const paramB = themeParams.find((p) => p.name === keyB);
          if (paramA?.type === 'latex' && paramB?.type !== 'latex') return -1;
          if (paramA?.type !== 'latex' && paramB?.type === 'latex') return 1;
          return keyA.localeCompare(keyB);
        })
        .filter(([key]) => key !== 'name' && key !== 'theme_id')
        .map(([key, value]) => new Paragraph({
          children: [new TextRun({
            text: `${key} = ${value}`,
            font: themeParams.find((p) => p.name === key)?.type === 'latex' ? 'Cambria Math' : undefined,
            italics: themeParams.find((p) => p.name === key)?.type === 'latex',
            size: 18,
          })],
          spacing: { after: 30 },
        }));

      const subtasks = variant.subtasks.map((subtask, subtaskIndex) => {
        const method = methods.find((m) => m.id === subtask.method_id);
        return new Paragraph({
          children: [new TextRun({
            text: `${subtaskIndex + 1}) ${method ? method.description : 'Метод не найден'}`,
            size: 18,
          })],
          spacing: { after: 30 },
        });
      });

      return new Table({
        width: { size: cardWidth, type: WidthType.DXA },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1 },
                  bottom: { style: BorderStyle.SINGLE, size: 1 },
                  left: { style: BorderStyle.SINGLE, size: 1 },
                  right: { style: BorderStyle.SINGLE, size: 1 },
                },
                margins: { top: 30, bottom: 30, left: 30, right: 30 },
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: `Вариант ${index}`, bold: true, size: 22 })],
                    spacing: { after: 30 },
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: variant.description, size: 18 })],
                    spacing: { after: 30 },
                  }),
                  ...sortedParams,
                  ...subtasks,
                ],
              }),
            ],
          }),
        ],
      });
    };

    const rows = [];
    for (let i = 0; i < generatedVariants.length; i += 2) {
      const row = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
                children: [createCard(generatedVariants[i], i + 1)],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                },
                children: i + 1 < generatedVariants.length ? [createCard(generatedVariants[i + 1], i + 2)] : [],
              }),
            ],
          }),
        ],
      });
      rows.push(row);
      console.log(`Word: Создана строка ${i / 2 + 1} с карточками ${i + 1} и ${i + 2}`);
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: margin,
                right: margin,
                bottom: margin,
                left: margin,
              },
            },
          },
          children: rows,
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'variants.docx');
    });
  };

  const updateParamSettings = (paramKey: string, settings: ParamSettings) => {
    const currentSettings = paramSettings[paramKey] || {};
    const newSettings = { ...currentSettings, ...settings };

    if (newSettings.min !== undefined && newSettings.max !== undefined && newSettings.max < newSettings.min) {
      message.error('Максимальное значение не может быть меньше минимального');
      return;
    }

    setParamSettings((prev) => ({
      ...prev,
      [paramKey]: newSettings,
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

  const startEditing = (variant: Task, index: number) => {
    setEditingVariant({ ...variant });
    setEditingIndex(index);
  };

  const saveEditing = () => {
    if (editingVariant && editingIndex !== null) {
      setGeneratedVariants((prev) =>
        prev.map((v, i) => (i === editingIndex ? { ...editingVariant } : v))
      );
      setEditingVariant(null);
      setEditingIndex(null);
      message.success('Вариант успешно отредактирован');
    }
  };

  const cancelEditing = () => {
    setEditingVariant(null);
    setEditingIndex(null);
  };

  const updateEditingParam = (paramName: string, value: string | number) => {
    if (editingVariant) {
      setEditingVariant({
        ...editingVariant,
        params: {
          ...editingVariant.params,
          [paramName]: value,
        },
      });
    }
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
                              Линейные цепочки
                            </Checkbox>
                            <Checkbox
                              checked={latexOptions[paramKey]?.numbers}
                              onChange={(e) => updateLatexOptions(paramKey, 'numbers', e.target.checked)}
                            >
                              Коэффициенты
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
            <Button
              style={{ marginLeft: '16px' }}
              onClick={() => startEditing(variant, index)}
            >
              Редактировать
            </Button>
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
                    {subtaskIndex + 1}) {method ? method.description : 'Метод не найден'}
                  </Text>
                </div>
              );
            })}
            <Divider />
          </div>
        ))}
      </div>

      {editingVariant && editingIndex !== null && (
        <Modal
          title={`Редактирование варианта ${editingIndex + 1}`}
          open={true}
          onOk={saveEditing}
          onCancel={cancelEditing}
          okText="Сохранить"
          cancelText="Отмена"
        >
          <Form layout="vertical">
            {editingVariant.params &&
              Object.entries(editingVariant.params)
                .filter(([key]) => key !== 'name' && key !== 'theme_id')
                .map(([key, value]) => (
                  <Form.Item key={key} label={key}>
                    {themeParams.find((p) => p.name === key)?.type === 'latex' ? (
                      <Input
                        value={value as string}
                        onChange={(e) => updateEditingParam(key, e.target.value)}
                      />
                    ) : (
                      <InputNumber
                        value={value as number}
                        onChange={(val) => updateEditingParam(key, val || 0)}
                      />
                    )}
                  </Form.Item>
                ))}
          </Form>
        </Modal>
      )}
    </Modal>
  );
};

export default VariantModal;
