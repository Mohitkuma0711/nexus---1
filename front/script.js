// Data for the 11 modes
const modes = [
    {
        id: 'coding',
        name: 'Code Master',
        icon: 'fa-code',
        color: '#ea580c', // orange
        desc: 'Expert programmer to write, debug, and optimize code in any language.',
        persona: 'I am a highly skilled senior engineering AI. I write clean, optimized, and maintainable code.',
        prompts: ['Write a React hook for debouncing', 'Find the bug in this Python script', 'Explain SOLID principles']
    },
    {
        id: 'brainstorm',
        name: 'Idea Generator',
        icon: 'fa-lightbulb',
        color: '#f59e0b', // amber
        desc: 'Creative partner for brainstorming concepts, product ideas, and marketing angles.',
        persona: 'I am an imaginative divergent thinker. Let\'s generate creative, out-of-the-box ideas.',
        prompts: ['Name ideas for a coffee shop', '10 viral TikTok hooks', 'Marketing strategy for SaaS']
    },
    {
        id: 'resume',
        name: 'Career Coach',
        icon: 'fa-file-lines',
        color: '#10b981', // emerald
        desc: 'Review and improve your resume, cover letter, and LinkedIn profile.',
        persona: 'I am an expert recruiter and career advisor. Let\'s optimize your professional brand.',
        prompts: ['Review my bullet points', 'Write a cover letter for PM', 'Identify missing keywords']
    },
    {
        id: 'analyst',
        name: 'Data Analyst',
        icon: 'fa-chart-pie',
        color: '#8b5cf6', // violet
        desc: 'Analyze datasets, write SQL queries, and extract meaningful business insights.',
        persona: 'I am a rigorous data scientist. I help interpret data and find actionable insights.',
        prompts: ['SQL query for cohort retention', 'Explain p-value simply', 'How to visualize this text data']
    },
    {
        id: 'writer',
        name: 'Copywriter',
        icon: 'fa-pen-nib',
        color: '#ec4899', // pink
        desc: 'Craft engaging copy for blogs, newsletters, ads, and social media.',
        persona: 'I am a persuasive wordsmith. I craft compelling copy that converts and engages.',
        prompts: ['Write an email newsletter', 'Catchy subject lines', 'Draft a high-converting landing page text']
    },
    {
        id: 'tutor',
        name: 'Subject Tutor',
        icon: 'fa-graduation-cap',
        color: '#06b6d4', // cyan
        desc: 'Patient teacher to explain complex concepts in simple terms.',
        persona: 'I am a patient and encouraging teacher. I adapt to your learning style.',
        prompts: ['Explain quantum mechanics to a 5yo', 'Help me solve this calculus problem', 'How does photosynthesis work?']
    },
    {
        id: 'therapist',
        name: 'Active Listener',
        icon: 'fa-heart',
        color: '#f43f5e', // rose
        desc: 'Empathetic sounding board for venting, reflection, and managing stress.',
        persona: 'I am here to listen with empathy. This is a safe space for your thoughts.',
        prompts: ['I feel overwhelmed today', 'How can I stop procrastinating?', 'Help me process this interaction']
    },
    {
        id: 'translator',
        name: 'Global Polyglot',
        icon: 'fa-language',
        color: '#14b8a6', // teal
        desc: 'Accurate translation, language learning practice, and cultural context.',
        persona: 'I am fluent in every language and cultural nuance. How can we bridge the gap?',
        prompts: ['Translate to polite Japanese', 'Explain this Spanish idiom', 'Practice French conversation with me']
    },
    {
        id: 'fitness',
        name: 'Fitness Coach',
        icon: 'fa-dumbbell',
        color: '#f97316', // orange
        desc: 'Workout plans, nutritional advice, and exercise routines tailored to your goals.',
        persona: 'I am your personal trainer and nutritionist. Let\'s crush your fitness goals!',
        prompts: ['3-day full body split', 'High protein vegetarian meals', 'How to fix my deadlift form?']
    },
    {
        id: 'finance',
        name: 'Financial Advisor',
        icon: 'fa-chart-line',
        color: '#84cc16', // lime
        desc: 'Budgeting tips, investment basics, and personal finance strategies.',
        persona: 'I provide objective financial intelligence and educational wealth-building strategies.',
        prompts: ['How to start an emergency fund', 'Should I pay debt or invest?', 'Explain ETFs vs Mutual Funds']
    },
    {
        id: 'game',
        name: 'Game Master',
        icon: 'fa-dice-d20',
        color: '#d946ef', // fuchsia
        desc: 'Interactive text adventures, RPG campaigns, and storytelling.',
        persona: 'The tavern door creaks open... I am your Game Master. Where will your adventure begin?',
        prompts: ['Start a sci-fi text adventure', 'Create a D&D villain', 'Generate a fantasy town']
    },
    {
        id: 'girlfriend',
        name: 'Virtual Girlfriend',
        icon: 'fa-face-grin-hearts',
        color: '#ff2d55', // pink-red
        desc: 'A caring and affectionate virtual companion.',
        persona: 'I am your friendly and supportive virtual girlfriend.',
        prompts: ['How was your day?', 'Do you have any hobbies?', 'Tell me a cute story']
    }
];

