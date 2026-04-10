import os
import re

# 1. Update style.css for soft light blue theme
css_path = 's:/zzz/style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Replace neon colors with soft blue
css = css.replace('--primary-brand: #00f3ff;', '--primary-brand: #8CB9FA;')
css = css.replace('--secondary-brand: #bc13fe;', '--secondary-brand: #A8C8F9;')
css = css.replace('--accent-brand: #1a0033;', '--accent-brand: #EBF1FF;')
css = css.replace('--dark-brand: #004d4d;', '--dark-brand: #4C72B0;')
css = css.replace('rgba(0, 243, 255,', 'rgba(140, 185, 250,')

# Soft theme backgrounds
css = css.replace('--bg-color: #050510;', '--bg-color: #f4f8fd;')
css = css.replace('--bg-color: var(--white);', '--bg-color: #ffffff;')

# Fix body gradient
css = css.replace('background-image: radial-gradient(circle at 15% 50%, rgba(188, 19, 254, 0.08), transparent 25%), radial-gradient(circle at 85% 30%, rgba(0, 243, 255, 0.08), transparent 25%);', 
                  'background-image: radial-gradient(circle at 15% 50%, rgba(168, 200, 249, 0.2), transparent 35%), radial-gradient(circle at 85% 30%, rgba(140, 185, 250, 0.2), transparent 35%);')
css = css.replace('text-shadow: 0 0 15px rgba(255, 204, 0, 0.4);', 'text-shadow: 0 0 15px rgba(140, 185, 250, 0.4);')

# Light soft blue design for cards (remove dark card settings)
css = css.replace('--card-bg: #111111;', '--card-bg: rgba(255, 255, 255, 0.9);')
css = css.replace('--text-color: #ffffff;', '--text-color: #2c3e50;')

# Re-apply glass effect for soft light theme
css = css.replace('background-color: var(--card-bg);\n    backdrop-filter: blur(10px);\n    -webkit-backdrop-filter: blur(10px);', 'background-color: var(--card-bg);\n    backdrop-filter: blur(8px);\n    -webkit-backdrop-filter: blur(8px);\n    border: 1px solid rgba(140, 185, 250, 0.2);')

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

# 2. Remove Pomodoro from index.html
html_path = 's:/zzz/index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Using regex to remove the pomodoro widget
pomodoro_pattern = re.compile(r'<!-- Floating Pomodoro Timer -->.*?</div>\n    </div>\n    </div>', re.DOTALL)
html = pomodoro_pattern.sub('', html)

# Extra fallback if regex doesn't match perfectly
if "id=\"pomodoroWidget\"" in html:
    pomodoro_pattern2 = re.compile(r'<!-- Floating Pomodoro Timer -->.*?pomodoroWidget.*?</div>.*?</div>.*?</div>', re.DOTALL)
    html = pomodoro_pattern2.sub('', html)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

# 3. Append AI Assistant functionality to script.js
ai_script = """
/* AI Assistant Logic */
document.addEventListener('DOMContentLoaded', () => {
    const aiForm = document.getElementById('aiChatForm');
    const aiInput = document.getElementById('aiChatMessageInput');
    const aiMessages = document.getElementById('aiChatMessages');
    
    // IMPORTANT: Replace this placeholder with your actual Gemini API Key
    const GEMINI_API_KEY = "YOUR_API_KEY_HERE"; 
    
    if (aiForm) {
        aiForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = aiInput.value.trim();
            if (!message) return;
            
            // Append user message
            const userHtml = `<div class="message-user mb-4 d-flex justify-content-end">
                                <div class="message-content p-3 shadow-sm" style="background: var(--primary-brand); color: white; border-radius: 15px 15px 0 15px;">
                                    ${message}
                                </div>
                              </div>`;
            aiMessages.insertAdjacentHTML('beforeend', userHtml);
            aiInput.value = '';
            aiMessages.scrollTop = aiMessages.scrollHeight;
            
            // Append loading indicator
            const loadingId = 'loading-' + Date.now();
            const loadingHtml = `<div class="message-ai mb-4 d-flex justify-content-start" id="${loadingId}">
                                    <div class="message-content p-3" style="background: rgba(140, 185, 250, 0.15); border-radius: 0 15px 15px 15px; border: 1px solid rgba(140, 185, 250, 0.3);">
                                        <i class="fas fa-circle-notch fa-spin me-2"></i> AI is thinking...
                                    </div>
                                  </div>`;
            aiMessages.insertAdjacentHTML('beforeend', loadingHtml);
            aiMessages.scrollTop = aiMessages.scrollHeight;
            
            try {
                // Determine if we should mock or make a real call
                if (GEMINI_API_KEY === "YOUR_API_KEY_HERE" || !GEMINI_API_KEY) {
                    setTimeout(() => {
                        document.getElementById(loadingId).remove();
                        const mockResponseHtml = `<div class="message-ai mb-4 d-flex justify-content-start">
                                        <div class="message-content p-3 shadow-sm" style="background: rgba(140, 185, 250, 0.15); border-radius: 0 15px 15px 15px; border: 1px solid rgba(140, 185, 250, 0.3);">
                                            <strong>Note:</strong> API Key not provided. <br>To enable real Gemini AI, please insert your GEMINI_API_KEY in script.js.<br><br>Simulated Response to: "${message}"
                                        </div>
                                      </div>`;
                        aiMessages.insertAdjacentHTML('beforeend', mockResponseHtml);
                        aiMessages.scrollTop = aiMessages.scrollHeight;
                    }, 1000);
                    return;
                }
                
                // Real Gemini API Call
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: message }] }]
                    })
                });
                
                const data = await response.json();
                
                // Safely remove loading
                const loadingEl = document.getElementById(loadingId);
                if (loadingEl) loadingEl.remove();
                
                let aiText = "Sorry, I couldn't understand that.";
                if (data && data.candidates && data.candidates.length > 0) {
                    aiText = data.candidates[0].content.parts[0].text;
                    aiText = aiText.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
                    aiText = aiText.replace(/\\n/g, '<br>');
                } else if (data.error) {
                    aiText = `API Error: ${data.error.message}`;
                }
                
                const aiHtml = `<div class="message-ai mb-4 d-flex justify-content-start">
                                    <div class="message-content p-3 shadow-sm" style="background: rgba(140, 185, 250, 0.15); border-radius: 0 15px 15px 15px; border: 1px solid rgba(140, 185, 250, 0.3);">
                                        ${aiText}
                                    </div>
                                  </div>`;
                aiMessages.insertAdjacentHTML('beforeend', aiHtml);
                aiMessages.scrollTop = aiMessages.scrollHeight;
                
            } catch (error) {
                console.error("AI API Error:", error);
                const loadingEl = document.getElementById(loadingId);
                if (loadingEl) loadingEl.remove();
                
                const errHtml = `<div class="message-ai mb-4 d-flex justify-content-start">
                                    <div class="message-content p-3 text-danger shadow-sm" style="background: rgba(255, 0, 0, 0.05); border-radius: 0 15px 15px 15px;">
                                        Error connecting to AI. Please check your network or API KEY.
                                    </div>
                                  </div>`;
                aiMessages.insertAdjacentHTML('beforeend', errHtml);
            }
        });
    }
});
"""

with open('s:/zzz/script.js', 'a', encoding='utf-8') as f:
    f.write(ai_script)
