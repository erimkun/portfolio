import { useState, useEffect } from 'react'

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']

function pad(n) { return String(n).padStart(2, '0') }

export function useClock() {
  const [display, setDisplay] = useState({ time: '', date: '' })

  useEffect(() => {
    function tick() {
      const now = new Date()
      setDisplay({
        time: pad(now.getHours()) + ':' + pad(now.getMinutes()),
        date: DAYS[now.getDay()] + ' · ' + MONTHS[now.getMonth()] + ' ' + now.getDate(),
      })
    }
    tick()
    const id = setInterval(tick, 20_000)
    return () => clearInterval(id)
  }, [])

  return display
}
