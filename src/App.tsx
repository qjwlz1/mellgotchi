import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// ==================== ТИПЫ ====================
interface Pet {
  id: number;
  name: string;
  rarity: 'обычный' | 'редкий' | 'эпический' | 'легендарный' | 'мифический' | 'божественный';
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
  level: number;
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

interface RarityConfig {
  weight: number;
  color: string;
  emoji: string;
  name: string;
}

const RARITY_CONFIG: Record<Pet['rarity'], RarityConfig> = {
  обычный: { weight: 100, color: '#808080', emoji: '😬', name: 'Обычный' },
  редкий: { weight: 50, color: '#4caf50', emoji: '😂', name: 'Редкий' },
  эпический: { weight: 30, color: '#9c27b0', emoji: '🤪', name: 'Эпический' },
  легендарный: { weight: 14, color: '#f44336', emoji: '👑', name: 'Легендарный' },
  мифический: { weight: 5, color: '#ff9800', emoji: '⚡', name: 'Мифический' },
  божественный: { weight: 1, color: '#ffeb3b', emoji: '🌌', name: 'Божественный' },
};

// ==================== ДАННЫЕ ====================
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
    description: 'Случайный питомец из всех',
    price: 100,
    emoji: '🎲',
    available: true,
  },
];

// ==================== TOAST ====================
interface ToastMessage {
  id: number;
  text: string;
}

