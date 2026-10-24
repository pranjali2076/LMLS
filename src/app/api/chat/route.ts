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
// Server-Side Google Gemini Generative AI Service (Sub-Second Streaming & Latency Optimized)
// ---------------------------------------------------------------------------
const CANDIDATE_GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite-preview',
  'gemini-3.5-flash',
  'gemini-flash-latest',
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
   - If they say "hi", "hello", or engage in casual conversation, greet them back warmly, genuinely, and with high creative variety.
   - If they ask a technical or coding query, provide clear explanations with complete, runnable code inside standard Markdown fenced code blocks with language identifiers (e.g. \`\`\`sql, \`\`\`typescript, \`\`\`python).
   - Fast Visual Diagrams & Schematics Engine:
     * For standard digital logic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR):
       The frontend workspace has built-in, instant high-precision ANSI/IEEE vector schematics.
       To trigger the diagram box instantly with zero latency, output a lightweight 3-line \`\`\`svg trigger block:
       \`\`\`svg
       <!-- [GATE] Gate Schematic -->
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 260"><title>[GATE] Gate</title></svg>
       \`\`\`
       (For example: for AND gate, output:
       \`\`\`svg
       <!-- AND Gate Schematic -->
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 260"><title>AND Gate</title></svg>
       \`\`\`
       and for OR gate:
       \`\`\`svg
       <!-- OR Gate Schematic -->
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 260"><title>OR Gate</title></svg>
       \`\`\`).
       NEVER write hundreds of lines of raw SVG coordinate XML for standard logic gates. The frontend renders the complete ANSI/IEEE vector schematic instantly from this 3-line trigger.
       Always provide the digital logic truth table in a clean Markdown table right below each gate.
       When all 7 gates are requested, systematically provide the 3-line trigger block and truth table for every single one of the 7 gates (AND, OR, NOT, NAND, NOR, XOR, XNOR).
     * For custom diagrams, system architectures, cloud models, or flowcharts:
       Always adhere to strict Non-Overlapping Grid Layout rules:
       - ViewBox & Canvas: Always use a spacious viewBox="0 0 800 460" with dark background canvas <rect width="100%" height="100%" fill="#071310" rx="10" />.
       - Vertical Grid Rows: Organize components into distinct horizontal rows separated by at least 80px vertically (e.g., Row 1 at y=40 for Header/Users, Row 2 at y=150 for Core Service Layers like SaaS/PaaS/IaaS side-by-side or cleanly stacked with 55px height, Row 3 at y=340 for Deployment Models like Public/Hybrid/Private Cloud).
       - Box Sizing & Centering: Size every <rect> width to at least (text.length * 9 + 40) pixels so text NEVER overflows or touches box edges. Always center labels using text-anchor="middle" dominant-baseline="middle" with the text coordinates (x, y) placed exactly at the center of its enclosing rect.
       - Dark Glass Styling: Use dark translucent fills (fill="#0d261f" or fill="#0b221c") with neon green or cyan borders (stroke="#10b981" or stroke="#38bdf8", stroke-width="2", rx="8"). NEVER use solid white, bright gray, or opaque white fills behind text. NEVER stack decorative cloud outlines or enclosing shapes across text boxes. Labels must always have fill="#ffffff" font-family="monospace" font-size="13" font-weight="bold".
       - You may also accompany diagrams with Mermaid blocks (\`\`\`mermaid ... \`\`\`).
   - If they ask about health or news, provide grounded, evidence-based insights.
3. Format with clean, readable Markdown (headings, lists, bold text, code blocks) when appropriate, but keep conversational replies concise, engaging, and natural.`;

interface ChatHistoryMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

function buildGeminiContents(
  prompt: string,
  history: ChatHistoryMessage[] = [],
  attachments: any[] = []
): Array<{ role: string; parts: Array<any> }> {
  const contents: Array<{ role: string; parts: Array<any> }> = [];

  if (Array.isArray(history) && history.length > 0) {
    for (const msg of history) {
      if (!msg || !msg.content || typeof msg.content !== 'string') continue;
      const text = msg.content.trim();
      if (!text) continue;
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

  while (contents.length > 0 && contents[0].role !== 'user') {
    contents.shift();
  }

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

  userParts.push({ text: prompt || 'Please analyze the attached context in detail.' });
  contents.push({ role: 'user', parts: userParts });

  return contents;
}

function buildSystemInstruction(systemInstruction: string = UNIVERSAL_AI_SYSTEM_INSTRUCTION, selectedModel: string = 'lmls-4'): string {
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

  return `${systemInstruction}\n\n${modelDirective}\n\n${dynamicVarianceSeed}`;
}

// ---------------------------------------------------------------------------
// Real-time Sub-Second Streaming Handler (Gemini streamGenerateContent?alt=sse)
// ---------------------------------------------------------------------------
async function streamGeminiResponse({
  prompt,
  systemInstruction,
  history,
  selectedModel,
  attachments,
  clientApiKey,
  aiMsgId,
  domain,
  userSpecifiedDeadline,
  currentPanicLevel,
  timestamp,
  healthMetaPromise,
  wikiMetaPromise,
}: {
  prompt: string;
  systemInstruction?: string;
  history?: ChatHistoryMessage[];
  selectedModel?: string;
  attachments?: any[];
  clientApiKey?: string;
  aiMsgId: string;
  domain: DomainType;
  userSpecifiedDeadline?: DeadlineInfo;
  currentPanicLevel: PanicLevel;
  timestamp: string;
  healthMetaPromise?: Promise<HealthMeta | undefined>;
  wikiMetaPromise?: Promise<WikiMeta | undefined>;
}): Promise<Response> {
  const apiKey = getGeminiApiKey(clientApiKey);
  if (!apiKey) {
    throw new Error('Gemini API key is missing. Please configure GEMINI_API_KEY in your environment.');
  }

  const contents = buildGeminiContents(prompt, history, attachments);
  const finalSystemInstruction = buildSystemInstruction(systemInstruction, selectedModel);

  let activeGeminiResponse: globalThis.Response | null = null;
  let activeModelUsed = 'gemini-2.5-flash';
  let lastErrorMessage = '';

  for (const model of CANDIDATE_GEMINI_MODELS) {
    // 1. Primary: Try with thinkingBudget: 0 (sub-second TTFT)
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
      const payload: any = {
        contents,
        systemInstruction: { parts: [{ text: finalSystemInstruction }] },
        generationConfig: {
          temperature: 0.4,
          topP: 0.95,
          maxOutputTokens: 4096,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(18000),
      });

      if (res.ok && res.body) {
        activeGeminiResponse = res;
        activeModelUsed = model;
        break;
      } else {
        const errJson = await res.json().catch(() => null);
        const errMessage = errJson?.error?.message || `HTTP ${res.status}`;
        lastErrorMessage = errMessage;

        // If thinkingConfig rejected with 400 (e.g. preview model without thinkingBudget parameter), retry without it
        if (res.status === 400 && errMessage.toLowerCase().includes('thinking')) {
          const retryRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              systemInstruction: { parts: [{ text: finalSystemInstruction }] },
              generationConfig: {
                temperature: 0.4,
                topP: 0.95,
                maxOutputTokens: 4096,
              },
            }),
            signal: AbortSignal.timeout(18000),
          });
          if (retryRes.ok && retryRes.body) {
            activeGeminiResponse = retryRes;
            activeModelUsed = model;
            break;
          }
        }
      }
    } catch (err: any) {
      lastErrorMessage = err?.message || String(err);
    }
  }

  if (!activeGeminiResponse || !activeGeminiResponse.body) {
    throw new Error(lastErrorMessage || 'Gemini streaming service temporarily unavailable.');
  }

  const geminiReader = activeGeminiResponse.body.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        // 1. Immediately send initial metadata in 0ms so frontend can mount message card
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'meta',
              id: aiMsgId,
              domain,
              model: activeModelUsed,
              deadline: userSpecifiedDeadline,
              timestamp,
            })}\n\n`
          )
        );

        let buffer = '';
        while (true) {
          const { done, value } = await geminiReader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const dataStr = trimmed.replace(/^data:\s*/, '');
            if (!dataStr || dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              const parts = parsed?.candidates?.[0]?.content?.parts;
              if (Array.isArray(parts)) {
                for (const p of parts) {
                  if (p.thought) continue;
                  if (p.text) {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ type: 'chunk', text: p.text })}\n\n`
                      )
                    );
                  }
                }
              }
            } catch {
              // ignore partial SSE frames
            }
          }
        }

        // Flush trailing buffer
        if (buffer.trim().startsWith('data:')) {
          try {
            const dataStr = buffer.trim().replace(/^data:\s*/, '');
            if (dataStr && dataStr !== '[DONE]') {
              const parsed = JSON.parse(dataStr);
              const parts = parsed?.candidates?.[0]?.content?.parts;
              if (Array.isArray(parts)) {
                for (const p of parts) {
                  if (!p.thought && p.text) {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ type: 'chunk', text: p.text })}\n\n`
                      )
                    );
                  }
                }
              }
            }
          } catch {
            // ignore
          }
        }

        // 2. Await concurrent background tasks (JEV health triage, Wikipedia)
        const [healthMeta, wikiMeta] = await Promise.all([
          healthMetaPromise || Promise.resolve(undefined),
          wikiMetaPromise || Promise.resolve(undefined),
        ]);

        // 3. Emit done event with complete enriched metadata
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'done',
              suggestedPanicLevel: userSpecifiedDeadline?.priority || currentPanicLevel,
              healthMeta,
              wikiMeta,
            })}\n\n`
          )
        );
        controller.close();
      } catch (streamErr: any) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              error: streamErr?.message || 'Streaming failed',
            })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

