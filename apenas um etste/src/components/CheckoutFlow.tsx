import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Barcode,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Minus,
  Plus,
  QrCode,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  Trash2,
  Truck,
  Zap,
} from 'lucide-react';
import {
  CapacityVariant,
  CreditCardFormData,
  CustomerCheckoutData,
  PaymentMethodType,
  ShippingOption,
  ViaCepAddress,
  VoltageType,
  WarrantyOption,
} from '../types/store';
import { WARRANTY_OPTIONS, buildInstallments } from '../data/productData';
import {
  formatCep,
  formatCurrency,
  lookupCep,
} from '../services/cepService';

interface CheckoutFlowProps {
  variant: CapacityVariant;
  selectedVoltage: VoltageType;
  onChangeVoltage: (v: VoltageType) => void;
  productImage: string;
  quantity: number;
  onChangeQuantity: (q: number) => void;
  selectedWarranty: WarrantyOption;
  onChangeWarranty: (w: WarrantyOption) => void;
  installationAdded: boolean;
  onToggleInstallation: (val: boolean) => void;
  cepAddress: ViaCepAddress | null;
  onApplyCepAddress: (addr: ViaCepAddress) => void;
  shippingOptions: ShippingOption[];
  selectedShippingId: string;
  onSelectShippingId: (id: string) => void;
  initialPaymentMethod: PaymentMethodType;
  initialStep?: 'sacola' | 'entrega' | 'pagamento';
  onBackToProduct: () => void;
}

function formatCpf(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length > 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  if (d.length > 6) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  if (d.length > 3) return `${d.slice(0, 3)}.${d.slice(3)}`;
  return d;
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length > 6) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return d;
}

function formatCardNumber(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 16);
  return d.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 4);
  if (d.length > 2) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return d;
}

