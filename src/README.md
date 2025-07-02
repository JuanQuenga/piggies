# Source Code Structure

This directory contains the frontend source code organized in a feature-based structure.

## Folder Structure

```
src/
├── app/                    # Main application features
│   ├── auth/              # Authentication components
│   │   ├── SignInForm.tsx
│   │   ├── SignOutButton.tsx
│   │   └── index.ts
│   ├── chat/              # Chat functionality
│   │   ├── ChatView.tsx
│   │   ├── ConversationList.tsx
│   │   ├── MessagingArea.tsx
│   │   └── index.ts
│   ├── map/               # Map functionality
│   │   ├── MapComponent.tsx
│   │   └── index.ts
│   └── profile/           # User profile management
│       ├── ProfileEditor.tsx
│       └── index.ts
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── textarea.tsx
│   ├── common/           # Common app components
│   │   ├── ThemeToggleButton.tsx
│   │   └── index.ts
│   └── index.ts
├── lib/                  # Utilities and helpers
│   └── utils.ts
├── styles/               # Global styles
│   └── index.css
├── types/                # TypeScript type definitions
├── App.tsx              # Main app component
├── main.tsx             # App entry point
```

## Import Guidelines

- Use index files for cleaner imports: `import { SignInForm } from './app/auth'`
- UI components: `import { Button } from './components/ui/button'`
- Common components: `import { ThemeToggleButton } from './components/common'`
- Utilities: `import { cn } from './lib/utils'`

## Adding New Features

1. Create a new folder in `app/` for your feature
2. Add your components to the feature folder
3. Create an `index.ts` file to export your components
4. Import using the feature folder: `import { Component } from './app/feature'`
