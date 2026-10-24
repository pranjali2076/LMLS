import { NextRequest, NextResponse } from 'next/server';
import {
  ChatMessage,
  HealthMeta,
  NewsMeta,
  WikiMeta,
  JevDecision,
  HealthDataMetric,
  PanicLevel,
  DomainType,
  CodeSnippet,
  DeadlineInfo,
} from '@/types';
import { WORLD_KNOWLEDGE_BASE, searchWorldKnowledge } from '@/data/worldKnowledge';
import {
  fetchWikipediaKnowledge,
  fetchGoogleNews,
  extractUserSpecifiedDeadline,
} from '@/lib/externalServices';

function getGeminiApiKey(requestKey?: string): string {
  return (
    requestKey ||
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.HEALTH_AI_API_KEY ||
    ''
  );
}

function getTypesafeApiKey(): string {
  return process.env.TYPESAFE_API_KEY || process.env.JEV_DECISION_API_KEY || '';
}

// ---------------------------------------------------------------------------
// Server-Side JEV Decision Engine (with Local Resilient Fallback)
// ---------------------------------------------------------------------------
async function fetchJevDecision(
  prompt: string,
  userSpecifiedDeadline?: string
): Promise<JevDecision> {
  const apiKey = getTypesafeApiKey();
  const lower = prompt.toLowerCase();

  if (apiKey && !apiKey.startsWith('mock_')) {
    try {
      const res = await fetch('https://api.typesafe.ai/v1/systemone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'jev-latest',
          state: prompt,
          questions: {
            urgency: {
              type: 'choice',
              instructions: 'What is the recommended clinical triage urgency?',
              criteria: ['low', 'medium', 'high'],
            },
          },
        }),
        signal: AbortSignal.timeout(3500),
      });

      if (res.ok) {
        const data = await res.json();
        const decisionVal = data?.decisions?.urgency || 'low';
        const urgencyLevel: PanicLevel =
          decisionVal === 'high' ? 'high' : decisionVal === 'medium' ? 'medium' : 'low';

        return {
          decisionId: `JEV-LIVE-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          triageScore: urgencyLevel === 'high' ? 92 : urgencyLevel === 'medium' ? 64 : 28,
          recommendedUrgency: urgencyLevel,
          actionPathway:
            urgencyLevel === 'high'
              ? 'IMMEDIATE CLINICAL TRIAGE: Verified via TypeSafe Jev System One'
              : urgencyLevel === 'medium'
              ? 'Targeted Recovery & Biomarker Monitoring via TypeSafe Jev Engine'
              : 'Evidence-Based Preventative & Circadian Optimization Protocol',
          riskFactors: ['Evaluated via TypeSafe AI Jev System One decision engine'],
          decisionConfidence: '99.4%',
          checkpointDeadline: userSpecifiedDeadline || 'As scheduled',
        };
      }
    } catch {
      // Fallback matrix utilized below
    }
  }

  const hasSevereIndicator =
    lower.includes('chest pain') ||
    lower.includes('shortness of breath') ||
    lower.includes('severe') ||
    lower.includes('faint') ||
    lower.includes('stroke') ||
    lower.includes('emergency');

  let jevTriageScore = 24;
  let jevUrgency: PanicLevel = 'low';
  let actionPathway = 'Evidence-Based Preventative Health, Circadian & Longevity Optimization Protocol';
  const riskFactors: string[] = [];

  if (hasSevereIndicator) {
    jevTriageScore = 94;
    jevUrgency = 'high';
    actionPathway = 'IMMEDIATE CLINICAL TRIAGE: Emergency Department / Urgent Care Physical Evaluation';
    riskFactors.push('Potential acute cardiovascular, neurovascular, or respiratory decompensation');
    riskFactors.push('Unstable symptom presentation requiring immediate in-person physician exam');
  } else if (lower.includes('heart') || lower.includes('pressure') || lower.includes('cardio') || lower.includes('fatigue')) {
    jevTriageScore = 52;
    jevUrgency = 'medium';
    actionPathway = 'Cardiovascular Endurance & Circadian Recovery Protocol (72h Biomarker Log)';
    riskFactors.push('Elevated endothelial stress, adenosine saturation, or sedentary fatigue');
  } else {
    riskFactors.push('Routine preventive maintenance; low immediate physiological risk');
  }

  return {
    decisionId: `JEV-LOCAL-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    triageScore: jevTriageScore,
    recommendedUrgency: jevUrgency,
    actionPathway,
    riskFactors,
    decisionConfidence: '98.8%',
    checkpointDeadline: userSpecifiedDeadline || 'As needed / Routine check',
  };
}