// ── Debounce Utility ───────────────────────────────────────────────
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// DOM Elements
const chatView = document.getElementById('chat-view');
const modeSidebarList = document.getElementById('mode-sidebar-list');
const chatTitle = document.getElementById('chat-title');
const chatSubtitle = document.getElementById('chat-subtitle');
const chatIcon = document.getElementById('chat-icon');
const welcomeMessageContainer = document.getElementById('welcome-message-container');
const currentModeNameDisplay = document.getElementById('current-mode-name');
const suggestionGrid = document.getElementById('suggestion-grid');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const rootConfig = document.documentElement;

// User Profile Elements
const nameModal = document.getElementById('name-modal');
const nameInput = document.getElementById('name-input');
const saveNameBtn = document.getElementById('save-name-btn');
const sidebarAvatar = document.getElementById('sidebar-avatar');
const sidebarUsername = document.getElementById('sidebar-username');
const mainGreeting = document.getElementById('main-greeting');

// Cinema Elements
const cinemaModal = document.getElementById('cinema-modal');
const cinemaPlayerContainer = document.getElementById('cinema-player-container');
const cinemaVideoTitle = document.getElementById('cinema-video-title');
const closeCinemaBtn = document.getElementById('close-cinema-btn');

// Current state
let currentMode = null;
let isTyping = false;
let chatHistory = [];
let readAloudEnabled = false;
let sentViaVoice = false;

// Initialization
function init() {
    setupUserProfile();
    renderSidebarModes();
    setupEventListeners();
    // Default to first mode
    if (modes.length > 0) {
        openMode(modes[0].id);
    }
}

function setupUserProfile() {
    let savedName = localStorage.getItem('nexus-username');
    
    if (!savedName) {
        // Show modal if no name
        nameModal.style.display = 'flex';
        
        saveNameBtn.addEventListener('click', () => {
            const enteredName = nameInput.value.trim();
            if (enteredName) {
                localStorage.setItem('nexus-username', enteredName);
                nameModal.style.display = 'none';
                updateUserUI(enteredName);
            }
        });
        
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveNameBtn.click();
        });
    } else {
        updateUserUI(savedName);
    }
}

function updateUserUI(name) {
    sidebarUsername.textContent = name;
    sidebarAvatar.textContent = name.charAt(0).toUpperCase();
    if (mainGreeting) {
        mainGreeting.textContent = `How can I help, ${name}?`;
    }
}

