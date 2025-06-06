import { useState, useEffect } from 'react';
import path from 'path';
import fs from 'fs';

const useStyle = (filePath: string) => {
  const [cssContent, setCssContent] = useState('');

  useEffect(() => {
    const fetchCss = async () => {
      try {
        const absolutePath = path.resolve(filePath);
        const content = fs.readFileSync(absolutePath, 'utf8');
        setCssContent(content);
      } catch (error) {
        console.error('Erro ao ler o arquivo CSS:', error);
      }
    };

    fetchCss();
  }, [filePath]);

  return cssContent;
};

export default useStyle;
