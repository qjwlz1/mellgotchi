import { useEffect, useState } from "react"

type Rarity =
  | "обычный"
  | "редкий"
  | "эпический"
  | "легендарный"
  | "мифический"
  | "божественный"

interface Pet {
  id: number
  name: string
  rarity: Rarity
}

const petsDatabase: Pet[] = [
  { id: 1, name: "Мурино Бро", rarity: "обычный" },
  { id: 2, name: "Молочный Лорд", rarity: "редкий" },
  { id: 3, name: "Общажный Демон", rarity: "эпический" },
  { id: 4, name: "Мытищинский Титан", rarity: "легендарный" },
  { id: 5, name: "Сезонный Мелстрой", rarity: "мифический" },
  { id: 6, name: "Абсолют Муркокоина", rarity: "божественный" }
]

// ---------- РЕДКОСТИ ----------
const rarityWeights: Record<Rarity, number> = {
  обычный: 55,
  редкий: 25,
  эпический: 10,
  легендарный: 6,
  мифический: 3,
  божественный: 1
}

const rarityOrder: Rarity[] = [
  "обычный",
  "редкий",
  "эпический",
  "легендарный",
  "мифический",
  "божественный"
]

export default function App() {
  const [coins, setCoins] = useState(500)
  const [myPets, setMyPets] = useState<Pet[]>([])
  const [legendaryPity, setLegendaryPity] = useState(0)
  const [mythicPity, setMythicPity] = useState(0)
  const [selectedForCollider, setSelectedForCollider] = useState<number[]>([])
  const [lastDaily, setLastDaily] = useState<number>(0)

  // ---------- CLOUD SAVE ----------
  useEffect(() => {
  const tg = window.Telegram?.WebApp
  tg?.ready()

  const loadData = async () => {
    if (!tg?.cloudStorage) return

    try {
      const coinsData = await tg.cloudStorage.getItem("coins")
      const petsData = await tg.cloudStorage.getItem("pets")
      const legendaryData = await tg.cloudStorage.getItem("legendaryPity")
      const mythicData = await tg.cloudStorage.getItem("mythicPity")
      const dailyData = await tg.cloudStorage.getItem("lastDaily")

      if (coinsData) setCoins(Number(coinsData))
      if (petsData) setMyPets(JSON.parse(petsData))
      if (legendaryData) setLegendaryPity(Number(legendaryData))
      if (mythicData) setMythicPity(Number(mythicData))
      if (dailyData) setLastDaily(Number(dailyData))
    } catch (e) {
      console.error("Cloud load error", e)
    }
  }

  loadData()
}, [])

  useEffect(() => {
  const tg = window.Telegram?.WebApp
  if (!tg?.cloudStorage) return

  const saveData = async () => {
    try {
      await tg.cloudStorage.setItem("coins", String(coins))
      await tg.cloudStorage.setItem("pets", JSON.stringify(myPets))
      await tg.cloudStorage.setItem("legendaryPity", String(legendaryPity))
      await tg.cloudStorage.setItem("mythicPity", String(mythicPity))
      await tg.cloudStorage.setItem("lastDaily", String(lastDaily))
    } catch (e) {
      console.error("Cloud save error", e)
    }
  }

  saveData()
}, [coins, myPets, legendaryPity, mythicPity, lastDaily])

  // ---------- РАНДОМ РЕДКОСТИ ----------
  const getRandomRarity = (): Rarity => {
    const total = Object.values(rarityWeights).reduce((a, b) => a + b, 0)
    let random = Math.random() * total

    for (const rarity in rarityWeights) {
      random -= rarityWeights[rarity as Rarity]
      if (random <= 0) return rarity as Rarity
    }

    return "обычный"
  }

  const rollWithPity = (): Rarity => {
    if (mythicPity >= 220) {
      setMythicPity(0)
      setLegendaryPity(0)
      return "мифический"
    }

    if (legendaryPity >= 100) {
      setLegendaryPity(0)
      return "легендарный"
    }

    const rarity = getRandomRarity()

    if (rarity === "легендарный") setLegendaryPity(0)
    else setLegendaryPity(prev => prev + 1)

    if (rarity === "мифический") setMythicPity(0)
    else setMythicPity(prev => prev + 1)

    return rarity
  }

  // ---------- ОТКРЫТИЕ КЕЙСА ----------
  const openCase = () => {
    const cost = 150
    if (coins < cost) return

    setCoins(prev => prev - cost)

    const rarity = rollWithPity()
    const pool = petsDatabase.filter(p => p.rarity === rarity)
    const newPet = pool[Math.floor(Math.random() * pool.length)]

    setMyPets(prev => [...prev, newPet])
  }

  // ---------- КОЛЛАЙДЕР ----------
  const combinePets = () => {
    if (selectedForCollider.length < 2) return

    const selected = myPets.filter(p =>
      selectedForCollider.includes(p.id)
    )

    const baseRarity = selected[0].rarity
    const same = selected.every(p => p.rarity === baseRarity)
    if (!same) return

    let successChance = 0
    if (selected.length === 2) successChance = 60
    if (selected.length === 3) successChance = 85
    if (selected.length >= 4) successChance = 100

    const roll = Math.random() * 100
    let resultRarity = baseRarity

    if (roll <= successChance) {
      const index = rarityOrder.indexOf(baseRarity)
      resultRarity =
        rarityOrder[Math.min(index + 1, rarityOrder.length - 1)]
    }

    const pool = petsDatabase.filter(p => p.rarity === resultRarity)
    const result = pool[Math.floor(Math.random() * pool.length)]

    const remaining = myPets.filter(
      p => !selectedForCollider.includes(p.id)
    )

    setMyPets([...remaining, result])
    setSelectedForCollider([])
  }

  // ---------- ПАССИВНЫЙ ДОХОД ----------
  useEffect(() => {
    const incomeTable: Record<Rarity, number> = {
      обычный: 1,
      редкий: 2,
      эпический: 4,
      легендарный: 8,
      мифический: 15,
      божественный: 30
    }

    const interval = setInterval(() => {
      const income = myPets.reduce(
        (sum, pet) => sum + incomeTable[pet.rarity],
        0
      )

      setCoins(prev => prev + income)
    }, 60000)

    return () => clearInterval(interval)
  }, [myPets])

  // ---------- ЕЖЕДНЕВКА ----------
  const claimDaily = () => {
    const now = Date.now()
    const oneDay = 86400000

    if (now - lastDaily < oneDay) return

    setCoins(prev => prev + 200)
    setLastDaily(now)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>💰 Murkocoin: {coins}</h2>

      <button onClick={openCase}>Открыть кейс (150)</button>
      <button onClick={claimDaily}>Забрать ежедневку</button>
      <button onClick={combinePets}>Коллайдер</button>

      <h3>Мои питомцы:</h3>
      {myPets.map((pet, index) => (
        <div key={index}>
          <input
            type="checkbox"
            onChange={() => {
              setSelectedForCollider(prev =>
                prev.includes(pet.id)
                  ? prev.filter(id => id !== pet.id)
                  : [...prev, pet.id]
              )
            }}
          />
          {pet.name} ({pet.rarity})
        </div>
      ))}
    </div>
  )
}