
import React, { useState, useEffect } from 'react';
import { validateApiKey } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: 'pt' | 'en';
}

const ApiKeyModal: React.FC<Props> = ({ isOpen, onClose, language }) => {
  const [key, setKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('LUMINA_API_KEY');
    if (saved) {
      setKey(saved);
      setHasKey(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const t = {
    title: language === 'pt' ? 'Chave de Acesso API' : 'API Access Key',
    active: language === 'pt' ? 'Ativa' : 'Active',
    description: language === 'pt' 
      ? 'Insira a sua chave API do Google Gemini. O sistema irá validar se a chave está ativa antes de gravar.' 
      : 'Enter your Google Gemini API key. The system will validate if the key is active before saving.',
    label: language === 'pt' ? 'Cole a sua Chave API aqui:' : 'Paste your API Key here:',
    placeholder: '........................................................',
    button: language === 'pt' ? 'Chave verificada e gravada!' : 'Key verified and saved!',
    buttonValidating: language === 'pt' ? 'Validando chave...' : 'Validating key...',
    link: language === 'pt' ? 'Obter uma chave API no Google AI Studio' : 'Get an API key at Google AI Studio',
    error: language === 'pt' ? 'Chave inválida. Verifique e tente novamente.' : 'Invalid key. Please check and try again.'
  };

  const handleSave = async () => {
    if (!key) return;
    setIsValidating(true);
    setStatus('idle');
    
    const isValid = await validateApiKey(key);
    setIsValidating(false);
    
    if (isValid) {
      localStorage.setItem('LUMINA_API_KEY', key);
      setHasKey(true);
      setStatus('success');
      setTimeout(onClose, 1500);
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-[480px] bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-neutral-100 flex flex-col p-8 sm:p-10 space-y-6 animate-in zoom-in-95 duration-300">
        
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-bold text-[#1e293b]">{t.title}</h2>
          {hasKey && (
            <span className="bg-[#dcfce7] text-[#166534] text-[12px] font-bold px-4 py-1.5 rounded-full">
              {t.active}
            </span>
          )}
        </div>

        <p className="text-[#64748b] text-[15px] leading-relaxed">
          {t.description}
        </p>

        <div className="space-y-3">
          <label className="text-[13px] font-medium text-[#64748b] block ml-1">
            {t.label}
          </label>
          <input 
            type="password"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setStatus('idle');
            }}
            placeholder={t.placeholder}
            className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-5 py-4 text-lg focus:outline-none focus:border-gold transition-all text-[#1e293b]"
          />
        </div>

        {status === 'error' && (
          <p className="text-red-500 text-xs font-bold text-center animate-in fade-in">
            {t.error}
          </p>
        )}

        <button 
          onClick={handleSave}
          disabled={isValidating || !key}
          className={`w-full py-4 rounded-xl font-bold text-white text-[16px] transition-all shadow-md active:scale-95 disabled:opacity-50 ${
            status === 'success' ? 'bg-[#22c55e]' : 'bg-[#22c55e] hover:brightness-105'
          }`}
        >
          {isValidating ? t.buttonValidating : t.button}
        </button>

        <div className="text-center pt-2">
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#3b82f6] text-[14px] font-medium hover:underline"
          >
            {t.link}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