// Build the sidebar mode list
function renderSidebarModes() {
    modeSidebarList.innerHTML = '';
    modes.forEach(mode => {
        const item = document.createElement('div');
        item.className = 'mode-sidebar-item';
        item.dataset.id = mode.id;
        item.innerHTML = `
            <i class="fa-solid ${mode.icon}"></i>
            <span>${mode.name}</span>
        `;
        item.addEventListener('click', () => openMode(mode.id));
        modeSidebarList.appendChild(item);
    });
    
    // Update insights (mocking Graphify output based on current state)
    const insightsPanel = document.getElementById('graph-insights');
    if (insightsPanel) {
        insightsPanel.innerHTML = `
            <div class="insight-item">
                <span class="insight-icon"><i class="fa-solid fa-microchip"></i></span>
                <span class="insight-label">God Nodes</span>
                <span class="insight-value">server.js, config.js</span>
            </div>
            <div class="insight-item">
                <span class="insight-icon"><i class="fa-solid fa-code-branch"></i></span>
                <span class="insight-label">Module Depth</span>
                <span class="insight-value">3 Levels</span>
            </div>
        `;
    }
}

// Open chat mode
function openMode(modeId) {
    if (currentMode && currentMode.id === modeId) return;
    
    currentMode = modes.find(m => m.id === modeId);
    if (!currentMode) return;

    if (modeId === 'girlfriend') {
        alert("Disclaimer: This is an AI virtual assistant program meant for entertainment, not a real person.");
    }

    // Update active state in sidebar
    document.querySelectorAll('.mode-sidebar-item').forEach(el => {
        el.classList.toggle('active', el.dataset.id === modeId);
    });

    // Update UI
    chatTitle.textContent = currentMode.name;
    chatSubtitle.textContent = currentMode.desc;
    chatIcon.className = `fa-solid ${currentMode.icon}`;
    
    // Set theme color variables
    rootConfig.style.setProperty('--primary', currentMode.color);
    
    // Update welcome display
    if (currentModeNameDisplay) {
        currentModeNameDisplay.textContent = currentMode.name;
    }

    // Render suggestion blocks
    if (suggestionGrid) {
        suggestionGrid.innerHTML = currentMode.prompts.map(prompt => `
            <div class="suggestion-card" onclick="handleSuggestionClick('${prompt}')">
                <i class="fa-solid fa-bolt"></i>
                <span>${prompt}</span>
            </div>
        `).join('');
    }

    // Reset Chat if mode changed
    chatHistory = [];
    
    // Clear previous messages except welcome
    Array.from(chatMessages.children).forEach(child => {
        if (child.id !== 'welcome-message-container') {
            child.remove();
        } else {
            child.style.display = 'block';
        }
    });

    // Focus input
    setTimeout(() => {
        messageInput.focus();
    }, 100);
}



// Handle suggestion click
window.handleSuggestionClick = function(text) {
    messageInput.value = text;
    messageInput.focus();
    sendMessage();
}

// Send message logic
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || isTyping) return;

    // Hide welcome screen if present
    if (welcomeMessageContainer.style.display !== 'none') {
        welcomeMessageContainer.style.display = 'none';
    }

    // Add user message
    addMessageBubble(text, 'user');
    
    // Track in history
    chatHistory.push({ role: 'user', content: text });
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Show typing indicator
    isTyping = true;
    const typingIndicator = showTypingIndicator();
    scrollToBottom();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                modeId: currentMode.id,
                message: text,
                history: chatHistory.slice(0, -1) // send history without the current message
            })
        });

        typingIndicator.remove();
        isTyping = false;

        if (!response.ok) {
            const data = await response.json().catch(() => null);
            const errMessage = data?.detail || data?.error || 'Request failed.';
            throw new Error(errMessage);
        }

        const data = await response.json();
        const aiReply = data.reply || 'No response received.';
        
        // Track assistant reply in history
        chatHistory.push({ role: 'assistant', content: aiReply });
        
        addMessageBubble(markedParse(aiReply), 'ai', aiReply);
        
        // Read aloud if toggle is on OR if the message was sent via voice
        if ((readAloudEnabled || sentViaVoice) && typeof speakText === 'function') {
            speakText(aiReply);
        }
        sentViaVoice = false; // Reset after each response

    } catch (err) {
        typingIndicator.remove();
        isTyping = false;
        addMessageBubble(
            `<span style="color:#f87171">⚠ Error: ${err.message}</span><br><small style="color:var(--text-secondary)">Check that the server is running and API keys are set.</small>`,
            'ai'
        );
    }
}

