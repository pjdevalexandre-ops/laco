// Armazenamento local com sincronização e dados iniciais de demonstração para LAÇO

const STORAGE_KEYS = {
  EVENTS: 'laco_events_v1',
  GUESTS: 'laco_guests_v1',
  SHOPPING: 'laco_shopping_v1',
  EXPENSES: 'laco_expenses_v1',
  CALC_SETTINGS: 'laco_calc_settings_v1',
};

// Exemplos iniciais completos de demonstração
const INITIAL_EVENTS = [
  {
    id: 'evt-1',
    slug: 'casamento-clara-e-lucas',
    title: 'Casamento Clara & Lucas',
    eventType: 'casamento',
    hosts: 'Clara Silveira & Lucas Mendonça',
    date: '2026-11-21',
    time: '17:00',
    locationName: 'Villa Recanto das Palmeiras',
    locationAddress: 'Estrada do Vinho, km 8 - São Roque, SP',
    mapsUrl: 'https://maps.google.com',
    customMessage: 'Com imensa alegria e o coração repleto de amor, convidamos você para celebrar conosco o início do nosso novo capítulo.',
    extraInfo: 'Traje: Passeio Completo / Tons Pastéis. A cerimônia e a recepção ocorrerão no mesmo local.',
    theme: {
      preset: 'editorial_botanical',
      primaryColor: '#722F37', // Vinho queimado
      secondaryColor: '#EFE9DF', // Areia
      accentColor: '#C69F54', // Dourado suave
      bgColor: '#FAF7F2', // Papel marfim
      monogram: 'C & L',
      fontHeading: 'serif',
    },
    rsvpDeadline: '2026-11-05',
    allowGroupRsvp: true,
    maxGroupSize: 5,
    budgetLimit: 45000,
    isArchived: false,
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'evt-2',
    slug: 'aniversario-theo-4-anos',
    title: 'Aventuras na Selva do Theo - 4 Anos',
    eventType: 'infantil',
    hosts: 'Mariana & Roberto (Pais do Theo)',
    date: '2026-12-05',
    time: '15:30',
    locationName: 'Buffet Espaço Brincar',
    locationAddress: 'Av. das Américas, 1200 - Barra da Tijuca, RJ',
    mapsUrl: 'https://maps.google.com',
    customMessage: 'Prepare seu chapéu de explorador! O Theo vai comemorar 4 aninhos numa tarde cheia de brincadeiras e alegria.',
    extraInfo: 'Recomendamos roupas confortáveis e meias antiderrapantes para os pequenos aproveitarem os brinquedos.',
    theme: {
      preset: 'playful_safari',
      primaryColor: '#4E6037', // Verde oliva
      secondaryColor: '#E8DFC8',
      accentColor: '#D8A49B',
      bgColor: '#FAF9F5',
      monogram: 'T 4',
      fontHeading: 'sans',
    },
    rsvpDeadline: '2026-11-28',
    allowGroupRsvp: true,
    maxGroupSize: 6,
    budgetLimit: 9500,
    isArchived: false,
    createdAt: '2026-10-15T14:30:00.000Z',
  },
  {
    id: 'evt-3',
    slug: 'bodas-de-prata-helena-e-arthur',
    title: 'Bodas de Prata: Helena & Arthur (25 Anos)',
    eventType: 'bodas',
    hosts: 'Helena & Arthur Guimarães',
    date: '2026-12-19',
    time: '20:00',
    locationName: 'Restaurante Terraço Gourmet',
    locationAddress: 'Rua Bela Cintra, 890 - Jardins, São Paulo - SP',
    mapsUrl: 'https://maps.google.com',
    customMessage: '25 anos de amor, cumplicidade e muitas histórias compartilhadas. Venha brindar conosco esta data inesquecível!',
    extraInfo: 'Traje Esporte Fino. Jantar comemorativo com música ao vivo.',
    theme: {
      preset: 'classic_silver',
      primaryColor: '#3A4454',
      secondaryColor: '#E6E9EE',
      accentColor: '#9FA8B8',
      bgColor: '#FAF7F2',
      monogram: 'H & A',
      fontHeading: 'serif',
    },
    rsvpDeadline: '2026-12-01',
    allowGroupRsvp: true,
    maxGroupSize: 4,
    budgetLimit: 22000,
    isArchived: false,
    createdAt: '2026-10-20T09:15:00.000Z',
  }
];

