import {
  CapacityVariant,
  CustomerReview,
  ProductImage,
  TechSpecItem,
  VoltageType,
  WarrantyOption,
} from '../types/store';

export const PRODUCT_IMAGES: ProductImage[] = [
  {
    id: 'gree-official-set',
    src: '/assets/gree/extra_3.jpg',
    alt: 'Ar-Condicionado Split Gree G-Top Auto Inverter Frio GWC09ATA-D6DNA1AB Conjunto Completo com Controle',
    label: 'Conjunto Completo Gree Inverter',
  },
  {
    id: 'gree-evap-cond',
    src: '/assets/gree/extra_4.jpg',
    alt: 'Evaporadora e Condensadora Serpentina em Cobre GoldenFin R-32 Gree',
    label: 'Evaporadora + Condensadora Cobre R-32',
  },
  {
    id: 'gree-evap-front',
    src: '/assets/gree/02_evaporadora.jpg',
    alt: 'Unidade Interna Evaporadora Gree G-Top Auto Inverter Vista Frontal',
    label: 'Unidade Interna (Evaporadora)',
  },
  {
    id: 'gree-evap-angle-right',
    src: '/assets/gree/kit_6.jpg',
    alt: 'Evaporadora Gree Split Hi-Wall Perfil Lateral Direito',
    label: 'Perfil Lateral Direito',
  },
  {
    id: 'gree-evap-angle-left',
    src: '/assets/gree/kit_7.jpg',
    alt: 'Evaporadora Gree Split Hi-Wall Perfil Lateral Esquerdo',
    label: 'Perfil Lateral Esquerdo',
  },
  {
    id: 'gree-remote',
    src: '/assets/gree/03_controle.jpg',
    alt: 'Controle Remoto Sem Fio Oficial Gree com Display Digital e Função Turbo',
    label: 'Controle Remoto Oficial Gree',
  },
  {
    id: 'gree-room-lifestyle',
    src: '/assets/gree/05_residencial.jpg',
    alt: 'Ar-Condicionado Split Gree G-Top Auto Inverter instalado na sala',
    label: 'Ambientação Residencial',
  },
  {
    id: 'gree-dimensions',
    src: '/assets/gree/06_dimensoes.jpg',
    alt: 'Medidas oficiais da Evaporadora e Condensadora Gree G-Top Auto Inverter',
    label: 'Medidas e Dimensões Oficiais',
  },
];

export const CAPACITY_VARIANTS: CapacityVariant[] = [
  {
    btus: '9.000 BTUs',
    sku: '241051200',
    model: 'GWC09ATA-D6DNA1AB',
    originalPrice: 2299.0,
    cardPrice: 1888.9,
    pixPrice: 1700.0,
    pixDiscountPercent: 10,
    recommendedArea: 'Até 15 m²',
  },
  {
    btus: '12.000 BTUs',
    sku: '241051300',
    model: 'GWC12ATA-D6DNA1B',
    originalPrice: 2699.0,
    cardPrice: 2222.2,
    pixPrice: 2000.0,
    pixDiscountPercent: 10,
    recommendedArea: 'Até 20 m²',
  },
  {
    btus: '18.000 BTUs',
    sku: '241051400',
    model: 'GWC18ATD-D6DNA1B',
    originalPrice: 3699.0,
    cardPrice: 3100.0,
    pixPrice: 2790.0,
    pixDiscountPercent: 10,
    recommendedArea: 'Até 30 m²',
  },
  {
    btus: '24.000 BTUs',
    sku: '241051500',
    model: 'GWC24ATE-D6DNA1B',
    originalPrice: 4499.0,
    cardPrice: 3877.8,
    pixPrice: 3490.0,
    pixDiscountPercent: 10,
    recommendedArea: 'Até 40 m²',
  },
];

export const WARRANTY_OPTIONS: WarrantyOption[] = [
  {
    id: 'none',
    label: 'Sem garantia estendida adicional',
    months: 0,
    price: 0,
    description: 'Mantém apenas a garantia original de fábrica da Gree',
  },
  {
    id: '12m',
    label: '+ 12 meses de Garantia Estendida Magalu',
    months: 12,
    price: 149.9,
    description: 'Cobertura total contra defeitos elétricos e mecânicos com assistência domiciliar',
  },
  {
    id: '24m',
    label: '+ 24 meses de Garantia Estendida Magalu',
    months: 24,
    price: 239.9,
    description: 'Proteção ampliada por mais 2 anos com reparo original ou troca garantida',
  },
];

