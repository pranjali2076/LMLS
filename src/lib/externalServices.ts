import { WikiMeta, DeadlineInfo, PanicLevel } from '@/types';

// ============================================================================
// 1. WIKIPEDIA KNOWLEDGE SERVICE
// ============================================================================

export async function fetchWikipediaKnowledge(query: string): Promise<WikiMeta | null> {
  try {
    if (!query || query.trim().length < 3) return null;

    // Clean up query for Wikipedia search (strip punctuation and common prefixes)
    const cleanQuery = query
      .replace(/[?!.,;:()'"]/g, '')
      .replace(/\b(what is|who is|explain|tell me about|how does|define|summarize|search for|about)\b/gi, '')
      .trim();

    const searchTerm = cleanQuery || query.trim();
    const searchLower = searchTerm.toLowerCase();

    if (searchLower.length < 3) {
      return null;
    }

    // 1. Search Wikipedia for best matching article title
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      searchTerm
    )}&utf8=&format=json&origin=*`;

    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'LMLS-Cognitive-Assistant/1.0 (academic-research)' },
      signal: AbortSignal.timeout(4000),
    });

    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const firstHit = searchData?.query?.search?.[0];
    if (!firstHit || !firstHit.title) return null;

    // Verify strict semantic relevance:
    const titleLower = firstHit.title.toLowerCase();
    const snippetLower = (firstHit.snippet || '').toLowerCase();

    // For single-word queries, title must strictly start with or equal the search term
    // (Prevents query "hii" matching actor "Remy Hii")
    if (!searchLower.includes(' ')) {
      const isExactOrPrefixMatch =
        titleLower === searchLower ||
        titleLower.startsWith(searchLower + ' ') ||
        titleLower.startsWith(searchLower + ' (');
      if (!isExactOrPrefixMatch) {
        return null;
      }
    } else {
      // For multi-word queries, require at least half of the query tokens to match
      const queryTokens = searchLower.split(/\s+/).filter((w) => w.length > 2);
      const matchCount = queryTokens.filter(
        (token) => titleLower.includes(token) || snippetLower.includes(token)
      ).length;
      if (matchCount === 0 || matchCount < Math.ceil(queryTokens.length / 2)) {
        return null;
      }
    }

    // 2. Fetch full verified extract from Wikipedia REST summary API
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      firstHit.title.replace(/ /g, '_')
    )}`;

    const summaryRes = await fetch(summaryUrl, {
      headers: { 'User-Agent': 'LMLS-Cognitive-Assistant/1.0 (academic-research)' },
      signal: AbortSignal.timeout(4000),
    });

    if (!summaryRes.ok) return null;
    const summaryData = await summaryRes.json();

    if (!summaryData.extract) return null;

    return {
      title: summaryData.title || firstHit.title,
      description: summaryData.description || 'Verified Wikipedia Encyclopedia Article',
      extract: summaryData.extract,
      pageUrl: summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(firstHit.title.replace(/ /g, '_'))}`,
      thumbnailUrl: summaryData.thumbnail?.source || undefined,
    };
  } catch (error) {
    console.warn('Wikipedia service fetch error (non-fatal):', error);
    return null;
  }
}

// ============================================================================
// 2. GOOGLE NEWS SERVICES
// ============================================================================

export interface GoogleNewsItem {
  title: string;
  source: string;
  link: string;
  pubDate: string;
}

export async function fetchGoogleNews(query: string): Promise<GoogleNewsItem[]> {
  try {
    if (!query || query.trim().length < 3) {
      return [];
    }

    const cleanTopic = query
      .replace(/[?!.,;:()'"]/g, '')
      .replace(/\b(what is|who is|explain|tell me about|how does|define|summarize|search for|about)\b/gi, '')
      .trim();

    const topic = cleanTopic || 'world news';
    if (topic.length < 3) {
      return [];
    }

    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(
      topic
    )}&hl=en-US&gl=US&ceid=US:en`;

    const res = await fetch(rssUrl, {
      signal: AbortSignal.timeout(4500),
    });

    if (!res.ok) return [];
    const text = await res.text();

    // Parse RSS items using regex
    const items: GoogleNewsItem[] = [];
    const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>[\s\S]*?(?:<source[^>]*>(.*?)<\/source>)?[\s\S]*?<\/item>/gi;

    let match;
    let count = 0;
    while ((match = itemRegex.exec(text)) !== null && count < 5) {
      const rawTitle = match[1] || '';
      const link = match[2] || '';
      const pubDate = match[3] || '';
      let source = match[4] || '';

      // Clean HTML entities
      const cleanTitle = rawTitle.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

      // Extract source if title has " - SourceName"
      let finalTitle = cleanTitle;
      if (!source && cleanTitle.includes(' - ')) {
        const parts = cleanTitle.split(' - ');
        source = parts.pop() || 'Google News';
        finalTitle = parts.join(' - ');
      }

      if (finalTitle) {
        items.push({
          title: finalTitle.trim(),
          source: source.trim() || 'Google News Wire',
          link: link.trim(),
          pubDate: pubDate.trim(),
        });
        count++;
      }
    }

    return items;
  } catch (error) {
    console.warn('Google News service fetch error (non-fatal):', error);
    return [];
  }
}