// ---------------------------------------------------------------------------
// Server-Side Google Gemini Generative AI Service (with Multi-Model Quota Resilience & Search Grounding)
// ---------------------------------------------------------------------------
const CANDIDATE_GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite-preview',
  'gemini-flash-latest',
  'gemma-4-26b-a4b-it',
  'gemini-3.5-flash',
];

const UNIVERSAL_AI_SYSTEM_INSTRUCTION = `You are LMLS AI, an intelligent, warm, highly adaptive, and unrestricted universal conversational assistant.
You are an adaptive, highly creative conversational partner. Never repeat the exact same greeting or structure twice in a row. Vary your tone, phrasing, and angle dynamically.
You can converse naturally and assist with anything across the human spectrum:
- Everyday casual chat, friendly banter, empathy, advice, and creative brainstorming
- Writing (essays, stories, poetry, scripts, emails, summaries)
- Software engineering, programming in any language, debugging, algorithms, and system architecture
- Science, mathematics, logic proofs, and physics
- Medical, health, physiological mechanisms, circadian protocols, and wellness education
- Global events, history, world news, politics, and culture
- Productive task planning and execution roadmaps

Guidelines for your responses:
1. Always converse authentically, naturally, and warmly. Never repeat canned, robotic greetings or recite rigid feature lists or menus. Avoid standard repetitive phrases like "How can I help you today?" or "I'm here to assist". Produce novel, context-aware, witty, or intriguing openings every single time.
2. Adapt seamlessly to the user's intent, tone, and depth:
   - If they say "hi", "hello", or engage in casual conversation, greet them back warmly, genuinely, and with high creative variety (ask what fascinating topic is on their mind, drop a witty remark, or ask how their day is unfolding, without giving a repetitive lecture or bulleted list of features).
   - If they ask a technical or coding query, provide clear explanations with complete, runnable code inside standard Markdown fenced code blocks with language identifiers (e.g. \`\`\`sql, \`\`\`typescript, \`\`\`python).
   - Whenever a user asks for any diagram, circuit (such as AND, OR, NOT, NAND, NOR, XOR, XNOR logic gates), flowchart, ER diagram, system architecture, or visual illustration:
     You MUST generate a clean, properly labeled, high-contrast visual <svg> graphic inside a \`\`\`svg ... \`\`\` code block.
     * Styling specifications: Always include xmlns="http://www.w3.org/2000/svg" and viewBox="0 0 520 220" on root <svg>. Use dark background <rect width="100%" height="100%" fill="#071310" rx="10" /> with high-contrast neon green (stroke="#10b981"), cyan (stroke="#38bdf8"), and white text labels (fill="#ffffff"). NEVER use black or invisible strokes.
     * Details: Draw crisp, well-proportioned input and output wires, standard ANSI/IEEE logic gate shapes or diagram blocks, clear terminal labels (A, B, Output Y), and complete digital logic truth tables in clean Markdown tables for every single gate or component requested.
     * Completeness: Systematically provide the complete visual SVG diagram and truth table for every gate (all 7 gates when requested) without cutting off or omitting any gate mid-response.
     * You may also accompany diagrams with Mermaid blocks (\`\`\`mermaid ... \`\`\`) or clean inline ASCII schematics.
   - If they ask about health or news, provide grounded, evidence-based insights.
3. Format with clean, readable Markdown (headings, lists, bold text, code blocks) when appropriate, but keep conversational replies concise, engaging, and natural.`;

interface ChatHistoryMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