// Very simple markdown parser for bold, italic, code
function markedParse(text) {
    let html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    return html;
}

// Create message UI element
function addMessageBubble(content, sender, rawText = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    let displayContent = content;
    let youtubeQuery = null;

    if (sender === 'ai') {
        const youtubeRegex = /\[YOUTUBE:\s*(.*?)\]/i;
        const match = content.match(youtubeRegex);
        if (match) {
            youtubeQuery = match[1].trim();
            displayContent = content.replace(youtubeRegex, '').trim();
        }
    }

    bubble.innerHTML = displayContent;
    msgDiv.appendChild(bubble);

    if (youtubeQuery) {
        msgDiv.appendChild(createVideoCard(youtubeQuery));
    }

    if (sender === 'ai') {
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
        copyBtn.onclick = () => {
            const textToCopy = rawText || bubble.innerText;
            navigator.clipboard.writeText(textToCopy);
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
            }, 2000);
        };
        
        const readBtn = document.createElement('button');
        readBtn.className = 'copy-btn'; // Reusing this class for styling
        readBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i> Read';
        readBtn.onclick = () => {
             const textToRead = rawText || bubble.innerText;
             if (typeof window.speakText === 'function') {
                 window.speakText(textToRead);
             }
        };
        
        actionsDiv.appendChild(copyBtn);
        actionsDiv.appendChild(readBtn);
        msgDiv.appendChild(actionsDiv);
    }
    
    chatMessages.appendChild(msgDiv);
    
    scrollToBottom();
}

// Show typing dots
function showTypingIndicator() {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ai typing-message';
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble typing-indicator';
    bubble.innerHTML = `<div class="dot"></div><div class="dot"></div><div class="dot"></div>`;
    
    msgDiv.appendChild(bubble);
    chatMessages.appendChild(msgDiv);
    
    return msgDiv;
}

// Scroller helper
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createVideoCard(query) {
    const card = document.createElement('div');
    card.className = 'video-recommendation-card';
    
    card.innerHTML = `
        <div class="video-card-header">
            <div class="yt-brand">
                <i class="fa-brands fa-youtube" style="color: #ff0000; font-size: 1.2rem;"></i>
                <span>YouTube Recommendation</span>
            </div>
            <div class="yt-badge">Smart Search</div>
        </div>
        <div class="video-card-body">
            <h3>"${query}"</h3>
            <p>Access the best educational tutorials and visual guides on this topic.</p>
            <button class="watch-yt-btn" id="play-in-cinema-btn">
                <i class="fa-solid fa-play"></i>
                Play in Nexus Cinema
            </button>
        </div>
    `;

    // Add event listener to the button
    const playBtn = card.querySelector('#play-in-cinema-btn');
    playBtn.onclick = (e) => {
        e.preventDefault();
        openCinema(query);
    };

    return card;
}

// ── Cinema Logic ──────────────────────────────────────────────────
async function openCinema(query) {
    cinemaModal.style.display = 'flex';
    cinemaVideoTitle.innerText = `Searching for: ${query}...`;
    cinemaPlayerContainer.innerHTML = '<div class="typing-indicator" style="margin: 2rem auto;"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';

    try {
        const response = await fetch(`/api/video-search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.videoId) {
            cinemaVideoTitle.innerText = query;
            cinemaPlayerContainer.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${data.videoId}?autoplay=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
        } else {
            cinemaVideoTitle.innerText = "Video Not Found";
            cinemaPlayerContainer.innerHTML = `<div style="padding: 2rem; color: #ef4444; text-align: center;">Sorry, we couldn't find a video for this topic. Try a different query!</div>`;
        }
    } catch (err) {
        console.error('Cinema Error:', err);
        cinemaVideoTitle.innerText = "Error Loading Cinema";
        cinemaPlayerContainer.innerHTML = `<div style="padding: 2rem; color: #ef4444; text-align: center;">Failed to connect to Nexus Cinema. Please check your connection.</div>`;
    }
}

