<template>
  <div class="freekick-game">
    <div class="back-button" @click="goHome">
      ← Back to Home
    </div>
    
    <div class="game-layout">
      <!-- 左側配置面板 -->
      <div class="config-panel">
        <div class="title">
          <h1>⚽ Free Kick Game</h1>
        </div>

        <!-- 音樂控制 -->
        <div class="music-control">
          <button @click="toggleMusic" class="music-btn">
            {{ musicPlaying ? '🔊 Music ON' : '🔇 Music OFF' }}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            v-model="musicVolume" 
            @input="updateVolume"
            class="volume-slider"
          />
        </div>

        <div class="balance">
          Balance: {{ balance }} coins
        </div>

        <div class="config-section">
          <h3>Game Settings</h3>
          <div class="bet-controls">
            <label>Bet Amount:</label>
            <select v-model="betAmount">
              <option value="10">10</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="500">500</option>
            </select>
          </div>
          
          <div class="difficulty-selector">
            <label>Difficulty Level:</label>
            <select v-model="difficulty" @change="updateOdds">
              <option value="easy">Easy (70% goal)</option>
              <option value="normal">Normal (50% goal)</option>
              <option value="hard">Hard (30% goal)</option>
              <option value="expert">Expert (15% goal)</option>
            </select>
          </div>
        </div>

        <div class="config-section">
          <h3>Goalkeeper</h3>
          <input 
            type="url" 
            v-model="goalkeeperImage" 
            placeholder="Enter image URL"
            class="image-input"
          />
          <div class="preset-goalkeepers">
            <button @click="goalkeeperImage = '/football/goalkeeper-default.svg'" class="preset-btn">Default</button>
            <button @click="goalkeeperImage = '/football/goalkeeper-classic.svg'" class="preset-btn">Classic</button>
            <button @click="goalkeeperImage = '/football/goalkeeper-modern.svg'" class="preset-btn">Modern</button>
          </div>
        </div>

        <div class="config-section">
          <h3>Betting</h3>
          <div class="bet-options">
            <button 
              @click="placeBet('goal')" 
              :disabled="gameInProgress || balance < betAmount"
              class="bet-btn goal-btn"
            >
              Bet Goal ({{ goalOdds }}x)
            </button>
            <button 
              @click="placeBet('miss')" 
              :disabled="gameInProgress || balance < betAmount"
              class="bet-btn miss-btn"
            >
              Bet Miss ({{ missOdds }}x)
            </button>
          </div>
          
          <div v-if="currentBet" class="current-bet">
            Current Bet: {{ currentBet.amount }} coins on {{ currentBet.type === 'goal' ? 'Goal' : 'Miss' }}
          </div>
        </div>

        <div class="game-controls">
          <button 
            @click="shootBall" 
            :disabled="!currentBet || gameInProgress"
            class="shoot-btn"
          >
            {{ gameInProgress ? 'Shooting...' : 'Shoot!' }}
          </button>
          <button @click="resetGame" class="reset-btn">Reset Game</button>
        </div>

        <div v-if="debugInfo" class="debug-info">
          Ball Position: X={{ debugInfo.x }}%, Y={{ debugInfo.y }}%<br>
          Goal Range: X(37.5-62.5%), Y(65-95%)
        </div>
      </div>

      <!-- 右側遊戲區域 -->
      <div class="game-area">
        <!-- 足球场 -->
        <div class="field">
          <!-- 球门 -->
          <div class="goal">
            <div class="goalpost left"></div>
            <div class="goalpost right"></div>
            <div class="crossbar"></div>
            <div class="net"></div>
          </div>

          <!-- 守门员 -->
          <div class="goalkeeper" :class="goalkeepAction" ref="goalkeeper">
            <img :src="goalkeeperImage" alt="守门员" class="goalkeeper-img" />
          </div>

          <!-- 足球 -->
          <div class="ball" :style="ballStyle" ref="ball">⚽</div>

          <!-- 罚球点 -->
          <div class="penalty-spot"></div>
        </div>

        <!-- Game Result -->
        <div v-if="gameResult" class="result-panel" :class="gameResult.type">
          <h2>{{ gameResult.message }}</h2>
          <p>{{ gameResult.description }}</p>
          <p v-if="gameResult.winnings > 0" class="winnings">
            Won: {{ gameResult.winnings }} coins!
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FreeKick',
  data() {
    return {
      // 音樂控制
      musicPlaying: false,
      musicVolume: 0.3,
      backgroundMusic: null,
      balance: 1000,
      betAmount: 50,
      currentBet: null,
      gameInProgress: false,
      gameResult: null,
      goalkeepAction: '',
      debugInfo: null,
      difficulty: 'normal',
      goalChance: 0.5,
      goalOdds: '1.8',
      missOdds: '1.8',
      goalkeeperImage: '/football/goalkeeper-default.svg',
      ballStyle: {
        left: '50%',
        bottom: '20px',
        transform: 'translateX(-50%)',
        transition: 'none'
      }
    }
  },
  mounted() {
    this.updateOdds()
    // 進入頁面時自動開啟音樂
    this.toggleMusic()
  },
  
  beforeUnmount() {
    // 離開頁面時停止音樂
    this.stopMusic()
  },
  methods: {
    goHome() {
      this.$router.push('/')
    },
    
    // 音樂控制方法
    initMusic() {
      this.backgroundMusic = new Audio('/football/football.mp3')
      this.backgroundMusic.loop = true
      this.backgroundMusic.volume = this.musicVolume
    },
    
    toggleMusic() {
      this.musicPlaying = !this.musicPlaying
      
      if (this.musicPlaying) {
        if (!this.backgroundMusic) {
          this.initMusic()
        }
        this.backgroundMusic.play().catch(error => {
          console.log('音樂播放失敗:', error)
        })
      } else {
        this.stopMusic()
      }
    },
    
    stopMusic() {
      if (this.backgroundMusic && typeof this.backgroundMusic.pause === 'function') {
        this.backgroundMusic.pause()
        this.backgroundMusic.currentTime = 0
      }
    },
    
    updateVolume() {
      if (this.backgroundMusic && typeof this.backgroundMusic.volume !== 'undefined') {
        this.backgroundMusic.volume = this.musicVolume
      }
    },
    updateOdds() {
      const difficultySettings = {
        easy: { chance: 0.7, goalOdds: 1.3, missOdds: 2.5 },
        normal: { chance: 0.5, goalOdds: 1.8, missOdds: 1.8 },
        hard: { chance: 0.3, goalOdds: 3.0, missOdds: 1.35 },
        expert: { chance: 0.15, goalOdds: 6.0, missOdds: 1.15 }
      }
      
      const settings = difficultySettings[this.difficulty]
      this.goalChance = settings.chance
      this.goalOdds = settings.goalOdds
      this.missOdds = settings.missOdds
    },

    placeBet(type) {
      if (this.balance < this.betAmount) return
      
      this.currentBet = {
        type: type,
        amount: parseInt(this.betAmount),
        odds: type === 'goal' ? this.goalOdds : this.missOdds
      }
      this.balance -= this.currentBet.amount
      this.gameResult = null
    },

    async shootBall() {
      if (!this.currentBet || this.gameInProgress) return

      this.gameInProgress = true
      this.gameResult = null

      const outcome = await this.animateBall()
      
      this.handleGameResult(outcome)
      
      this.gameInProgress = false
    },

    async animateBall() {
      const ball = this.$refs.ball
      
      this.ballStyle = {
        left: '50%',
        bottom: '20px',
        transform: 'translateX(-50%)',
        transition: 'none'
      }

      await this.$nextTick()

      return new Promise(resolve => {
        setTimeout(() => {
          const willScore = Math.random() < this.goalChance
          let targetX, targetY, outcome
          
          const goalLeft = 37.5
          const goalRight = 62.5  
          const goalBottom = 65
          const goalTop = 95
          
          if (willScore) {
            targetX = goalLeft + Math.random() * (goalRight - goalLeft)
            targetY = goalBottom + Math.random() * (goalTop - goalBottom)
            outcome = 'goal'
            this.goalkeepAction = 'dive-' + (targetX > 50 ? 'right' : 'left')
          } else {
            const failTypes = ['miss-high', 'miss-wide', 'save', 'crossbar', 'post']
            const failType = failTypes[Math.floor(Math.random() * failTypes.length)]
            
            if (failType === 'save') {
              targetX = Math.random() > 0.5 ? goalLeft - 5 : goalRight + 5
              targetY = goalBottom + Math.random() * (goalTop - goalBottom)
              outcome = 'save'
              this.goalkeepAction = 'save-' + (targetX > 50 ? 'right' : 'left')
            } else if (failType === 'crossbar') {
              targetX = goalLeft + Math.random() * (goalRight - goalLeft)
              targetY = goalTop - 2
              outcome = 'crossbar'
              this.goalkeepAction = 'watch'
            } else if (failType === 'post') {
              targetX = Math.random() > 0.5 ? goalRight + 1 : goalLeft - 1
              targetY = goalBottom + Math.random() * (goalTop - goalBottom)
              outcome = 'post'
              this.goalkeepAction = 'watch'
            } else if (failType === 'miss-high') {
              targetX = goalLeft + Math.random() * (goalRight - goalLeft)
              targetY = goalTop + 10 + Math.random() * 20
              outcome = 'miss'
              this.goalkeepAction = 'watch'
            } else {
              targetX = Math.random() > 0.5 ? goalRight + 10 + Math.random() * 20 : goalLeft - 10 - Math.random() * 20
              targetY = goalBottom + Math.random() * (goalTop - goalBottom)
              outcome = 'miss'
              this.goalkeepAction = 'watch'
            }
          }

          if (outcome === 'crossbar' || outcome === 'post' || outcome === 'save') {
            this.ballStyle = {
              left: targetX + '%',
              bottom: targetY + '%',
              transform: 'translateX(-50%) scale(0.8)',
              transition: 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }

            this.debugInfo = {
              x: Math.round(targetX * 10) / 10,
              y: Math.round(targetY * 10) / 10
            }

            setTimeout(() => {
              let bounceX, bounceY
              
              if (outcome === 'crossbar') {
                bounceX = targetX + (Math.random() - 0.5) * 20
                bounceY = targetY - 15 - Math.random() * 10
              } else if (outcome === 'post') {
                bounceX = targetX > 50 ? targetX + 15 + Math.random() * 10 : targetX - 15 - Math.random() * 10
                bounceY = targetY - Math.random() * 8
              } else {
                bounceX = targetX > 50 ? targetX + 10 + Math.random() * 15 : targetX - 10 - Math.random() * 15
                bounceY = targetY - Math.random() * 10
              }

              this.ballStyle = {
                left: bounceX + '%',
                bottom: Math.max(bounceY, 20) + '%',
                transform: 'translateX(-50%) scale(0.6) rotate(180deg)',
                transition: 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
              }

              setTimeout(() => {
                resolve(outcome)
              }, 800)
            }, 1000)
          } else {
            this.ballStyle = {
              left: targetX + '%',
              bottom: targetY + '%',
              transform: 'translateX(-50%) scale(0.8)',
              transition: 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }

            this.debugInfo = {
              x: Math.round(targetX * 10) / 10,
              y: Math.round(targetY * 10) / 10
            }

            setTimeout(() => {
              resolve(outcome)
            }, 1500)
          }
        }, 100)
      })
    },

    handleGameResult(outcome) {
      let isWin = false
      let winnings = 0
      let message = ''
      let description = ''

      if (outcome === 'goal') {
        message = '⚽ Goal!'
        description = 'Perfect shot! The ball flew into the goal!'
        isWin = this.currentBet.type === 'goal'
      } else if (outcome === 'save') {
        message = '🥅 Saved!'
        description = 'The goalkeeper made an amazing save!'
        isWin = this.currentBet.type === 'miss'
      } else if (outcome === 'crossbar') {
        message = '🚫 Hit the Crossbar!'
        description = 'So close! The ball bounced off the crossbar!'
        isWin = this.currentBet.type === 'miss'
      } else if (outcome === 'post') {
        message = '🚫 Hit the Post!'
        description = 'Unlucky! The ball hit the goal post and bounced out!'
        isWin = this.currentBet.type === 'miss'
      } else {
        message = '😵 Missed!'
        description = 'The ball flew out of the goal range!'
        isWin = this.currentBet.type === 'miss'
      }

      if (isWin) {
        winnings = Math.floor(this.currentBet.amount * this.currentBet.odds)
      }

      if (isWin) {
        this.balance += winnings
      }

      this.gameResult = {
        type: isWin ? 'win' : 'lose',
        message,
        description,
        winnings
      }

      this.currentBet = null

      setTimeout(() => {
        this.goalkeepAction = ''
      }, 3000)
    },

    resetGame() {
      this.balance = 1000
      this.currentBet = null
      this.gameInProgress = false
      this.gameResult = null
      this.goalkeepAction = ''
      this.ballStyle = {
        left: '50%',
        bottom: '20px',
        transform: 'translateX(-50%)',
        transition: 'none'
      }
    }
  }
}
</script>

