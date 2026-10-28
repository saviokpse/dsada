import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronRight,
  CreditCard,
  Heart,
  Loader2,
  MapPin,
  QrCode,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Truck,
  Zap,
} from 'lucide-react';
import {
  CAPACITY_VARIANTS,
  PRODUCT_IMAGES,
  RelatedProduct,
  WARRANTY_OPTIONS,
  getTechSpecs,
} from './data/productData';
import {
  PaymentMethodType,
  ShippingOption,
  ViaCepAddress,
  VoltageType,
  WarrantyOption,
} from './types/store';
import {
  calculateShippingOptions,
  formatCep,
  formatCurrency,
  lookupCep,
} from './services/cepService';
import { MagaluHeader } from './components/MagaluHeader';
import { ProductGallery } from './components/ProductGallery';
import { PaymentOptionsModal } from './components/PaymentOptionsModal';
import { ProductDetailsTabs } from './components/ProductDetailsTabs';
import { CheckoutFlow } from './components/CheckoutFlow';
import { MagaluFooter } from './components/MagaluFooter';

export default function App() {
  const [viewMode, setViewMode] = useState<'pdp' | 'checkout'>('pdp');
  const [checkoutInitialStep, setCheckoutInitialStep] = useState<
    'sacola' | 'entrega' | 'pagamento'
  >('sacola');

  // Product Variant State (defaults to 9.000 BTUs - SKU 241051200 - R$ 1.700,00)
  const [selectedSku, setSelectedSku] = useState<string>('241051200');
  const [selectedVoltage, setSelectedVoltage] = useState<VoltageType>('220V');

  const activeVariant = useMemo(
    () => CAPACITY_VARIANTS.find((v) => v.sku === selectedSku) || CAPACITY_VARIANTS[0],
    [selectedSku]
  );

  const techSpecs = useMemo(
    () => getTechSpecs(activeVariant, selectedVoltage),
    [activeVariant, selectedVoltage]
  );

  const pixPrice = activeVariant.pixPrice;

  // Favorites & Share Toast
  const [isFavorite, setIsFavorite] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Cart & Add-ons State
  const [cartQuantity, setCartQuantity] = useState<number>(1);
  const [hasAddedToBag, setHasAddedToBag] = useState<boolean>(false);
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyOption>(WARRANTY_OPTIONS[0]);
  const [installationAdded, setInstallationAdded] = useState<boolean>(false);
  const [preferredPaymentMethod, setPreferredPaymentMethod] =
    useState<PaymentMethodType>('pix');

  // CEP & Shipping State (synced across Header, PDP Buy Box, and Checkout)
  const [cepAddress, setCepAddress] = useState<ViaCepAddress | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<string>('normal');

  const [pdpCepInput, setPdpCepInput] = useState<string>('');
  const [pdpCepLoading, setPdpCepLoading] = useState<boolean>(false);
  const [pdpCepError, setPdpCepError] = useState<string>('');
  const [openHeaderCepModal, setOpenHeaderCepModal] = useState<boolean>(false);

  // Payment Options Modal on PDP
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);

  const applyResolvedCepAddress = (address: ViaCepAddress) => {
    setCepAddress(address);
    setPdpCepInput(address.cep);
    setPdpCepError('');
    const calculated = calculateShippingOptions(address);
    setShippingOptions(calculated);
    setSelectedShippingId(calculated[0]?.id || 'normal');
  };

  const handlePdpCepLookup = async (rawVal?: string) => {
    const cepToQuery = rawVal ?? pdpCepInput;
    setPdpCepError('');
    setPdpCepLoading(true);
    try {
      const addr = await lookupCep(cepToQuery);
      applyResolvedCepAddress(addr);
    } catch (err) {
      setPdpCepError(err instanceof Error ? err.message : 'CEP inválido.');
    } finally {
      setPdpCepLoading(false);
    }
  };

  const handleBuyNow = (
    method: PaymentMethodType = 'pix',
    startStep: 'sacola' | 'entrega' | 'pagamento' = 'sacola'
  ) => {
    setHasAddedToBag(true);
    setPreferredPaymentMethod(method);
    setCheckoutInitialStep(startStep);
    setViewMode('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToBagOnly = () => {
    if (!hasAddedToBag) {
      setHasAddedToBag(true);
      setCartQuantity(1);
    } else {
      setCartQuantity((q) => Math.min(10, q + 1));
    }
    showToast(
      `Ar-Condicionado Gree ${activeVariant.btus} (${selectedVoltage}) adicionado à Sacola!`
    );
  };

  const handleQuickBuyRelated = (item: RelatedProduct) => {
    setHasAddedToBag(true);
    showToast(`${item.title.slice(0, 42)}... adicionado junto à sua compra!`);
    setCheckoutInitialStep('sacola');
    setViewMode('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShareProduct = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    showToast('Link do produto copiado para a área de transferência!');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F6] text-[#404040]">
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs sm:text-sm font-medium max-w-md">
          <Check className="w-4 h-4 text-[#73E212] shrink-0" />
          <span className="flex-1">{toastMessage}</span>
          {viewMode === 'pdp' && hasAddedToBag && (
            <button
              type="button"
              onClick={() => {
                setToastMessage(null);
                setCheckoutInitialStep('sacola');
                setViewMode('checkout');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-[#5AC8FA] font-bold hover:underline whitespace-nowrap cursor-pointer"
            >
              Ver Sacola
            </button>
          )}
        </div>
      )}

      <MagaluHeader
        cepAddress={cepAddress}
        onApplyCepAddress={applyResolvedCepAddress}
        cartCount={hasAddedToBag ? cartQuantity : 0}
        isFavorite={isFavorite}
        onToggleFavorite={() => {
          setIsFavorite((prev) => !prev);
          showToast(
            !isFavorite
              ? 'Produto salvo nos seus Favoritos!'
              : 'Produto removido dos Favoritos.'
          );
        }}
        onOpenCart={() => {
          setHasAddedToBag(true);
          setCheckoutInitialStep('sacola');
          setViewMode('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onGoHome={() => {
          setViewMode('pdp');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isCheckoutMode={viewMode === 'checkout'}
        openCepModalExternal={openHeaderCepModal}
        onCloseCepModalExternal={() => setOpenHeaderCepModal(false)}
      />

      {viewMode === 'checkout' ? (
        <main className="flex-1">
          <CheckoutFlow
            variant={activeVariant}
            selectedVoltage={selectedVoltage}
            onChangeVoltage={setSelectedVoltage}
            productImage={PRODUCT_IMAGES[0].src}
            quantity={cartQuantity}
            onChangeQuantity={setCartQuantity}
            selectedWarranty={selectedWarranty}
            onChangeWarranty={setSelectedWarranty}
            installationAdded={installationAdded}
            onToggleInstallation={setInstallationAdded}
            cepAddress={cepAddress}
            onApplyCepAddress={applyResolvedCepAddress}
            shippingOptions={shippingOptions}
            selectedShippingId={selectedShippingId}
            onSelectShippingId={setSelectedShippingId}
            initialPaymentMethod={preferredPaymentMethod}
            initialStep={checkoutInitialStep}
            onBackToProduct={() => {
              setViewMode('pdp');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </main>
      ) : (
        <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-24 lg:pb-10">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-4"
          >
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-[#0086FF] hover:underline cursor-pointer"
            >
              Início
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="hover:text-[#0086FF] cursor-pointer">Ar e Ventilação</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="hover:text-[#0086FF] cursor-pointer">Ar-Condicionado</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="hover:text-[#0086FF] cursor-pointer">Ar-Condicionado Split</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-700 font-semibold">
              Gree Inverter {activeVariant.btus}
            </span>
          </nav>

          {/* Main Product Container */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-2xs">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span>
                    Marca: <strong className="text-slate-700">Gree</strong>
                  </span>
                  <span>·</span>
                  <span className="font-mono">Código {activeVariant.sku}</span>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => scrollToSection('ficha-tecnica')}
                    className="text-[#0086FF] hover:underline font-medium cursor-pointer"
                  >
                    Ver ficha técnica completa
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFavorite((prev) => !prev);
                      showToast(
                        !isFavorite
                          ? 'Adicionado aos Favoritos!'
                          : 'Removido dos Favoritos.'
                      );
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#FF3B6B] transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFavorite ? 'fill-[#FF3B6B] text-[#FF3B6B]' : ''
                      }`}
                    />
                    <span>Favoritar</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareProduct}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0086FF] transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Compartilhar</span>
                  </button>
                </div>
              </div>

              <h1
                className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-slate-900 leading-snug"
                style={{ textWrap: 'balance' }}
              >
                Ar-Condicionado Split {activeVariant.btus} Gree Inverter Frio{' '}
                {activeVariant.model} - {selectedVoltage}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mt-2.5">
                <button
                  type="button"
                  onClick={() => scrollToSection('avaliacoes')}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer group"
                >
                  <div className="flex items-center gap-0.5 text-[#FF9900]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-[#FF9900] text-[#FF9900]" />
                    ))}
                  </div>
                  <span className="font-bold text-slate-800 tabular-nums">4.9</span>
                  <span className="text-slate-500 group-hover:text-[#0086FF] group-hover:underline tabular-nums">
                    (418 avaliações)
                  </span>
                </button>

                <span className="text-slate-300">·</span>

                <button
                  type="button"
                  onClick={() => scrollToSection('informacoes-produto')}
                  className="text-xs text-[#0086FF] hover:underline font-medium cursor-pointer"
                >
                  Wi-Fi Integrado · Gás Ecológico R-32 · Serpentina 100% Cobre GoldenFin
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT GALLERY + VARIANTS */}
              <div className="lg:col-span-7 space-y-6">
                <ProductGallery images={PRODUCT_IMAGES} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  {/* Capacity Selector */}
                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-2">
                      Capacidade (BTUs):{' '}
                      <span className="text-slate-900">{activeVariant.btus}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {CAPACITY_VARIANTS.map((v) => {
                        const selected = v.sku === activeVariant.sku;
                        return (
                          <button
                            key={v.sku}
                            type="button"
                            onClick={() => setSelectedSku(v.sku)}
                            className={`px-3 py-2 rounded-lg border-2 text-left transition-all cursor-pointer ${
                              selected
                                ? 'border-[#0086FF] bg-blue-50/60 text-[#0086FF]'
                                : 'border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div className="text-xs font-bold whitespace-nowrap">{v.btus}</div>
                            <div className="text-[11px] font-semibold text-emerald-700 tabular-nums">
                              {formatCurrency(v.pixPrice)} no Pix
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Working 110V and 220V Selector */}
                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-2">
                      Voltagem:{' '}
                      <span className="text-[#0086FF] font-extrabold">{selectedVoltage}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {(['110V', '220V'] as VoltageType[]).map((voltageOption) => {
                        const isSelected = selectedVoltage === voltageOption;
                        return (
                          <button
                            key={voltageOption}
                            type="button"
                            onClick={() => setSelectedVoltage(voltageOption)}
                            className={`px-4 py-2.5 rounded-lg border-2 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                              isSelected
                                ? 'border-[#0086FF] bg-blue-50/70 text-[#0086FF] shadow-2xs'
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>{voltageOption}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Disponível em <strong>110V (127V)</strong> e <strong>220V</strong> em estoque
                      imediato. Escolha a tensão desejada acima.
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT CONTIGUOUS PURCHASE MODULE */}
              <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-[#FAFAFC] p-5 sm:p-6 space-y-5 lg:sticky lg:top-6">
                <div className="flex items-center justify-between text-xs pb-3.5 border-b border-slate-200/80">
                  <div>
                    Vendido e entregue por{' '}
                    <strong className="text-[#0086FF] font-extrabold">Magalu</strong>
                  </div>
                  <span className="text-emerald-700 font-bold">
                    Em estoque ({selectedVoltage})
                  </span>
                </div>

                {/* Exact Requested Pricing */}
                <div className="space-y-1.5">
                  <div className="text-xs sm:text-sm text-slate-400 line-through tabular-nums">
                    De {formatCurrency(activeVariant.originalPrice)}
                  </div>

                  <div className="flex items-baseline flex-wrap gap-2">
                    <span className="text-3xl sm:text-[34px] font-extrabold text-slate-900 tracking-tight tabular-nums">
                      {formatCurrency(pixPrice)}
                    </span>
                    <span className="text-sm font-bold text-slate-700">no Pix</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>
                      ({activeVariant.pixDiscountPercent}% de desconto no pagamento via Pix)
                    </span>
                  </div>

                  <div className="pt-2 text-xs sm:text-sm text-slate-600 tabular-nums space-y-1">
                    <div>
                      ou{' '}
                      <strong className="text-slate-800">
                        {formatCurrency(activeVariant.cardPrice)}
                      </strong>{' '}
                      em{' '}
                      <strong className="text-slate-800">
                        10x de {formatCurrency(activeVariant.cardPrice / 10)} sem juros
                      </strong>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-700">
                      <Sparkles className="w-3.5 h-3.5 text-[#0086FF] shrink-0" />
                      <span>
                        <strong>Cartão Luiza:</strong> em até{' '}
                        <strong>
                          18x de {formatCurrency(activeVariant.cardPrice / 18)} sem juros
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="pt-1.5">
                    <button
                      type="button"
                      onClick={() => setPaymentModalOpen(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0086FF] hover:underline cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Ver mais opções de pagamento (Pix, Cartão, Boleto)</span>
                    </button>
                  </div>
                </div>

                {/* Buy Buttons */}
                <div className="space-y-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleBuyNow('pix', 'entrega')}
                    className="w-full h-13 rounded-xl bg-[#59C00B] hover:bg-[#4EA809] active:scale-[0.99] text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Comprar Agora</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddToBagOnly}
                    className="w-full h-11 rounded-xl border-2 border-[#59C00B] bg-white hover:bg-emerald-50/50 text-[#3F8E05] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Adicionar à Sacola</span>
                  </button>

                  {hasAddedToBag && (
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutInitialStep('pagamento');
                        setViewMode('checkout');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full h-10 rounded-lg bg-[#0086FF] hover:bg-[#0070D6] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Ir direto para a Parte de Pagamento</span>
                    </button>
                  )}
                </div>

                {/* CEP & Shipping Calculator */}
                <div className="pt-4 border-t border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="pdp-cep-input"
                      className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5"
                    >
                      <Truck className="w-4 h-4 text-[#0086FF]" />
                      <span>Calcular frete e prazo de entrega</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setOpenHeaderCepModal(true)}
                      className="text-[11px] font-bold text-[#0086FF] hover:underline cursor-pointer"
                    >
                      Não sei meu CEP
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handlePdpCepLookup();
                    }}
                    className="flex gap-2"
                  >
                    <input
                      id="pdp-cep-input"
                      type="text"
                      inputMode="numeric"
                      value={pdpCepInput}
                      onChange={(e) => {
                        const formatted = formatCep(e.target.value);
                        setPdpCepInput(formatted);
                        if (formatted.replace(/\D/g, '').length === 8) {
                          handlePdpCepLookup(formatted);
                        }
                      }}
                      placeholder="Digite seu CEP (00000-000)"
                      className="flex-1 h-11 px-3.5 rounded-lg bg-white border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0086FF] focus:ring-2 focus:ring-[#0086FF]/15"
                    />
                    <button
                      type="submit"
                      disabled={pdpCepLoading}
                      className="h-11 px-5 rounded-lg bg-[#0086FF] hover:bg-[#0070D6] disabled:opacity-60 text-white text-xs sm:text-sm font-bold transition-colors flex items-center justify-center cursor-pointer whitespace-nowrap"
                    >
                      {pdpCepLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'OK'
                      )}
                    </button>
                  </form>

                  {pdpCepError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                      {pdpCepError}
                    </div>
                  )}

                  {cepAddress && shippingOptions.length > 0 && (
                    <div className="space-y-2.5 pt-1">
                      <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80 text-xs text-slate-700 flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#0086FF] shrink-0 mt-0.5" />
                        <div className="leading-snug">
                          <span className="font-bold text-slate-900">
                            {cepAddress.logradouro}
                          </span>
                          {cepAddress.bairro ? `, ${cepAddress.bairro}` : ''} —{' '}
                          {cepAddress.localidade}/{cepAddress.uf} ({cepAddress.cep})
                        </div>
                      </div>

                      <div className="divide-y divide-slate-200/70 rounded-lg border border-slate-200 bg-white overflow-hidden">
                        {shippingOptions.map((opt) => {
                          const isSelected = opt.id === selectedShippingId;
                          return (
                            <label
                              key={opt.id}
                              className={`p-3 flex items-center justify-between gap-3 text-xs cursor-pointer transition-colors ${
                                isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <input
                                  type="radio"
                                  name="pdp-shipping-choice"
                                  checked={isSelected}
                                  onChange={() => setSelectedShippingId(opt.id)}
                                  className="mt-0.5 accent-[#0086FF]"
                                />
                                <div>
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    {opt.type === 'pickup' ? (
                                      <Store className="w-3.5 h-3.5 text-[#0086FF]" />
                                    ) : (
                                      <Truck className="w-3.5 h-3.5 text-[#0086FF]" />
                                    )}
                                    <span>{opt.title}</span>
                                  </div>
                                  <div className="text-slate-600 mt-0.5">{opt.etaText}</div>
                                  {opt.type === 'pickup' && (
                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                      {opt.subtitle}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="font-extrabold tabular-nums shrink-0">
                                {opt.price === 0 ? (
                                  <span className="text-emerald-700">Frete Grátis</span>
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

                <div className="pt-3 border-t border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-[#59C00B] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-slate-800">Magalu Garante:</strong> receba seu produto
                    lacrado com Nota Fiscal ou seu dinheiro de volta. Troca grátis em até 7 dias.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ProductDetailsTabs
            variant={activeVariant}
            specs={techSpecs}
            onSelectRelatedSku={(sku) => setSelectedSku(sku)}
            onQuickBuyRelated={handleQuickBuyRelated}
          />
        </main>
      )}

      {viewMode === 'pdp' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg">
          <div className="min-w-0">
            <div className="text-base font-extrabold text-slate-900 tabular-nums leading-tight">
              {formatCurrency(pixPrice)}{' '}
              <span className="text-[11px] font-bold text-emerald-700">no Pix</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate tabular-nums">
              {activeVariant.btus} · {selectedVoltage}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleBuyNow('pix', 'entrega')}
            className="h-10 px-5 rounded-lg bg-[#59C00B] hover:bg-[#4EA809] text-white text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
          >
            Comprar Agora
          </button>
        </div>
      )}

      <PaymentOptionsModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        cardPrice={activeVariant.cardPrice}
        pixPrice={pixPrice}
        pixDiscountPercent={activeVariant.pixDiscountPercent}
        onSelectMethodAndBuy={(method) => handleBuyNow(method, 'pagamento')}
      />

      <MagaluFooter />
    </div>
  );
}
