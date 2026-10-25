import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  AlertCircle,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { storage } from '../../services/storage';

export default function BudgetTracker({ event, onUpdate }) {
  const [expenses, setExpenses] = useState(() => storage.getExpenses(event.id));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [form, setForm] = useState({
    title: '',
    category: 'buffet',
    estimatedAmount: 0,
    actualAmount: 0,
    status: 'planejado', // 'planejado' | 'pago' | 'pendente'
    notes: '',
  });

  const refreshExpenses = () => {
    const list = storage.getExpenses(event.id);
    setExpenses(list);
    if (onUpdate) onUpdate();
  };

  const budgetLimit = Number(event.budgetLimit) || 0;
  const totalEstimated = expenses.reduce((sum, e) => sum + (Number(e.estimatedAmount) || 0), 0);
  const totalPaid = expenses
    .filter((e) => e.status === 'pago')
    .reduce((sum, e) => sum + (Number(e.actualAmount) || 0), 0);
  const totalPending = expenses
    .filter((e) => e.status === 'pendente')
    .reduce((sum, e) => sum + (Number(e.actualAmount) || 0), 0);
  const totalPlanned = expenses
    .filter((e) => e.status === 'planejado')
    .reduce((sum, e) => sum + (Number(e.estimatedAmount) || 0), 0);
  const totalCommitted = totalPaid + totalPending;

  const remainingBudget = budgetLimit - totalCommitted;
  const percentUsed = budgetLimit > 0 ? Math.min(100, Math.round((totalCommitted / budgetLimit) * 100)) : 0;
  const isOverBudget = remainingBudget < 0;

  // Categorias
  const categories = [
    { id: 'local', name: 'Espaço e Locação' },
    { id: 'buffet', name: 'Buffet e Gastronomia' },
    { id: 'decoracao', name: 'Decoração e Flores' },
    { id: 'fotografia', name: 'Foto e Vídeo' },
    { id: 'musica', name: 'Música e Iluminação' },
    { id: 'lembrancas', name: 'Lembrancinhas' },
    { id: 'outros', name: 'Outros Serviços' },
  ];

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setForm({
      title: '',
      category: 'buffet',
      estimatedAmount: 0,
      actualAmount: 0,
      status: 'pendente',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (expense) => {
    setEditingExpense(expense);
    setForm({
      title: expense.title,
      category: expense.category,
      estimatedAmount: expense.estimatedAmount || 0,
      actualAmount: expense.actualAmount || 0,
      status: expense.status || 'pendente',
      notes: expense.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const parsedEstimated = Math.max(0, parseFloat(String(form.estimatedAmount).replace(',', '.')) || 0);
    const parsedActual = Math.max(0, parseFloat(String(form.actualAmount).replace(',', '.')) || 0);

    const data = {
      id: editingExpense ? editingExpense.id : `exp-${Date.now()}`,
      eventId: event.id,
      title: form.title.trim(),
      category: form.category,
      estimatedAmount: parsedEstimated,
      actualAmount: parsedActual,
      status: form.status,
      notes: form.notes.trim(),
    };

    storage.addOrUpdateExpense(data);
    setIsModalOpen(false);
    refreshExpenses();
  };

  const handleDelete = (id) => {
    if (window.confirm('Excluir este lançamento de despesa?')) {
      storage.deleteExpense(id);
      refreshExpenses();
    }
  };

  const handleExportCSV = () => {
    const headers = ['Despesa', 'Categoria', 'Previsto', 'Real/Comprometido', 'Status', 'Observacoes'];
    const rows = expenses.map((e) => [
      `"${e.title.replace(/"/g, '""')}"`,
      e.category,
      e.estimatedAmount,
      e.actualAmount,
      e.status,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orcamento_${event.slug || 'evento'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Cards de Métricas Financeiras */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <div className="bg-white border border-[#E8DFC8] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-[#7A7265] font-semibold block">Teto do Orçamento</span>
          <div className="mt-2">
            <span className="font-serif text-xl font-bold text-[#231F1C] tabular-nums">
              {budgetLimit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#E8DFC8] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-[#7A7265] font-semibold block">Total Pago</span>
          <div className="mt-2">
            <span className="font-serif text-xl font-bold text-[#4E6037] tabular-nums">
              {totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#E8DFC8] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-[#7A7265] font-semibold block">Pendente de Pag.</span>
          <div className="mt-2">
            <span className="font-serif text-xl font-bold text-[#C69F54] tabular-nums">
              {totalPending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#E8DFC8] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-[#7A7265] font-semibold block">Só Planejado</span>
          <div className="mt-2">
            <span className="font-serif text-xl font-bold text-[#8E8679] tabular-nums">
              {totalPlanned.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <p className="text-[10px] text-[#A89F95] mt-1 leading-snug">Previsto, sem compromisso</p>
        </div>

        <div className={`bg-white border rounded-2xl p-4 shadow-xs ${isOverBudget ? 'border-[#FCA5A5]' : 'border-[#E8DFC8]'}`}>
          <span className="text-[11px] uppercase tracking-wider text-[#7A7265] font-semibold block">Saldo Disponível</span>
          <div className="mt-2 flex items-baseline gap-1 flex-wrap">
            <span className={`font-serif text-xl font-bold tabular-nums ${isOverBudget ? 'text-[#DC2626]' : 'text-[#722F37]'}`}>
              {remainingBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
            {isOverBudget && <span className="text-[10px] text-[#DC2626] font-bold uppercase">(Excedido)</span>}
          </div>
        </div>

      </div>

      {/* Barra de Progresso do Orçamento */}
      <div className="bg-white border border-[#E8DFC8] rounded-2xl p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-[#3D362C]">
            Uso do Orçamento: <span className="font-bold">{percentUsed}%</span> ({totalCommitted.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de {budgetLimit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
          </span>
          <span className={isOverBudget ? 'text-[#DC2626]' : 'text-[#4E6037]'}>
            {isOverBudget ? 'Alerta: Teto orçamentário ultrapassado!' : `Resta ${remainingBudget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
          </span>
        </div>

        <div className="w-full bg-[#EFE9DF] h-3 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-[#DC2626]' : percentUsed > 85 ? 'bg-[#EAB308]' : 'bg-[#4E6037]'}`} 
            style={{ width: `${Math.min(100, percentUsed)}%` }}
          />
        </div>
      </div>

      {/* Ações e Tabela de Lançamentos */}
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl text-[#231F1C]">Despesas</h3>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-[#D8CFC4] text-[#6A6357] hover:bg-[#FAF7F2] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#722F37] hover:bg-[#581C23] text-white shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Despesa</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#E8DFC8] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8DFC8] bg-[#FAF7F2] text-[11px] font-semibold text-[#6A6357] uppercase tracking-wider">
                <th className="py-3.5 px-5">Item / Fornecedor</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4 text-right">Valor Previsto</th>
                <th className="py-3.5 px-4 text-right">Valor Real</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Notas</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE1] text-xs">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#8E8679]">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Nenhum lançamento de despesa registrado ainda.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-[#231F1C]">
                      {exp.title}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="capitalize text-[11px] px-2 py-0.5 rounded bg-[#FAF4EC] text-[#722F37] border border-[#EFE8DC]">
                        {categories.find(c => c.id === exp.category)?.name || exp.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-[#6A6357]">
                      {(Number(exp.estimatedAmount) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-[#231F1C]">
                      {(Number(exp.actualAmount) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        exp.status === 'pago' 
                          ? 'bg-[#EBF3E6] text-[#2C4A1D]' 
                          : exp.status === 'pendente' 
                          ? 'bg-[#FEF9C3] text-[#854D0E]' 
                          : 'bg-[#F3F4F6] text-[#4B5563]'
                      }`}>
                        {exp.status === 'pago' ? 'Pago' : exp.status === 'pendente' ? 'A pagar' : 'Planejado'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[#7A7265] max-w-xs truncate">
                      {exp.notes || <span className="text-[#B8ADA0]">—</span>}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1.5 text-[#8E8679] hover:text-[#722F37] hover:bg-[#FAF4EC] rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-1.5 text-[#8E8679] hover:text-[#C2410C] hover:bg-[#FDF2F2] rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NOVO / EDITAR DESPESA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E8DFC8] space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
              <h3 className="font-serif text-xl text-[#231F1C]">
                {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8E8679] hover:text-[#231F1C]">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#3D362C] mb-1">Título / Fornecedor *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sinal do Buffet Gastronômico"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">Categoria</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2 text-sm text-[#231F1C]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2 text-sm text-[#231F1C]"
                  >
                    <option value="pago">Pago</option>
                    <option value="pendente">A pagar</option>
                    <option value="planejado">Planejado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">Valor Previsto (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.estimatedAmount}
                    onChange={(e) => setForm({ ...form, estimatedAmount: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2 text-sm font-bold text-[#231F1C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">Valor Real (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.actualAmount}
                    onChange={(e) => setForm({ ...form, actualAmount: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2 text-sm font-bold text-[#231F1C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D362C] mb-1">Observações / Parcelamento</label>
                <textarea
                  rows="2"
                  placeholder="Ex: Parcela 1 paga via PIX, parcela 2 no vencimento..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2 text-sm text-[#231F1C]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#6A6357]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#722F37] hover:bg-[#581C23] text-white shadow-sm"
                >
                  Salvar Despesa
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
