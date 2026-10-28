import React, { useState } from 'react';
import {
  ChevronDown,
  Heart,
  Loader2,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { ViaCepAddress } from '../types/store';
import { formatCep, lookupCep, searchCepByStreet } from '../services/cepService';

interface MagaluHeaderProps {
  cepAddress: ViaCepAddress | null;
  onApplyCepAddress: (address: ViaCepAddress) => void;
  cartCount: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenCart: () => void;
  onGoHome: () => void;
  isCheckoutMode?: boolean;
  openCepModalExternal?: boolean;
  onCloseCepModalExternal?: () => void;
}

const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export const MagaluLogo: React.FC<{ className?: string }> = ({ className = 'h-8' }) => (
  <svg
    viewBox="0 0 185 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="Magalu"
  >
    <text
      x="0"
      y="36"
      fill="#FFFFFF"
      fontFamily="'Plus Jakarta Sans', sans-serif"
      fontWeight="800"
      fontSize="39"
      letterSpacing="-1.4"
    >
      Magalu
    </text>
    <rect x="2" y="42" width="28" height="3.5" rx="1.75" fill="#FFE600" />
    <rect x="30" y="42" width="28" height="3.5" rx="1.75" fill="#FF8C00" />
    <rect x="58" y="42" width="28" height="3.5" rx="1.75" fill="#FF0059" />
    <rect x="86" y="42" width="28" height="3.5" rx="1.75" fill="#9B00FF" />
    <rect x="114" y="42" width="28" height="3.5" rx="1.75" fill="#00E5FF" />
    <rect x="142" y="42" width="32" height="3.5" rx="1.75" fill="#00E676" />
  </svg>
);

export const MagaluHeader: React.FC<MagaluHeaderProps> = ({
  cepAddress,
  onApplyCepAddress,
  cartCount,
  isFavorite,
  onToggleFavorite,
  onOpenCart,
  onGoHome,
  isCheckoutMode = false,
  openCepModalExternal = false,
  onCloseCepModalExternal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [showDepartmentsMenu, setShowDepartmentsMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loggedUser, setLoggedUser] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');

  const [internalCepModal, setInternalCepModal] = useState(false);
  const isCepModalOpen = internalCepModal || openCepModalExternal;

  const [cepTab, setCepTab] = useState<'cep' | 'street'>('cep');
  const [cepInput, setCepInput] = useState(cepAddress?.cep || '');
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');

  const [ufSearch, setUfSearch] = useState('SP');
  const [citySearch, setCitySearch] = useState('');
  const [streetSearch, setStreetSearch] = useState('');
  const [streetResults, setStreetResults] = useState<ViaCepAddress[]>([]);
  const [streetLoading, setStreetLoading] = useState(false);

  const closeCepModal = () => {
    setInternalCepModal(false);
    setCepError('');
    if (onCloseCepModalExternal) {
      onCloseCepModalExternal();
    }
  };

  const handleLookupCep = async (e: React.FormEvent) => {
    e.preventDefault();
    setCepError('');
    setCepLoading(true);
    try {
      const result = await lookupCep(cepInput);
      onApplyCepAddress(result);
      closeCepModal();
    } catch (err) {
      setCepError(err instanceof Error ? err.message : 'Erro ao buscar CEP.');
    } finally {
      setCepLoading(false);
    }
  };

  const handleSearchByStreet = async (e: React.FormEvent) => {
    e.preventDefault();
    setCepError('');
    setStreetLoading(true);
    try {
      const results = await searchCepByStreet(ufSearch, citySearch, streetSearch);
      setStreetResults(results);
      if (results.length === 0) {
        setCepError('Nenhum CEP encontrado para esse endereço. Verifique a cidade e rua.');
      }
    } catch (err) {
      setCepError(err instanceof Error ? err.message : 'Erro ao pesquisar endereço.');
    } finally {
      setStreetLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const display = loginName.trim() || loginEmail.split('@')[0] || 'Cliente Magalu';
    setLoggedUser(display);
    setShowLoginModal(false);
  };

  if (isCheckoutMode) {
    return (
      <header className="bg-[#0086FF] text-white shadow-sm sticky top-0 z-40">
        <div className="h-1.5 w-full magalu-rainbow" />
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-3 focus:outline-none hover:opacity-95 transition-opacity cursor-pointer"
            title="Voltar para a página do produto"
          >
            <MagaluLogo className="h-9" />
          </button>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold bg-[#0070D6] px-3.5 py-2 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-[#73E212] shrink-0" />
            <span className="whitespace-nowrap">Ambiente 100% Seguro · Magalu Compra Garantida</span>
          </div>
        </div>
      </header>
    );
  }

  const suggestions = [
    'Ar-Condicionado Split 9.000 BTUs Gree Inverter Frio GWC09ATA-D6DNA1AB',
    'Ar-Condicionado Split 12.000 BTUs Gree G-Top Auto Inverter 220V',
    'Ar-Condicionado Inverter Gree R-32 Wi-Fi',
    'Kit Instalação Ar-Condicionado Split Cobre 3m',
  ].filter((item) => item.toLowerCase().includes(searchQuery.trim().toLowerCase()));

  return (
    <>
      <header className="bg-[#0086FF] text-white relative z-30 shadow-sm">
        {/* Top Institutional Bar */}
        <div className="hidden lg:block bg-[#0073DC] text-white/90 text-[11px]">
          <div className="max-w-[1280px] mx-auto px-6 h-7 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button type="button" onClick={onGoHome} className="hover:underline cursor-pointer">
                Nossas lojas
              </button>
              <button type="button" onClick={onGoHome} className="hover:underline cursor-pointer">
                Tenha sua loja
              </button>
              <button type="button" onClick={onGoHome} className="hover:underline cursor-pointer">
                Regulamentos
              </button>
              <button type="button" onClick={onGoHome} className="hover:underline cursor-pointer">
                Acessibilidade
              </button>
              <button type="button" onClick={onGoHome} className="hover:underline cursor-pointer">
                Segurança & Privacidade
              </button>
            </div>
            <div className="flex items-center gap-5">
              <span>Atendimento</span>
              <span>Compre pelo tel: 0800 773 3838</span>
              <button type="button" onClick={onOpenCart} className="hover:underline font-medium cursor-pointer">
                Meus pedidos
              </button>
            </div>
          </div>
        </div>

        {/* Main Header Row */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 lg:gap-6">
            {/* Brand + CEP Trigger */}
            <div className="flex items-center gap-4 shrink-0">
              <button
                type="button"
                onClick={onGoHome}
                className="focus:outline-none cursor-pointer shrink-0"
              >
                <MagaluLogo className="h-9 sm:h-10" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setCepInput(cepAddress?.cep || '');
                  setInternalCepModal(true);
                }}
                className="hidden sm:flex items-center gap-2 bg-[#0070D6] hover:bg-[#0063BD] transition-colors px-3 py-1.5 rounded-lg text-left max-w-[230px] cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-white shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-[11px] text-white/85 leading-tight">
                    {cepAddress ? 'Enviar para:' : 'Informe seu CEP'}
                  </div>
                  <div className="text-xs font-bold truncate leading-tight">
                    {cepAddress
                      ? `${cepAddress.localidade} - ${cepAddress.uf} (${cepAddress.cep})`
                      : 'Ver frete e prazo exato'}
                  </div>
                </div>
              </button>
            </div>

            {/* Search Input */}
            <div className="order-3 lg:order-2 w-full lg:flex-1 relative">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowSearchSuggestions(false);
                }}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setShowSearchSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 180)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busque aqui seu produto no Magalu"
                  className="w-full h-11 pl-4 pr-12 rounded-lg bg-white text-[#333333] text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 shadow-xs"
                />
                <button
                  type="submit"
                  aria-label="Buscar"
                  className="absolute right-1.5 w-9 h-9 flex items-center justify-center text-[#0086FF] hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>

              {showSearchSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-12 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3.5 py-1 text-[11px] font-semibold text-slate-400">
                    Produtos sugeridos no Magalu
                  </div>
                  {suggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setSearchQuery(item);
                        setShowSearchSuggestions(false);
                        onGoHome();
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs sm:text-sm hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5 text-[#0086FF] shrink-0" />
                      <span className="truncate">{item}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Actions: Login, Favorites, Bag */}
            <div className="order-2 lg:order-3 flex items-center gap-3 sm:gap-5 shrink-0">
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 text-left hover:opacity-90 transition-opacity cursor-pointer"
              >
                <User className="w-5 h-5 shrink-0" />
                <div className="hidden xl:block leading-tight">
                  <div className="text-xs font-semibold">
                    {loggedUser ? `Olá, ${loggedUser}` : 'Bem-vindo :)'}
                  </div>
                  <div className="text-[11px] text-white/90">
                    {loggedUser ? 'Minha conta e pedidos' : 'Entre ou cadastre-se'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={onToggleFavorite}
                aria-label="Favoritos"
                className="p-2 rounded-lg hover:bg-[#0070D6] transition-colors relative cursor-pointer"
                title="Meus Favoritos"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorite ? 'fill-[#FF3B6B] text-[#FF3B6B]' : 'text-white'
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={onOpenCart}
                aria-label="Sacola de compras"
                className="flex items-center gap-2 bg-[#0070D6] hover:bg-[#0063BD] px-3 py-2 rounded-lg transition-colors relative cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-white shrink-0" />
                <span className="hidden sm:inline text-xs font-bold whitespace-nowrap">Sacola</span>
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#59C00B] text-white text-xs font-extrabold flex items-center justify-center tabular-nums">
                  {cartCount}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile CEP Bar */}
          <div className="sm:hidden mt-2.5 pt-2 border-t border-white/15 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setCepInput(cepAddress?.cep || '');
                setInternalCepModal(true);
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-white truncate cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {cepAddress
                  ? `Enviar para: ${cepAddress.logradouro}, ${cepAddress.localidade}/${cepAddress.uf}`
                  : 'Informe seu CEP para calcular frete e prazo'}
              </span>
            </button>
          </div>
        </div>

        {/* Department Bar */}
        <div className="bg-[#0078E6] border-t border-white/15 hidden md:block">
          <div className="max-w-[1280px] mx-auto px-6 h-10 flex items-center justify-between text-xs font-semibold">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDepartmentsMenu((prev) => !prev)}
                className="flex items-center gap-2 hover:text-yellow-200 transition-colors py-2 whitespace-nowrap cursor-pointer"
              >
                <Menu className="w-4 h-4" />
                <span>Todos os departamentos</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showDepartmentsMenu && (
                <div className="absolute left-0 top-10 w-64 bg-white text-slate-700 rounded-b-lg shadow-xl border border-slate-200 py-2 z-50">
                  {[
                    'Ar e Ventilação',
                    'Eletrodomésticos',
                    'Celulares e Smartphones',
                    'TV e Vídeo',
                    'Móveis e Decoração',
                    'Eletroportáteis',
                    'Informática',
                    'Casa Inteligente',
                  ].map((dep) => (
                    <button
                      key={dep}
                      type="button"
                      onClick={() => {
                        setShowDepartmentsMenu(false);
                        onGoHome();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-blue-50 hover:text-[#0086FF] transition-colors cursor-pointer"
                    >
                      {dep}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <nav className="flex items-center gap-6 lg:gap-8 overflow-x-auto">
              {[
                'Ofertas do Dia',
                'Celulares',
                'Móveis',
                'Eletrodomésticos',
                'TV e Vídeo',
                'Informática',
                'Ar e Ventilação',
              ].map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={onGoHome}
                  className={`whitespace-nowrap hover:underline transition-colors cursor-pointer ${
                    link === 'Ar e Ventilação' ? 'text-[#FFE600] font-bold' : 'text-white'
                  }`}
                >
                  {link}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Signature Magalu Rainbow Bottom Stripe */}
        <div className="h-1 w-full magalu-rainbow" />
      </header>

      {/* CEP Lookup & Street Finder Modal */}
      {isCepModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0086FF]" />
                <h2 className="text-base font-bold text-slate-900">
                  Onde você quer receber seu pedido?
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCepModal}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              {/* Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setCepTab('cep');
                    setCepError('');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    cepTab === 'cep'
                      ? 'bg-white text-[#0086FF] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Digitar meu CEP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCepTab('street');
                    setCepError('');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    cepTab === 'street'
                      ? 'bg-white text-[#0086FF] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Não sei meu CEP
                </button>
              </div>

              {cepTab === 'cep' ? (
                <form onSubmit={handleLookupCep} className="space-y-4">
                  <p className="text-xs text-slate-600">
                    Informe seu CEP para consultarmos nos Correios o endereço exato, valores de
                    frete e disponibilidade de Retira Loja na sua cidade.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cepInput}
                      onChange={(e) => setCepInput(formatCep(e.target.value))}
                      placeholder="00000-000"
                      className="flex-1 h-11 px-3.5 rounded-lg border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#0086FF] focus:ring-2 focus:ring-[#0086FF]/20"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={cepLoading}
                      className="h-11 px-5 bg-[#0086FF] hover:bg-[#0070D6] disabled:opacity-60 text-white font-bold text-sm rounded-lg transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      {cepLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSearchByStreet} className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Estado (UF)
                      </label>
                      <select
                        value={ufSearch}
                        onChange={(e) => setUfSearch(e.target.value)}
                        className="w-full h-10 px-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0086FF]"
                      >
                        {BRAZIL_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        placeholder="Ex: São Paulo"
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0086FF]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Rua ou Avenida
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={streetSearch}
                        onChange={(e) => setStreetSearch(e.target.value)}
                        placeholder="Ex: Paulista"
                        className="flex-1 h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0086FF]"
                      />
                      <button
                        type="submit"
                        disabled={streetLoading}
                        className="h-10 px-4 bg-[#0086FF] hover:bg-[#0070D6] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        {streetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
                      </button>
                    </div>
                  </div>

                  {streetResults.length > 0 && (
                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 mt-2">
                      {streetResults.map((addr, idx) => (
                        <button
                          key={`${addr.cep}-${idx}`}
                          type="button"
                          onClick={() => {
                            onApplyCepAddress(addr);
                            closeCepModal();
                          }}
                          className="w-full px-3 py-2.5 text-left hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <div className="text-xs font-bold text-[#0086FF] font-mono">
                            {addr.cep}
                          </div>
                          <div className="text-xs text-slate-700">
                            {addr.logradouro} - {addr.bairro}, {addr.localidade}/{addr.uf}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </form>
              )}

              {cepError && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {cepError}
                </div>
              )}

              {cepAddress && (
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#59C00B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Endereço atual selecionado:</span>{' '}
                    {cepAddress.logradouro}, {cepAddress.bairro} - {cepAddress.localidade}/
                    {cepAddress.uf} ({cepAddress.cep})
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-[#0086FF] text-white">
              <h2 className="text-base font-bold">Identificação Magalu</h2>
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="p-1 rounded-lg hover:bg-white/15 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLoginSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Seu nome</label>
                <input
                  type="text"
                  required
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0086FF]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail ou CPF
                </label>
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-[#0086FF]"
                />
              </div>
              <button
                type="submit"
                className="w-full h-11 bg-[#59C00B] hover:bg-[#4EA809] text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
              >
                Continuar na minha conta
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