const INITIAL_GUESTS = [
  // Convidados do Casamento
  {
    id: 'gst-1',
    eventId: 'evt-1',
    name: 'Família Albuquerque (Marcos & Júlia)',
    phone: '(11) 98765-4321',
    status: 'confirmed', // 'confirmed' | 'declined' | 'pending'
    adultsCount: 2,
    childrenCount: 1,
    notes: 'Júlia é vegetariana',
    confirmedAt: '2026-10-12T16:20:00.000Z',
  },
  {
    id: 'gst-2',
    eventId: 'evt-1',
    name: 'Carolina Dantas & Acompanhante',
    phone: '(11) 99123-8877',
    status: 'confirmed',
    adultsCount: 2,
    childrenCount: 0,
    notes: 'Padrinhos de aliança',
    confirmedAt: '2026-10-14T11:05:00.000Z',
  },
  {
    id: 'gst-3',
    eventId: 'evt-1',
    name: 'Dr. Fernando Vasconcelos',
    phone: '(11) 97654-3210',
    status: 'declined',
    adultsCount: 1,
    childrenCount: 0,
    notes: 'Estará em congresso fora do país',
    confirmedAt: '2026-10-18T09:40:00.000Z',
  },
  {
    id: 'gst-4',
    eventId: 'evt-1',
    name: 'Tia Rosa e Tio Carlos',
    phone: '(19) 98112-9900',
    status: 'pending',
    adultsCount: 2,
    childrenCount: 0,
    notes: 'Aguardando confirmação de voo',
    confirmedAt: null,
  },
  {
    id: 'gst-5',
    eventId: 'evt-1',
    name: 'Thiago Nogueira & Família',
    phone: '(11) 99345-6789',
    status: 'confirmed',
    adultsCount: 2,
    childrenCount: 2,
    notes: 'Sem restrições',
    confirmedAt: '2026-10-22T19:30:00.000Z',
  },
  // Convidados do Aniversário do Theo
  {
    id: 'gst-6',
    eventId: 'evt-2',
    name: 'Beatriz e Pedro (Pais da Alice)',
    phone: '(21) 99887-1122',
    status: 'confirmed',
    adultsCount: 2,
    childrenCount: 1,
    notes: 'Alice é colega de sala do Theo',
    confirmedAt: '2026-10-20T10:00:00.000Z',
  },
  {
    id: 'gst-7',
    eventId: 'evt-2',
    name: 'Vovô Jorge e Vovó Lúcia',
    phone: '(21) 98711-2233',
    status: 'confirmed',
    adultsCount: 2,
    childrenCount: 0,
    notes: 'Chegam cedo para ajudar',
    confirmedAt: '2026-10-16T15:00:00.000Z',
  }
];

const INITIAL_EXPENSES = [
  // Despesas Casamento
  {
    id: 'exp-1',
    eventId: 'evt-1',
    title: 'Espaço e Locação da Villa',
    category: 'local',
    estimatedAmount: 16000,
    actualAmount: 15500,
    status: 'pago',
    notes: 'Contrato quitado em 2x',
  },
  {
    id: 'exp-2',
    eventId: 'evt-1',
    title: 'Buffet Gastronômico & Garçons',
    category: 'buffet',
    estimatedAmount: 18000,
    actualAmount: 17800,
    status: 'pendente',
    notes: '50% de sinal pago, restante na semana do evento',
  },
  {
    id: 'exp-3',
    eventId: 'evt-1',
    title: 'Fotografia & Vídeo Cinematográfico',
    category: 'fotografia',
    estimatedAmount: 5500,
    actualAmount: 5200,
    status: 'pago',
    notes: 'Inclui pré-wedding e álbum impresso',
  },
  {
    id: 'exp-4',
    eventId: 'evt-1',
    title: 'Decoração Floral & Iluminação Cênica',
    category: 'decoracao',
    estimatedAmount: 6000,
    actualAmount: 6500,
    status: 'pendente',
    notes: 'Acréscimo de arco botânico na cerimônia',
  },
  // Despesas Theo
  {
    id: 'exp-5',
    eventId: 'evt-2',
    title: 'Pacote Buffet Infantil (40 pessoas)',
    category: 'buffet',
    estimatedAmount: 4800,
    actualAmount: 4800,
    status: 'pago',
    notes: 'Inclui monitores e bolo',
  },
  {
    id: 'exp-6',
    eventId: 'evt-2',
    title: 'Decoração Temática Safari',
    category: 'decoracao',
    estimatedAmount: 2200,
    actualAmount: 2100,
    status: 'pago',
    notes: 'Balões e bichos de pelúcia gigantes',
  }
];

const INITIAL_SHOPPING = [
  {
    id: 'shp-1',
    eventId: 'evt-1',
    name: 'Espumante Moscatel para Brinde',
    category: 'bebidas',
    quantityNeeded: 24,
    unit: 'garrafas',
    quantityBought: 24,
    estimatedPrice: 1200,
    actualPrice: 1140,
    isPurchased: true,
  },
  {
    id: 'shp-2',
    eventId: 'evt-1',
    name: 'Lembrancinhas com Vela Aromática',
    category: 'lembrancas',
    quantityNeeded: 80,
    unit: 'un',
    quantityBought: 50,
    estimatedPrice: 960,
    actualPrice: 850,
    isPurchased: false,
  },
  {
    id: 'shp-3',
    eventId: 'evt-1',
    name: 'Docinhos Finos Especiais',
    category: 'alimentos',
    quantityNeeded: 450,
    unit: 'un',
    quantityBought: 450,
    estimatedPrice: 1350,
    actualPrice: 1350,
    isPurchased: true,
  },
  {
    id: 'shp-4',
    eventId: 'evt-2',
    name: 'Mochilinhas Safari Lembrancinha',
    category: 'lembrancas',
    quantityNeeded: 25,
    unit: 'un',
    quantityBought: 25,
    estimatedPrice: 350,
    actualPrice: 320,
    isPurchased: true,
  }
];

