import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './App.css';

// ==================== ТИПЫ И КОНФИГИ ====================

interface Pet {
  id: number;
  name: string;
  rarity: RarityKey;
  season: string;
  emoji: string;
  specialAbility: string;
  catchPhrase: string;
  location: string;
  evolutionStage: number;
  happiness: number;
}

interface OwnedPet extends Pet {
  count: number;
}

interface Case {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  available: boolean;
  petsIds?: number[]; // для кейсов с конкретным набором
}

type RarityKey = 'обычный' | 'редкий' | 'эпический' | 'легендарный' | 'мифический' | 'божественный';

interface RarityConfig {
  weight: number; // шанс выпадения (чем больше, тем выше шанс)
  color: string;
  emoji: string;
  name: string;
}

// Конфиг редкостей - меняй веса под свой баланс
const RARITY_CONFIG: Record<RarityKey, RarityConfig> = {
  'обычный': { weight: 100, color: '#808080', emoji: '😬', name: 'Обычный' },
  'редкий': { weight: 50, color: '#4caf50', emoji: '😂', name: 'Редкий' },
  'эпический': { weight: 30, color: '#9c27b0', emoji: '🤪', name: 'Эпический' },
  'легендарный': { weight: 14, color: '#f44336', emoji: '👑', name: 'Легендарный' },
  'мифический': { weight: 5, color: '#ff9800', emoji: '⚡', name: 'Мифический' },
  'божественный': { weight: 1, color: '#ffeb3b', emoji: '🌌', name: 'Божественный' },
};

// ==================== БАЗА ДАННЫХ ====================

