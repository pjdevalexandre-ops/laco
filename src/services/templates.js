// Registro de Estilos Visuais e Temas de Convite — LAÇO

export const THEME_PRESETS = [
  {
    id: 'editorial_botanical',
    name: 'Editorial & Botânico',
    subtitle: 'Ideal para casamentos, bodas e jantares intimistas',
    primaryColor: '#722F37', // Vinho queimado
    secondaryColor: '#EFE9DF', // Areia
    accentColor: '#C69F54', // Dourado
    bgColor: '#FAF7F2', // Papel marfim
    borderStyle: 'invite-border-editorial',
    fontHeading: 'DM Serif Display, serif',
    badge: 'Mais Escolhido',
    illustration: 'botanical',
    description: 'Composição clássica com diagramação editorial, monogramas finos e inspiração botânica refinada.',
  },
  {
    id: 'playful_safari',
    name: 'Lúdico & Aconchegante',
    subtitle: 'Perfeito para aniversários infantis e chás de bebê',
    primaryColor: '#4E6037', // Verde oliva
    secondaryColor: '#E8DFC8', // Bege suave
    accentColor: '#D8A49B', // Rosa antigo
    bgColor: '#FAF9F5',
    borderStyle: 'invite-border-olive',
    fontHeading: 'DM Sans, sans-serif',
    badge: 'Infantil / Família',
    illustration: 'stars',
    description: 'Cores suaves da natureza com elementos lúdicos, acolhedor e visualmente leve para celebrar os pequenos.',
  },
  {
    id: 'classic_luxury',
    name: 'Clássico & Minimalista',
    subtitle: 'Formaturas, aniversários adultos e confraternizações',
    primaryColor: '#2B3342', // Azul petróleo profundo
    secondaryColor: '#E2E6EC',
    accentColor: '#BCA371', // Ouro antigo
    bgColor: '#FDFCF9',
    borderStyle: 'invite-border-gold',
    fontHeading: 'DM Serif Display, serif',
    badge: 'Contemporâneo',
    illustration: 'geometric',
    description: 'Linhas puras, tipografia marcante e espaçamento generoso para celebrações elegantes.',
  },
  {
    id: 'rose_romantic',
    name: 'Romântico & Floral',
    subtitle: 'Chás de panela, debutantes e celebrações femininas',
    primaryColor: '#8C4351', // Rosé marsala
    secondaryColor: '#F5ECE8',
    accentColor: '#C69F54',
    bgColor: '#FCF9F7',
    borderStyle: 'invite-border-editorial',
    fontHeading: 'DM Serif Display, serif',
    badge: 'Romântico',
    illustration: 'floral',
    description: 'Tons de rosa antigo, delicadeza e afeto em cada detalhe gráfico.',
  }
];

export const EVENT_TYPES = [
  { id: 'casamento', label: 'Casamento / Noivado', defaultPreset: 'editorial_botanical' },
  { id: 'infantil', label: 'Aniversário Infantil', defaultPreset: 'playful_safari' },
  { id: 'aniversario', label: 'Aniversário Adulto', defaultPreset: 'classic_luxury' },
  { id: 'bodas', label: 'Bodas & Renovações', defaultPreset: 'editorial_botanical' },
  { id: 'cha_bebe', label: 'Chá de Bebê / Revelação', defaultPreset: 'playful_safari' },
  { id: 'batizado', label: 'Batizado / Religioso', defaultPreset: 'editorial_botanical' },
  { id: 'formatura', label: 'Formatura', defaultPreset: 'classic_luxury' },
  { id: 'confraternizacao', label: 'Confraternização / Evento', defaultPreset: 'classic_luxury' },
  { id: 'outro', label: 'Outro Evento Especial', defaultPreset: 'editorial_botanical' },
];
