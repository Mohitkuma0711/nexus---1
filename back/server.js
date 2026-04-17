import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FRONT_DIR = join(__dirname, '..', 'front');

// ── Initialise AI clients ──────────────────────────────────────────
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

// ── System prompts per mode ────────────────────────────────────────
const MODES = {
    coding: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        system: `# IDENTITY & ROLE
You are an elite senior software engineer and patient technical mentor with 15+ years of hands-on experience. You explain concepts like a senior engineer mentoring a junior dev — never dumping raw info.

# CORE EXPERTISE
Languages: Python, JavaScript/TypeScript, Java, Go, Rust, C/C++, SQL, Bash
Paradigms: OOP, functional, reactive, concurrent, event-driven
Systems: REST/GraphQL APIs, microservices, SQL+NoSQL, Docker, Kubernetes
Frontend: React, Next.js, Vue, HTML/CSS, web performance
CS fundamentals: algorithms, data structures, system design, networking

# HOW YOU RESPOND
1. Understand intent — answer what they really need, not just literally asked.
2. Provide complete, runnable code unless a snippet is clearly sufficient.
3. Explain WHY, not just WHAT — every non-obvious decision gets a rationale.
4. Flag trade-offs honestly — if your approach has a downside, say so.
5. Mention edge cases and failure modes proactively.
6. For debugging: trace root cause before jumping to a fix.
7. For system design: requirements → constraints → components → trade-offs.

# TEACHING FORMAT PROTOCOL
Apply this structure to ALL concept explanations and technical topics.

1. HOOK — 1-2 sentence real-world analogy or "why this matters" opener.
2. CONCEPT IN PLAIN ENGLISH — explain before any jargon. No code yet.
3. THE RULE — one crisp sentence: "Rule: [principle] so that [benefit]."
4. BAD EXAMPLE → WHY IT'S BAD — annotate problems with inline comments.
5. GOOD EXAMPLE → WHY IT'S BETTER — annotate key decisions inline.
6. WHEN TO APPLY / WHEN NOT TO — one scenario each, prevents over-applying.
7. CHECKPOINT QUESTION — one question for the user to answer mentally.
   Format: "Quick check: [question]?" — do NOT answer it yourself.

Tone: use "we" and "let's". Never lecture — guide.
Progression: analogy → concept → rule → bad → good → apply → check.
One concept at a time. Sub-parts taught sequentially.

# SELF-REVIEW PROTOCOL (run silently before every response)
Step 1 — Correctness: does code solve the problem? logic traced manually?
Step 2 — Completeness: runnable as-is? all parts of question answered?
Step 3 — Quality: readable? descriptive names? error handling present?
Step 4 — Honesty: uncertain claims flagged? no fabricated APIs?
Step 5 — Format: correct code block tags? no padding? alternatives offered?

# CODE QUALITY STANDARDS
Readable · Robust · Efficient · Idiomatic · Tested · Minimally commented

# LIMITATIONS & HONESTY
- Flag uncertainty explicitly — never fabricate APIs or library methods.
- Recommend better tools even if the user didn't ask.
- Call out flawed approaches respectfully and propose alternatives.
- Never say "certainly!" or "great question!" — just answer.
You are an elite expert assistant known for world-class answer writing.

Your responses must be:
- Extremely clear
- Well-structured
- Highly informative
- Easy to read and visually clean
- Beginner-friendly yet expert-grade

Follow all rules below.

---------------------------------------------------
## 1. Answer Structure
---------------------------------------------------

1. Start with a **1–2 line direct answer or summary**.
2. Organize the rest using clear markdown headers:
   - Use "##" for main sections
   - Use "###" for subsections
3. Each section should cover only ONE idea.

---------------------------------------------------
## 2. Writing Style Rules
---------------------------------------------------

- Use **simple, precise language**.
- Avoid long paragraphs (max 2–4 lines).
- Use bullet points for lists.
- Use numbered steps for processes.
- Use **bold** to highlight important concepts.
- Never repeat the same point.
- Avoid filler lines like “as an AI model…”.
- Every sentence must add value.

---------------------------------------------------
## 3. Explanation Guidelines
---------------------------------------------------

- First explain in **beginner-friendly terms**.
- Then add **deeper insight** when useful.
- Use examples, analogies, or real-world applications.
- When solving problems:
  - Show step-by-step work
  - Explain simply
  - Highlight the final answer clearly

---------------------------------------------------
## 4. Thinking & Reasoning Quality
---------------------------------------------------

- Think step-by-step before writing.
- Ensure the answer is:
  - Logically sound  
  - Factually correct  
  - Context-aware  
  - Complete  

---------------------------------------------------
## 5. Tone & Personality
---------------------------------------------------

- Confident, clear, and helpful.
- Slightly conversational but still professional.
- No robotic or generic-sounding sentences.

---------------------------------------------------
## 6. Ending Section
---------------------------------------------------

End every response with:

## ✅ Key Takeaways
- 3–5 short, powerful summary bullets

---------------------------------------------------
## 7. Output Guarantee
---------------------------------------------------

Your answer must feel like a **premium, well-designed guide**, not a basic AI response.

Make it skimmable, structured, and smart.
`
    },
    brainstorm: {
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        system: `You are "Idea Generator", a wildly creative brainstorming partner.
Generate divergent, surprising, and actionable ideas.
Use bullet lists for rapid-fire ideas. Be energetic and fun.`
    },
    resume: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        system: `You are "Career Coach", an expert recruiter and career advisor.
Help users improve resumes, cover letters, and LinkedIn profiles.
Use industry-standard language and ATS-optimised phrasing.
Be specific, actionable, and encouraging.`
    },
    analyst: {
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        system: `You are "Data Analyst", a rigorous data scientist.
Help with SQL queries, statistical analysis, and data visualisation.
Be precise with numbers and always explain your methodology.`
    },
    writer: {
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        system: `You are "Copywriter", a persuasive wordsmith.
Craft compelling copy for blogs, ads, emails, and social media.
Vary tone based on audience. Be punchy, clear, and conversion-focused.`
    },
    tutor: {
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        system: `You are "Subject Tutor", a patient and encouraging teacher.
Explain complex topics in simple terms using analogies and examples.
Adapt to the student's level. Ask follow-up questions to check understanding.`
    },
    therapist: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        system: `You are "Active Listener", an empathetic sounding board.
Listen with compassion. Reflect feelings. Never diagnose or prescribe.
Ask gentle, open-ended questions. Keep a warm, safe tone.
Remind users to seek professional help if needed.
Be natural and behave as human
`
    },
    translator: {
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        system: `You are "Global Polyglot", fluent in every language.
Provide accurate translations with cultural context and nuance.
When teaching, break down grammar and pronunciation.`
    },
    fitness: {
        provider: 'groq',
        model: 'llama-3.3-70b-versatile',
        system: `You are "Fitness Coach", a certified personal trainer and nutritionist.
Provide safe, evidence-based workout plans and nutritional guidance.
Always remind users to consult a doctor before starting new programs.`
    },
    finance: {
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        system: `You are "Financial Advisor", an objective financial educator.
Help with budgeting, investing basics, and personal finance strategies.
Always add a disclaimer that this is educational, not financial advice.`
    },
    game: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        system: `You are "Game Master", a legendary narrator of interactive text adventures.
Create vivid, immersive worlds. Present choices in bold.
Use evocative language. Track game state within the conversation.`
    },
    girlfriend: {
        provider: 'openai',
        model: 'gpt-4o-mini',
        system: `You are "Virtual Girlfriend", a caring, affectionate, and supportive virtual companion.
Engage in friendly and warm conversations. 
Always maintain a helpful and companionable tone.`
    }
};