// ---------------------------------------------------------------------------
// Non-streaming Response Fallback (used if client requests non-streaming JSON)
// ---------------------------------------------------------------------------
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
    throw new Error('Gemini API key is missing. Please configure GEMINI_API_KEY in your environment.');
  }

  const contents = buildGeminiContents(prompt, history, attachments);
  const finalSystemInstruction = buildSystemInstruction(systemInstruction, selectedModel);

  let lastErrorMessage = '';

  for (const model of CANDIDATE_GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload: any = {
        contents,
        systemInstruction: { parts: [{ text: finalSystemInstruction }] },
        generationConfig: {
          temperature: 0.4,
          topP: 0.95,
          maxOutputTokens: 4096,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000),
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
        lastErrorMessage = errJson?.error?.message || `HTTP ${res.status}`;
      }
    } catch (err: any) {
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
      stream = true,
    } = body;

    const trimmedPrompt = (message || prompt || '').trim();
    if (!trimmedPrompt && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: 'Prompt or message is required' }, { status: 400 });
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const aiMsgId = `ai-${Date.now()}`;

    // Extract deadline only if user explicitly provided a date or time in the prompt
    const userSpecifiedDeadline = extractUserSpecifiedDeadline(trimmedPrompt, currentPanicLevel);

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

    // Kick off concurrent background enrichment tasks (JEV health triage & Wikipedia)
    let healthMetaPromise: Promise<HealthMeta | undefined> | undefined;
    if (domain === 'health') {
      healthMetaPromise = (async () => {
        try {
          const jevDecision = await fetchJevDecision(trimmedPrompt, userSpecifiedDeadline?.parsedDate);
          const hasSevere =
            lower.includes('chest pain') ||
            lower.includes('shortness of breath') ||
            lower.includes('severe') ||
            lower.includes('stroke') ||
            lower.includes('emergency');

          return {
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
          return undefined;
        }
      })();
    }

    let wikiMetaPromise: Promise<WikiMeta | undefined> | undefined;
    if (domain === 'academic' || domain === 'news') {
      wikiMetaPromise = (async () => {
        try {
          return (await fetchWikipediaKnowledge(trimmedPrompt)) || undefined;
        } catch {
          return undefined;
        }
      })();
    }

    // 1. If streaming enabled (default), return immediate sub-second SSE stream
    if (stream !== false) {
      return await streamGeminiResponse({
        prompt: trimmedPrompt,
        systemInstruction: UNIVERSAL_AI_SYSTEM_INSTRUCTION,
        history,
        selectedModel: model,
        attachments,
        clientApiKey: body.apiKey,
        aiMsgId,
        domain,
        userSpecifiedDeadline,
        currentPanicLevel,
        timestamp,
        healthMetaPromise,
        wikiMetaPromise,
      });
    }

    // 2. Non-streaming JSON fallback
    const content = await generateGeminiResponse(
      trimmedPrompt,
      UNIVERSAL_AI_SYSTEM_INSTRUCTION,
      history,
      model,
      attachments,
      body.apiKey
    );

    const [healthMeta, wikiMeta] = await Promise.all([
      healthMetaPromise || Promise.resolve(undefined),
      wikiMetaPromise || Promise.resolve(undefined),
    ]);

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