const PETS_DATABASE: Pet[] = [
  // Обычные
  { id: 1, name: 'Ч', rarity: 'обычный', season: 'all', emoji: '😶', specialAbility: 'молчание', catchPhrase: 'ч', location: 'all', evolutionStage: 1, happiness: 100 },
  { id: 2, name: 'Друн', rarity: 'обычный', season: 'all', emoji: '😎', specialAbility: 'кринж', catchPhrase: 'омайгад', location: 'all', evolutionStage: 1, happiness: 100 },
  { id: 9, name: '1 курс', rarity: 'обычный', season: 'общага', emoji: '🧑‍🎓', specialAbility: 'первач', catchPhrase: 'посвятуха', location: 'общага', evolutionStage: 1, happiness: 100 },
  { id: 10, name: '2 курс', rarity: 'обычный', season: 'общага', emoji: '🧑‍🎓', specialAbility: 'старенький', catchPhrase: 'уже не первак', location: 'общага', evolutionStage: 1, happiness: 100 },
  { id: 16, name: 'Паучность', rarity: 'обычный', season: 'молочное', emoji: '🕷️', specialAbility: 'паутина', catchPhrase: 'пауки атакуют', location: 'молочное', evolutionStage: 1, happiness: 100 },
  { id: 18, name: 'Мыти', rarity: 'обычный', season: 'мытищи', emoji: '🏭', specialAbility: 'мытищский', catchPhrase: 'слушай братан', location: 'мытищи', evolutionStage: 1, happiness: 100 },
  { id: 19, name: 'Вкусность', rarity: 'обычный', season: 'all', emoji: '🍔', specialAbility: 'вкуснота', catchPhrase: 'нямка', location: 'all', evolutionStage: 1, happiness: 100 },
  
  // Редкие
  { id: 3, name: 'Фог', rarity: 'редкий', season: 'общага-молочное', emoji: '🌫️', specialAbility: 'туман', catchPhrase: 'выхожу из тумана', location: 'общага-молочное', evolutionStage: 1, happiness: 100 },
  { id: 4, name: 'Дод', rarity: 'редкий', season: 'баня', emoji: '🛁', specialAbility: 'парилка', catchPhrase: 'жарко', location: 'баня', evolutionStage: 1, happiness: 100 },
  { id: 11, name: '3 курс', rarity: 'редкий', season: 'общага', emoji: '🧑‍🎓', specialAbility: 'опытный', catchPhrase: 'уже всё знаю', location: 'общага', evolutionStage: 1, happiness: 100 },
  { id: 15, name: 'Пакость', rarity: 'редкий', season: 'мурино', emoji: '👻', specialAbility: 'шалость', catchPhrase: 'эщкере', location: 'мурино', evolutionStage: 1, happiness: 100 },
  { id: 20, name: 'Бурмалда', rarity: 'редкий', season: 'all', emoji: '🐦', specialAbility: 'бурмалданье', catchPhrase: 'бур-бур', location: 'all', evolutionStage: 1, happiness: 100 },
  
  // Эпические
  { id: 5, name: 'Прадод', rarity: 'эпический', season: 'баня', emoji: '🛁✨', specialAbility: 'суперпар', catchPhrase: 'предок в бане', location: 'баня', evolutionStage: 1, happiness: 100 },
  { id: 12, name: '4 курс', rarity: 'эпический', season: 'общага', emoji: '🧑‍🎓✨', specialAbility: 'диплом', catchPhrase: 'скоро выпуск', location: 'общага', evolutionStage: 1, happiness: 100 },
  { id: 14, name: 'Омайгадность', rarity: 'эпический', season: 'all', emoji: '😱', specialAbility: 'шок', catchPhrase: 'ОМАЙГАД', location: 'all', evolutionStage: 1, happiness: 100 },
  { id: 21, name: 'Птичка-бурмалдичка', rarity: 'эпический', season: 'мытищи', emoji: '🐦✨', specialAbility: 'поет', catchPhrase: 'ла-ла-ла', location: 'мытищи', evolutionStage: 1, happiness: 100 },
  
  // Легендарные
  { id: 6, name: 'Прапрадод', rarity: 'легендарный', season: 'баня', emoji: '🛁👑', specialAbility: 'древний жар', catchPhrase: 'пращур', location: 'баня', evolutionStage: 1, happiness: 100 },
  { id: 8, name: 'Артур', rarity: 'легендарный', season: 'мытищи', emoji: '👑', specialAbility: 'король', catchPhrase: 'слушай братан', location: 'мытищи', evolutionStage: 1, happiness: 100 },
  { id: 13, name: '5 курс', rarity: 'легендарный', season: 'общага', emoji: '🧑‍🎓👑', specialAbility: 'выпускник', catchPhrase: 'диплом защитил', location: 'общага', evolutionStage: 1, happiness: 100 },
  
  // Мифические
  { id: 7, name: 'Друнный коллайдер', rarity: 'мифический', season: 'мурино', emoji: '⚡', specialAbility: 'коллайдер', catchPhrase: 'энергия', location: 'мурино', evolutionStage: 1, happiness: 100 },
  { id: 22, name: 'Поез', rarity: 'мифический', season: 'мурино-молочное', emoji: '🚂', specialAbility: 'чух-чух', catchPhrase: 'трамвай едет', location: 'мурино-молочное', evolutionStage: 1, happiness: 100 },
  
  // Божественные
  { id: 17, name: 'Галактическая омайгадность', rarity: 'божественный', season: 'all', emoji: '🌌', specialAbility: 'космос', catchPhrase: 'ОМАЙГАД ВО ВСЕЛЕННОЙ', location: 'all', evolutionStage: 1, happiness: 100 },
];

const CASES: Case[] = [
  {
    id: 'starter',
    name: 'Начальный кейс',
    description: 'Гарантированные Ч, Друн, Фог или 1 курс',
    price: 0,
    emoji: '📦',
    available: true,
    petsIds: [1, 2, 3, 9]
  },
  {
    id: 'common',
    name: 'Обычный кейс',
    description: 'Случайный питомец',
    price: 100,
    emoji: '🎲',
    available: true
  }
];

// ==================== ОСНОВНОЙ КОМПОНЕНТ ====================

