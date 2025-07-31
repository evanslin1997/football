<template>
  <div class="pinball-game">
    <div class="back-button" @click="goHome">
      ← Back to Home
    </div>

    <div class="game-layout">
      <!-- 左側資訊面板 -->
      <div class="info-panel">
        <div class="title">
          <h1>⚡ Pinball Football</h1>
        </div>

        <div class="game-status">
          <div class="timer">
            Time: {{ timeLeft }}s
          </div>
          
          <div class="scores">
            <div class="score-item">
              <span class="team red">🔴 Evans Team</span>
              <span class="score">{{ redScore }}</span>
            </div>
            <div class="score-item">
              <span class="team blue">🔵 Lin Team</span>
              <span class="score">{{ blueScore }}</span>
            </div>
          </div>

          <!-- 錢包資訊 -->
          <div class="wallet-info">
            <div class="wallet-balance">💰 Balance: ${{ wallet }}</div>
            <div class="bet-amount-selector">
              <label>Bet Amount: $</label>
              <select v-model="betAmount">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <!-- 下注市場 -->
          <div class="betting-markets">
            <div v-for="(market, marketKey) in markets" :key="marketKey" class="market">
              <h4>{{ market.name }}</h4>
              <div class="market-options">
                <button 
                  v-for="option in market.options" 
                  :key="option.key"
                  @click="placeBet(marketKey, option)"
                  :disabled="isMarketDisabled(marketKey)"
                  class="bet-option"
                >
                  <div class="option-name">{{ option.name }}</div>
                  <div class="option-odds">{{ option.odds }}</div>
                </button>
              </div>
            </div>
          </div>

          <!-- 當前下注 -->
          <div v-if="currentBets.filter(bet => !bet.settled).length > 0" class="current-bets">
            <h4>Active Bets</h4>
            <div v-for="bet in currentBets.filter(bet => !bet.settled)" :key="bet.id" class="bet-item">
              <div class="bet-details">
                <span class="bet-selection">{{ bet.optionName }}</span>
                <span class="bet-stake">${{ bet.amount }}</span>
                <span class="bet-odds">@{{ bet.odds }}</span>
              </div>
              <div class="bet-actions">
                <div class="potential-win">Win: ${{ (bet.amount * bet.odds).toFixed(2) }}</div>
                <div v-if="gameInProgress && canCashout(bet)" class="cashout-section">
                  <div class="cashout-value">Cashout: ${{ calculateCashoutValue(bet).toFixed(2) }}</div>
                  <button @click="cashoutBet(bet)" class="cashout-btn">💰 Cash Out</button>
                </div>
              </div>
            </div>
            <div class="total-stake">Total Stake: ${{ getActiveBetsTotal() }}</div>
            <div v-if="gameInProgress" class="cashout-all-section">
              <button 
                v-if="getActiveBets().some(bet => canCashout(bet))"
                @click="cashoutAll()" 
                class="cashout-all-btn"
              >
                💰 Cash Out All (${{ getTotalCashoutValue().toFixed(2) }})
              </button>
            </div>
          </div>
          
          <!-- 已結算的下注 -->
          <div v-if="currentBets.filter(bet => bet.settled).length > 0" class="settled-bets">
            <h4>Settled Bets</h4>
            <div v-for="bet in currentBets.filter(bet => bet.settled)" :key="bet.id" class="bet-item settled">
              <div class="bet-details">
                <span class="bet-selection">{{ bet.optionName }}</span>
                <span class="bet-stake">${{ bet.amount }}</span>
                <span class="bet-result" :class="{ 'won': bet.won, 'lost': !bet.won, 'cashed-out': bet.cashedOut }">
                  {{ bet.cashedOut ? 'CASHED OUT' : (bet.won ? 'WON' : 'LOST') }}
                </span>
              </div>
              <div v-if="bet.won && !bet.cashedOut" class="win-amount">Won: ${{ (bet.amount * bet.odds).toFixed(2) }}</div>
              <div v-if="bet.cashedOut" class="cashout-amount">Cashed Out: ${{ bet.cashoutValue.toFixed(2) }}</div>
            </div>
          </div>

          <div class="game-controls">
            <button 
              @click="startGame" 
              :disabled="gameInProgress"
              class="start-btn"
            >
              {{ gameInProgress ? 'Game Running...' : 'Start Game' }}
            </button>
            <button @click="resetGame" class="reset-btn">Reset</button>
          </div>

          <div v-if="gameResult" class="result-panel" :class="gameResult.winner">
            <h3>🏆 {{ gameResult.message }}</h3>
            <p>{{ gameResult.description }}</p>
          </div>
        </div>
      </div>

      <!-- 右側遊戲區域 -->
      <div class="game-area">
        <!-- 彈珠台場地 -->
        <div class="pinball-field" ref="gameField">
          <!-- 球門 -->
          <div class="goal red-goal">
            <div class="goal-line"></div>
          </div>
          <div class="goal blue-goal">
            <div class="goal-line"></div>
          </div>

          <!-- 球員 -->
          <div 
            v-for="player in players" 
            :key="player.id"
            :class="['player', player.team, { 'chasing': player.isChasing, 'retreating': isPlayerRetreating(player) }]"
            :data-role="player.role"
            :style="{ left: player.x + 'px', top: player.y + 'px' }"
          >
            <div class="team-name">{{ player.team === 'red' ? 'EVA' : 'LIN' }}</div>
          </div>

          <!-- 足球 -->
          <div 
            class="ball" 
            :style="{ 
              left: ball.x + 'px', 
              top: ball.y + 'px',
              transform: `rotate(${ball.rotation}deg)`
            }"
          >
            ⚽
          </div>

          <!-- 邊界線 -->
          <div class="field-lines">
            <div class="center-line"></div>
            <div class="center-circle"></div>
          </div>
          
          <!-- 進球動畫 -->
          <div v-if="goalAnimation" class="goal-animation">
            <div class="goal-text">{{ goalAnimation.message }}</div>
            <div class="goal-team">{{ goalAnimation.teamName }}</div>
            <div class="goal-score">{{ goalAnimation.score }}</div>
          </div>
          
          <!-- 比賽結束動畫 -->
          <div v-if="gameEndAnimation" class="game-end-animation" :class="gameEndAnimation.winner">
            <div class="game-end-title">🏆 GAME OVER 🏆</div>
            <div class="game-end-winner">{{ gameEndAnimation.message }}</div>
            <div class="game-end-score">{{ gameEndAnimation.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Pinball',
  data() {
    return {
      gameInProgress: false,
      timeLeft: 30,
      redScore: 0,
      blueScore: 0,
      gameResult: null,
      goalAnimation: null,
      lastGoalTime: 0,
      gameEndAnimation: null,
      // 下注系統
      wallet: 1000, // 初始金額
      currentBets: [],
      betAmount: 10,
      markets: {
        '1x2': {
          name: '1X2 (Full Time)',
          options: [
            { key: 'evans_win', name: 'Evans Win (1)', odds: 2.1 },
            { key: 'draw', name: 'Draw (X)', odds: 3.2 },
            { key: 'lin_win', name: 'Lin Win (2)', odds: 2.1 }
          ]
        },
        'over_under': {
          name: 'Total Goals',
          options: [
            { key: 'over_2.5', name: 'Over 2.5', odds: 1.8 },
            { key: 'under_2.5', name: 'Under 2.5', odds: 2.0 }
          ]
        },
        'next_goal': {
          name: 'Next Goal',
          options: [
            { key: 'evans_next', name: 'Evans Next', odds: 1.9 },
            { key: 'lin_next', name: 'Lin Next', odds: 1.9 },
            { key: 'no_goal', name: 'No More Goals', odds: 4.0 }
          ]
        },
        'odd_even': {
          name: 'Total Goals Odd/Even',
          options: [
            { key: 'odd', name: 'Odd', odds: 1.9 },
            { key: 'even', name: 'Even', odds: 1.9 }
          ]
        }
      },
      ball: {
        x: 400,
        y: 250,
        vx: 0,
        vy: 0,
        rotation: 0,
        stuckTimer: 0,
        lastX: 400,
        lastY: 250
      },
      players: [
        // Evans team players (3 players + 1 goalkeeper) - 超小尺寸
        { id: 1, team: 'red', x: 80, y: 250, vx: 0, vy: 0, radius: 15, originalX: 80, originalY: 250, role: 'goalkeeper', lastHitTime: 0 },
        { id: 2, team: 'red', x: 200, y: 100, vx: 0, vy: 0, radius: 12, originalX: 200, originalY: 100, role: 'defender', lastHitTime: 0 },
        { id: 3, team: 'red', x: 320, y: 250, vx: 0, vy: 0, radius: 12, originalX: 320, originalY: 250, role: 'midfielder', lastHitTime: 0 },
        { id: 4, team: 'red', x: 200, y: 400, vx: 0, vy: 0, radius: 12, originalX: 200, originalY: 400, role: 'forward', lastHitTime: 0 },
        
        // Lin team players (3 players + 1 goalkeeper) - 超小尺寸
        { id: 5, team: 'blue', x: 720, y: 250, vx: 0, vy: 0, radius: 15, originalX: 720, originalY: 250, role: 'goalkeeper', lastHitTime: 0 },
        { id: 6, team: 'blue', x: 600, y: 100, vx: 0, vy: 0, radius: 12, originalX: 600, originalY: 100, role: 'defender', lastHitTime: 0 },
        { id: 7, team: 'blue', x: 480, y: 250, vx: 0, vy: 0, radius: 12, originalX: 480, originalY: 250, role: 'midfielder', lastHitTime: 0 },
        { id: 8, team: 'blue', x: 600, y: 400, vx: 0, vy: 0, radius: 12, originalX: 600, originalY: 400, role: 'forward', lastHitTime: 0 }
      ],
      animationId: null,
      gameTimer: null,
      fieldWidth: 800,
      fieldHeight: 500,
      ballRadius: 12
    }
  },
  methods: {
    goHome() {
      this.$router.push('/')
    },
    
    isPlayerRetreating(player) {
      const currentTime = Date.now()
      return (currentTime - player.lastHitTime) < 1500
    },

    startGame() {
      this.gameInProgress = true
      this.timeLeft = 30
      this.redScore = 0
      this.blueScore = 0
      this.gameResult = null
      
      // 重置球的位置和速度 - 超快速度
      this.ball = {
        x: this.fieldWidth / 2,
        y: this.fieldHeight / 2,
        vx: (Math.random() - 0.5) * 30,
        vy: (Math.random() - 0.5) * 30,
        rotation: 0,
        stuckTimer: 0,
        lastX: this.fieldWidth / 2,
        lastY: this.fieldHeight / 2
      }

      // 重置球員位置
      this.players.forEach(player => {
        player.x = player.originalX
        player.y = player.originalY
        player.vx = 0
        player.vy = 0
      })

      // 開始遊戲迴圈
      this.gameLoop()
      
      // 開始計時器
      this.gameTimer = setInterval(() => {
        this.timeLeft--
        if (this.timeLeft <= 0) {
          this.endGame()
        }
      }, 1000)
    },

    gameLoop() {
      if (!this.gameInProgress) return

      this.updateBall()
      this.updatePlayers()
      this.checkCollisions()
      this.checkGoals()

      this.animationId = requestAnimationFrame(this.gameLoop)
    },

    updateBall() {
      // 檢查球是否卡住
      const moveDistance = Math.sqrt(
        Math.pow(this.ball.x - this.ball.lastX, 2) + 
        Math.pow(this.ball.y - this.ball.lastY, 2)
      )
      
      if (moveDistance < 1 && (Math.abs(this.ball.vx) + Math.abs(this.ball.vy)) < 2) {
        this.ball.stuckTimer++
        
        // 如果卡住超過2秒（約120幀），強制解救
        if (this.ball.stuckTimer > 120) {
          console.log('Ball stuck! Applying rescue force...')
          // 向場地中央施加力
          const centerX = this.fieldWidth / 2
          const centerY = this.fieldHeight / 2
          const toCenterX = centerX - this.ball.x
          const toCenterY = centerY - this.ball.y
          const distance = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY)
          
          if (distance > 0) {
            this.ball.vx = (toCenterX / distance) * 8 + (Math.random() - 0.5) * 4
            this.ball.vy = (toCenterY / distance) * 8 + (Math.random() - 0.5) * 4
          } else {
            // 如果已經在中央，隨機方向
            this.ball.vx = (Math.random() - 0.5) * 10
            this.ball.vy = (Math.random() - 0.5) * 10
          }
          this.ball.stuckTimer = 0
        }
      } else {
        this.ball.stuckTimer = 0
      }
      
      // 記錄上一幀位置
      this.ball.lastX = this.ball.x
      this.ball.lastY = this.ball.y

      // 更新球的位置
      this.ball.x += this.ball.vx
      this.ball.y += this.ball.vy
      this.ball.rotation += Math.abs(this.ball.vx) + Math.abs(this.ball.vy)

      // 球與邊界碰撞，增加最小反彈力
      if (this.ball.x <= this.ballRadius || this.ball.x >= this.fieldWidth - this.ballRadius) {
        this.ball.vx = -this.ball.vx * 0.8
        // 確保有最小速度避免卡在邊緣
        if (Math.abs(this.ball.vx) < 2) {
          this.ball.vx = this.ball.vx > 0 ? 3 : -3
        }
        this.ball.x = Math.max(this.ballRadius, Math.min(this.fieldWidth - this.ballRadius, this.ball.x))
      }
      
      if (this.ball.y <= this.ballRadius || this.ball.y >= this.fieldHeight - this.ballRadius) {
        this.ball.vy = -this.ball.vy * 0.8
        // 確保有最小速度避免卡在邊緣
        if (Math.abs(this.ball.vy) < 2) {
          this.ball.vy = this.ball.vy > 0 ? 3 : -3
        }
        this.ball.y = Math.max(this.ballRadius, Math.min(this.fieldHeight - this.ballRadius, this.ball.y))
      }

      // 摩擦力，但保持最小速度
      this.ball.vx *= 0.995
      this.ball.vy *= 0.995
      
      // 防止球完全停止
      const totalSpeed = Math.abs(this.ball.vx) + Math.abs(this.ball.vy)
      if (totalSpeed < 1 && totalSpeed > 0) {
        const speedMultiplier = 2 / totalSpeed
        this.ball.vx *= speedMultiplier
        this.ball.vy *= speedMultiplier
      }
    },

    updatePlayers() {
      // 先計算每隊最接近球的球員
      const redTeam = this.players.filter(p => p.team === 'red' && p.role !== 'goalkeeper')
      const blueTeam = this.players.filter(p => p.team === 'blue' && p.role !== 'goalkeeper')
      
      let redClosest = null
      let blueClosest = null
      let redMinDistance = Infinity
      let blueMinDistance = Infinity
      
      // 找出每隊最接近球的球員
      redTeam.forEach(player => {
        const dx = this.ball.x - (player.x + player.radius)
        const dy = this.ball.y - (player.y + player.radius)
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < redMinDistance) {
          redMinDistance = distance
          redClosest = player
        }
      })
      
      blueTeam.forEach(player => {
        const dx = this.ball.x - (player.x + player.radius)  
        const dy = this.ball.y - (player.y + player.radius)
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < blueMinDistance) {
          blueMinDistance = distance
          blueClosest = player
        }
      })

      this.players.forEach(player => {
        const dx = this.ball.x - (player.x + player.radius)
        const dy = this.ball.y - (player.y + player.radius)
        const distanceToBall = Math.sqrt(dx * dx + dy * dy)
        
        let targetX = player.x
        let targetY = player.y
        
        // 判斷是否為追球員
        const isChaser = (player.team === 'red' && player === redClosest) || 
                        (player.team === 'blue' && player === blueClosest)
        
        // 標記追球狀態用於視覺效果
        player.isChasing = isChaser
        
        if (player.role === 'goalkeeper') {
          // 守門員守在球門前
          const goalCenterY = this.fieldHeight / 2
          targetX = player.originalX
          
          if (player.team === 'red' && this.ball.x < this.fieldWidth / 3) {
            targetY = Math.max(200, Math.min(300, this.ball.y - player.radius))
          } else if (player.team === 'blue' && this.ball.x > this.fieldWidth * 2/3) {
            targetY = Math.max(200, Math.min(300, this.ball.y - player.radius))
          } else {
            targetY = goalCenterY - player.radius
          }
          
        } else if (isChaser && distanceToBall < 100) {
          // 檢查是否剛碰過球（在冷卻期間）
          const currentTime = Date.now()
          const timeSinceLastHit = currentTime - player.lastHitTime
          
          if (timeSinceLastHit < 1500) { // 碰球後1.5秒內後退
            // 後退到原位
            targetX = player.originalX
            targetY = player.originalY
          } else {
            // 正常追球
            targetX = this.ball.x - player.radius
            targetY = this.ball.y - player.radius
          }
          
        } else {
          // 其他球員保持陣型或回到原位
          if (player.role === 'defender') {
            // 後衛輕微跟隨球但主要守在後場
            if (player.team === 'red' && this.ball.x < this.fieldWidth / 2) {
              targetX = player.originalX + (this.ball.x - player.originalX) * 0.2
              targetY = player.originalY + (this.ball.y - player.originalY) * 0.3
            } else if (player.team === 'blue' && this.ball.x > this.fieldWidth / 2) {
              targetX = player.originalX + (this.ball.x - player.originalX) * 0.2  
              targetY = player.originalY + (this.ball.y - player.originalY) * 0.3
            } else {
              targetX = player.originalX
              targetY = player.originalY
            }
          } else {
            // 中場和前鋒回到原位或稍作調整
            targetX = player.originalX + (this.ball.x - player.originalX) * 0.1
            targetY = player.originalY + (this.ball.y - player.originalY) * 0.15
          }
        }
        
        // 限制移動範圍
        if (player.role === 'goalkeeper') {
          if (player.team === 'red') {
            targetX = Math.max(30, Math.min(120, targetX))
          } else {
            targetX = Math.max(680, Math.min(770, targetX))
          }
        } else {
          if (player.team === 'red') {
            targetX = Math.max(25, Math.min(this.fieldWidth / 2 - 10, targetX))
          } else {
            targetX = Math.max(this.fieldWidth / 2 + 10, Math.min(this.fieldWidth - 50, targetX))
          }
        }
        targetY = Math.max(25, Math.min(this.fieldHeight - 50, targetY))
        
        // 移動速度，剛碰過球的球員後退更快
        const currentTime = Date.now()
        const timeSinceLastHit = currentTime - player.lastHitTime
        const isRetreating = timeSinceLastHit < 1500
        
        let moveSpeed
        if (isRetreating) {
          moveSpeed = 0.15 // 後退速度更快
        } else if (isChaser) {
          moveSpeed = 0.12 // 追球速度
        } else if (player.role === 'goalkeeper') {
          moveSpeed = 0.08 // 守門員速度
        } else {
          moveSpeed = 0.04 // 其他球員速度
        }
        
        const moveX = (targetX - player.x) * moveSpeed
        const moveY = (targetY - player.y) * moveSpeed
        
        player.vx = moveX
        player.vy = moveY
        player.x += player.vx
        player.y += player.vy
        
        // 限制最終位置
        if (player.role === 'goalkeeper') {
          if (player.team === 'red') {
            player.x = Math.max(30, Math.min(120, player.x))
          } else {
            player.x = Math.max(680, Math.min(770, player.x))
          }
        } else {
          if (player.team === 'red') {
            player.x = Math.max(25, Math.min(this.fieldWidth / 2 - 10, player.x))
          } else {
            player.x = Math.max(this.fieldWidth / 2 + 10, Math.min(this.fieldWidth - 50, player.x))
          }
        }
        player.y = Math.max(25, Math.min(this.fieldHeight - 50, player.y))
      })
    },

    checkCollisions() {
      const currentTime = Date.now()
      
      this.players.forEach(player => {
        const dx = this.ball.x - (player.x + player.radius)
        const dy = this.ball.y - (player.y + player.radius)
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < this.ballRadius + player.radius) {
          // 檢查是否在冷卻時間內（防止連續碰撞）
          const timeSinceLastHit = currentTime - player.lastHitTime
          if (timeSinceLastHit < 1000) { // 1秒冷卻時間
            return
          }
          
          // 記錄碰撞時間
          player.lastHitTime = currentTime
          
          // 計算朝向對方球門的角度
          let targetGoalX
          if (player.team === 'red') {
            // 紅隊踢向右邊藍隊球門
            targetGoalX = this.fieldWidth - 10
          } else {
            // 藍隊踢向左邊紅隊球門
            targetGoalX = 10
          }
          
          const goalCenterY = this.fieldHeight / 2
          const toGoalX = targetGoalX - this.ball.x
          const toGoalY = goalCenterY - this.ball.y
          const toGoalAngle = Math.atan2(toGoalY, toGoalX)
          
          // 加入一些隨機性避免太死板
          const randomOffset = (Math.random() - 0.5) * 0.8 // ±0.4弧度的隨機偏移
          const finalAngle = toGoalAngle + randomOffset
          
          const force = player.role === 'goalkeeper' ? 25 : 20
          
          this.ball.vx = Math.cos(finalAngle) * force
          this.ball.vy = Math.sin(finalAngle) * force

          // 分離球和球員（用原本的碰撞角度）
          const collisionAngle = Math.atan2(dy, dx)
          const overlap = this.ballRadius + player.radius - distance
          this.ball.x += Math.cos(collisionAngle) * overlap
          this.ball.y += Math.sin(collisionAngle) * overlap
        }
      })
    },

    checkGoals() {
      const currentTime = Date.now()
      
      // 防止重複計分（至少間1秒後才能再次進球）
      if (currentTime - this.lastGoalTime < 1000) {
        return
      }
      
      // 檢查紅隊球門 (左側)
      if (this.ball.x <= 20 && this.ball.y >= 180 && this.ball.y <= 320) {
        this.blueScore++
        this.lastGoalTime = currentTime
        this.settleNextGoalBets('lin') // 結算next goal下注
        this.showGoalAnimation('Lin Team', 'GOAL!', this.redScore, this.blueScore)
        setTimeout(() => this.resetBallAfterGoal(), 1500)
        return
      }
      
      // 檢查藍隊球門 (右側)
      if (this.ball.x >= this.fieldWidth - 20 && this.ball.y >= 180 && this.ball.y <= 320) {
        this.redScore++
        this.lastGoalTime = currentTime
        this.settleNextGoalBets('evans') // 結算next goal下注
        this.showGoalAnimation('Evans Team', 'GOAL!', this.redScore, this.blueScore)
        setTimeout(() => this.resetBallAfterGoal(), 1500)
        return
      }
    },
    
    showGoalAnimation(teamName, message, redScore, blueScore) {
      this.goalAnimation = {
        teamName,
        message,
        score: `${redScore} - ${blueScore}`
      }
      
      // 1.5秒後清除動畫
      setTimeout(() => {
        this.goalAnimation = null
      }, 1500)
    },

    resetBallAfterGoal() {
      // 球回到中央，隨機方向，超快速度
      this.ball = {
        x: this.fieldWidth / 2,
        y: this.fieldHeight / 2,
        vx: (Math.random() - 0.5) * 25,
        vy: (Math.random() - 0.5) * 25,
        rotation: 0,
        stuckTimer: 0,
        lastX: this.fieldWidth / 2,
        lastY: this.fieldHeight / 2
      }
    },

    endGame() {
      this.gameInProgress = false
      clearInterval(this.gameTimer)
      cancelAnimationFrame(this.animationId)

      // 判定勝負
      let winner, message, description
      
      if (this.redScore > this.blueScore) {
        winner = 'red'
        message = 'Evans Team Wins!'
        description = `Final Score: Evans ${this.redScore} - ${this.blueScore} Lin`
      } else if (this.blueScore > this.redScore) {
        winner = 'blue'
        message = 'Lin Team Wins!'
        description = `Final Score: Lin ${this.blueScore} - ${this.redScore} Evans`
      } else {
        winner = 'tie'
        message = 'It\'s a Tie!'
        description = `Final Score: Evans ${this.redScore} - ${this.blueScore} Lin`
      }

      // 顯示比賽結束動畫
      this.showGameEndAnimation(winner, message, description)
      
      // 3秒後顯示結果面板
      setTimeout(() => {
        this.gameResult = {
          winner,
          message,
          description
        }
        this.gameEndAnimation = null
      }, 3000)
    },
    
    showGameEndAnimation(winner, message, description) {
      this.gameEndAnimation = {
        winner,
        message,
        description
      }
      
      // 結算所有下注
      this.settleBets()
    },
    
    // 下注方法
    placeBet(marketKey, option) {
      if (this.wallet < this.betAmount) {
        alert('錢包余額不足！')
        return
      }
      
      // 檢查是否已經在這個市場下過注（除了next_goal）
      if (marketKey !== 'next_goal') {
        const existingBet = this.currentBets.find(bet => bet.market === marketKey)
        if (existingBet) {
          alert('您已經在這個市場下過注了！')
          return
        }
      }
      
      const bet = {
        id: Date.now(),
        market: marketKey,
        option: option.key,
        optionName: option.name,
        amount: this.betAmount,
        odds: option.odds,
        settled: false
      }
      
      this.currentBets.push(bet)
      this.wallet -= this.betAmount
    },
    
    hasNextGoalBet() {
      return this.currentBets.some(bet => bet.market === 'next_goal' && !bet.settled)
    },
    
    // 檢查市場是否被禁用
    isMarketDisabled(marketKey) {
      // 除了next_goal，其他市場在比賽開始後就禁用
      if (this.gameInProgress && marketKey !== 'next_goal') {
        return true
      }
      
      // next_goal在有未結算的下注時禁用
      if (marketKey === 'next_goal' && this.hasNextGoalBet()) {
        return true
      }
      
      return false
    },
    
    // 只計算未結算的下注總額
    getActiveBetsTotal() {
      return this.currentBets
        .filter(bet => !bet.settled)
        .reduce((sum, bet) => sum + bet.amount, 0)
    },
    
    // 獲取未結算的下注
    getActiveBets() {
      return this.currentBets.filter(bet => !bet.settled)
    },
    
    // 檢查是否可以 cashout
    canCashout(bet) {
      // Next Goal 下注不能 cashout
      if (bet.market === 'next_goal') {
        return false
      }
      
      // 只有比賽進行中才能 cashout
      return this.gameInProgress
    },
    
    // 計算 cashout 價值
    calculateCashoutValue(bet) {
      if (!this.canCashout(bet)) return 0
      
      const timeElapsed = 30 - this.timeLeft // 已經過的時間
      const timeProgress = timeElapsed / 30 // 時間進度 (0-1)
      const currentScore = this.redScore + this.blueScore
      
      let winProbability = 0.5 // 基礎獲勝機率
      
      // 根據下注類型和當前狀況調整機率
      switch (bet.option) {
        case 'evans_win':
          if (this.redScore > this.blueScore) {
            winProbability = 0.8 + (timeProgress * 0.15) // 領先時機率提高
          } else if (this.redScore < this.blueScore) {
            winProbability = 0.2 - (timeProgress * 0.15) // 落後時機率降低
          } else {
            winProbability = 0.45 // 平局時略低
          }
          break
          
        case 'lin_win':
          if (this.blueScore > this.redScore) {
            winProbability = 0.8 + (timeProgress * 0.15)
          } else if (this.blueScore < this.redScore) {
            winProbability = 0.2 - (timeProgress * 0.15)
          } else {
            winProbability = 0.45
          }
          break
          
        case 'draw':
          if (this.redScore === this.blueScore) {
            winProbability = 0.6 + (timeProgress * 0.2) // 平局時機率提高
          } else {
            winProbability = 0.3 - (timeProgress * 0.1) // 有分差時機率降低
          }
          break
          
        case 'over_2.5':
          if (currentScore >= 3) {
            winProbability = 1.0 // 已經over了
          } else {
            winProbability = Math.min(0.8, 0.4 + (currentScore * 0.2) - (timeProgress * 0.2))
          }
          break
          
        case 'under_2.5':
          if (currentScore >= 3) {
            winProbability = 0.0 // 已經over了
          } else {
            winProbability = Math.max(0.2, 0.6 - (currentScore * 0.15) + (timeProgress * 0.2))
          }
          break
          
        case 'odd':
          winProbability = (currentScore % 2 === 1) ? 0.6 : 0.4
          break
          
        case 'even':
          winProbability = (currentScore % 2 === 0) ? 0.6 : 0.4
          break
      }
      
      // 確保機率在合理範圍內
      winProbability = Math.max(0.05, Math.min(0.95, winProbability))
      
      // 計算 cashout 價值 (預期價值 * 折扣係數)
      const expectedValue = bet.amount * bet.odds * winProbability
      const discountFactor = 0.85 // 15% 手續費
      
      return Math.max(bet.amount * 0.1, expectedValue * discountFactor) // 至少能拿回10%本金
    },
    
    // 計算所有可 cashout 下注的總價值
    getTotalCashoutValue() {
      return this.getActiveBets()
        .filter(bet => this.canCashout(bet))
        .reduce((sum, bet) => sum + this.calculateCashoutValue(bet), 0)
    },
    
    // 單個下注 cashout
    cashoutBet(bet) {
      const cashoutValue = this.calculateCashoutValue(bet)
      
      if (confirm(`確定要以 $${cashoutValue.toFixed(2)} 的價格 cash out 這個下注嗎？`)) {
        this.wallet += cashoutValue
        bet.settled = true
        bet.cashedOut = true
        bet.cashoutValue = cashoutValue
        bet.won = false // 標記為未獲勝（因為提前結算）
      }
    },
    
    // 全部 cashout
    cashoutAll() {
      const totalValue = this.getTotalCashoutValue()
      const cashoutableBets = this.getActiveBets().filter(bet => this.canCashout(bet))
      
      if (confirm(`確定要以總共 $${totalValue.toFixed(2)} 的價格 cash out 所有可用的下注嗎？`)) {
        cashoutableBets.forEach(bet => {
          const cashoutValue = this.calculateCashoutValue(bet)
          this.wallet += cashoutValue
          bet.settled = true
          bet.cashedOut = true
          bet.cashoutValue = cashoutValue
          bet.won = false
        })
      }
    },
    
    // 結算下注
    settleBets() {
      const totalGoals = this.redScore + this.blueScore
      
      this.currentBets.forEach(bet => {
        if (bet.settled) return
        
        let won = false
        
        switch (bet.option) {
          // 1X2 Market
          case 'evans_win':
            won = this.redScore > this.blueScore
            break
          case 'draw':
            won = this.redScore === this.blueScore
            break
          case 'lin_win':
            won = this.blueScore > this.redScore
            break
            
          // Over/Under Market
          case 'over_2.5':
            won = totalGoals > 2.5
            break
          case 'under_2.5':
            won = totalGoals < 2.5
            break
            
          // Odd/Even Market
          case 'odd':
            won = totalGoals % 2 === 1
            break
          case 'even':
            won = totalGoals % 2 === 0
            break
            
          // Next Goal - 會在進球時結算
          case 'no_goal':
            won = true // 如果比賽結束時還有no_goal的注，就是獲勝
            break
        }
        
        if (won) {
          this.wallet += bet.amount * bet.odds
        }
        bet.won = won
        bet.settled = true
      })
    },
    
    // 進球時結算next goal下注
    settleNextGoalBets(scoringTeam) {
      const nextGoalBets = this.currentBets.filter(bet => bet.market === 'next_goal' && !bet.settled)
      
      nextGoalBets.forEach(bet => {
        let won = false
        
        if (bet.option === 'evans_next' && scoringTeam === 'evans') {
          won = true
        } else if (bet.option === 'lin_next' && scoringTeam === 'lin') {
          won = true
        }
        
        if (won) {
          this.wallet += bet.amount * bet.odds
        }
        bet.won = won
        bet.settled = true
      })
    },

    resetGame() {
      this.gameInProgress = false
      this.timeLeft = 30
      this.redScore = 0
      this.blueScore = 0
      this.gameResult = null
      this.goalAnimation = null
      this.gameEndAnimation = null
      this.lastGoalTime = 0
      this.currentBets = []
      
      clearInterval(this.gameTimer)
      cancelAnimationFrame(this.animationId)

      this.ball = {
        x: this.fieldWidth / 2,
        y: this.fieldHeight / 2,
        vx: 0,
        vy: 0,
        rotation: 0,
        stuckTimer: 0,
        lastX: this.fieldWidth / 2,
        lastY: this.fieldHeight / 2
      }

      // 重置球員位置
      this.players.forEach(player => {
        player.x = player.originalX
        player.y = player.originalY
        player.vx = 0
        player.vy = 0
      })
    }
  },

  beforeUnmount() {
    clearInterval(this.gameTimer)
    cancelAnimationFrame(this.animationId)
  }
}
</script>

