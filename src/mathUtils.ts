// Замена математических функций для корректной обработки в JavaScript
export const replaceMathFunctions = (expression: string): string => {
  const mathFunctions = ['cos', 'sin', 'tan', 'acos', 'asin', 'atan', 'sqrt', 'log', 'exp', 'abs'];
  let result = expression;
  mathFunctions.forEach((func) => {
    result = result.replace(new RegExp(`\\b${func}\\b`, 'g'), `Math.${func}`);
  });
  return result.replace(/tg/g, 'Math.tan').replace(/atg/g, 'Math.atan');
};

// Численное вычисление первой производной
export const firstDerivative = (func: (x: number) => number, x: number, h: number = 0.001): number => {
  return (func(x + h) - func(x - h)) / (2 * h);
};

// Численное вычисление второй производной
export const secondDerivative = (func: (x: number) => number, x: number, h: number = 0.001): number => {
  return (func(x + h) - 2 * func(x) + func(x - h)) / (h * h);
};

// Численное вычисление четвёртой производной
export const fourthDerivative = (func: (x: number) => number, x: number, h: number = 0.001): number => {
  return (
    func(x + 2 * h) -
    4 * func(x + h) +
    6 * func(x) -
    4 * func(x - h) +
    func(x - 2 * h)
  ) / Math.pow(h, 4);
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
  if (n % 2 !== 0) n += 1; // Гарантируем чётное n
  const step = (b - a) / n;
  let sum = func(a) + func(b);
  for (let i = 1; i < n; i++) {
    const x = a + i * step;
    sum += i % 2 === 0 ? 2 * func(x) : 4 * func(x);
  }
  return (step / 3) * sum;
};

// Вычисление максимума производной на отрезке [a, b]
const findMaxDerivative = (
  func: (x: number) => number,
  a: number,
  b: number,
  derivativeFunc: (f: (x: number) => number, x: number, h?: number) => number
): number => {
  const numPoints = 1000;
  let maxDerivative = 0;
  for (let i = 0; i <= numPoints; i++) {
    const x = a + (i / numPoints) * (b - a);
    const derivativeValue = Math.abs(derivativeFunc(func, x));
    if (!isNaN(derivativeValue) && isFinite(derivativeValue)) {
      maxDerivative = Math.max(maxDerivative, derivativeValue);
    }
  }
  return maxDerivative || 1; // Возвращаем 1, если производная не определена
};

// Расчет числа разбиений по заданной точности с учётом правила Рунге
export const calculateNForPrecision = (
  func: (x: number) => number,
  a: number,
  b: number,
  precision: number,
  method: string
): number => {
  const methodFuncs: { [key: string]: (f: (x: number) => number, a: number, b: number, n: number) => number } = {
    'Левых прямоугольников': leftRectangles,
    'Правых прямоугольников': rightRectangles,
    'Средних прямоугольников': midpointRectangles,
    'Трапеций': trapezoidal,
    'Симпсона': simpson,
  };

  const methodOrders: { [key: string]: number } = {
    'Левых прямоугольников': 1,
    'Правых прямоугольников': 1,
    'Средних прямоугольников': 2,
    'Трапеций': 2,
    'Симпсона': 4,
  };

  const integrationFunc = methodFuncs[method];
  const order = methodOrders[method];

  if (!integrationFunc || !order) {
    throw new Error(`Неизвестный метод: ${method}`);
  }

  let n = method === 'Симпсона' ? 2 : 1;
  const targetError = precision; // Сравниваем |I_n - I_{2n}| напрямую с epsilon

  while (true) {
    try {
      const I_n = integrationFunc(func, a, b, n);
      const I_2n = integrationFunc(func, a, b, 2 * n);
      const errorEstimate = Math.abs(I_n - I_2n);

      console.log(`Метод: ${method}, n: ${n}, I_n: ${I_n}, I_2n: ${I_2n}, |I_n - I_{2n}|: ${errorEstimate}, Целевая погрешность: ${targetError}`);

      if (isNaN(errorEstimate) || !isFinite(errorEstimate)) {
        console.warn(`Недопустимая погрешность при n=${n}, пробуем увеличить n`);
      } else if (errorEstimate <= targetError) {
        return method === 'Симпсона' && n % 2 !== 0 ? n + 1 : n;
      }

      n = method === 'Симпсона' ? n + 2 : n + 1;
      if (n > 1e6) {
        console.error(`Достигнут максимальный предел итераций для метода ${method}`);
        return method === 'Симпсона' && n % 2 !== 0 ? n + 1 : n;
      }
    } catch (e) {
      console.warn(`Ошибка при n=${n} для метода ${method}:`, e);
      n = method === 'Симпсона' ? n + 2 : n + 1;
      if (n > 1e6) {
        console.error(`Достигнут максимальный предел итераций для метода ${method}`);
        return method === 'Симпсона' && n % 2 !== 0 ? n + 1 : n;
      }
    }
  }
};
export const calculateTheoreticalError = (
  method: string,
  func: (x: number) => number,
  a: number,
  b: number,
  n: number
): number => {
  const h = (b - a) / n;
  let M: number;

  try {
    if (method.includes('прямоугольников')) {
      if (method === 'Средних прямоугольников') {
        M = findMaxDerivative(func, a, b, secondDerivative);
        return ((b - a) * h * h * M) / 24; // Погрешность O(h^2)
      } else {
        M = findMaxDerivative(func, a, b, firstDerivative);
        return ((b - a) * h * M) / 2; // Погрешность O(h)
      }
    } else if (method === 'Трапеций') {
      M = findMaxDerivative(func, a, b, secondDerivative);
      return ((b - a) * h * h * M) / 12; // Погрешность O(h^2)
    } else if (method === 'Симпсона') {
      M = findMaxDerivative(func, a, b, fourthDerivative);
      return ((b - a) * Math.pow(h, 4) * M) / 180; // Погрешность O(h^4)
    }
  } catch (e) {
    console.warn(`Ошибка вычисления производной для метода ${method}:`, e);
    return NaN;
  }

  return NaN;
};

// Точное значение интеграла (численное с высокой точностью)
export const calculateExactIntegral = (func: (x: number) => number, a: number, b: number): number => {
  return simpson(func, a, b, 10000); // Используем метод Симпсона с большим n
};

// Остальные функции остаются без изменений
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
  while (x < xEnd - h / 2) {
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
    const k1 = f(x, y); // значение производной в начале шага
    const y_predict = y + h * k1; // предсказание методом Эйлера
    const k2 = f(x + h, y_predict); // значение производной в конце шага
    y += (h / 2) * (k1 + k2); // уточнённое значение
    x += h;
    result.push({ x, y });
  }

  return result;
};


export const koshiHalfMethod = (
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

export const calculateExactSolution = (
  f: (x: number, y: number) => number,
  x0: number,
  y0: number,
  x: number
): number => {
  const n = 1000;
  const h = (x - x0) / n;
  let sum = (f(x0, 0) + f(x, 0)) / 2;
  for (let i = 1; i < n; i++) {
    const xi = x0 + i * h;
    sum += f(xi, 0);
  }
  return y0 + h * sum;
};