function App() {
  // ===== Состояния =====
  const [omaygad, setOmaygad] = useState(100);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [murkocoin, setMurkocoin] = useState(500);
  const [feedCount, setFeedCount] = useState(0);
  const [inventory, setInventory] = useState<string[]>([]);

  const [myPets, setMyPets] = useState<OwnedPet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showPetSelection, setShowPetSelection] = useState(true);
  const [starterCaseOpened, setStarterCaseOpened] = useState(false);
  const [activeTab, setActiveTab] = useState<'pets' | 'collider'>('pets');
  const [selectedForCollider, setSelectedForCollider] = useState<number[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<Pet | null>(null);
  const [specialCooldown, setSpecialCooldown] = useState(false);

  // ===== Вспомогательные функции =====

  /** Получить случайную редкость на основе весов */
  const getRandomRarity = (): RarityKey => {
    const totalWeight = Object.values(RARITY_CONFIG).reduce((sum, { weight }) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (const [rarity, { weight }] of Object.entries(RARITY_CONFIG)) {
      if (random < weight) {
        return rarity as RarityKey;
      }
      random -= weight;
    }
    return 'обычный'; // fallback
  };

  /** Получить случайный ID питомца из пула */
  const getRandomPetId = (pool: Pet[]): number => {
    const rarity = getRandomRarity();
    const petsOfRarity = pool.filter(p => p.rarity === rarity);
    
    // Если в пуле нет питомцев этой редкости (например, в стартовом кейсе), берем любого из пула
    if (petsOfRarity.length === 0) {
      return pool[Math.floor(Math.random() * pool.length)].id;
    }
    
    return petsOfRarity[Math.floor(Math.random() * petsOfRarity.length)].id;
  };

  /** Найти питомца по ID */
  const getPetById = (id: number): Pet | undefined => {
    return PETS_DATABASE.find(p => p.id === id);
  };

  /** Добавить питомца в коллекцию */
  const addPetToCollection = (pet: Pet) => {
    setMyPets(prev => {
      const existing = prev.find(p => p.id === pet.id);
      if (existing) {
        return prev.map(p => 
          p.id === pet.id ? { ...p, count: p.count + 1 } : p
        );
      }
      return [...prev, { ...pet, count: 1 }];
    });
  };

  /** Удалить питомцев из коллекции (для коллайдера) */
  const removePetsFromCollection = (petIds: number[]) => {
    setMyPets(prev => {
      const newCollection = [...prev];
      petIds.forEach(id => {
        const index = newCollection.findIndex(p => p.id === id);
        if (index !== -1) {
          if (newCollection[index].count > 1) {
            newCollection[index] = { ...newCollection[index], count: newCollection[index].count - 1 };
          } else {
            newCollection.splice(index, 1);
          }
        }
      });
      return newCollection;
    });
  };

  /** Открыть кейс */
  const openCase = (caseId: string) => {
    const currentCase = CASES.find(c => c.id === caseId);
    if (!currentCase) return;

    // Проверка на начальный кейс
    if (caseId === 'starter' && starterCaseOpened) {
      showPopup('😢 Начальный кейс уже открыт!');
      return;
    }

    // Проверка на деньги
    if (currentCase.price > 0 && murkocoin < currentCase.price) {
      showPopup(`😢 Не хватает муркокоин! Нужно ${currentCase.price}`);
      return;
    }

    // Определяем пул питомцев для кейса
    let pool = PETS_DATABASE;
    if (currentCase.petsIds) {
      pool = PETS_DATABASE.filter(p => currentCase.petsIds?.includes(p.id));
    }

    if (pool.length === 0) return;

    // Получаем случайного питомца
    const randomPetId = getRandomPetId(pool);
    const newPet = getPetById(randomPetId);
    if (!newPet) return;

    // Добавляем в коллекцию
    addPetToCollection(newPet);

    // Списываем деньги
    if (currentCase.price > 0) {
      setMurkocoin(prev => prev - currentCase.price);
    }

    // Помечаем стартовый кейс как открытый
    if (caseId === 'starter') {
      setStarterCaseOpened(true);
    }

    showPopup(`🎉 Вы получили: ${newPet.name} (${RARITY_CONFIG[newPet.rarity].name})! ${newPet.catchPhrase}`);
    return newPet;
  };

  /** Показать popup (заглушка для Telegram) */
  const showPopup = (message: string) => {
    if (window.Telegram?.WebApp?.showPopup) {
      window.Telegram.WebApp.showPopup({ message, buttons: [{ text: 'OK' }] });
    } else {
      alert(message); // для тестов в браузере
    }
  };

  // ===== Обработчики событий =====

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSpinResult(null);

    const spinDuration = 2000;
    const spinInterval = 50;
    let spins = 0;
    const maxSpins = spinDuration / spinInterval;

    const interval = setInterval(() => {
      const starterPets = PETS_DATABASE.filter(p => [1, 2, 3, 9].includes(p.id));
      const randomIndex = Math.floor(Math.random() * starterPets.length);
      setSpinResult(starterPets[randomIndex]);

      spins++;
      if (spins >= maxSpins) {
        clearInterval(interval);
        const result = openCase('starter');
        if (result) {
          setSpinResult(result);
        }
        setIsSpinning(false);
        setShowPetSelection(false);
      }
    }, spinInterval);
  };

  const feedPet = () => {
    if (!selectedPet || omaygad >= 100) return;

    const newOmaygad = Math.min(100, omaygad + 15);
    setOmaygad(newOmaygad);
    setFeedCount(prev => prev + 1);

    const xpGain = 10;
    const newXp = xp + xpGain;
    setXp(newXp);

    // Повышение уровня
    if (newXp >= level * 100) {
      setLevel(prev => prev + 1);
      showPopup(`⬆️ УРОВЕНЬ ПОВЫШЕН! Теперь ты ${level + 1} уровня!`);
    }

    // Случайное событие (10%)
    if (Math.random() < 0.1) {
      triggerRandomEvent();
    }
  };

  const triggerRandomEvent = () => {
    const events = [
      { msg: '🍪 Питомец украл печеньку! +5 омайгадности', effect: () => setOmaygad(prev => Math.min(100, prev + 5)) },
      { msg: '🌫️ Туман принес удачу! +20 муркокоин', effect: () => setMurkocoin(prev => prev + 20) },
      { msg: '🕷️ Пауки напугали питомца! -10 омайгадности', effect: () => setOmaygad(prev => Math.max(0, prev - 10)) },
      { msg: '🚃 Трамвай приехал! Нашел редкий мем', effect: () => {
        setMurkocoin(prev => prev + 50);
        setInventory(prev => [...prev, 'Редкий мем']);
      }},
    ];
    const event = events[Math.floor(Math.random() * events.length)];
    event.effect();
    showPopup(event.msg);
  };

  const useSpecialAbility = () => {
    if (!selectedPet || specialCooldown) return;

    setSpecialCooldown(true);
    setTimeout(() => setSpecialCooldown(false), 60000); // КД 1 минута

    // Эффекты способностей
    switch(selectedPet.season) {
      case 'общага':
        setOmaygad(prev => Math.min(100, prev + 30));
        showPopup('🍪 Украл печеньку у соседа! +30 омайгадности');
        break;
      case 'мурино':
        setMurkocoin(prev => prev + 100);
        showPopup('🌫️ Растворился в тумане и нашел 100 муркокоин!');
        break;
      case 'молочное':
        setXp(prev => prev + 50);
        showPopup('🕷️ Пауки принесли 50 опыта!');
        break;
      case 'мытищи':
        setOmaygad(prev => Math.min(100, prev + 20));
        setMurkocoin(prev => prev + 50);
        showPopup('💧 Водяной экстрим! +20 омайгадности и +50 монет');
        break;
      default:
        setOmaygad(prev => Math.min(100, prev + 20));
        showPopup('✨ Случайная способность сработала!');
    }
  };

  const combineInCollider = () => {
    if (selectedForCollider.length < 2) {
      showPopup('😢 Нужно выбрать минимум 2 питомца для коллайдера!');
      return;
    }

    const selectedPetsData = selectedForCollider
      .map(id => myPets.find(p => p.id === id))
      .filter((p): p is OwnedPet => p !== undefined);

    // Проверка на дубли (нельзя выбрать дважды одного питомца, если у вас только 1 копия)
    const idCount = new Map<number, number>();
    selectedForCollider.forEach(id => idCount.set(id, (idCount.get(id) || 0) + 1));
    
    for (const [id, count] of idCount.entries()) {
      const pet = myPets.find(p => p.id === id);
      if (!pet || pet.count < count) {
        showPopup(`😢 У тебя только ${pet?.count || 0} ${pet?.name}, а выбрано ${count}!`);
        return;
      }
    }

    // Определяем редкость результата
    const rarities = selectedPetsData.map(p => p.rarity);
    const rarityOrder: RarityKey[] = ['обычный', 'редкий', 'эпический', 'легендарный', 'мифический', 'божественный'];
    
    // Находим максимальную редкость среди выбранных
    const maxRarityIndex = Math.max(...rarities.map(r => rarityOrder.indexOf(r)));
    
    // Повышаем редкость (но не выше божественного)
    const resultRarityIndex = Math.min(maxRarityIndex + 1, rarityOrder.length - 1);
    const resultRarity = rarityOrder[resultRarityIndex];

    // Ищем питомца этой редкости
    const possibleResults = PETS_DATABASE.filter(p => p.rarity === resultRarity);
    if (possibleResults.length === 0) {
      showPopup('😢 Не удалось найти питомца для коллайдера');
      return;
    }

    const result = possibleResults[Math.floor(Math.random() * possibleResults.length)];

    // Удаляем использованных питомцев и добавляем нового
    removePetsFromCollection(selectedForCollider);
    addPetToCollection(result);
    setSelectedForCollider([]);

    showPopup(`⚡ Коллайдер сработал! Получен: ${result.name} (${RARITY_CONFIG[result.rarity].name})!`);
  };

  // ===== Эффекты =====

  // Таймер голода
  useEffect(() => {
    if (!selectedPet) return;

    const interval = setInterval(() => {
      setOmaygad(prev => {
        const newVal = prev - 3;
        if (newVal <= 30 && newVal > 20) {
          showPopup(`⚠️ ${selectedPet.catchPhrase}! Питомец хочет жрать! Покорми мемасами`);
        } else if (newVal <= 20 && newVal > 0) {
          showPopup(`😱 ${selectedPet.name} кринжует! Срочно тащи мемы!`);
        } else if (newVal <= 0) {
          showPopup(`💀 ${selectedPet.name} канул в лету... Спи спокойно, бро`);
          setSelectedPet(null);
          setShowPetSelection(true);
          return 0;
        }
        return newVal;
      });
    }, 30000); // каждые 30 секунд

    return () => clearInterval(interval);
  }, [selectedPet]);

  // Загрузка из localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const saved = localStorage.getItem('melgotchi-save');
        if (saved) {
          const data = JSON.parse(saved);
          setOmaygad(data.omaygad ?? 100);
          setLevel(data.level ?? 1);
          setXp(data.xp ?? 0);
          setMurkocoin(data.murkocoin ?? 500);
          setFeedCount(data.feedCount ?? 0);
          setMyPets(data.myPets ?? []);
          setStarterCaseOpened(data.starterCaseOpened ?? false);
          setInventory(data.inventory ?? []);
          if (data.selectedPet) {
            setSelectedPet(data.selectedPet);
            setShowPetSelection(false);
          }
        }
      } catch (e) {
        console.error('Ошибка загрузки', e);
      }
    };
    loadData();
  }, []);

  // Сохранение в localStorage
  useEffect(() => {
    const saveData = () => {
      const data = {
        omaygad,
        level,
        xp,
        murkocoin,
        feedCount,
        myPets,
        starterCaseOpened,
        selectedPet,
        inventory,
      };
      localStorage.setItem('melgotchi-save', JSON.stringify(data));
    };

    const handleBeforeUnload = () => saveData();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      saveData();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [omaygad, level, xp, murkocoin, feedCount, myPets, starterCaseOpened, selectedPet, inventory]);

  // Ежедневная награда
  useEffect(() => {
    const lastReward = localStorage.getItem('lastRewardDate');
    const today = new Date().toDateString();

    if (lastReward !== today) {
      const omaygadBonus = Math.floor(Math.random() * 30) + 20;
      setOmaygad(prev => Math.min(100, prev + omaygadBonus));
      setMurkocoin(prev => prev + 50);
      localStorage.setItem('lastRewardDate', today);
      showPopup(`🎁 Ежедневный рофл: +${omaygadBonus} омайгадности и 50 муркокоин!`);
    }
  }, []);

  // ===== РЕНДЕР =====

  // Экран рулетки
  if (showPetSelection && !starterCaseOpened) {
    const starterPets = PETS_DATABASE.filter(p => [1, 2, 3, 9].includes(p.id));
    
    return (
      <div className="app-container wheel-container">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="wheel-header">
          <h1>🎰 НАЧАЛЬНЫЙ КЕЙС!</h1>
          <p>Крути и получи своего первого питомца</p>
        </motion.div>

        <div className="wheel-content">
          <motion.div className="wheel-drum" animate={isSpinning ? { rotate: [0, 360, 720, 1080, 1440], scale: [1, 1.2, 1.2, 1.1, 1] } : {}} transition={{ duration: 2, ease: "easeOut" }}>
            <div className="wheel-display">
              {spinResult ? (
                <motion.div key={spinResult.name} initial={{ scale: 0 }} animate={{ scale: 1 }} className="wheel-result" style={{ background: RARITY_CONFIG[spinResult.rarity]?.color + '30' }}>
                  <span className="wheel-emoji">{spinResult.emoji}</span>
                  <div className="wheel-name">{spinResult.name}</div>
                  <div className="wheel-rarity">{RARITY_CONFIG[spinResult.rarity]?.name}</div>
                </motion.div>
              ) : (
                <div className="wheel-placeholder">
                  <span>📦</span>
                  <span>ЖМИ КРУТИТЬ</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.button className="wheel-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={spinWheel} disabled={isSpinning}>
            {isSpinning ? '🎲 КРУТИТСЯ...' : '🎰 ОТКРЫТЬ КЕЙС'}
          </motion.button>

          <div className="wheel-preview">
            <h3>В этом кейсе:</h3>
            <div className="preview-grid">
              {starterPets.map(pet => (
                <motion.div key={pet.id} className="preview-item" whileHover={{ scale: 1.05 }} style={{ borderColor: RARITY_CONFIG[pet.rarity]?.color }}>
                  <span className="preview-emoji">{pet.emoji}</span>
                  <span className="preview-name">{pet.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Экран выбора питомца
  if (showPetSelection) {
    return (
      <div className="app-container selection-container">
        <motion.h1 initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>🎮 МелГотчи</motion.h1>
        
        <div className="tabs">
          <motion.button className={`tab ${activeTab === 'pets' ? 'active' : ''}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab('pets')}>
            🐾 Мои питомцы ({myPets.length})
          </motion.button>
          <motion.button className={`tab ${activeTab === 'collider' ? 'active' : ''}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab('collider')}>
            ⚡ Коллайдер
          </motion.button>
        </div>

        {activeTab === 'pets' ? (
          <>
            <div className="case-shop">
              <h3>📦 Магазин кейсов</h3>
              <div className="cases-grid">
                {CASES.map(c => (
                  <motion.div key={c.id} className={`case-card ${!c.available || (c.id === 'starter' && starterCaseOpened) ? 'disabled' : ''}`} whileHover={c.available && !(c.id === 'starter' && starterCaseOpened) ? { scale: 1.05 } : {}} whileTap={c.available && !(c.id === 'starter' && starterCaseOpened) ? { scale: 0.95 } : {}} onClick={() => {
                    if (c.available && !(c.id === 'starter' && starterCaseOpened)) {
                      openCase(c.id);
                    }
                  }}>
                    <div className="case-emoji">{c.emoji}</div>
                    <div className="case-info">
                      <div className="case-name">{c.name}</div>
                      <div className="case-description">{c.description}</div>
                      <div className="case-price">{c.price > 0 ? `💰 ${c.price}` : '🎁 Бесплатно'}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="pets-grid">
              {myPets.map((pet, i) => {
                const rarity = RARITY_CONFIG[pet.rarity];
                return (
                  <motion.div key={pet.id} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => {
                    setSelectedPet(pet);
                    setShowPetSelection(false);
                  }} className="pet-card" style={{ background: `linear-gradient(135deg, ${rarity.color}40, ${rarity.color}20)`, borderColor: rarity.color }}>
                    <div className="pet-emoji">{pet.emoji}</div>
                    <h3 className="pet-name">{pet.name}</h3>
                    <div className="pet-rarity" style={{ background: rarity.color }}>{rarity.emoji} {rarity.name}</div>
                    {pet.count > 1 && <div className="pet-count">×{pet.count}</div>}
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="collider-container">
            <h3>⚡ Коллайдер питомцев</h3>
            <p className="collider-description">Объедини 2+ дубликата, чтобы получить питомца более высокой редкости!</p>

            <div className="selected-for-collider">
              <h4>Выбрано для коллайдера: {selectedForCollider.length}</h4>
              {selectedForCollider.length > 0 && (
                <motion.button className="combine-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={combineInCollider}>
                  ⚡ ОБЪЕДИНИТЬ
                </motion.button>
              )}
            </div>

            <div className="pets-grid collider-grid">
              {myPets.filter(p => p.count > 1).map(pet => {
                const rarity = RARITY_CONFIG[pet.rarity];
                const isSelected = selectedForCollider.includes(pet.id);
                return (
                  <motion.div key={pet.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => {
                    if (isSelected) {
                      setSelectedForCollider(prev => prev.filter(id => id !== pet.id));
                    } else {
                      setSelectedForCollider(prev => [...prev, pet.id]);
                    }
                  }} className={`pet-card collider-card ${isSelected ? 'selected' : ''}`} style={{ background: `linear-gradient(135deg, ${rarity.color}40, ${rarity.color}20)`, borderColor: isSelected ? '#ffd700' : rarity.color }}>
                    <div className="pet-emoji">{pet.emoji}</div>
                    <h3 className="pet-name">{pet.name}</h3>
                    <div className="pet-rarity" style={{ background: rarity.color }}>{rarity.emoji} {rarity.name}</div>
                    <div className="pet-count">×{pet.count}</div>
                    {isSelected && <div className="selected-mark">✓</div>}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Основной игровой экран
  if (!selectedPet) return null;
  const currentRarity = RARITY_CONFIG[selectedPet.rarity];

  return (
    <div className="app-container game-container" style={{ background: '#0a0a0a' }}>
      <motion.div initial={{ y: -100 }} animate={{ y: 0 }} className="top-panel">
        <div className="user-info">
          <span className="user-level">Ур. {level}</span>
        </div>
        <div className="resources">
          <div className="resource">💰 {murkocoin}</div>
          <div className="resource">⚡ {xp}/{level * 100}</div>
        </div>
      </motion.div>

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }} className="game-content">
        <div className="pet-info">
          <div className="pet-emoji-large">{selectedPet.emoji}</div>
          <h2 className="pet-name-large">{selectedPet.name}</h2>
          
          <div className="pet-tags">
            <span className="rarity-tag" style={{ background: currentRarity.color }}>
              {currentRarity.emoji} {currentRarity.name}
            </span>
            <span className="season-tag">{selectedPet.season} {selectedPet.emoji}</span>
          </div>
          
          <p className="pet-catchphrase">"{selectedPet.catchPhrase}"</p>

          <div className="stat-bar">
            <div className="stat-label"><span>😎 Омайгадность</span><span>{omaygad}%</span></div>
            <div className="bar-container">
              <motion.div animate={{ width: `${omaygad}%` }} className="bar-fill" style={{ background: omaygad > 60 ? '#00ff9d' : omaygad > 30 ? '#ffd700' : '#ff4d4d' }} />
            </div>
          </div>

          <div className="action-buttons">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={feedPet} disabled={omaygad >= 100} className="action-button feed-button">
              🍔 Покормить (+15)
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={useSpecialAbility} disabled={specialCooldown} className="action-button ability-button">
              ⚡ {selectedPet.specialAbility} {specialCooldown ? '(КД)' : ''}
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => {
              setShowPetSelection(true);
              setSelectedPet(null);
            }} className="action-button switch-button">
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inventory">
              <h3>🎒 Инвентарь</h3>
              <div className="inventory-items">
                {inventory.map((item, i) => <span key={i} className="inventory-item">{item}</span>)}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => showPopup(`Как играть:
📦 Открывай кейсы и собирай питомцев
🍔 Корми питомца мемасами, чтобы он не умер
⚡ Используй способность своего питомца
🎁 Заходи каждый день за наградой
💰 Зарабатывай муркокоин для новых кейсов
⚡ Объединяй дубликаты в коллайдере`)} className="help-button">
        ❓ Как играть?
      </motion.button>
    </div>
  );
}

export default App;