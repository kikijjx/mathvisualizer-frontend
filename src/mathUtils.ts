export const replaceMathFunctions = (expression: string): string => {
    const mathFunctions = ['cos', 'sin', 'tg', 'acos', 'asin', 'atg', 'sqrt', 'log', 'exp', 'abs'];
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

export const calculateNForPrecision = (
  func: (x: number) => number,
  a: number,
  b: number,
  precision: number,
  method: string
): number => {
  // Находим максимум производной на отрезке [a, b]
  const numPoints = 100;
  let maxDerivative = 0;
  for (let i = 0; i <= numPoints; i++) {
    const x = a + (i / numPoints) * (b - a);
    let derivative;
    if (method.includes('прямоугольников')) {
      derivative = Math.abs(firstDerivative(func, x));
    } else if (method === 'Трапеций') {
      derivative = Math.abs(secondDerivative(func, x));
    } else if (method === 'Симпсона') {
      derivative = Math.abs(fourthDerivative(func, x));
    } else {
      derivative = 0;
    }
    maxDerivative = Math.max(maxDerivative, derivative);
  }

  let n = 1;
  if (method.includes('прямоугольников')) {
    // Погрешность: ((b - a) * h * M1) / 2 <= precision, где h = (b - a) / n
    n = Math.ceil(((b - a) * (b - a) * maxDerivative) / (2 * precision));
  } else if (method === 'Трапеций') {
    // Погрешность: ((b - a) * h^2 * M2) / 12 <= precision
    n = Math.ceil(Math.sqrt(((b - a) * (b - a) * (b - a) * maxDerivative) / (12 * precision)));
  } else if (method === 'Симпсона') {
    // Погрешность: ((b - a) * h^4 * M4) / 180 <= precision
    n = Math.ceil(Math.pow(((b - a) * (b - a) * (b - a) * (b - a) * maxDerivative) / (180 * precision), 1 / 4));
  }
  return Math.max(n, 1); // Убедимся, что n >= 1
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

export const eulerMethod = (
  f: (x: number, y: number) => number,
  x0: number,
  y0: number,
  xEnd: number,
  h: number
): { x: number; y: number }[] => {
  const result = [{ x: x0, y: y0 }];
  let x = x0;
  let y = y0;
  while (x < xEnd - h / 2) { // Учитываем погрешность округления
    y += h * f(x, y);
    x += h;
    result.push({ x, y });
  }
  return result;
};

export const koshiMethod = (
  f: (x: number, y: number) => number,
  x0: number,
  y0: number,
  xEnd: number,
  h: number
): { x: number; y: number }[] => {
  const result = [{ x: x0, y: y0 }];
  let x = x0;
  let y = y0;
  while (x < xEnd - h / 2) {
    const k1 = f(x, y);
    y += h * f(x + h / 2, y + (h / 2) * k1);
    x += h;
    result.push({ x, y });
  }
  return result;
};

// Метод Рунге-Кутты 4-го порядка
export const rungeKutta4Method = (
  f: (x: number, y: number) => number,
  x0: number,
  y0: number,
  xEnd: number,
  h: number
): { x: number; y: number }[] => {
  const result = [{ x: x0, y: y0 }];
  let x = x0;
  let y = y0;
  while (x < xEnd - h / 2) {
    const k1 = f(x, y);
    const k2 = f(x + h / 2, y + (h / 2) * k1);
    const k3 = f(x + h / 2, y + (h / 2) * k2);
    const k4 = f(x + h, y + h * k3);
    y += (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    x += h;
    result.push({ x, y });
  }
  return result;
};

export const isIndependentOfY = (f: (x: number, y: number) => number, x: number, y: number): boolean => {
  try {
    return Math.abs(f(x, y) - f(x, y + 1e-6)) < 1e-10;
  } catch {
    return false;
  }
};

// Вычисление точного решения (численное интегрирование)
export const calculateExactSolution = (
  f: (x: number, y: number) => number,
  x0: number,
  y0: number,
  x: number
): number => {
  // Используем метод трапеций для численного интегрирования f(x, 0) от x0 до x
  const n = 1000;
  const h = (x - x0) / n;
  let sum = (f(x0, 0) + f(x, 0)) / 2;
  for (let i = 1; i < n; i++) {
    const xi = x0 + i * h;
    sum += f(xi, 0);
  }
  return y0 + h * sum;
};