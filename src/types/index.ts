export type PanicLevel = 'low' | 'medium' | 'high';

export type CognitiveModelId =
  | 'lmls-4'
  | 'lmls-2.8'
  | 'lmls-5.1'
  | 'snif-5.8'
  | 'hals-5.5'
  | 'optic-5.5';

export interface CognitiveModelConfig {
  id: CognitiveModelId;
  name: string;
  shortName: string;
  title: string;
  subtitle: string;
  tag: string;
  speed: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  category: 'exam' | 'assignment' | 'clinical' | 'deadline' | 'study';
  priority: PanicLevel;
  completed?: boolean;
  linkedSessionId?: string;
  notes?: string;
  reminderDate?: string;
  reminderTime?: string;
  googleTasksSynced?: boolean;
  googleCalendarSynced?: boolean;
  alarmScheduled?: boolean;
}

export interface DriveFile {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'sheet' | 'code' | 'image';
  size: string;
  updatedAt: string;
  folder?: string;
  starred?: boolean;
  contentPreview?: string;
  url?: string;
}

export interface UserSession {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  role: string;
}

export type AttachmentType = 'image' | 'file' | 'drive' | 'link' | 'pdf';

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: AttachmentType;
  previewUrl?: string;
  url?: string;
  base64Data?: string;
  mimeType?: string;
}

export interface ShareSessionData {
  title: string;
  transcript: string;
  messages: ChatMessage[];
  createdAt: string;
  model: string;
}

export type DomainType = 'academic' | 'health' | 'productivity' | 'news' | 'global' | 'science';

export interface SessionHistoryItem {
  id: string;
  title: string;
  preview: string;
  category: 'today' | 'yesterday' | 'previous_7_days';
  domain: DomainType;
  timestamp: string;
  pinned?: boolean;
}

export interface DeadlineInfo {
  rawText: string;
  parsedDate: string;
  daysRemaining: number;
  priority: PanicLevel;
  subject?: string;
}

export interface CodeSnippet {
  language: string;
  title?: string;
  code: string;
}

export interface MathFormulaBlock {
  title: string;
  formula: string;
  explanation: string;
}

export interface HealthDataMetric {
  label: string;
  value: string;
  targetRange: string;
  status: 'optimal' | 'warning' | 'alert';
}

export interface JevDecision {
  decisionId: string;
  triageScore: number; // 0 - 100
  recommendedUrgency: PanicLevel;
  actionPathway: string;
  riskFactors: string[];
  decisionConfidence: string;
  checkpointDeadline: string;
}

export interface HealthMeta {
  sources: string[];
  takeaways: string[];
  disclaimer: string;
  metrics?: HealthDataMetric[];
  jevDecision?: JevDecision;
}

export interface NewsMeta {
  sources: string[];
  keyDevelopments: string[];
  globalImpact: string;
  region?: string;
  category?: string;
  publishedDate?: string;
  timeline?: { date: string; event: string }[];
}

export type KnowledgeCategory = 'news' | 'health' | 'science' | 'productivity' | 'global';

export interface WorldKnowledgeItem {
  id: string;
  title: string;
  category: KnowledgeCategory;
  subcategory: string;
  summary: string;
  content: string;
  tags: string[];
  source: string;
  sourceUrl?: string;
  date: string;
  readTime: string;
  keyTakeaways: string[];
  actionTips?: string[];
  clinicalDisclaimer?: string;
  metrics?: HealthDataMetric[];
  urgency?: PanicLevel;
  impact?: 'Global' | 'High' | 'Medium' | 'Routine';
  featured?: boolean;
}

export interface WikiMeta {
  title: string;
  description?: string;
  extract: string;
  pageUrl: string;
  thumbnailUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  domain?: DomainType;
  model?: string;
  attachments?: Attachment[];
  deadline?: DeadlineInfo;
  codeSnippets?: CodeSnippet[];
  mathBlocks?: MathFormulaBlock[];
  healthMeta?: HealthMeta;
  newsMeta?: NewsMeta;
  wikiMeta?: WikiMeta;
}
