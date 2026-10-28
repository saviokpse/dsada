import React from 'react';
import { Barcode, CreditCard, Lock, PhoneCall, QrCode, ShieldCheck } from 'lucide-react';
import { MagaluLogo } from './MagaluHeader';

export const MagaluFooter: React.FC = () => {
  return (
    <footer className="bg-[#0086FF] text-white mt-14">
      <div className="h-1.5 w-full magalu-rainbow" />

      {/* Payment Methods & Security Strip */}
      <div className="bg-[#0073DC] border-b border-white/15">
        <div className="max-w-[1280px] mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <div className="text-xs font-bold mb-2 text-white/95">
              Formas de pagamento aceitas
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-md">
                <QrCode className="w-3.5 h-3.5" /> Pix
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-md">
                <CreditCard className="w-3.5 h-3.5" /> Cartão Luiza
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-md">
                <CreditCard className="w-3.5 h-3.5" /> Visa · Master · Elo · Hiper
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-md">
                <Barcode className="w-3.5 h-3.5" /> Boleto
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PhoneCall className="w-7 h-7 text-yellow-300 shrink-0" />
            <div className="text-xs leading-relaxed">
              <div className="font-bold text-sm">Compre pelo Telefone</div>
              <div className="text-white/90">0800 773 3838 · Seg. a Sáb. das 8h às 20h</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#73E212] shrink-0" />
            <div className="text-xs leading-relaxed">
              <div className="font-bold text-sm flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Certificados e Segurança
              </div>
              <div className="text-white/90">
                Criptografia SSL 256-bits · Selo RA1000 Reclame Aqui
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-[1280px] mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs">
        <div className="space-y-2.5">
          <div className="font-bold text-sm mb-3">Departamentos</div>
          <p className="text-white/85">Ar e Ventilação</p>
          <p className="text-white/85">Eletrodomésticos</p>
          <p className="text-white/85">TV e Vídeo</p>
          <p className="text-white/85">Celulares e Smartphones</p>
          <p className="text-white/85">Casa Inteligente</p>
        </div>

        <div className="space-y-2.5">
          <div className="font-bold text-sm mb-3">Central de Atendimento</div>
          <p className="text-white/85">Acompanhar meu pedido</p>
          <p className="text-white/85">Trocas e devoluções (7 dias grátis)</p>
          <p className="text-white/85">Segunda via de Nota Fiscal</p>
          <p className="text-white/85">Instalação de Ar-Condicionado</p>
          <p className="text-white/85">Portal de Privacidade (LGPD)</p>
        </div>

        <div className="space-y-2.5">
          <div className="font-bold text-sm mb-3">Serviços Magalu</div>
          <p className="text-white/85">Cartão Luiza</p>
          <p className="text-white/85">MagaluPay</p>
          <p className="text-white/85">Garantia Estendida</p>
          <p className="text-white/85">Retira Loja Grátis</p>
          <p className="text-white/85">Consórcio Magalu</p>
        </div>

        <div className="space-y-2.5">
          <div className="font-bold text-sm mb-3">Institucional</div>
          <p className="text-white/85">Quem somos</p>
          <p className="text-white/85">Nossas lojas físicas</p>
          <p className="text-white/85">Investidores</p>
          <p className="text-white/85">Trabalhe conosco</p>
          <p className="text-white/85">Imprensa</p>
        </div>
      </div>

      {/* Legal Bottom Note */}
      <div className="bg-[#0064C2] py-6 px-6 text-[11px] text-white/80">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <MagaluLogo className="h-7 shrink-0" />
          <p className="text-center sm:text-right leading-relaxed max-w-3xl">
            Magazine Luiza S/A - CNPJ: 47.960.950/1088-36 - Rua Arnulfo de Lima, 2385 - Vila Santa
            Cruz - CEP: 14.403-471 - Franca/SP. Preços e condições de pagamento exclusivos para
            compras via internet, podendo variar nas lojas físicas. Estoque sujeito a confirmação.
          </p>
        </div>
      </div>
    </footer>
  );
};