<style scoped>
.freekick-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #2E8B57, #228B22);
}

.back-button {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(255,255,255,0.9);
  color: #2c5530;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  z-index: 1000;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.back-button:hover {
  background: white;
  transform: translateX(-5px);
}

/* 其他样式保持不变，从原来的App.vue复制过来 */
.game-layout {
  display: flex;
  width: 100%;
  height: 100vh;
}

.config-panel {
  width: 320px;
  background: rgba(255,255,255,0.95);
  padding: 20px;
  overflow-y: auto;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
}

.game-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
}

.title h1 {
  color: #2c5530;
  margin-bottom: 10px;
  font-size: 1.8em;
}

/* 音樂控制樣式 */
.music-control {
  background: rgba(255,255,255,0.1);
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.music-btn {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.music-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(78, 205, 196, 0.3);
}

.volume-slider {
  width: 100%;
  height: 5px;
  border-radius: 5px;
  background: rgba(255,255,255,0.3);
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #4ecdc4;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #4ecdc4;
  cursor: pointer;
  border: none;
}

.config-section {
  margin: 20px 0;
  padding: 15px;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  border-left: 4px solid #4CAF50;
}

.config-section h3 {
  color: #2c5530;
  margin-bottom: 10px;
  font-size: 1.1em;
}

.balance {
  font-size: 20px;
  font-weight: bold;
  color: #2c5530;
  text-align: center;
  background: rgba(76, 175, 80, 0.2);
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.field {
  position: relative;
  width: 100%;
  max-width: 800px;
  height: 500px;
  background: linear-gradient(to bottom, #4a934a 0%, #357a35 100%);
  border: 3px solid white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}

.goal {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 120px;
}

.goalpost {
  position: absolute;
  width: 8px;
  height: 120px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(255,255,255,0.5);
}

.goalpost.left { left: 0; }
.goalpost.right { right: 0; }

.crossbar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 8px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(255,255,255,0.5);
}

.net {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 0;
  background: rgba(255,255,255,0.1);
  background-image: 
    repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 10px),
    repeating-linear-gradient(90deg, transparent, transparent 12px, rgba(255,255,255,0.3) 12px, rgba(255,255,255,0.3) 14px);
}

.goalkeeper {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  transition: all 0.5s ease;
}

.goalkeeper-img {
  width: 60px;
  height: 80px;
  object-fit: contain;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
}

.goalkeeper.dive-left {
  transform: translateX(-50%) translateX(-80px) rotate(-45deg);
}

.goalkeeper.dive-right {
  transform: translateX(-50%) translateX(80px) rotate(45deg);
}

.goalkeeper.save-left {
  transform: translateX(-50%) translateX(-60px) scale(1.2);
}

.goalkeeper.save-right {
  transform: translateX(-50%) translateX(60px) scale(1.2);
}

.goalkeeper.watch {
  transform: translateX(-50%) scale(1.1);
}

.ball {
  position: absolute;
  font-size: 24px;
  z-index: 10;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
}

.penalty-spot {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 10px;
  background: white;
  border-radius: 50%;
}

.bet-controls label, .difficulty-selector label {
  display: block;
  margin-bottom: 5px;
  color: #2c5530;
  font-weight: bold;
  font-size: 14px;
}

.bet-controls select, .difficulty-selector select {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 2px solid #4a934a;
  font-size: 14px;
  background: white;
  margin-bottom: 10px;
}

.bet-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.bet-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.goal-btn {
  background: #e74c3c;
  color: white;
}

.goal-btn:hover:not(:disabled) {
  background: #c0392b;
}

.miss-btn {
  background: #3498db;
  color: white;
}

.miss-btn:hover:not(:disabled) {
  background: #2980b9;
}

.bet-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.current-bet {
  color: #2c5530;
  font-weight: bold;
  background: rgba(76, 175, 80, 0.2);
  padding: 10px;
  border-radius: 6px;
  font-size: 12px;
  text-align: center;
  margin-top: 10px;
}

.game-controls {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shoot-btn, .reset-btn {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.shoot-btn {
  background: #4CAF50;
  color: white;
}

.shoot-btn:hover:not(:disabled) {
  background: #45a049;
  transform: scale(1.05);
}

.shoot-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.reset-btn {
  background: #ff9800;
  color: white;
}

.reset-btn:hover {
  background: #f57c00;
  transform: scale(1.05);
}

.result-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.95);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 300px;
  z-index: 100;
}

.result-panel.win {
  border: 3px solid #4CAF50;
}

.result-panel.lose {
  border: 3px solid #f44336;
}

.result-panel h2 {
  margin-bottom: 10px;
  color: #2c5530;
}

.result-panel p {
  margin-bottom: 8px;
  color: #444;
}

.winnings {
  color: #4CAF50;
  font-weight: bold;
  font-size: 18px;
}

.debug-info {
  background: rgba(255,255,0,0.3);
  padding: 5px;
  border-radius: 3px;
  font-size: 12px;
  margin-top: 5px;
}

.image-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 2px solid #4a934a;
  font-size: 12px;
  margin-bottom: 10px;
}

