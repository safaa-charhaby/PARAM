import os

replacements = {
    'bg-orange': 'bg-magenta',
    'text-orange': 'text-magenta',
    'border-orange': 'border-magenta',
    'ring-orange': 'ring-magenta',
    'shadow-orange': 'shadow-magenta',
    'btn-orange': 'btn-magenta',
    'bg-navy': 'bg-deepBlue',
    'text-navy': 'text-deepBlue',
    'border-navy': 'border-deepBlue',
    'btn-navy': 'btn-deepBlue',
    'fill-orange': 'fill-magenta',
    'fill-navy': 'fill-deepBlue',
    'hover:bg-orange': 'hover:bg-magenta',
    'hover:text-orange': 'hover:text-magenta',
}

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.css'):
            replace_in_file(os.path.join(root, file))
