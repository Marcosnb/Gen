import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Check } from 'lucide-react';

// Lista de tags sugeridas com descrições
export const suggestedTags = [
  { 
    id: 'bolo', 
    label: 'Bolo',
    description: 'Receitas, confeitaria e decoração de bolos'
  },
  { 
    id: 'amizade', 
    label: 'Amizade',
    description: 'Relacionamentos interpessoais e laços de amizade'
  },
  { 
    id: 'vida', 
    label: 'Vida',
    description: 'Experiências, reflexões e jornada pessoal'
  },
  { 
    id: 'natureza', 
    label: 'Natureza',
    description: 'Meio ambiente, flora, fauna e preservação'
  },
  { 
    id: 'namoro', 
    label: 'Namoro',
    description: 'Relacionamentos amorosos, encontros e vida a dois'
  },
  { 
    id: 'igreja', 
    label: 'Igreja',
    description: 'Comunidade religiosa, eventos e vida espiritual'
  },
  { 
    id: 'shopping', 
    label: 'Shopping',
    description: 'Centros comerciais, compras e entretenimento'
  },
  { 
    id: 'feriado', 
    label: 'Feriado',
    description: 'Datas comemorativas, folgas e planejamento de feriados'
  },
  { 
    id: 'cidade', 
    label: 'Cidade',
    description: 'Vida urbana, infraestrutura e desenvolvimento das cidades'
  },
  { 
    id: 'compra', 
    label: 'Compra',
    description: 'Dicas de compras, produtos e experiências de consumo'
  },
  { 
    id: 'praia', 
    label: 'Praia',
    description: 'Destinos litorâneos, atividades na praia e lazer'
  },
  { 
    id: 'politica', 
    label: 'Política',
    description: 'Discussões sobre política, governo e sociedade'
  },
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
    id: 'saude', 
    label: 'Saúde',
    description: 'Bem-estar físico, mental e cuidados médicos'
  },
  { 
    id: 'esporte', 
    label: 'Esporte',
    description: 'Práticas esportivas e atividades físicas'
  },
  { 
    id: 'jogos', 
    label: 'Jogos',
    description: 'Videogames, jogos de tabuleiro e entretenimento'
  },
  { 
    id: 'tecnologia', 
    label: 'Tecnologia',
    description: 'Inovações, gadgets e avanços tecnológicos'
  },
  { 
    id: 'arte', 
    label: 'Arte',
    description: 'Expressões artísticas, cultura e criatividade'
  },
  { 
    id: 'literatura', 
    label: 'Literatura',
    description: 'Livros, leitura e escrita'
  },
  { 
    id: 'psicologia', 
    label: 'Psicologia',
    description: 'Comportamento humano e saúde mental'
  },
  { 
    id: 'direito', 
    label: 'Direito',
    description: 'Questões legais e jurídicas'
  },
  { 
    id: 'meio-ambiente', 
    label: 'Meio Ambiente',
    description: 'Sustentabilidade e questões ambientais'
  },
  { 
    id: 'historia', 
    label: 'História',
    description: 'Eventos históricos e conhecimento do passado'
  },
  { 
    id: 'ciencia', 
    label: 'Ciência',
    description: 'Descobertas científicas e pesquisas'
  },
  {
    id: 'empreendedorismo',
    label: 'Empreendedorismo',
    description: 'Negócios, startups e gestão empresarial'
  },
  {
    id: 'financas-pessoais',
    label: 'Finanças Pessoais',
    description: 'Educação financeira, investimentos e planejamento'
  },
  {
    id: 'programacao',
    label: 'Programação',
    description: 'Desenvolvimento de software e códigos'
  },
  {
    id: 'idiomas',
    label: 'Idiomas',
    description: 'Aprendizado de línguas e comunicação'
  },
  {
    id: 'fotografia',
    label: 'Fotografia',
    description: 'Técnicas, equipamentos e arte fotográfica'
  },
  {
    id: 'decoracao',
    label: 'Decoração',
    description: 'Design de interiores e organização de ambientes'
  },
  {
    id: 'jardinagem',
    label: 'Jardinagem',
    description: 'Cultivo de plantas e paisagismo'
  },
  {
    id: 'gastronomia',
    label: 'Gastronomia',
    description: 'Arte culinária e experiências gastronômicas'
  },
  {
    id: 'yoga',
    label: 'Yoga',
    description: 'Práticas de yoga, meditação e bem-estar'
  },
  {
    id: 'danca',
    label: 'Dança',
    description: 'Expressão corporal e ritmos'
  },
  {
    id: 'teatro',
    label: 'Teatro',
    description: 'Artes cênicas e performances'
  },
  {
    id: 'astronomia',
    label: 'Astronomia',
    description: 'Estudo dos astros e do universo'
  },
  {
    id: 'matematica',
    label: 'Matemática',
    description: 'Números, cálculos e raciocínio lógico'
  },
  {
    id: 'fisica',
    label: 'Física',
    description: 'Estudo das leis naturais e fenômenos'
  },
  {
    id: 'quimica',
    label: 'Química',
    description: 'Estudo da matéria e suas transformações'
  },
  {
    id: 'biologia',
    label: 'Biologia',
    description: 'Estudo dos seres vivos'
  },
  {
    id: 'medicina',
    label: 'Medicina',
    description: 'Saúde, tratamentos e procedimentos médicos'
  },
  {
    id: 'nutricao',
    label: 'Nutrição',
    description: 'Alimentação saudável e dietas'
  },
  {
    id: 'musculacao',
    label: 'Musculação',
    description: 'Treino com pesos e desenvolvimento muscular'
  },
  {
    id: 'corrida',
    label: 'Corrida',
    description: 'Prática de corrida e atletismo'
  },
  {
    id: 'marketing-digital',
    label: 'Marketing Digital',
    description: 'Estratégias de marketing online e mídias sociais'
  },
  {
    id: 'meditacao',
    label: 'Meditação',
    description: 'Práticas meditativas e mindfulness'
  },
  {
    id: 'sustentabilidade',
    label: 'Sustentabilidade',
    description: 'Práticas sustentáveis e consciência ambiental'
  },
  {
    id: 'artesanato',
    label: 'Artesanato',
    description: 'Trabalhos manuais e criações artísticas'
  },
  {
    id: 'autoconhecimento',
    label: 'Autoconhecimento',
    description: 'Desenvolvimento pessoal e autodesenvolvimento'
  },
  {
    id: 'investimentos',
    label: 'Investimentos',
    description: 'Mercado financeiro e estratégias de investimento'
  },
  {
    id: 'linguas-estrangeiras',
    label: 'Línguas Estrangeiras',
    description: 'Aprendizado de idiomas e culturas'
  },
  {
    id: 'robotica',
    label: 'Robótica',
    description: 'Construção e programação de robôs'
  },
  {
    id: 'design-grafico',
    label: 'Design Gráfico',
    description: 'Criação visual e design digital'
  },
  {
    id: 'coaching',
    label: 'Coaching',
    description: 'Desenvolvimento profissional e mentoria'
  },
  {
    id: 'inteligencia-artificial',
    label: 'Inteligência Artificial',
    description: 'IA, machine learning e aplicações inteligentes'
  },
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    description: 'Uso e aplicações do ChatGPT e LLMs'
  },
  {
    id: 'machine-learning',
    label: 'Machine Learning',
    description: 'Aprendizado de máquina e modelos preditivos'
  },
  {
    id: 'deep-learning',
    label: 'Deep Learning',
    description: 'Redes neurais e aprendizado profundo'
  },
  {
    id: 'data-science',
    label: 'Data Science',
    description: 'Ciência de dados e análise de dados'
  },
  {
    id: 'startup',
    label: 'Startup',
    description: 'Criação e desenvolvimento de startups'
  },
  {
    id: 'venture-capital',
    label: 'Venture Capital',
    description: 'Investimentos em startups e financiamento'
  },
  {
    id: 'pitch',
    label: 'Pitch',
    description: 'Apresentações para investidores e vendas'
  },
  {
    id: 'mvp',
    label: 'MVP',
    description: 'Produto mínimo viável e validação'
  },
  {
    id: 'lean-startup',
    label: 'Lean Startup',
    description: 'Metodologia lean e desenvolvimento ágil'
  },
  {
    id: 'aceleradora',
    label: 'Aceleradora',
    description: 'Programas de aceleração de startups'
  },
  {
    id: 'computacao-nuvem',
    label: 'Computação em Nuvem',
    description: 'Serviços e infraestrutura em nuvem'
  },
  {
    id: 'arquitetura',
    label: 'Arquitetura',
    description: 'Projetos arquitetônicos e construção'
  },
  {
    id: 'maquiagem',
    label: 'Maquiagem',
    description: 'Técnicas e produtos de beleza'
  },
  {
    id: 'automoveis',
    label: 'Automóveis',
    description: 'Carros, motos e veículos'
  },
  {
    id: 'agricultura',
    label: 'Agricultura',
    description: 'Cultivo e produção agrícola'
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Estratégias de mercado e publicidade'
  },
  {
    id: 'mecanica',
    label: 'Mecânica',
    description: 'Manutenção e reparo de máquinas'
  },
  {
    id: 'biologia',
    label: 'Biologia',
    description: 'Estudo dos seres vivos'
  },
  {
    id: 'quimica',
    label: 'Química',
    description: 'Estudo da matéria e suas transformações'
  },
  {
    id: 'fisica',
    label: 'Física',
    description: 'Estudo das leis naturais e fenômenos'
  },
  {
    id: 'filosofia',
    label: 'Filosofia',
    description: 'Pensamento e reflexão humana'
  },
  {
    id: 'sociologia',
    label: 'Sociologia',
    description: 'Estudo da sociedade e comportamentos'
  },
  {
    id: 'geografia',
    label: 'Geografia',
    description: 'Estudo do espaço e território'
  },
  {
    id: 'arqueologia',
    label: 'Arqueologia',
    description: 'Estudo de civilizações antigas'
  },
  {
    id: 'meteorologia',
    label: 'Meteorologia',
    description: 'Estudo do clima e previsão do tempo'
  },
  {
    id: 'numismatica',
    label: 'Numismática',
    description: 'Coleção e estudo de moedas e cédulas'
  },
  {
    id: 'cafe',
    label: 'Café',
    description: 'Tipos de café, preparo e cultura cafeeira'
  },
  {
    id: 'cerveja',
    label: 'Cerveja',
    description: 'Tipos de cerveja, produção e degustação'
  },
  {
    id: 'vinho',
    label: 'Vinho',
    description: 'Vinhos, enologia e harmonização'
  },
  {
    id: 'cha',
    label: 'Chá',
    description: 'Variedades de chá e benefícios'
  },
  {
    id: 'sucos',
    label: 'Sucos',
    description: 'Bebidas naturais e smoothies'
  },
  {
    id: 'doces',
    label: 'Doces',
    description: 'Sobremesas, chocolates e confeitaria'
  },
  {
    id: 'churrasco',
    label: 'Churrasco',
    description: 'Técnicas e preparo de carnes'
  },
  {
    id: 'massas',
    label: 'Massas',
    description: 'Culinária italiana e tipos de massa'
  },
  {
    id: 'gatos',
    label: 'Gatos',
    description: 'Cuidados e comportamento felino'
  },
  {
    id: 'cachorros',
    label: 'Cachorros',
    description: 'Raças e cuidados com cães'
  },
  {
    id: 'passaros',
    label: 'Pássaros',
    description: 'Aves de estimação e silvestres'
  },
  {
    id: 'peixes',
    label: 'Peixes',
    description: 'Aquarismo e vida marinha'
  },
  {
    id: 'educacao-infantil',
    label: 'Educação Infantil',
    description: 'Desenvolvimento e aprendizagem infantil'
  },
  {
    id: 'brinquedos',
    label: 'Brinquedos',
    description: 'Jogos e brincadeiras para crianças'
  },
  {
    id: 'maternidade',
    label: 'Maternidade',
    description: 'Gravidez e cuidados com bebês'
  },
  {
    id: 'paternidade',
    label: 'Paternidade',
    description: 'Papel do pai e criação dos filhos'
  },
  {
    id: 'anime',
    label: 'Anime',
    description: 'Animação japonesa e mangás'
  },
  {
    id: 'sitcom',
    label: 'Sitcom',
    description: 'Séries de comédia e humor'
  },
  {
    id: 'drama',
    label: 'Drama',
    description: 'Séries dramáticas e novelas'
  },
  {
    id: 'documentarios',
    label: 'Documentários',
    description: 'Séries e filmes documentais'
  },
    { 
    id: 'estilo', 
    label: 'Estilo',
    description: 'Moda, tendências e expressão pessoal'
  },
  { 
    id: 'comida', 
    label: 'Comida',
    description: 'Gastronomia, culinária e experiências alimentares'
  },
  { 
    id: 'festa', 
    label: 'Festa',
    description: 'Celebrações, eventos sociais e comemorações'
  },
  { 
    id: 'diversao', 
    label: 'Diversão',
    description: 'Entretenimento, lazer e momentos divertidos'
  },
  {
  id: 'outros',
  label: 'Outros',
  description: 'Outros assuntos, assuntos gerais'
  },
  {
  id: 'academia',
  label: 'Academia',
  description: 'Espaço para treinos e atividades físicas'
  },
  {
  id: 'fitness',
  label: 'Fitness',
  description: 'Estilo de vida saudável com foco em exercícios'
  },
  {
  id: 'vegano',
  label: 'Vegano',
  description: 'Alimentação e estilo de vida sem produtos de origem animal'
  },
  {
  id: 'lanche',
  label: 'Lanche',
  description: 'Fast food, lanches rápidos e comidas práticas'
},
{
  id: 'hobby',
  label: 'Hobby',
  description: 'Passatempos, atividades recreativas e interesses pessoais'
},
{
  id: 'desenho',
  label: 'Desenho',
  description: 'Arte, ilustração e técnicas de desenho'
},
{
  id: 'sorvete',
  label: 'Sorvete',
  description: 'Sobremesas geladas, sabores e receitas de sorvete'
},
{
  id: 'aventura',
  label: 'Aventura',
  description: 'Experiências emocionantes, viagens e desafios'
},
{ 
  id: 'chocolate', 
  label: 'Chocolate',
  description: 'Delícias e receitas com chocolate'
},
{ 
  id: 'tendencia', 
  label: 'Tendência',
  description: 'Novidades, modas e tendências atuais'
},
{ 
  id: 'aviao', 
  label: 'Avião',
  description: 'Viagens aéreas, aviação e experiências'
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

// Função para normalizar texto (remover acentos e converter para minúsculo)
const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

// Função para calcular a relevância da tag
const calculateTagRelevance = (tag: Tag, searchTerm: string): number => {
  const normalizedSearch = normalizeText(searchTerm);
  const normalizedLabel = normalizeText(tag.label);
  const normalizedDesc = normalizeText(tag.description || '');

  let score = 0;

  // Correspondência exata com o label
  if (normalizedLabel === normalizedSearch) score += 100;
  // Label começa com o termo de busca
  if (normalizedLabel.startsWith(normalizedSearch)) score += 50;
  // Label contém o termo de busca
  if (normalizedLabel.includes(normalizedSearch)) score += 25;
  // Descrição contém o termo de busca
  if (normalizedDesc.includes(normalizedSearch)) score += 10;

  return score;
};

// Função para embaralhar array
const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Função para agrupar tags por categoria
const tagCategories: { [key: string]: string[] } = {
  'relacionamentos': ['namoro', 'casamento', 'familia', 'sexo'],
  'lazer': ['shopping', 'praia', 'cinema', 'viagem'],
  'sociedade': ['politica', 'cidade', 'economia'],
  'religiao': ['igreja', 'religiao'],
  'tempo': ['feriado', 'ferias'],
  'consumo': ['compra', 'moda', 'beleza'],
  'saude': ['alimentacao', 'esporte', 'saude'],
};

// Função para obter tags relacionadas baseadas nas seleções atuais
const getContextualTags = (currentTags: Tag[]): Tag[] => {
  if (currentTags.length === 0) {
    // Se não há tags selecionadas, retorna tags aleatórias
    return shuffleArray(suggestedTags).slice(0, 5);
  }

  // Encontra as categorias das tags selecionadas
  const selectedCategories = new Set<string>();
  currentTags.forEach(tag => {
    Object.entries(tagCategories).forEach(([category, tags]) => {
      if (tags.includes(tag.id)) {
        selectedCategories.add(category);
      }
    });
  });

  // Coleta tags relacionadas das categorias selecionadas
  const relatedTagIds = new Set<string>();
  selectedCategories.forEach(category => {
    tagCategories[category].forEach(tagId => {
      if (!currentTags.some(t => t.id === tagId)) {
        relatedTagIds.add(tagId);
      }
    });
  });

  // Filtra e embaralha as tags relacionadas
  const relatedTags = suggestedTags
    .filter(tag => relatedTagIds.has(tag.id))
    .filter(tag => !currentTags.some(t => t.id === tag.id));
  
  return shuffleArray(relatedTags).slice(0, 5);
};

export function TagInput({ selectedTags, onChange, maxTags = 5 }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [randomizedTags, setRandomizedTags] = useState<Tag[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Atualiza as tags sugeridas quando o dropdown é aberto
  useEffect(() => {
    if (isOpen) {
      const contextualTags = getContextualTags(selectedTags);
      setRandomizedTags(contextualTags);
    }
  }, [isOpen, selectedTags]);

  // Filtrar e ordenar tags sugeridas
  const filteredTags = useMemo(() => {
    if (!inputValue.trim()) {
      // Se não houver input, mostrar tags contextuais
      return randomizedTags;
    }

    // Filtrar e ordenar por relevância
    return suggestedTags
      .filter(tag => !selectedTags.some(selected => selected.id === tag.id))
      .map(tag => ({
        tag,
        relevance: calculateTagRelevance(tag, inputValue)
      }))
      .filter(({ relevance }) => relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .map(({ tag }) => tag)
      .slice(0, 5);
  }, [inputValue, selectedTags, randomizedTags]);

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
      <div className="flex flex-wrap gap-2 p-2 min-h-[56px] bg-background border border-input rounded-lg focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        {/* Tags selecionadas */}
        {selectedTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-sm"
          >
            {tag.label}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        
        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === maxTags ? "Limite de tags atingido" : "Digite para buscar tags..."}
          disabled={selectedTags.length === maxTags}
          className="flex-1 min-h-[40px] bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
      </div>

      {/* Dropdown de sugestões */}
      {isOpen && filteredTags.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 py-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
        >
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b border-border">
            {selectedTags.length}/{maxTags} tags selecionadas
          </div>
          
          {filteredTags.map((tag, index) => (
            <button
              key={tag.id}
              onClick={() => addTag(tag)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full flex items-start gap-3 px-3 py-2 text-sm transition-colors ${
                index === highlightedIndex ? 'bg-muted' : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex-1 text-left">
                <div className="font-medium">{tag.label}</div>
                <div className="text-xs text-muted-foreground">{tag.description}</div>
              </div>
              {index === highlightedIndex && (
                <Check className="h-4 w-4 text-primary mt-1" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Mensagem de limite */}
      {selectedTags.length === maxTags && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Você atingiu o limite máximo de {maxTags} tags
        </p>
      )}
    </div>
  );
}
