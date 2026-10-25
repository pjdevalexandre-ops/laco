import React, { useState } from 'react';
import { 
  Save, 
  ArrowLeft, 
  Palette, 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles, 
  FileText, 
  Eye, 
  Smartphone, 
  Monitor,
  Check
} from 'lucide-react';
import { THEME_PRESETS, EVENT_TYPES } from '../../services/templates';
import DigitalInvitation from '../invite/DigitalInvitation';
import { storage } from '../../services/storage';

export default function EventForm({ eventToEdit = null, onSave, onCancel }) {
  const isEditing = Boolean(eventToEdit?.id);

  // Form State
  const [formData, setFormData] = useState({
    id: eventToEdit?.id || `evt-${Date.now()}`,
    slug: eventToEdit?.slug || '',
    title: eventToEdit?.title || '',
    eventType: eventToEdit?.eventType || 'casamento',
    hosts: eventToEdit?.hosts || '',
    date: eventToEdit?.date || '2026-12-12',
    time: eventToEdit?.time || '18:00',
    locationName: eventToEdit?.locationName || '',
    locationAddress: eventToEdit?.locationAddress || '',
    mapsUrl: eventToEdit?.mapsUrl || '',
    customMessage: eventToEdit?.customMessage || 'Com muita alegria, convidamos você para celebrar este momento especial conosco.',
    extraInfo: eventToEdit?.extraInfo || 'Traje: Passeio Completo. Recepção no mesmo local.',
    rsvpDeadline: eventToEdit?.rsvpDeadline || '',
    allowGroupRsvp: eventToEdit?.allowGroupRsvp ?? true,
    maxGroupSize: eventToEdit?.maxGroupSize || 5,
    budgetLimit: eventToEdit?.budgetLimit || 20000,
    isArchived: eventToEdit?.isArchived || false,
    theme: eventToEdit?.theme || {
      preset: 'editorial_botanical',
      primaryColor: '#722F37',
      secondaryColor: '#EFE9DF',
      accentColor: '#C69F54',
      bgColor: '#FAF7F2',
      monogram: 'L',
      fontHeading: 'serif',
    }
  });

  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const [previewDevice, setPreviewDevice] = useState('mobile'); // 'mobile' | 'desktop'

  // Gera slug automaticamente se for novo evento com sufixo aleatório único contra adivinhação
  const handleTitleChange = (val) => {
    setIsDirty(true);
    const updated = { ...formData, title: val };
    if (!isEditing && !formData.slug) {
      const baseSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      const uniqueSuffix = Math.random().toString(36).substring(2, 7);
      updated.slug = baseSlug ? `${baseSlug}-${uniqueSuffix}` : `evento-${uniqueSuffix}`;
    }
    setFormData(updated);
  };

  const handleFieldChange = (field, val) => {
    setIsDirty(true);
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleApplyPreset = (preset) => {
    setIsDirty(true);
    setFormData({
      ...formData,
      theme: {
        ...formData.theme,
        preset: preset.id,
        primaryColor: preset.primaryColor,
        secondaryColor: preset.secondaryColor,
        accentColor: preset.accentColor,
        bgColor: preset.bgColor,
        fontHeading: preset.fontHeading.includes('Serif') ? 'serif' : 'sans',
      }
    });
  };

  const handleSafeCancel = () => {
    if (isDirty && !window.confirm('Existem alterações não salvas no convite. Deseja realmente sair sem salvar?')) {
      return;
    }
    onCancel();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Por favor, informe o nome do evento.');
      return;
    }

    const saved = storage.saveEvent({
      ...formData,
      slug: formData.slug || `evento-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: eventToEdit?.createdAt || new Date().toISOString(),
    });

    setIsDirty(false);
    onSave(saved);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Barra Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8DFC8]">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSafeCancel}
            className="p-2 rounded-xl text-[#6A6357] hover:bg-[#EFE9DF] transition-all"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#231F1C]">
              {isEditing ? `Personalizar: ${formData.title}` : 'Criar Novo Convite Personalizado'}
            </h1>
            <p className="text-xs text-[#7A7265]">
              Configure o design autoral, informações e preferências do cliente
            </p>
          </div>
        </div>

        {/* Alternância Editor vs Prévia */}
        <div className="flex items-center gap-3">
          <div className="bg-[#EFE9DF] p-1 rounded-xl flex items-center gap-1 border border-[#D8CFC4]">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'editor'
                  ? 'bg-white text-[#722F37] shadow-xs'
                  : 'text-[#6A6357] hover:text-[#231F1C]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Editar Dados & Design
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'preview'
                  ? 'bg-white text-[#722F37] shadow-xs'
                  : 'text-[#6A6357] hover:text-[#231F1C]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Prévia do Convite
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 bg-[#722F37] hover:bg-[#581C23] text-white px-5 py-2 rounded-xl text-sm font-medium shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            Salvar Convite
          </button>
        </div>
      </div>

      {activeTab === 'preview' ? (
        /* VISUALIZAÇÃO DE PRÉVIA */
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <span className="text-xs text-[#7A7265] font-medium">Modo de visualização:</span>
            <div className="bg-[#EFE9DF] p-1 rounded-xl flex items-center gap-1 border border-[#D8CFC4]">
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                  previewDevice === 'mobile' ? 'bg-white text-[#722F37] shadow-xs' : 'text-[#6A6357]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Celular (Mobile)
              </button>
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                  previewDevice === 'desktop' ? 'bg-white text-[#722F37] shadow-xs' : 'text-[#6A6357]'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Computador
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            {previewDevice === 'mobile' ? (
              <div className="w-full max-w-[420px] bg-[#231F1C] p-3 rounded-[40px] shadow-2xl border-4 border-[#3D3732]">
                <div className="rounded-[32px] overflow-hidden bg-white max-h-[82vh] overflow-y-auto">
                  <DigitalInvitation event={formData} isPublic={false} />
                </div>
              </div>
            ) : (
              <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md border border-[#E8DFC8] overflow-hidden max-h-[85vh] overflow-y-auto">
                <DigitalInvitation event={formData} isPublic={false} />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* FORMULÁRIO DE EDIÇÃO */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna 1 & 2: Dados do Evento */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Bloco 1: Informações Básicas */}
            <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 shadow-xs space-y-4">
              <h2 className="font-serif text-xl text-[#231F1C] flex items-center gap-2 border-b border-[#F2ECE1] pb-3">
                <FileText className="w-4 h-4 text-[#722F37]" />
                1. Informações Principais do Evento
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                    Nome / Título do Evento *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Casamento Clara & Lucas ou Aniversário Theo 4 Anos"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                    Tipo de Evento
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                    Nome dos Anfitriões *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Clara & Lucas ou Mariana & Roberto"
                    value={formData.hosts}
                    onChange={(e) => setFormData({ ...formData, hosts: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                    Data do Evento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                    Horário de Início *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                  />
                </div>
              </div>
            </div>

            {/* Bloco 2: Local e Endereço */}
            <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 shadow-xs space-y-4">
              <h2 className="font-serif text-xl text-[#231F1C] flex items-center gap-2 border-b border-[#F2ECE1] pb-3">
                <MapPin className="w-4 h-4 text-[#722F37]" />
                2. Localização e Mapa
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                    Nome do Espaço / Local *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Villa das Flores, Espaço Brincar ou Residência dos Anfitriões"
                    value={formData.locationName}
                    onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                    Endereço Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Rua, número, bairro, cidade e estado"
                    value={formData.locationAddress}
                    onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                    Link Personalizado do Google Maps (Opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://maps.app.goo.gl/..."
                    value={formData.mapsUrl}
                    onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                  />
                </div>
              </div>
            </div>

            {/* Bloco 3: Textos Personalizados */}
            <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 shadow-xs space-y-4">
              <h2 className="font-serif text-xl text-[#231F1C] flex items-center gap-2 border-b border-[#F2ECE1] pb-3">
                <Sparkles className="w-4 h-4 text-[#722F37]" />
                3. Mensagem e Informações aos Convidados
              </h2>

              <div>
                <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                  Texto de Boas-vindas / Convocação *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Mensagem afetuosa para abrir o convite..."
                  value={formData.customMessage}
                  onChange={(e) => setFormData({ ...formData, customMessage: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                  Informações Adicionais (Traje, Estacionamento, Recepção, etc.)
                </label>
                <textarea
                  rows="2"
                  placeholder="Ex: Traje Passeio Completo. Estacionamento gratuito com manobrista no local."
                  value={formData.extraInfo}
                  onChange={(e) => setFormData({ ...formData, extraInfo: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                    Prazo Limite para Confirmação (RSVP)
                  </label>
                  <input
                    type="date"
                    value={formData.rsvpDeadline}
                    onChange={(e) => setFormData({ ...formData, rsvpDeadline: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                    Teto de Orçamento Estimado (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={formData.budgetLimit}
                    onChange={(e) => setFormData({ ...formData, budgetLimit: Number(e.target.value) || 0 })}
                    className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30"
                  />
                </div>
              </div>

            </div>

          </div>

          {/* Coluna 3: Identidade Visual e Estilo Autoral */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 shadow-xs space-y-5">
              <h2 className="font-serif text-xl text-[#231F1C] flex items-center gap-2 border-b border-[#F2ECE1] pb-3">
                <Palette className="w-4 h-4 text-[#722F37]" />
                Identidade Visual Autoral
              </h2>

              {/* Monograma ou Iniciais */}
              <div>
                <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                  Monograma / Iniciais do Selo
                </label>
                <input
                  type="text"
                  maxLength="5"
                  placeholder="Ex: C & L ou T 4"
                  value={formData.theme?.monogram || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    theme: { ...formData.theme, monogram: e.target.value.toUpperCase() }
                  })}
                  className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2 text-sm text-center font-serif font-bold text-[#722F37]"
                />
              </div>

              {/* Presets Editoriais */}
              <div>
                <label className="block text-xs font-semibold text-[#3D362C] mb-2">
                  Escolha um Tema Editorial Base
                </label>
                <div className="space-y-2.5">
                  {THEME_PRESETS.map((preset) => {
                    const isSelected = formData.theme?.preset === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#722F37] bg-[#FAF4EC] shadow-2xs'
                            : 'border-[#EAE2D5] bg-[#FFFFFF] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border border-black/10 shadow-2xs" 
                              style={{ backgroundColor: preset.primaryColor }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full border border-black/10 shadow-2xs -ml-2" 
                              style={{ backgroundColor: preset.accentColor }}
                            />
                            <span className="text-xs font-bold text-[#231F1C] ml-1">{preset.name}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#722F37]" />}
                        </div>
                        <p className="text-[11px] text-[#7A7265] mt-1 leading-tight">{preset.subtitle}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ajuste fino de Cores */}
              <div className="pt-2 border-t border-[#F2ECE1] space-y-3">
                <span className="text-xs font-semibold text-[#3D362C] block">Personalizar Paleta:</span>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6A6357]">Cor Principal:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.theme?.primaryColor || '#722F37'}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, primaryColor: e.target.value }
                      })}
                      className="w-7 h-7 rounded border border-gray-300 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono">{formData.theme?.primaryColor}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6A6357]">Destaque / Acentos:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.theme?.accentColor || '#C69F54'}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, accentColor: e.target.value }
                      })}
                      className="w-7 h-7 rounded border border-gray-300 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono">{formData.theme?.accentColor}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6A6357]">Fundo Papel:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.theme?.bgColor || '#FAF7F2'}
                      onChange={(e) => setFormData({
                        ...formData,
                        theme: { ...formData.theme, bgColor: e.target.value }
                      })}
                      className="w-7 h-7 rounded border border-gray-300 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono">{formData.theme?.bgColor}</span>
                  </div>
                </div>
              </div>

              {/* Slug do link público */}
              <div className="pt-2 border-t border-[#F2ECE1]">
                <label className="block text-[11px] font-semibold text-[#3D362C] mb-1">
                  Endereço Exclusivo do Convite (Slug)
                </label>
                <div className="flex items-center bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3 py-1.5 text-xs text-[#7A7265]">
                  <span>/c/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full bg-transparent border-none text-[#231F1C] font-mono focus:outline-none px-1"
                  />
                </div>
              </div>

              {/* Botão de Salvar */}
              <button
                type="submit"
                className="w-full bg-[#722F37] hover:bg-[#581C23] text-white py-3 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar Configurações
              </button>

            </div>
          </div>

        </form>
      )}

    </div>
  );
}
