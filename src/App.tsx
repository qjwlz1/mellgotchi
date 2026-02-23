import { useEffect, useState } from 'react'
import { useRawInitData } from '@tma.js/sdk-react'
import { motion } from 'framer-motion'
import './App.css'

interface Pet {
  name: string
  rarity: string
  season: string
  emoji: string
  specialAbility: string
  catchPhrase: string
  evolutionStage: number
  happiness: number
}

function App() {
  const [omaygad, setOmaygad] = useState(100)
  const [level, setLevel] = useState(1)
  const [xp, setXp] = useState(0)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [showPetSelection, setShowPetSelection] = useState(true)
  const [feedCount, setFeedCount] = useState(0)
  const [specialTriggered, setSpecialTriggered] = useState(false)
  const [murkocoin, setMurkocoin] = useState(0)
  const [inventory, setInventory] = useState<string[]>([])
  
  // Состояния для рулетки
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinResult, setSpinResult] = useState<Pet | null>(null)
  const [showWheel, setShowWheel] = useState(true)

  const rawInitData = useRawInitData()

  let user = null
  try {
    const urlParams = new URLSearchParams(rawInitData || '')
    const userJson = urlParams.get('user')
    if (userJson) {
      user = JSON.parse(decodeURIComponent(userJson))
    }
  } catch (e) {
    console.error('Ошибка парсинга initData', e)
  }

  const firstName = user?.first_name || ''
  // const lastName = user?.last_name || ''

  // Редкости с мемными цветами
  const rarities = [
    { name: 'кринжовый', chance: 50, color: '#808080', emoji: '😬' },
    { name: 'рофловый', chance: 25, color: '#4caf50', emoji: '😂' },
    { name: 'шизовый', chance: 15, color: '#9c27b0', emoji: '🤪' },
    { name: 'легендарный', chance: 8, color: '#f44336', emoji: '👑' },
    { name: 'биполярный', chance: 2, color: '#ff00ff', emoji: '⚡' },
  ]

  // Сезоны с их особенностями
  const seasons = [
    { 
      name: 'общага', 
      emoji: '🏢',
      bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      abilities: ['украсть печеньку', 'забить на пары'],
      catchPhrases: ['бомбит пукан', 'крашнулся', 'жиза']
    },
    { 
      name: 'мурино', 
      emoji: '🌫️',
      bgGradient: 'linear-gradient(135deg, #1e1e2f 0%, #2a2a40 100%)',
      abilities: ['раствориться в тумане', 'вызвать самосбор'],
      catchPhrases: ['выхожу из тумана', 'эщкере', 'самосбор едет']
    },
    { 
      name: 'молочное', 
      emoji: '🕷️',
      bgGradient: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
      abilities: ['напустить пауков', 'трамвайный гудок'],
      catchPhrases: ['пауки атакуют', 'трамвай не придет', 'степь зовет']
    },
    { 
      name: 'мытищи', 
      emoji: '🏭',
      bgGradient: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
      abilities: ['водяной экстрим', 'хованский зов'],
      catchPhrases: ['батискаф едет', 'слушай братан', 'по кайфу']
    },
  ]

  // Мемные имена для питомцев
  const petNames = [
    'Мелстрой', 'Туман', 'Самосбор', 'Паучок', 'Гном', 'Друн',
    'Краш', 'Шайлушай', 'Бомбила', 'Читер', 'Бабуин', 'Скуф'
  ]

  const generatePet = (): Pet => {
    let rarityRoll = Math.random() * 100
    let cumulativeChance = 0
    let rarity = rarities[0]

    for (const r of rarities) {
      cumulativeChance += r.chance
      if (rarityRoll <= cumulativeChance) {
        rarity = r
        break
      }
    }

    const season = seasons[Math.floor(Math.random() * seasons.length)]
    const name = `${rarity.name} ${season.name}-${petNames[Math.floor(Math.random() * petNames.length)]}`
    
    return { 
      name, 
      rarity: rarity.name, 
      season: season.name,
      emoji: season.emoji,
      specialAbility: season.abilities[Math.floor(Math.random() * season.abilities.length)],
      catchPhrase: season.catchPhrases[Math.floor(Math.random() * season.catchPhrases.length)],
      evolutionStage: 1,
      happiness: 100
    }
  }

  // Генерация 4х питомцев для рулетки при загрузке
  useEffect(() => {
    if (pets.length === 0) {
      const randomPets: Pet[] = []
      for (let i = 0; i < 4; i++) {
        randomPets.push(generatePet())
      }
      setPets(randomPets)
    }
  }, [])

  // Функция для рулетки
  const spinWheel = () => {
    if (isSpinning) return
    
    setIsSpinning(true)
    setSpinResult(null)
    
    // Анимация прокрутки
    const spinDuration = 2000 // 2 секунды
    const spinInterval = 50 // обновление каждые 50мс
    let spins = 0
    const maxSpins = spinDuration / spinInterval
    
    const interval = setInterval(() => {
      // Показываем случайного питомца во время прокрутки
      const randomIndex = Math.floor(Math.random() * pets.length)
      setSpinResult(pets[randomIndex])
      
      spins++
      if (spins >= maxSpins) {
        clearInterval(interval)
        // Выбираем финального питомца
        const finalIndex = Math.floor(Math.random() * pets.length)
        const finalPet = pets[finalIndex]
        setSpinResult(finalPet)
        setIsSpinning(false)
        
        // Автоматически выбираем питомца после окончания рулетки
        setTimeout(() => {
          selectPet(finalPet)
        }, 500)
      }
    }, spinInterval)
  }

  useEffect(() => {
    // Таймер падения с мемными сообщениями
    const interval = setInterval(() => {
      if (!selectedPet) return
      
      setOmaygad(prev => Math.max(0, prev - 3))
      
      if (omaygad <= 30 && omaygad > 20) {
        window.Telegram?.WebApp?.showPopup?.({ 
          message: `⚠️ ${selectedPet?.catchPhrase || 'ОМАЙГАД'}! Питомец хочет жрать! Покорми мемасами`, 
          buttons: [{ text: 'ЩА ПОКОРМЛЮ' }] 
        })
      } else if (omaygad <= 20 && omaygad > 0) {
        window.Telegram?.WebApp?.showPopup?.({ 
          message: `😱 ${selectedPet?.name} кринжует! Срочно тащи мемы!`, 
          buttons: [{ text: 'БЕГУ' }] 
        })
      } else if (omaygad <= 0) {
        window.Telegram?.WebApp?.showPopup?.({ 
          message: `💀 ${selectedPet?.name} канул в лету... Спи спокойно, бро`, 
          buttons: [{ text: 'F' }] 
        })
        setSelectedPet(null)
        setShowPetSelection(true)
        setShowWheel(true)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [omaygad, selectedPet])

  // Сохранение в cloudStorage
  useEffect(() => {
    const webApp = window.Telegram?.WebApp
    
    const saveData = () => {
      if (webApp?.cloudStorage) {
        webApp.cloudStorage.setItem('omaygad', omaygad.toString())
        webApp.cloudStorage.setItem('level', level.toString())
        webApp.cloudStorage.setItem('xp', xp.toString())
        webApp.cloudStorage.setItem('murkocoin', murkocoin.toString())
        webApp.cloudStorage.setItem('feedCount', feedCount.toString())
        if (selectedPet) {
          webApp.cloudStorage.setItem('selectedPet', JSON.stringify(selectedPet))
        }
      }
    }

    if (webApp?.cloudStorage) {
      webApp.cloudStorage.getItem('omaygad').then(value => {
        if (value) setOmaygad(parseInt(value, 10))
      })
      webApp.cloudStorage.getItem('level').then(value => {
        if (value) setLevel(parseInt(value, 10))
      })
      webApp.cloudStorage.getItem('xp').then(value => {
        if (value) setXp(parseInt(value, 10))
      })
      webApp.cloudStorage.getItem('murkocoin').then(value => {
        if (value) setMurkocoin(parseInt(value, 10))
      })
      webApp.cloudStorage.getItem('feedCount').then(value => {
        if (value) setFeedCount(parseInt(value, 10))
      })
      webApp.cloudStorage.getItem('selectedPet').then(value => {
        if (value) {
          setSelectedPet(JSON.parse(value))
          setShowPetSelection(false)
          setShowWheel(false)
        }
      })
    }

    window.addEventListener('beforeunload', saveData)
    return () => {
      saveData()
      window.removeEventListener('beforeunload', saveData)
    }
  }, [omaygad, level, xp, selectedPet, murkocoin, feedCount])

  // Ежедневные награды
  useEffect(() => {
    const webApp = window.Telegram?.WebApp
    if (webApp?.cloudStorage) {
      webApp.cloudStorage.getItem('lastReward').then(last => {
        const today = new Date().toDateString()
        if (last !== today) {
          const reward = Math.floor(Math.random() * 30) + 20
          setOmaygad(prev => Math.min(100, prev + reward))
          setMurkocoin(prev => prev + 50)
          window.Telegram?.WebApp?.showPopup?.({ 
            message: `🎁 Ежедневный рофл: +${reward} омайгадности и 50 муркокоин!`, 
            buttons: [{ text: 'ПОНЯЛ, ПРИНЯЛ' }] 
          })
          webApp.cloudStorage.setItem('lastReward', today)
        }
      })
    }
  }, [])

  const selectPet = (pet: Pet) => {
    setSelectedPet(pet)
    setShowPetSelection(false)
    setShowWheel(false)
    window.Telegram?.WebApp?.showPopup?.({ 
      message: `🎉 Выбран ${pet.name}! ${pet.catchPhrase}!`, 
      buttons: [{ text: 'ПОГНАЛИ' }] 
    })
  }

  const feedPet = () => {
    if (!selectedPet || omaygad >= 100) return
    
    const newOmaygad = Math.min(100, omaygad + 15)
    setOmaygad(newOmaygad)
    setFeedCount(prev => prev + 1)
    
    const newXp = xp + 10
    setXp(newXp)
    
    if (newXp >= level * 100) {
      setLevel(prev => prev + 1)
      window.Telegram?.WebApp?.showPopup?.({ 
        message: `⬆️ УРОВЕНЬ ПОВЫШЕН! Теперь ты ${level + 1} уровня, красава!`, 
        buttons: [{ text: 'ЩИКАРНО' }] 
      })
    }

    if (Math.random() < 0.1) {
      triggerRandomEvent()
    }
  }

  const triggerRandomEvent = () => {
    const events = [
      { msg: '🍪 Питомец украл печеньку! +5 омайгадности', effect: () => setOmaygad(prev => Math.min(100, prev + 5)) },
      { msg: '🌫️ Туман принес удачу! +20 муркокоин', effect: () => setMurkocoin(prev => prev + 20) },
      { msg: '🕷️ Пауки напугали питомца! -10 омайгадности', effect: () => setOmaygad(prev => Math.max(0, prev - 10)) },
      { msg: '🚃 Трамвай приехал! Нашел редкий мем', effect: () => {
        setMurkocoin(prev => prev + 50)
        setInventory(prev => [...prev, 'Редкий мем'])
      }},
    ]
    
    const event = events[Math.floor(Math.random() * events.length)]
    event.effect()
    window.Telegram?.WebApp?.showPopup?.({ message: event.msg, buttons: [{ text: 'OK' }] })
  }

  const useSpecialAbility = () => {
    if (!selectedPet || specialTriggered) return
    
    setSpecialTriggered(true)
    setTimeout(() => setSpecialTriggered(false), 60000)

    switch(selectedPet.season) {
      case 'общага':
        setOmaygad(prev => Math.min(100, prev + 30))
        window.Telegram?.WebApp?.showPopup?.({ message: '🍪 Украл печеньку у соседа! +30 омайгадности', buttons: [{ text: 'ВКУСНО' }] })
        break
      case 'мурино':
        setMurkocoin(prev => prev + 100)
        window.Telegram?.WebApp?.showPopup?.({ message: '🌫️ Растворился в тумане и нашел 100 муркокоин!', buttons: [{ text: 'МИСТИКА' }] })
        break
      case 'молочное':
        setLevel(prev => prev + 1)
        window.Telegram?.WebApp?.showPopup?.({ message: '🕷️ Пауки принесли новый уровень!', buttons: [{ text: 'О_О' }] })
        break
      case 'мытищи':
        setXp(prev => prev + 50)
        window.Telegram?.WebApp?.showPopup?.({ message: '💧 Водяной экстрим! +50 опыта', buttons: [{ text: 'ЭКСТРИМ' }] })
        break
    }
  }

  // Если показываем рулетку
  if (showWheel) {
    return (
      <div className="app-container wheel-container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="wheel-header"
        >
          <h1>🎰 КРУТИ РУЛЕТКУ!</h1>
          <p>Привет, {firstName}! Выбери свой первый мем-питомец</p>
        </motion.div>

        <div className="wheel-content">
          {/* Барабан рулетки */}
          <motion.div 
            className="wheel-drum"
            animate={isSpinning ? {
              rotate: [0, 360, 720, 1080, 1440],
              scale: [1, 1.2, 1.2, 1.1, 1]
            } : {}}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            <div className="wheel-display">
              {spinResult ? (
                <motion.div
                  key={spinResult.name}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="wheel-result"
                  style={{ background: rarities.find(r => r.name === spinResult.rarity)?.color + '30' }}
                >
                  <span className="wheel-emoji">{spinResult.emoji}</span>
                  <div className="wheel-name">{spinResult.name}</div>
                  <div className="wheel-rarity">{spinResult.rarity}</div>
                </motion.div>
              ) : (
                <div className="wheel-placeholder">
                  <span>❓</span>
                  <span>ЖМИ КРУТИТЬ</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Кнопка крутить */}
          <motion.button
            className="wheel-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={spinWheel}
            disabled={isSpinning}
          >
            {isSpinning ? '🎲 КРУТИТСЯ...' : '🎰 КРУТИТЬ РУЛЕТКУ'}
          </motion.button>

          {/* Превью возможных питомцев */}
          <div className="wheel-preview">
            <h3>Возможные питомцы:</h3>
            <div className="preview-grid">
              {pets.map((pet, index) => (
                <motion.div
                  key={index}
                  className="preview-item"
                  whileHover={{ scale: 1.05 }}
                  style={{ borderColor: rarities.find(r => r.name === pet.rarity)?.color }}
                >
                  <span className="preview-emoji">{pet.emoji}</span>
                  <span className="preview-name">{pet.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Основной игровой экран
  if (showPetSelection && !showWheel) {
    return (
      <div className="app-container selection-container">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          🎮 МелГотчи
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Привет, {firstName}! Выбери питомца (или крутани рулетку заново)
        </motion.p>

        <motion.button
          className="wheel-again-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setShowWheel(true)
            setSpinResult(null)
            setIsSpinning(false)
          }}
        >
          🎰 КРУТАНУТЬ РУЛЕТКУ ЕЩЕ РАЗ
        </motion.button>

        <div className="pets-grid">
          {pets.map((pet, i) => {
            const rarity = rarities.find(r => r.name === pet.rarity) || rarities[0]
            
            return (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectPet(pet)}
                className="pet-card"
                style={{
                  background: `linear-gradient(135deg, ${rarity.color}40, ${rarity.color}20)`,
                  borderColor: rarity.color
                }}
              >
                <div className="pet-emoji">{pet.emoji}</div>
                <h3 className="pet-name">{pet.name}</h3>
                <div className="pet-rarity" style={{ background: rarity.color }}>
                  {rarity.emoji} {pet.rarity}
                </div>
                <div className="pet-season">{pet.season}</div>
                <div className="pet-ability">⚡ {pet.specialAbility}</div>
                <div className="pet-phrase">"{pet.catchPhrase}"</div>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  const currentSeason = seasons.find(s => s.name === selectedPet?.season) || seasons[0]
  const currentRarity = rarities.find(r => r.name === selectedPet?.rarity) || rarities[0]

  return (
    <div 
      className="app-container game-container"
      style={{ background: currentSeason.bgGradient }}
    >
      {/* Верхняя панель */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="top-panel"
      >
        <div className="user-info">
          <span className="user-name">👤 {firstName}</span>
          <span className="user-level">Ур. {level}</span>
        </div>
        
        <div className="resources">
          <div className="resource">
            <span>💰</span>
            <span>{murkocoin}</span>
          </div>
          <div className="resource">
            <span>⚡</span>
            <span>{xp}/{level * 100}</span>
          </div>
        </div>
      </motion.div>

      {/* Основной контент */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="game-content"
      >
        <div className="pet-info">
          <div className="pet-emoji-large">{selectedPet?.emoji}</div>
          <h2 className="pet-name-large">{selectedPet?.name}</h2>
          
          <div className="pet-tags">
            <span className="rarity-tag" style={{ background: currentRarity.color }}>
              {currentRarity.emoji} {selectedPet?.rarity}
            </span>
            <span className="season-tag">
              {selectedPet?.season} {selectedPet?.emoji}
            </span>
          </div>
          
          <p className="pet-catchphrase">"{selectedPet?.catchPhrase}"</p>

          {/* Шкала омайгадности */}
          <div className="stat-bar">
            <div className="stat-label">
              <span>😎 Омайгадность</span>
              <span>{omaygad}%</span>
            </div>
            <div className="bar-container">
              <motion.div
                animate={{ width: `${omaygad}%` }}
                className="bar-fill"
                style={{ 
                  background: omaygad > 60 ? '#00ff9d' : omaygad > 30 ? '#ffd700' : '#ff4d4d'
                }}
              />
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="action-buttons">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={feedPet}
              disabled={omaygad >= 100}
              className="action-button feed-button"
            >
              🍔 Покормить (+15)
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={useSpecialAbility}
              disabled={specialTriggered}
              className="action-button ability-button"
            >
              ⚡ {selectedPet?.specialAbility} {specialTriggered ? '(КД)' : ''}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowPetSelection(true)
                setSelectedPet(null)
              }}
              className="action-button switch-button"
            >
              🔄 Сменить
            </motion.button>
          </div>

          {/* Статистика */}
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">🍽️</div>
              <div className="stat-value">{feedCount}</div>
              <div className="stat-label">Кормёжек</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">{Math.floor(feedCount / 10)}</div>
              <div className="stat-label">Комбо</div>
            </div>
          </div>

          {/* Инвентарь */}
          {inventory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inventory"
            >
              <h3>🎒 Инвентарь</h3>
              <div className="inventory-items">
                {inventory.map((item, i) => (
                  <span key={i} className="inventory-item">
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Кнопка помощи */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          window.Telegram?.WebApp?.showPopup?.({
            message: `Как играть:\n
🍔 Корми питомца мемасами, чтобы он не умер
⚡ Используй способность своего питомца
🎁 Заходи каждый день за наградой
💰 Собирай муркокоин для покупок
🌟 Прокачивай уровень и открывай новых питомцев`,
            buttons: [{ text: 'ПОНЯЛ, ПРИНЯЛ' }]
          })
        }}
        className="help-button"
      >
        ❓ Как играть?
      </motion.button>
    </div>
  )
}

export default App