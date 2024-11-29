import React from 'react';

interface FormattedTextProps {
  text: string;
}

export function FormattedText({ text }: FormattedTextProps) {
  // Divide o texto em partes, separando as menções
  const parts = text.split(/(@\w+)/g);

  return (
    <span>
      {parts.map((part, index) => {
        // Se a parte começa com @, é uma menção
        if (part.startsWith('@')) {
          return (
            <span key={index} className="text-blue-500 font-medium">
              {part}
            </span>
          );
        }
        // Caso contrário, é texto normal
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
