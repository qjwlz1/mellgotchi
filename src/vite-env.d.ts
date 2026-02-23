    // src/vite-env.d.ts (или создай его в src/)
interface Window {
  Telegram?: {
    WebApp: {
      ready: () => void;
      expand: () => void;
      // Добавь другие методы, если нужно: close, showPopup и т.д.
      initData: string;
      initDataUnsafe: any; // или точный тип, если хочешь
    };
  };
}