function ToastContainer({ toasts, removeToast }: { toasts: ToastMessage[]; removeToast: (id: number) => void }) {
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="toast"
            onClick={() => removeToast(toast.id)}
          >
            {toast.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ==================== DROP NOTIFICATION ====================
interface DropNotificationProps {
  pet: Pet | null;
  onClose: () => void;
}

function DropNotification({ pet, onClose }: DropNotificationProps) {
  useEffect(() => {
    if (!pet) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [pet, onClose]);

  if (!pet) return null;

  const rarity = RARITY_CONFIG[pet.rarity];

  return (
    <motion.div
      className="drop-notification-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="drop-notification"
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0.4 }}
      >
        <div className="drop-emoji">{pet.emoji}</div>
        <div className="drop-name">{pet.name}</div>
        <div className="drop-rarity" style={{ background: rarity.color }}>
          {rarity.emoji} {rarity.name}
        </div>
        <div className="drop-phrase">"{pet.catchPhrase}"</div>
        <div className="drop-close">Нажмите, чтобы закрыть</div>
      </motion.div>
    </motion.div>
  );
}

// ==================== CASE OPENING ANIMATION ====================
interface CaseOpeningAnimationProps {
  pool: Pet[];
  onComplete: (pet: Pet) => void;
  onClose: () => void;
}

function CaseOpeningAnimation({ pool, onComplete, onClose }: CaseOpeningAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<Pet[]>([]);
  const [offset, setOffset] = useState(0);
  const [isSpinning, setIsSpinning] = useState(true);
  const animationRef = useRef<number | null>(null);
  const finalPetRef = useRef<Pet | null>(null);
  const completedRef = useRef(false);

  // Генерация ленты + выбор финального (один раз)
  useEffect(() => {
    const finalPet = pool[Math.floor(Math.random() * pool.length)];
    finalPetRef.current = finalPet;

    const repeatCount = 8; // больше повторений = плавнее
    const generated: Pet[] = [];
    for (let i = 0; i < repeatCount; i++) {
      generated.push(...pool);
    }

    // Финальный строго в центре (индекс должен быть чётко посередине)
    const middleIndex = Math.floor(generated.length / 2);
    generated[middleIndex] = finalPet;

    setItems(generated);
  }, [pool]);

  // Анимация + точная остановка
  useEffect(() => {
    if (!containerRef.current || !trackRef.current || items.length === 0) return;

    const containerWidth = containerRef.current.clientWidth;
    const itemWidth = 80 + 20; // ширина item + gap
    const middleIndex = Math.floor(items.length / 2);
    const targetOffset = middleIndex * itemWidth - (containerWidth / 2 - itemWidth / 2);

    const startOffset = targetOffset + containerWidth * 3; // больше расстояния = дольше крутится
    const duration = 3000; // 3 секунды

    let startTime: number | null = null;

    const animate = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4); // более резкий стоп

      const currentOffset = startOffset - (startOffset - targetOffset) * easeOut;
      setOffset(currentOffset);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Точная остановка на пиксельном уровне
        setOffset(targetOffset);
        setIsSpinning(false);

        if (!completedRef.current && finalPetRef.current) {
          completedRef.current = true;
          onComplete(finalPetRef.current);
        }

        // Автозакрытие через 1.5 сек после полной остановки
        setTimeout(() => onClose(), 1500);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [items, onComplete, onClose]);

  return (
    <motion.div
      className="case-opening-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => !isSpinning && onClose()}
    >
      <motion.div
        className="case-opening-content"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.3 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="case-opening-header">🎲 Открытие кейса...</div>

        <div className="case-opening-carousel" ref={containerRef}>
          <div ref={trackRef} className="case-opening-track" style={{ transform: `translateX(-${offset}px)` }}>
            {items.map((pet, idx) => (
              <motion.div
                key={`${pet.id}-${idx}`}
                className="case-opening-item"
                style={{
                  borderColor: RARITY_CONFIG[pet.rarity].color,
                  boxShadow: !isSpinning && pet.id === finalPetRef.current?.id ? '0 0 30px gold' : 'none',
                }}
                animate={
                  !isSpinning && pet.id === finalPetRef.current?.id
                    ? { scale: [1, 1.3, 1], rotate: [0, 5, -5, 0] }
                    : {}
                }
                transition={{ duration: 0.6 }}
              >
                <div>{pet.emoji}</div>
                <span>{pet.name}</span>
              </motion.div>
            ))}
          </div>
          <div className="case-opening-center" />
        </div>

        {isSpinning ? (
          <div className="case-opening-hint">Крутится...</div>
        ) : (
          <div className="case-opening-hint">✓ Выпал: {finalPetRef.current?.name}! Закрытие через 1.5 сек</div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ==================== НАВБАР ====================
function Navbar({ currentSection, onSectionChange }: {
  currentSection: 'pet' | 'collection' | 'collider' | 'shop';
  onSectionChange: (section: 'pet' | 'collection' | 'collider' | 'shop') => void;
}) {
  return (
    <div className="navbar">
      <button className={`nav-button ${currentSection === 'pet' ? 'active' : ''}`} onClick={() => onSectionChange('pet')}>
        🐾 Питомец
      </button>
      <button className={`nav-button ${currentSection === 'collection' ? 'active' : ''}`} onClick={() => onSectionChange('collection')}>
        📚 Коллекция
      </button>
      <button className={`nav-button ${currentSection === 'collider' ? 'active' : ''}`} onClick={() => onSectionChange('collider')}>
        ⚡ Коллайдер
      </button>
      <button className={`nav-button ${currentSection === 'shop' ? 'active' : ''}`} onClick={() => onSectionChange('shop')}>
        🛒 Магазин
      </button>
    </div>
  );
}

// ==================== WHEEL SCREEN (для начального кейса) ====================
function WheelScreen({ onComplete, starterCaseOpened, showDropNotification }: {
  onComplete: (pet: Pet) => void;
  starterCaseOpened: boolean;
  showDropNotification: (pet: Pet) => void;
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayPet, setDisplayPet] = useState<Pet | null>(null);
  const finalPetRef = useRef<Pet | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);

  const pool = PETS_DATABASE.filter(p => [1, 2, 3, 9].includes(p.id));

  const spinWheel = useCallback(() => {
    if (isSpinning || starterCaseOpened) return;

    const finalPet = pool[Math.floor(Math.random() * pool.length)];
    finalPetRef.current = finalPet;
    console.log('[Wheel] Выпал:', finalPet.name);

    setIsSpinning(true);
    setDisplayPet(null);

    const duration = 2500;
    const intervalMs = 60;
    let elapsed = 0;

    intervalRef.current = window.setInterval(() => {
      elapsed += intervalMs;

      const randomIndex = Math.floor(Math.random() * pool.length);
      setDisplayPet(pool[randomIndex]);

      if (elapsed >= duration) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;

        setDisplayPet(finalPetRef.current);
        setIsSpinning(false);

        setTimeout(() => {
          if (finalPetRef.current) {
            onComplete(finalPetRef.current);
            showDropNotification(finalPetRef.current);
          }
        }, 800);
      }
    }, intervalMs);
  }, [isSpinning, starterCaseOpened, onComplete, showDropNotification, pool]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="app-container wheel-container">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="wheel-header">
        <h1>🎰 НАЧАЛЬНЫЙ КЕЙС!</h1>
        <p>Крути и получи своего первого питомца</p>
      </motion.div>

      <div className="wheel-content">
        <motion.div
          className="wheel-drum"
          animate={isSpinning ? { rotate: [0, 360 * 4], scale: [1, 1.05, 1, 1.03, 1] } : {}}
          transition={{ duration: 2.5, ease: 'easeOut' }}
        >
          <div className="wheel-display">
            <AnimatePresence mode="wait">
              {displayPet ? (
                <motion.div
                  key={displayPet.id + (isSpinning ? '-spin' : '-final')}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.25, type: 'spring', stiffness: 300 }}
                  className="wheel-result"
                  style={{
                    background: `${RARITY_CONFIG[displayPet.rarity].color}30`,
                    border: isSpinning ? 'none' : `2px solid ${RARITY_CONFIG[displayPet.rarity].color}`,
                  }}
                >
                  <span className="wheel-emoji">{displayPet.emoji}</span>
                  <div className="wheel-name">{displayPet.name}</div>
                  <div className="wheel-rarity">{RARITY_CONFIG[displayPet.rarity].name}</div>
                </motion.div>
              ) : (
                <div className="wheel-placeholder">
                  <span>📦</span>
                  <span>ЖМИ КРУТИТЬ</span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.button
          className="wheel-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={spinWheel}
          disabled={isSpinning || starterCaseOpened}
        >
          {isSpinning ? '🎲 КРУТИТСЯ...' : '🎰 ОТКРЫТЬ КЕЙС'}
        </motion.button>
      </div>
    </div>
  );
}

// ==================== GAME SCREEN ====================
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
}: {
  pet: OwnedPet;
  omaygad: number;
  level: number;
  xp: number;
  murkocoin: number;
  feedCount: number;
  inventory: string[];
  specialCooldown: boolean;
  onFeed: () => void;
  onUseAbility: () => void;
  onShowHelp: () => void;
}) {
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

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }} className="game-content">
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
                  background: omaygad > 60 ? '#00ff9d' : omaygad > 30 ? '#ffd700' : '#ff4d4d',
                }}
              />
            </div>
          </div>

          <div className="action-buttons">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onFeed} disabled={omaygad >= 100} className="action-button feed-button">
              🍔 Покормить (+15)
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onUseAbility} disabled={specialCooldown} className="action-button ability-button">
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inventory">
              <h3>🎒 Инвентарь</h3>
              <div className="inventory-items">
                {inventory.map((item, i) => (
                  <span key={i} className="inventory-item">{item}</span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onShowHelp} className="help-button">
        ❓ Как играть?
      </motion.button>
    </div>
  );
}