.preset-goalkeepers {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 5px;
}

.preset-btn {
  padding: 8px;
  border: none;
  border-radius: 4px;
  background: #8BC34A;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.preset-btn:hover {
  background: #689F38;
}

/* 手機版響應式設計 */
@media (max-width: 768px) {
  .freekick-game {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .game-layout {
    flex-direction: column;
    height: 100vh;
    flex: 1;
  }
  
  .config-panel {
    width: 100%;
    max-height: 35vh;
    overflow-y: auto;
    order: 2;
    flex-shrink: 0;
  }
  
  .game-area {
    order: 1;
    padding: 5px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
  }
  
  .football-field {
    width: calc(100vw - 20px);
    max-width: 350px;
    height: calc(65vh - 10px);
    max-height: 300px;
    margin: 0 auto;
  }
  
  .title h1 {
    font-size: 1em;
    margin-bottom: 8px;
  }
  
  .balance {
    font-size: 0.8em;
    margin-bottom: 10px;
  }
  
  .config-section {
    margin: 10px 0;
    padding: 8px;
  }
  
  .config-section h3 {
    font-size: 0.9em;
    margin-bottom: 8px;
  }
  
  .bet-controls select,
  .difficulty-selector select,
  .image-input {
    font-size: 0.9em;
    padding: 8px;
  }
  
  .preset-goalkeepers {
    flex-direction: column;
    gap: 8px;
  }
  
  .preset-btn {
    padding: 8px 12px;
    font-size: 0.8em;
  }
  
  .bet-options {
    flex-direction: column;
    gap: 8px;
  }
  
  .bet-button {
    padding: 10px 15px;
    font-size: 0.9em;
  }
  
  .music-control {
    padding: 10px;
    margin-bottom: 15px;
  }
  
  .music-btn {
    padding: 8px 12px;
    font-size: 0.9em;
  }
  
  .back-button {
    top: 10px;
    left: 10px;
    padding: 8px 15px;
    font-size: 0.9em;
  }
  
  .result-panel {
    padding: 15px;
    font-size: 0.9em;
  }
  
  .winnings {
    font-size: 1.1em;
  }
}
</style>