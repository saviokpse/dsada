import React, { useState } from 'react';
import { Barcode, CreditCard, QrCode, Sparkles, X } from 'lucide-react';
import { PaymentMethodType } from '../types/store';
import { buildInstallments } from '../data/productData';
import { formatCurrency } from '../services/cepService';

interface PaymentOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardPrice: number;
  pixPrice: number;
  pixDiscountPercent: number;
  onSelectMethodAndBuy: (method: PaymentMethodType) => void;
}

export const PaymentOptionsModal: React.FC<PaymentOptionsModalProps> = ({
  isOpen,
  onClose,
  cardPrice,
  pixPrice,
  pixDiscountPercent,
  onSelectMethodAndBuy,
}) => {
  const [activeTab, setActiveTab] = useState<PaymentMethodType>('pix');

  if (!isOpen) return null;

  const creditInstallments = buildInstallments(cardPrice, 12);
  const luizaInstallments = buildInstallments(cardPrice, 18);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Formas de pagamento no Magalu
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-3 bg-slate-100 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('pix')}
            className={`py-2 px-2 rounded-lg text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'pix'
                ? 'bg-white text-[#0086FF] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4 shrink-0" />
            <span>Pix ({pixDiscountPercent}% OFF)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('credit_card')}
            className={`py-2 px-2 rounded-lg text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'credit_card'
                ? 'bg-white text-[#0086FF] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4 shrink-0" />
            <span>Cartão de Crédito</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cartao_luiza')}
            className={`py-2 px-2 rounded-lg text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'cartao_luiza'
                ? 'bg-white text-[#0086FF] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Cartão Luiza</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('boleto')}
            className={`py-2 px-2 rounded-lg text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'boleto'
                ? 'bg-white text-[#0086FF] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Barcode className="w-4 h-4 shrink-0" />
            <span>Boleto</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'pix' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-emerald-800">
                    Pagamento à vista com aprovação imediata
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-0.5">
                    {formatCurrency(pixPrice)}
                  </div>
                  <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                    Economia imediata de {formatCurrency(cardPrice - pixPrice)} ({pixDiscountPercent}% de desconto)
                  </div>
                </div>
                <QrCode className="w-12 h-12 text-emerald-600 shrink-0" />
              </div>

              <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>
                  <strong>Como funciona o Pix no Magalu:</strong> Ao finalizar sua compra, geramos um
                  código QR Code e link <em>Pix Copia e Cola</em> válido por 30 minutos.
                </p>
                <p>
                  Assim que o pagamento é confirmado pelo seu banco, a nota fiscal e a separação do
                  seu Ar-Condicionado Gree iniciam imediatamente!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'credit_card' && (
            <div>
              <p className="text-xs text-slate-500 mb-3">
                Aceitamos Visa, Mastercard, Elo, Hipercard e American Express em até{' '}
                <strong className="text-slate-800">10x sem juros</strong>:
              </p>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs sm:text-sm tabular-nums">
                {creditInstallments.map((row) => (
                  <div
                    key={row.count}
                    className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{row.count}x</span> de{' '}
                      <span className="font-bold text-slate-900">
                        {formatCurrency(row.perMonth)}
                      </span>{' '}
                      <span
                        className={
                          row.interestFree ? 'text-emerald-700 font-semibold' : 'text-slate-500'
                        }
                      >
                        {row.interestFree ? 'sem juros' : 'com juros (1,99% a.m.)'}
                      </span>
                    </div>
                    <div className="text-slate-500 text-xs">Total: {formatCurrency(row.total)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'cartao_luiza' && (
            <div>
              <div className="p-3.5 mb-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-slate-700">
                <strong className="text-[#0086FF]">Condição Exclusiva Cartão Luiza:</strong> Parcele
                seu Ar-Condicionado Gree em até <strong>18x sem juros</strong> ou ganhe{' '}
                <strong>{pixDiscountPercent}% de desconto</strong> em 1x na fatura!
              </div>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs sm:text-sm tabular-nums">
                <div className="px-4 py-2.5 flex items-center justify-between bg-emerald-50/40">
                  <div>
                    <span className="font-bold text-slate-800">1x no Cartão Luiza</span> de{' '}
                    <span className="font-bold text-emerald-700">{formatCurrency(pixPrice)}</span>{' '}
                    <span className="text-emerald-700 font-semibold">
                      ({pixDiscountPercent}% de desconto)
                    </span>
                  </div>
                  <div className="text-slate-500 text-xs">Total: {formatCurrency(pixPrice)}</div>
                </div>
                {luizaInstallments.slice(1).map((row) => (
                  <div
                    key={row.count}
                    className="px-4 py-2 flex items-center justify-between hover:bg-slate-50"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{row.count}x</span> de{' '}
                      <span className="font-bold text-slate-900">
                        {formatCurrency(row.perMonth)}
                      </span>{' '}
                      <span className="text-emerald-700 font-semibold">sem juros</span>
                    </div>
                    <div className="text-slate-500 text-xs">Total: {formatCurrency(row.total)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'boleto' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Valor à vista no Boleto Bancário</div>
                  <div className="text-2xl font-extrabold text-slate-900 tabular-nums mt-0.5">
                    {formatCurrency(cardPrice)}
                  </div>
                </div>
                <Barcode className="w-12 h-12 text-slate-700" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                O boleto bancário é gerado na finalização do pedido e pode ser pago em qualquer
                banco, aplicativo bancário ou casa lotérica até a data de vencimento. A compensação
                bancária ocorre em até 2 dias úteis.
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Voltar ao produto
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectMethodAndBuy(activeTab);
              onClose();
            }}
            className="px-5 py-2.5 bg-[#59C00B] hover:bg-[#4EA809] text-white text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Comprar com esta opção
          </button>
        </div>
      </div>
    </div>
  );
};
