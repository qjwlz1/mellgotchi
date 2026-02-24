import { useEffect, useState, useCallback, useRef } from 'react';
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
  level: number;          // уровень питомца (вида)
}

interface Case {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  available: boolean;
  petsIds?: number[];
}

type RarityKey = 'обычный' | 'редкий' | 'эпический' | 'легендарный' | 'мифический' | 'божественный';

interface RarityConfig {
  weight: number;
  color: string;
  emoji: string;
  name: string;
}

const RARITY_CONFIG: Record<RarityKey, RarityConfig> = {
  обычный: { weight: 100, color: '#808080', emoji: '😬', name: 'Обычный' },
  редкий: { weight: 50, color: '#4caf50', emoji: '😂', name: 'Редкий' },
  эпический: { weight: 30, color: '#9c27b0', emoji: '🤪', name: 'Эпический' },
  легендарный: { weight: 14, color: '#f44336', emoji: '👑', name: 'Легендарный' },
  мифический: { weight: 5, color: '#ff9800', emoji: '⚡', name: 'Мифический' },
  божественный: { weight: 1, color: '#ffeb3b', emoji: '🌌', name: 'Божественный' },
};

// ==================== БАЗА ДАННЫХ ====================

const PETS_DATABASE: Pet[] = [
  { id: 1, name: 'Ч', rarity: 'обычный', season: 'all', emoji: '😶', specialAbility: 'молчание', catchPhrase: 'ч', location: 'all', evolutionStage: 1, happiness: 100 },
  { id: 2, name: 'Друн', rarity: 'обычный', season: 'all', emoji: '😎', specialAbility: 'кринж', catchPhrase: 'омайгад', location: 'all', evolutionStage: 1, happiness: 100 },
  { id: 9, name: '1 курс', rarity: 'обычный', season: 'общага', emoji: '🧑‍🎓', specialAbility: 'первач', catchPhrase: 'посвятуха', location: 'общага', evolutionStage: 1, happiness: 100 },
  { id: 10, name: '2 курс', rarity: 'обычный', season: 'общага', emoji: '🧑‍🎓', specialAbility: 'старенький', catchPhrase: 'уже не первак', location: 'общага', evolutionStage: 1, happiness: 100 },
  { id: 16, name: 'Паучность', rarity: 'обычный', season: 'молочное', emoji: '🕷️', specialAbility: 'паутина', catchPhrase: 'пауки атакуют', location: 'молочное', evolutionStage: 1, happiness: 100 },
  { id: 18, name: 'Мыти', rarity: 'обычный', season: 'мытищи', emoji: '🏭', specialAbility: 'мытищский', catchPhrase: 'слушай братан', location: 'мытищи', evolutionStage: 1, happiness: 100 },
  { id: 19, name: 'Вкусность', rarity: 'обычный', season: 'all', emoji: '🍔', specialAbility: 'вкуснота', catchPhrase: 'нямка', location: 'all', evolutionStage: 1, happiness: 100 },
  { id: 3, name: 'Фог', rarity: 'редкий', season: 'общага-молочное', emoji: '🌫️', specialAbility: 'туман', catchPhrase: 'выхожу из тумана', location: 'общага-молочное', evolutionStage: 1, happiness: 100 },
  { id: 4, name: 'Дод', rarity: 'редкий', season: 'баня', emoji: '🛁', specialAbility: 'парилка', catchPhrase: 'жарко', location: 'баня', evolutionStage: 1, happiness: 100 },
  { id: 11, name: '3 курс', rarity: 'редкий', season: 'общага', emoji: '🧑‍🎓', specialAbility: 'опытный', catchPhrase: 'уже всё знаю', location: 'общага', evolutionStage: 1, happiness: 100 },
  { id: 15, name: 'Пакость', rarity: 'редкий', season: 'мурино', emoji: '👻', specialAbility: 'шалость', catchPhrase: 'эщкере', location: 'мурино', evolutionStage: 1, happiness: 100 },
  { id: 20, name: 'Бурмалда', rarity: 'редкий', season: 'all', emoji: '🐦', specialAbility: 'бурмалданье', catchPhrase: 'бур-бур', location: 'all', evolutionStage: 1, happiness: 100 },
  { id: 5, name: 'Прадод', rarity: 'эпический', season: 'баня', emoji: '🛁✨', specialAbility: 'суперпар', catchPhrase: 'предок в бане', location: 'баня', evolutionStage: 1, happiness: 100 },
  { id: 12, name: '4 курс', rarity: 'эпический', season: 'общага', emoji: '🧑‍🎓✨', specialAbility: 'диплом', catchPhrase: 'скоро выпуск', location: 'общага', evolutionStage: 1, happiness: 100 },
  { id: 14, name: 'Омайгадность', rarity: 'эпический', season: 'all', emoji: '😱', specialAbility: 'шок', catchPhrase: 'ОМАЙГАД', location: 'all', evolutionStage: 1, happiness: 100 },
  { id: 21, name: 'Птичка-бурмалдичка', rarity: 'эпический', season: 'мытищи', emoji: '🐦✨', specialAbility: 'поет', catchPhrase: 'ла-ла-ла', location: 'мытищи', evolutionStage: 1, happiness: 100 },
  { id: 6, name: 'Прапрадод', rarity: 'легендарный', season: 'баня', emoji: '🛁👑', specialAbility: 'древний жар', catchPhrase: 'пращур', location: 'баня', evolutionStage: 1, happiness: 100 },
  { id: 8, name: 'Артур', rarity: 'легендарный', season: 'мытищи', emoji: '👑', specialAbility: 'король', catchPhrase: 'слушай братан', location: 'мытищи', evolutionStage: 1, happiness: 100 },
  { id: 13, name: '5 курс', rarity: 'легендарный', season: 'общага', emoji: '🧑‍🎓👑', specialAbility: 'выпускник', catchPhrase: 'диплом защитил', location: 'общага', evolutionStage: 1, happiness: 100 },
  { id: 7, name: 'Друнный коллайдер', rarity: 'мифический', season: 'мурино', emoji: '⚡', specialAbility: 'коллайдер', catchPhrase: 'энергия', location: 'мурино', evolutionStage: 1, happiness: 100 },
  { id: 22, name: 'Поез', rarity: 'мифический', season: 'мурино-молочное', emoji: '🚂', specialAbility: 'чух-чух', catchPhrase: 'трамвай едет', location: 'мурино-молочное', evolutionStage: 1, happiness: 100 },
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
    petsIds: [1, 2, 3, 9],
  },
  {
    id: 'common',
    name: 'Обычный кейс',
    description: 'Случайный питомец',
    price: 100,
    emoji: '🎲',
    available: true,
  },
];

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

