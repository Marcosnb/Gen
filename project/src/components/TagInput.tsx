import React, { useState, useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';

// Lista de tags sugeridas com descrições
const suggestedTags = [
  { 
    id: 'alimentacao', 
    label: 'Alimentação',
    description: 'Culinária, receitas, restaurantes e hábitos alimentares'
  },
  { 
    id: 'cinema', 
    label: 'Cinema',
    description: 'Filmes, séries, documentários e entretenimento audiovisual'
  },
  { 
    id: 'religiao', 
    label: 'Religião',
    description: 'Fé, espiritualidade e práticas religiosas'
  },
  { 
    id: 'sexo', 
    label: 'Sexo',
    description: 'Relacionamento íntimo, sexualidade e saúde sexual'
  },
  { 
    id: 'familia', 
    label: 'Família',
    description: 'Relações familiares, parentalidade e convivência'
  },
  { 
    id: 'casamento', 
    label: 'Casamento',
    description: 'Relacionamento conjugal, união estável e vida a dois'
  },
  { 
    id: 'viagem', 
    label: 'Viagem',
    description: 'Turismo, destinos, dicas de viagem e experiências'
  },
  { 
    id: 'moda', 
    label: 'Moda',
    description: 'Tendências, estilo, roupas e acessórios'
  },
  { 
    id: 'beleza', 
    label: 'Beleza',
    description: 'Cuidados pessoais, cosméticos e bem-estar'
  },
  { 
    id: 'futebol', 
    label: 'Futebol',
    description: 'Times, campeonatos, jogadores e partidas'
  },
  { 
    id: 'tv', 
    label: 'Televisão',
    description: 'Programas de TV, novelas e entretenimento televisivo'
  },
  { 
    id: 'musica', 
    label: 'Música',
    description: 'Artistas, shows, gêneros musicais e lançamentos'
  },
  { 
    id: 'economia', 
    label: 'Economia',
    description: 'Finanças, investimentos e mercado financeiro'
  },
  { 
    id: 'escola', 
    label: 'Escola',
    description: 'Educação básica, ensino e aprendizagem'
  },
  { 
    id: 'faculdade', 
    label: 'Faculdade',
    description: 'Ensino superior, universidade e vida acadêmica'
  },
  { 
    id: 'trabalho', 
    label: 'Trabalho',
    description: 'Carreira, emprego e vida profissional'
  },
  { 
    id: 'politica', 
    label: 'Política',
    description: 'Governo, eleições e questões políticas'
  },
  { 
    id: 'animais', 
    label: 'Animais',
    description: 'Pets, animais de estimação e vida selvagem'
  },
  { 
    id: 'internet', 
    label: 'Internet',
    description: 'Tecnologia e mundo digital'
  },
  { 
    id: 'compras', 
    label: 'Compras',
    description: 'Consumo, produtos, lojas e ofertas'
  },
  { 
    id: 'festa', 
    label: 'Festa',
    description: 'Eventos sociais, celebrações e comemorações'
  },
  // Novas tags
  { 
    id: 'jogos', 
    label: 'Jogos',
    description: 'Videogames, jogos de tabuleiro e entretenimento interativo'
  },
  { 
    id: 'signo', 
    label: 'Signo',
    description: 'Astrologia, horóscopo e influências astrais'
  },
  { 
    id: 'tempo', 
    label: 'Tempo',
    description: 'Clima, previsão do tempo e meteorologia'
  },
  { 
    id: 'redesocial', 
    label: 'Rede Social',
    description: 'Facebook, Instagram, Twitter e outras redes sociais'
  },
  { 
    id: 'outro', 
    label: 'Outro',
    description: 'Outros assuntos não listados nas categorias anteriores'
  }
];

interface Tag {
  id: string;
  label: string;
  description?: string;
}

interface TagInputProps {
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
  maxTags?: number;
}

export function TagInput({ selectedTags, onChange, maxTags = 5 }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar tags sugeridas baseado no input e remover as já selecionadas
  const filteredTags = suggestedTags
    .filter(tag => 
      tag.label.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedTags.some(selected => selected.id === tag.id)
    )
    .slice(0, 5); // Limitar a 5 sugestões

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  const addTag = (tag: Tag) => {
    if (selectedTags.length < maxTags) {
      onChange([...selectedTags, tag]);
      setInputValue('');
      setIsOpen(false);
      inputRef.current?.focus();
    }
  };

  const removeTag = (tagToRemove: Tag) => {
    onChange(selectedTags.filter(tag => tag.id !== tagToRemove.id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredTags.length > 0 && isOpen) {
      e.preventDefault();
      addTag(filteredTags[highlightedIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => 
        i < filteredTags.length - 1 ? i + 1 : i
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => (i > 0 ? i - 1 : 0));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 min-h-[42px] rounded-md border border-input bg-background">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
          >
            {tag.label}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-primary/80"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none p-0.5 text-sm"
          placeholder={selectedTags.length < maxTags ? "Digite para adicionar tags..." : "Limite de tags atingido"}
          disabled={selectedTags.length >= maxTags}
        />
      </div>

      {/* Dropdown de sugestões */}
      {isOpen && filteredTags.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 py-1 bg-background border border-border rounded-lg shadow-lg divide-y divide-border"
        >
          {filteredTags.map((tag, index) => (
            <button
              key={tag.id}
              onClick={() => addTag(tag)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors ${
                index === highlightedIndex ? 'bg-muted' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{tag.label}</span>
                {index === highlightedIndex && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              {tag.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {tag.description}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
