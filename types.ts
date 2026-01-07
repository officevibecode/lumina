
export type JewelryType = 'Anel' | 'Pulseira' | 'Colar' | 'Brincos' | '';

export interface JewelryItem {
  id: string;
  file: File;
  previewUrl: string;
  base64: string;
  type: JewelryType;
}

export type ModelMode = 'upload_model' | 'upload_self' | 'ai_auto' | 'ai_prompt';

export interface ModelSettings {
  mode: ModelMode;
  modelFile?: File;
  modelBase64?: string;
  promptDescription?: string;
  gender: 'Mulher' | 'Homem';
  ethnicity: string;
  ageRange: string;
  editorialStyle: string;
}

export type OutputFormat = '1:1' | '9:16' | '16:9' | '4:5';

export type AppStage = 'setup' | 'generating_image' | 'result' | 'generating_video';
