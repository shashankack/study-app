import os

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update class names / variables
    content = content.replace('--primary-yellow', '--primary-brand')
    content = content.replace('--secondary-yellow', '--secondary-brand')
    content = content.replace('--accent-yellow', '--accent-brand')
    content = content.replace('--dark-yellow', '--dark-brand')

    if 'style.css' in filepath:
        # Update colors to a cool Cyberpunk/Neon theme
        content = content.replace('--primary-brand: #e6b800;', '--primary-brand: #00f3ff;')
        content = content.replace('--secondary-brand: #cca300;', '--secondary-brand: #bc13fe;')
        content = content.replace('--accent-brand: #fff8e1;', '--accent-brand: #1a0033;')
        content = content.replace('--dark-brand: #806600;', '--dark-brand: #004d4d;')
        
        content = content.replace('--primary-brand: #ffcc00;', '--primary-brand: #00f3ff;')
        content = content.replace('rgba(255, 204, 0,', 'rgba(0, 243, 255,')
        
        # Replace the hardcoded background values for dark mode / light mode
        content = content.replace('--bg-color: #000000;', '--bg-color: #050510;')
        content = content.replace('--bg-color: var(--white);', '--bg-color: #f0f4f8;')
        
        # Add glassmorphism
        content = content.replace('background-color: var(--card-bg);', 'background-color: var(--card-bg);\n    backdrop-filter: blur(10px);\n    -webkit-backdrop-filter: blur(10px);')
        
        # Replace generic hero
        content = content.replace("url('https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')", "url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=80')")
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for file in ['s:/zzz/index.html', 's:/zzz/style.css', 's:/zzz/script.js']:
    replace_in_file(file)
