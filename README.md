# ⚽ Football Games Collection

A collection of interactive football games built with Vue.js 3, featuring realistic physics, betting systems, and responsive design.

🎮 **Play Now**: [https://evanslin1997.github.io/football](https://evanslin1997.github.io/football)

## 🎯 Games

### 🎯 Free Kick Challenge
Test your precision in penalty shootouts with customizable difficulty levels and betting system.

**Features:**
- 🎲 Multiple difficulty levels (Easy, Normal, Hard, Expert)
- 💰 Betting system with dynamic odds
- 🥅 Customizable goalkeeper images
- 🎯 Realistic ball physics and goal detection
- 📱 Fully responsive design

### ⚡ Pinball Football
Fast-paced pinball-style football with 30-second matches and comprehensive betting markets.

**Features:**
- ⏱️ 30-second intense matches
- 🤖 AI players with role-based behavior (Goalkeeper, Defender, Forward)
- 💸 Multiple betting markets:
  - **1X2**: Match winner prediction
  - **Over/Under**: Total goals prediction  
  - **Next Goal**: Which team scores next
  - **Odd/Even**: Total goals parity
- 💰 Live cashout system with dynamic pricing
- 🎵 Background music with volume control
- 📱 Mobile-optimized vertical field layout

## 📱 Responsive Design

### Desktop Experience
- **Free Kick**: Horizontal field layout with side control panel
- **Pinball**: Horizontal field with left-side betting interface

### Mobile Experience  
- **Free Kick**: Vertical layout with bottom controls
- **Pinball**: Vertical field with players positioned top/bottom
- Touch-optimized controls and compact UI

## 🎮 Controls

### Free Kick Game
1. Choose difficulty level
2. Select bet amount
3. Place bet on Goal or Miss
4. Click "Shoot!" to take the shot

### Pinball Game
1. Select bet amount ($5-$100)
2. Place bets on available markets
3. Click "Start Game" to begin 30-second match
4. Use "Cash Out" to secure winnings early
5. Watch AI players compete automatically

## 🏗️ Technical Stack

- **Frontend**: Vue.js 3 with Composition API
- **Routing**: Vue Router
- **Styling**: Scoped CSS with responsive design
- **Build Tool**: Vite
- **Deployment**: GitHub Pages with Actions
- **Audio**: Web Audio API

## 🚀 Development

### Prerequisites
- Node.js 18+
- npm

### Setup
```bash
# Clone repository
git clone https://github.com/evanslin1997/football.git
cd football

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🎨 Game Features

### Physics Engine
- Realistic ball movement and bouncing
- Player collision detection
- Goal detection with precise boundaries
- Ball trajectory with gravity simulation

### AI System
- **Goalkeeper**: Guards goal area, moves to intercept ball
- **Defenders**: Stay in defensive positions, support goalkeeper  
- **Forwards**: Actively chase ball, attempt to score
- **Cooldown System**: Players retreat after touching ball

### Betting System
- Dynamic odds calculation
- Multiple market types
- Real-time cashout valuation
- Comprehensive bet tracking

### Audio System
- Background music with loop playback
- Volume controls
- Auto-play on page entry
- Cross-page music continuity

## 📂 Project Structure

```
src/
├── views/
│   ├── Home.vue          # Game selection homepage
│   ├── FreeKick.vue      # Free kick penalty game
│   └── Pinball.vue       # Pinball football game
├── router/
│   └── index.js          # Vue Router configuration
├── App.vue               # Root component
└── main.js               # Application entry point

public/
├── football.mp3          # Background music
└── goalkeeper-*.svg      # Goalkeeper image assets

.github/
└── workflows/
    └── deploy.yml        # GitHub Actions deployment
```

## 🎵 Assets

- **Background Music**: Custom football-themed audio track
- **Goalkeeper Images**: SVG graphics with GitHub Pages compatibility
- **Team Icons**: Emoji-based team representations

## 🌟 Highlights

- **Cross-Platform**: Works seamlessly on desktop and mobile
- **Real-time Gameplay**: 60fps smooth animations
- **Professional UI/UX**: Clean, intuitive interface design
- **Advanced Betting**: Multiple markets with live cashout
- **Responsive Audio**: Background music with controls

## 📄 License

© 2025 Evans Lin. All rights reserved.

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

---

**Enjoy the games!** ⚽🎮