export function getTechSpecs(
  variant: CapacityVariant,
  voltage: VoltageType
): TechSpecItem[] {
  return [
    { label: 'Marca', value: 'Gree' },
    { label: 'Referência / Modelo', value: variant.model },
    { label: 'Código do Produto (Magalu)', value: variant.sku },
    { label: 'Linha', value: 'G-Top Auto Inverter Connection' },
    { label: 'Tipo de Ar-Condicionado', value: 'Split Hi-Wall' },
    { label: 'Capacidade de Refrigeração', value: variant.btus },
    { label: 'Ciclo', value: 'Frio' },
    { label: 'Tecnologia do Compressor', value: 'Inverter (Alta Eficiência e Baixo Ruído)' },
    {
      label: 'Voltagem Selecionada',
      value: voltage === '110V' ? '110V / 127V (Monofásico)' : '220V (Monofásico)',
    },
    { label: 'Gás Refrigerante', value: 'R-32 Ecológico (Maior performance térmica)' },
    {
      label: 'Conectividade Inteligente',
      value: 'Wi-Fi e Bluetooth integrados (App Gree+, Google Home e Alexa)',
    },
    {
      label: 'Material da Serpentina',
      value: 'Tubos 100% em Cobre com proteção anticorrosão GoldenFin',
    },
    {
      label: 'Velocidades de Ventilação',
      value: '7 velocidades (incluindo Silencioso e Turbo Fast Cooling)',
    },
    { label: 'Vazão de Ar', value: '520 m³/h' },
    { label: 'Nível de Ruído (Unid. Interna)', value: '25 dB(A) mínimo / 38 dB(A) máximo' },
    {
      label: 'Funções Especiais',
      value: 'iFeel, Auto Fast Cooling, Modo Sono (Sleep), Timer 24h, Auto Limpeza (X-Fan), Autodiagnóstico, Reinício Automático',
    },
    {
      label: 'Sistema de Filtragem',
      value: 'Filtro tela superior lavável de alta densidade + Tripla proteção antibacteriana',
    },
    {
      label: 'Display na Evaporadora',
      value: 'LED invisível embutido no painel frontal (com opção de desligar à noite)',
    },
    { label: 'Área Recomendada', value: variant.recommendedArea },
    { label: 'Consumo Aproximado de Energia', value: '16,8 kWh/mês (norma INMETRO)' },
    { label: 'Cor', value: 'Branco' },
    { label: 'Dimensões da Evaporadora (L x A x P)', value: '70,8 x 26,0 x 18,5 cm' },
    { label: 'Peso da Evaporadora', value: '7,5 kg' },
    { label: 'Dimensões da Condensadora (L x A x P)', value: '42,5 x 54,5 x 42,0 cm (Descarga Vertical)' },
    { label: 'Peso da Condensadora', value: '18,5 kg' },
    {
      label: 'Garantia do Fabricante',
      value: '10 anos no compressor e 5 anos nas demais peças (instalado com credenciado Gree)',
    },
    {
      label: 'Conteúdo da Embalagem',
      value: '01 Unidade Interna (Evaporadora), 01 Unidade Externa (Condensadora GoldenFin R-32), 01 Controle Remoto sem fio Gree, 02 Pilhas AAA, Manual e Certificado de Garantia',
    },
  ];
}

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    author: 'Carlos Eduardo Mendes',
    cityUf: 'Ribeirão Preto, SP',
    rating: 5,
    date: 'Há 3 dias',
    title: 'Gela super rápido e não faz barulho nenhum!',
    comment:
      'Comprei para o quarto de casal (13m²) e superou qualquer expectativa. Em menos de 5 minutos no modo Fast Cooling o quarto já fica geladinho. O Wi-Fi conectou de primeira na Alexa e consigo ligar antes de chegar do trabalho. Entrega do Magalu chegou 2 dias antes do prazo!',
    recommends: true,
    helpfulCount: 34,
    verifiedPurchase: true,
  },
  {
    id: 'rev-2',
    author: 'Fernanda Oliveira Souza',
    cityUf: 'Belo Horizonte, MG',
    rating: 5,
    date: 'Há 1 semana',
    title: 'Econômico de verdade e construção impecável da Gree',
    comment:
      'Meu instalador elogiou demais esse modelo GWC09ATA-D6DNA1AB, disse que a serpentina toda em cobre GoldenFin e o gás R-32 dão durabilidade muito superior. A conta de luz quase não subiu mesmo usando todas as noites no modo Sleep.',
    recommends: true,
    helpfulCount: 27,
    verifiedPurchase: true,
  },
  {
    id: 'rev-3',
    author: 'Marcos Vinícius Rocha',
    cityUf: 'Curitiba, PR',
    rating: 5,
    date: 'Há 2 semanas',
    title: 'Melhor custo-benefício Inverter 9.000 BTUs',
    comment:
      'Pesquisei bastante entre várias marcas e escolhi a Gree pelos 10 anos de garantia no compressor e Wi-Fi já integrado sem precisar comprar kit separado. Aparelho muito bonito, compacto e silencioso tanto na evaporadora quanto na condensadora.',
    recommends: true,
    helpfulCount: 19,
    verifiedPurchase: true,
  },
  {
    id: 'rev-4',
    author: 'Patrícia Lima Cavalcanti',
    cityUf: 'Recife, PE',
    rating: 4,
    date: 'Há 3 semanas',
    title: 'Excelente aparelho e proteção contra maresia',
    comment:
      'Aqui em Recife a maresia costuma estragar ar-condicionado rápido, por isso peguei esse Gree com proteção anticorrosão GoldenFin nas aletas. Está gelando perfeitamente meu home office o dia inteiro. Recomendo muito comprar direto vendido e entregue pelo Magalu.',
    recommends: true,
    helpfulCount: 14,
    verifiedPurchase: true,
  },
];

