/* AI & API Logic */

// AI Chatbot Initialization
function initAIChatbot() {
    const aiChatToggle = document.getElementById('aiChatToggle');
    const aiChatBackBtn = document.getElementById('aiChatBackBtn');
    const aiChatForm = document.getElementById('aiChatForm');
    const aiNoteUpload = document.getElementById('aiNoteUpload');
    const aiActionBtns = document.querySelectorAll('.ai-action-btn');
    const clearChatBtn = document.getElementById('clearChatBtn');

    if (aiChatToggle) {
        aiChatToggle.addEventListener('click', () => {
            navigateToPage('ai-chatbot');
        });
    }

    if (aiChatBackBtn) {
        aiChatBackBtn.addEventListener('click', () => {
            navigateToPage('home');
        });
    }

    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', () => {
            const chatBox = document.getElementById('aiChatMessages');
            chatBox.innerHTML = `
                <div class="message-ai mb-4">
                    <div class="message-content p-3" style="background: rgba(0, 119, 182, 0.05); border-radius: 0 15px 15px 15px; border: 1px solid rgba(0, 119, 182, 0.1);">
                        Chat cleared. How can I help you study today?
                    </div>
                </div>
            `;
            state.chatHistory = [];
        });
    }

    if (aiChatForm) {
        aiChatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('aiChatMessageInput');
            const message = input.value.trim();
            if (!message) return;

            addChatMessage(message, 'user');
            input.value = '';

            // Call AI
            await handleAIResponse(message);
        });
    }

    if (aiNoteUpload) {
        aiNoteUpload.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    state.currentNoteContent = event.target.result;
                    document.getElementById('uploadStatus').style.display = 'block';
                    addChatMessage(`I've uploaded your notes: **${file.name}**. I am processing the content now. What should I do with it?`, 'ai');
                };
                reader.readAsText(file);
            }
        });
    }

    aiActionBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const action = btn.getAttribute('data-action');
            if (!state.currentNoteContent && action !== 'notes') {
                addChatMessage("Please upload some notes first so I can analyze them!", 'ai');
                return;
            }

            let prompt = "";
            switch (action) {
                case 'summary': prompt = "Please provide a professional, concise summary of these notes."; break;
                case 'key-points': prompt = "What are the most critical takeaways from these notes?"; break;
                case 'flashcards': prompt = "Generate 5 high-quality flashcards (Question/Answer) based on these notes."; break;
                case 'quiz': prompt = "Create a 5-question multiple choice assessment based on these notes."; break;
                case 'notes': prompt = "Generate a structured, professional outline/study guide for my session."; break;
            }

            addChatMessage(`AI, ${action.replace('-', ' ')} request: ${prompt}`, 'user');
            await handleAIResponse(prompt, true);
        });
    });
}

