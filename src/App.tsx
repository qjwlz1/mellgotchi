import { useEffect, useState } from 'react'
import { useRawInitData } from '@tma.js/sdk-react'

function App() {
  const [omaygad, setOmaygad] = useState(100)

  const rawInitData = useRawInitData()

  let user = null
  try {
    const urlParams = new URLSearchParams(rawInitData || '')
    const userJson = urlParams.get('user')
    if (userJson) {
      user = JSON.parse(decodeURIComponent(userJson))  // иногда нужно декодировать
    }
  } catch (e) {
    console.error('Ошибка парсинга initData', e)
  }

  const username = user?.username || user?.first_name || 'чел'
  const firstName = user?.first_name || ''
  const lastName = user?.last_name || ''

  useEffect(() => {
    const webApp = window.Telegram?.WebApp
    if (webApp) {
      webApp.ready()
      webApp.expand()
    }
  }, [])

  const feed = () => {
    setOmaygad(prev => Math.min(100, prev + 20))
  }

  return (
    <div style={{
      background: '#000',
      color: '#fff',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>МелГотчи 🔥</h1>
      
      <p style={{ fontSize: '1.5rem', marginBottom: '40px' }}>
        Привет, {firstName} {lastName} (@{username})! Омайгад 😈
      </p>

      <div style={{
        fontSize: '4rem',
        fontWeight: 'bold',
        margin: '40px 0',
        color: omaygad > 30 ? '#00ff9d' : '#ff4d4d'
      }}>
        Омайгадность: {omaygad}%
      </div>

      <button
        onClick={feed}
        style={{
          padding: '16px 32px',
          fontSize: '1.5rem',
          background: '#0088cc',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer'
        }}
      >
        Покормить мемами (+20)
      </button>
    </div>
  )
}

export default App