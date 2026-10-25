import React, { useState } from 'react';
import { 
  Calculator, 
  Users, 
  Wine, 
  Coffee, 
  HelpCircle, 
  ShoppingCart, 
  Sliders, 
  RotateCcw, 
  Check, 
  Info,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { calculateEventSupplies, DEFAULT_CONSUMPTION_FACTORS } from '../../services/calculator';
import { storage } from '../../services/storage';

export default function EventCalculator({ event, confirmedGuestsCount, totalGuestsCount, onGoToShopping }) {
  const confirmedNum = Number(confirmedGuestsCount) || 0;
  
  // Se houver confirmados reais, usa-os; caso contrário, inicia com 0
  const [adultsCount, setAdultsCount] = useState(confirmedNum > 0 ? Math.round(confirmedNum * 0.85) : 0);
  const [childrenCount, setChildrenCount] = useState(confirmedNum > 0 ? Math.max(0, confirmedNum - Math.round(confirmedNum * 0.85)) : 0);
  const [hasAlcohol, setHasAlcohol] = useState(event.eventType !== 'infantil');
  const [customFactors, setCustomFactors] = useState({});
  const [copiedToShopping, setCopiedToShopping] = useState(false);

  // Executa o cálculo com os fatores atuais
  const calculation = calculateEventSupplies(adultsCount, childrenCount, customFactors, hasAlcohol);

  const handleFactorChange = (key, type, val) => {
    const num = Math.max(0, Number(val) || 0);
    setCustomFactors({
      ...customFactors,
      [key]: {
        ...(customFactors[key] || {}),
        [type]: num,
      }
    });
  };

  const handleResetFactors = () => {
    setCustomFactors({});
  };

  // Envia todos os itens calculados para a Lista de Compras
  const handleExportToShopping = () => {
    Object.values(calculation.items).forEach((item) => {
      const shoppingItem = {
        id: `shp-calc-${event.id}-${item.key}`,
        eventId: event.id,
        name: item.name,
        category: item.category,
        quantityNeeded: item.purchaseQuantity,
        unit: item.unit,
        quantityBought: 0,
        estimatedPrice: 0,
        actualPrice: 0,
        isPurchased: false,
      };
      storage.addOrUpdateShoppingItem(shoppingItem);
    });

    setCopiedToShopping(true);
    setTimeout(() => {
      setCopiedToShopping(false);
      if (onGoToShopping) onGoToShopping();
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Alerta quando ainda não há confirmados */}
      {confirmedNum === 0 && adultsCount === 0 && childrenCount === 0 && (
        <div className="bg-[#FAF4EC] border border-[#E3D7C5] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-[#EFE9DF] text-[#722F37] flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#722F37]">Ainda não há presenças confirmadas</h4>
            <p className="text-xs text-[#6A6357] mt-0.5 leading-relaxed">
              Este evento ainda não possui confirmações registradas. Digite a quantidade de adultos e crianças manualmente abaixo para calcular os suprimentos necessários.
            </p>
          </div>
        </div>
      )}

      {/* Alerta de Esclarecimento sobre Estimativas */}
      <div className="bg-[#FAF4EC] border border-[#E3D7C5] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-lg bg-[#EFE9DF] text-[#722F37] flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#722F37]">Estimativas Ajustáveis</h4>
          <p className="text-xs text-[#6A6357] mt-0.5 leading-relaxed">
            Estes cálculos são parâmetros recomendados pelo mercado para eventos com duração média de 4 a 5 horas. Cada celebração é única: você pode calibrar as quantidades por adulto e criança diretamente nos controles abaixo.
          </p>
        </div>
      </div>

      {/* Painel de Parâmetros de Entrada */}
      <div className="bg-white border border-[#E8DFC8] rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F2ECE1] pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#722F37]" />
            <h3 className="font-serif text-xl text-[#231F1C]">Base de Pessoas para o Cálculo</h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={confirmedNum === 0}
              onClick={() => {
                if (confirmedNum > 0) {
                  setAdultsCount(Math.round(confirmedNum * 0.85));
                  setChildrenCount(Math.max(0, confirmedNum - Math.round(confirmedNum * 0.85)));
                }
              }}
              className={`text-xs font-semibold ${
                confirmedNum > 0 ? 'text-[#722F37] hover:underline cursor-pointer' : 'text-[#A69C8E] cursor-not-allowed'
              }`}
            >
              {confirmedNum > 0 ? `Usar ${confirmedNum} confirmados do evento` : 'Nenhum confirmado ainda'}
            </button>
            <button
              onClick={handleResetFactors}
              title="Restaurar fatores padrão"
              className="inline-flex items-center gap-1 text-xs text-[#8E8679] hover:text-[#231F1C]"
            >
              <RotateCcw className="w-3 h-3" />
              Restaurar padrões
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EAE2D5]">
            <label className="block text-xs font-semibold text-[#3D362C] mb-1">
              Adultos Consumidores
            </label>
            <input
              type="number"
              min="0"
              value={adultsCount}
              onChange={(e) => setAdultsCount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-white border border-[#D8CFC4] rounded-lg px-3 py-2 text-center font-bold text-lg text-[#231F1C]"
            />
          </div>

          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EAE2D5]">
            <label className="block text-xs font-semibold text-[#3D362C] mb-1">
              Crianças (até 10 anos)
            </label>
            <input
              type="number"
              min="0"
              value={childrenCount}
              onChange={(e) => setChildrenCount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-white border border-[#D8CFC4] rounded-lg px-3 py-2 text-center font-bold text-lg text-[#231F1C]"
            />
          </div>

          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#EAE2D5] flex flex-col justify-between">
            <span className="block text-xs font-semibold text-[#3D362C] mb-1">
              Bebidas Alcoólicas
            </span>
            <label className="inline-flex items-center gap-2 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={hasAlcohol}
                onChange={(e) => setHasAlcohol(e.target.checked)}
                className="w-4 h-4 text-[#722F37] rounded border-[#D8CFC4] focus:ring-[#722F37]"
              />
              <span className="text-xs font-medium text-[#4D453A]">
                {hasAlcohol ? 'Incluir cerveja e espumante' : 'Apenas bebidas não alcoólicas'}
              </span>
            </label>
          </div>

        </div>
      </div>

      {/* Grade de Itens Calculados com Fórmula e Detalhes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Object.values(calculation.items).map((item) => {
          return (
            <div 
              key={item.key}
              className="bg-white border border-[#E8DFC8] rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Cabeçalho do Card */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FAF4EC] text-[#722F37]">
                    {item.category}
                  </span>
                  <span className="text-[11px] text-[#8E8679] font-medium">
                    {item.perAdult} {item.consumptionUnit || 'un'} / adulto
                  </span>
                </div>

                <h4 className="font-serif text-lg text-[#231F1C] font-bold leading-tight">
                  {item.name}
                </h4>

                {/* Destaque da Quantidade Calculada */}
                <div className="my-3 p-3 rounded-xl bg-[#FAF7F2] border border-[#F2ECE1]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] text-[#7A7265] uppercase font-semibold">Quantidade Sugerida:</span>
                    <span className="font-serif text-2xl font-bold text-[#722F37]">
                      {item.purchaseQuantity} <span className="text-xs font-sans text-[#6A6357] font-normal">{item.unit}</span>
                    </span>
                  </div>
                  {item.rawTotal !== item.purchaseQuantity && (
                    <span className="text-[10px] text-[#8E8679] block mt-0.5">
                      Consumo exato calculado: {item.displayQuantity} {item.unit}
                    </span>
                  )}
                </div>

                {/* Fórmula e Racional do Cálculo */}
                <div className="text-[11px] text-[#6A6357] bg-[#FFFFFF] p-2.5 rounded-lg border border-[#EFE9DF] space-y-1">
                  <span className="font-semibold text-[#3D362C] block">Fórmula de cálculo:</span>
                  <p className="font-mono text-[10px] text-[#722F37] bg-[#FAF4EC] px-1.5 py-0.5 rounded">
                    {item.formula}
                  </p>
                  <p className="text-[#8E8679] text-[10px] leading-tight pt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Controles de Ajuste da Cota por Pessoa */}
              <div className="mt-4 pt-3 border-t border-[#F2ECE1] flex items-center justify-between gap-2 text-xs">
                <span className="text-[#7A7265] text-[11px]">Ajustar cota adulto:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={item.perAdult}
                    onChange={(e) => handleFactorChange(item.key, 'perAdult', e.target.value)}
                    className="w-14 bg-[#FAF7F2] border border-[#D8CFC4] rounded px-1.5 py-0.5 text-center text-xs font-bold"
                  />
                  <span className="text-[10px] text-[#8E8679]">{item.consumptionUnit || 'un'}/ad.</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Ação: Exportar para Lista de Compras */}
      <div className="bg-[#FAF4EC] border border-[#E3D7C5] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-serif text-xl text-[#231F1C]">Deseja transformar este cálculo na Lista de Compras?</h4>
          <p className="text-xs text-[#6A6357] mt-0.5">
            Os itens e quantidades calculadas serão lançados diretamente na aba de compras do evento.
          </p>
        </div>

        <button
          onClick={handleExportToShopping}
          className="inline-flex items-center gap-2 bg-[#722F37] hover:bg-[#581C23] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          {copiedToShopping ? (
            <>
              <Check className="w-4 h-4 text-[#A3E635]" />
              <span>Itens Exportados com Sucesso!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>Enviar para Lista de Compras</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
