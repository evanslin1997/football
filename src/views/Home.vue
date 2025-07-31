<template>
  <div class="home">
    <div class="hero-section">
      <h1>⚽ Football Games Collection</h1>
      <p>Choose your favorite football game and start playing!</p>
    </div>

    <div class="games-grid">
      <div class="game-card" @click="goToGame('freekick')">
        <div class="game-icon">🎯</div>
        <h3>Free Kick Challenge</h3>
        <p>Test your precision in penalty shootouts. Bet on your shots and try to beat the goalkeeper!</p>
        <div class="game-features">
          <span class="feature">Betting System</span>
          <span class="feature">Multiple Difficulties</span>
          <span class="feature">Realistic Physics</span>
        </div>
        <button class="play-btn">Play Now</button>
      </div>

      <div class="game-card" @click="goToGame('pinball')">
        <div class="game-icon">⚡</div>
        <h3>Pinball Football</h3>
        <p>Fast-paced pinball action with football! Score as many goals as possible in 30 seconds!</p>
        <div class="game-features">
          <span class="feature">30 Second Matches</span>
          <span class="feature">Physics Bouncing</span>
          <span class="feature">Multiplayer Ready</span>
        </div>
        <button class="play-btn">Play Now</button>
      </div>
    </div>

    <div class="stats-section">
      <div class="stat">
        <h4>🏆</h4>
        <p>2 Games Available</p>
      </div>
      <div class="stat">
        <h4>⚽</h4>
        <p>Realistic Physics</p>
      </div>
      <div class="stat">
        <h4>🎮</h4>
        <p>Easy to Play</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    goToGame(game) {
      this.$router.push(`/${game}`)
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #2E8B57, #228B22, #4CAF50);
  padding: 40px 20px;
}

.hero-section {
  text-align: center;
  margin-bottom: 60px;
  color: white;
}

.hero-section h1 {
  font-size: 3.5em;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  animation: fadeInUp 1s ease-out;
}

.hero-section p {
  font-size: 1.3em;
  opacity: 0.9;
  animation: fadeInUp 1s ease-out 0.2s both;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto 60px;
}

.game-card {
  background: rgba(255,255,255,0.95);
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  animation: fadeInUp 1s ease-out 0.4s both;
}

.game-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.game-card:nth-child(2) {
  animation-delay: 0.6s;
}

.game-icon {
  font-size: 4em;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

.game-card h3 {
  color: #2c5530;
  font-size: 1.8em;
  margin-bottom: 15px;
}

.game-card p {
  color: #666;
  font-size: 1.1em;
  line-height: 1.6;
  margin-bottom: 20px;
}

.game-features {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 25px;
}

.feature {
  background: #4CAF50;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: bold;
}

.play-btn {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 1.2em;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.play-btn:hover {
  background: linear-gradient(45deg, #45a049, #3d8b40);
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.stats-section {
  display: flex;
  justify-content: center;
  gap: 60px;
  flex-wrap: wrap;
}

.stat {
  text-align: center;
  color: white;
  animation: fadeInUp 1s ease-out 0.8s both;
}

.stat h4 {
  font-size: 3em;
  margin-bottom: 10px;
}

.stat p {
  font-size: 1.1em;
  opacity: 0.9;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@media (max-width: 768px) {
  .games-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-section h1 {
    font-size: 2.5em;
  }
  
  .stats-section {
    gap: 30px;
  }
}
</style>