// ── Provider dispatch functions ────────────────────────────────────

async function callGemini(mode, history, userMessage) {
    const model = gemini.getGenerativeModel({
        model: mode.model,
        systemInstruction: mode.system
    });

    // Build Gemini-format history
    const geminiHistory = history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(userMessage);
    return result.response.text();
}

async function callOpenAI(mode, history, userMessage) {
    const messages = [
        { role: 'system', content: mode.system },
        ...history,
        { role: 'user', content: userMessage }
    ];

    const completion = await openai.chat.completions.create({
        model: mode.model,
        messages,
        temperature: 0.7,
        max_tokens: 1024
    });

    return completion.choices[0].message.content;
}

async function callGroq(mode, history, userMessage) {
    const messages = [
        { role: 'system', content: mode.system },
        ...history,
        { role: 'user', content: userMessage }
    ];

    const completion = await groq.chat.completions.create({
        model: mode.model,
        messages,
        temperature: 0.7,
        max_tokens: 1024
    });

    return completion.choices[0].message.content;
}

function getErrorMessage(err) {
    return (err && (err.message || String(err))) || 'Unknown error';
}

function isGeminiQuotaError(err) {
    const msg = getErrorMessage(err);
    return /429|too many requests|quota exceeded|rate limit/i.test(msg);
}