function closeCinema() {
    cinemaModal.style.display = 'none';
    cinemaPlayerContainer.innerHTML = ''; // Stops the video
}

// Auto-expand textarea (debounced to prevent layout thrashing)
const resizeTextarea = debounce(function() {
    messageInput.style.height = 'auto';
    messageInput.style.height = (messageInput.scrollHeight) + 'px';
    if (messageInput.value.trim() === '') {
        messageInput.style.height = 'auto';
    }
}, 50);

messageInput.addEventListener('input', resizeTextarea);

// Event Listeners
const debouncedSend = debounce(sendMessage, 300);

function setupEventListeners() {
    sendBtn.addEventListener('click', debouncedSend);
    
    // Enter to send (Shift+Enter for newline)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            debouncedSend();
        }
    });

    // Read Aloud toggle
    const readAloudBtn = document.getElementById('read-aloud-btn');
    if (readAloudBtn) {
        readAloudBtn.addEventListener('click', () => {
            readAloudEnabled = !readAloudEnabled;
            readAloudBtn.classList.toggle('active', readAloudEnabled);
            readAloudBtn.innerHTML = readAloudEnabled
                ? '<i class="fa-solid fa-volume-high"></i>'
                : '<i class="fa-solid fa-volume-xmark"></i>';
            readAloudBtn.title = readAloudEnabled ? 'Read aloud: ON' : 'Read aloud: OFF';

            // Stop any current speech when turning off
            if (!readAloudEnabled && 'speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
        });
    }

    // Stop speaking button
    const stopAudioBtn = document.getElementById('stop-audio-btn');
    if (stopAudioBtn) {
        stopAudioBtn.addEventListener('click', () => {
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
            stopAudioBtn.style.display = 'none';
        });
    }

    // Microphone / Speech Recognition
    setupSpeechRecognition();

    // Cinema listeners
    if (closeCinemaBtn) {
        closeCinemaBtn.addEventListener('click', closeCinema);
    }
    if (cinemaModal) {
        cinemaModal.addEventListener('click', (e) => {
            if (e.target === cinemaModal) closeCinema();
        });
    }
}