<style scoped>
.pinball-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
}

.back-button {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(255,255,255,0.9);
  color: #1a1a2e;
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

.game-layout {
  display: flex;
  width: 100%;
  height: 100vh;
}

.info-panel {
  width: 350px;
  background: rgba(255,255,255,0.95);
  padding: 20px;
  overflow-y: auto;
  box-shadow: 2px 0 10px rgba(0,0,0,0.1);
}

.game-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.title h1 {
  color: #1a1a2e;
  margin-bottom: 20px;
  font-size: 1.8em;
  text-align: center;
}

.game-status {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timer {
  background: linear-gradient(45deg, #ff6b6b, #ee5a52);
  color: white;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  font-size: 1.5em;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(255,107,107,0.3);
}

.scores {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(0,0,0,0.05);
  border-radius: 8px;
}

.team {
  font-weight: bold;
  font-size: 1.1em;
}

.score {
  font-size: 1.5em;
  font-weight: bold;
  color: #1a1a2e;
}

.game-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.start-btn, .reset-btn {
  padding: 15px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
}

.start-btn:hover:not(:disabled) {
  background: linear-gradient(45deg, #45a049, #3d8b40);
  transform: scale(1.05);
}

.start-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.reset-btn {
  background: linear-gradient(45deg, #ff9800, #f57c00);
  color: white;
}

.reset-btn:hover {
  background: linear-gradient(45deg, #f57c00, #ef6c00);
  transform: scale(1.05);
}

.result-panel {
  background: rgba(255,255,255,0.95);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.result-panel.red {
  border: 3px solid #ff6b6b;
}

.result-panel.blue {
  border: 3px solid #4dabf7;
}

.result-panel.tie {
  border: 3px solid #ffd43b;
}

.result-panel h3 {
  margin-bottom: 10px;
  color: #1a1a2e;
}

.pinball-field {
  position: relative;
  width: 800px;
  height: 500px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border: 4px solid white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.goal {
  position: absolute;
  width: 20px;
  height: 140px;
  top: 180px;
}

.red-goal {
  left: 0;
  background: rgba(255,107,107,0.3);
}

.blue-goal {
  right: 0;
  background: rgba(77,171,247,0.3);
}

.goal-line {
  width: 100%;
  height: 100%;
  border: 3px solid white;
  border-radius: 0 5px 5px 0;
}

.blue-goal .goal-line {
  border-radius: 5px 0 0 5px;
}


.player.red {
  background: rgba(255,107,107,0.9);
  border: 2px solid #ff5252;
}

.player.blue {
  background: rgba(77,171,247,0.9);
  border: 2px solid #2196f3;
}

/* 所有球員的基本大小 - 超小尺寸 */
.player {
  position: absolute;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  transition: all 0.1s ease;
  width: 24px;
  height: 24px;
  font-size: 10px;
}

/* 守門員略大 */
.player[data-role="goalkeeper"] {
  width: 30px;
  height: 30px;
  font-size: 12px;
}

/* 隊名文字樣式 */
.team-name {
  font-weight: bold;
  font-family: Arial, sans-serif;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}

/* 追球員特殊效果 */
.player.chasing {
  animation: chasing-pulse 0.8s infinite;
  z-index: 10;
}

@keyframes chasing-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

/* 剛碰到球的球員發光效果 */
.player.retreating {
  animation: just-hit-glow 0.8s infinite;
  box-shadow: 0 0 15px rgba(255, 255, 0, 0.8), 0 0 25px rgba(255, 255, 0, 0.6);
  z-index: 15;
}

@keyframes just-hit-glow {
  0% { 
    box-shadow: 0 0 15px rgba(255, 255, 0, 0.8), 0 0 25px rgba(255, 255, 0, 0.6);
    transform: scale(1.1);
  }
  50% { 
    box-shadow: 0 0 20px rgba(255, 255, 0, 1), 0 0 35px rgba(255, 255, 0, 0.8);
    transform: scale(1.15);
  }
  100% { 
    box-shadow: 0 0 15px rgba(255, 255, 0, 0.8), 0 0 25px rgba(255, 255, 0, 0.6);
    transform: scale(1.1);
  }
}

.ball {
  position: absolute;
  width: 24px;
  height: 24px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.4));
  transition: transform 0.1s ease;
}

.field-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.center-line {
  position: absolute;
  left: 50%;
  top: 0;
  width: 3px;
  height: 100%;
  background: rgba(255,255,255,0.6);
  transform: translateX(-50%);
}

.center-circle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 100px;
  height: 100px;
  border: 3px solid rgba(255,255,255,0.6);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

/* 進球動畫 */
.goal-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 30px;
  border-radius: 20px;
  text-align: center;
  z-index: 1000;
  animation: goal-popup 1.5s ease-in-out;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.goal-text {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #FFD700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.goal-team {
  font-size: 24px;
  margin-bottom: 10px;
  color: #FFF;
}

.goal-score {
  font-size: 36px;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

@keyframes goal-popup {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

/* 比賽結束動畫 */
.game-end-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #000, #333);
  color: white;
  padding: 50px;
  border-radius: 30px;
  text-align: center;
  z-index: 2000;
  animation: game-end-celebration 3s ease-in-out;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
  border: 3px solid #FFD700;
}

.game-end-animation.red {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
}

.game-end-animation.blue {
  background: linear-gradient(135deg, #4dabf7, #2196f3);
}

.game-end-animation.tie {
  background: linear-gradient(135deg, #ffd43b, #fab005);
}

.game-end-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #FFD700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.game-end-winner {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 15px;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.game-end-score {
  font-size: 24px;
  color: #FFD700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

@keyframes game-end-celebration {
  0% {
    transform: translate(-50%, -50%) scale(0.3) rotate(-10deg);
    opacity: 0;
  }
  30% {
    transform: translate(-50%, -50%) scale(1.3) rotate(5deg);
    opacity: 1;
  }
  60% {
    transform: translate(-50%, -50%) scale(0.9) rotate(-2deg);
  }
  100% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* 下注系統樣式 */
.wallet-info {
  background: linear-gradient(45deg, #4CAF50, #45a049);
  color: white;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.wallet-balance {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.bet-amount-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bet-amount-selector select {
  padding: 5px;
  border-radius: 5px;
  border: none;
  background: white;
  color: #333;
}

.betting-markets {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.market {
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.market h4 {
  color: #1a1a2e;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
}

.market-options {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.bet-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: linear-gradient(45deg, #2196f3, #1976d2);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 12px;
}

.bet-option:hover:not(:disabled) {
  background: linear-gradient(45deg, #1976d2, #1565c0);
  transform: scale(1.02);
}

.bet-option:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.option-name {
  font-weight: bold;
}

.option-odds {
  background: rgba(255,255,255,0.2);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 11px;
}

.current-bets {
  background: rgba(255,193,7,0.1);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  border: 2px solid #ffc107;
}

.current-bets h4 {
  color: #1a1a2e;
  margin-bottom: 10px;
  font-size: 14px;
}

.bet-item {
  background: rgba(255,255,255,0.8);
  border-radius: 5px;
  padding: 8px;
  margin-bottom: 8px;
}

.bet-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  margin-bottom: 4px;
}

.bet-selection {
  font-weight: bold;
  color: #1a1a2e;
}

.bet-stake {
  color: #d32f2f;
  font-weight: bold;
}

.bet-odds {
  background: #4caf50;
  color: white;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 10px;
}

.potential-win {
  font-size: 11px;
  color: #4caf50;
  font-weight: bold;
}

.total-stake {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 2px solid #ffc107;
  font-weight: bold;
  color: #1a1a2e;
  text-align: center;
}

.settled-bets {
  background: rgba(108, 117, 125, 0.1);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  border: 2px solid #6c757d;
}

.settled-bets h4 {
  color: #1a1a2e;
  margin-bottom: 10px;
  font-size: 14px;
}

.bet-item.settled {
  background: rgba(108, 117, 125, 0.2);
  opacity: 0.8;
}

.bet-result {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
}

.bet-result.won {
  background: #4caf50;
  color: white;
}

.bet-result.lost {
  background: #f44336;
  color: white;
}

.win-amount {
  font-size: 11px;
  color: #4caf50;
  font-weight: bold;
}

.cashout-amount {
  font-size: 11px;
  color: #ff9800;
  font-weight: bold;
}

.bet-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.cashout-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 152, 0, 0.1);
  padding: 5px 8px;
  border-radius: 4px;
  border: 1px solid #ff9800;
}

.cashout-value {
  font-size: 11px;
  color: #ff9800;
  font-weight: bold;
}

.cashout-btn {
  background: linear-gradient(45deg, #ff9800, #f57c00);
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.cashout-btn:hover {
  background: linear-gradient(45deg, #f57c00, #ef6c00);
  transform: scale(1.05);
}

.cashout-all-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid #ff9800;
  text-align: center;
}

.cashout-all-btn {
  background: linear-gradient(45deg, #ff9800, #f57c00);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
  width: 100%;
}

.cashout-all-btn:hover {
  background: linear-gradient(45deg, #f57c00, #ef6c00);
  transform: scale(1.02);
}

.bet-result.cashed-out {
  background: #ff9800;
  color: white;
}

@media (max-width: 1200px) {
  .pinball-field {
    width: 600px;
    height: 375px;
  }
  
  .info-panel {
    width: 250px;
  }
  
  .betting-markets {
    max-height: 300px;
  }
}
</style>