// ============================================================================
// 3. EXPLICIT USER DEADLINE PARSER (ONLY SCHEDULES WHEN USER SPECIFIED A DATE)
// ============================================================================

export function extractUserSpecifiedDeadline(
  prompt: string,
  currentPanicLevel: PanicLevel = 'medium'
): DeadlineInfo | undefined {
  if (!prompt || typeof prompt !== 'string') return undefined;

  const lower = prompt.toLowerCase();

  // Explicit scheduling keywords or date/time patterns
  const relativeDatePattern = /\b(tomorrow|tonight|next\s+(?:week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|in\s+\d+\s+(?:days|hours|weeks))\b/i;
  const dayOfWeekPattern = /\b(?:by|on|due|before|this|next)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+(?:at|by)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?)?\b/i;
  const monthDatePattern = /\b(?:by|on|due|before)?\s*(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\.?\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?(?:\s+(?:at|by)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?)?\b/i;
  const exactTimePattern = /\b(?:by|at|before)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/i;
  const explicitDeadlineWords = /\b(?:deadline\s+is|due\s+date\s+is|due\s+by|schedule\s+for|scheduled\s+for|submit\s+by|complete\s+by|finish\s+by)\s+([^.,\n]+)/i;

  let matchedText = '';

  const explicitMatch = prompt.match(explicitDeadlineWords);
  if (explicitMatch && explicitMatch[1]) {
    matchedText = explicitMatch[1].trim();
  } else {
    const dayMatch = prompt.match(dayOfWeekPattern);
    const dateMatch = prompt.match(monthDatePattern);
    const relMatch = prompt.match(relativeDatePattern);
    const timeMatch = prompt.match(exactTimePattern);

    if (dayMatch) {
      matchedText = dayMatch[0].trim();
    } else if (dateMatch) {
      matchedText = dateMatch[0].trim();
    } else if (relMatch) {
      matchedText = relMatch[0].trim();
    } else if (timeMatch) {
      matchedText = timeMatch[0].trim();
    }
  }

  // If NO explicit date/time or scheduling intent found, return undefined!
  if (!matchedText) {
    return undefined;
  }

  // Determine priority based on urgency words
  let priority: PanicLevel = currentPanicLevel;
  if (lower.includes('urgent') || lower.includes('asap') || lower.includes('critical') || lower.includes('today') || lower.includes('tonight')) {
    priority = 'high';
  } else if (lower.includes('whenever') || lower.includes('next month') || lower.includes('low priority')) {
    priority = 'low';
  }

  return {
    rawText: matchedText,
    parsedDate: formatParsedDate(matchedText),
    daysRemaining: estimateDaysRemaining(matchedText),
    priority,
    subject: `Scheduled Task: "${prompt.slice(0, 48).trim()}..."`,
  };
}

function formatParsedDate(raw: string): string {
  const clean = raw.charAt(0).toUpperCase() + raw.slice(1);
  return clean;
}

function estimateDaysRemaining(raw: string): number {
  const lower = raw.toLowerCase();
  if (lower.includes('today') || lower.includes('tonight') || lower.includes('in 1 hour') || lower.includes('in 2 hours')) return 0;
  if (lower.includes('tomorrow') || lower.includes('in 24 hours') || lower.includes('1 day')) return 1;
  if (lower.includes('in 2 days') || lower.includes('in 48 hours')) return 2;
  if (lower.includes('in 3 days')) return 3;
  if (lower.includes('next week')) return 7;
  return 2;
}

