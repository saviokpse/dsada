import { ShippingOption, ViaCepAddress } from '../types/store';

export function formatCep(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return digits;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function addBusinessDays(startDate: Date, businessDays: number): Date {
  const result = new Date(startDate.getTime());
  let added = 0;
  while (added < businessDays) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      added += 1;
    }
  }
  return result;
}

function formatDeliveryDate(businessDays: number): string {
  const target = addBusinessDays(new Date(), businessDays);
  const weekdays = [
    'domingo',
    'segunda-feira',
    'terça-feira',
    'quarta-feira',
    'quinta-feira',
    'sexta-feira',
    'sábado',
  ];
  const months = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ];
  return `${weekdays[target.getDay()]}, ${target.getDate()} de ${months[target.getMonth()]}`;
}

export async function lookupCep(rawCep: string): Promise<ViaCepAddress> {
  const cleanCep = rawCep.replace(/\D/g, '');
  if (cleanCep.length !== 8) {
    throw new Error('Digite um CEP válido com 8 números.');
  }

  if (/^(\d)\1{7}$/.test(cleanCep)) {
    throw new Error('CEP não encontrado. Verifique os números digitados.');
  }

  const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
  if (!response.ok) {
    throw new Error('Não foi possível consultar o CEP no momento. Tente novamente.');
  }

  const data = await response.json();
  if (data.erro) {
    throw new Error('CEP não encontrado na base dos Correios.');
  }

  return {
    cep: formatCep(data.cep || cleanCep),
    logradouro: data.logradouro || 'Endereço geral da região',
    complemento: data.complemento || '',
    bairro: data.bairro || 'Centro',
    localidade: data.localidade,
    uf: data.uf,
    ddd: data.ddd,
  };
}

export async function searchCepByStreet(
  uf: string,
  city: string,
  street: string
): Promise<ViaCepAddress[]> {
  const cleanUf = uf.trim().toUpperCase();
  const cleanCity = city.trim();
  const cleanStreet = street.trim();

  if (cleanUf.length !== 2 || cleanCity.length < 3 || cleanStreet.length < 3) {
    throw new Error('Preencha Estado (UF), Cidade e pelo menos 3 letras da rua.');
  }

  const url = `https://viacep.com.br/ws/${encodeURIComponent(cleanUf)}/${encodeURIComponent(
    cleanCity
  )}/${encodeURIComponent(cleanStreet)}/json/`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Erro ao pesquisar endereços nos Correios.');
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  return data.slice(0, 8).map((item) => ({
    cep: formatCep(item.cep || ''),
    logradouro: item.logradouro || 'Sem logradouro específico',
    complemento: item.complemento || '',
    bairro: item.bairro || 'Centro',
    localidade: item.localidade || cleanCity,
    uf: item.uf || cleanUf,
  }));
}

export function calculateShippingOptions(address: ViaCepAddress): ShippingOption[] {
  const uf = address.uf.toUpperCase();

  const southeastSouth = ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS'];
  const centerWestNortheast = [
    'DF',
    'GO',
    'MS',
    'MT',
    'BA',
    'PE',
    'CE',
    'PB',
    'RN',
    'AL',
    'SE',
    'PI',
    'MA',
  ];

  let normalDays = 8;
  let normalPrice = 79.9;
  let expressDays = 4;
  let expressPrice = 129.9;

  if (southeastSouth.includes(uf)) {
    normalDays = uf === 'SP' ? 3 : 5;
    normalPrice = 0;
    expressDays = uf === 'SP' ? 1 : 2;
    expressPrice = uf === 'SP' ? 39.9 : 59.9;
  } else if (centerWestNortheast.includes(uf)) {
    normalDays = 6;
    normalPrice = ['DF', 'GO', 'BA', 'PE', 'CE'].includes(uf) ? 0 : 49.9;
    expressDays = 3;
    expressPrice = 89.9;
  }

  return [
    {
      id: 'normal',
      type: 'normal',
      title: 'Entrega Padrão Magalu',
      subtitle:
        normalPrice === 0
          ? 'Frete Grátis com rastreio completo'
          : 'Transportadora homologada Magalu Entregas',
      etaText: `Receba até ${formatDeliveryDate(normalDays)}`,
      price: normalPrice,
    },
    {
      id: 'express',
      type: 'express',
      title: 'Entrega Rápida',
      subtitle: 'Prioridade na expedição do Centro de Distribuição',
      etaText: `Receba até ${formatDeliveryDate(expressDays)}`,
      price: expressPrice,
    },
    {
      id: 'pickup',
      type: 'pickup',
      title: 'Retira na Loja Magalu',
      subtitle: `Loja Magazine Luiza - ${address.bairro || 'Centro'}, ${address.localidade}/${address.uf}`,
      etaText: 'Disponível para retirada em até 2 horas após aprovação',
      price: 0,
      storeAddress: `Unidade Magalu ${address.localidade} (${address.bairro || 'Região Central'}) - ${address.localidade}/${address.uf}`,
    },
  ];
}