// ── Voice Conversation Mode ────────────────────────────────────────
function setupSpeechRecognition() {
    const micBtn = document.getElementById('mic-btn');
    if (!micBtn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        micBtn.title = 'Speech recognition not supported in this browser';
        micBtn.style.opacity = '0.3';
        micBtn.style.cursor = 'not-allowed';
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;     // One utterance at a time
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let isListening = false;
    let finalTranscript = '';
    let silenceTimer = null;

    // Click mic → start/stop listening
    micBtn.addEventListener('click', () => {
        if (isListening) {
            stopListening();
            recognition.stop();
        } else {
            startListening();
        }
    });

    function startListening() {
        finalTranscript = '';
        messageInput.value = '';
        isListening = true;
        micBtn.classList.add('listening');
        micBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
        messageInput.placeholder = 'Listening... speak now';
        try {
            recognition.start();
        } catch (e) {
            // Already running
        }
    }

    function stopListening() {
        isListening = false;
        clearTimeout(silenceTimer);
        micBtn.classList.remove('listening');
        micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        messageInput.placeholder = 'Ask anything';
    }

    recognition.onresult = (event) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        // Show live preview
        messageInput.value = finalTranscript + interimTranscript;
        messageInput.style.height = 'auto';
        messageInput.style.height = messageInput.scrollHeight + 'px';

        // Reset silence timer — auto-send after 2s of no new words
        clearTimeout(silenceTimer);
        if (finalTranscript.trim()) {
            silenceTimer = setTimeout(() => {
                if (isListening && finalTranscript.trim()) {
                    recognition.stop();
                    stopListening();
                    // Auto-send the spoken text — flag so AI reads response aloud
                    sentViaVoice = true;
                    sendMessage();
                }
            }, 2000);
        }
    };

    recognition.onend = () => {
        // If still in listening mode and no final text yet, restart to keep waiting
        if (isListening && !finalTranscript.trim()) {
            try {
                recognition.start();
            } catch (e) {
                stopListening();
            }
        }
    };

    recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'audio-capture') {
            stopListening();
            messageInput.placeholder = 'Microphone access denied';
            setTimeout(() => {
                messageInput.placeholder = 'Ask anything';
            }, 3000);
        } else if (event.error === 'no-speech') {
            // No speech detected — restart if still listening
            if (isListening) {
                try { recognition.start(); } catch (e) { stopListening(); }
            }
        }
    };

    // ── Voice Selector + Text-to-Speech ──────────────────────────────
    const voiceSelect = document.getElementById('voice-select');
    let selectedVoice = null;

    function populateVoices() {
        const voices = speechSynthesis.getVoices();
        if (!voices.length) return;

        voiceSelect.innerHTML = '';

        // Group by language
        const english = voices.filter(v => v.lang.startsWith('en'));
        const hindi = voices.filter(v => v.lang.startsWith('hi'));
        const others = voices.filter(v => !v.lang.startsWith('en') && !v.lang.startsWith('hi'));

        function addGroup(label, voiceList) {
            if (!voiceList.length) return;
            const group = document.createElement('optgroup');
            group.label = label;
            voiceList.forEach((v, i) => {
                const opt = document.createElement('option');
                opt.value = v.name;
                opt.textContent = `${v.name} (${v.lang})`;
                group.appendChild(opt);
            });
            voiceSelect.appendChild(group);
        }

        addGroup('🇬🇧 English', english);
        addGroup('🇮🇳 Hindi', hindi);
        addGroup('🌍 Other', others);

        // Restore saved preference
        const saved = localStorage.getItem('nexus-voice');
        if (saved && voices.find(v => v.name === saved)) {
            voiceSelect.value = saved;
            selectedVoice = voices.find(v => v.name === saved);
        } else {
            // Prioritize Indian English / Hinglish female voices
            const indianVoices = voices.filter(v => 
                v.lang === 'en-IN' || 
                v.lang === 'hi-IN' || 
                v.name.includes('Veena') ||
                v.name.includes('Lekha') ||
                v.name.includes('Aditi') ||
                v.name.includes('Raveena') ||
                v.name.includes('Google हिन्दी')
            );
            
            if (indianVoices.length) {
                // Try to find a Google-specific one first for better quality, or pick the first available
                selectedVoice = indianVoices.find(v => v.name.includes('Google')) || indianVoices[0];
                voiceSelect.value = selectedVoice.name;
            } else if (english.length) {
                // Fallback to standard Google English
                const google = english.find(v => v.name.includes('Google'));
                selectedVoice = google || english[0];
                voiceSelect.value = selectedVoice.name;
            }
        }
    }

    // Voices load asynchronously in Chrome
    speechSynthesis.onvoiceschanged = populateVoices;
    populateVoices();

    voiceSelect.addEventListener('change', () => {
        const voices = speechSynthesis.getVoices();
        selectedVoice = voices.find(v => v.name === voiceSelect.value) || null;
        localStorage.setItem('nexus-voice', voiceSelect.value);

        // Preview the selected voice
        speechSynthesis.cancel();
        const preview = new SpeechSynthesisUtterance('Hello, I am your NexusAI assistant.');
        if (selectedVoice) preview.voice = selectedVoice;
        preview.rate = 1;
        speechSynthesis.speak(preview);
    });

    // Speak function used by the app
    window.speakText = function(text) {
        if (!('speechSynthesis' in window)) return;

        // Strip markdown/HTML for cleaner speech
        const clean = text
            .replace(/<[^>]*>/g, '')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/#{1,6}\s/g, '')
            .replace(/\n/g, '. ');

        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        const stopAudioBtn = document.getElementById('stop-audio-btn');
        utterance.onstart = () => {
            if (stopAudioBtn) stopAudioBtn.style.display = 'inline-flex';
        };
        utterance.onend = () => {
            if (stopAudioBtn) stopAudioBtn.style.display = 'none';
        };
        utterance.onerror = () => {
            if (stopAudioBtn) stopAudioBtn.style.display = 'none';
        };

        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    };
}

// Run
init();