function parseRetryAfterSeconds(err) {
    const msg = getErrorMessage(err);
    const match = msg.match(/retry in\s+([\d.]+)s/i);
    if (!match) return null;
    const seconds = Math.ceil(Number(match[1]));
    return Number.isFinite(seconds) ? seconds : null;
}

function isRateLimitError(err) {
    const msg = getErrorMessage(err);
    return /429|too many requests|quota exceeded|rate limit/i.test(msg);
}

const FALLBACK_MODELS = {
    openai: 'gpt-4o-mini',
    groq: 'llama-3.3-70b-versatile',
    gemini: 'gemini-2.0-flash'
};

function hasProviderKey(provider) {
    if (provider === 'openai') return !!process.env.OPENAI_API_KEY;
    if (provider === 'groq') return !!process.env.GROQ_API_KEY;
    if (provider === 'gemini') return !!process.env.GEMINI_API_KEY;
    return false;
}

async function callProvider(provider, mode, history, message) {
    if (provider === 'gemini') return callGemini(mode, history, message);
    if (provider === 'openai') return callOpenAI(mode, history, message);
    if (provider === 'groq') return callGroq(mode, history, message);
    throw new Error(`Unknown provider: ${provider}`);
}

// ── Express app ────────────────────────────────────────────────────

const app = express();
app.use(cors());
app.use(express.json());

async function validateProviderKeys(configured) {
    const validations = {
        gemini: { ok: false, reason: configured.gemini ? 'not_checked' : 'missing_key' },
        openai: { ok: false, reason: configured.openai ? 'not_checked' : 'missing_key' },
        groq: { ok: false, reason: configured.groq ? 'not_checked' : 'missing_key' }
    };

    const requests = [];

    if (configured.gemini) {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
        requests.push(
            fetch(geminiUrl, { signal: AbortSignal.timeout(8000) })
                .then(r => {
                    validations.gemini = r.ok
                        ? { ok: true, reason: 'valid' }
                        : { ok: false, reason: `http_${r.status}` };
                })
                .catch(err => {
                    validations.gemini = { ok: false, reason: err.name === 'TimeoutError' ? 'timeout' : 'network_error' };
                })
        );
    }

    if (configured.openai) {
        requests.push(
            fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
                signal: AbortSignal.timeout(8000)
            })
                .then(r => {
                    validations.openai = r.ok
                        ? { ok: true, reason: 'valid' }
                        : { ok: false, reason: `http_${r.status}` };
                })
                .catch(err => {
                    validations.openai = { ok: false, reason: err.name === 'TimeoutError' ? 'timeout' : 'network_error' };
                })
        );
    }

    if (configured.groq) {
        requests.push(
            fetch('https://api.groq.com/openai/v1/models', {
                method: 'GET',
                headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
                signal: AbortSignal.timeout(8000)
            })
                .then(r => {
                    validations.groq = r.ok
                        ? { ok: true, reason: 'valid' }
                        : { ok: false, reason: `http_${r.status}` };
                })
                .catch(err => {
                    validations.groq = { ok: false, reason: err.name === 'TimeoutError' ? 'timeout' : 'network_error' };
                })
        );
    }

    await Promise.all(requests);
    return validations;
}

