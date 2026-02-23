import { useEffect, useState } from 'react'
import { useRawInitData } from '@tma.js/sdk-react'
import { motion } from 'framer-motion'

interface Pet {
  name: string
  rarity: string
  season: string
  img: string
}

function App() {
  const [omaygad, setOmaygad] = useState(100)
  const [level, setLevel] = useState(1)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [pets, setPets] = useState<Pet[]>([])

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

  const username = user?.username || user?.first_name || 'чел'
  const firstName = user?.first_name || ''
  const lastName = user?.last_name || ''

  // Редкости и сезоны
  const rarities = [
    { name: 'обычный', chance: 60, color: '#ccc' },
    { name: 'редкий', chance: 25, color: '#4caf50' },
    { name: 'эпический', chance: 10, color: '#9c27b0' },
    { name: 'легендарный', chance: 4, color: '#f44336' },
    { name: 'галактический', chance: 1, color: '#ffeb3b' },
  ]

  const seasons = ['общага', 'мурино', 'молочное', 'мытищи']

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
    const name = `${rarity.name} ${season}-Мелстрой`

    return { name, rarity: rarity.name, season, img: 'placeholder.png' }
  }

  useEffect(() => {
    if (pets.length === 0) {
      const randomPets: Pet[] = []
      for (let i = 0; i < 4; i++) {
        let pet = generatePet()
        while (rarities.findIndex(r => r.name === pet.rarity) > 1) {
          pet = generatePet()
        }
        randomPets.push(pet)
      }
      setPets(randomPets)
    }
  }, [pets.length])

  // Таймер падения
  useEffect(() => {
    const interval = setInterval(() => {
      setOmaygad(prev => Math.max(0, prev - 5))
      if (omaygad <= 20) {
        // @ts-ignore
        window.Telegram?.WebApp?.showPopup?.({ message: 'Друн голодает! Покорми скорее, иначе пиздец 😢', buttons: [{ text: 'OK' }] })
      }
      if (omaygad <= 0) {
        // @ts-ignore
        window.Telegram?.WebApp?.showPopup?.({ message: 'Омайгад, конец! Питомец умер 💀', buttons: [{ text: 'OK' }] })
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [omaygad])

  // Сохранение
  useEffect(() => {
    // @ts-ignore
    const webApp = window.Telegram?.WebApp
    if (webApp?.cloudStorage) {
      webApp.cloudStorage.getItem('omaygad').then(value => {
        if (value) setOmaygad(parseInt(value, 10))
      })
      webApp.cloudStorage.getItem('level').then(value => {
        if (value) setLevel(parseInt(value, 10))
      })
    }

    const save = () => {
      if (webApp?.cloudStorage) {
        webApp.cloudStorage.setItem('omaygad', omaygad.toString())
        webApp.cloudStorage.setItem('level', level.toString())
      }
    }

    window.addEventListener('beforeunload', save)
    return () => {
      save()
      window.removeEventListener('beforeunload', save)
    }
  }, [omaygad, level])

  // Ежедневные награды
  useEffect(() => {
    // @ts-ignore
    const webApp = window.Telegram?.WebApp
    if (webApp?.cloudStorage) {
      webApp.cloudStorage.getItem('lastReward').then(last => {
        const today = new Date().toDateString()
        if (last !== today) {
          setOmaygad(prev => Math.min(100, prev + 10))
          // @ts-ignore
          window.Telegram?.WebApp?.showPopup?.({ message: 'Ежедневная награда: +10 омайгадности!', buttons: [{ text: 'OK' }] })
          webApp.cloudStorage.setItem('lastReward', today)
        }
      })
    }
  }, [])

  const selectPet = (pet: Pet) => {
    setSelectedPet(pet)
    // @ts-ignore
    window.Telegram?.WebApp?.showPopup?.({ message: `Выбран ${pet.name}! Омайгад 😎`, buttons: [{ text: 'OK' }] })
  }

  if (!selectedPet) {
    return (
      <div style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: '20px', textAlign: 'center' }}>
        <h1>Выбери питомца!</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {pets.map((pet, i) => (
            <motion.div
              key={i}
              onClick={() => selectPet(pet)}
              whileTap={{ scale: 1.1, rotate: 5 }}
              style={{ margin: '10px', padding: '20px', background: rarities.find(r => r.name === pet.rarity)?.color || '#ccc', borderRadius: '10px', cursor: 'pointer' }}
            >
              <p>{pet.name}</p>
              <p>Редкость: {pet.rarity}</p>
              <p>Сезон: {pet.season}</p>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: '20px', textAlign: 'center' }}>
      <h1>МелГотчи 🔥</h1>
      <p>Привет, {firstName} {lastName} (@{username})! Омайгад 😈</p>
      <motion.img
        src={selectedPet.img}
        alt={selectedPet.name}
        whileTap={{ scale: 1.2, rotate: [0, 5, -5, 0] }}
        style={{ width: '150px', margin: '20px 0' }}
      />
      <p>Твой питомец: {selectedPet.name} ({selectedPet.rarity}, сезон {selectedPet.season})</p>
      <p>Уровень: {level}</p>
      <div style={{ fontSize: '4rem', color: omaygad > 30 ? '#00ff9d' : '#ff4d4d' }}>
        Омайгадность: {omaygad}%
      </div>
      <button onClick={() => setOmaygad(prev => Math.min(100, prev + 20))}>
        Покормить мемами (+20)
      </button>
    </div>
  )
}

export default App