export const storage = {
  // Eventos
  getEvents: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
        return INITIAL_EVENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_EVENTS;
    }
  },

  saveEvents: (events) => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      window.dispatchEvent(new Event('laco_storage_updated'));
    } catch (e) {
      console.error('Falha ao salvar eventos:', e);
    }
  },

  getEventById: (id) => {
    const events = storage.getEvents();
    return events.find((e) => e.id === id || e.slug === id);
  },

  saveEvent: (eventData) => {
    const events = storage.getEvents();
    const index = events.findIndex((e) => e.id === eventData.id);
    if (index >= 0) {
      events[index] = { ...events[index], ...eventData };
    } else {
      events.unshift(eventData);
    }
    storage.saveEvents(events);
    return eventData;
  },

  deleteEvent: (id) => {
    const events = storage.getEvents().filter((e) => e.id !== id);
    storage.saveEvents(events);
    // Remove também convidados e despesas relacionadas
    const guests = storage.getGuests().filter((g) => g.eventId !== id);
    storage.saveGuests(guests);
    const expenses = storage.getExpenses().filter((e) => e.eventId !== id);
    storage.saveExpenses(expenses);
    const shopping = storage.getShopping().filter((s) => s.eventId !== id);
    storage.saveShopping(shopping);
  },

  // Convidados
  getGuests: (eventId = null) => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GUESTS);
      const list = data ? JSON.parse(data) : INITIAL_GUESTS;
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(INITIAL_GUESTS));
      }
      return eventId ? list.filter((g) => g.eventId === eventId) : list;
    } catch {
      return eventId ? INITIAL_GUESTS.filter((g) => g.eventId === eventId) : INITIAL_GUESTS;
    }
  },

  saveGuests: (guests) => {
    try {
      localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
      window.dispatchEvent(new Event('laco_storage_updated'));
    } catch (e) {
      console.error('Falha ao salvar convidados:', e);
    }
  },

  addOrUpdateGuest: (guestData) => {
    const allGuests = storage.getGuests();
    const index = allGuests.findIndex((g) => g.id === guestData.id);
    if (index >= 0) {
      allGuests[index] = { ...allGuests[index], ...guestData };
    } else {
      allGuests.push(guestData);
    }
    storage.saveGuests(allGuests);
    return guestData;
  },

  deleteGuest: (guestId) => {
    const allGuests = storage.getGuests().filter((g) => g.id !== guestId);
    storage.saveGuests(allGuests);
  },

  // Despesas & Orçamento
  getExpenses: (eventId = null) => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      const list = data ? JSON.parse(data) : INITIAL_EXPENSES;
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
      }
      return eventId ? list.filter((e) => e.eventId === eventId) : list;
    } catch {
      return eventId ? INITIAL_EXPENSES.filter((e) => e.eventId === eventId) : INITIAL_EXPENSES;
    }
  },

  saveExpenses: (expenses) => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      window.dispatchEvent(new Event('laco_storage_updated'));
    } catch (e) {
      console.error('Falha ao salvar despesas:', e);
    }
  },

  addOrUpdateExpense: (expenseData) => {
    const all = storage.getExpenses();
    const idx = all.findIndex((e) => e.id === expenseData.id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...expenseData };
    } else {
      all.unshift(expenseData);
    }
    storage.saveExpenses(all);
    return expenseData;
  },

  deleteExpense: (id) => {
    const all = storage.getExpenses().filter((e) => e.id !== id);
    storage.saveExpenses(all);
  },

  // Lista de compras
  getShopping: (eventId = null) => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SHOPPING);
      const list = data ? JSON.parse(data) : INITIAL_SHOPPING;
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(INITIAL_SHOPPING));
      }
      return eventId ? list.filter((s) => s.eventId === eventId) : list;
    } catch {
      return eventId ? INITIAL_SHOPPING.filter((s) => s.eventId === eventId) : INITIAL_SHOPPING;
    }
  },

  saveShopping: (items) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(items));
      window.dispatchEvent(new Event('laco_storage_updated'));
    } catch (e) {
      console.error('Falha ao salvar lista de compras:', e);
    }
  },

  addOrUpdateShoppingItem: (item) => {
    const all = storage.getShopping();
    const idx = all.findIndex((s) => s.id === item.id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...item };
    } else {
      all.unshift(item);
    }
    storage.saveShopping(all);
    return item;
  },

  deleteShoppingItem: (id) => {
    const all = storage.getShopping().filter((s) => s.id !== id);
    storage.saveShopping(all);
  },

  // Reset para demonstração
  resetToDefault: () => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(INITIAL_EVENTS));
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(INITIAL_GUESTS));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(INITIAL_SHOPPING));
    window.dispatchEvent(new Event('laco_storage_updated'));
  }
};
