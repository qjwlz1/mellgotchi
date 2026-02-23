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
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void
        expand: () => void
        initData: string
        initDataUnsafe: any
        showPopup: (options: { message: string; buttons?: Array<{ text: string }> }) => void
        cloudStorage: {
          getItem: (key: string) => Promise<string | null>
          setItem: (key: string, value: string) => Promise<void>
        }
        // Можно добавить другие методы, если понадобятся позже
      }
    }
  }
}

export {}