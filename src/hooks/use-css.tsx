import { useState, useEffect } from 'react';

const useCss = (filePath: string) => {
  const [cssContent, setCssContent] = useState('');

  useEffect(() => {
    const fetchCss = async () => {
      try {
        const response = await fetch(filePath);
        const text = await response.text();
        setCssContent(text);
      } catch (error) {
        console.error('Erro ao carregar o arquivo CSS:', error);
      }
    };

    fetchCss();
  }, [filePath]);

  return cssContent;
};

export default useCss;
