
import React from 'react';
import { ModelSettings, ModelMode } from '../types';

interface Props {
  settings: ModelSettings;
  setSettings: (s: ModelSettings) => void;
  language: 'pt' | 'en';
}

const ModelConfigurator: React.FC<Props> = ({ settings, setSettings, language }) => {
  const t = {
    title: language === 'pt' ? '2. Configuração do Modelo' : '2. Model Configuration',
    modes: {
      ai_auto: language === 'pt' ? 'IA Automática' : 'Auto AI',
      ai_prompt: language === 'pt' ? 'IA por Prompt' : 'AI Prompt',
      upload_model: language === 'pt' ? 'Foto Modelo' : 'Model Photo',
      upload_self: language === 'pt' ? 'Minha Foto' : 'Self Photo'
    },
    uploadLabel: language === 'pt' ? 'Upload da Imagem' : 'Image Upload',
    chooseFile: language === 'pt' ? 'Escolher ficheiro' : 'Choose file',
    descLabel: language === 'pt' ? 'Descrição do Modelo' : 'Model Description',
    descPlaceholder: language === 'pt' ? 'Ex: Modelo com sardas, olhar intenso...' : 'Ex: Model with freckles, intense look...',
    genderLabel: language === 'pt' ? 'Género' : 'Gender',
    genders: {
      Mulher: language === 'pt' ? 'Mulher' : 'Woman',
      Homem: language === 'pt' ? 'Homem' : 'Man'
    },
    ethnicityLabel: language === 'pt' ? 'Etnia / Perfil Visual' : 'Ethnicity / Visual Profile',
    ageLabel: language === 'pt' ? 'Idade Aparente' : 'Apparent Age',
    styleLabel: language === 'pt' ? 'Estilo Editorial' : 'Editorial Style',
    ethnicities: [
      { value: 'European (Brunette)', label: language === 'pt' ? 'Europeia (Morena)' : 'European (Brunette)' },
      { value: 'European (Blonde)', label: language === 'pt' ? 'Europeia (Loira)' : 'European (Blonde)' },
      { value: 'European (Redhead)', label: language === 'pt' ? 'Europeia (Ruiva)' : 'European (Redhead)' },
      { value: 'Latina', label: language === 'pt' ? 'Latina' : 'Latina' },
      { value: 'African', label: language === 'pt' ? 'Africana' : 'African' },
      { value: 'Asian', label: language === 'pt' ? 'Asiática' : 'Asian' },
      { value: 'Arab', label: language === 'pt' ? 'Árabe' : 'Arab' },
      { value: 'Mixed', label: language === 'pt' ? 'Mestiça / Diversa' : 'Mixed / Diverse' }
    ],
    styles: [
      { value: 'Luxo Minimalista', label: language === 'pt' ? 'Luxo Minimalista' : 'Minimalist Luxury' },
      { value: 'High Fashion', label: 'High Fashion' },
      { value: 'Clássico Premium', label: language === 'pt' ? 'Clássico Premium' : 'Classic Premium' },
      { value: 'Avant-garde', label: 'Avant-garde' }
    ]
  };

  const modes: { id: ModelMode; label: string; icon: string }[] = [
    { id: 'ai_auto', label: t.modes.ai_auto, icon: '/ia.svg' },
    { id: 'ai_prompt', label: t.modes.ai_prompt, icon: '/prompt.svg' },
    { id: 'upload_model', label: t.modes.upload_model, icon: '/foto.svg' },
    { id: 'upload_self', label: t.modes.upload_self, icon: '/minha-foto.svg' }
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result?.toString().split(',')[1] || "");
      reader.readAsDataURL(file);
    });
    setSettings({ ...settings, modelFile: file, modelBase64: base64 });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold gold-gradient">{t.title}</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => setSettings({ ...settings, mode: mode.id })}
            className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center space-y-2 ${
              settings.mode === mode.id 
                ? 'border-gold bg-gold/10 text-gold shadow-sm' 
                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 hover:border-gold'
            }`}
          >
            <img src={mode.icon} alt={mode.label} className="w-8 h-8" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{mode.label}</span>
          </button>
        ))}
      </div>

      {(settings.mode === 'upload_model' || settings.mode === 'upload_self') && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold opacity-60 uppercase tracking-wider">{t.uploadLabel}</label>
          <div className="flex items-center space-x-4">
            <label className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 cursor-pointer hover:border-gold transition-colors text-center shadow-sm">
              <span className="text-sm opacity-80">{settings.modelFile?.name || t.chooseFile}</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
            {settings.modelBase64 && (
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-sm">
                <img src={`data:image/png;base64,${settings.modelBase64}`} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      )}

      {settings.mode === 'ai_prompt' && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold opacity-60 uppercase tracking-wider">{t.descLabel}</label>
          <textarea
            value={settings.promptDescription}
            onChange={(e) => setSettings({ ...settings, promptDescription: e.target.value })}
            placeholder={t.descPlaceholder}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 text-sm focus:outline-none focus:border-gold h-20 shadow-sm"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-xs font-semibold opacity-60 uppercase tracking-wider">{t.genderLabel}</label>
          <div className="flex space-x-2">
            {(['Mulher', 'Homem'] as const).map(g => (
              <button
                key={g}
                onClick={() => setSettings({ ...settings, gender: g })}
                className={`flex-1 py-2 text-xs rounded-lg border transition-all shadow-sm ${
                  settings.gender === g ? 'bg-gold border-gold text-white font-bold' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 opacity-60'
                }`}
              >
                {t.genders[g]}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-xs font-semibold opacity-60 uppercase tracking-wider">{t.ethnicityLabel}</label>
          <select
            value={settings.ethnicity}
            onChange={(e) => setSettings({ ...settings, ethnicity: e.target.value })}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-gold shadow-sm"
          >
            {t.ethnicities.map(item => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-xs font-semibold opacity-60 uppercase tracking-wider">{t.ageLabel}</label>
          <input
            type="text"
            value={settings.ageRange}
            onChange={(e) => setSettings({ ...settings, ageRange: e.target.value })}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-gold shadow-sm"
            placeholder="Ex: 25-35"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold opacity-60 uppercase tracking-wider">{t.styleLabel}</label>
          <select
            value={settings.editorialStyle}
            onChange={(e) => setSettings({ ...settings, editorialStyle: e.target.value })}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-gold shadow-sm"
          >
            {t.styles.map(style => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ModelConfigurator;
