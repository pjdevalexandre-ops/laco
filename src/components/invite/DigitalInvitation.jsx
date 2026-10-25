import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Share2, 
  Heart, 
  Sparkles, 
  MessageSquare,
  Users,
  Copy,
  Check,
  ArrowLeft,
  Navigation,
  Phone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { storage } from '../../services/storage';

export default function DigitalInvitation({ 
  event, 
  isPublic = false, 
  onBack = null 
}) {
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [adultsCount, setAdultsCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [responseStatus, setResponseStatus] = useState('confirmed'); // 'confirmed' | 'declined'
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [alreadyAnswered, setAlreadyAnswered] = useState(false);

  // Tema do evento
  const theme = event.theme || {
    primaryColor: '#722F37',
    secondaryColor: '#EFE9DF',
    accentColor: '#C69F54',
    bgColor: '#FAF7F2',
    monogram: 'L',
    preset: 'editorial_botanical'
  };

  // Checa se o prazo de RSVP já expirou
  const isDeadlineExpired = Boolean(
    event.rsvpDeadline && new Date(`${event.rsvpDeadline}T23:59:59-03:00`).getTime() < Date.now()
  );

  // Checa se o usuário atual no navegador já confirmou para este evento
  useEffect(() => {
    const savedRSVP = localStorage.getItem(`laco_rsvp_${event.id}`);
    if (savedRSVP) {
      setAlreadyAnswered(true);
      try {
        const parsed = JSON.parse(savedRSVP);
        setSubmittedMessage({
          name: parsed.name,
          status: parsed.status,
          total: (parsed.adultsCount || 0) + (parsed.childrenCount || 0)
        });
      } catch (e) {
        // ignora
      }
    }
  }, [event.id]);

  // Formatação de data
  let formattedDate = event.date;
  let dayOfWeek = '';
  try {
    const parts = event.date.split('-');
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    formattedDate = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    dayOfWeek = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });
  } catch {
    formattedDate = event.date;
  }

  // Contagem regressiva (Fuso horário oficial de Brasília -03:00)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });
  useEffect(() => {
    try {
      const timeStr = event.time || '18:00';
      const targetTime = new Date(`${event.date}T${timeStr}:00-03:00`).getTime();
      const updateTimer = () => {
        const now = Date.now();
        const diff = targetTime - now;
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setCountdown({ days, hours, minutes });
        } else {
          setCountdown({ days: 0, hours: 0, minutes: 0 });
        }
      };
      updateTimer();
      const interval = setInterval(updateTimer, 60000);
      return () => clearInterval(interval);
    } catch {
      // Ignora erro de data inválida
    }
  }, [event.date, event.time]);

  // Submissão do RSVP com validação e proteção anti-duplicidade
  const handleRsvpSubmit = (e) => {
    e.preventDefault();
    if (isDeadlineExpired) {
      alert('O prazo de confirmação de presença para este evento já foi encerrado.');
      return;
    }

    if (!guestName.trim()) {
      alert('Por favor, informe seu nome completo.');
      return;
    }

    if (phone.trim()) {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        alert('Por favor, informe um número de telefone ou WhatsApp válido com DDD.');
        return;
      }
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newGuest = {
        id: `gst-${Date.now()}`,
        eventId: event.id,
        name: guestName.trim(),
        phone: phone.trim(),
        status: responseStatus,
        adultsCount: responseStatus === 'confirmed' ? Number(adultsCount) : 0,
        childrenCount: responseStatus === 'confirmed' ? Number(childrenCount) : 0,
        notes: notes.trim(),
        confirmedAt: new Date().toISOString(),
      };

      storage.addOrUpdateGuest(newGuest);

      // Salva no localStorage local para evitar envios duplicados abusivos
      localStorage.setItem(`laco_rsvp_${event.id}`, JSON.stringify(newGuest));
      setAlreadyAnswered(true);
      setSubmittedMessage({
        name: newGuest.name,
        status: newGuest.status,
        total: newGuest.adultsCount + newGuest.childrenCount
      });

      setIsSubmitting(false);

      if (responseStatus === 'confirmed') {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReduced) {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: [theme.primaryColor, theme.accentColor || '#C69F54', '#F4E4DF']
          });
        }
      }
    }, 350);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/#invite=${event.slug || event.id}`;
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Você foi convidado com carinho: ${event.title}! Acesse o link para ver os detalhes e confirmar presença:`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div 
      className="min-h-screen py-6 sm:py-12 px-4 transition-colors"
      style={{ backgroundColor: theme.bgColor || '#FAF7F2' }}
    >
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Barra superior quando visualizado em modo público ou com botão de retorno */}
        {onBack && (
          <div className="flex items-center justify-between no-print mb-2">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/80 border border-[#D8CFC4] hover:bg-white text-[#231F1C] transition-all shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao Painel
            </button>
            <span className="text-[11px] text-[#7A7265] uppercase tracking-wider font-semibold">
              Prévia do Convidado
            </span>
          </div>
        )}

        {/* CARTÃO PRINCIPAL DO CONVITE */}
        <div 
          className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border relative overflow-hidden"
          style={{ borderColor: `${theme.primaryColor}25` }}
        >
          {/* Moldura interna editorial */}
          <div 
            className="border rounded-2xl p-6 sm:p-8 relative"
            style={{ borderColor: `${theme.primaryColor}30` }}
          >
            {/* Monograma ou Ícone Artístico */}
            <div className="text-center">
              <div 
                className={`w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full flex items-center justify-center font-serif font-bold shadow-inner mb-4 px-2 whitespace-nowrap overflow-hidden ${
                  (theme.monogram || event.title.charAt(0)).length > 3
                    ? 'text-sm sm:text-base tracking-normal'
                    : (theme.monogram || event.title.charAt(0)).length > 2
                    ? 'text-lg sm:text-xl tracking-tight'
                    : 'text-2xl sm:text-3xl'
                }`}
                style={{ 
                  backgroundColor: `${theme.primaryColor}12`, 
                  color: theme.primaryColor,
                  border: `1px solid ${theme.primaryColor}30`
                }}
              >
                {theme.monogram || event.title.charAt(0)}
              </div>

              {/* Subtítulo ou Nome dos Anfitriões */}
              <p 
                className="text-xs uppercase tracking-widest font-semibold"
                style={{ color: theme.accentColor || '#C69F54' }}
              >
                {event.hosts}
              </p>

              <p className="text-[11px] text-[#8E8679] uppercase tracking-widest mt-1">
                Convidam com imensa alegria para
              </p>

              {/* Título Principal */}
              <h1 
                className="font-serif text-3xl sm:text-4xl sm:leading-tight mt-3 mb-4"
                style={{ color: theme.primaryColor }}
              >
                {event.title}
              </h1>

              {/* Linha Divisória Delicada */}
              <div className="flex items-center justify-center gap-3 my-5">
                <div className="h-[1px] w-12" style={{ backgroundColor: `${theme.primaryColor}30` }} />
                <Sparkles className="w-3.5 h-3.5" style={{ color: theme.accentColor }} />
                <div className="h-[1px] w-12" style={{ backgroundColor: `${theme.primaryColor}30` }} />
              </div>

              {/* Mensagem Personalizada */}
              <p className="font-serif italic text-base sm:text-lg text-[#4A4237] leading-relaxed max-w-md mx-auto">
                "{event.customMessage || 'Sua presença tornará nosso dia ainda mais memorável e especial!'}"
              </p>
            </div>

            {/* BLOCO DE DATA, HORA E LOCAL */}
            <div className="mt-8 pt-8 border-t border-[#F2ECE1] space-y-4 text-center">
              
              <div className="inline-block px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#EAE2D5]">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold capitalize text-[#231F1C]">
                  <Calendar className="w-4 h-4" style={{ color: theme.primaryColor }} />
                  <span>{dayOfWeek}, {formattedDate}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs text-[#7A7265] mt-0.5">
                  <Clock className="w-3.5 h-3.5" style={{ color: theme.primaryColor }} />
                  <span>Horário: às {event.time}</span>
                </div>
              </div>

              {/* Local */}
              <div className="pt-2">
                <h3 className="font-serif text-lg font-bold text-[#231F1C] flex items-center justify-center gap-1.5">
                  <MapPin className="w-4 h-4" style={{ color: theme.primaryColor }} />
                  {event.locationName}
                </h3>
                <p className="text-xs text-[#6A6357] mt-1 max-w-sm mx-auto">
                  {event.locationAddress}
                </p>

                {/* Botão de Como Chegar */}
                <a
                  href={event.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.locationAddress || event.locationName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:shadow-xs"
                  style={{ 
                    borderColor: `${theme.primaryColor}40`,
                    color: theme.primaryColor,
                    backgroundColor: `${theme.primaryColor}08`
                  }}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Abrir no Google Maps
                </a>
              </div>

              {/* Informações Adicionais (Traje, etc) */}
              {event.extraInfo && (
                <div className="mt-4 p-3 rounded-xl bg-[#FBF9F6] border border-[#EFE8DC] text-xs text-[#686054] max-w-md mx-auto">
                  <span className="font-semibold text-[#231F1C] block mb-0.5">Informações Importantes:</span>
                  {event.extraInfo}
                </div>
              )}

              {/* Contagem Regressiva */}
              <div className="pt-4">
                <p className="text-[11px] uppercase tracking-widest text-[#8E8679] font-medium mb-2">
                  Faltam para o grande dia
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-14 py-2 bg-[#FAF7F2] rounded-xl border border-[#EAE0D1] text-center">
                    <span className="font-serif text-xl font-bold text-[#231F1C] block">{countdown.days}</span>
                    <span className="text-[10px] text-[#8E8679] uppercase">dias</span>
                  </div>
                  <div className="w-14 py-2 bg-[#FAF7F2] rounded-xl border border-[#EAE0D1] text-center">
                    <span className="font-serif text-xl font-bold text-[#231F1C] block">{countdown.hours}</span>
                    <span className="text-[10px] text-[#8E8679] uppercase">horas</span>
                  </div>
                  <div className="w-14 py-2 bg-[#FAF7F2] rounded-xl border border-[#EAE0D1] text-center">
                    <span className="font-serif text-xl font-bold text-[#231F1C] block">{countdown.minutes}</span>
                    <span className="text-[10px] text-[#8E8679] uppercase">min</span>
                  </div>
                </div>
              </div>

            </div>

            {/* BOTÕES DE COMPARTILHAMENTO */}
            <div className="mt-6 pt-5 border-t border-[#F2ECE1] flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Você foi convidado com muito carinho para: ${event.title}! ✨\n\nAcesse o link abaixo para ver todos os detalhes e confirmar sua presença:\n${window.location.origin}/#invite=${event.slug || event.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-xs transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Enviar no WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleShare}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#E0D5C3] text-[#6A6357] hover:text-[#231F1C] hover:bg-white transition-all"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#4E6037]" />
                    <span className="text-[#4E6037]">Link copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* SEÇÃO DE CONFIRMAÇÃO DE PRESENÇA (RSVP) */}
        <div 
          id="rsvp"
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border"
          style={{ borderColor: `${theme.primaryColor}20` }}
        >
          <div className="text-center mb-6">
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2"
              style={{ backgroundColor: `${theme.primaryColor}12`, color: theme.primaryColor }}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Confirmação de Presença
            </div>
            <h2 className="font-serif text-2xl text-[#231F1C]">Você poderá comparecer?</h2>
            <p className="text-xs text-[#7A7265] mt-1 max-w-sm mx-auto">
              {isDeadlineExpired
                ? `O prazo de confirmação encerrou em ${event.rsvpDeadline.split('-').reverse().join('/')}.`
                : event.rsvpDeadline 
                ? `Por favor, confirme sua presença até o dia ${event.rsvpDeadline.split('-').reverse().join('/')} para organizar os preparativos.`
                : 'Sua confirmação é indispensável para organizarmos a recepção com carinho.'}
            </p>
          </div>

          {isDeadlineExpired ? (
            <div className="p-6 rounded-2xl bg-[#FBF9F6] border border-[#EAE2D5] text-center space-y-2">
              <p className="font-serif text-lg text-[#231F1C] font-semibold">Prazo de Confirmações Encerrado</p>
              <p className="text-xs text-[#6A6357] max-w-sm mx-auto leading-relaxed">
                O prazo para responder a este convite encerrou em {event.rsvpDeadline.split('-').reverse().join('/')}. Caso precise avisar os anfitriões, por favor entre em contato diretamente com eles.
              </p>
            </div>
          ) : alreadyAnswered && submittedMessage ? (
            <div className="p-6 rounded-2xl bg-[#F7F9F5] border border-[#D5E5CA] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#EBF3E6] text-[#4E6037] flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl text-[#2C4A1D]">
                {submittedMessage.status === 'confirmed' ? 'Presença Confirmada!' : 'Resposta Registrada'}
              </h3>
              <p className="text-xs text-[#4F6A3E] max-w-sm mx-auto">
                {submittedMessage.status === 'confirmed' 
                  ? `Obrigado, ${submittedMessage.name}! Sua confirmação para ${submittedMessage.total} pessoa(s) foi registrada com sucesso.`
                  : `Agradecemos por avisar, ${submittedMessage.name}. Sentiremos sua falta nessa celebração!`}
              </p>
              <button
                onClick={() => setAlreadyAnswered(false)}
                className="text-[11px] text-[#7A7265] underline hover:text-[#231F1C] pt-2"
              >
                Alterar resposta ou confirmar outro convidado
              </button>
            </div>
          ) : (
            <form onSubmit={handleRsvpSubmit} className="space-y-4">
              
              {/* Opção Comparecerá / Não Comparecerá */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setResponseStatus('confirmed')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    responseStatus === 'confirmed'
                      ? 'bg-[#EBF3E6] border-[#4E6037] text-[#2C4A1D] shadow-xs'
                      : 'bg-white border-[#E0D5C3] text-[#6A6357] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 text-[#4E6037]" />
                  Sim, estarei presente!
                </button>

                <button
                  type="button"
                  onClick={() => setResponseStatus('declined')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    responseStatus === 'declined'
                      ? 'bg-[#FDF2F2] border-[#C2410C] text-[#9A3412] shadow-xs'
                      : 'bg-white border-[#E0D5C3] text-[#6A6357] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-[#C2410C]" />
                  Não poderei comparecer
                </button>
              </div>

              {/* Nome do Convidado */}
              <div>
                <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mariana Silva"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37]"
                />
              </div>

              {/* Telefone / WhatsApp */}
              <div>
                <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                  Telefone / WhatsApp (para lembretes)
                </label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2.5 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37]"
                />
              </div>

              {/* Quantidade de Pessoas (quando confirmado e permitido) */}
              {responseStatus === 'confirmed' && event.allowGroupRsvp && (
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE2D5]">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A5043] mb-1">
                      Adultos (incluindo você)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={event.maxGroupSize || 6}
                      value={adultsCount}
                      onChange={(e) => setAdultsCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-white border border-[#D8CFC4] rounded-lg px-3 py-1.5 text-sm text-center font-bold text-[#231F1C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A5043] mb-1">
                      Crianças (até 10 anos)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={event.maxGroupSize || 6}
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white border border-[#D8CFC4] rounded-lg px-3 py-1.5 text-sm text-center font-bold text-[#231F1C]"
                    />
                  </div>
                </div>
              )}

              {/* Mensagem / Restrição Alimentar */}
              <div>
                <label className="block text-xs font-semibold text-[#3D362C] mb-1">
                  Mensagem aos anfitriões ou restrição alimentar
                </label>
                <textarea
                  rows="2"
                  placeholder="Ex: Vegetariano, alérgico a glúten ou um recado carinhoso..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E0D5C3] rounded-xl px-3.5 py-2 text-sm text-[#231F1C] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#722F37]/30 focus:border-[#722F37]"
                />
              </div>

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-medium text-sm text-white shadow-sm transition-all hover:shadow hover:opacity-95 disabled:opacity-50"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {isSubmitting ? 'Gravando resposta...' : 'Confirmar Minha Resposta'}
              </button>

            </form>
          )}

        </div>

        {/* Rodapé institucional com a assinatura discreta do Ateliê LAÇO */}
        <div className="text-center pt-2 pb-6 space-y-1">
          <p className="text-[11px] text-[#8E8679]">
            Convite criado com carinho através do <span className="font-serif font-bold text-[#722F37]">LAÇO</span>
          </p>
          <p className="text-[10px] text-[#ABA294]">
            Plataforma autoral de convites digitais & assessoria de eventos
          </p>
        </div>

      </div>
    </div>
  );
}
