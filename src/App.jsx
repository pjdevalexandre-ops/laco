import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import EventForm from './components/event-form/EventForm';
import EventDetailView from './components/event-detail/EventDetailView';
import DigitalInvitation from './components/invite/DigitalInvitation';
import { storage } from './services/storage';

export default function App() {
  const [events, setEvents] = useState(() => storage.getEvents());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentView, setCurrentView] = useState('events'); // 'events' | 'event_detail' | 'form' | 'public_invite'

  // Monitora hash na URL para rota pública direta de convite: e.g. #invite=casamento-clara-e-lucas
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#invite=')) {
        const slugOrId = hash.replace('#invite=', '');
        const found = storage.getEventById(slugOrId);
        if (found) {
          setSelectedEvent(found);
          setCurrentView('public_invite');
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Escuta atualizações de storage para manter dados sincronizados
  useEffect(() => {
    const handleStorageUpdate = () => {
      const refreshedEvents = storage.getEvents();
      setEvents(refreshedEvents);
      if (selectedEvent) {
        const updated = refreshedEvents.find((e) => e.id === selectedEvent.id);
        if (updated) setSelectedEvent(updated);
      }
    };

    window.addEventListener('laco_storage_updated', handleStorageUpdate);
    return () => window.removeEventListener('laco_storage_updated', handleStorageUpdate);
  }, [selectedEvent]);

  // Ações de Navegação
  const handleSelectEvent = (evt) => {
    setSelectedEvent(evt);
    setCurrentView('event_detail');
  };

  const handleNewEvent = () => {
    setEditingEvent(null);
    setCurrentView('form');
  };

  const handleEditEvent = (evt) => {
    setEditingEvent(evt);
    setCurrentView('form');
  };

  const handleOpenPublicInvite = (evt) => {
    setSelectedEvent(evt);
    window.location.hash = `invite=${evt.slug || evt.id}`;
    setCurrentView('public_invite');
  };

  const handleSaveEvent = (savedEvt) => {
    setSelectedEvent(savedEvt);
    setCurrentView('event_detail');
  };

  const handleResetDemo = () => {
    if (window.confirm('Deseja recarregar os eventos de demonstração (Casamento, Aniversário do Theo, Bodas)? Isso restaurará dados de teste limpos.')) {
      storage.resetToDefault();
      const defaultEvents = storage.getEvents();
      setEvents(defaultEvents);
      setSelectedEvent(defaultEvents[0] || null);
      setCurrentView('events');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#231F1C] font-sans flex flex-col selection:bg-[#722F37]/20 selection:text-[#722F37]">
      
      {/* Barra de Navegação no Topo (oculta na visualização pública do convidado e em impressão) */}
      {currentView !== 'public_invite' && (
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          selectedEvent={selectedEvent}
          onNewEvent={handleNewEvent}
          onResetDemo={handleResetDemo}
        />
      )}

      {/* RENDERIZAÇÃO DAS TELAS PRINCIPAIS */}
      <main className="flex-1">
        
        {/* Visualização Pública do Convite (como o convidado vê no celular) */}
        {currentView === 'public_invite' && selectedEvent && (
          <DigitalInvitation
            event={selectedEvent}
            isPublic={true}
            onBack={() => {
              window.location.hash = '';
              setCurrentView('event_detail');
            }}
          />
        )}

        {/* Painel Inicial (Dashboard com Lista de Eventos) */}
        {currentView === 'events' && (
          <Dashboard
            events={events}
            onSelectEvent={handleSelectEvent}
            onNewEvent={handleNewEvent}
            onEditEvent={handleEditEvent}
            onOpenPublicInvite={handleOpenPublicInvite}
          />
        )}

        {/* Gerenciamento do Evento Selecionado (Abas de Gestão) */}
        {currentView === 'event_detail' && selectedEvent && (
          <EventDetailView
            event={selectedEvent}
            onBack={() => setCurrentView('events')}
            onEditEvent={handleEditEvent}
            onOpenPublicInvite={handleOpenPublicInvite}
          />
        )}

        {/* Formulário de Criação / Edição do Evento com Prévia ao Vivo */}
        {currentView === 'form' && (
          <EventForm
            eventToEdit={editingEvent}
            onSave={handleSaveEvent}
            onCancel={() => {
              if (selectedEvent) {
                setCurrentView('event_detail');
              } else {
                setCurrentView('events');
              }
            }}
          />
        )}

      </main>

      {/* Rodapé Institucional (apenas na área administrativa) */}
      {currentView !== 'public_invite' && (
        <footer className="no-print border-t border-[#E8DFC8] bg-[#FAF7F2] py-8 text-center text-xs text-[#8E8679]">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="font-serif text-lg font-bold text-[#722F37]">LAÇO</span>
              <span>— Ateliê de Convites Digitais & Organização de Eventos</span>
            </div>
            <p className="text-[11px] text-[#A69C8E]">
              Desenvolvido com foco em sofisticação visual, experiência mobile do convidado e assessoria completa do anfitrião.
            </p>
          </div>
        </footer>
      )}

    </div>
  );
}
