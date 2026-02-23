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

  //const username = user?.username || user?.first_name || 'чел'
  const firstName = user?.first_name || ''
  const lastName = user?.last_name || ''

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

  useEffect(() => {
    if (pets.length === 0) {
      const randomPets: Pet[] = []
      for (let i = 0; i < 6; i++) {
        let pet = generatePet()
        randomPets.push(pet)
      }
      setPets(randomPets)
    }
  }, [])

  // Таймер падения с мемными сообщениями
  useEffect(() => {
    const interval = setInterval(() => {
      setOmaygad(prev => Math.max(0, prev - 3))
      
      if (omaygad <= 30 && omaygad > 20) {
        // @ts-ignore
        window.Telegram?.WebApp?.showPopup?.({ 
          message: `⚠️ ${selectedPet?.catchPhrase || 'ОМАЙГАД'}! Питомец хочет жрать! Покорми мемасами`, 
          buttons: [{ text: 'ЩА ПОКОРМЛЮ' }] 
        })
      } else if (omaygad <= 20 && omaygad > 0) {
        // @ts-ignore
        window.Telegram?.WebApp?.showPopup?.({ 
          message: `😱 ${selectedPet?.name} кринжует! Срочно тащи мемы!`, 
          buttons: [{ text: 'БЕГУ' }] 
        })
      } else if (omaygad <= 0) {
        // @ts-ignore
        window.Telegram?.WebApp?.showPopup?.({ 
          message: `💀 ${selectedPet?.name} канул в лету... Спи спокойно, бро`, 
          buttons: [{ text: 'F' }] 
        })
        setSelectedPet(null)
        setShowPetSelection(true)
      }
    }, 30000) // Каждые 30 секунд

    return () => clearInterval(interval)
  }, [omaygad, selectedPet])

  // Сохранение в cloudStorage
  useEffect(() => {
    // @ts-ignore
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

    // Загрузка данных
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
    // @ts-ignore
    const webApp = window.Telegram?.WebApp
    if (webApp?.cloudStorage) {
      webApp.cloudStorage.getItem('lastReward').then(last => {
        const today = new Date().toDateString()
        if (last !== today) {
          const reward = Math.floor(Math.random() * 30) + 20
          setOmaygad(prev => Math.min(100, prev + reward))
          setMurkocoin(prev => prev + 50)
          // @ts-ignore
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
    // @ts-ignore
    window.Telegram?.WebApp?.showPopup?.({ 
      message: `🎉 Выбран ${pet.name}! ${pet.catchPhrase}!`, 
      buttons: [{ text: 'ПОГНАЛИ' }] 
    })
  }

  const feedPet = () => {
    if (omaygad >= 100) return
    
    const newOmaygad = Math.min(100, omaygad + 15)
    setOmaygad(newOmaygad)
    setFeedCount(prev => prev + 1)
    
    // Добавляем опыт
    const newXp = xp + 10
    setXp(newXp)
    
    // Проверка на повышение уровня
    if (newXp >= level * 100) {
      setLevel(prev => prev + 1)
      // @ts-ignore
      window.Telegram?.WebApp?.showPopup?.({ 
        message: `⬆️ УРОВЕНЬ ПОВЫШЕН! Теперь ты ${level + 1} уровня, красава!`, 
        buttons: [{ text: 'ЩИКАРНО' }] 
      })
    }

    // Случайное событие
    if (Math.random() < 0.1) { // 10% шанс
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
    // @ts-ignore
    window.Telegram?.WebApp?.showPopup?.({ message: event.msg, buttons: [{ text: 'OK' }] })
  }

  const useSpecialAbility = () => {
    if (!selectedPet || specialTriggered) return
    
    setSpecialTriggered(true)
    setTimeout(() => setSpecialTriggered(false), 60000) // КД 1 минута

    switch(selectedPet.season) {
      case 'общага':
        setOmaygad(prev => Math.min(100, prev + 30))
        // @ts-ignore
        window.Telegram?.WebApp?.showPopup?.({ message: '🍪 Украл печеньку у соседа! +30 омайгадности', buttons: [{ text: 'ВКУСНО' }] })
        break
      case 'мурино':
        setMurkocoin(prev => prev + 100)
        // @ts-ignore
        window.Telegram?.WebApp?.showPopup?.({ message: '🌫️ Растворился в тумане и нашел 100 муркокоин!', buttons: [{ text: 'МИСТИКА' }] })
        break
      case 'молочное':
        setLevel(prev => prev + 1)
        // @ts-ignore
        window.Telegram?.WebApp?.showPopup?.({ message: '🕷️ Пауки принесли новый уровень!', buttons: [{ text: 'О_О' }] })
        break
      case 'мытищи':
        setXp(prev => prev + 50)
        // @ts-ignore
        window.Telegram?.WebApp?.showPopup?.({ message: '💧 Водяной экстрим! +50 опыта', buttons: [{ text: 'ЭКСТРИМ' }] })
        break
    }
  }

  if (showPetSelection) {
    
    return (
      <div style={{ 
        background: '#0a0a0a', 
        color: '#fff', 
        minHeight: '100vh', 
        padding: '20px', 
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ fontSize: '2.5rem', marginBottom: '10px', textShadow: '0 0 10px #00ff9d' }}
        >
          🎮 МелГотчи
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: '30px', color: '#888' }}
        >
          Привет, {firstName} {lastName}! Выбери своего питомца-мем
        </motion.p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {pets.map((pet, i) => {
            const rarity = rarities.find(r => r.name === pet.rarity) || rarities[0]
            const season = seasons.find(s => s.name === pet.season) || seasons[0]
            
            return (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectPet(pet)}
                style={{
                  background: season.bgGradient,
                  borderRadius: '20px',
                  padding: '20px',
                  cursor: 'pointer',
                  border: `2px solid ${rarity.color}`,
                  boxShadow: `0 0 20px ${rarity.color}80`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Анимированный фон */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                  }}
                  transition={{ duration: 10, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: `radial-gradient(circle, ${rarity.color}20 0%, transparent 70%)`,
                    zIndex: 0
                  }}
                />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '4rem', marginBottom: '10px' }}>{pet.emoji}</div>
                  <h3 style={{ margin: '10px 0', fontSize: '1.4rem' }}>{pet.name}</h3>
                  
                  <div style={{ 
                    display: 'inline-block',
                    background: rarity.color,
                    padding: '5px 15px',
                    borderRadius: '20px',
                    marginBottom: '10px',
                    fontWeight: 'bold'
                  }}>
                    {rarity.emoji} {pet.rarity}
                  </div>
                  
                  <p style={{ margin: '10px 0', color: '#ddd' }}>
                    Способность: {pet.specialAbility}
                  </p>
                  
                  <p style={{ 
                    fontStyle: 'italic',
                    color: '#ffd700',
                    margin: '10px 0'
                  }}>
                    "{pet.catchPhrase}"
                  </p>
                  
                  <div style={{
                    width: '100%',
                    height: '4px',
                    background: '#ffffff30',
                    borderRadius: '2px',
                    marginTop: '15px'
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(pet.rarity === 'легендарный' ? 100 : 
                                          pet.rarity === 'шизовый' ? 70 :
                                          pet.rarity === 'рофловый' ? 50 : 30)}%` }}
                      style={{
                        height: '100%',
                        background: rarity.color,
                        borderRadius: '2px'
                      }}
                    />
                  </div>
                </div>
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
    <div style={{ 
      background: currentSeason.bgGradient,
      color: '#fff', 
      minHeight: '100vh', 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Верхняя панель с ресурсами */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '15px',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          borderRadius: '30px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>👤 {firstName}</span>
          <span style={{ 
            background: '#ffd700',
            color: '#000',
            padding: '5px 15px',
            borderRadius: '20px',
            fontWeight: 'bold'
          }}>
            Ур. {level}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span>💰</span>
            <span>{murkocoin}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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
      >
        <div style={{ 
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          borderRadius: '30px',
          padding: '30px',
          marginBottom: '20px'
        }}>
          {/* Инфо о питомце */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ fontSize: '5rem' }}>{selectedPet?.emoji}</div>
            <h2 style={{ fontSize: '2rem', margin: '10px 0' }}>{selectedPet?.name}</h2>
            <div style={{ 
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <span style={{
                background: currentRarity.color,
                padding: '5px 20px',
                borderRadius: '20px',
                fontWeight: 'bold'
              }}>
                {currentRarity.emoji} {selectedPet?.rarity}
              </span>
              <span style={{
                background: '#ffffff30',
                padding: '5px 20px',
                borderRadius: '20px'
              }}>
                {selectedPet?.season} {selectedPet?.emoji}
              </span>
            </div>
            <p style={{ 
              fontSize: '1.2rem',
              marginTop: '20px',
              fontStyle: 'italic',
              color: '#ffd700'
            }}>
              "{selectedPet?.catchPhrase}"
            </p>
          </div>

          {/* Шкала омайгадности */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>😎 Омайгадность</span>
              <span>{omaygad}%</span>
            </div>
            <div style={{
              width: '100%',
              height: '20px',
              background: '#ffffff30',
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <motion.div
                animate={{ width: `${omaygad}%` }}
                style={{
                  height: '100%',
                  background: omaygad > 60 ? '#00ff9d' : omaygad > 30 ? '#ffd700' : '#ff4d4d',
                  borderRadius: '10px'
                }}
              />
            </div>
          </div>

          {/* Кнопки действий */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px',
            marginBottom: '30px'
          }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={feedPet}
              disabled={omaygad >= 100}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                padding: '15px',
                borderRadius: '15px',
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: omaygad >= 100 ? 'not-allowed' : 'pointer',
                opacity: omaygad >= 100 ? 0.5 : 1
              }}
            >
              🍔 Покормить (+15)
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={useSpecialAbility}
              disabled={specialTriggered}
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                padding: '15px',
                borderRadius: '15px',
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: specialTriggered ? 'not-allowed' : 'pointer',
                opacity: specialTriggered ? 0.5 : 1
              }}
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
              style={{
                background: 'linear-gradient(135deg, #5f2c82 0%, #49a09d 100%)',
                border: 'none',
                padding: '15px',
                borderRadius: '15px',
                color: '#fff',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🔄 Сменить питомца
            </motion.button>
          </div>

          {/* Статистика */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '15px',
            color: '#ddd'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '15px',
              borderRadius: '15px'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>🍽️</div>
              <div>Кормёжек: {feedCount}</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '15px',
              borderRadius: '15px'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>🎯</div>
              <div>Комбо: {Math.floor(feedCount / 10)}</div>
            </div>
          </div>

          {/* Инвентарь */}
          {inventory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '20px',
                padding: '15px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '15px'
              }}
            >
              <h3 style={{ marginBottom: '10px' }}>🎒 Инвентарь</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {inventory.map((item, i) => (
                  <span key={i} style={{
                    background: '#ffd700',
                    color: '#000',
                    padding: '5px 15px',
                    borderRadius: '20px',
                    fontSize: '0.9rem'
                  }}>
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
          // @ts-ignore
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
        style={{
          background: 'transparent',
          border: '2px solid #fff',
          color: '#fff',
          padding: '10px 30px',
          borderRadius: '25px',
          fontSize: '1rem',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        ❓ Как играть?
      </motion.button>
    </div>
  )
}

export default App