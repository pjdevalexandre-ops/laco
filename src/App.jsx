import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import EventForm from './components/event-form/EventForm';
import EventDetailView from './components/event-detail/EventDetailView';
import DigitalInvitation from './components/invite/DigitalInvitation';
import NotFoundInvite from './components/invite/NotFoundInvite';
import AuthScreen from './components/auth/AuthScreen';
import { storage } from './services/storage';
import { authService } from './services/supabase';

export default function App() {
  const [events, setEvents] = useState(() => storage.getEvents());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentView, setCurrentView] = useState('events'); // 'events' | 'event_detail' | 'form' | 'public_invite' | 'not_found_invite'
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const local = localStorage.getItem('laco_auth_user');
      return local ? JSON.parse(local) : null;
    } catch {
      return null;
    }
  });

  // Monitora autenticação
  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      if (user) setCurrentUser(user);
    });

    const handleAuthChange = () => {
      try {
        const local = localStorage.getItem('laco_auth_user');
        setCurrentUser(local ? JSON.parse(local) : null);
      } catch {
        setCurrentUser(null);
      }
    };

    window.addEventListener('laco_auth_updated', handleAuthChange);
    return () => window.removeEventListener('laco_auth_updated', handleAuthChange);
  }, []);

  // Monitora hash na URL para rota pública direta de convite: e.g. #invite=casamento-clara-e-lucas
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#invite=')) {
        const slugOrId = hash.replace('#invite=', '').trim();
        const found = storage.getEventById(slugOrId);
        if (found) {
          setSelectedEvent(found);
          setCurrentView('public_invite');
        } else {
          setSelectedEvent(null);
          setCurrentView('not_found_invite');
        }
      } else if (!window.location.hash && (currentView === 'public_invite' || currentView === 'not_found_invite')) {
        setCurrentView('events');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView]);

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

  const handleLogout = async () => {
    if (window.confirm('Deseja realmente sair da sua conta de organizador?')) {
      await authService.signOut();
      setCurrentUser(null);
      setCurrentView('events');
    }
  };

  // Se a rota for o convite público ou convite não encontrado, exibe diretamente para o convidado
  if (currentView === 'not_found_invite') {
    return (
      <NotFoundInvite 
        onBackToHome={() => {
          window.location.hash = '';
          setCurrentView('events');
        }} 
      />
    );
  }

  if (currentView === 'public_invite' && selectedEvent) {
    return (
      <DigitalInvitation
        event={selectedEvent}
        isPublic={true}
        onBack={() => {
          window.location.hash = '';
          setCurrentView('event_detail');
        }}
      />
    );
  }

  // Se o organizador não estiver autenticado, exibe tela de login para proteger o painel
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#231F1C] font-sans flex flex-col selection:bg-[#722F37]/20 selection:text-[#722F37]">
      
      {/* Barra de Navegação no Topo */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedEvent={selectedEvent}
        onNewEvent={handleNewEvent}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* RENDERIZAÇÃO DAS TELAS PRINCIPAIS */}
      <main className="flex-1">
        
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

      {/* Rodapé Institucional */}
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

    </div>
  );
}
