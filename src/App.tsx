import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface ToastMessage {
  id: number;
  text: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: number) => void;
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
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

// ==================== КОМПОНЕНТ УВЕДОМЛЕНИЯ О ВЫПАДЕНИИ ====================

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

// ==================== КОМПОНЕНТ АНИМАЦИИ ОТКРЫТИЯ КЕЙСА (ГОРИЗОНТАЛЬНАЯ ПРОКРУТКА) ====================

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
  const finalIndexRef = useRef<number>(0);
  const finalPetRef = useRef<Pet | null>(null);
  const completedRef = useRef(false);

  // 1️⃣ Создание списка и выбор финального питомца
  useEffect(() => {
    const finalPet = pool[Math.floor(Math.random() * pool.length)];
    finalPetRef.current = finalPet;

    const repeatCount = 6;
    const generated: Pet[] = [];

    for (let i = 0; i < repeatCount; i++) {
      generated.push(...pool);
    }

    const middleIndex = Math.floor(generated.length / 2);
    generated[middleIndex] = finalPet;

    finalIndexRef.current = middleIndex;
    setItems(generated);
  }, [pool]);

  // 2️⃣ Анимация
  useEffect(() => {
    if (!containerRef.current || !trackRef.current || items.length === 0) return;

    const container = containerRef.current;
    const track = trackRef.current;
    const finalIndex = finalIndexRef.current;

    const itemElement = track.children[finalIndex] as HTMLElement;
    if (!itemElement) return;

    const containerWidth = container.clientWidth;
    const itemWidth = itemElement.clientWidth;
    const itemLeft = itemElement.offsetLeft;

    const targetOffset =
      itemLeft - (containerWidth / 2 - itemWidth / 2);

    const startOffset = targetOffset + containerWidth * 2;

    const duration = 2500;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOut = 1 - Math.pow(1 - progress, 3);

      const current =
        startOffset - (startOffset - targetOffset) * easeOut;

      setOffset(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setOffset(targetOffset);
        setIsSpinning(false);

        if (!completedRef.current && finalPetRef.current) {
          completedRef.current = true;
          onComplete(finalPetRef.current);
        }

        setTimeout(() => {
          onClose();
        }, 800);
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
        onClick={(e) => e.stopPropagation()}
      >
        <div className="case-opening-header">🎲 Открытие кейса...</div>

        <div className="case-opening-carousel" ref={containerRef}>
          <div
            ref={trackRef}
            className="case-opening-track"
            style={{ transform: `translateX(-${offset}px)` }}
          >
            {items.map((pet, idx) => (
              <motion.div
                key={`${pet.id}-${idx}`}
                className="case-opening-item"
                style={{ borderColor: RARITY_CONFIG[pet.rarity].color }}
                animate={
                  !isSpinning && idx === finalIndexRef.current
                    ? { scale: [1, 1.2, 1] }
                    : {}
                }
                transition={{ duration: 0.3 }}
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
          <div className="case-opening-hint">✓ Готово!</div>
        )}
      </motion.div>
    </motion.div>
  );
}

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

// ==================== КОМПОНЕНТ РУЛЕТКИ (НАЧАЛЬНЫЙ КЕЙС) ====================
// Полностью переписан с использованием requestAnimationFrame

// ==================== КОМПОНЕНТ РУЛЕТКИ (НАЧАЛЬНЫЙ КЕЙС) ====================
// Исправленная версия с requestAnimationFrame

interface WheelScreenProps {
  onComplete: (pet: Pet) => void;
  starterCaseOpened: boolean;
  showDropNotification: (pet: Pet) => void;
}

// ==================== КОМПОНЕНТ РУЛЕТКИ (НАЧАЛЬНЫЙ КЕЙС) ====================
// Максимально простая и надёжная версия

function WheelScreen({ onComplete, starterCaseOpened, showDropNotification }: WheelScreenProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentPet, setCurrentPet] = useState<Pet | null>(null);
  const finalPetRef = useRef<Pet | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);
  const pool = PETS_DATABASE.filter(p => [1, 2, 3, 9].includes(p.id));

  const spinWheel = useCallback(() => {
    if (isSpinning || starterCaseOpened) return;

    // Выбираем финального питомца
    const finalPet = pool[Math.floor(Math.random() * pool.length)];
    finalPetRef.current = finalPet;
    console.log('[Wheel] Финальный питомец:', finalPet.name);

    setIsSpinning(true);
    setCurrentPet(null);

    const spinDuration = 2000;      // 2 секунды
    const spinInterval = 50;         // 50 мс
    const maxSteps = spinDuration / spinInterval; // 40 шагов
    let step = 0;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      step++;

      if (step < maxSteps) {
        // Показываем случайного питомца из пула
        const randomIndex = Math.floor(Math.random() * pool.length);
        setCurrentPet(pool[randomIndex]);
      } else {
        // Последний шаг — показываем финального
        setCurrentPet(finalPetRef.current);
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;

        // Даём 300 мс на осознание и завершаем
        setTimeout(() => {
          setIsSpinning(false);
          if (finalPetRef.current) {
            onComplete(finalPetRef.current);
            showDropNotification(finalPetRef.current);
          }
        }, 300);
      }
    }, spinInterval);
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
          animate={isSpinning ? { rotate: [0, 360, 720, 1080, 1440], scale: [1, 1.2, 1.2, 1.1, 1] } : {}}
          transition={{ duration: 2, ease: 'easeOut' }}
        >
          <div className="wheel-display">
            {currentPet ? (
              <motion.div
                key={currentPet.id + (isSpinning ? 'spin' : 'final')}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="wheel-result"
                style={{ background: `${RARITY_CONFIG[currentPet.rarity].color}30` }}
              >
                <span className="wheel-emoji">{currentPet.emoji}</span>
                <div className="wheel-name">{currentPet.name}</div>
                <div className="wheel-rarity">{RARITY_CONFIG[currentPet.rarity].name}</div>
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
      </div>
    </div>
  );
}
// ==================== ЭКРАН ПИТОМЦА ====================
interface GameScreenProps {
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
// ==================== КОЛЛЕКЦИЯ ====================

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

// ==================== КОЛЛАЙДЕР ====================

interface ColliderScreenProps {
  myPets: OwnedPet[];
  onLevelUp: (petId: number) => void;
  addToast: (msg: string) => void;
}

function ColliderScreen({ myPets, onLevelUp, addToast }: ColliderScreenProps) {
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
                      addToast('😢 Недостаточно дубликатов');
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

// ==================== МАГАЗИН ====================

interface ShopScreenProps {
  onStartOpening: (pool: Pet[], caseId: string) => void;
  starterCaseOpened: boolean;
  addToast: (msg: string) => void;
}

function ShopScreen({ onStartOpening, starterCaseOpened, addToast }: ShopScreenProps) {
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

// ==================== ОСНОВНОЙ КОМПОНЕНТ ====================

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
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
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
        return prev.map(p => (p.id === pet.id ? { ...p, count: p.count + 1 } : p));
      }
      return [...prev, { ...pet, count: 1, level: 1 }];
    });
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
    addToast(event.msg);
  }, [addToast]);

  const handleCaseOpenComplete = useCallback(
    (pet: Pet, caseId: string) => {
      addPetToCollection(pet);
      showDropNotification(pet);
      if (caseId === 'starter') {
        setStarterCaseOpened(true);
      }
    },
    [addPetToCollection, showDropNotification]
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
      addToast(`⬆️ УРОВЕНЬ ПОВЫШЕН! Теперь ты ${newLevel} уровня!`);
    }

    if (Math.random() < 0.1) {
      triggerRandomEvent();
    }
  }, [selectedPet, omaygad, xp, level, triggerRandomEvent, addToast]);

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
          addToast('🍪 Украл печеньку у соседа! +30 омайгадности');
          effectApplied = true;
          break;
        case 'мурино':
          setMurkocoin(prev => prev + 100);
          addToast('🌫️ Растворился в тумане и нашел 100 муркокоин!');
          effectApplied = true;
          break;
        case 'молочное':
          setXp(prev => prev + 50);
          addToast('🕷️ Пауки принесли 50 опыта!');
          effectApplied = true;
          break;
        case 'мытищи':
          setOmaygad(prev => Math.min(100, prev + 20));
          setMurkocoin(prev => prev + 50);
          addToast('💧 Водяной экстрим! +20 омайгадности и +50 монет');
          effectApplied = true;
          break;
        case 'баня':
          setOmaygad(prev => Math.min(100, prev + 25));
          addToast('🛁 Жаркая баня! +25 омайгадности');
          effectApplied = true;
          break;
        default:
          break;
      }
      if (effectApplied) break;
    }

    if (!effectApplied) {
      setOmaygad(prev => Math.min(100, prev + 20));
      addToast('✨ Случайная способность сработала!');
    }
  }, [selectedPet, specialCooldown, addToast]);

  const levelUpPet = useCallback((petId: number) => {
    setMyPets(prev => {
      const pet = prev.find(p => p.id === petId);
      if (!pet || pet.count < 2) {
        addToast('😢 Недостаточно дубликатов для повышения уровня');
        return prev;
      }

      const updated = prev.map(p => {
        if (p.id === petId) {
          return { ...p, count: p.count - 1, level: p.level + 1 };
        }
        return p;
      });

      if (selectedPet && selectedPet.id === petId) {
        const updatedPet = updated.find(p => p.id === petId);
        if (updatedPet) {
          setSelectedPet(updatedPet);
        }
      }

      addToast(`⬆️ Уровень питомца ${pet.name} повышен до ${pet.level + 1}!`);
      return updated;
    });
  }, [selectedPet, addToast]);

  // ===== Эффекты =====

  useEffect(() => {
    if (!selectedPet) return;

    const interval = setInterval(() => {
      setOmaygad(prev => {
        const newVal = prev - 3;
        if (newVal <= 30 && newVal > 20) {
          addToast(`⚠️ ${selectedPet.catchPhrase}! Питомец хочет жрать! Покорми мемасами`);
        } else if (newVal <= 20 && newVal > 0) {
          addToast(`😱 ${selectedPet.name} кринжует! Срочно тащи мемы!`);
        } else if (newVal <= 0) {
          addToast(`💀 ${selectedPet.name} канул в лету... Спи спокойно, бро`);
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
    try {
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
      addToast(`🎁 Ежедневный рофл: +${omaygadBonus} омайгадности и 50 муркокоин!`);
    }
  }, [addToast]);

  const handleWheelComplete = useCallback(
    (newPet: Pet) => {
      addPetToCollection(newPet);
      setStarterCaseOpened(true);
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

  const handleStartOpening = useCallback((pool: Pet[], caseId: string) => {
    setOpeningCase({ pool, caseId });
  }, []);

  const handleCloseOpening = useCallback(() => {
    setOpeningCase(null);
  }, []);

  if (!selectedPet && !starterCaseOpened) {
    return <WheelScreen onComplete={handleWheelComplete} starterCaseOpened={starterCaseOpened} showDropNotification={showDropNotification} />;
  }

  if (!selectedPet && starterCaseOpened) {
    if (myPets.length > 0) {
      const firstPet = myPets[0];
      setSelectedPet(firstPet);
      setOmaygad(firstPet.happiness);
      setCurrentSection('pet');
    } else {
      return (
        <div className="app-container">
          <Navbar currentSection={currentSection} onSectionChange={setCurrentSection} />
          <CollectionScreen myPets={myPets} onSelectPet={handleSelectPet} />
        </div>
      );
    }
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
          onShowHelp={() =>
            addToast(`Как играть:
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
        <ColliderScreen myPets={myPets} onLevelUp={levelUpPet} addToast={addToast} />
      )}
      {currentSection === 'shop' && (
        <ShopScreen onStartOpening={handleStartOpening} starterCaseOpened={starterCaseOpened} addToast={addToast} />
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <AnimatePresence>
        {droppedPet && <DropNotification pet={droppedPet} onClose={() => setDroppedPet(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {openingCase && (
          <CaseOpeningAnimation
            pool={openingCase.pool}
            onComplete={(pet) => handleCaseOpenComplete(pet, openingCase.caseId)}
            onClose={handleCloseOpening}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;