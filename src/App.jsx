import { useEffect, useState } from 'react'
import { Home as HomeI, CalendarClock, History, User, Bell, Cpu, Menu, X, Sun, Moon, Send, PawPrint, Languages, Download } from 'lucide-react'
import { DeviceProvider, useDevice } from './device.jsx'
import * as P from './pages.jsx'

const NAV = [['home', HomeI], ['device', Cpu], ['schedule', CalendarClock], ['manual', Send], ['history', History], ['notif', Bell], ['profile', User]]
const TABS = NAV.filter(([k]) => ['home', 'schedule', 'history', 'profile'].includes(k))
const PARENT = { settings: 'profile', edit: 'profile', device: 'home', manual: 'home', notif: 'home' }
const PAGES = { home: P.Home, device: P.Device, schedule: P.Schedule, manual: P.ManualFeed, history: P.Riwayat, notif: P.Notif, profile: P.Profile, settings: P.Settings_, edit: P.EditProfile }

function Pill() {
  const { status, t } = useDevice()
  const m = {
    online: ['bg-emerald-500/15 text-emerald-500', 'bg-emerald-500', t('online')],
    demo: ['bg-amber-500/15 text-amber-500', 'bg-amber-500', t('demo')],
    connecting: ['bg-slate-500/15 text-slate-400', 'bg-slate-400', t('connecting')],
    offline: ['bg-slate-500/15 text-slate-400', 'bg-slate-400', t('offline')],
  }[status]
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${m[0]}`}><span className={`h-2 w-2 rounded-full ${m[1]}`} />{m[2]}</span>
}
function Install({ cls }) {
  const { t } = useDevice()
  const [ev, setEv] = useState(null)
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
  useEffect(() => {
    const h = (e) => { e.preventDefault(); setEv(e) }
    const d = () => setEv(null)
    addEventListener('beforeinstallprompt', h); addEventListener('appinstalled', d)
    return () => { removeEventListener('beforeinstallprompt', h); removeEventListener('appinstalled', d) }
  }, [])
  if (standalone) return null
  if (ev) return <button onClick={() => ev.prompt()} className={cls}><Download size={18} />{t('install')}</button>
  if (ios) return <p className="muted text-xs">{t('iosHint')}</p>
  return null
}
function Logo() {
  const { t } = useDevice()
  return (
    <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-sky-400 text-white"><PawPrint size={22} /></span>
      <div><p className="font-bold leading-tight">CatFeeder</p><p className="text-xs text-slate-400">{t('tagline')}</p></div></div>
  )
}

function Shell() {
  const [page, setPage] = useState('home')
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const { toast, t, lang, prefs, setPrefs } = useDevice()
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('theme', dark ? 'dark' : 'light') }, [dark])
  const go = (p) => { setPage(p); setOpen(false); window.scrollTo(0, 0) }
  const Page = PAGES[page]
  const active = PARENT[page] || page

  const btnCls = 'flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium dark:border-indigo-500/30'
  const controls = (
    <div className="flex flex-col gap-2">
      <Install cls={btnCls} />
      <button onClick={() => setDark(!dark)} aria-label={t('theme')} className={btnCls}>{dark ? <Sun size={18} /> : <Moon size={18} />}{dark ? t('lightMode') : t('darkMode')}</button>
      <button onClick={() => setPrefs({ ...prefs, lang: lang === 'id' ? 'en' : 'id' })} aria-label={t('language')} className={btnCls}><Languages size={18} />{lang === 'id' ? 'Bahasa Indonesia → English' : 'English → Bahasa Indonesia'}</button>
    </div>
  )
  const navBtn = ([k, I]) => (
    <button key={k} onClick={() => go(k)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left font-medium transition ${page === k || active === k ? 'bg-violet-600/10 text-violet-600 dark:text-violet-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}><I size={20} />{t(k)}</button>
  )
  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-6 border-r border-slate-200 bg-white p-5 dark:border-indigo-500/20 dark:bg-[#10132b] lg:flex">
        <Logo /><nav className="flex flex-1 flex-col gap-1">{NAV.map(navBtn)}</nav>
        <Pill />{controls}
      </aside>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur dark:border-indigo-500/20 dark:bg-[#0b0d1f]/85 lg:hidden">
        <button onClick={() => setOpen(true)} aria-label={t('openMenu')}><Menu /></button><Logo /><Pill />
      </header>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col gap-4 bg-white p-5 dark:bg-[#10132b]">
            <div className="flex items-center justify-between"><Logo /><button onClick={() => setOpen(false)} aria-label={t('closeMenu')}><X /></button></div>
            <nav className="flex flex-1 flex-col gap-1">{NAV.map(navBtn)}</nav>{controls}
          </div>
        </div>
      )}
      <main className="mx-auto max-w-4xl p-4 pb-28 lg:p-8"><Page go={go} /></main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-indigo-500/20 dark:bg-[#10132b]/95 lg:hidden">
        {TABS.map(([k, I]) => (
          <button key={k} onClick={() => go(k)} className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${active === k ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400'}`}><I size={22} />{t(k)}</button>
        ))}
      </nav>
      {toast && <div className="fixed bottom-24 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2.5 text-center text-sm text-white shadow-lg dark:bg-white dark:text-slate-900 lg:bottom-8">{toast}</div>}
    </div>
  )
}

export default function App() { return <DeviceProvider><Shell /></DeviceProvider> }