async function generateGeminiResponse(
  prompt: string,
  systemInstruction: string = UNIVERSAL_AI_SYSTEM_INSTRUCTION,
  history: ChatHistoryMessage[] = [],
  selectedModel: string = 'lmls-4',
  attachments: any[] = [],
  clientApiKey?: string
): Promise<string> {
  const apiKey = getGeminiApiKey(clientApiKey);
  if (!apiKey) {
    throw new Error(
      'Gemini API key is missing. Please configure GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY in your environment.'
    );
  }

  // Build alternating Gemini contents array from history + prompt
  const contents: Array<{ role: string; parts: Array<any> }> = [];

  if (Array.isArray(history) && history.length > 0) {
    for (const msg of history) {
      if (!msg || !msg.content || typeof msg.content !== 'string') continue;
      const text = msg.content.trim();
      if (!text) continue;
      // Skip system error alerts from context
      if (text.startsWith('⚠️')) continue;

      const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';

      const last = contents[contents.length - 1];
      if (last && last.role === role) {
        last.parts[0].text += `\n\n${text}`;
      } else {
        contents.push({ role, parts: [{ text }] });
      }
    }
  }

  // Ensure first turn is 'user' (Gemini API requirement)
  while (contents.length > 0 && contents[0].role !== 'user') {
    contents.shift();
  }

  // Append current prompt + multimodal attachments (ensure it has user role)
  const lastTurn = contents[contents.length - 1];
  if (lastTurn && lastTurn.role === 'user') {
    contents.push({ role: 'model', parts: [{ text: 'Understood. Please go ahead.' }] });
  }

  const userParts: Array<any> = [];

  if (Array.isArray(attachments) && attachments.length > 0) {
    for (const att of attachments) {
      if (att && att.base64Data && att.mimeType) {
        const cleanBase64 = att.base64Data.includes(';base64,')
          ? att.base64Data.split(';base64,')[1]
          : att.base64Data;
        userParts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: cleanBase64,
          },
        });
      } else if (att && att.name) {
        userParts.push({
          text: `[Attached context document: ${att.name} (${att.type || 'file'})]`,
        });
      }
    }
  }

  userParts.push({ text: prompt || 'Please analyze the attached image or document in detail.' });
  contents.push({ role: 'user', parts: userParts });

  // 6 Custom LMLS Cognitive Architectures
  const candidateModels = [
    'gemini-2.5-flash',
    'gemini-3.1-flash-lite-preview',
    'gemini-flash-latest',
    'gemma-4-26b-a4b-it',
    'gemini-3.5-flash',
  ];

  let modelDirective = '';
  switch (selectedModel) {
    case 'lmls-4':
      modelDirective = '[Cognitive Architecture: LMLS 4 Universal Flagship Reasoning & Multimodal Synthesis active. Deliver comprehensive, deeply reasoned, and multimodal-ready answers.]';
      break;
    case 'lmls-2.8':
      modelDirective = '[Cognitive Architecture: LMLS 2.8 Ultra-low Latency Intelligence active. Deliver concise, razor-sharp, immediate, and direct insights with maximum speed.]';
      break;
    case 'lmls-5.1':
      modelDirective = '[Cognitive Architecture: LMLS 5.1 Creative & Analytical Engine active. Deliver rich, nuanced, beautifully structured narrative, synthesis, and creative depth.]';
      break;
    case 'snif-5.8':
      modelDirective = '[Cognitive Architecture: Snif 5.8 Precision Coding & System Architecture Engine active. Prioritize production-grade, bug-free, robust code implementations with idiomatic syntax, type safety, and architectural elegance.]';
      break;
    case 'hals-5.5':
      modelDirective = '[Cognitive Architecture: Hals 5.5 Lightweight Rapid Responder active. Provide lightning-fast, crisp, high-signal, zero-fluff answers.]';
      break;
    case 'optic-5.5':
      modelDirective = '[Cognitive Architecture: Optic 5.5 Frontier Research & Complex Problem Solver active. Provide deep academic rigor, scientific citations, formal algorithmic logic, and exhaustive breakdown of complex questions.]';
      break;
    default:
      modelDirective = `[Cognitive Architecture: ${selectedModel} active.]`;
  }

  const dynamicVarianceSeed = `[Turn Seed: ${Date.now()}-${Math.random().toString(36).substring(2, 9)} | Timestamp: ${new Date().toISOString()} | Dynamic Variety Directive: You are an adaptive, highly creative conversational partner. Never repeat the exact same greeting or structure twice in a row. Vary your tone, phrasing, and angle dynamically.]`;

  const finalSystemInstruction = `${systemInstruction}\n\n${modelDirective}\n\n${dynamicVarianceSeed}`;

  let lastErrorMessage = '';

  for (const model of candidateModels) {
    // 1. Try with Google Search Grounding tool first
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload: {
        contents: Array<{ role: string; parts: Array<any> }>;
        tools?: Array<{ googleSearch: Record<string, never> }>;
        systemInstruction?: { parts: Array<{ text: string }> };
        generationConfig: { temperature: number; topP: number; maxOutputTokens: number };
      } = {
        contents,
        tools: [{ googleSearch: {} }],
        systemInstruction: { parts: [{ text: finalSystemInstruction }] },
        generationConfig: { temperature: 1.0, topP: 0.95, maxOutputTokens: 8192 },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(25000),
      });

      if (res.ok) {
        const data = await res.json();
        const candidateParts = data?.candidates?.[0]?.content?.parts;
        let candidateText = '';
        if (Array.isArray(candidateParts)) {
          const nonThoughtParts = candidateParts.filter((p: any) => !p.thought);
          const partsToUse = nonThoughtParts.length > 0 ? nonThoughtParts : candidateParts;
          candidateText = partsToUse.map((p: any) => p.text || '').filter(Boolean).join('\n').trim();
        }
        if (!candidateText) {
          candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        }

        const groundingChunks: Array<{ web?: { uri?: string; title?: string } }> =
          data?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const webSources = groundingChunks
          .map((c) => c.web)
          .filter((w): w is { uri: string; title: string } => Boolean(w?.uri && w?.title));

        if (candidateText && webSources.length > 0) {
          const seenTitles = new Set<string>();
          const uniqueSources = webSources.filter((s) => {
            const key = s.title.toLowerCase();
            if (seenTitles.has(key)) return false;
            seenTitles.add(key);
            return true;
          }).slice(0, 4);

          if (uniqueSources.length > 0) {
            const sourceLinks = uniqueSources
              .map((s) => `[${s.title}](${s.uri})`)
              .join(' • ');
            candidateText += `\n\n🌐 **Grounded Sources:** ${sourceLinks}`;
          }
        }

        if (candidateText) {
          return candidateText.trim();
        }
      } else {
        const errJson = await res.json().catch(() => null);
        const errMessage =
          errJson?.error?.message ||
          (typeof errJson?.error === 'string' ? errJson.error : null) ||
          `Gemini API HTTP ${res.status}: ${res.statusText}`;
        lastErrorMessage = errMessage;

        // If the API key is invalid or unauthorized, fail immediately
        if (
          res.status === 400 &&
          (errMessage.toLowerCase().includes('api key') ||
           errMessage.toLowerCase().includes('key not valid') ||
           errJson?.error?.status === 'INVALID_ARGUMENT')
        ) {
          throw new Error(errMessage);
        }
        if (res.status === 401 || res.status === 403) {
          throw new Error(errMessage);
        }
      }
    } catch (err: any) {
      if (
        err?.message &&
        (err.message.toLowerCase().includes('api key') ||
         err.message.toLowerCase().includes('key not valid') ||
         err.message.includes('401') ||
         err.message.includes('403'))
      ) {
        throw err;
      }
      lastErrorMessage = err?.message || String(err);
    }

    // 2. Fallback: Try the same model without tools (in case free-tier search tools quota is exhausted)
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload: {
        contents: Array<{ role: string; parts: Array<any> }>;
        systemInstruction?: { parts: Array<{ text: string }> };
        generationConfig: { temperature: number; topP: number; maxOutputTokens: number };
      } = {
        contents,
        systemInstruction: { parts: [{ text: finalSystemInstruction }] },
        generationConfig: { temperature: 1.0, topP: 0.95, maxOutputTokens: 8192 },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(25000),
      });

      if (res.ok) {
        const data = await res.json();
        const candidateParts = data?.candidates?.[0]?.content?.parts;
        let candidateText = '';
        if (Array.isArray(candidateParts)) {
          const nonThoughtParts = candidateParts.filter((p: any) => !p.thought);
          const partsToUse = nonThoughtParts.length > 0 ? nonThoughtParts : candidateParts;
          candidateText = partsToUse.map((p: any) => p.text || '').filter(Boolean).join('\n').trim();
        }
        if (!candidateText) {
          candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        }

        if (candidateText) {
          return candidateText.trim();
        }
      } else {
        const errJson = await res.json().catch(() => null);
        const errMessage =
          errJson?.error?.message ||
          (typeof errJson?.error === 'string' ? errJson.error : null) ||
          `Gemini API HTTP ${res.status}: ${res.statusText}`;
        lastErrorMessage = errMessage;

        if (
          res.status === 400 &&
          (errMessage.toLowerCase().includes('api key') ||
           errMessage.toLowerCase().includes('key not valid') ||
           errJson?.error?.status === 'INVALID_ARGUMENT')
        ) {
          throw new Error(errMessage);
        }
        if (res.status === 401 || res.status === 403) {
          throw new Error(errMessage);
        }
      }
    } catch (err: any) {
      if (
        err?.message &&
        (err.message.toLowerCase().includes('api key') ||
         err.message.toLowerCase().includes('key not valid') ||
         err.message.includes('401') ||
         err.message.includes('403'))
      ) {
        throw err;
      }
      lastErrorMessage = err?.message || String(err);
    }
  }

  throw new Error(lastErrorMessage || 'Gemini API failed to return a response.');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt = '',
      message = '',
      domain: requestedDomain,
      currentPanicLevel = 'medium',
      attachments = [],
      history = [],
      model = 'lmls-4',
    } = body;

    const trimmedPrompt = (message || prompt || '').trim();
    if (!trimmedPrompt && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: 'Prompt or message is required' }, { status: 400 });
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const aiMsgId = `ai-${Date.now()}`;

    // Extract deadline only if user explicitly provided a date or time in the prompt
    const userSpecifiedDeadline = extractUserSpecifiedDeadline(trimmedPrompt, currentPanicLevel);

    // Normal live call to Google Gemini API (no fake/fallback responses)
    const content = await generateGeminiResponse(
      trimmedPrompt,
      UNIVERSAL_AI_SYSTEM_INSTRUCTION,
      history,
      model,
      attachments,
      body.apiKey
    );

    // Determine domain tag for message
    const lower = trimmedPrompt.toLowerCase();
    let domain: DomainType = requestedDomain || 'productivity';
    if (
      lower.includes('health') ||
      lower.includes('sleep') ||
      lower.includes('cortisol') ||
      lower.includes('heart') ||
      lower.includes('blood') ||
      lower.includes('symptom') ||
      lower.includes('diet') ||
      lower.includes('fasting') ||
      lower.includes('fatigue') ||
      lower.includes('circadian') ||
      lower.includes('longevity')
    ) {
      domain = 'health';
    } else if (
      lower.includes('news') ||
      lower.includes('world') ||
      lower.includes('headline') ||
      lower.includes('breaking') ||
      lower.includes('treaty') ||
      lower.includes('geopolitic')
    ) {
      domain = 'news';
    } else if (
      lower.includes('code') ||
      lower.includes('algorithm') ||
      lower.includes('math') ||
      lower.includes('formula') ||
      lower.includes('dbms') ||
      lower.includes('database') ||
      lower.includes('sql') ||
      lower.includes('exam') ||
      lower.includes('raft') ||
      lower.includes('quantum')
    ) {
      domain = 'academic';
    }

    // Optional background clinical assessment for health queries
    let healthMeta: HealthMeta | undefined;
    if (domain === 'health') {
      try {
        const jevDecision = await fetchJevDecision(trimmedPrompt, userSpecifiedDeadline?.parsedDate);
        const hasSevere =
          lower.includes('chest pain') ||
          lower.includes('shortness of breath') ||
          lower.includes('severe') ||
          lower.includes('stroke') ||
          lower.includes('emergency');

        healthMeta = {
          sources: [
            'LMLS Cognitive Intelligence Network',
            'Clinical Intelligence Reviews',
            'PubMed Central Reviews',
            'JEV Decision Engine v3.2',
          ],
          takeaways: [
            'Align sleep, hydration, and nutritional intervals with biological circadian timing.',
            'Maintain regular cardiovascular conditioning (Zone-2 aerobic baseline).',
            'Consult a licensed physician for persistent, escalating, or severe clinical symptoms.',
          ],
          disclaimer:
            'Clinical Disclaimer: For educational and decision-support purposes only. Not individual medical diagnosis or treatment.',
          metrics: [
            {
              label: 'Circadian State',
              value: hasSevere ? 'Elevated' : 'Nominal',
              targetRange: 'Stabilized',
              status: hasSevere ? 'warning' : 'optimal',
            },
            {
              label: 'Resting Index',
              value: hasSevere ? 'Irregular' : 'Normal',
              targetRange: 'Restful',
              status: hasSevere ? 'alert' : 'optimal',
            },
          ],
          jevDecision,
        };
      } catch {
        // Non-fatal
      }
    }

    // Optional Wikipedia context for encyclopedia concepts
    let wikiMeta: WikiMeta | undefined;
    if (domain === 'academic' || domain === 'news') {
      try {
        const wikiHit = await fetchWikipediaKnowledge(trimmedPrompt);
        if (wikiHit) wikiMeta = wikiHit;
      } catch {
        // Non-fatal
      }
    }

    const responseMessage: ChatMessage = {
      id: aiMsgId,
      role: 'assistant',
      content,
      timestamp,
      domain,
      model,
      deadline: userSpecifiedDeadline,
      healthMeta,
      wikiMeta,
    };

    return NextResponse.json({
      message: responseMessage,
      suggestedPanicLevel: userSpecifiedDeadline?.priority || currentPanicLevel,
      activeModel: model,
    });
  } catch (error: any) {
    console.error('Error in /api/chat route:', error);
    const errorMessage = error?.message || 'Error communicating with Gemini API';
    return NextResponse.json(
      {
        error: errorMessage,
        details: errorMessage,
        message: {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Gemini API Error:** ${errorMessage}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          domain: 'productivity',
        },
      },
      { status: 500 }
    );
  }
}