const PixQrCodeSvg: React.FC = () => {
  const size = 21;
  const isDark = (r: number, c: number) => {
    const inFinder = (fr: number, fc: number) =>
      r >= fr &&
      r < fr + 7 &&
      c >= fc &&
      c < fc + 7 &&
      (r === fr ||
        r === fr + 6 ||
        c === fc ||
        c === fc + 6 ||
        (r >= fr + 2 && r <= fr + 4 && c >= fc + 2 && c <= fc + 4));

    if (r < 8 && c < 8) return inFinder(0, 0);
    if (r < 8 && c >= size - 8) return inFinder(0, size - 7);
    if (r >= size - 8 && c < 8) return inFinder(size - 7, 0);
    return (r * 7 + c * 13 + r * c) % 3 === 0;
  };

  return (
    <svg
      viewBox="0 0 210 210"
      className="w-48 h-48 mx-auto bg-white p-2 rounded-lg border border-slate-200"
    >
      {Array.from({ length: size }).map((_, r) =>
        Array.from({ length: size }).map((__, c) =>
          isDark(r, c) ? (
            <rect
              key={`${r}-${c}`}
              x={c * 10}
              y={r * 10}
              width="9.5"
              height="9.5"
              rx="1.2"
              fill="#111827"
            />
          ) : null
        )
      )}
    </svg>
  );
};

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  variant,
  selectedVoltage,
  onChangeVoltage,
  productImage,
  quantity,
  onChangeQuantity,
  selectedWarranty,
  onChangeWarranty,
  installationAdded,
  onToggleInstallation,
  cepAddress,
  onApplyCepAddress,
  shippingOptions,
  selectedShippingId,
  onSelectShippingId,
  initialPaymentMethod,
  initialStep = 'sacola',
  onBackToProduct,
}) => {
  const [step, setStep] = useState<
    'sacola' | 'entrega' | 'pagamento' | 'awaiting_pix_boleto' | 'confirmado'
  >(initialStep);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(initialPaymentMethod);

  const [cepInput, setCepInput] = useState(cepAddress?.cep || '');
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');

  const [streetField, setStreetField] = useState(cepAddress?.logradouro || '');
  const [neighborhoodField, setNeighborhoodField] = useState(cepAddress?.bairro || '');

  useEffect(() => {
    if (cepAddress) {
      setCepInput(cepAddress.cep);
      setStreetField(cepAddress.logradouro);
      setNeighborhoodField(cepAddress.bairro);
    }
  }, [cepAddress]);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(
    null
  );
  const [couponFeedback, setCouponFeedback] = useState('');

  const [customer, setCustomer] = useState<CustomerCheckoutData>({
    fullName: '',
    cpf: '',
    email: '',
    phone: '',
    number: '',
    complement: '',
    reference: '',
    recipientName: '',
  });
  const [deliveryFormError, setDeliveryFormError] = useState('');

  const [cardForm, setCardForm] = useState<CreditCardFormData>({
    number: '',
    holderName: '',
    expiry: '',
    cvv: '',
    holderCpf: '',
    installments: 10,
    saveCard: true,
  });
  const [isCvvFocused, setIsCvvFocused] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [processingOrder, setProcessingOrder] = useState(false);

  const [orderNumber, setOrderNumber] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [pixSecondsLeft, setPixSecondsLeft] = useState(1800);

  useEffect(() => {
    if (step !== 'awaiting_pix_boleto') return;
    const timer = setInterval(() => {
      setPixSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const installationPrice = installationAdded ? 349.9 : 0;
  const activeShipping =
    shippingOptions.find((s) => s.id === selectedShippingId) || shippingOptions[0];
  const shippingCost = activeShipping ? activeShipping.price : 0;

  const baseItemsCardSubtotal =
    variant.cardPrice * quantity +
    selectedWarranty.price * quantity +
    installationPrice * quantity;

  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const pixProductSubtotal =
    variant.pixPrice * quantity +
    selectedWarranty.price * quantity +
    installationPrice * quantity;

  const isPixDiscountApplied =
    paymentMethod === 'pix' ||
    (paymentMethod === 'cartao_luiza' && cardForm.installments === 1);

  const finalTotal = Math.max(
    0,
    (isPixDiscountApplied ? pixProductSubtotal : baseItemsCardSubtotal) +
      shippingCost -
      couponDiscount
  );

  const pixSavings = Math.max(0, baseItemsCardSubtotal - pixProductSubtotal);

  const creditInstallments = buildInstallments(
    Math.max(0, baseItemsCardSubtotal + shippingCost - couponDiscount),
    paymentMethod === 'cartao_luiza' ? 18 : 12
  );

  const handleCepSearch = async (rawVal?: string) => {
    const targetCep = rawVal ?? cepInput;
    setCepError('');
    setCepLoading(true);
    try {
      const result = await lookupCep(targetCep);
      onApplyCepAddress(result);
      setStreetField(result.logradouro);
      setNeighborhoodField(result.bairro);
    } catch (err) {
      setCepError(err instanceof Error ? err.message : 'CEP inválido.');
    } finally {
      setCepLoading(false);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = couponCode.trim().toUpperCase();
    if (!normalized) return;

    if (normalized === 'MAGALU50' || normalized === 'BEMVINDO50') {
      setAppliedCoupon({ code: normalized, discount: 50 });
      setCouponFeedback('Cupom de R$ 50,00 aplicado com sucesso!');
    } else if (normalized === 'GREE100' || normalized === 'ELETRO100') {
      setAppliedCoupon({ code: normalized, discount: 100 });
      setCouponFeedback('Cupom especial de R$ 100,00 aplicado!');
    } else {
      setCouponFeedback('Cupom inválido. Experimente MAGALU50 ou GREE100.');
    }
  };

  const handleContinueFromEntrega = (e: React.FormEvent) => {
    e.preventDefault();
    setDeliveryFormError('');

    if (!cepAddress) {
      setDeliveryFormError('Informe um CEP válido para calcular a entrega.');
      return;
    }
    if (customer.fullName.trim().length < 5) {
      setDeliveryFormError('Informe seu nome completo.');
      return;
    }
    if (customer.cpf.replace(/\D/g, '').length !== 11) {
      setDeliveryFormError('Informe um CPF válido com 11 números.');
      return;
    }
    if (!customer.email.includes('@')) {
      setDeliveryFormError('Informe um e-mail válido para receber a Nota Fiscal.');
      return;
    }
    if (customer.phone.replace(/\D/g, '').length < 10) {
      setDeliveryFormError('Informe um telefone/celular com DDD.');
      return;
    }
    if (!customer.number.trim()) {
      setDeliveryFormError('Informe o número do endereço (ou S/N).');
      return;
    }

    setCardForm((prev) => ({
      ...prev,
      holderName: prev.holderName || customer.fullName.toUpperCase(),
      holderCpf: prev.holderCpf || customer.cpf,
    }));
    setStep('pagamento');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalizeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError('');

    if (paymentMethod === 'credit_card' || paymentMethod === 'cartao_luiza') {
      if (cardForm.number.replace(/\D/g, '').length < 15) {
        setPaymentError('Verifique os 16 dígitos do número do cartão.');
        return;
      }
      if (cardForm.holderName.trim().length < 4) {
        setPaymentError('Informe o nome exatamente como impresso no cartão.');
        return;
      }
      if (cardForm.expiry.replace(/\D/g, '').length !== 4) {
        setPaymentError('Informe a validade no formato MM/AA.');
        return;
      }
      if (cardForm.cvv.replace(/\D/g, '').length < 3) {
        setPaymentError('Informe o código de segurança (CVV) de 3 ou 4 dígitos.');
        return;
      }
    }

    setProcessingOrder(true);
    const generatedId = `MGL-${Math.floor(10000000 + Math.random() * 89999999)}`;
    setOrderNumber(generatedId);

    setTimeout(() => {
      setProcessingOrder(false);
      if (paymentMethod === 'pix' || paymentMethod === 'boleto') {
        setPixSecondsLeft(1800);
        setStep('awaiting_pix_boleto');
      } else {
        setStep('confirmado');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 650);
  };

  const pixPayload = `00020126580014BR.GOV.BCB.PIX0136magalupay-pix@magazineluiza.com.br5204000053039865407${finalTotal.toFixed(
    2
  )}5802BR5918MAGAZINE LUIZA S A6009FRANCA SP62190515${
    orderNumber || 'MGL241051200'
  }6304A9F2`;

  const boletoLinhaDigitavel =
    '23793.38128 60083.013528 56000.063305 8 98840000' +
    Math.round(finalTotal * 100)
      .toString()
      .padStart(6, '0');

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const minutesLeft = Math.floor(pixSecondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const secondsLeft = (pixSecondsLeft % 60).toString().padStart(2, '0');

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={onBackToProduct}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0086FF] hover:underline cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a página do produto</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'sacola', label: '1. Sacola' },
            { id: 'entrega', label: '2. Entrega' },
            { id: 'pagamento', label: '3. Pagamento' },
            { id: 'confirmado', label: '4. Conclusão' },
          ].map((item, idx) => {
            const stepOrder = [
              'sacola',
              'entrega',
              'pagamento',
              'awaiting_pix_boleto',
              'confirmado',
            ];
            const currentIdx = stepOrder.indexOf(step);
            const targetIdx = item.id === 'confirmado' ? 4 : stepOrder.indexOf(item.id);
            const isActive =
              step === item.id ||
              (item.id === 'pagamento' && step === 'awaiting_pix_boleto');
            const isDone = currentIdx > targetIdx;

            return (
              <React.Fragment key={item.id}>
                <button
                  type="button"
                  disabled={!isDone && !isActive}
                  onClick={() => {
                    if (isDone && step !== 'confirmado') {
                      setStep(item.id as 'sacola' | 'entrega' | 'pagamento');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-[#0086FF] text-white'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-800 cursor-pointer'
                      : 'bg-slate-200/80 text-slate-500'
                  }`}
                >
                  {item.label}
                </button>
                {idx < 3 && <span className="text-slate-300">—</span>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {step === 'awaiting_pix_boleto' && (
        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {paymentMethod === 'pix' ? (
            <>
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Aguardando pagamento Pix · Expira em {minutesLeft}:{secondsLeft}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Pedido #{orderNumber} gerado! Pague com Pix
                </h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  Escaneie o QR Code abaixo no aplicativo do seu banco ou copie o código{' '}
                  <strong>Pix Copia e Cola</strong>.
                </p>
              </div>

              <div className="py-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
                <PixQrCodeSvg />
                <div className="text-xs text-slate-500">Valor total no Pix:</div>
                <div className="text-2xl font-extrabold text-emerald-700 tabular-nums">
                  {formatCurrency(finalTotal)}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Código Pix Copia e Cola:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    readOnly
                    value={pixPayload}
                    className="flex-1 h-11 px-3 rounded-lg bg-slate-50 border border-slate-300 text-xs font-mono text-slate-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyCode(pixPayload)}
                    className="h-11 px-5 rounded-lg bg-[#0086FF] hover:bg-[#0070D6] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Código Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar código Pix</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  Após pagar no app do seu banco, confirme abaixo:
                </span>
                <button
                  type="button"
                  onClick={() => setStep('confirmado')}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#59C00B] hover:bg-[#4EA809] text-white text-sm font-extrabold transition-colors cursor-pointer"
                >
                  Já realizei o pagamento Pix
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center space-y-2">
                <Barcode className="w-12 h-12 text-[#0086FF] mx-auto" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Boleto Bancário Gerado · Pedido #{orderNumber}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  Utilize a linha digitável abaixo para pagar no aplicativo do seu banco ou internet
                  banking.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Valor do documento:</span>
                  <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>

                <div className="h-16 bg-white p-2 rounded border border-slate-200 flex items-stretch justify-center gap-[2px] overflow-hidden">
                  {Array.from({ length: 68 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900"
                      style={{
                        width: idx % 3 === 0 ? '3px' : idx % 2 === 0 ? '1.5px' : '2px',
                        opacity: idx % 7 === 0 ? 0 : 1,
                      }}
                    />
                  ))}
                </div>

                <div className="text-center font-mono text-xs sm:text-sm font-semibold text-slate-800 break-all">
                  {boletoLinhaDigitavel}
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyCode(boletoLinhaDigitavel)}
                  className="w-full h-11 rounded-lg bg-[#0086FF] hover:bg-[#0070D6] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Linha Digitável Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar linha digitável do Boleto</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep('confirmado')}
                  className="px-6 py-3 rounded-lg bg-[#59C00B] hover:bg-[#4EA809] text-white text-sm font-extrabold transition-colors cursor-pointer"
                >
                  Concluir e ver comprovante do pedido
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {step === 'confirmado' && (
        <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-start gap-4 pb-6 border-b border-slate-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700">
                Compra aprovada com sucesso no Magalu
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                Obrigado, {customer.fullName.split(' ')[0] || 'Cliente'}! Seu pedido #{orderNumber}{' '}
                está confirmado.
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Enviamos os detalhes e o acompanhamento da Nota Fiscal Eletrônica para{' '}
                <strong>{customer.email || 'seu e-mail cadastrado'}</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#0086FF]" />
                <span>Endereço e Prazo de Entrega</span>
              </div>
              {cepAddress && (
                <p className="text-slate-600">
                  {streetField}, {customer.number}
                  {customer.complement ? ` - ${customer.complement}` : ''} · {neighborhoodField},{' '}
                  {cepAddress.localidade}/{cepAddress.uf} · CEP {cepAddress.cep}
                </p>
              )}
              <p className="font-semibold text-emerald-700 pt-1">
                {activeShipping?.title}: {activeShipping?.etaText}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#0086FF]" />
                <span>Resumo do Pagamento</span>
              </div>
              <p className="text-slate-600">
                Forma escolhida:{' '}
                <strong>
                  {paymentMethod === 'pix'
                    ? 'Pix à vista'
                    : paymentMethod === 'cartao_luiza'
                    ? `Cartão Luiza (${cardForm.installments}x)`
                    : paymentMethod === 'credit_card'
                    ? `Cartão de Crédito (${cardForm.installments}x)`
                    : 'Boleto Bancário'}
                </strong>
              </p>
              <p className="text-lg font-extrabold text-slate-900 tabular-nums pt-1">
                Total pago: {formatCurrency(finalTotal)}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 flex items-center gap-4">
            <img
              src={productImage}
              alt={variant.model}
              referrerPolicy="no-referrer"
              className="w-16 h-16 object-contain rounded bg-white p-1 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">
                Ar-Condicionado Split {variant.btus} Gree Inverter Frio {variant.model} -{' '}
                {selectedVoltage}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Quantidade: {quantity} · Voltagem: <strong>{selectedVoltage}</strong> · Vendido e
                entregue por Magalu
                {selectedWarranty.months > 0 ? ` · ${selectedWarranty.label}` : ''}
                {installationAdded ? ' · + Instalação Credenciada' : ''}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onBackToProduct}
              className="px-6 py-3 rounded-lg bg-[#0086FF] hover:bg-[#0070D6] text-white text-sm font-bold transition-colors cursor-pointer"
            >
              Voltar para a loja Magalu
            </button>
          </div>
        </div>
      )}

      {(step === 'sacola' || step === 'entrega' || step === 'pagamento') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            {step === 'sacola' && (
              <>
                <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      Minha Sacola
                    </h1>
                    <span className="text-xs text-slate-500">
                      Vendido e entregue por <strong className="text-[#0086FF]">Magalu</strong>
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex items-start gap-4">
                      <img
                        src={productImage}
                        alt={variant.model}
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-lg border border-slate-200 object-contain p-1.5 bg-white shrink-0"
                      />
                      <div className="space-y-1.5">
                        <h2 className="text-sm font-bold text-slate-900 leading-snug">
                          Ar-Condicionado Split {variant.btus} Gree Inverter Frio {variant.model} -{' '}
                          {selectedVoltage}
                        </h2>
                        <div className="text-xs text-slate-500">
                          Cód. Magalu: {variant.sku} · Cor: Branco
                        </div>

                        {/* Interactive Voltage Toggle inside Sacola */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-xs font-semibold text-slate-600">Voltagem:</span>
                          {(['110V', '220V'] as VoltageType[]).map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => onChangeVoltage(v)}
                              className={`px-2.5 py-1 rounded-md border text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                selectedVoltage === v
                                  ? 'border-[#0086FF] bg-blue-50 text-[#0086FF]'
                                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              <Zap className="w-3 h-3" />
                              <span>{v}</span>
                            </button>
                          ))}
                        </div>

                        <div className="text-xs text-emerald-700 font-semibold">
                          Em estoque imediato no Centro de Distribuição Magalu
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => onChangeQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-700 cursor-pointer"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 text-center text-sm font-bold tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onChangeQuantity(Math.min(10, quantity + 1))}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-700 cursor-pointer"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right tabular-nums">
                        <div className="text-sm font-extrabold text-slate-900">
                          {formatCurrency(variant.pixPrice * quantity)}{' '}
                          <span className="text-xs font-semibold text-emerald-700">no Pix</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          ou {formatCurrency(variant.cardPrice * quantity)} no cartão
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900">
                      <ShieldCheck className="w-4 h-4 text-[#0086FF]" />
                      <span>Proteja seu Ar-Condicionado com Garantia Estendida Magalu</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {WARRANTY_OPTIONS.map((opt) => {
                        const active = selectedWarranty.id === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => onChangeWarranty(opt)}
                            className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                              active
                                ? 'border-[#0086FF] bg-blue-50/50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                            <div className="text-xs font-extrabold text-[#0086FF] tabular-nums mt-1">
                              {opt.price === 0
                                ? 'Incluso (Fábrica)'
                                : `+ ${formatCurrency(opt.price)}`}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <label className="mt-2 flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={installationAdded}
                          onChange={(e) => onToggleInstallation(e.target.checked)}
                          className="w-4 h-4 accent-[#0086FF] rounded"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            Adicionar Serviço de Instalação Padrão Split (Técnico Credenciado)
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Mantém os 10 anos de garantia no compressor Gree · Agendamento flexível
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-slate-900 tabular-nums shrink-0 ml-2">
                        + {formatCurrency(349.9)}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Truck className="w-4 h-4 text-[#0086FF]" />
                    <span>Entrega e Frete por CEP</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 max-w-md">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cepInput}
                      onChange={(e) => {
                        const formatted = formatCep(e.target.value);
                        setCepInput(formatted);
                        if (formatted.replace(/\D/g, '').length === 8) {
                          handleCepSearch(formatted);
                        }
                      }}
                      placeholder="Digite seu CEP (00000-000)"
                      className="flex-1 h-11 px-3.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0086FF]"
                    />
                    <button
                      type="button"
                      disabled={cepLoading}
                      onClick={() => handleCepSearch()}
                      className="h-11 px-5 rounded-lg bg-[#0086FF] hover:bg-[#0070D6] text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {cepLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Calcular CEP'}
                    </button>
                  </div>

                  {cepError && <p className="text-xs text-red-600 font-medium">{cepError}</p>}

                  {cepAddress && (
                    <div className="space-y-3 pt-1">
                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#0086FF] shrink-0" />
                        <span>
                          Endereço localizado: <strong>{cepAddress.logradouro}</strong> -{' '}
                          {cepAddress.bairro}, {cepAddress.localidade}/{cepAddress.uf}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {shippingOptions.map((opt) => {
                          const checked = opt.id === (activeShipping?.id || '');
                          return (
                            <label
                              key={opt.id}
                              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                                checked
                                  ? 'border-[#0086FF] bg-blue-50/40'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="radio"
                                  name="sacola-shipping"
                                  checked={checked}
                                  onChange={() => onSelectShippingId(opt.id)}
                                  className="mt-1 accent-[#0086FF]"
                                />
                                <div>
                                  <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                    {opt.type === 'pickup' ? (
                                      <Store className="w-4 h-4 text-[#0086FF]" />
                                    ) : (
                                      <Truck className="w-4 h-4 text-[#0086FF]" />
                                    )}
                                    <span>{opt.title}</span>
                                  </div>
                                  <div className="text-xs text-slate-600 mt-0.5">{opt.etaText}</div>
                                  <div className="text-[11px] text-slate-500">{opt.subtitle}</div>
                                </div>
                              </div>
                              <div className="text-xs sm:text-sm font-extrabold tabular-nums ml-3 shrink-0">
                                {opt.price === 0 ? (
                                  <span className="text-emerald-700">Grátis</span>
                                ) : (
                                  formatCurrency(opt.price)
                                )}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {step === 'entrega' && (
              <form
                id="form-entrega"
                onSubmit={handleContinueFromEntrega}
                className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-6"
              >
                <div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Dados Pessoais e Endereço de Entrega
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Preencha seus dados para emissão da Nota Fiscal Eletrônica e entrega do produto.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.fullName}
                      onChange={(e) =>
                        setCustomer((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                      placeholder="Digite seu nome e sobrenome"
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0086FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">CPF *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={customer.cpf}
                      onChange={(e) =>
                        setCustomer((prev) => ({ ...prev, cpf: formatCpf(e.target.value) }))
                      }
                      placeholder="000.000.000-00"
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0086FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Celular / WhatsApp *
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={customer.phone}
                      onChange={(e) =>
                        setCustomer((prev) => ({ ...prev, phone: formatPhone(e.target.value) }))
                      }
                      placeholder="(11) 99999-9999"
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0086FF]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      E-mail (para envio da NF-e e rastreamento) *
                    </label>
                    <input
                      type="email"
                      required
                      value={customer.email}
                      onChange={(e) =>
                        setCustomer((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="seuemail@exemplo.com.br"
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0086FF]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900">Endereço de Entrega</h2>
                    <span className="text-[11px] text-[#0086FF] font-semibold">
                      Preenchimento automático via CEP
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">CEP *</label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          value={cepInput}
                          onChange={(e) => {
                            const formatted = formatCep(e.target.value);
                            setCepInput(formatted);
                            if (formatted.replace(/\D/g, '').length === 8) {
                              handleCepSearch(formatted);
                            }
                          }}
                          placeholder="00000-000"
                          className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0086FF]"
                        />
                        {cepLoading && (
                          <Loader2 className="w-4 h-4 text-[#0086FF] animate-spin absolute right-3 top-3.5" />
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Rua / Avenida *
                      </label>
                      <input
                        type="text"
                        required
                        value={streetField}
                        onChange={(e) => setStreetField(e.target.value)}
                        placeholder="Preenchido automaticamente pelo CEP"
                        className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0086FF]"
                      />
                    </div>
                  </div>

                  {cepError && <p className="text-xs text-red-600 font-medium">{cepError}</p>}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Número *
                      </label>
                      <input
                        type="text"
                        required
                        value={customer.number}
                        onChange={(e) =>
                          setCustomer((prev) => ({ ...prev, number: e.target.value }))
                        }
                        placeholder="Ex: 420"
                        className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0086FF]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Complemento (Apto, Bloco, Casa)
                      </label>
                      <input
                        type="text"
                        value={customer.complement}
                        onChange={(e) =>
                          setCustomer((prev) => ({ ...prev, complement: e.target.value }))
                        }
                        placeholder="Ex: Apto 52 Bloco B (opcional)"
                        className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0086FF]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Bairro *</label>
                      <input
                        type="text"
                        required
                        value={neighborhoodField}
                        onChange={(e) => setNeighborhoodField(e.target.value)}
                        placeholder="Bairro"
                        className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0086FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Cidade</label>
                      <input
                        type="text"
                        readOnly
                        value={cepAddress?.localidade || ''}
                        placeholder="Informe o CEP"
                        className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Estado</label>
                      <input
                        type="text"
                        readOnly
                        value={cepAddress?.uf || ''}
                        placeholder="UF"
                        className="w-full h-11 px-3.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {deliveryFormError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                    {deliveryFormError}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('sacola')}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Voltar para a Sacola
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-lg bg-[#59C00B] hover:bg-[#4EA809] text-white text-sm font-extrabold transition-colors cursor-pointer"
                  >
                    Ir para o Pagamento
                  </button>
                </div>
              </form>
            )}

            {step === 'pagamento' && (
              <form
                id="form-pagamento"
                onSubmit={handleFinalizeOrder}
                className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      Escolha como pagar no Magalu
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Transação protegida com criptografia de ponta a ponta
                    </p>
                  </div>
                  <Lock className="w-5 h-5 text-[#59C00B] shrink-0" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    {
                      id: 'pix' as PaymentMethodType,
                      title: 'Pix',
                      sub: `${formatCurrency(variant.pixPrice)} à vista`,
                      icon: QrCode,
                    },
                    {
                      id: 'credit_card' as PaymentMethodType,
                      title: 'Cartão de Crédito',
                      sub: 'Até 10x sem juros',
                      icon: CreditCard,
                    },
                    {
                      id: 'cartao_luiza' as PaymentMethodType,
                      title: 'Cartão Luiza',
                      sub: 'Até 18x sem juros',
                      icon: Sparkles,
                    },
                    {
                      id: 'boleto' as PaymentMethodType,
                      title: 'Boleto',
                      sub: 'À vista',
                      icon: Barcode,
                    },
                  ].map((m) => {
                    const Icon = m.icon;
                    const active = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(m.id);
                          setPaymentError('');
                        }}
                        className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          active
                            ? 'border-[#0086FF] bg-blue-50/50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 mb-2 ${
                            active ? 'text-[#0086FF]' : 'text-slate-500'
                          }`}
                        />
                        <div className="text-xs sm:text-sm font-bold text-slate-900">{m.title}</div>
                        <div
                          className={`text-[11px] font-semibold mt-0.5 tabular-nums ${
                            m.id === 'pix' ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        >
                          {m.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === 'pix' && (
                  <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-emerald-800">
                          Melhor preço garantido no Pix (10% OFF imediato)
                        </span>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums mt-1">
                          {formatCurrency(finalTotal)}
                        </div>
                        <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                          Você está economizando {formatCurrency(pixSavings)} nesta compra!
                        </div>
                      </div>
                      <QrCode className="w-12 h-12 text-emerald-600 shrink-0" />
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-emerald-200/70">
                      <li>
                        1. Clique em <strong>Gerar QR Code Pix e Finalizar</strong> para gerar seu
                        código exclusivo.
                      </li>
                      <li>
                        2. Pague pelo aplicativo do seu banco usando QR Code ou Pix Copia e Cola.
                      </li>
                      <li>
                        3. Aprovação em segundos e liberação imediata do envio pelo Magalu!
                      </li>
                    </ul>
                  </div>
                )}

                {(paymentMethod === 'credit_card' || paymentMethod === 'cartao_luiza') && (
                  <div className="space-y-5">
                    <div
                      className={`rounded-2xl p-5 text-white shadow-md transition-all max-w-sm mx-auto ${
                        paymentMethod === 'cartao_luiza'
                          ? 'bg-gradient-to-br from-[#0086FF] via-[#005BB5] to-[#003B75]'
                          : 'bg-gradient-to-br from-slate-800 via-slate-900 to-black'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-xs font-extrabold tracking-wide">
                          {paymentMethod === 'cartao_luiza'
                            ? 'Cartão Luiza Preferencial'
                            : 'Cartão de Crédito'}
                        </span>
                        <CreditCard className="w-6 h-6 text-white/80" />
                      </div>
                      <div className="font-mono text-base sm:text-lg tracking-widest mb-5 tabular-nums">
                        {cardForm.number || '•••• •••• •••• ••••'}
                      </div>
                      <div className="flex items-end justify-between text-xs">
                        <div className="truncate max-w-[190px]">
                          <div className="text-[10px] text-white/70">Nome no cartão</div>
                          <div className="font-bold truncate">
                            {cardForm.holderName || 'NOME DO TITULAR'}
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <div className="text-[10px] text-white/70">Validade</div>
                            <div className="font-mono font-bold">
                              {cardForm.expiry || 'MM/AA'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-white/70">CVV</div>
                            <div
                              className={`font-mono font-bold px-1 rounded ${
                                isCvvFocused ? 'bg-yellow-300 text-slate-900' : ''
                              }`}
                            >
                              {cardForm.cvv || '•••'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Número do Cartão *
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          value={cardForm.number}
                          onChange={(e) =>
                            setCardForm((prev) => ({
                              ...prev,
                              number: formatCardNumber(e.target.value),
                            }))
                          }
                          placeholder="0000 0000 0000 0000"
                          className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0086FF]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nome impresso no cartão *
                        </label>
                        <input
                          type="text"
                          required
                          value={cardForm.holderName}
                          onChange={(e) =>
                            setCardForm((prev) => ({
                              ...prev,
                              holderName: e.target.value.toUpperCase(),
                            }))
                          }
                          placeholder="COMO ESTÁ NO CARTÃO"
                          className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0086FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Validade (MM/AA) *
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          value={cardForm.expiry}
                          onChange={(e) =>
                            setCardForm((prev) => ({
                              ...prev,
                              expiry: formatExpiry(e.target.value),
                            }))
                          }
                          placeholder="MM/AA"
                          className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0086FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Código de Segurança (CVV) *
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          maxLength={4}
                          onFocus={() => setIsCvvFocused(true)}
                          onBlur={() => setIsCvvFocused(false)}
                          value={cardForm.cvv}
                          onChange={(e) =>
                            setCardForm((prev) => ({
                              ...prev,
                              cvv: e.target.value.replace(/\D/g, '').slice(0, 4),
                            }))
                          }
                          placeholder="123"
                          className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0086FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          CPF do titular do cartão *
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          required
                          value={cardForm.holderCpf}
                          onChange={(e) =>
                            setCardForm((prev) => ({
                              ...prev,
                              holderCpf: formatCpf(e.target.value),
                            }))
                          }
                          placeholder="000.000.000-00"
                          className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0086FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Opções de Parcelamento *
                        </label>
                        <select
                          value={cardForm.installments}
                          onChange={(e) =>
                            setCardForm((prev) => ({
                              ...prev,
                              installments: Number(e.target.value),
                            }))
                          }
                          className="w-full h-11 px-3 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#0086FF]"
                        >
                          {paymentMethod === 'cartao_luiza' && (
                            <option value={1}>
                              1x de{' '}
                              {formatCurrency(
                                Math.max(0, pixProductSubtotal + shippingCost - couponDiscount)
                              )}{' '}
                              (Preço à vista Cartão Luiza)
                            </option>
                          )}
                          {creditInstallments
                            .filter((r) => !(paymentMethod === 'cartao_luiza' && r.count === 1))
                            .map((row) => (
                              <option key={row.count} value={row.count}>
                                {row.count}x de {formatCurrency(row.perMonth)}{' '}
                                {row.interestFree ? 'sem juros' : 'com juros'}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'boleto' && (
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-slate-600">
                          Pagamento à vista via Boleto Bancário
                        </div>
                        <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-0.5">
                          {formatCurrency(finalTotal)}
                        </div>
                      </div>
                      <Barcode className="w-11 h-11 text-slate-700" />
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-2">
                      Ao finalizar, você terá acesso imediato ao código de barras para copiar e
                      pagar no seu banco. A compensação do boleto ocorre em até 2 dias úteis.
                    </p>
                  </div>
                )}

                {paymentError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                    {paymentError}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep('entrega')}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Revisar dados de entrega
                  </button>

                  <button
                    type="submit"
                    disabled={processingOrder}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-[#59C00B] hover:bg-[#4EA809] disabled:opacity-60 text-white text-sm sm:text-base font-extrabold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {processingOrder ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processando pedido seguro...</span>
                      </>
                    ) : paymentMethod === 'pix' ? (
                      'Gerar QR Code Pix e Finalizar'
                    ) : paymentMethod === 'boleto' ? (
                      'Gerar Boleto e Finalizar'
                    ) : (
                      `Finalizar Compra (${formatCurrency(finalTotal)})`
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <aside className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 space-y-4 lg:sticky lg:top-20">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Resumo do Pedido
            </h2>

            <div className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex items-center justify-between">
              <span>
                Capacidade: <strong>{variant.btus}</strong>
              </span>
              <span>
                Voltagem: <strong className="text-[#0086FF]">{selectedVoltage}</strong>
              </span>
            </div>

            <form onSubmit={handleApplyCoupon} className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#0086FF]" />
                <span>Cupom de desconto</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Ex: MAGALU50"
                  className="flex-1 h-9 px-3 rounded-lg border border-slate-300 text-xs uppercase focus:outline-none focus:border-[#0086FF]"
                />
                <button
                  type="submit"
                  className="h-9 px-3.5 rounded-lg border border-[#0086FF] text-[#0086FF] hover:bg-blue-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Aplicar
                </button>
              </div>
              {couponFeedback && (
                <p
                  className={`text-[11px] font-medium ${
                    appliedCoupon ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {couponFeedback}
                </p>
              )}
              {appliedCoupon && (
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode('');
                    setCouponFeedback('');
                  }}
                  className="text-[11px] text-red-600 inline-flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Remover cupom {appliedCoupon.code}
                </button>
              )}
            </form>

            <div className="space-y-2.5 text-xs sm:text-sm pt-2 border-t border-slate-100 tabular-nums">
              <div className="flex justify-between text-slate-600">
                <span>
                  Produto ({quantity} {quantity === 1 ? 'item' : 'itens'})
                </span>
                <span>
                  {formatCurrency(
                    (isPixDiscountApplied ? variant.pixPrice : variant.cardPrice) * quantity
                  )}
                </span>
              </div>

              {selectedWarranty.months > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Garantia Estendida (+{selectedWarranty.months}m)</span>
                  <span>{formatCurrency(selectedWarranty.price * quantity)}</span>
                </div>
              )}

              {installationAdded && (
                <div className="flex justify-between text-slate-600">
                  <span>Instalação Credenciada</span>
                  <span>{formatCurrency(installationPrice * quantity)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Frete ({cepAddress ? cepAddress.localidade : 'A calcular'})</span>
                <span
                  className={shippingCost === 0 && cepAddress ? 'text-emerald-700 font-bold' : ''}
                >
                  {!cepAddress
                    ? 'Informe o CEP'
                    : shippingCost === 0
                    ? 'Grátis'
                    : formatCurrency(shippingCost)}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Cupom ({appliedCoupon.code})</span>
                  <span>- {formatCurrency(appliedCoupon.discount)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                <span className="text-sm font-bold text-slate-900">Total</span>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-slate-900">
                    {formatCurrency(finalTotal)}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold">
                    {isPixDiscountApplied
                      ? 'Preço especial à vista no Pix'
                      : `ou ${formatCurrency(
                          Math.max(0, pixProductSubtotal + shippingCost - couponDiscount)
                        )} no Pix`}
                  </div>
                </div>
              </div>
            </div>

            {step === 'sacola' && (
              <button
                type="button"
                onClick={() => {
                  setStep('entrega');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full py-3.5 rounded-lg bg-[#59C00B] hover:bg-[#4EA809] text-white text-sm font-extrabold transition-colors cursor-pointer"
              >
                Continuar para Entrega
              </button>
            )}

            <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-[#59C00B] shrink-0" />
              <span>Compra 100% garantida pelo Magazine Luiza</span>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