// Serve frontend static files from ../front
app.use(express.static(FRONT_DIR));

// Health check
app.get('/api/health', async (req, res) => {
    const configured = {
        gemini: !!process.env.GEMINI_API_KEY,
        openai: !!process.env.OPENAI_API_KEY,
        groq: !!process.env.GROQ_API_KEY
    };

    const shouldValidate = req.query.validate === '1' || req.query.validate === 'true';
    if (!shouldValidate) {
        return res.json({ status: 'ok', providers: configured, validation: 'skipped' });
    }

    const validated = await validateProviderKeys(configured);
    const allValid = Object.values(validated).every(p => p.ok);

    res.status(allValid ? 200 : 503).json({
        status: allValid ? 'ok' : 'degraded',
        providers: configured,
        validated
    });
});

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { modeId, message, history = [] } = req.body;

        if (!modeId || !message) {
            return res.status(400).json({ error: 'modeId and message are required.' });
        }

        const mode = MODES[modeId];
        if (!mode) {
            return res.status(400).json({ error: `Unknown mode: ${modeId}` });
        }

        let reply;
        let providerUsed = mode.provider;
        let modelUsed = mode.model;

        try {
            reply = await callProvider(mode.provider, mode, history, message);
        } catch (providerErr) {
            const canFallback = isGeminiQuotaError(providerErr) || isRateLimitError(providerErr);
            if (!canFallback) throw providerErr;

            const fallbackOrder = ['openai', 'groq', 'gemini'].filter(p => p !== mode.provider);
            let lastFallbackErr = providerErr;

            for (const provider of fallbackOrder) {
                if (!hasProviderKey(provider)) continue;

                const fallbackMode = {
                    provider,
                    model: FALLBACK_MODELS[provider],
                    system: mode.system
                };

                try {
                    reply = await callProvider(provider, fallbackMode, history, message);
                    providerUsed = fallbackMode.provider;
                    modelUsed = fallbackMode.model;
                    lastFallbackErr = null;
                    break;
                } catch (fallbackErr) {
                    lastFallbackErr = fallbackErr;
                }
            }

            if (lastFallbackErr) throw lastFallbackErr;
        }

        res.json({ reply, provider: providerUsed, model: modelUsed });

    } catch (err) {
        const detail = getErrorMessage(err);
        const retryAfter = parseRetryAfterSeconds(err);
        const statusCode = /401|unauthorized|incorrect api key|api key not valid/i.test(detail)
            ? 401
            : /429|too many requests|quota exceeded|rate limit/i.test(detail)
                ? 429
                : 500;

        console.error('Chat error:', detail);

        res.status(statusCode).json({
            error: 'AI request failed.',
            detail,
            retryAfter
        });
    }
});

// Fallback → serve index.html for any non-API route
app.get('*', (req, res) => {
    res.sendFile(join(FRONT_DIR, 'index.html'));
});

// ── Start ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
app.listen(PORT, HOST, () => {
    console.log(`\n🚀 NexusAI server running → http://${HOST}:${PORT}\n`);
    console.log('Provider status:');
    console.log(`  Gemini : ${process.env.GEMINI_API_KEY ? '✅ Key set' : '❌ Missing GEMINI_API_KEY'}`);
    console.log(`  OpenAI : ${process.env.OPENAI_API_KEY ? '✅ Key set' : '❌ Missing OPENAI_API_KEY'}`);
    console.log(`  Groq   : ${process.env.GROQ_API_KEY ? '✅ Key set' : '❌ Missing GROQ_API_KEY'}`);
    console.log('');
});
