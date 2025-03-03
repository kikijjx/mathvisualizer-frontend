export const replaceMathFunctions = (expression: string): string => {
    const mathFunctions = ['cos', 'sin', 'tan', 'acos', 'asin', 'atan', 'sqrt', 'log', 'exp', 'abs'];
    let result = expression;
    mathFunctions.forEach((func) => {
      result = result.replace(new RegExp(`\\b${func}\\b`, 'g'), `Math.${func}`);
    });
    return result;
  };

// Функция для вычисления первой производной численно
export const firstDerivative = (func: (x: number) => number, x: number, h: number = 0.001): number => {
  return (func(x + h) - func(x - h)) / (2 * h);
};

// Функция для вычисления второй производной численно
export const secondDerivative = (func: (x: number) => number, x: number, h: number = 0.001): number => {
  return (func(x + h) - 2 * func(x) + func(x - h)) / (h * h);
};

// Функция для вычисления четвертой производной численно
export const fourthDerivative = (func: (x: number) => number, x: number, h: number = 0.001): number => {
  return (func(x + 2 * h) - 4 * func(x + h) + 6 * func(x) - 4 * func(x - h) + func(x - 2 * h)) / Math.pow(h, 4);
};

// Метод левых прямоугольников
export const leftRectangles = (func: (x: number) => number, a: number, b: number, n: number): number => {
  const step = (b - a) / n;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const x = a + i * step;
    sum += func(x);
  }
  return sum * step;
};

// Метод правых прямоугольников
export const rightRectangles = (func: (x: number) => number, a: number, b: number, n: number): number => {
  const step = (b - a) / n;
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    const x = a + i * step;
    sum += func(x);
  }
  return sum * step;
};

// Метод средних прямоугольников
export const midpointRectangles = (func: (x: number) => number, a: number, b: number, n: number): number => {
  const step = (b - a) / n;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const x = a + (i + 0.5) * step;
    sum += func(x);
  }
  return sum * step;
};

// Метод трапеций
export const trapezoidal = (func: (x: number) => number, a: number, b: number, n: number): number => {
  const step = (b - a) / n;
  let sum = (func(a) + func(b)) / 2;
  for (let i = 1; i < n; i++) {
    const x = a + i * step;
    sum += func(x);
  }
  return sum * step;
};

// Метод Симпсона
export const simpson = (func: (x: number) => number, a: number, b: number, n: number): number => {
  const step = (b - a) / n;
  let sum = func(a) + func(b);
  for (let i = 1; i < n; i++) {
    const x = a + i * step;
    sum += i % 2 === 0 ? 2 * func(x) : 4 * func(x);
  }
  return (step / 3) * sum;
};

// Функция для вычисления теоретической погрешности
export const calculateTheoreticalError = (method: string, func: (x: number) => number, a: number, b: number, n: number): number => {
  const h = (b - a) / n;

  if (method.includes('прямоугольников')) {
    return (1 / 2) * (b - a) * h;
  } else if (method === 'Трапеций') {
    return (-1 / 12) * (b - a) * Math.pow(h, 2);
  } else if (method === 'Симпсона') {
    return (-1 / 180) * (b - a) * Math.pow(h, 4);
  }
  return 0;
};

// Функция для вычисления точного значения интеграла (аналитически)
export const calculateExactIntegral = (a: number, b: number): number => {
  return -Math.cos(b) + Math.cos(a);
};