export interface RelatedProduct {
  id: string;
  sku: string;
  title: string;
  image: string;
  rating: number;
  reviews: number;
  oldPrice: number;
  pixPrice: number;
  installmentText: string;
}

export const RELATED_PRODUCTS: RelatedProduct[] = [
  {
    id: 'rel-1',
    sku: '241051300',
    title: 'Ar-Condicionado Split 12.000 BTUs Gree Inverter Frio GWC12ATA-D6DNA1B Wi-Fi',
    image: '/assets/gree/extra_3.jpg',
    rating: 4.9,
    reviews: 312,
    oldPrice: 2699.0,
    pixPrice: 2000.0,
    installmentText: '10x de R$ 222,22 sem juros',
  },
  {
    id: 'rel-2',
    sku: '238849100',
    title: 'Ar-Condicionado Split 9.000 BTUs Gree G-Top Auto Inverter Quente e Frio',
    image: '/assets/gree/extra_4.jpg',
    rating: 4.8,
    reviews: 189,
    oldPrice: 2399.0,
    pixPrice: 1849.0,
    installmentText: '10x de R$ 205,44 sem juros',
  },
  {
    id: 'rel-3',
    sku: '241051400',
    title: 'Ar-Condicionado Split 18.000 BTUs Gree G-Top Auto Inverter Frio R-32 Wi-Fi',
    image: '/assets/gree/05_residencial.jpg',
    rating: 4.9,
    reviews: 154,
    oldPrice: 3699.0,
    pixPrice: 2790.0,
    installmentText: '10x de R$ 310,00 sem juros',
  },
  {
    id: 'rel-4',
    sku: '235190800',
    title: 'Kit Instalação para Ar-Condicionado Split 9.000 e 12.000 BTUs Tubulação Cobre 3m',
    image: '/assets/gree/02_evaporadora.jpg',
    rating: 4.7,
    reviews: 96,
    oldPrice: 349.0,
    pixPrice: 269.0,
    installmentText: '6x de R$ 49,83 sem juros',
  },
];

export function buildInstallments(totalCardPrice: number, maxInstallments: number) {
  const rows = [];
  for (let i = 1; i <= maxInstallments; i++) {
    const hasInterest = i > 10 && maxInstallments === 12;
    const total = hasInterest ? totalCardPrice * Math.pow(1.0199, i - 10) : totalCardPrice;
    const perMonth = total / i;
    rows.push({
      count: i,
      perMonth,
      total,
      interestFree: !hasInterest,
    });
  }
  return rows;
}
