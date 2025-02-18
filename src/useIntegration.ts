import { useState } from 'react';

const useIntegration = () => {
  const [latex, setLatex] = useState<string>('sin(x)');
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(10);
  const [n, setN] = useState<number>(10);
  const [result, setResult] = useState<number | null>(null);
  const [functionData, setFunctionData] = useState<{ x: number; y: number }[]>([]);
  const [methodData, setMethodData] = useState<{ x: number; y: number }[]>([]);

  const replaceMathFunctions = (expression: string): string => {
    const mathFunctions = ['cos', 'sin', 'tan', 'acos', 'asin', 'atan', 'sqrt', 'log', 'exp', 'abs'];
    let result = expression;
    mathFunctions.forEach((func) => {
      result = result.replace(new RegExp(`\\b${func}\\b`, 'g'), `Math.${func}`);
    });
    return result;
  };

  const generateFunctionData = (func: (x: number) => number) => {
    const numPoints = 500; // Количество точек для точного графика
    const newFunctionData = [];
    for (let i = 0; i <= numPoints; i++) {
      const x = a + (i / numPoints) * (b - a);
      const y = func(x);
      newFunctionData.push({ x, y });
    }
    setFunctionData(newFunctionData);
  };

  return {
    latex,
    setLatex,
    a,
    setA,
    b,
    setB,
    n,
    setN,
    result,
    setResult,
    functionData,
    methodData,
    setMethodData,
    replaceMathFunctions,
    generateFunctionData,
  };
};

export default useIntegration;