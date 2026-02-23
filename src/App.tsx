import { useEffect, useState } from 'react'
import { useRawInitData } from '@tma.js/sdk-react'
import { motion } from 'framer-motion'
import './App.css'

interface Pet {
  id: number
  name: string
  rarity: string
  season: string
  emoji: string
  specialAbility: string
  catchPhrase: string
  evolutionStage: number
  happiness: number
  location: string
  count?: number // для отображения количества дубликатов
}

interface Case {
  id: string
  name: string
  description: string
  price: number
  emoji: string
  available: boolean
}

interface OwnedPet extends Pet {
  count: number
}

function App() {
  const [omaygad, setOmaygad] = useState(100)
  const [level, setLevel] = useState(1)
  const [xp, setXp] = useState(0)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [myPets, setMyPets] = useState<OwnedPet[]>([])
  const [showPetSelection, setShowPetSelection] = useState(true)
  const [feedCount, setFeedCount] = useState(0)
  const [specialTriggered, setSpecialTriggered] = useState(false)
  const [murkocoin, setMurkocoin] = useState(500)
  const [inventory, setInventory] = useState<string[]>([])
  
  // Состояния для рулетки и навигации
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinResult, setSpinResult] = useState<Pet | null>(null)
  const [showWheel, setShowWheel] = useState(true)
  const [activeTab, setActiveTab] = useState<'pets' | 'collider'>('pets')
  const [starterCaseOpened, setStarterCaseOpened] = useState(false)

  // Состояние для коллайдера
  const [selectedForCollider, setSelectedForCollider] = useState<number[]>([])

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

  // База данных питомцев из твоей таблицы
  const petsDatabase: Pet[] = [
    // Обычные (7.14% каждый)
    { id: 1, name: 'Ч', rarity: 'обычный', season: 'all', emoji: '😶', specialAbility: 'молчание', catchPhrase: 'ч', location: 'all', evolutionStage: 1, happiness: 100 },
    { id: 2, name: 'Друн', rarity: 'обычный', season: 'all', emoji: '😎', specialAbility: 'кринж', catchPhrase: 'омайгад', location: 'all', evolutionStage: 1, happiness: 100 },
    { id: 9, name: '1 курс', rarity: 'обычный', season: 'общага', emoji: '🧑‍🎓', specialAbility: 'первач', catchPhrase: 'посвятуха', location: 'общага', evolutionStage: 1, happiness: 100 },
    { id: 10, name: '2 курс', rarity: 'обычный', season: 'общага', emoji: '🧑‍🎓', specialAbility: 'старенький', catchPhrase: 'уже не первак', location: 'общага', evolutionStage: 1, happiness: 100 },
    { id: 16, name: 'Паучность', rarity: 'обычный', season: 'молочное', emoji: '🕷️', specialAbility: 'паутина', catchPhrase: 'пауки атакуют', location: 'молочное', evolutionStage: 1, happiness: 100 },
    { id: 18, name: 'Мыти', rarity: 'обычный', season: 'мытищи', emoji: '🏭', specialAbility: 'мытищский', catchPhrase: 'слушай братан', location: 'мытищи', evolutionStage: 1, happiness: 100 },
    { id: 19, name: 'Вкусность', rarity: 'обычный', season: 'all', emoji: '🍔', specialAbility: 'вкуснота', catchPhrase: 'нямка', location: 'all', evolutionStage: 1, happiness: 100 },
    
    // Редкие (5.4% каждый)
    { id: 3, name: 'Фог', rarity: 'редкий', season: 'общага-молочное', emoji: '🌫️', specialAbility: 'туман', catchPhrase: 'выхожу из тумана', location: 'общага-молочное', evolutionStage: 1, happiness: 100 },
    { id: 4, name: 'Дод', rarity: 'редкий', season: 'баня', emoji: '🛁', specialAbility: 'парилка', catchPhrase: 'жарко', location: 'баня', evolutionStage: 1, happiness: 100 },
    { id: 11, name: '3 курс', rarity: 'редкий', season: 'общага', emoji: '🧑‍🎓', specialAbility: 'опытный', catchPhrase: 'уже всё знаю', location: 'общага', evolutionStage: 1, happiness: 100 },
    { id: 15, name: 'Пакость', rarity: 'редкий', season: 'мурино', emoji: '👻', specialAbility: 'шалость', catchPhrase: 'эщкере', location: 'мурино', evolutionStage: 1, happiness: 100 },
    { id: 20, name: 'Бурмалда', rarity: 'редкий', season: 'all', emoji: '🐦', specialAbility: 'бурмалданье', catchPhrase: 'бур-бур', location: 'all', evolutionStage: 1, happiness: 100 },
    
    // Эпические (3% каждый)
    { id: 5, name: 'Прадод', rarity: 'эпический', season: 'баня', emoji: '🛁✨', specialAbility: 'суперпар', catchPhrase: 'предок в бане', location: 'баня', evolutionStage: 1, happiness: 100 },
    { id: 12, name: '4 курс', rarity: 'эпический', season: 'общага', emoji: '🧑‍🎓✨', specialAbility: 'диплом', catchPhrase: 'скоро выпуск', location: 'общага', evolutionStage: 1, happiness: 100 },
    { id: 14, name: 'Омайгадность', rarity: 'эпический', season: 'all', emoji: '😱', specialAbility: 'шок', catchPhrase: 'ОМАЙГАД', location: 'all', evolutionStage: 1, happiness: 100 },
    { id: 21, name: 'Птичка-бурмалдичка', rarity: 'эпический', season: 'мытищи', emoji: '🐦✨', specialAbility: 'поет', catchPhrase: 'ла-ла-ла', location: 'мытищи', evolutionStage: 1, happiness: 100 },
    
    // Легендарные (2% каждый)
    { id: 6, name: 'Прапрадод', rarity: 'легендарный', season: 'баня', emoji: '🛁👑', specialAbility: 'древний жар', catchPhrase: 'пращур', location: 'баня', evolutionStage: 1, happiness: 100 },
    { id: 8, name: 'Артур', rarity: 'легендарный', season: 'мытищи', emoji: '👑', specialAbility: 'король', catchPhrase: 'слушай братан', location: 'мытищи', evolutionStage: 1, happiness: 100 },
    { id: 13, name: '5 курс', rarity: 'легендарный', season: 'общага', emoji: '🧑‍🎓👑', specialAbility: 'выпускник', catchPhrase: 'диплом защитил', location: 'общага', evolutionStage: 1, happiness: 100 },
    
    // Мифические (2% каждый)
    { id: 7, name: 'Друнный коллайдер', rarity: 'мифический', season: 'мурино', emoji: '⚡', specialAbility: 'коллайдер', catchPhrase: 'энергия', location: 'мурино', evolutionStage: 1, happiness: 100 },
    { id: 22, name: 'Поез', rarity: 'мифический', season: 'мурино-молочное', emoji: '🚂', specialAbility: 'чух-чух', catchPhrase: 'трамвай едет', location: 'мурино-молочное', evolutionStage: 1, happiness: 100 },
    
    // Божественный (1%)
    { id: 17, name: 'Галактическая омайгадность', rarity: 'божественный', season: 'all', emoji: '🌌', specialAbility: 'космос', catchPhrase: 'ОМАЙГАД ВО ВСЕЛЕННОЙ', location: 'all', evolutionStage: 1, happiness: 100 },
  ]

  // Кейсы
  const cases: Case[] = [
    {
      id: 'starter',
      name: 'Начальный кейс',
      description: 'Ч, Друн, Фог, 1 курс',
      price: 0,
      emoji: '📦',
      available: !starterCaseOpened
    },
    {
      id: 'test',
      name: 'Обычный кейс',
      description: 'Случайный питомец',
      price: 100,
      emoji: '🎲',
      available: true
    }
  ]

  // Редкости для отображения
  const rarityConfig: { [key: string]: { color: string, emoji: string } } = {
    'обычный': { color: '#808080', emoji: '😬' },
    'редкий': { color: '#4caf50', emoji: '😂' },
    'эпический': { color: '#9c27b0', emoji: '🤪' },
    'легендарный': { color: '#f44336', emoji: '👑' },
    'мифический': { color: '#ff9800', emoji: '⚡' },
    'божественный': { color: '#ffeb3b', emoji: '🌌' },
  }

  // Добавление питомца в коллекцию
  const addPetToCollection = (pet: Pet) => {
    setMyPets(prev => {
      const existing = prev.find(p => p.id === pet.id)
      if (existing) {
        return prev.map(p => 
          p.id === pet.id 
            ? { ...p, count: (p.count || 1) + 1 }
            : p
        )
      } else {
        return [...prev, { ...pet, count: 1 }]
      }
    })
  }

  // Открыть кейс
  const openCase = (caseId: string) => {
    let availablePets: Pet[] = []
    
    if (caseId === 'starter') {
      if (starterCaseOpened) {
        window.Telegram?.WebApp?.showPopup?.({
          message: '😢 Начальный кейс уже открыт!',
          buttons: [{ text: 'ОК' }]
        })
        return
      }
      availablePets = petsDatabase.filter(pet => 
        [1, 2, 3, 9].includes(pet.id)
      )
    } else if (caseId === 'test') {
      availablePets = petsDatabase
    }

    if (availablePets.length === 0) return

    // Рандомный выбор питомца
    const randomIndex = Math.floor(Math.random() * availablePets.length)
    const newPet = { ...availablePets[randomIndex] }
    
    // Добавляем питомца в коллекцию
    addPetToCollection(newPet)
    
    if (caseId === 'starter') {
      setStarterCaseOpened(true)
    }

    // Показываем результат
    window.Telegram?.WebApp?.showPopup?.({
      message: `🎉 Вы получили: ${newPet.name} (${newPet.rarity})! ${newPet.catchPhrase}`,
      buttons: [{ text: 'ВАУ' }]
    })
  }

  // Функция для рулетки (начальный кейс)
  const spinWheel = () => {
    if (isSpinning) return
    
    setIsSpinning(true)
    setSpinResult(null)
    
    const spinDuration = 2000
    const spinInterval = 50
    let spins = 0
    const maxSpins = spinDuration / spinInterval
    
    const interval = setInterval(() => {
      const starterPets = petsDatabase.filter(pet => 
        [1, 2, 3, 9].includes(pet.id)
      )
      const randomIndex = Math.floor(Math.random() * starterPets.length)
      setSpinResult(starterPets[randomIndex])
      
      spins++
      if (spins >= maxSpins) {
        clearInterval(interval)
        openCase('starter')
        setIsSpinning(false)
        setShowWheel(false)
        setShowPetSelection(false)
      }
    }, spinInterval)
  }

  // Коллайдер - объединение дубликатов
  const combineInCollider = () => {
    if (selectedForCollider.length < 2) {
      window.Telegram?.WebApp?.showPopup?.({
        message: '😢 Нужно выбрать минимум 2 питомца для коллайдера!',
        buttons: [{ text: 'ОК' }]
      })
      return
    }

    // Получаем выбранных питомцев
    const selectedPets = myPets.filter(p => selectedForCollider.includes(p.id))
    
    // Проверяем, что у всех выбранных питомцев достаточно копий
    for (const pet of selectedPets) {
      const selectedCount = selectedForCollider.filter(id => id === pet.id).length
      if ((pet.count || 1) < selectedCount) {
        window.Telegram?.WebApp?.showPopup?.({
          message: `😢 У тебя только ${pet.count} ${pet.name}, а выбрано ${selectedCount}!`,
          buttons: [{ text: 'ОК' }]
        })
        return
      }
    }

    // Определяем результат коллайдера
    const rarities = selectedPets.map(p => p.rarity)
    let resultRarity = 'обычный'
    
    if (rarities.includes('божественный')) {
      resultRarity = 'божественный'
    } else if (rarities.includes('мифический')) {
      resultRarity = 'мифический'
    } else if (rarities.filter(r => r === 'легендарный').length >= 2) {
      resultRarity = 'мифический'
    } else if (rarities.includes('легендарный')) {
      resultRarity = 'легендарный'
    } else if (rarities.filter(r => r === 'эпический').length >= 2) {
      resultRarity = 'легендарный'
    } else if (rarities.includes('эпический')) {
      resultRarity = 'эпический'
    } else if (rarities.filter(r => r === 'редкий').length >= 2) {
      resultRarity = 'эпический'
    } else if (rarities.includes('редкий')) {
      resultRarity = 'редкий'
    }

    // Ищем питомца такой же редкости
    const possibleResults = petsDatabase.filter(p => p.rarity === resultRarity)
    const result = possibleResults[Math.floor(Math.random() * possibleResults.length)]

    // Удаляем использованных питомцев
    const updatedPets = [...myPets]
    selectedForCollider.forEach(id => {
      const index = updatedPets.findIndex(p => p.id === id)
      if (index !== -1) {
        if (updatedPets[index].count > 1) {
          updatedPets[index] = {
            ...updatedPets[index],
            count: updatedPets[index].count - 1
          }
        } else {
          updatedPets.splice(index, 1)
        }
      }
    })

    setMyPets(updatedPets)
    addPetToCollection(result)
    setSelectedForCollider([])

    window.Telegram?.WebApp?.showPopup?.({
      message: `⚡ Коллайдер сработал! Получен: ${result.name} (${result.rarity})!`,
      buttons: [{ text: 'УРА' }]
    })
  }

  useEffect(() => {
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
        webApp.cloudStorage.setItem('myPets', JSON.stringify(myPets))
        webApp.cloudStorage.setItem('starterCaseOpened', starterCaseOpened.toString())
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
      webApp.cloudStorage.getItem('myPets').then(value => {
        if (value) {
          setMyPets(JSON.parse(value))
        }
      })
      webApp.cloudStorage.getItem('starterCaseOpened').then(value => {
        if (value) {
          setStarterCaseOpened(value === 'true')
          setShowWheel(false)
        }
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
  }, [omaygad, level, xp, selectedPet, murkocoin, feedCount, myPets, starterCaseOpened])

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
      default:
        setOmaygad(prev => Math.min(100, prev + 20))
        window.Telegram?.WebApp?.showPopup?.({ message: '✨ Случайная способность сработала!', buttons: [{ text: 'OK' }] })
    }
  }

  // Если показываем рулетку (начальный выбор)
  if (showWheel && !starterCaseOpened) {
    const starterPets = petsDatabase.filter(pet => [1, 2, 3, 9].includes(pet.id))
    
    return (
      <div className="app-container wheel-container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="wheel-header"
        >
          <h1>🎰 НАЧАЛЬНЫЙ КЕЙС!</h1>
          <p>Привет, {firstName}! Крути и получи своего первого питомца</p>
        </motion.div>

        <div className="wheel-content">
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
                  style={{ background: rarityConfig[spinResult.rarity]?.color + '30' }}
                >
                  <span className="wheel-emoji">{spinResult.emoji}</span>
                  <div className="wheel-name">{spinResult.name}</div>
                  <div className="wheel-rarity">{spinResult.rarity}</div>
                </motion.div>
              ) : (
                <div className="wheel-placeholder">
                  <span>📦</span>
                  <span>ЖМИ КРУТИТЬ</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.button
            className="wheel-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={spinWheel}
            disabled={isSpinning}
          >
            {isSpinning ? '🎲 КРУТИТСЯ...' : '🎰 ОТКРЫТЬ КЕЙС'}
          </motion.button>

          <div className="wheel-preview">
            <h3>В этом кейсе:</h3>
            <div className="preview-grid">
              {starterPets.map((pet) => (
                <motion.div
                  key={pet.id}
                  className="preview-item"
                  whileHover={{ scale: 1.05 }}
                  style={{ borderColor: rarityConfig[pet.rarity]?.color }}
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

  // Экран коллекции и коллайдера
  if (showPetSelection) {
    return (
      <div className="app-container selection-container">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          🎮 МелГотчи
        </motion.h1>
        
        <div className="tabs">
          <motion.button
            className={`tab ${activeTab === 'pets' ? 'active' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('pets')}
          >
            🐾 Мои питомцы ({myPets.length})
          </motion.button>
          <motion.button
            className={`tab ${activeTab === 'collider' ? 'active' : ''}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('collider')}
          >
            ⚡ Коллайдер
          </motion.button>
        </div>

        {activeTab === 'pets' ? (
          <>
            <div className="case-shop">
              <h3>📦 Магазин кейсов</h3>
              <div className="cases-grid">
                {cases.map(caseItem => (
                  <motion.div
                    key={caseItem.id}
                    className={`case-card ${!caseItem.available ? 'disabled' : ''}`}
                    whileHover={caseItem.available ? { scale: 1.05 } : {}}
                    whileTap={caseItem.available ? { scale: 0.95 } : {}}
                    onClick={() => {
                      if (caseItem.available) {
                        if (caseItem.price <= murkocoin || caseItem.price === 0) {
                          openCase(caseItem.id)
                          if (caseItem.price > 0) {
                            setMurkocoin(prev => prev - caseItem.price)
                          }
                        } else {
                          window.Telegram?.WebApp?.showPopup?.({
                            message: `😢 Не хватает муркокоин! Нужно ${caseItem.price}`,
                            buttons: [{ text: 'ОК' }]
                          })
                        }
                      }
                    }}
                  >
                    <div className="case-emoji">{caseItem.emoji}</div>
                    <div className="case-info">
                      <div className="case-name">{caseItem.name}</div>
                      <div className="case-description">{caseItem.description}</div>
                      <div className="case-price">
                        {caseItem.price > 0 ? `💰 ${caseItem.price}` : '🎁 Бесплатно'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="pets-grid">
              {myPets.map((pet, i) => {
                const rarity = rarityConfig[pet.rarity] || { color: '#808080', emoji: '😬' }
                
                return (
                  <motion.div
                    key={pet.id}
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
                    {pet.count && pet.count > 1 && (
                      <div className="pet-count">×{pet.count}</div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="collider-container">
            <h3>⚡ Коллайдер питомцев</h3>
            <p className="collider-description">
              Объедини 2+ дубликата, чтобы получить питомца более высокой редкости!
            </p>

            <div className="selected-for-collider">
              <h4>Выбрано для коллайдера: {selectedForCollider.length}</h4>
              {selectedForCollider.length > 0 && (
                <motion.button
                  className="combine-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={combineInCollider}
                >
                  ⚡ ОБЪЕДИНИТЬ
                </motion.button>
              )}
            </div>

            <div className="pets-grid collider-grid">
              {myPets.filter(p => (p.count || 1) > 1).map((pet) => {
                const rarity = rarityConfig[pet.rarity] || { color: '#808080', emoji: '😬' }
                const isSelected = selectedForCollider.includes(pet.id)
                
                return (
                  <motion.div
                    key={pet.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedForCollider(prev => prev.filter(id => id !== pet.id))
                      } else {
                        setSelectedForCollider(prev => [...prev, pet.id])
                      }
                    }}
                    className={`pet-card collider-card ${isSelected ? 'selected' : ''}`}
                    style={{
                      background: `linear-gradient(135deg, ${rarity.color}40, ${rarity.color}20)`,
                      borderColor: isSelected ? '#ffd700' : rarity.color
                    }}
                  >
                    <div className="pet-emoji">{pet.emoji}</div>
                    <h3 className="pet-name">{pet.name}</h3>
                    <div className="pet-rarity" style={{ background: rarity.color }}>
                      {rarity.emoji} {pet.rarity}
                    </div>
                    <div className="pet-count">×{pet.count}</div>
                    {isSelected && <div className="selected-mark">✓</div>}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  const currentRarity = rarityConfig[selectedPet?.rarity || 'обычный']

  return (
    <div 
      className="app-container game-container"
      style={{ background: '#0a0a0a' }}
    >
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
            <span className="rarity-tag" style={{ background: currentRarity?.color }}>
              {currentRarity?.emoji} {selectedPet?.rarity}
            </span>
            <span className="season-tag">
              {selectedPet?.season} {selectedPet?.emoji}
            </span>
          </div>
          
          <p className="pet-catchphrase">"{selectedPet?.catchPhrase}"</p>

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

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          window.Telegram?.WebApp?.showPopup?.({
            message: `Как играть:\n
📦 Открывай кейсы и собирай питомцев
🍔 Корми питомца мемасами, чтобы он не умер
⚡ Используй способность своего питомца
🎁 Заходи каждый день за наградой
💰 Зарабатывай муркокоин для новых кейсов
⚡ Объединяй дубликаты в коллайдере для получения редких питомцев`,
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