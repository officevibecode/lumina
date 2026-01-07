
import React, { useState, useEffect } from 'react';
import { 
  JewelryItem, 
  ModelSettings, 
  OutputFormat, 
  AppStage 
} from './types';
import JewelryUploader from './components/JewelryUploader';
import ModelConfigurator from './components/ModelConfigurator';
import ApiKeyModal from './components/ApiKeyModal';
import { 
  generateEditorialPrompt, 
  generateJewelryImage, 
  generateJewelryVideo 
} from './services/geminiService';

function App() {
  const [language, setLanguage] = useState<'pt' | 'en'>('pt');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [jewelry, setJewelry] = useState<JewelryItem[]>([]);
  const [settings, setSettings] = useState<ModelSettings>({
    mode: 'ai_auto',
    gender: 'Mulher',
    ethnicity: 'European (Brunette)',
    ageRange: '25-35',
    editorialStyle: 'Luxo Minimalista',
  });
  const [format, setFormat] = useState<OutputFormat>('9:16');
  const [stage, setStage] = useState<AppStage>('setup');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isApiKeyActive, setIsApiKeyActive] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    html.className = theme;
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem('LUMINA_API_KEY');
    setIsApiKeyActive(!!saved);
  }, [isApiModalOpen]);

  const formatOptions = [
    { 
      id: '9:16' as OutputFormat, 
      label: language === 'pt' ? 'Reels / Stories (vertical)' : 'Reels / Stories (portrait)', 
      sub: '768×1376 (9:16)',
      width: 768,
      height: 1376
    },
    { 
      id: '4:5' as OutputFormat, 
      label: language === 'pt' ? 'Feed' : 'Feed', 
      sub: '896×1200 (4:5)',
      width: 896,
      height: 1200
    },
    { 
      id: '1:1' as OutputFormat, 
      label: language === 'pt' ? 'Feed (quadrado)' : 'Feed (square)', 
      sub: '1024×1024 (1:1)',
      width: 1024,
      height: 1024
    },
    { 
      id: '16:9' as OutputFormat, 
      label: language === 'pt' ? 'Banner (horizontal)' : 'Banner (landscape)', 
      sub: '1920x1080 (16:9)',
      width: 1920,
      height: 1080
    },
  ];

  const t = {
    setupTitle: language === 'pt' ? 'Configuração Editorial' : 'Editorial Setup',
    setupDesc: language === 'pt' ? 'Defina as joias e o contexto da modelo para a criação.' : 'Define your jewelry and the model context for creation.',
    resultTitle: language === 'pt' ? 'Resultado Visual' : 'Visual Result',
    resultDesc: language === 'pt' ? 'Visualização da composição premium gerada pela IA.' : 'Preview of the premium AI-generated composition.',
    reset: language === 'pt' ? 'Resetar Estúdio' : 'Reset Studio',
    apiKey: language === 'pt' ? 'Chave API' : 'API Key',
    apiKeyActive: language === 'pt' ? 'Ativada' : 'Active',
    formatTitle: language === 'pt' ? '3. Site, Instagram, Facebook e Youtube' : '3. Site, Instagram, Facebook & Youtube',
    generateBtn: language === 'pt' ? 'Gerar Imagem Editorial' : 'Generate Editorial Image',
    processing: language === 'pt' ? 'Processando...' : 'Processing...',
    waiting: language === 'pt' ? 'Aguardando Criação' : 'Awaiting Creation',
    creatingImg: language === 'pt' ? 'Criando Composição...' : 'Creating Composition...',
    creatingVid: language === 'pt' ? 'Renderizando Vídeo...' : 'Rendering Video...',
    imgLoadDesc: language === 'pt' ? 'Preservando detalhes das joias e ajustando o caimento perfeito nos dedos.' : 'Preserving jewelry details and adjusting perfect fit on fingers.',
    vidLoadDesc: language === 'pt' ? 'Processando movimentos de câmera cinematográficos e reflexos dinâmicos.' : 'Processing cinematic camera movements and dynamic reflections.',
    refinePrompt: language === 'pt' ? 'Prompt de Refinamento' : 'Refinement Prompt',
    regenerate: language === 'pt' ? 'Regenerar' : 'Regenerate',
    genVideo: language === 'pt' ? 'Gerar Vídeo Cinematic (7s)' : 'Generate Cinematic Video (7s)',
    exporting: language === 'pt' ? 'Processando Exportação' : 'Processing Export',
    validateJewelry: language === 'pt' ? 'Envia pelo menos 1 imagem de joia para começar.' : 'Upload at least 1 jewelry image to start.',
    validateType: language === 'pt' ? 'Seleciona o tipo para cada joia enviada.' : 'Select the type for each uploaded jewelry.',
    validateModel: language === 'pt' ? 'Envia a foto da modelo.' : 'Please upload the model photo.',
    errorGen: language === 'pt' ? 'Erro na API. Verifique sua chave API e conexão.' : 'API Error. Check your API key and connection.',
    errorPermission: language === 'pt' ? 'Acesso Negado aos Modelos Pro. Verifique sua chave API.' : 'Pro Access Denied. Check your API key.',
    quickActions: [
      { label: language === 'pt' ? 'Mais luxuoso' : 'More luxurious', mod: "Enhance luxury, high-end look, expensive feeling." },
      { label: language === 'pt' ? 'Mais minimalista' : 'More minimalist', mod: "Minimalist composition, clean empty space, focused light." },
      { label: language === 'pt' ? 'Fundo mais escuro' : 'Darker background', mod: "Dark atmospheric background, moody lighting, obsidian tones." },
      { label: language === 'pt' ? 'Brilho intenso' : 'Intense sparkle', mod: "Enhance diamond sparkles, sharp reflections on gold, glistening light." },
      { label: language === 'pt' ? 'Ambiente Mármore' : 'Marble Setting', mod: "Premium Carrara marble surface background." },
      { label: language === 'pt' ? 'Ambiente Seda' : 'Silk Setting', mod: "Soft flowing black silk fabric background." }
    ]
  };

  const handleOpenApiModal = () => setIsApiModalOpen(true);

  const validate = () => {
    const savedKey = localStorage.getItem('LUMINA_API_KEY');
    if (!savedKey && !process.env.API_KEY) {
      setIsApiModalOpen(true);
      return language === 'pt' ? 'Por favor, configure sua chave API.' : 'Please configure your API key.';
    }
    if (jewelry.length === 0) return t.validateJewelry;
    if (jewelry.some(j => !j.type)) return t.validateType;
    if ((settings.mode === 'upload_model' || settings.mode === 'upload_self') && !settings.modelBase64) {
      return t.validateModel;
    }
    return null;
  };

  const handleGenerateImage = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    setStage('generating_image');
    setResultVideo(null);
    try {
      const types = jewelry.map(j => j.type);
      const prompt = await generateEditorialPrompt(types, settings, language, format, settings.promptDescription);
      setCurrentPrompt(prompt);
      const imageUrl = await generateJewelryImage(prompt, jewelry.map(j => ({ base64: j.base64, type: j.type })), settings.modelBase64, format);
      setResultImage(imageUrl);
      setStage('result');
    } catch (e: any) {
      console.error(e);
      if (e?.message?.includes("403") || e?.message?.includes("permission")) {
        setError(t.errorPermission);
        setIsApiModalOpen(true);
      } else {
        setError(t.errorGen);
      }
      setStage('setup');
    }
  };

  const handleRegenerate = async (newPrompt?: string) => {
    setStage('generating_image');
    try {
      const promptToUse = newPrompt || currentPrompt;
      const imageUrl = await generateJewelryImage(promptToUse, jewelry.map(j => ({ base64: j.base64, type: j.type })), settings.modelBase64, format);
      setResultImage(imageUrl);
      setStage('result');
    } catch (e: any) {
      if (e?.message?.includes("403") || e?.message?.includes("permission")) {
        setError(t.errorPermission);
        setIsApiModalOpen(true);
      } else {
        setError(language === 'pt' ? "Erro ao regenerar." : "Error regenerating.");
      }
      setStage('result');
    }
  };

  const handleDownload = async (fileFormat: 'png' | 'jpg') => {
    if (!resultImage) return;
    setIsDownloading(true);
    try {
      const currentFormatOption = formatOptions.find(o => o.id === format);
      const targetWidth = currentFormatOption?.width || 1024;
      const targetHeight = currentFormatOption?.height || 1024;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (fileFormat === 'jpg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          
          const link = document.createElement('a');
          const timestamp = new Date().getTime();
          const filename = `lumina-jewelry-${timestamp}.${fileFormat}`;
          link.href = canvas.toDataURL(fileFormat === 'png' ? 'image/png' : 'image/jpeg', 0.95);
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        setIsDownloading(false);
      };
      img.src = resultImage;
    } catch (e) {
      console.error("Erro ao baixar:", e);
      setError(language === 'pt' ? "Falha no download." : "Download failed.");
      setIsDownloading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!resultImage) return;
    setStage('generating_video');
    try {
      const videoUrl = await generateJewelryVideo(currentPrompt, resultImage);
      setResultVideo(videoUrl);
      setStage('result');
    } catch (e: any) {
      console.error(e);
      if (e?.message?.includes("403") || e?.message?.includes("permission")) {
        setError(t.errorPermission);
        setIsApiModalOpen(true);
      } else {
        setError(language === 'pt' ? "Erro na geração de vídeo." : "Video generation error.");
      }
      setStage('result');
    }
  };

  const handleQuickAction = (mod: string) => {
    const updated = `${currentPrompt} ${mod}`;
    setCurrentPrompt(updated);
    handleRegenerate(updated);
  };

  const getAspectClass = (fmt: OutputFormat) => {
    switch(fmt) {
      case '9:16': return 'aspect-[9/16]';
      case '4:5': return 'aspect-[4/5]';
      case '16:9': return 'aspect-[16/9]';
      case '1:1': return 'aspect-square';
      default: return 'aspect-square';
    }
  };

  return (
    <div className="min-h-screen pb-20 transition-colors duration-300">
      <header className="py-5 px-8 glass-panel sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
          <div>
            <img src="/lumina.svg" alt="LUMINA" className="h-16 w-auto" />
          </div>
          <div className="flex items-center space-x-4 border-l border-neutral-200 dark:border-neutral-800 pl-6">
            {(stage !== 'setup' || jewelry.length > 0) && (
              <button 
                onClick={() => { 
                  setStage('setup'); setResultVideo(null); setResultImage(null); setJewelry([]); setCurrentPrompt(""); setError(null);
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-gold transition-colors flex items-center space-x-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                <span>{t.reset}</span>
              </button>
            )}
            <button 
              onClick={handleOpenApiModal}
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center space-x-2 px-3 py-1.5 rounded-full border ${
                isApiKeyActive 
                  ? 'bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400' 
                  : 'bg-gold/5 border-gold/20 text-gold hover:opacity-80'
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
              <span>{t.apiKey} {isApiKeyActive && `(${t.apiKeyActive})`}</span>
              {isApiKeyActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-1"></span>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex bg-neutral-100 dark:bg-neutral-900 rounded-full p-1 border border-neutral-200 dark:border-neutral-800">
            <button onClick={() => setLanguage('pt')} className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${language === 'pt' ? 'bg-gold text-white shadow-sm' : 'opacity-40 hover:opacity-100'}`}>PT</button>
            <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${language === 'en' ? 'bg-gold text-white shadow-sm' : 'opacity-40 hover:opacity-100'}`}>EN</button>
          </div>
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-gold transition-all"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <main className="max-w-[1500px] mx-auto px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          <div className="space-y-12">
            <div className="space-y-2">
              <h2 className="serif text-4xl font-semibold gold-gradient">{t.setupTitle}</h2>
              <p className="opacity-50 text-base italic">{t.setupDesc}</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl text-red-500 text-sm flex items-center space-x-4 shadow-sm animate-in fade-in slide-in-from-top-4">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <span className="font-medium">{error}</span>
              </div>
            )}

            <JewelryUploader items={jewelry} setItems={setJewelry} language={language} />
            <ModelConfigurator settings={settings} setSettings={setSettings} language={language} />
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold gold-gradient">{t.formatTitle}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formatOptions.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setFormat(opt.id)}
                    className={`p-4 rounded-xl border transition-all text-left shadow-sm flex flex-col justify-center space-y-1 ${
                      format === opt.id ? 'bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-900 dark:border-white shadow-md' : 'bg-white dark:bg-transparent border-neutral-200 dark:border-neutral-800 opacity-60 hover:border-gold shadow-sm'
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-wider">{opt.label}</span>
                    <span className="text-[10px] opacity-60 font-medium">{opt.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={stage === 'generating_image' || stage === 'generating_video'}
              className="w-full btn-gold py-6 rounded-2xl text-white font-bold text-xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em]"
            >
              {stage === 'generating_image' ? t.processing : t.generateBtn}
            </button>
          </div>

          <div className="lg:sticky lg:top-32 space-y-8">
            <div className="space-y-2">
              <h2 className="serif text-4xl font-semibold gold-gradient">{t.resultTitle}</h2>
              <p className="opacity-50 text-base italic">{t.resultDesc}</p>
            </div>

            <div className={`relative w-full overflow-hidden rounded-3xl glass-panel shadow-2xl transition-all duration-700 bg-neutral-100 dark:bg-neutral-900/40 flex items-center justify-center border-2 border-transparent hover:border-gold/20 ${getAspectClass(format)}`}>
              
              {stage === 'setup' && !resultImage && (
                <div className="flex flex-col items-center space-y-6 opacity-20 group">
                  <div className="p-8 rounded-full border-2 border-dashed border-neutral-400 group-hover:border-gold transition-colors">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                  <p className="text-xs uppercase tracking-[0.4em] font-bold">{t.waiting}</p>
                </div>
              )}

              {(stage === 'generating_image' || stage === 'generating_video') && (
                <div className="flex flex-col items-center justify-center space-y-8 text-center p-12 bg-white/80 dark:bg-black/60 backdrop-blur-xl absolute inset-0 z-20">
                  <div className="w-20 h-20 border-4 border-neutral-200 dark:border-neutral-800 border-t-gold rounded-full animate-spin"></div>
                  <div className="space-y-3">
                    <h2 className="serif text-3xl font-bold gold-gradient">
                      {stage === 'generating_image' ? t.creatingImg : t.creatingVid}
                    </h2>
                    <p className="opacity-60 text-sm max-w-xs mx-auto leading-relaxed">
                      {stage === 'generating_image' ? t.imgLoadDesc : t.vidLoadDesc}
                    </p>
                  </div>
                </div>
              )}

              {(stage === 'result' || resultImage) && (
                <>
                  {resultVideo ? (
                    <video src={resultVideo} className="w-full h-full object-cover animate-in fade-in duration-1000 shadow-lg" controls autoPlay loop />
                  ) : (
                    <img src={resultImage!} className="w-full h-full object-cover animate-in zoom-in-95 duration-1000 shadow-lg" alt="Resultado Editorial" />
                  )}
                  {isDownloading && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center backdrop-blur-md z-30">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
                        <span className="text-xs uppercase tracking-widest font-black gold-gradient">{t.exporting}</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {(resultImage || resultVideo) && stage === 'result' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                {!resultVideo && (
                  <div className="flex gap-4">
                    <button onClick={() => handleDownload('png')} className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-gold py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black flex items-center justify-center space-x-3 transition-all shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      <span>PNG HI-RES</span>
                    </button>
                    <button onClick={() => handleDownload('jpg')} className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-gold py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black flex items-center justify-center space-x-3 transition-all shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      <span>JPG EDITORIAL</span>
                    </button>
                  </div>
                )}

                <div className="glass-panel rounded-3xl p-8 space-y-6 shadow-sm border border-neutral-100 dark:border-neutral-900">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] opacity-40">{t.refinePrompt}</h4>
                    <button onClick={() => handleRegenerate()} className="text-xs font-bold text-gold hover:underline flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                      <span>{t.regenerate}</span>
                    </button>
                  </div>
                  <textarea
                    value={currentPrompt}
                    onChange={(e) => setCurrentPrompt(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-black/40 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 text-sm opacity-80 focus:outline-none focus:border-gold h-28 leading-relaxed resize-none shadow-inner dark:text-white"
                  />
                  <div className="flex flex-wrap gap-3">
                    {t.quickActions.map(action => (
                      <button key={action.label} onClick={() => handleQuickAction(action.mod)} className="text-[10px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-full opacity-60 hover:opacity-100 hover:border-gold transition-all uppercase tracking-tighter font-bold shadow-sm">
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>

                {!resultVideo && (
                  <button onClick={handleGenerateVideo} className="w-full bg-neutral-900 dark:bg-white text-white dark:text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center space-x-3 shadow-2xl hover:scale-[1.02] transition-transform">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/></svg>
                    <span>{t.genVideo}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <ApiKeyModal 
        isOpen={isApiModalOpen} 
        onClose={() => setIsApiModalOpen(false)} 
        language={language} 
      />

      <footer className="py-8 glass-panel border-t border-neutral-200 dark:border-neutral-900 flex justify-center bg-white/50 dark:bg-black/80">
        <p className="text-[10px] opacity-40 tracking-[0.4em] font-black uppercase text-center px-10">
          Lumina Studio &copy; 2025 &bull; High Jewelry Marketing AI &bull; Ultra Fidelity Render Engine
        </p>
      </footer>
    </div>
  );
}

export default App;