const getRandomRarity = (): RarityKey => {
  const totalWeight = Object.values(RARITY_CONFIG).reduce((sum, { weight }) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (const [rarity, { weight }] of Object.entries(RARITY_CONFIG)) {
    if (random < weight) return rarity as RarityKey;
    random -= weight;
  }
  return 'обычный';
};

const getRandomPetId = (pool: Pet[]): number => {
  const rarity = getRandomRarity();
  const petsOfRarity = pool.filter(p => p.rarity === rarity);
  if (petsOfRarity.length === 0) {
    return pool[Math.floor(Math.random() * pool.length)].id;
  }
  return petsOfRarity[Math.floor(Math.random() * petsOfRarity.length)].id;
};

const getPetById = (id: number): Pet | undefined => PETS_DATABASE.find(p => p.id === id);

// ==================== КОМПОНЕНТ НАВБАРА ====================

interface NavbarProps {
  currentSection: 'pet' | 'collection' | 'collider' | 'shop';
  onSectionChange: (section: 'pet' | 'collection' | 'collider' | 'shop') => void;
}

function Navbar({ currentSection, onSectionChange }: NavbarProps) {
  return (
    <div className="navbar">
      <button
        className={`nav-button ${currentSection === 'pet' ? 'active' : ''}`}
        onClick={() => onSectionChange('pet')}
      >
        🐾 Питомец
      </button>
      <button
        className={`nav-button ${currentSection === 'collection' ? 'active' : ''}`}
        onClick={() => onSectionChange('collection')}
      >
        📚 Коллекция
      </button>
      <button
        className={`nav-button ${currentSection === 'collider' ? 'active' : ''}`}
        onClick={() => onSectionChange('collider')}
      >
        ⚡ Коллайдер
      </button>
      <button
        className={`nav-button ${currentSection === 'shop' ? 'active' : ''}`}
        onClick={() => onSectionChange('shop')}
      >
        🛒 Магазин
      </button>
    </div>
  );
}

// ==================== КОМПОНЕНТ РУЛЕТКИ ====================

interface WheelScreenProps {
  onComplete: (pet: Pet) => void;
  starterCaseOpened: boolean;
}

function WheelScreen({ onComplete, starterCaseOpened }: WheelScreenProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<Pet | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);

  const spinWheel = useCallback(() => {
    if (isSpinning || starterCaseOpened) return;

    setIsSpinning(true);
    setSpinResult(null);

    const spinDuration = 2000;
    const spinInterval = 50;
    let spins = 0;
    const maxSpins = spinDuration / spinInterval;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      const starterPets = PETS_DATABASE.filter(p => [1, 2, 3, 9].includes(p.id));
      const randomIndex = Math.floor(Math.random() * starterPets.length);
      setSpinResult(starterPets[randomIndex]);

      spins++;
      if (spins >= maxSpins) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;

        const pool = PETS_DATABASE.filter(p => [1, 2, 3, 9].includes(p.id));
        const randomPetId = getRandomPetId(pool);
        const newPet = getPetById(randomPetId);
        if (newPet) {
          setSpinResult(newPet);
          onComplete(newPet);
        }
        setIsSpinning(false);
      }
    }, spinInterval);
  }, [isSpinning, starterCaseOpened, onComplete]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const starterPets = PETS_DATABASE.filter(p => [1, 2, 3, 9].includes(p.id));

  return (
    <div className="app-container wheel-container">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="wheel-header">
        <h1>🎰 НАЧАЛЬНЫЙ КЕЙС!</h1>
        <p>Крути и получи своего первого питомца</p>
      </motion.div>

      <div className="wheel-content">
        <motion.div
          className="wheel-drum"
          animate={isSpinning ? { rotate: [0, 360, 720, 1080, 1440], scale: [1, 1.2, 1.2, 1.1, 1] } : {}}
          transition={{ duration: 2, ease: 'easeOut' }}
        >
          <div className="wheel-display">
            {spinResult ? (
              <motion.div
                key={spinResult.name}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="wheel-result"
                style={{ background: `${RARITY_CONFIG[spinResult.rarity].color}30` }}
              >
                <span className="wheel-emoji">{spinResult.emoji}</span>
                <div className="wheel-name">{spinResult.name}</div>
                <div className="wheel-rarity">{RARITY_CONFIG[spinResult.rarity].name}</div>
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
            {starterPets.map(pet => (
              <motion.div
                key={pet.id}
                className="preview-item"
                whileHover={{ scale: 1.05 }}
                style={{ borderColor: RARITY_CONFIG[pet.rarity].color }}
              >
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

// ==================== КОМПОНЕНТ ЭКРАНА ПИТОМЦА ====================

interface GameScreenProps {
  pet: OwnedPet;
  omaygad: number;
  level: number;           // уровень игрока (глобальный)
  xp: number;
  murkocoin: number;
  feedCount: number;
  inventory: string[];
  specialCooldown: boolean;
  onFeed: () => void;
  onUseAbility: () => void;
  onShowHelp: () => void;
}

function GameScreen({
  pet,
  omaygad,
  level,
  xp,
  murkocoin,
  feedCount,
  inventory,
  specialCooldown,
  onFeed,
  onUseAbility,
  onShowHelp,
}: GameScreenProps) {
  const rarity = RARITY_CONFIG[pet.rarity];

  return (
    <div className="game-screen">
      <motion.div initial={{ y: -100 }} animate={{ y: 0 }} className="top-panel">
        <div className="user-info">
          <span className="user-level">Ур. {level}</span>
        </div>
        <div className="resources">
          <div className="resource">💰 {murkocoin}</div>
          <div className="resource">⚡ {xp}/{level * 100}</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="game-content"
      >
        <div className="pet-info">
          <div className="pet-emoji-large">{pet.emoji}</div>
          <h2 className="pet-name-large">{pet.name}</h2>
          <div className="pet-level">Уровень питомца: {pet.level}</div>

          <div className="pet-tags">
            <span className="rarity-tag" style={{ background: rarity.color }}>
              {rarity.emoji} {rarity.name}
            </span>
            <span className="season-tag">
              {pet.season} {pet.emoji}
            </span>
          </div>

          <p className="pet-catchphrase">"{pet.catchPhrase}"</p>

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
                  background:
                    omaygad > 60 ? '#00ff9d' : omaygad > 30 ? '#ffd700' : '#ff4d4d',
                }}
              />
            </div>
          </div>

          <div className="action-buttons">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onFeed}
              disabled={omaygad >= 100}
              className="action-button feed-button"
            >
              🍔 Покормить (+15)
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onUseAbility}
              disabled={specialCooldown}
              className="action-button ability-button"
            >
              ⚡ {pet.specialAbility} {specialCooldown ? '(КД)' : ''}
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
        onClick={onShowHelp}
        className="help-button"
      >
        ❓ Как играть?
      </motion.button>
    </div>
  );
}

// ==================== КОМПОНЕНТ КОЛЛЕКЦИИ ====================

interface CollectionScreenProps {
  myPets: OwnedPet[];
  onSelectPet: (pet: OwnedPet) => void;
}

function CollectionScreen({ myPets, onSelectPet }: CollectionScreenProps) {
  return (
    <div className="collection-screen">
      <h2>📚 Моя коллекция</h2>
      <div className="pets-grid">
        {myPets.map((pet, i) => {
          const rarity = RARITY_CONFIG[pet.rarity];
          return (
            <motion.div
              key={pet.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectPet(pet)}
              className="pet-card"
              style={{
                background: `linear-gradient(135deg, ${rarity.color}40, ${rarity.color}20)`,
                borderColor: rarity.color,
              }}
            >
              <div className="pet-emoji">{pet.emoji}</div>
              <h3 className="pet-name">{pet.name}</h3>
              <div className="pet-rarity" style={{ background: rarity.color }}>
                {rarity.emoji} {rarity.name}
              </div>
              <div className="pet-level-badge">Ур. {pet.level}</div>
              {pet.count > 1 && <div className="pet-count">×{pet.count}</div>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== КОМПОНЕНТ КОЛЛАЙДЕРА ====================

interface ColliderScreenProps {
  myPets: OwnedPet[];
  onLevelUp: (petId: number) => void;
  showPopup: (msg: string) => void;
}

function ColliderScreen({ myPets, onLevelUp, showPopup }: ColliderScreenProps) {
  // Показываем только тех, у кого count >= 2 (есть дубликаты)
  const upgradablePets = myPets.filter(p => p.count >= 2);

  return (
    <div className="collider-screen">
      <h2>⚡ Коллайдер питомцев</h2>
      <p className="collider-description">
        Объединяй 2 дубликата одного питомца, чтобы повысить его уровень!
      </p>

      {upgradablePets.length === 0 ? (
        <p className="no-pets">😢 У вас пока нет питомцев с дубликатами</p>
      ) : (
        <div className="pets-grid collider-grid">
          {upgradablePets.map(pet => {
            const rarity = RARITY_CONFIG[pet.rarity];
            return (
              <motion.div
                key={pet.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="pet-card collider-card"
                style={{
                  background: `linear-gradient(135deg, ${rarity.color}40, ${rarity.color}20)`,
                  borderColor: rarity.color,
                }}
              >
                <div className="pet-emoji">{pet.emoji}</div>
                <h3 className="pet-name">{pet.name}</h3>
                <div className="pet-rarity" style={{ background: rarity.color }}>
                  {rarity.emoji} {rarity.name}
                </div>
                <div className="pet-level">Ур. {pet.level}</div>
                <div className="pet-count">×{pet.count}</div>
                <motion.button
                  className="level-up-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (pet.count >= 2) {
                      onLevelUp(pet.id);
                    } else {
                      showPopup('😢 Недостаточно дубликатов');
                    }
                  }}
                >
                  ⬆️ Повысить уровень (2 шт.)
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==================== КОМПОНЕНТ МАГАЗИНА ====================

interface ShopScreenProps {
  onOpenCase: (caseId: string) => void;
  murkocoin: number;
  starterCaseOpened: boolean;
}

function ShopScreen({ onOpenCase, murkocoin, starterCaseOpened }: ShopScreenProps) {
  return (
    <div className="shop-screen">
      <h2>🛒 Магазин кейсов</h2>
      <div className="cases-grid">
        {CASES.map(c => {
          const isStarterOpened = c.id === 'starter' && starterCaseOpened;
          const hasMoney = c.price <= murkocoin;
          const disabled = !c.available || isStarterOpened || (c.price > 0 && !hasMoney);

          return (
            <motion.div
              key={c.id}
              className={`case-card ${disabled ? 'disabled' : ''}`}
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              onClick={() => !disabled && onOpenCase(c.id)}
            >
              <div className="case-emoji">{c.emoji}</div>
              <div className="case-info">
                <div className="case-name">{c.name}</div>
                <div className="case-description">{c.description}</div>
                <div className="case-price">
                  {c.price > 0 ? `💰 ${c.price}` : '🎁 Бесплатно'}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== ОСНОВНОЙ КОМПОНЕНТ ====================

function App() {
  const [omaygad, setOmaygad] = useState(100);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [murkocoin, setMurkocoin] = useState(500);
  const [feedCount, setFeedCount] = useState(0);
  const [inventory, setInventory] = useState<string[]>([]);
  const [myPets, setMyPets] = useState<OwnedPet[]>([]);
  const [selectedPet, setSelectedPet] = useState<OwnedPet | null>(null);
  const [starterCaseOpened, setStarterCaseOpened] = useState(false);
  const [specialCooldown, setSpecialCooldown] = useState(false);
  const [currentSection, setCurrentSection] = useState<'pet' | 'collection' | 'collider' | 'shop'>('pet');

  // ===== Вспомогательные функции =====

  const addPetToCollection = useCallback((pet: Pet) => {
    setMyPets(prev => {
      const existing = prev.find(p => p.id === pet.id);
      if (existing) {
        // уже есть такой вид – увеличиваем счётчик, уровень не меняем
        return prev.map(p => (p.id === pet.id ? { ...p, count: p.count + 1 } : p));
      }
      // новый вид – добавляем с уровнем 1
      return [...prev, { ...pet, count: 1, level: 1 }];
    });
  }, []);

  const showPopup = useCallback((message: string) => {
    if (window.Telegram?.WebApp?.showPopup) {
      window.Telegram.WebApp.showPopup({ message, buttons: [{ text: 'OK' }] });
    } else {
      alert(message);
    }
  }, []);

  const triggerRandomEvent = useCallback(() => {
    const events = [
      { msg: '🍪 Питомец украл печеньку! +5 омайгадности', effect: () => setOmaygad(prev => Math.min(100, prev + 5)) },
      { msg: '🌫️ Туман принес удачу! +20 муркокоин', effect: () => setMurkocoin(prev => prev + 20) },
      { msg: '🕷️ Пауки напугали питомца! -10 омайгадности', effect: () => setOmaygad(prev => Math.max(0, prev - 10)) },
      {
        msg: '🚃 Трамвай приехал! Нашел редкий мем',
        effect: () => {
          setMurkocoin(prev => prev + 50);
          setInventory(prev => [...prev, 'Редкий мем']);
        },
      },
    ];
    const event = events[Math.floor(Math.random() * events.length)];
    event.effect();
    showPopup(event.msg);
  }, [showPopup]);

  const openCase = useCallback(
    (caseId: string): Pet | undefined => {
      const currentCase = CASES.find(c => c.id === caseId);
      if (!currentCase) return;

      if (caseId === 'starter' && starterCaseOpened) {
        showPopup('😢 Начальный кейс уже открыт!');
        return;
      }

      if (currentCase.price > 0 && murkocoin < currentCase.price) {
        showPopup(`😢 Не хватает муркокоин! Нужно ${currentCase.price}`);
        return;
      }

      let pool = PETS_DATABASE;
      if (currentCase.petsIds) {
        pool = PETS_DATABASE.filter(p => currentCase.petsIds?.includes(p.id));
      }

      if (pool.length === 0) {
        showPopup('😢 В этом кейсе пока нет питомцев');
        return;
      }

      const randomPetId = getRandomPetId(pool);
      const newPet = getPetById(randomPetId);
      if (!newPet) return;

      addPetToCollection(newPet);

      if (currentCase.price > 0) {
        setMurkocoin(prev => prev - currentCase.price);
      }

      if (caseId === 'starter') {
        setStarterCaseOpened(true);
      }

      showPopup(`🎉 Вы получили: ${newPet.name} (${RARITY_CONFIG[newPet.rarity].name})! ${newPet.catchPhrase}`);
      return newPet;
    },
    [starterCaseOpened, murkocoin, addPetToCollection, showPopup]
  );

  const feedPet = useCallback(() => {
    if (!selectedPet || omaygad >= 100) return;

    const newOmaygad = Math.min(100, omaygad + 15);
    setOmaygad(newOmaygad);
    setFeedCount(prev => prev + 1);

    const xpGain = 10;
    const newXp = xp + xpGain;
    setXp(newXp);

    if (newXp >= level * 100) {
      const newLevel = level + 1;
      setLevel(newLevel);
      showPopup(`⬆️ УРОВЕНЬ ПОВЫШЕН! Теперь ты ${newLevel} уровня!`);
    }

    if (Math.random() < 0.1) {
      triggerRandomEvent();
    }
  }, [selectedPet, omaygad, xp, level, showPopup, triggerRandomEvent]);

  const useSpecialAbility = useCallback(() => {
    if (!selectedPet || specialCooldown) return;

    setSpecialCooldown(true);
    setTimeout(() => setSpecialCooldown(false), 60000);

    const seasons = selectedPet.season.split('-');
    let effectApplied = false;

    for (const s of seasons) {
      switch (s) {
        case 'общага':
          setOmaygad(prev => Math.min(100, prev + 30));
          showPopup('🍪 Украл печеньку у соседа! +30 омайгадности');
          effectApplied = true;
          break;
        case 'мурино':
          setMurkocoin(prev => prev + 100);
          showPopup('🌫️ Растворился в тумане и нашел 100 муркокоин!');
          effectApplied = true;
          break;
        case 'молочное':
          setXp(prev => prev + 50);
          showPopup('🕷️ Пауки принесли 50 опыта!');
          effectApplied = true;
          break;
        case 'мытищи':
          setOmaygad(prev => Math.min(100, prev + 20));
          setMurkocoin(prev => prev + 50);
          showPopup('💧 Водяной экстрим! +20 омайгадности и +50 монет');
          effectApplied = true;
          break;
        case 'баня':
          setOmaygad(prev => Math.min(100, prev + 25));
          showPopup('🛁 Жаркая баня! +25 омайгадности');
          effectApplied = true;
          break;
        default:
          break;
      }
      if (effectApplied) break;
    }

    if (!effectApplied) {
      setOmaygad(prev => Math.min(100, prev + 20));
      showPopup('✨ Случайная способность сработала!');
    }
  }, [selectedPet, specialCooldown, showPopup]);

  // Повышение уровня питомца в коллайдере
  const levelUpPet = useCallback((petId: number) => {
    setMyPets(prev => {
      const pet = prev.find(p => p.id === petId);
      if (!pet || pet.count < 2) {
        showPopup('😢 Недостаточно дубликатов для повышения уровня');
        return prev;
      }

      // Уменьшаем count на 2, повышаем level на 1
      const updated = prev.map(p => {
        if (p.id === petId) {
          return { ...p, count: p.count - 2, level: p.level + 1 };
        }
        return p;
      }).filter(p => p.count > 0); // удаляем, если count стал 0

      // Если это текущий питомец, обновляем selectedPet
      if (selectedPet && selectedPet.id === petId) {
        const updatedPet = updated.find(p => p.id === petId);
        if (updatedPet) {
          setSelectedPet(updatedPet);
        } else {
          // Если питомец удалён (count стал 0), сбрасываем выбор
          setSelectedPet(null);
          setCurrentSection('collection'); // перекидываем в коллекцию
        }
      }

      showPopup(`⬆️ Уровень питомца ${pet.name} повышен до ${pet.level + 1}!`);
      return updated;
    });
  }, [selectedPet, showPopup]);

  // ===== Эффекты =====

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
          setCurrentSection('collection');
          return 0;
        }
        return newVal;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedPet, showPopup]);

  useEffect(() => {
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
        }
        if (data.currentSection) {
          setCurrentSection(data.currentSection);
        }
      }
    } catch (e) {
      console.error('Ошибка загрузки', e);
    }
  }, []);

  useEffect(() => {
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
      currentSection,
    };
    localStorage.setItem('melgotchi-save', JSON.stringify(data));
  }, [omaygad, level, xp, murkocoin, feedCount, myPets, starterCaseOpened, selectedPet, inventory, currentSection]);

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
  }, [showPopup]);

  const handleWheelComplete = useCallback(
    (newPet: Pet) => {
      addPetToCollection(newPet);
      setStarterCaseOpened(true);
      // После рулетки автоматически выбираем полученного питомца и переходим на главную
      const owned = { ...newPet, count: 1, level: 1 };
      setSelectedPet(owned);
      setOmaygad(100);
      setCurrentSection('pet');
    },
    [addPetToCollection]
  );

  const handleSelectPet = useCallback((pet: OwnedPet) => {
    setSelectedPet(pet);
    setOmaygad(pet.happiness);
    setCurrentSection('pet');
  }, []);

  // Если нет выбранного питомца и стартовый кейс ещё не открыт, показываем рулетку
  if (!selectedPet && !starterCaseOpened) {
    return <WheelScreen onComplete={handleWheelComplete} starterCaseOpened={starterCaseOpened} />;
  }

  // Если нет выбранного питомца, но стартовый кейс открыт – возможно, все питомцы умерли или удалены
  // тогда отправляем в коллекцию выбрать нового
  if (!selectedPet && starterCaseOpened) {
    // Если есть хоть один питомец, выбираем первого
    if (myPets.length > 0) {
      const firstPet = myPets[0];
      setSelectedPet(firstPet);
      setOmaygad(firstPet.happiness);
      setCurrentSection('pet');
    } else {
      // Если питомцев вообще нет – возвращаем к рулетке? Но starterCaseOpened true, значит был, но все умерли.
      // Можно сбросить starterCaseOpened или предложить купить кейс. Пока просто покажем коллекцию пустую.
      return (
        <div className="app-container">
          <Navbar currentSection={currentSection} onSectionChange={setCurrentSection} />
          <CollectionScreen myPets={myPets} onSelectPet={handleSelectPet} />
        </div>
      );
    }
  }

  // Основной рендер с навбаром
  return (
    <div className="app-container">
      <Navbar currentSection={currentSection} onSectionChange={setCurrentSection} />
      {currentSection === 'pet' && selectedPet && (
        <GameScreen
          pet={selectedPet}
          omaygad={omaygad}
          level={level}
          xp={xp}
          murkocoin={murkocoin}
          feedCount={feedCount}
          inventory={inventory}
          specialCooldown={specialCooldown}
          onFeed={feedPet}
          onUseAbility={useSpecialAbility}
          onShowHelp={() =>
            showPopup(`Как играть:
📦 Открывай кейсы и собирай питомцев
🍔 Корми питомца мемасами, чтобы он не умер
⚡ Используй способность своего питомца
🎁 Заходи каждый день за наградой
💰 Зарабатывай муркокоин для новых кейсов
⚡ Объединяй дубликаты в коллайдере, чтобы повышать уровень питомца`)
          }
        />
      )}
      {currentSection === 'collection' && (
        <CollectionScreen myPets={myPets} onSelectPet={handleSelectPet} />
      )}
      {currentSection === 'collider' && (
        <ColliderScreen myPets={myPets} onLevelUp={levelUpPet} showPopup={showPopup} />
      )}
      {currentSection === 'shop' && (
        <ShopScreen onOpenCase={openCase} murkocoin={murkocoin} starterCaseOpened={starterCaseOpened} />
      )}
    </div>
  );
}

export default App;