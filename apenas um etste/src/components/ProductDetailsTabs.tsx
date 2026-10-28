import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  ShieldCheck,
  Snowflake,
  Star,
  ThumbsUp,
  Volume2,
  Wifi,
} from 'lucide-react';
import {
  CapacityVariant,
  CustomerReview,
  TechSpecItem,
} from '../types/store';
import {
  INITIAL_REVIEWS,
  RELATED_PRODUCTS,
  RelatedProduct,
} from '../data/productData';
import { formatCurrency } from '../services/cepService';

interface ProductDetailsTabsProps {
  variant: CapacityVariant;
  specs: TechSpecItem[];
  onSelectRelatedSku: (sku: string) => void;
  onQuickBuyRelated: (item: RelatedProduct) => void;
}

export const ProductDetailsTabs: React.FC<ProductDetailsTabsProps> = ({
  variant,
  specs,
  onSelectRelatedSku,
  onQuickBuyRelated,
}) => {
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [reviews, setReviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [helpfulClicked, setHelpfulClicked] = useState<Record<string, boolean>>({});
  const [showReviewForm, setShowReviewForm] = useState(false);

  const [newAuthor, setNewAuthor] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');

  const displayedSpecs = showAllSpecs ? specs : specs.slice(0, 12);

  const filteredReviews = starFilter
    ? reviews.filter((r) => r.rating === starFilter)
    : reviews;

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newTitle.trim() || !newComment.trim()) return;
    const created: CustomerReview = {
      id: `rev-${Date.now()}`,
      author: newAuthor.trim(),
      cityUf: newCity.trim() || 'Brasil',
      rating: newRating,
      date: 'Agora mesmo',
      title: newTitle.trim(),
      comment: newComment.trim(),
      recommends: newRating >= 4,
      helpfulCount: 1,
      verifiedPurchase: true,
    };
    setReviews([created, ...reviews]);
    setNewAuthor('');
    setNewCity('');
    setNewTitle('');
    setNewComment('');
    setShowReviewForm(false);
  };

  return (
    <div className="space-y-8 mt-8">
      {/* Section 1: Informações do Produto */}
      <section
        id="informacoes-produto"
        className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
          Informações do Produto
        </h2>
        <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-3">
          Ar-Condicionado Split {variant.btus} Gree Inverter Frio {variant.model}
        </h3>

        <div className="space-y-4 text-sm sm:text-[15px] text-slate-600 leading-relaxed max-w-4xl">
          <p>
            O <strong>Ar-Condicionado Split Hi-Wall Gree G-Top Auto Inverter {variant.btus} Frio ({variant.model})</strong> foi projetado pela maior fabricante mundial especializada em climatização para entregar resfriamento ultrarrápido, silêncio absoluto e máxima economia na conta de energia elétrica. Equipado com compressor <strong>Inverter de última geração</strong> e algoritmos inteligentes de controle de frequência, o aparelho mantém a temperatura desejada sem picos de energia, reduzindo o consumo em até <strong>60%</strong> em comparação aos modelos convencionais (Classificação A Procel Ouro no INMETRO).
          </p>
          <p>
            Com <strong>Wi-Fi e Bluetooth já integrados de fábrica</strong>, você controla seu ar-condicionado de qualquer lugar pelo aplicativo oficial <strong>Gree+</strong> no smartphone ou por comandos de voz via <strong>Amazon Alexa e Google Assistente</strong>. Além disso, utiliza o fluido refrigerante ecológico <strong>R-32</strong>, que potencializa a troca térmica e respeita o meio ambiente.
          </p>
          <p>
            Construído para durar muitos anos mesmo em regiões litorâneas, conta com <strong>tubulação 100% em cobre</strong> e proteção anticorrosão <strong>BlueFin / GoldenFin</strong> nas aletas da evaporadora e da condensadora, respaldado por até <strong>10 anos de garantia no compressor</strong> e 5 anos nas demais peças.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-7 pt-7 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <Cpu className="w-6 h-6 text-[#0086FF] mb-2.5" />
            <div className="text-sm font-bold text-slate-900 mb-1">
              Tecnologia Auto Inverter R-32
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Estabiliza a temperatura sem desligamentos bruscos, com eficiência energética Classe A Procel Ouro.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <Wifi className="w-6 h-6 text-[#0086FF] mb-2.5" />
            <div className="text-sm font-bold text-slate-900 mb-1">
              Wi-Fi Integrado + Voz
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ligue, programe rotinas e ajuste a temperatura pelo celular no App Gree+, Google Home ou Alexa.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <Volume2 className="w-6 h-6 text-[#0086FF] mb-2.5" />
            <div className="text-sm font-bold text-slate-900 mb-1">
              Ultrassilencioso (25 dB)
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              7 velocidades de ventilação, modo Sono inteligente e opção de apagar o LED frontal durante a noite.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
            <Award className="w-6 h-6 text-[#0086FF] mb-2.5" />
            <div className="text-sm font-bold text-slate-900 mb-1">
              Serpentina 100% Cobre
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Alta resistência contra oxidação e maresia com 10 anos de garantia no compressor Gree.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Ficha Técnica */}
      <section
        id="ficha-tecnica"
        className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Ficha Técnica</h2>
          <span className="text-xs text-slate-500 font-mono">
            Cód. Magalu: {variant.sku}
          </span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          {displayedSpecs.map((item, idx) => (
            <div
              key={item.label}
              className={`grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 px-4 sm:px-5 py-3 text-xs sm:text-sm ${
                idx % 2 === 0 ? 'bg-slate-50/80' : 'bg-white'
              }`}
            >
              <div className="font-semibold text-slate-700">{item.label}</div>
              <div className="sm:col-span-2 text-slate-600">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAllSpecs((prev) => !prev)}
            className="px-5 py-2.5 rounded-lg border border-[#0086FF] text-[#0086FF] hover:bg-blue-50 text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>
              {showAllSpecs
                ? 'Ocultar especificações completas'
                : `Ver todas as ${specs.length} especificações técnicas`}
            </span>
            {showAllSpecs ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </section>

      {/* Section 3: Avaliações dos Clientes */}
      <section
        id="avaliacoes"
        className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Avaliações dos Clientes
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Opiniões reais de quem comprou no Magalu
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowReviewForm((prev) => !prev)}
            className="px-4 py-2.5 rounded-lg border border-[#0086FF] text-[#0086FF] hover:bg-blue-50 text-xs sm:text-sm font-bold transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap"
          >
            {showReviewForm ? 'Cancelar avaliação' : 'Avaliar produto'}
          </button>
        </div>

        {/* Review Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-100 items-center">
          <div className="flex items-center gap-4">
            <div className="text-5xl font-extrabold text-slate-900 tabular-nums">4.9</div>
            <div>
              <div className="flex items-center gap-0.5 text-[#FF9900]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-[#FF9900] text-[#FF9900]" />
                ))}
              </div>
              <div className="text-xs text-slate-500 mt-1 tabular-nums">
                Baseado em 418 avaliações verificadas
              </div>
              <div className="text-xs font-semibold text-emerald-700 mt-1">
                98% dos clientes recomendam
              </div>
            </div>
          </div>

          {/* Star Breakdown Filter */}
          <div className="space-y-1.5">
            {[
              { stars: 5, pct: 91 },
              { stars: 4, pct: 7 },
              { stars: 3, pct: 2 },
              { stars: 2, pct: 0 },
              { stars: 1, pct: 0 },
            ].map((row) => (
              <button
                key={row.stars}
                type="button"
                onClick={() =>
                  setStarFilter((prev) => (prev === row.stars ? null : row.stars))
                }
                className={`w-full flex items-center gap-2.5 text-xs py-0.5 rounded px-1.5 transition-colors cursor-pointer ${
                  starFilter === row.stars ? 'bg-blue-50 font-bold text-[#0086FF]' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span className="w-14 text-left whitespace-nowrap tabular-nums">
                  {row.stars} estrelas
                </span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF9900] rounded-full"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="w-9 text-right tabular-nums">{row.pct}%</span>
              </button>
            ))}
          </div>

          {/* Quality Attributes */}
          <div className="space-y-2.5 text-xs">
            {[
              { label: 'Poder de Refrigeração', score: '4.9' },
              { label: 'Nível de Silêncio', score: '4.9' },
              { label: 'Economia de Energia', score: '4.8' },
              { label: 'Conectividade Wi-Fi / App', score: '4.8' },
            ].map((attr) => (
              <div key={attr.label} className="flex items-center justify-between">
                <span className="text-slate-600">{attr.label}</span>
                <div className="flex items-center gap-1.5 font-bold text-slate-800 tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-[#FF9900] text-[#FF9900]" />
                  <span>{attr.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional New Review Form */}
        {showReviewForm && (
          <form
            onSubmit={handleAddReview}
            className="my-6 p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-900">Escreva sua avaliação</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seu nome
                </label>
                <input
                  type="text"
                  required
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="Ex: Roberto Alves"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:border-[#0086FF]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cidade / UF
                </label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="Ex: Campinas, SP"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:border-[#0086FF]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nota
                </label>
                <select
                  value={newRating}
                  onChange={(e) => setNewRating(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:border-[#0086FF]"
                >
                  <option value={5}>5 estrelas - Excelente</option>
                  <option value={4}>4 estrelas - Muito Bom</option>
                  <option value={3}>3 estrelas - Bom</option>
                  <option value={2}>2 estrelas - Regular</option>
                  <option value={1}>1 estrela - Ruim</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título da avaliação
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Silencioso e gela muito rápido!"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:border-[#0086FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Comentário sobre o produto
              </label>
              <textarea
                rows={3}
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Conte como foi sua experiência com o Ar-Condicionado Gree..."
                className="w-full p-3 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:border-[#0086FF]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#59C00B] hover:bg-[#4EA809] text-white text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer"
            >
              Publicar Avaliação
            </button>
          </form>
        )}

        {/* Filter Reset Notice */}
        {starFilter && (
          <div className="mt-4 flex items-center justify-between text-xs bg-blue-50 text-[#0086FF] px-4 py-2 rounded-lg">
            <span>Exibindo avaliações com {starFilter} estrelas</span>
            <button
              type="button"
              onClick={() => setStarFilter(null)}
              className="font-bold underline cursor-pointer"
            >
              Mostrar todas
            </button>
          </div>
        )}

        {/* Review List */}
        <div className="divide-y divide-slate-100 mt-4">
          {filteredReviews.map((rev) => {
            const liked = helpfulClicked[rev.id];
            return (
              <div key={rev.id} className="py-5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[#FF9900]">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${
                          idx < rev.rating
                            ? 'fill-[#FF9900] text-[#FF9900]'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">{rev.date}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900">{rev.title}</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {rev.comment}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">{rev.author}</span>
                    <span>·</span>
                    <span>{rev.cityUf}</span>
                    {rev.verifiedPurchase && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Compra verificada no Magalu
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setHelpfulClicked((prev) => ({
                        ...prev,
                        [rev.id]: !prev[rev.id],
                      }))
                    }
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors cursor-pointer tabular-nums ${
                      liked
                        ? 'border-[#0086FF] bg-blue-50 text-[#0086FF] font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Útil ({rev.helpfulCount + (liked ? 1 : 0)})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: Quem viu este produto, viu também */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-5">
          Quem viu este produto, viu também
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {RELATED_PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className="rounded-xl border border-slate-200 p-4 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all bg-white"
            >
              <div>
                <div className="aspect-[4/3] w-full rounded-lg bg-slate-50 p-3 mb-3 flex items-center justify-center overflow-hidden">
                  <img
                    src={prod.image}
                    alt={prod.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-1.5 tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-[#FF9900] text-[#FF9900]" />
                  <span className="font-bold text-slate-700">{prod.rating}</span>
                  <span>({prod.reviews})</span>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-2">
                  {prod.title}
                </h3>
              </div>

              <div className="pt-2">
                <div className="text-xs text-slate-400 line-through tabular-nums">
                  {formatCurrency(prod.oldPrice)}
                </div>
                <div className="text-lg font-extrabold text-slate-900 tabular-nums">
                  {formatCurrency(prod.pixPrice)}{' '}
                  <span className="text-xs font-semibold text-emerald-700">no Pix</span>
                </div>
                <div className="text-[11px] text-slate-500 tabular-nums mb-3">
                  ou {prod.installmentText}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (['241051300', '241051400'].includes(prod.sku)) {
                      onSelectRelatedSku(prod.sku);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                      onQuickBuyRelated(prod);
                    }
                  }}
                  className="w-full py-2 rounded-lg bg-[#0086FF] hover:bg-[#0070D6] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {['241051300', '241051400'].includes(prod.sku)
                    ? 'Ver esta capacidade'
                    : 'Comprar junto'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Magalu Guarantee Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[#59C00B] shrink-0" />
          <div>
            <div className="text-sm font-bold text-slate-900">
              Magalu Garante a sua compra do início ao fim
            </div>
            <div className="text-xs text-slate-600">
              Produto novo, lacrado de fábrica, com Nota Fiscal Eletrônica e garantia oficial Gree no Brasil.
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5 shrink-0">
          <Snowflake className="w-4 h-4 text-[#0086FF]" />
          <span>Revendedor Oficial Autorizado Gree</span>
        </div>
      </div>
    </div>
  );
};
