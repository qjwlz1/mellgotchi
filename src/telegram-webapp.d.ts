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