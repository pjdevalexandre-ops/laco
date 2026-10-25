import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Check, 
  Trash2, 
  DollarSign, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Edit3,
  Download
} from 'lucide-react';
import { storage } from '../../services/storage';

export default function ShoppingList({ event, onUpdate }) {
  const [items, setItems] = useState(() => storage.getShopping(event.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'purchased'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    name: '',
    category: 'alimentos',
    quantityNeeded: 1,
    unit: 'un',
    quantityBought: 0,
    estimatedPrice: 0,
    actualPrice: 0,
    isPurchased: false,
  });

  const refreshList = () => {
    const list = storage.getShopping(event.id);
    setItems(list);
    if (onUpdate) onUpdate();
  };

  // Cálculos consolidados
  const totalEstimated = items.reduce((sum, item) => sum + (Number(item.estimatedPrice) || 0), 0);
  const totalActual = items.reduce((sum, item) => sum + (Number(item.actualPrice) || 0), 0);
  const purchasedCount = items.filter((i) => i.isPurchased).length;
  const pendingCount = items.length - purchasedCount;

  // Filtragem
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'purchased' && item.isPurchased) || 
      (statusFilter === 'pending' && !item.isPurchased);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleTogglePurchased = (item) => {
    const updated = {
      ...item,
      isPurchased: !item.isPurchased,
      quantityBought: !item.isPurchased ? item.quantityNeeded : 0,
      actualPrice: !item.isPurchased && item.actualPrice === 0 ? item.estimatedPrice : item.actualPrice,
    };
    storage.addOrUpdateShoppingItem(updated);
    refreshList();
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({
      name: '',
      category: 'alimentos',
      quantityNeeded: 1,
      unit: 'un',
      quantityBought: 0,
      estimatedPrice: 0,
      actualPrice: 0,
      isPurchased: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category || 'alimentos',
      quantityNeeded: item.quantityNeeded || 1,
      unit: item.unit || 'un',
      quantityBought: item.quantityBought || 0,
      estimatedPrice: item.estimatedPrice || 0,
      actualPrice: item.actualPrice || 0,
      isPurchased: item.isPurchased || false,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const itemData = {
      id: editingItem ? editingItem.id : `shp-${Date.now()}`,
      eventId: event.id,
      name: form.name.trim(),
      category: form.category,
      quantityNeeded: Number(form.quantityNeeded) || 1,
      unit: form.unit || 'un',
      quantityBought: Number(form.quantityBought) || 0,
      estimatedPrice: Number(form.estimatedPrice) || 0,
      actualPrice: Number(form.actualPrice) || 0,
      isPurchased: form.isPurchased,
    };

    storage.addOrUpdateShoppingItem(itemData);
    setIsModalOpen(false);
    refreshList();
  };

  const handleDelete = (id) => {
    if (window.confirm('Excluir este item da lista de compras?')) {
      storage.deleteShoppingItem(id);
      refreshList();
    }
  };

  const handleExportCSV = () => {
    const headers = ['Item', 'Categoria', 'Qtd Necessaria', 'Qtd Comprada', 'Unidade', 'Preco Estimado', 'Preco Real', 'Situacao'];
    const rows = items.map((i) => [
      `"${i.name.replace(/"/g, '""')}"`,
      i.category,
      i.quantityNeeded,
      i.quantityBought,
      i.unit,
      i.estimatedPrice,
      i.actualPrice,
      i.isPurchased ? 'Comprado' : 'Pendente'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compras_${event.slug || 'evento'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Resumo Financeiro da Lista de Compras */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-white border border-[#E8DFC8] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-[#7A7265] font-semibold block">Total de Itens</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-serif text-3xl font-bold text-[#231F1C]">{items.length}</span>
            <span className="text-xs text-[#8E8679]">itens na lista</span>
          </div>
        </div>

        <div className="bg-white border border-[#D5E5CA] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-[#4E6037] font-semibold block">Já Comprados</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="font-serif text-3xl font-bold text-[#4E6037]">{purchasedCount}</span>
            <span className="text-xs text-[#6B8550]">({pendingCount} pendentes)</span>
          </div>
        </div>

        <div className="bg-white border border-[#E8DFC8] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-[#7A7265] font-semibold block">Total Estimado</span>
          <div className="mt-2">
            <span className="font-serif text-2xl font-bold text-[#231F1C]">
              {totalEstimated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#E8DFC8] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] uppercase tracking-wider text-[#722F37] font-semibold block">Total Real Pago</span>
          <div className="mt-2">
            <span className="font-serif text-2xl font-bold text-[#722F37]">
              {totalActual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>

      </div>

      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#8E8679] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#E0D5C3] rounded-xl pl-10 pr-4 py-2 text-sm text-[#231F1C] focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Todos os Status' },
            { id: 'pending', label: 'Pendentes' },
            { id: 'purchased', label: 'Comprados' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === s.id ? 'bg-[#722F37] text-white' : 'bg-white text-[#6A6357] border border-[#E8DFC8]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-[#D8CFC4] text-[#6A6357] hover:bg-[#FAF7F2] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#722F37] hover:bg-[#581C23] text-white shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Item</span>
          </button>
        </div>

      </div>

      {/* Tabela de Itens de Compras */}
      <div className="bg-white border border-[#E8DFC8] rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8DFC8] bg-[#FAF7F2] text-[11px] font-semibold text-[#6A6357] uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">Comprado</th>
                <th className="py-3.5 px-4">Item de Compra</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4 text-center">Necessário</th>
                <th className="py-3.5 px-4 text-center">Comprado</th>
                <th className="py-3.5 px-4 text-right">Preço Estimado</th>
                <th className="py-3.5 px-4 text-right">Preço Real</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE1] text-xs">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#8E8679]">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Nenhum item encontrado na lista de compras.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`transition-colors ${item.isPurchased ? 'bg-[#FAFBF9]/80' : 'hover:bg-[#FAF7F2]/60'}`}
                  >
                    {/* Checkbox de Compra */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleTogglePurchased(item)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                          item.isPurchased 
                            ? 'bg-[#4E6037] border-[#4E6037] text-white' 
                            : 'border-[#D8CFC4] bg-white hover:border-[#722F37]'
                        }`}
                      >
                        {item.isPurchased && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#231F1C]">
                      <span className={item.isPurchased ? 'line-through text-[#8E8679]' : ''}>
                        {item.name}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="capitalize text-[11px] px-2 py-0.5 rounded bg-[#FAF4EC] text-[#722F37] border border-[#EFE8DC]">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-[#231F1C]">
                      {item.quantityNeeded} <span className="text-[10px] text-[#8E8679] font-normal">{item.unit}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-[#4E6037]">
                      {item.quantityBought} <span className="text-[10px] text-[#8E8679] font-normal">{item.unit}</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-[#6A6357]">
                      {(Number(item.estimatedPrice) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-[#231F1C]">
                      {(Number(item.actualPrice) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-[#8E8679] hover:text-[#722F37] hover:bg-[#FAF4EC] rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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

      {/* MODAL NOVO / EDITAR ITEM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E8DFC8] space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
              <h3 className="font-serif text-xl text-[#231F1C]">
                {editingItem ? 'Editar Item de Compra' : 'Adicionar Item à Lista'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8E8679] hover:text-[#231F1C]">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#3D362C] mb-1">Nome do Item *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Espumante Moscatel ou Guardanapos de Linho"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">Categoria</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3 py-2 text-sm text-[#231F1C]"
                  >
                    <option value="alimentos">Alimentos</option>
                    <option value="bebidas">Bebidas</option>
                    <option value="descartaveis">Descartáveis</option>
                    <option value="decoracao">Decoração</option>
                    <option value="lembrancas">Lembranças</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">Unidade</label>
                  <input
                    type="text"
                    placeholder="un, kg, garrafas..."
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3 py-2 text-sm text-[#231F1C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">Qtd Necessária</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantityNeeded}
                    onChange={(e) => setForm({ ...form, quantityNeeded: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3 py-2 text-sm text-center font-bold text-[#231F1C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">Qtd Comprada</label>
                  <input
                    type="number"
                    min="0"
                    value={form.quantityBought}
                    onChange={(e) => setForm({ ...form, quantityBought: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3 py-2 text-sm text-center font-bold text-[#231F1C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">Preço Estimado (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.estimatedPrice}
                    onChange={(e) => setForm({ ...form, estimatedPrice: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3 py-2 text-sm font-bold text-[#231F1C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">Preço Real Pago (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.actualPrice}
                    onChange={(e) => setForm({ ...form, actualPrice: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3 py-2 text-sm font-bold text-[#231F1C]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPurchased}
                    onChange={(e) => setForm({ ...form, isPurchased: e.target.checked })}
                    className="w-4 h-4 text-[#722F37] rounded"
                  />
                  <span className="text-xs font-semibold text-[#3D362C]">Marcar como já comprado</span>
                </label>
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
                  Salvar Item
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
