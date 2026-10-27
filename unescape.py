import os
for root, dirs, files in os.walk('C:/Users/ACER/Downloads/coding/new-project/frontend/src'):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            path = os.path.join(root, f)
            with open(path) as fh:
                content = fh.read()
            content = content.replace('\\\"', '\"')
            with open(path, 'w') as fh:
                fh.write(content)
print('done')
