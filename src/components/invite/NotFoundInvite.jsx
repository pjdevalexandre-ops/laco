import React from 'react';
import { SearchX, ArrowLeft } from 'lucide-react';

export default function NotFoundInvite({ onBackToHome }) {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center items-center px-4 py-12 text-center">
      <div className="max-w-md w-full bg-white border border-[#E8DFC8] rounded-3xl p-8 shadow-sm space-y-5">
        
        <div className="w-16 h-16 rounded-full bg-[#FAF4EC] text-[#722F37] flex items-center justify-center mx-auto border border-[#EAE2D5]">
          <SearchX className="w-8 h-8 stroke-[1.5]" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-2xl font-bold text-[#231F1C]">
            Convite Não Encontrado
          </h1>
          <p className="text-xs text-[#6A6357] leading-relaxed">
            O endereço deste convite pode estar incorreto, ter sido alterado ou o evento já foi finalizado pelos anfitriões.
          </p>
        </div>

        <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EFE9DF] text-[11px] text-[#7A7265]">
          Por favor, confira o link enviado no WhatsApp ou solicite o endereço atualizado com quem te convidou.
        </div>

        {onBackToHome && (
          <div className="pt-2">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#722F37] hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Acessar área do ateliê</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
