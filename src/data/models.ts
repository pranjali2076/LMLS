import { CognitiveModelConfig, CognitiveModelId } from '@/types';

export const LMLS_COGNITIVE_MODELS: CognitiveModelConfig[] = [
  {
    id: 'lmls-4',
    name: 'LMLS 4',
    shortName: 'LMLS 4',
    title: '✨ LMLS 4',
    subtitle: 'Universal flagship reasoning & multimodal synthesis',
    tag: 'FLAGSHIP • DEFAULT',
    speed: 'Deep Reasoning',
  },
  {
    id: 'lmls-2.8',
    name: 'LMLS 2.8',
    shortName: 'LMLS 2.8',
    title: '⚡ LMLS 2.8',
    subtitle: 'Ultra-low latency high-speed intelligence',
    tag: 'ULTRA-FAST',
    speed: 'Instant',
  },
  {
    id: 'lmls-5.1',
    name: 'LMLS 5.1',
    shortName: 'LMLS 5.1',
    title: '🎭 LMLS 5.1',
    subtitle: 'Creative, narrative & deep analytical engine',
    tag: 'CREATIVE & ANALYSIS',
    speed: 'Balanced',
  },
  {
    id: 'snif-5.8',
    name: 'Snif 5.8',
    shortName: 'Snif 5.8',
    title: '💻 Snif 5.8',
    subtitle: 'Precision coding & system architecture engine',
    tag: 'CODING & ARCHITECTURE',
    speed: 'Precise',
  },
  {
    id: 'hals-5.5',
    name: 'Hals 5.5',
    shortName: 'Hals 5.5',
    title: '⚡ Hals 5.5',
    subtitle: 'Instant lightweight rapid responder',
    tag: 'RAPID RESPONDER',
    speed: 'Instantaneous',
  },
  {
    id: 'optic-5.5',
    name: 'Optic 5.5',
    shortName: 'Optic 5.5',
    title: '🔬 Optic 5.5',
    subtitle: 'Frontier research & complex problem solver',
    tag: 'FRONTIER RESEARCH',
    speed: 'Exhaustive Deep Dive',
  },
];

export const DEFAULT_MODEL_ID: CognitiveModelId = 'lmls-4';

export function getModelConfig(id: string): CognitiveModelConfig {
  return (
    LMLS_COGNITIVE_MODELS.find((m) => m.id === id) ||
    LMLS_COGNITIVE_MODELS[0]
  );
}
