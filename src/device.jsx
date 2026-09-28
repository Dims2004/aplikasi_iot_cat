import { createContext, useContext, useEffect, useRef, useState } from 'react'
import mqtt from 'mqtt'
import { dict } from './i18n.js'

const Ctx = createContext()
export const useDevice = () => useContext(Ctx)
export const MAXF = 500
export const MAXW = 1000
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }

const DEF_CFG = { url: 'wss://broker.emqx.io:8084/mqtt', sub: 'catfeeder/esp32/data', pub: 'catfeeder/esp32/control' }
const DEF_SCHED = { auto: true, items: [
  { id: 1, name: 'Pagi', time: '07:00', amount: 50, on: true },
  { id: 2, name: 'Siang', time: '12:00', amount: 50, on: true },
  { id: 3, name: 'Sore', time: '17:00', amount: 50, on: true },
  { id: 4, name: 'Malam', time: '21:00', amount: 50, on: true },
] }
const DEF_PREFS = { name: 'Dimas', email: 'dimas@example.com', breed: 'Kucing Domestik', birth: '2023-01-01', push: true, eco: false, lang: 'id', demo: true }

export function DeviceProvider({ children }) {
  const [cfg, setCfg] = useState(() => ({ ...DEF_CFG, ...load('cfg', {}) }))
  const [prefs, setPrefs] = useState(() => ({ ...DEF_PREFS, ...load('prefs', {}) }))
  const [net, setNet] = useState('connecting') // connecting | online | offline (MQTT asli)
  const [live, setLive] = useState({ weight: 0, water: 0, wifi: true })
  const [sim, setSim] = useState(() => load('sim', { weight: 250, water: 320 }))
  const [lastSeen, setLastSeen] = useState(0)
  const [now, setNow] = useState(Date.now())
  const [events, setEvents] = useState(() => load('events', []))
  const [schedule, setScheduleState] = useState(() => load('schedule', DEF_SCHED))
  const [feedAmount, setFeedAmount] = useState(() => load('feedAmount', 50))
  const [waterAmount, setWaterAmount] = useState(() => load('waterAmount', 100))
  const [toast, setToast] = useState('')
  const client = useRef(null)
  const lowFlag = useRef(false)
  const firstNet = useRef(true)
  const timer = useRef(null)
  const done = useRef({})

  const demo = prefs.demo
  const lang = prefs.lang
  const t = (k, v = {}) => {
    let s = dict[lang]?.[k] ?? dict.id[k] ?? k
    Object.entries(v).forEach(([a, b]) => { s = s.replaceAll(`{${a}}`, b) })
    return s
  }
  const tRef = useRef(t); tRef.current = t
  const schedRef = useRef(schedule); schedRef.current = schedule

  const status = demo ? 'demo' : net
  const data = demo ? { ...sim, wifi: true } : live
  const deviceOnline = demo ? true : net === 'online' && lastSeen > 0 && now - lastSeen < 90000

  const notify = (m) => { setToast(m); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(''), 2600) }
  const addEvent = (type, k, amount = 0, src = 'manual') =>
    setEvents((e) => [{ id: Date.now() + Math.random(), type, k, amount, src, ts: Date.now() }, ...e].slice(0, 200))

  useEffect(() => { localStorage.setItem('cfg', JSON.stringify(cfg)) }, [cfg])
  useEffect(() => { localStorage.setItem('events', JSON.stringify(events)) }, [events])
  useEffect(() => { localStorage.setItem('schedule', JSON.stringify(schedule)) }, [schedule])
  useEffect(() => { localStorage.setItem('prefs', JSON.stringify(prefs)) }, [prefs])
  useEffect(() => { localStorage.setItem('sim', JSON.stringify(sim)) }, [sim])
  useEffect(() => { localStorage.setItem('feedAmount', JSON.stringify(feedAmount)) }, [feedAmount])
  useEffect(() => { localStorage.setItem('waterAmount', JSON.stringify(waterAmount)) }, [waterAmount])
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 10000); return () => clearInterval(i) }, [])

  // MQTT asli (hanya saat Mode Demo mati)
  useEffect(() => {
    if (demo) { client.current = null; return }
    setNet('connecting')
    const c = mqtt.connect(cfg.url, { reconnectPeriod: 4000, clientId: 'catfeeder_web_' + Math.random().toString(16).slice(2, 8) })
    client.current = c
    c.on('connect', () => { setNet('online'); c.subscribe(cfg.sub) })
    c.on('close', () => setNet('offline'))
    c.on('error', () => setNet('offline'))
    c.on('message', (_t, m) => {
      try { setLive((p) => ({ ...p, ...JSON.parse(m.toString()) })); setLastSeen(Date.now()) } catch { /* abaikan payload non-JSON */ }
    })
    return () => c.end(true)
  }, [cfg.url, cfg.sub, demo])

  useEffect(() => {
    if (demo || net === 'connecting') return
    if (firstNet.current && net === 'offline') return
    firstNet.current = false
    addEvent('system', net === 'online' ? 'mqtt_on' : 'mqtt_off')
  }, [net, demo])

  // Simulator realtime (Mode Demo): kucing makan/minum + jadwal otomatis
  useEffect(() => {
    if (!demo) return
    const id = setInterval(() => {
      setSim((s) => ({
        weight: Math.max(0, s.weight - (Math.random() < 0.5 ? 1 + Math.floor(Math.random() * 2) : 0)),
        water: Math.max(0, s.water - (Math.random() < 0.4 ? 1 : 0)),
      }))
      const d = new Date()
      const hm = d.toTimeString().slice(0, 5)
      const sc = schedRef.current
      if (!sc.auto) return
      sc.items.forEach((i) => {
        const key = i.id + d.toDateString() + i.time
        if (i.on && i.time === hm && !done.current[key]) {
          done.current[key] = 1
          setSim((s) => ({ ...s, weight: Math.min(MAXF, s.weight + i.amount) }))
          addEvent('feed', 'feed', i.amount, 'auto')
          notify(tRef.current('autoFed', { name: i.name, n: i.amount }))
        }
      })
    }, 3000)
    return () => clearInterval(id)
  }, [demo])

  useEffect(() => {
    if (!demo && !lastSeen) return
    if (data.weight < 100 && !lowFlag.current) { lowFlag.current = true; addEvent('food', 'food', data.weight) }
    if (data.weight >= 100) lowFlag.current = false
  }, [data.weight, lastSeen, demo])

  const send = (payload, retain = false, silent = false) => {
    const c = client.current
    if (c?.connected) { c.publish(cfg.pub, JSON.stringify(payload), { retain }); return true }
    if (!silent) notify(t('notConnected'))
    return false
  }
  const feed = (amount = feedAmount) => {
    amount = +amount
    if (demo) { setSim((s) => ({ ...s, weight: Math.min(MAXF, s.weight + amount) })); addEvent('feed', 'feed', amount); notify(t('doneFeed', { n: amount })); return }
    if (send({ cmd: 'feed', amount })) { addEvent('feed', 'feed', amount); notify(t('sentFeed', { n: amount })) }
  }
  const water = (amount = waterAmount) => {
    amount = +amount
    if (demo) { setSim((s) => ({ ...s, water: Math.min(MAXW, s.water + amount) })); addEvent('water', 'water', amount); notify(t('doneWater', { n: amount })); return }
    if (send({ cmd: 'water', amount })) { addEvent('water', 'water', amount); notify(t('sentWater', { n: amount })) }
  }
  const command = (cmd) => {
    if (demo) { notify(t('calSim')); return }
    if (send({ cmd })) notify(t('calSent'))
  }
  const setSchedule = (s) => { setScheduleState(s); if (!demo) send({ cmd: 'schedule', ...s }, true, true) }

  return (
    <Ctx.Provider value={{ cfg, setCfg, status, data, deviceOnline, events, feed, water, command, schedule, setSchedule, prefs, setPrefs, toast, notify, t, lang, demo, feedAmount, setFeedAmount, waterAmount, setWaterAmount }}>
      {children}
    </Ctx.Provider>
  )
}
