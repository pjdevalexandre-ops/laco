import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileSpreadsheet, 
  Phone,
  Check,
  UserCheck
} from 'lucide-react';
import { storage } from '../../services/storage';

export default function GuestManager({ event, onUpdate }) {
  const [guests, setGuests] = useState(() => storage.getGuests(event.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'confirmed' | 'pending' | 'declined'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);

  // Form State
  const [guestForm, setGuestForm] = useState({
    name: '',
    phone: '',
    status: 'confirmed',
    adultsCount: 1,
    childrenCount: 0,
    notes: '',
  });

  const refreshList = () => {
    const list = storage.getGuests(event.id);
    setGuests(list);
    if (onUpdate) onUpdate();
  };

  // Métricas
  const totalPeople = guests.reduce((sum, g) => sum + (g.adultsCount + g.childrenCount), 0);
  const confirmedList = guests.filter((g) => g.status === 'confirmed');
  const confirmedAdults = confirmedList.reduce((sum, g) => sum + g.adultsCount, 0);
  const confirmedChildren = confirmedList.reduce((sum, g) => sum + g.childrenCount, 0);
  const confirmedTotal = confirmedAdults + confirmedChildren;
  const pendingCount = guests.filter((g) => g.status === 'pending').length;
  const declinedCount = guests.filter((g) => g.status === 'declined').length;

  // Filtragem
  const filteredGuests = guests.filter((g) => {
    const matchesSearch = 
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.phone && g.phone.includes(searchTerm)) ||
      (g.notes && g.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && g.status === statusFilter;
  });

  const handleOpenAdd = () => {
    setEditingGuest(null);
    setGuestForm({
      name: '',
      phone: '',
      status: 'confirmed',
      adultsCount: 1,
      childrenCount: 0,
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (guest) => {
    setEditingGuest(guest);
    setGuestForm({
      name: guest.name,
      phone: guest.phone || '',
      status: guest.status || 'confirmed',
      adultsCount: guest.adultsCount || 1,
      childrenCount: guest.childrenCount || 0,
      notes: guest.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveGuest = (e) => {
    e.preventDefault();
    if (!guestForm.name.trim()) return;

    const guestData = {
      id: editingGuest ? editingGuest.id : `gst-${Date.now()}`,
      eventId: event.id,
      name: guestForm.name.trim(),
      phone: guestForm.phone.trim(),
      status: guestForm.status,
      adultsCount: Number(guestForm.adultsCount) || 1,
      childrenCount: Number(guestForm.childrenCount) || 0,
      notes: guestForm.notes.trim(),
      confirmedAt: editingGuest?.confirmedAt || (guestForm.status === 'confirmed' ? new Date().toISOString() : null),
    };

    storage.addOrUpdateGuest(guestData);
    setIsModalOpen(false);
    refreshList();
  };

  const handleDelete = (guestId) => {
    if (window.confirm('Deseja remover este convidado da lista?')) {
      storage.deleteGuest(guestId);
      refreshList();
    }
  };

  // Exportação CSV
  const handleExportCSV = () => {
    const headers = ['Nome', 'Telefone', 'Status', 'Adultos', 'Criancas', 'Total Pessoas', 'Observacoes', 'Data Confirmacao'];
    const rows = guests.map((g) => [
      `"${g.name.replace(/"/g, '""')}"`,
      `"${(g.phone || '').replace(/"/g, '""')}"`,
      g.status === 'confirmed' ? 'Confirmado' : g.status === 'declined' ? 'Nao Comparecera' : 'Pendente',
      g.adultsCount,
      g.childrenCount,
      g.adultsCount + g.childrenCount,
      `"${(g.notes || '').replace(/"/g, '""')}"`,
      g.confirmedAt ? new Date(g.confirmedAt).toLocaleDateString('pt-BR') : '',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `convidados_${event.slug || 'evento'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download do Modelo CSV para importação
  const handleDownloadTemplate = () => {
    const templateHeaders = ['Nome', 'Telefone', 'Status', 'Adultos', 'Criancas', 'Observacoes'];
    const sampleRows = [
      ['Mariana Silva', '(11) 98765-4321', 'Confirmado', '2', '1', 'Vegetariana'],
      ['Carlos Eduardo', '(11) 91234-5678', 'Pendente', '1', '0', 'Padrinho'],
      ['Juliana Mendes', '(21) 99887-6543', 'Nao Comparecera', '1', '0', 'Viagem a trabalho']
    ];
    const csvContent = '\uFEFF' + [templateHeaders.join(';'), ...sampleRows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'modelo_importacao_convidados_laco.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Importação CSV robusta (aceita vírgula e ponto e vírgula do Excel brasileiro)
  const handleImportCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
          alert('Arquivo CSV vazio ou sem dados válidos.');
          return;
        }

        // Detecta separador da primeira linha (; ou ,)
        const delimiter = lines[0].includes(';') ? ';' : ',';

        let importedCount = 0;
        // Pula o cabeçalho
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols[0]) {
            const statusStr = (cols[2] || '').toLowerCase();
            const guestItem = {
              id: `gst-imp-${Date.now()}-${i}`,
              eventId: event.id,
              name: cols[0],
              phone: cols[1] || '',
              status: statusStr.includes('nao') || statusStr.includes('recus') 
                ? 'declined' 
                : statusStr.includes('pend') || statusStr.includes('aguard') 
                ? 'pending' 
                : 'confirmed',
              adultsCount: Math.max(1, parseInt(cols[3]) || 1),
              childrenCount: Math.max(0, parseInt(cols[4]) || 0),
              notes: cols[5] || '',
              confirmedAt: new Date().toISOString(),
            };
            storage.addOrUpdateGuest(guestItem);
            importedCount++;
          }
        }
        alert(`${importedCount} convidados importados com sucesso!`);
        refreshList();
      } catch (err) {
        alert('Erro ao importar CSV. Verifique o formato do arquivo.');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reseta input
  };

  return (
    <div className="space-y-6">
      
      {/* Indicadores do Painel de Convidados */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white border border-[#E8DFC8] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-[#7A7265] font-semibold block">Total na Lista</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-serif text-3xl font-bold text-[#231F1C]">{totalPeople}</span>
            <span className="text-xs text-[#8E8679]">pessoas ({guests.length} grupos)</span>
          </div>
        </div>

        <div className="bg-white border border-[#D5E5CA] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-[#4E6037] font-semibold block">Confirmados</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-serif text-3xl font-bold text-[#4E6037]">{confirmedTotal}</span>
            <span className="text-xs text-[#6B8550]">({confirmedAdults} adultos, {confirmedChildren} crianças)</span>
          </div>
        </div>

        <div className="bg-white border border-[#F2ECE1] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-[#C69F54] font-semibold block">Aguardando</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-serif text-3xl font-bold text-[#C69F54]">{pendingCount}</span>
            <span className="text-xs text-[#8E8679]">convites pendentes</span>
          </div>
        </div>

        <div className="bg-white border border-[#FADCD5] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-[#C2410C] font-semibold block">Não vão</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-serif text-3xl font-bold text-[#C2410C]">{declinedCount}</span>
            <span className="text-xs text-[#8E8679]">respostas</span>
          </div>
        </div>

      </div>

      {/* Banner: Cobrar confirmação via WhatsApp */}
      {(() => {
        const pendingWithPhone = guests.filter(g => g.status === 'pending' && g.phone);
        if (pendingWithPhone.length === 0) return null;
        const publicUrl = `${window.location.origin}#invite=${event.slug || event.id}`;
        return (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#F0FDF4] border border-[#86EFAC] rounded-2xl px-5 py-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#16A34A] flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#15803D]">
                  {pendingWithPhone.length} convidado{pendingWithPhone.length > 1 ? 's' : ''} aguardando — com telefone cadastrado
                </p>
                <p className="text-xs text-[#4ADE80] mt-0.5">Clique no ícone verde <Phone className="w-3 h-3 inline" /> ao lado de cada nome para enviar o lembrete no WhatsApp.</p>
              </div>
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Olá! 😊 Ainda estamos aguardando sua confirmação de presença. Você consegue confirmar pelo link? ${publicUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#16A34A] hover:bg-[#15803D] text-white shadow-sm transition-all whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5" />
              Cobrar todos via WhatsApp
            </a>
          </div>
        );
      })()}

      {/* Barra de Ações: Busca, Filtros, Import/Export e Adicionar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Campo de Pesquisa */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#8E8679] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, contato ou notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#E0D5C3] rounded-xl pl-10 pr-4 py-2 text-sm text-[#231F1C] focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
          />
        </div>

        {/* Filtros de Status */}
        <div className="flex items-center gap-1 bg-[#EFE9DF] p-1 rounded-xl border border-[#D8CFC4] self-start sm:self-auto">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'confirmed', label: 'Confirmados' },
            { id: 'pending', label: 'Aguardando' },
            { id: 'declined', label: 'Não vão' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-white text-[#722F37] shadow-2xs'
                  : 'text-[#6A6357] hover:text-[#231F1C]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Baixar Modelo CSV */}
          <button
            onClick={handleDownloadTemplate}
            title="Baixar planilha modelo vazia para preencher"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-[#D8CFC4] text-[#6A6357] hover:bg-[#FAF7F2] transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#4E6037]" />
            <span>Modelo CSV</span>
          </button>

          {/* Importar CSV */}
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-[#D8CFC4] text-[#6A6357] hover:bg-[#FAF7F2] transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>Importar CSV</span>
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>

          {/* Exportar CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-[#D8CFC4] text-[#6A6357] hover:bg-[#FAF7F2] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          {/* Adicionar Convidado */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#722F37] hover:bg-[#581C23] text-white shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Convidado</span>
          </button>
        </div>

      </div>

      {/* Visualização Mobile em Cartões (sm:hidden) */}
      <div className="sm:hidden space-y-3">
        {filteredGuests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8DFC8] p-8 text-center text-[#8E8679] text-xs">
            Nenhum convidado encontrado nesta busca.
          </div>
        ) : (
          filteredGuests.map((g) => (
            <div key={g.id} className="bg-white rounded-2xl border border-[#E8DFC8] p-4 space-y-3 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-sm text-[#231F1C]">{g.name}</h4>
                  {g.phone && <p className="text-xs text-[#7A7265] font-mono mt-0.5">{g.phone}</p>}
                </div>
                {g.status === 'confirmed' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF3E6] text-[#2C4A1D]">
                    <CheckCircle2 className="w-3 h-3" />
                    Confirmado
                  </span>
                ) : g.status === 'declined' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FDF2F2] text-[#9A3412]">
                    <XCircle className="w-3 h-3" />
                    Não vai
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FEF9C3] text-[#854D0E]">
                    <Clock className="w-3 h-3" />
                    Aguardando
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#F2ECE1]">
                <span className="text-[#6A6357]">
                  Pessoas: <strong className="text-[#231F1C] tabular-nums">{g.adultsCount + g.childrenCount}</strong> ({g.adultsCount} ad. {g.childrenCount > 0 ? `/ ${g.childrenCount} cr.` : ''})
                </span>
                <div className="flex items-center gap-1">
                  {g.status === 'pending' && g.phone && (
                    <a
                      href={`https://wa.me/55${g.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${g.name.split(' ')[0]}! 😊 Ainda não recebemos sua confirmação para o evento. Consegue confirmar sua presença pelo link? ${window.location.origin}#invite=${event.slug || event.id}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Cobrar confirmação via WhatsApp"
                      className="p-1 text-[#25D366] hover:bg-[#F0FDF4] rounded-lg"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleOpenEdit(g)}
                    className="p-1 text-[#8E8679] hover:text-[#722F37] rounded-lg"
                    title="Editar"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="p-1 text-[#8E8679] hover:text-[#DC2626] rounded-lg"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {g.notes && (
                <p className="text-[11px] text-[#7A7265] bg-[#FAF7F2] p-2 rounded-lg italic">
                  "{g.notes}"
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Tabela de Convidados para Desktop (hidden sm:block) */}
      <div className="hidden sm:block bg-white border border-[#E8DFC8] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8DFC8] bg-[#FAF7F2] text-[11px] font-semibold text-[#6A6357] uppercase tracking-wider">
                <th className="py-3.5 px-5">Convidado / Família</th>
                <th className="py-3.5 px-4">Contato</th>
                <th className="py-3.5 px-4 text-center">Status RSVP</th>
                <th className="py-3.5 px-4 text-center">Pessoas</th>
                <th className="py-3.5 px-4">Observações</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE1] text-xs">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-[#8E8679]">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Nenhum convidado encontrado nesta busca.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((g) => {
                  return (
                    <tr key={g.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-[#231F1C] block text-sm">{g.name}</span>
                        {g.confirmedAt && (
                          <span className="text-[10px] text-[#8E8679]">
                            Resp: {new Date(g.confirmedAt).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[#6A6357]">
                        {g.phone ? (
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-[#8E8679]" />
                            {g.phone}
                          </span>
                        ) : (
                          <span className="text-[#B8ADA0] italic">Sem contato</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {g.status === 'confirmed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EBF3E6] text-[#2C4A1D]">
                            <CheckCircle2 className="w-3 h-3" />
                            Confirmado
                          </span>
                        ) : g.status === 'declined' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FDF2F2] text-[#9A3412]">
                            <XCircle className="w-3 h-3" />
                            Não vai
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF9C3] text-[#854D0E]">
                            <Clock className="w-3 h-3" />
                            Aguardando
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-[#231F1C] text-sm">
                          {g.adultsCount + g.childrenCount}
                        </span>
                        <span className="text-[10px] text-[#8E8679] block">
                          {g.adultsCount} ad. {g.childrenCount > 0 ? `/ ${g.childrenCount} cr.` : ''}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#6A6357] max-w-xs truncate">
                        {g.notes || <span className="text-[#B8ADA0]">—</span>}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {g.status === 'pending' && g.phone && (
                            <a
                              href={`https://wa.me/55${g.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${g.name.split(' ')[0]}! 😊 Ainda não recebemos sua confirmação para o evento. Consegue confirmar sua presença pelo link? ${window.location.origin}#invite=${event.slug || event.id}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Cobrar confirmação via WhatsApp"
                              className="p-1.5 text-[#25D366] hover:bg-[#F0FDF4] rounded-lg transition-all"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenEdit(g)}
                            className="p-1.5 text-[#8E8679] hover:text-[#722F37] hover:bg-[#FAF4EC] rounded-lg transition-all"
                            title="Editar convidado"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(g.id)}
                            className="p-1.5 text-[#8E8679] hover:text-[#C2410C] hover:bg-[#FDF2F2] rounded-lg transition-all"
                            title="Remover convidado"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ADICIONAR / EDITAR CONVIDADO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E8DFC8] space-y-5">
            
            <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
              <h3 className="font-serif text-xl text-[#231F1C]">
                {editingGuest ? 'Editar Convidado' : 'Cadastrar Novo Convidado'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8E8679] hover:text-[#231F1C] p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGuest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                  Nome do Convidado ou Família *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Família Silva ou Pedro Henrique"
                  value={guestForm.name}
                  onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="(11) 90000-0000"
                  value={guestForm.phone}
                  onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                    Adultos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={guestForm.adultsCount}
                    onChange={(e) => setGuestForm({ ...guestForm, adultsCount: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2 text-sm text-center font-bold text-[#231F1C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                    Crianças
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={guestForm.childrenCount}
                    onChange={(e) => setGuestForm({ ...guestForm, childrenCount: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2 text-sm text-center font-bold text-[#231F1C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                  Situação da Confirmação (RSVP)
                </label>
                <select
                  value={guestForm.status}
                  onChange={(e) => setGuestForm({ ...guestForm, status: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                >
                  <option value="confirmed">Confirmado (Presença confirmada)</option>
                  <option value="pending">Aguardando confirmação</option>
                  <option value="declined">Não comparecerá</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                  Observações (Restrições alimentares, etc.)
                </label>
                <textarea
                  rows="2"
                  placeholder="Ex: Vegetariano, alérgico a camarão..."
                  value={guestForm.notes}
                  onChange={(e) => setGuestForm({ ...guestForm, notes: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6A6357] hover:bg-[#EFE9DF] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#722F37] hover:bg-[#581C23] text-white shadow-sm transition-all"
                >
                  {editingGuest ? 'Atualizar Convidado' : 'Salvar Convidado'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