// ==================== COLLECTION ====================
function CollectionScreen({ myPets, onSelectPet }: {
  myPets: OwnedPet[];
  onSelectPet: (pet: OwnedPet) => void;
}) {
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

// ==================== COLLIDER ====================
function ColliderScreen({ myPets, onLevelUp, addToast }: {
  myPets: OwnedPet[];
  onLevelUp: (petId: number) => void;
  addToast: (msg: string) => void;
}) {
  const upgradablePets = myPets.filter(p => p.count >= 2);

  return (
    <div className="collider-screen">
      <h2>⚡ Коллайдер питомцев</h2>
      <p className="collider-description">Объединяй 2 дубликата одного питомца, чтобы повысить его уровень!</p>

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
                    if (pet.count >= 2) onLevelUp(pet.id);
                    else addToast('😢 Недостаточно дубликатов');
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

// ==================== SHOP ====================
function ShopScreen({ onStartOpening, starterCaseOpened, addToast }: {
  onStartOpening: (pool: Pet[], caseId: string) => void;
  starterCaseOpened: boolean;
  addToast: (msg: string) => void;
}) {
  return (
    <div className="shop-screen">
      <h2>🛒 Магазин кейсов</h2>
      <div className="cases-grid">
        {CASES.map(c => {
          const isStarterOpened = c.id === 'starter' && starterCaseOpened;
          const disabled = !c.available || isStarterOpened;

          let pool = PETS_DATABASE;
          if (c.petsIds) {
            pool = PETS_DATABASE.filter(p => c.petsIds?.includes(p.id));
          }

          return (
            <motion.div
              key={c.id}
              className={`case-card ${disabled ? 'disabled' : ''}`}
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              onClick={() => {
                if (disabled) {
                  if (isStarterOpened) addToast('😢 Начальный кейс уже открыт');
                  else addToast('😢 Этот кейс недоступен');
                  return;
                }
                onStartOpening(pool, c.id);
              }}
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

// ==================== APP ====================
function App() {
  const [omaygad, setOmaygad] = useState(100);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [murkocoin, setMurkocoin] = useState(999999);
  const [feedCount, setFeedCount] = useState(0);
  const [inventory, setInventory] = useState<string[]>([]);
  const [myPets, setMyPets] = useState<OwnedPet[]>([]);
  const [selectedPet, setSelectedPet] = useState<OwnedPet | null>(null);
  const [starterCaseOpened, setStarterCaseOpened] = useState(false);
  const [specialCooldown, setSpecialCooldown] = useState(false);
  const [currentSection, setCurrentSection] = useState<'pet' | 'collection' | 'collider' | 'shop'>('pet');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [droppedPet, setDroppedPet] = useState<Pet | null>(null);
  const [openingCase, setOpeningCase] = useState<{ pool: Pet[]; caseId: string } | null>(null);

  const nextToastId = useRef(0);

  const addToast = useCallback((text: string) => {
    const id = nextToastId.current++;
    setToasts(prev => [...prev, { id, text }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showDropNotification = useCallback((pet: Pet) => {
    setDroppedPet(pet);
  }, []);

  const addPetToCollection = useCallback((pet: Pet) => {
    setMyPets(prev => {
      const existing = prev.find(p => p.id === pet.id);
      if (existing) {
        return prev.map(p => p.id === pet.id ? { ...p, count: p.count + 1 } : p);
      }
      return [...prev, { ...pet, count: 1, level: 1 }];
    });
  }, []);

  const handleCaseOpenComplete = useCallback((pet: Pet, caseId: string) => {
    addPetToCollection(pet);
    showDropNotification(pet);
    if (caseId === 'starter') setStarterCaseOpened(true);
  }, [addPetToCollection, showDropNotification]);

  const feedPet = useCallback(() => {
    if (!selectedPet || omaygad >= 100) return;
    const newOmaygad = Math.min(100, omaygad + 15);
    setOmaygad(newOmaygad);
    setFeedCount(prev => prev + 1);
    const xpGain = 10;
    const newXp = xp + xpGain;
    setXp(newXp);
    if (newXp >= level * 100) {
      setLevel(level + 1);
      addToast(`⬆️ УРОВЕНЬ ПОВЫШЕН! Теперь ты ${level + 1} уровня!`);
    }
  }, [selectedPet, omaygad, xp, level, addToast]);

  const useSpecialAbility = useCallback(() => {
    if (!selectedPet || specialCooldown) return;
    setSpecialCooldown(true);
    setTimeout(() => setSpecialCooldown(false), 60000);
    // ... остальной код способности без изменений
  }, [selectedPet, specialCooldown, addToast]);

  const levelUpPet = useCallback((petId: number) => {
    setMyPets(prev => {
      const pet = prev.find(p => p.id === petId);
      if (!pet || pet.count < 2) return prev;
      const updated = prev.map(p => p.id === petId ? { ...p, count: p.count - 1, level: p.level + 1 } : p);
      if (selectedPet?.id === petId) {
        const updatedPet = updated.find(p => p.id === petId);
        if (updatedPet) setSelectedPet(updatedPet);
      }
      addToast(`⬆️ Уровень ${pet.name} повышен!`);
      return updated;
    });
  }, [selectedPet, addToast]);

  useEffect(() => {
    if (!selectedPet) return;
    const interval = setInterval(() => {
      setOmaygad(prev => {
        const newVal = prev - 3;
        if (newVal <= 30 && newVal > 20) addToast(`⚠️ ${selectedPet.catchPhrase}! Питомец хочет жрать!`);
        if (newVal <= 20 && newVal > 0) addToast(`😱 ${selectedPet.name} кринжует!`);
        if (newVal <= 0) {
          addToast(`💀 ${selectedPet.name} умер...`);
          setSelectedPet(null);
          setCurrentSection('collection');
          return 0;
        }
        return newVal;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedPet, addToast]);

  useEffect(() => {
    const saved = localStorage.getItem('melgotchi-save');
    if (saved) {
      const data = JSON.parse(saved);
      setOmaygad(data.omaygad ?? 100);
      setLevel(data.level ?? 1);
      setXp(data.xp ?? 0);
      setFeedCount(data.feedCount ?? 0);
      setMyPets(data.myPets ?? []);
      setStarterCaseOpened(data.starterCaseOpened ?? false);
      setInventory(data.inventory ?? []);
      if (data.selectedPet) setSelectedPet(data.selectedPet);
      if (data.currentSection) setCurrentSection(data.currentSection);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('melgotchi-save', JSON.stringify({
      omaygad, level, xp, murkocoin, feedCount, myPets, starterCaseOpened, selectedPet, inventory, currentSection
    }));
  }, [omaygad, level, xp, murkocoin, feedCount, myPets, starterCaseOpened, selectedPet, inventory, currentSection]);

  useEffect(() => {
    const lastReward = localStorage.getItem('lastRewardDate');
    const today = new Date().toDateString();
    if (lastReward !== today) {
      const bonus = Math.floor(Math.random() * 30) + 20;
      setOmaygad(prev => Math.min(100, prev + bonus));
      setMurkocoin(prev => prev + 50);
      localStorage.setItem('lastRewardDate', today);
      addToast(`🎁 Ежедневка: +${bonus} омайгадности и 50 муркокоинов!`);
    }
  }, [addToast]);

  const handleWheelComplete = useCallback((newPet: Pet) => {
    addPetToCollection(newPet);
    setStarterCaseOpened(true);
    setSelectedPet({ ...newPet, count: 1, level: 1 });
    setOmaygad(100);
    setCurrentSection('pet');
  }, [addPetToCollection]);

  const handleSelectPet = useCallback((pet: OwnedPet) => {
    setSelectedPet(pet);
    setOmaygad(pet.happiness);
    setCurrentSection('pet');
  }, []);

  const handleStartOpening = useCallback((pool: Pet[], caseId: string) => {
    setOpeningCase({ pool, caseId });
  }, []);

  const handleCloseOpening = useCallback(() => setOpeningCase(null), []);

  if (!selectedPet && !starterCaseOpened) {
    return <WheelScreen onComplete={handleWheelComplete} starterCaseOpened={starterCaseOpened} showDropNotification={showDropNotification} />;
  }

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
          onShowHelp={() => addToast(`Как играть:\n📦 Кейсы\n🍔 Кормить\n⚡ Способности\n🎁 Ежедневка\n💰 Муркокоины\n⚡ Коллайдер`)}
        />
      )}

      {currentSection === 'collection' && <CollectionScreen myPets={myPets} onSelectPet={handleSelectPet} />}
      {currentSection === 'collider' && <ColliderScreen myPets={myPets} onLevelUp={levelUpPet} addToast={addToast} />}
      {currentSection === 'shop' && (
        <ShopScreen
          onStartOpening={handleStartOpening}
          starterCaseOpened={starterCaseOpened}
          addToast={addToast}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <AnimatePresence>{droppedPet && <DropNotification pet={droppedPet} onClose={() => setDroppedPet(null)} />}</AnimatePresence>
      <AnimatePresence>
        {openingCase && (
          <CaseOpeningAnimation
            pool={openingCase.pool}
            onComplete={pet => handleCaseOpenComplete(pet, openingCase.caseId)}
            onClose={handleCloseOpening}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;