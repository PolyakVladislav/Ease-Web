export const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    return d.toLocaleString();
  };
  
  // Другие утилиты для работы с временем, если понадобятся.
  