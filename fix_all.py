import json
# tsconfig
ts = {
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": True,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": True,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": True,
    "resolveJsonModule": True,
    "isolatedModules": True,
    "noEmit": True,
    "jsx": "react-jsx",
    "strict": True,
    "noUnusedLocals": True,
    "noUnusedParameters": True,
    "noFallthroughCasesInSwitch": True
  },
  "include": ["src"],
  "references": [{"path": "./tsconfig.node.json"}]
}
with open('C:/Users/ACER/Downloads/coding/new-project/frontend/tsconfig.json', 'w') as f:
    json.dump(ts, f, indent=2)
# tsconfig.node
tsn = {
  "compilerOptions": {
    "composite": True,
    "skipLibCheck": True,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": True
  },
  "include": ["vite.config.ts"]
}
with open('C:/Users/ACER/Downloads/coding/new-project/frontend/tsconfig.node.json', 'w') as f:
    json.dump(tsn, f, indent=2)
