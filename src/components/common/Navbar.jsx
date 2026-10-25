import React from 'react';
import { Sparkles, Calendar, Plus, ExternalLink, RefreshCw, Layers } from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, selectedEvent, onNewEvent, onResetDemo }) {
  return (
    <header className="no-print bg-[#FAF7F2] border-b border-[#E8DFC8] sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Marca LAÇO */}
          <div 
            onClick={() => setCurrentView('events')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-[#722F37] text-[#FAF7F2] flex items-center justify-center font-serif text-2xl font-bold shadow-md transition-transform group-hover:scale-105">
              L
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl tracking-wider text-[#722F37] font-bold">LAÇO</span>
                <span className="text-[10px] tracking-widest uppercase bg-[#EFE9DF] text-[#722F37] px-2 py-0.5 rounded-full font-semibold border border-[#D8CFC4]">
                  Ateliê Digital
                </span>
              </div>
              <p className="text-xs text-[#7A7265] hidden sm:block">Convites autorais & organização inteligente</p>
            </div>
          </div>

          {/* Ações Centrais / Secundárias */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setCurrentView('events')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                currentView === 'events'
                  ? 'bg-[#EFE9DF] text-[#722F37] shadow-xs'
                  : 'text-[#6A6357] hover:text-[#231F1C] hover:bg-[#F2ECE1]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Meus Eventos</span>
            </button>

            {selectedEvent && (
              <button
                onClick={() => setCurrentView('event_detail')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  currentView === 'event_detail'
                    ? 'bg-[#EFE9DF] text-[#722F37] shadow-xs'
                    : 'text-[#6A6357] hover:text-[#231F1C] hover:bg-[#F2ECE1]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="max-w-[130px] sm:max-w-[200px] truncate">{selectedEvent.title}</span>
              </button>
            )}

            <button
              onClick={onNewEvent}
              className="flex items-center gap-1.5 bg-[#722F37] hover:bg-[#581C23] text-[#FAF7F2] px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Novo Convite</span>
            </button>

            <button
              onClick={onResetDemo}
              title="Restaurar dados de demonstração"
              className="p-2 text-[#8E8679] hover:text-[#722F37] hover:bg-[#F2ECE1] rounded-xl transition-all"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
