import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { message } from 'antd';

interface ServerContextType {
  isServerAvailable: boolean | null;
  setServerAvailable: (available: boolean) => void;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const ServerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isServerAvailable, setIsServerAvailable] = useState<boolean | null>(null);

  const setServerAvailable = (available: boolean) => {
    if (available !== isServerAvailable) {
      setIsServerAvailable(available);
      if (!available) {
        message.error('Сервер недоступен. Пожалуйста, проверьте подключение.');
      } else {
        message.success('Соединение с сервером восстановлено.');
      }
    }
  };

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/themes', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000), // Таймаут 5 секунд
        });
        if (!response.ok) throw new Error('Сервер вернул ошибку');
        setServerAvailable(true);
      } catch (error) {
        console.error('Ошибка проверки сервера:', error);
        setServerAvailable(false);
      }
    };

    // Первоначальная проверка
    checkServer();

    // Периодическая проверка только если сервер недоступен
    let interval: NodeJS.Timeout | null = null;
    if (isServerAvailable === false) {
      interval = setInterval(checkServer, 10000); // Проверка каждые 10 секунд
    }

    return () => {
      if (interval) clearInterval(interval); // Очистка интервала при размонтировании или изменении состояния
    };
  }, [isServerAvailable]); // Зависимость от isServerAvailable

  return (
    <ServerContext.Provider value={{ isServerAvailable, setServerAvailable }}>
      {children}
    </ServerContext.Provider>
  );
};

export const useServer = () => {
  const context = useContext(ServerContext);
  if (!context) {
    throw new Error('useServer must be used within a ServerProvider');
  }
  return context;
};