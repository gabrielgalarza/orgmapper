# OrgMapper

A lightweight web tool for visually mapping and managing organizational context inside large enterprise companies.

![OrgMapper](https://via.placeholder.com/800x400/0a0e14/00d9ff?text=OrgMapper)

## Features

- **Visual Org Mapping** - Map your organization by function (Product, Engineering, Data Science, Sales, etc.)
- **Drag & Drop** - Intuitively move people between teams with drag-and-drop
- **Reporting Structure** - Define and visualize who reports to whom
- **Contact Tags** - Identify power users, champions, decision-makers, influencers, and blockers
- **Quick Add** - Rapidly add new contacts with minimal friction
- **Clean UI** - Minimal, professional interface designed for clarity

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
cd org-mapper

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

### Build for Production

```bash
npm run build
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **dnd-kit** - Drag and drop
- **Lucide React** - Icons

## Project Structure

```
src/
├── components/          # React components
│   ├── AddPersonModal   # Quick add contact form
│   ├── Header           # App header with actions
│   ├── OrgBoard         # Main board with team sections
│   ├── PersonCard       # Individual contact card
│   ├── PersonDetail     # Contact detail side panel
│   └── TeamSection      # Team container component
├── context/
│   └── OrgContext       # Global state management
├── data/
│   └── mockData         # Sample org data (Cisco example)
├── types/
│   └── index            # TypeScript type definitions
├── App.tsx              # Root component
└── App.css              # Global styles
```

## Key Design Decisions

### State Management
Uses React Context + useReducer for predictable state updates without external dependencies. Simple enough for a tool of this scope.

### Drag and Drop
Built with @dnd-kit for modern, accessible drag-and-drop that works well with React's rendering model.

### Type System
Strong typing throughout with discriminated unions for tags and roles, making impossible states unrepresentable.

### Styling
Custom CSS with design tokens (CSS variables) for consistency. Dark theme inspired by IDE aesthetics for a professional, focused experience.

## Usage

### Adding a Contact
1. Click "Add Contact" in the header or the "+" in any team section
2. Fill in name and role (required)
3. Select team, level, and optional tags
4. Optionally assign a reporting manager

### Moving People Between Teams
Simply drag a person card and drop it into another team section.

### Viewing/Editing Details
Click on any person card to open the detail panel where you can:
- Toggle tags on/off
- Change reporting relationships
- View direct reports
- Remove from org

## License

MIT
