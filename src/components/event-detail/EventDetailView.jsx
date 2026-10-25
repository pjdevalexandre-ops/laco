import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  Copy, 
  Check, 
  Share2, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Calculator, 
  ShoppingCart, 
  DollarSign, 
  Printer, 
  Sparkles, 
  Edit3, 
  Palette,
  CheckCircle2
} from 'lucide-react';
import GuestManager from '../guests/GuestManager';
import EventCalculator from '../calculator/EventCalculator';
import ShoppingList from '../shopping/ShoppingList';
import BudgetTracker from '../budget/BudgetTracker';
import DigitalInvitation from '../invite/DigitalInvitation';
import { storage } from '../../services/storage';

export default function EventDetailView({ 
  event, 
  onBack, 
  onEditEvent, 
  onOpenPublicInvite 
}) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'invite' | 'guests' | 'calculator' | 'shopping' | 'budget' | 'report'
  const [copiedLink, setCopiedLink] = useState(false);
  const [, setForceUpdate] = useState({});

  const handleUpdate = () => {
    setForceUpdate({});
  };

  const guests = storage.getGuests(event.id);
  const totalGuests = guests.reduce((sum, g) => sum + (g.adultsCount + g.childrenCount), 0);
  const confirmedGuests = guests
    .filter((g) => g.status === 'confirmed')
    .reduce((sum, g) => sum + (g.adultsCount + g.childrenCount), 0);

  const expenses = storage.getExpenses(event.id);
  const totalSpent = expenses
    .filter((e) => e.status === 'pago')
    .reduce((sum, e) => sum + (Number(e.actualAmount) || 0), 0);

  const shopping = storage.getShopping(event.id);
  const shoppingBought = shopping.filter((s) => s.isPurchased).length;

  const publicUrl = `${window.location.origin}/#invite=${event.slug || event.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Topo: Voltar e Título */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8DFC8]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl text-[#6A6357] hover:bg-[#EFE9DF] transition-all"
            title="Voltar para a lista de eventos"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span 
                className="text-xs uppercase font-bold px-2.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${event.theme?.primaryColor || '#722F37'}15`,
                  color: event.theme?.primaryColor || '#722F37',
                }}
              >
                {event.eventType.toUpperCase()}
              </span>
              <span className="text-xs text-[#8E8679]">Criado em {new Date(event.createdAt || Date.now()).toLocaleDateString('pt-BR')}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#231F1C] mt-0.5">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Ações Rápidas no Cabeçalho */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-[#D8CFC4] text-[#6A6357] hover:bg-[#FAF7F2] transition-all"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#4E6037]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link Público'}</span>
          </button>

          <button
            onClick={() => onOpenPublicInvite(event)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-[#D8CFC4] text-[#6A6357] hover:bg-[#FAF7F2] transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver Como Convidado</span>
          </button>

          <button
            onClick={() => onEditEvent(event)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#722F37] hover:bg-[#581C23] text-white shadow-sm transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editar Convite & Design</span>
          </button>
        </div>
      </div>

      {/* Abas de Navegação do Evento */}
      <div className="no-print border-b border-[#E8DFC8] flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'overview', label: 'Início', icon: Sparkles },
          { id: 'invite', label: 'Convite', icon: Palette },
          { id: 'guests', label: `Convidados (${confirmedGuests}/${totalGuests})`, icon: Users },
          { id: 'calculator', label: 'Consumo', icon: Calculator },
          { id: 'shopping', label: `Compras (${shoppingBought}/${shopping.length})`, icon: ShoppingCart },
          { id: 'budget', label: 'Gastos', icon: DollarSign },
          { id: 'report', label: 'Resumo', icon: Printer },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-[#722F37] text-[#722F37] bg-[#FAF4EC]/40'
                  : 'border-transparent text-[#6A6357] hover:text-[#231F1C] hover:border-[#D8CFC4]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CONTEÚDO DAS ABAS */}
      
      {/* 1. VISÃO GERAL */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* Card Principal de Ficha do Evento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="md:col-span-2 bg-white rounded-2xl border border-[#E8DFC8] p-6 shadow-xs space-y-4">
              <h3 className="font-serif text-xl text-[#231F1C] border-b border-[#F2ECE1] pb-3">
                Detalhes da Celebração
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#8E8679] block">Anfitriões:</span>
                  <span className="font-semibold text-sm text-[#231F1C]">{event.hosts}</span>
                </div>

                <div>
                  <span className="text-[#8E8679] block">Data e Horário:</span>
                  <span className="font-semibold text-sm text-[#231F1C]">
                    {event.date.split('-').reverse().join('/')} às {event.time}
                  </span>
                </div>

                <div>
                  <span className="text-[#8E8679] block">Local do Evento:</span>
                  <span className="font-semibold text-sm text-[#231F1C]">{event.locationName}</span>
                  <p className="text-[#6A6357] text-[11px] mt-0.5">{event.locationAddress}</p>
                </div>

                <div>
                  <span className="text-[#8E8679] block">Prazo de Confirmação (RSVP):</span>
                  <span className="font-semibold text-sm text-[#231F1C]">
                    {event.rsvpDeadline ? event.rsvpDeadline.split('-').reverse().join('/') : 'Não definido'}
                  </span>
                </div>
              </div>

              {event.customMessage && (
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAE2D5] text-xs">
                  <span className="font-semibold text-[#3D362C] block mb-1">Mensagem do Convite:</span>
                  <p className="italic text-[#5A5043]">"{event.customMessage}"</p>
                </div>
              )}

              {event.extraInfo && (
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAE2D5] text-xs">
                  <span className="font-semibold text-[#3D362C] block mb-1">Informações Adicionais:</span>
                  <p className="text-[#5A5043]">{event.extraInfo}</p>
                </div>
              )}
            </div>

            {/* Painel Lateral com Link Público & Acesso Direto */}
            <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#7A7265] block">
                  Compartilhamento Público
                </span>
                <h4 className="font-serif text-lg text-[#231F1C] mt-1">Link Exclusivo do Convite</h4>
                <p className="text-xs text-[#6A6357] mt-1">
                  Envie este endereço para os convidados no WhatsApp, e-mail ou redes sociais.
                </p>

                <div className="mt-4 p-3 rounded-xl bg-[#FAF7F2] border border-[#E0D5C3] break-all font-mono text-[11px] text-[#722F37]">
                  {publicUrl}
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#D8CFC4] text-[#231F1C] py-2.5 rounded-xl text-xs font-semibold transition-all"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-[#4E6037]" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copiado para Área de Transferência!' : 'Copiar Endereço do Link'}</span>
                </button>

                <button
                  onClick={() => onOpenPublicInvite(event)}
                  className="w-full flex items-center justify-center gap-2 bg-[#722F37] hover:bg-[#581C23] text-white py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir Página Pública</span>
                </button>
              </div>
            </div>

          </div>

          {/* Resumos em Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div 
              onClick={() => setActiveTab('guests')}
              className="bg-white rounded-2xl border border-[#E8DFC8] hover:border-[#722F37]/50 p-5 shadow-xs cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-[#7A7265]">Convidados Confirmados</span>
                <Users className="w-4 h-4 text-[#722F37]" />
              </div>
              <div className="mt-3">
                <span className="font-serif text-3xl font-bold text-[#4E6037]">{confirmedGuests}</span>
                <span className="text-xs text-[#8E8679] ml-2">de {totalGuests} pessoas</span>
              </div>
              <span className="text-[11px] font-semibold text-[#722F37] group-hover:underline mt-3 block">
                Ver lista completa de convidados &rarr;
              </span>
            </div>

            <div 
              onClick={() => setActiveTab('calculator')}
              className="bg-white rounded-2xl border border-[#E8DFC8] hover:border-[#722F37]/50 p-5 shadow-xs cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-[#7A7265]">Cálculo de Alimentos & Bebidas</span>
                <Calculator className="w-4 h-4 text-[#722F37]" />
              </div>
              <div className="mt-3">
                <span className="font-serif text-2xl font-bold text-[#231F1C]">Base: {confirmedGuests || totalGuests || 50} pessoas</span>
              </div>
              <span className="text-[11px] font-semibold text-[#722F37] group-hover:underline mt-3 block">
                Abrir calculadora de consumo &rarr;
              </span>
            </div>

            <div 
              onClick={() => setActiveTab('budget')}
              className="bg-white rounded-2xl border border-[#E8DFC8] hover:border-[#722F37]/50 p-5 shadow-xs cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-[#7A7265]">Orçamento e Despesas</span>
                <DollarSign className="w-4 h-4 text-[#722F37]" />
              </div>
              <div className="mt-3">
                <span className="font-serif text-2xl font-bold text-[#722F37]">
                  {totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <span className="text-xs text-[#8E8679] block">
                  Teto: {Number(event.budgetLimit || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-[#722F37] group-hover:underline mt-3 block">
                Gerenciar lançamentos financeiros &rarr;
              </span>
            </div>

          </div>

        </div>
      )}

      {/* 2. CONVITE & PRÉVIA */}
      {activeTab === 'invite' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border border-[#E8DFC8] p-4 rounded-2xl">
            <p className="text-xs text-[#6A6357]">
              Esta é a visualização exata de como seus convidados verão o convite interativo no celular ou computador.
            </p>
            <button
              onClick={() => onEditEvent(event)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#722F37] text-white hover:bg-[#581C23]"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editar Cores & Textos
            </button>
          </div>

          <div className="max-w-2xl mx-auto rounded-3xl border border-[#E8DFC8] overflow-hidden shadow-sm bg-white">
            <DigitalInvitation event={event} isPublic={false} />
          </div>
        </div>
      )}

      {/* 3. CONVIDADOS */}
      {activeTab === 'guests' && (
        <GuestManager event={event} onUpdate={handleUpdate} />
      )}

      {/* 4. CALCULADORA */}
      {activeTab === 'calculator' && (
        <EventCalculator 
          event={event} 
          confirmedGuestsCount={confirmedGuests} 
          totalGuestsCount={totalGuests} 
          onGoToShopping={() => setActiveTab('shopping')}
        />
      )}

      {/* 5. LISTA DE COMPRAS */}
      {activeTab === 'shopping' && (
        <ShoppingList event={event} onUpdate={handleUpdate} />
      )}

      {/* 6. ORÇAMENTO */}
      {activeTab === 'budget' && (
        <BudgetTracker event={event} onUpdate={handleUpdate} />
      )}

      {/* 7. FICHA IMPRIMÍVEL DO EVENTO */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="no-print flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E8DFC8]">
            <p className="text-xs text-[#6A6357]">
              Ficha executiva do evento pronta para impressão ou exportação em PDF.
            </p>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-[#722F37] hover:bg-[#581C23] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir Resumo Executivo
            </button>
          </div>

          {/* DOCUMENTO IMPRIMÍVEL */}
          <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#D8CFC4] shadow-sm space-y-8 font-sans text-black">
            
            {/* Cabeçalho Oficial LAÇO */}
            <div className="border-b-2 border-black pb-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-3xl font-bold tracking-tight">LAÇO — Ficha do Evento</h2>
                <p className="text-xs text-gray-600">Relatório de Gestão, Convidados e Orçamento</p>
              </div>
              <div className="text-right text-xs">
                <span className="font-bold block">Emissão:</span>
                <span>{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Informações Centrais */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-gray-700 block">Evento:</span>
                <span className="text-base font-bold">{event.title}</span>
              </div>
              <div>
                <span className="font-bold text-gray-700 block">Anfitriões:</span>
                <span className="text-base">{event.hosts}</span>
              </div>
              <div>
                <span className="font-bold text-gray-700 block">Data e Horário:</span>
                <span>{event.date.split('-').reverse().join('/')} às {event.time}</span>
              </div>
              <div>
                <span className="font-bold text-gray-700 block">Local:</span>
                <span>{event.locationName} — {event.locationAddress}</span>
              </div>
            </div>

            {/* Resumo Numérico */}
            <div className="border border-gray-300 rounded-lg p-4 grid grid-cols-4 gap-4 text-center text-xs">
              <div>
                <span className="text-gray-500 block uppercase">Convidados Totais</span>
                <span className="text-xl font-bold">{totalGuests}</span>
              </div>
              <div>
                <span className="text-gray-500 block uppercase">Confirmados</span>
                <span className="text-xl font-bold text-green-700">{confirmedGuests}</span>
              </div>
              <div>
                <span className="text-gray-500 block uppercase">Teto Orçamento</span>
                <span className="text-xl font-bold">{Number(event.budgetLimit || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div>
                <span className="text-gray-500 block uppercase">Total Real Gasto</span>
                <span className="text-xl font-bold text-red-700">{totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>

            {/* Tabela de Convidados Confirmados */}
            <div className="print-section">
              <h4 className="font-serif text-lg font-bold border-b pb-1 mb-2">Lista de Convidados Confirmados</h4>
              <table className="print-table w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-2 px-2">Nome / Grupo</th>
                    <th className="py-2 px-2">Telefone</th>
                    <th className="py-2 px-2 text-center">Adultos</th>
                    <th className="py-2 px-2 text-center">Crianças</th>
                    <th className="py-2 px-2">Notas / Restrições</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {guests.filter(g => g.status === 'confirmed').map(g => (
                    <tr key={g.id} className="print-block">
                      <td className="py-2 px-2 font-medium">{g.name}</td>
                      <td className="py-2 px-2">{g.phone || '—'}</td>
                      <td className="py-2 px-2 text-center">{g.adultsCount}</td>
                      <td className="py-2 px-2 text-center">{g.childrenCount}</td>
                      <td className="py-2 px-2">{g.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tabela de Despesas */}
            <div className="print-section">
              <h4 className="font-serif text-lg font-bold border-b pb-1 mb-2">Resumo Financeiro & Despesas</h4>
              <table className="print-table w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-2 px-2">Fornecedor / Item</th>
                    <th className="py-2 px-2">Categoria</th>
                    <th className="py-2 px-2 text-right">Previsto</th>
                    <th className="py-2 px-2 text-right">Real</th>
                    <th className="py-2 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {expenses.map(e => (
                    <tr key={e.id} className="print-block">
                      <td className="py-2 px-2 font-medium">{e.title}</td>
                      <td className="py-2 px-2 capitalize">{e.category}</td>
                      <td className="py-2 px-2 text-right">{(Number(e.estimatedAmount) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="py-2 px-2 text-right font-bold">{(Number(e.actualAmount) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="py-2 px-2 text-center uppercase font-semibold text-[10px]">{e.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-6 border-t text-center text-[10px] text-gray-500">
              Documento gerado pela plataforma LAÇO — Convites digitais personalizados e assessoria de eventos.
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
