import { useState } from 'react'
import LockScreen from './components/LockScreen'
import SiteShell from './components/SiteShell'

export default function App() {
  const [unlocked, setUnlocked] = useState(false)
  const [lockKey, setLockKey]   = useState(0)

  function handleReset() {
    setUnlocked(false)
    setLockKey(k => k + 1)
  }

  return (
    <>
      <LockScreen key={lockKey} onUnlock={() => setUnlocked(true)} />
      <SiteShell visible={unlocked} onReset={handleReset} />
    </>
  )
}
