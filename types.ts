
import { ArtisticStyle } from "./constants";

export interface ReferenceImage {
  id: string;
  data: string; // Base64
  mimeType: string;
}

export interface PromptVariation {
  id: number;
  text: string;
  generatedImageUrl?: string;
  status: 'idle' | 'generating' | 'completed' | 'error';
}

export interface GenerationBatch {
  id: string;
  timestamp: number;
  prompt: string;
  style?: ArtisticStyle;
  variations: PromptVariation[];
  referenceImages: ReferenceImage[];
}

export interface GenerationState {
  isGeneratingVariations: boolean;
  isGeneratingImages: boolean;
  currentBatchId: string | null;
  history: GenerationBatch[];
  error: string | null;
}
