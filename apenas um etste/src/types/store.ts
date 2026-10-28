export type VoltageType = '110V' | '220V';

export interface ProductImage {
  id: string;
  src: string;
  alt: string;
  label: string;
}

export interface CapacityVariant {
  btus: string;
  sku: string;
  model: string;
  originalPrice: number;
  cardPrice: number;
  pixPrice: number;
  pixDiscountPercent: number;
  recommendedArea: string;
}

export interface WarrantyOption {
  id: string;
  label: string;
  months: number;
  price: number;
  description: string;
}

export interface TechSpecItem {
  label: string;
  value: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  cityUf: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  recommends: boolean;
  helpfulCount: number;
  verifiedPurchase: boolean;
}

export interface ViaCepAddress {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ddd?: string;
}

export interface ShippingOption {
  id: string;
  type: 'normal' | 'express' | 'pickup';
  title: string;
  subtitle: string;
  etaText: string;
  price: number;
  storeAddress?: string;
}

export type PaymentMethodType = 'pix' | 'credit_card' | 'cartao_luiza' | 'boleto';

export interface CustomerCheckoutData {
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  number: string;
  complement: string;
  reference: string;
  recipientName: string;
}

export interface CreditCardFormData {
  number: string;
  holderName: string;
  expiry: string;
  cvv: string;
  holderCpf: string;
  installments: number;
  saveCard: boolean;
}
