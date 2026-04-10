import os
import re

css_path = 's:/zzz/style.css'
html_path = 's:/zzz/index.html'

with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Replace light blue with Ocean Wave colors
css = css.replace('--primary-brand: #8CB9FA;', '--primary-brand: #0077b6;') # Ocean Blue
css = css.replace('--secondary-brand: #A8C8F9;', '--secondary-brand: #00b4d8;') # Cyan Blue
css = css.replace('--accent-brand: #EBF1FF;', '--accent-brand: #caf0f8;') # Very light cyan
css = css.replace('--dark-brand: #4C72B0;', '--dark-brand: #03045e;') # Deep Navy

# Replace Neon backups just in case
css = css.replace('--primary-brand: #00f3ff;', '--primary-brand: #0077b6;')
css = css.replace('--secondary-brand: #bc13fe;', '--secondary-brand: #00b4d8;')

# Refresh gradients for ocean wave vibe
css = css.replace('rgba(168, 200, 249, 0.2)', 'rgba(0, 180, 216, 0.15)')
css = css.replace('rgba(140, 185, 250, 0.2)', 'rgba(0, 119, 182, 0.15)')
css = css.replace('rgba(140, 185, 250, 0.4)', 'rgba(0, 119, 182, 0.4)')
css = css.replace('rgba(0, 243, 255, 0.8)', 'rgba(0, 180, 216, 0.8)')
css = css.replace('rgba(0, 243, 255, 0.5)', 'rgba(0, 180, 216, 0.5)')

# Ensure overall app background is a soft water tint
css = css.replace('--bg-color: #f4f8fd;', '--bg-color: #f0f8ff;')
css = css.replace('--bg-color: #ffffff;', '--bg-color: #f0f8ff;')

# Ensure text color is deeply readable navy
if '--text-color: #ffffff;' in css:
    css = css.replace('--text-color: #ffffff;', '--text-color: #03045e;')
if '--text-color: #2c3e50;' in css:
    css = css.replace('--text-color: #2c3e50;', '--text-color: #03045e;')

# Make inputs globally readable just in case
css += "\n\n/* Ensure inputs are always readable */\ninput.form-control, textarea.form-control { background-color: #ffffff !important; color: #03045e !important; }\n"

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Fix the specific input field visibility for AI Chat
html = re.sub(
    r'<input type="text" id="aiChatMessageInput"[^>]*>',
    '<input type="text" id="aiChatMessageInput" class="form-control form-control-lg shadow-sm" placeholder="Type your question or query here..." style="background: #ffffff !important; color: #03045e !important; border: 2px solid var(--secondary-brand) !important; border-radius: 10px;">',
    html,
    flags=re.DOTALL
)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
