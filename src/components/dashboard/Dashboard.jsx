import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  MoreVertical, 
  Archive, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  HeartHandshake,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { storage } from '../../services/storage';

export default function Dashboard({ 
  events, 
  onSelectEvent, 
  onNewEvent, 
  onEditEvent, 
  onOpenPublicInvite 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  // Carrega todos os convidados e despesas para estatísticas consolidadas
  const allGuests = storage.getGuests();
  const allExpenses = storage.getExpenses();

  // Métricas globais
  const activeEvents = events.filter((e) => !e.isArchived);
  const totalGuestsCount = allGuests.reduce((acc, g) => acc + (g.adultsCount + g.childrenCount), 0);
  const confirmedGuestsCount = allGuests
    .filter((g) => g.status === 'confirmed')
    .reduce((acc, g) => acc + (g.adultsCount + g.childrenCount), 0);
  
  const totalBudget = activeEvents.reduce((acc, e) => acc + (Number(e.budgetLimit) || 0), 0);
  const totalSpent = allExpenses
    .filter((exp) => exp.status === 'pago')
    .reduce((acc, exp) => acc + (Number(exp.actualAmount) || 0), 0);

  // Filtragem de eventos
  const filteredEvents = events.filter((evt) => {
    const matchesSearch = 
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.hosts.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.locationName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'archived') return matchesSearch && evt.isArchived;
    if (filterType === 'all') return matchesSearch && !evt.isArchived;
    return matchesSearch && !evt.isArchived && evt.eventType === filterType;
  });

  const handleCopyLink = (event, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}#invite=${event.slug || event.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(event.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleArchive = (event, e) => {
    e.stopPropagation();
    const updated = { ...event, isArchived: !event.isArchived };
    storage.saveEvent(updated);
  };

  const handleDelete = (event, e) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja excluir o evento "${event.title}" e todos seus convidados e despesas?`)) {
      storage.deleteEvent(event.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner de Boas-vindas Editorial */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FAF4EC] via-[#F4EDE2] to-[#EAE0D1] border border-[#E3D7C5] p-6 sm:p-8 md:p-10 shadow-xs">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#722F37]/10 text-[#722F37] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C69F54]" />
            Ateliê de Convites & Gestão LAÇO
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#231F1C] tracking-tight leading-tight">
            Cada celebração merece uma identidade única e inesquecível.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#686055] leading-relaxed">
            Crie identidades personalizadas para seus clientes, acompanhe confirmações em tempo real e mantenha alimentos, bebidas e orçamento sob total controle.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onNewEvent}
              className="inline-flex items-center gap-2 bg-[#722F37] hover:bg-[#581C23] text-[#FAF7F2] px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all hover:shadow"
            >
              <Plus className="w-4 h-4" />
              Criar Novo Convite
            </button>
          </div>
        </div>

        {/* Detalhe estético decorativo no fundo */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-15 pointer-events-none hidden md:block">
          <span className="font-serif text-[180px] font-bold text-[#722F37] select-none">LAÇO</span>
        </div>
      </div>

      {/* Cartões de Indicadores Gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#FFFFFF] border border-[#E8DFC8] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#7A7265]">
            <span className="text-xs uppercase font-semibold tracking-wider">Eventos Ativos</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF4EC] text-[#722F37] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-serif text-3xl font-bold text-[#231F1C]">{activeEvents.length}</span>
            <span className="ml-2 text-xs text-[#8E8679]">cadastrados</span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8DFC8] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#7A7265]">
            <span className="text-xs uppercase font-semibold tracking-wider">Presenças Confirmadas</span>
            <div className="w-8 h-8 rounded-lg bg-[#EBF3E6] text-[#4E6037] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#4E6037]">{confirmedGuestsCount}</span>
            <span className="text-xs text-[#8E8679]">de {totalGuestsCount} convidados</span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8DFC8] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#7A7265]">
            <span className="text-xs uppercase font-semibold tracking-wider">Orçamento Previsto</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF4EC] text-[#C69F54] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl font-bold text-[#231F1C]">
              {totalBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E8DFC8] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#7A7265]">
            <span className="text-xs uppercase font-semibold tracking-wider">Total Pago Realizado</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF4EC] text-[#722F37] flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-serif text-2xl font-bold text-[#722F37]">
              {totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        
        {/* Barra de Busca */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8E8679] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome do evento, anfitriões ou local..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#E0D5C3] rounded-xl pl-10 pr-4 py-2 text-sm text-[#231F1C] focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37]"
          />
        </div>

        {/* Filtros por Categoria */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'casamento', label: 'Casamentos' },
            { id: 'infantil', label: 'Infantis' },
            { id: 'bodas', label: 'Bodas' },
            { id: 'archived', label: 'Arquivados' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filterType === cat.id
                  ? 'bg-[#722F37] text-[#FAF7F2]'
                  : 'bg-[#FFFFFF] text-[#6A6357] border border-[#E8DFC8] hover:bg-[#F2ECE1]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

      </div>

      {/* Grid de Eventos */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFFFF] border border-dashed border-[#D8CFC4] rounded-3xl p-8">
          <Calendar className="w-12 h-12 text-[#B8ADA0] mx-auto mb-3" />
          <h3 className="font-serif text-xl text-[#231F1C]">Nenhum evento encontrado</h3>
          <p className="text-sm text-[#7A7265] mt-1 max-w-md mx-auto">
            {searchTerm ? 'Tente ajustar os termos da sua pesquisa ou mudar o filtro.' : 'Comece cadastrando o primeiro evento personalizado para seus clientes!'}
          </p>
          <button
            onClick={onNewEvent}
            className="mt-5 inline-flex items-center gap-2 bg-[#722F37] text-[#FAF7F2] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#581C23] transition-all"
          >
            <Plus className="w-4 h-4" />
            Criar Evento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const eventGuests = allGuests.filter((g) => g.eventId === evt.id);
            const totalPeople = eventGuests.reduce((acc, g) => acc + (g.adultsCount + g.childrenCount), 0);
            const confirmedPeople = eventGuests
              .filter((g) => g.status === 'confirmed')
              .reduce((acc, g) => acc + (g.adultsCount + g.childrenCount), 0);
            const pendingPeople = eventGuests
              .filter((g) => g.status === 'pending')
              .reduce((acc, g) => acc + (g.adultsCount + g.childrenCount), 0);

            const rsvpPercent = totalPeople > 0 ? Math.round((confirmedPeople / totalPeople) * 100) : 0;

            const eventExpenses = allExpenses.filter((e) => e.eventId === evt.id);
            const spent = eventExpenses
              .filter((e) => e.status === 'pago')
              .reduce((acc, e) => acc + (Number(e.actualAmount) || 0), 0);
            const budgetPercent = evt.budgetLimit > 0 ? Math.min(100, Math.round((spent / evt.budgetLimit) * 100)) : 0;

            // Formatação de data em português
            let dateStr = evt.date;
            try {
              const [y, m, d] = evt.date.split('-');
              dateStr = `${d}/${m}/${y}`;
            } catch {
              dateStr = evt.date;
            }

            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className="group bg-[#FFFFFF] border border-[#E8DFC8] hover:border-[#722F37]/50 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  
                  {/* Topo do Card: Badge do Tipo & Ações Rápidas */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span 
                      className="text-xs uppercase font-semibold tracking-wider px-2.5 py-1 rounded-md"
                      style={{
                        backgroundColor: `${evt.theme?.primaryColor || '#722F37'}15`,
                        color: evt.theme?.primaryColor || '#722F37',
                      }}
                    >
                      {evt.eventType.toUpperCase()}
                    </span>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleCopyLink(evt, e)}
                        title="Copiar link público do convite"
                        className="p-1.5 text-[#8E8679] hover:text-[#722F37] hover:bg-[#FAF4EC] rounded-lg transition-all"
                      >
                        {copiedId === evt.id ? <Check className="w-4 h-4 text-[#4E6037]" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPublicInvite(evt);
                        }}
                        title="Visualizar convite como convidado"
                        className="p-1.5 text-[#8E8679] hover:text-[#722F37] hover:bg-[#FAF4EC] rounded-lg transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEvent(evt);
                        }}
                        title="Editar configurações do evento"
                        className="p-1.5 text-[#8E8679] hover:text-[#722F37] hover:bg-[#FAF4EC] rounded-lg transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Título & Anfitriões */}
                  <h3 className="font-serif text-2xl text-[#231F1C] group-hover:text-[#722F37] transition-colors leading-snug line-clamp-2">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-[#7A7265] mt-1 line-clamp-1">
                    Anfitriões: <span className="font-medium text-[#4D453A]">{evt.hosts}</span>
                  </p>

                  {/* Informações de Local e Data */}
                  <div className="mt-4 pt-4 border-t border-[#F2ECE1] space-y-1.5 text-xs text-[#6A6357]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#722F37]" />
                      <span>{dateStr} às {evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#722F37]" />
                      <span className="truncate">{evt.locationName}</span>
                    </div>
                  </div>

                  {/* Progresso de Confirmações (RSVP) */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6A6357] font-medium flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        Confirmações ({confirmedPeople}/{totalPeople})
                      </span>
                      <span className="font-bold text-[#4E6037]">{rsvpPercent}%</span>
                    </div>
                    <div className="w-full bg-[#EFE9DF] h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#4E6037] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${rsvpPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#8E8679]">
                      <span>{pendingPeople} pendentes</span>
                      <span>{eventGuests.filter(g => g.status === 'declined').length} não comparecerão</span>
                    </div>
                  </div>

                </div>

                {/* Rodapé do Card: Orçamento e Ação */}
                <div className="mt-6 pt-4 border-t border-[#F2ECE1] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#8E8679] block">Orçamento Gasto</span>
                    <span className="text-xs font-semibold text-[#231F1C]">
                      {spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <span className="text-[10px] text-[#8E8679] ml-1">
                      / {Number(evt.budgetLimit || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#722F37] group-hover:translate-x-1 transition-transform">
                    <span>Gerenciar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