function addChatMessage(message, sender) {
    const chatBox = document.getElementById('aiChatMessages');
    const div = document.createElement('div');
    div.className = sender === 'ai' ? 'message-ai mb-4' : 'message-user mb-4';

    let content = message;
    content = content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    const lines = content.split('\n');
    let inList = false;
    let newContent = '';

    lines.forEach(line => {
        if (line.trim().startsWith('- ')) {
            if (!inList) {
                newContent += '<ul>';
                inList = true;
            }
            newContent += `<li>${line.trim().substring(2)}</li>`;
        } else {
            if (inList) {
                newContent += '</ul>';
                inList = false;
            }
            newContent += line + '<br>';
        }
    });
    if (inList) newContent += '</ul>';

    div.innerHTML = `
        <div class="message-content p-3 shadow-sm" style="border-radius: ${sender === 'ai' ? '0 15px 15px 15px' : '15px 15px 0 15px'}; color: ${sender === 'ai' ? 'var(--text-color)' : '#ffffff'}; background: ${sender === 'ai' ? 'rgba(0, 180, 216, 0.1)' : 'var(--primary-brand)'};">
            ${newContent}
        </div>
    `;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function handleAIResponse(userMessage, isAction = false) {
    const chatBox = document.getElementById('aiChatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message-ai mb-4 typing-indicator';
    typingDiv.innerHTML = '<div class="message-content p-3 opacity-50"><i class="fas fa-spinner fa-spin me-2"></i>StudySmart AI is processing...</div>';
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const aiResponse = await callGeminiAPI(userMessage);
        
        if (chatBox.contains(typingDiv)) chatBox.removeChild(typingDiv);
        addChatMessage(aiResponse, 'ai');
    } catch (error) {
        console.error("AI Error Details:", error);
        if (chatBox.contains(typingDiv)) chatBox.removeChild(typingDiv);
        addChatMessage(`**AI Core Connection Error:** ${error.message}`, 'ai');
    }
}
// ===============================
// GEMINI AI CORE (100% WORKING)
// ===============================
async function callGeminiAPI(prompt, isJson = false) {

    // 🔑 PASTE YOUR API KEY HERE
   const API_KEY = "AIzaSyCorHyDUa77_fy3TBVABZ80Y9iKrzNL3ek"; // cspell:disable-line

    const context = (!isJson && state.currentNoteContent)
        ? `Use the following study notes as context:\n${state.currentNoteContent}\n\n`
        : "";

    const finalPrompt = isJson
        ? prompt
        : `${context}User Request: ${prompt}`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                { text: finalPrompt }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.4,
                        topK: 32,
                        topP: 1,
                        maxOutputTokens: 2048
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("API ERROR:", data);
            throw new Error(data.error?.message || "Gemini API failed");
        }

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error("No AI response received");
        }

        const text = data.candidates[0].content.parts[0].text;

        return text;

    } catch (error) {
        console.error("Gemini Error:", error);
        throw new Error("AI connection failed. Check API key.");
    }
}
// Assessment System Initialization
function initAssessmentSystem() {
    const generateBtn = document.getElementById('generateAssessmentBtn');
    const uploadInput = document.getElementById('assessmentUpload');
    const rangeInput = document.getElementById('assessmentCount');
    const rangeValue = document.getElementById('rangeValue');
    const submitQuizBtn = document.getElementById('submitQuizBtn');

    if (rangeInput && rangeValue) {
        rangeInput.addEventListener('input', () => {
            rangeValue.textContent = `${rangeInput.value} Questions`;
        });
    }

    if (uploadInput) {
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    currentAssessmentNotes = event.target.result;
                    document.getElementById('assessmentFileStatus').style.display = 'block';
                    showNotification("Notes uploaded successfully!", "success");
                };
                reader.readAsText(file);
            }
        });
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            if (!currentAssessmentNotes) {
                showNotification("Please upload notes first!", "warning");
                return;
            }

            const subject = document.getElementById('assessmentSubject').value;
            const count = document.getElementById('assessmentCount').value;

            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>ANALYZING...';

            try {
                const prompt = `Act as an expert examiner. Generate exactly ${count} MCQs for ${subject}. JSON array: [{id, question, options:[], answer: index}]. ONLY JSON. Notes: ${currentAssessmentNotes}`;
                let responseText = await callGeminiAPI(prompt, true);
                const cleanJson = responseText.replace(/```json|```/g, '').trim();
                currentQuizData = JSON.parse(cleanJson);
                renderAssessmentQuiz(currentQuizData, subject);
            } catch (error) {
                console.error("Assessment Gen Error:", error);
                showNotification("Failed to generate assessment.", "danger");
            } finally {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles me-2"></i> GENERATE ASSESSMENT';
            }
        });
    }

    if (submitQuizBtn) {
        submitQuizBtn.addEventListener('click', () => {
            const userAnswers = [];
            currentQuizData.forEach((_, idx) => {
                const selected = document.querySelector(`input[name="q${idx}"]:checked`);
                userAnswers.push(selected ? parseInt(selected.value) : -1);
            });
            processAssessmentResult(userAnswers);
        });
    }
}

function renderAssessmentQuiz(questions, subject) {
    const container = document.getElementById('quizContainer');
    const section = document.getElementById('quizSection');
    container.innerHTML = questions.map((q, idx) => `
        <div class="quiz-question-item mb-4 p-3 border rounded shadow-sm">
            <h6 class="mb-3">${idx + 1}. ${q.question}</h6>
            <div class="options-grid">
                ${q.options.map((opt, oIdx) => `
                    <div class="form-check custom-option mb-2">
                        <input class="form-check-input" type="radio" name="q${idx}" id="q${idx}o${oIdx}" value="${oIdx}">
                        <label class="form-check-label" for="q${idx}o${oIdx}">${opt}</label>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    section.style.display = 'block';
}

function processAssessmentResult(userAnswers) {
    let correct = 0;
    currentQuizData.forEach((q, idx) => {
        if (userAnswers[idx] === q.answer) correct++;
    });
    const score = Math.round((correct / currentQuizData.length) * 100);
    state.quizHistory.push({ date: new Date().toLocaleDateString(), subject: document.getElementById('assessmentSubject').value, score });
    localStorage.setItem('study_assessment_history', JSON.stringify(state.quizHistory));
    showNotification(`Score: ${score}%`, "success");
    updateAssessmentUI();
}

function updateAssessmentUI() {
    const historyBody = document.getElementById('assessmentHistoryBody');
    if (!historyBody) return;
    historyBody.innerHTML = state.quizHistory.slice().reverse().map(item => `
        <tr>
            <td>${item.date}</td>
            <td class="text-primary fw-bold">${item.subject}</td>
            <td>${item.score}%</td>
            <td><span class="badge ${item.score >= 50 ? 'bg-success' : 'bg-warning'}">${item.score >= 50 ? 'PASS' : 'REVIEW'}</span></td>
        </tr>
    `).join('');
}
