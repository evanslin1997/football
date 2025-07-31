# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server (runs on localhost:3000)
npm run dev

# Build for production (outputs to ./dist)
npm run build

# Preview production build locally
npm run preview
```

## Architecture Overview

This is a Vue.js 3 football games collection with two main games: Free Kick Challenge and Pinball Football. The application uses Vue Router for navigation and is deployed to GitHub Pages.

### Core Structure

- **Single Page Application (SPA)** using Vue Router with base path `/football/` for GitHub Pages
- **Component-based architecture** with three main views: Home, FreeKick, and Pinball
- **Responsive design** with distinct desktop (horizontal) and mobile (vertical) layouts
- **Real-time game physics** using requestAnimationFrame loops for smooth 60fps gameplay

### Game Architecture

Both games follow a similar pattern:

1. **Game State Management**: Each game component manages its own state using Vue's reactive data properties
2. **Physics Engine**: Custom ball physics with collision detection, velocity calculations, and boundary checking
3. **AI System**: Player AI with role-based behavior (Goalkeeper, Defender, Forward) and collision cooldowns
4. **Betting System**: Complete betting markets with odds calculation, cashout functionality, and bet settlement

### Key Technical Patterns

**Responsive Game Logic**: Both games detect device type using `isMobile()` and adapt:
- Field dimensions and player positions
- Ball physics direction (horizontal for desktop, vertical for mobile) 
- UI layout and control positioning

**Dynamic Field Sizing**: Games use `updateFieldDimensions()` to get actual CSS pixel dimensions and adjust game coordinates accordingly, ensuring proper scaling across devices.

**Game Loop Pattern**: Uses `requestAnimationFrame` with methods like:
- `gameLoop()` - Main game tick
- `updateBall()` - Ball physics and movement
- `updatePlayers()` - AI player behavior
- `checkCollisions()` - Ball-player interactions
- `checkGoals()` - Scoring detection

**Audio System**: Background music with `Web Audio API`, volume controls, and cross-component state management.

### Component Communication

- Games use Vue Router for navigation (`this.$router.push()`)
- No shared state between components - each game is self-contained
- Audio and game states reset on component unmount

### Mobile Responsiveness

The application implements device-specific logic throughout:
- Player positioning adapts to field orientation
- Ball physics change direction based on device
- UI elements reposition and resize
- Touch-optimized controls and sizing

### Deployment

- **GitHub Actions** workflow in `.github/workflows/deploy.yml`
- **Vite build** outputs to `./dist` directory
- **GitHub Pages** deployment with custom base path `/football/`
- **Asset handling**: SVG images and MP3 audio files in `public/` directory

### Development Notes

- Games maintain 60fps using `requestAnimationFrame`
- Ball physics include stuck detection and rescue mechanisms
- Player AI uses distance calculations and role-based decision making
- Betting system calculates real-time odds and cashout values
- Field dimensions are dynamically calculated to match CSS responsive sizing