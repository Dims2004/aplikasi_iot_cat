import { useState } from 'react'
import { Utensils, Droplet, Wifi, Cpu, Radio, Plus, Minus, Send, ChevronRight, Bell, Info, Globe, LogOut, Pencil, Settings, Scale, Cat, Check, AlertTriangle, Trash2, User, FlaskConical } from 'lucide-react'
import { useDevice, MAXF, MAXW } from './device.jsx'

const loc = (l) => (l === 'en' ? 'en-US' : 'id-ID')
const fmt = (ts, l) => new Date(ts).toLocaleTimeString(loc(l), { hour: '2-digit', minute: '2-digit', hour12: l === 'en' }).replace('.', ':')
const evTitle = (e, t) => (e.k ? t('ev_' + e.k) : e.title)
const evDesc = (e, t) => {
  if (!e.k) return e.desc
  if (e.k === 'feed' || e.k === 'water') return `${e.amount} ${e.k === 'feed' ? 'g' : 'ml'} (${t(e.src === 'auto' ? 'autoSrc' : 'manualSrc')})`
  if (e.k === 'food') return t('ev_food_d', { n: e.amount })
  return t('ev_' + e.k + '_d')
}

export const Toggle = ({ on, set }) => (
  <button onClick={() => set(!on)} aria-pressed={on} className={`h-6 w-11 shrink-0 rounded-full p-0.5 transition ${on ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
    <span className={`block h-5 w-5 rounded-full bg-white transition ${on ? 'translate-x-5' : ''}`} />
  </button>
)
const Bar = ({ v, max, c = 'from-violet-500 to-indigo-400' }) => (
  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700/60"><div className={`h-2 rounded-full bg-gradient-to-r transition-all duration-700 ${c}`} style={{ width: Math.min(100, (v / max) * 100) + '%' }} /></div>
)
const Ico = ({ I, c = 'violet' }) => {
  const m = { violet: 'bg-violet-500/15 text-violet-500', sky: 'bg-sky-500/15 text-sky-500', green: 'bg-emerald-500/15 text-emerald-500', amber: 'bg-amber-500/15 text-amber-500', red: 'bg-rose-500/15 text-rose-500' }
  return <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${m[c]}`}><I size={20} /></span>
}
const Title = ({ children, back, go }) => {
  const { t } = useDevice()
  return (
    <div className="mb-5 flex items-center gap-3">
      {back && <button onClick={() => go(back)} className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 dark:border-indigo-500/30" aria-label={t('back')}>←</button>}
      <h1 className="text-2xl font-bold">{children}</h1>
    </div>
  )
}
const Tabs = ({ list, v, set }) => (
  <div className="mb-4 flex flex-wrap gap-2">
    {list.map(([k, l]) => <button key={k} onClick={() => set(k)} className={`chip ${v === k ? 'bg-violet-600 text-white' : 'bg-slate-200 dark:bg-[#141833]'}`}>{l}</button>)}
  </div>
)
const Chip = ({ ok, icon: I, label }) => {
  const { t, demo } = useDevice()
  return (
    <div className="card flex flex-1 items-center gap-2 !p-3">
      <span className={ok ? 'text-emerald-500' : 'text-slate-400'}><I size={20} /></span>
      <div><p className="text-sm font-semibold">{label}</p><p className={`text-xs ${ok ? 'text-emerald-500' : 'text-slate-400'}`}>{ok ? (demo ? t('sim') : t('ok')) : t('wait')}</p></div>
    </div>
  )
}
const Row = ({ icon: I, label, right, onClick, c }) => (
  <button onClick={onClick} className="flex w-full items-center gap-3 border-b border-slate-100 py-3 text-left last:border-0 dark:border-indigo-500/10">
    <Ico I={I} c={c} /><span className="flex-1 font-medium">{label}</span>{right && <span className="muted">{right}</span>}<ChevronRight size={18} className="text-slate-400" />
  </button>
)
const Amount = ({ v, set, step, min, max, unit }) => (
  <div className="flex items-center justify-between rounded-xl border border-slate-200 px-2 py-1 dark:border-indigo-500/20">
    <button aria-label="-" onClick={() => set(Math.max(min, v - step))} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-white/10"><Minus size={16} /></button>
    <span className="font-semibold">{v} {unit}</span>
    <button aria-label="+" onClick={() => set(Math.min(max, v + step))} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 dark:bg-white/10"><Plus size={16} /></button>
  </div>
)
const Manual = () => {
  const { feed, water, feedAmount, setFeedAmount, waterAmount, setWaterAmount, t } = useDevice()
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Amount v={feedAmount} set={setFeedAmount} step={10} min={10} max={200} unit="g" />
        <button className="btn-p w-full" onClick={() => feed()}><Utensils size={18} />{t('addFood')}</button>
      </div>
      <div className="space-y-2">
        <Amount v={waterAmount} set={setWaterAmount} step={50} min={50} max={500} unit="ml" />
        <button className="btn-w w-full" onClick={() => water()}><Droplet size={18} />{t('addWater')}</button>
      </div>
    </div>
  )
}

export function Home() {
  const { data, feed, feedAmount, deviceOnline, status, demo, prefs, t } = useDevice()
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">{t('hello', { name: prefs.name })}</h1><p className="muted">{t('catOk')}</p></div>
        <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-white"><Cat size={32} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card border-violet-500/40 bg-gradient-to-br from-violet-500/10 to-transparent">
          <Ico I={Utensils} /><p className="mt-3 text-sm">{t('foodWeight')}</p>
          <p className="text-4xl font-bold">{data.weight} <span className="text-base font-normal text-slate-400">g / {MAXF} g</span></p>
          <div className="mt-3"><Bar v={data.weight} max={MAXF} /></div>
        </div>
        <div className="card">
          <Ico I={Droplet} c="sky" /><p className="mt-3 text-sm">{t('waterDrink')}</p>
          <p className="text-4xl font-bold">{data.water} <span className="text-base font-normal text-slate-400">ml / {MAXW} ml</span></p>
          <div className="mt-3"><Bar v={data.water} max={MAXW} c="from-sky-500 to-cyan-400" /></div>
        </div>
      </div>
      <div>
        <p className="muted mb-2 font-semibold">{t('deviceStatus')}</p>
        <div className="flex gap-3"><Chip ok={deviceOnline} icon={Cpu} label="ESP32" /><Chip ok={status === 'online' || demo} icon={Radio} label="MQTT" /><Chip ok={deviceOnline && data.wifi !== false} icon={Wifi} label="WiFi" /></div>
      </div>
      <button className="btn-p w-full" onClick={() => feed()}><Utensils size={18} />{t('feedNow')} ({feedAmount} g)</button>
      <div><p className="mb-2 font-semibold">{t('manualCtl')}</p><Manual /></div>
    </div>
  )
}

export function Device() {
  const { data, deviceOnline, demo, cfg, t } = useDevice()
  return (
    <div className="space-y-4">
      <Title>{t('device')}</Title>
      <div className="card flex items-center gap-4">
        <Ico I={Cpu} />
        <div className="flex-1"><p className="font-bold">ESP32</p><p className="muted">{t('esp32Sub')}</p><p className="muted text-xs">Topic: {cfg.sub}</p></div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${deviceOnline ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/15 text-slate-400'}`}>{deviceOnline ? (demo ? t('sim') : t('online')) : t('noData')}</span>
      </div>
      <div className="card"><div className="flex items-center gap-3"><Ico I={Utensils} /><p className="font-semibold">{t('scale')}</p></div>
        <div className="mt-3 flex justify-between"><div><p className="muted">{t('curWeight')}</p><p className="text-3xl font-bold">{data.weight} g</p></div><div className="text-right"><p className="muted">{t('maxCap')}</p><p className="text-3xl font-bold">{MAXF} g</p></div></div>
        <div className="mt-3"><Bar v={data.weight} max={MAXF} /></div></div>
      <div className="card"><div className="flex items-center gap-3"><Ico I={Droplet} c="sky" /><p className="font-semibold">{t('tank')}</p></div>
        <div className="mt-3 flex justify-between"><div><p className="muted">{t('curVol')}</p><p className="text-3xl font-bold">{data.water} ml</p></div><div className="text-right"><p className="muted">{t('maxCap')}</p><p className="text-3xl font-bold">{MAXW} ml</p></div></div>
        <div className="mt-3"><Bar v={data.water} max={MAXW} c="from-sky-500 to-cyan-400" /></div></div>
      <div><p className="mb-2 font-semibold">{t('manualCtl')}</p><Manual /></div>
    </div>
  )
}

export function Schedule() {
  const { schedule: s, setSchedule, t } = useDevice()
  const upd = (id, patch) => setSchedule({ ...s, items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })
  return (
    <div className="space-y-4">
      <Title>{t('schedTitle')}</Title>
      <div className="card flex items-center gap-3"><Ico I={Utensils} /><div className="flex-1"><p className="font-semibold">{t('autoFeed')}</p><p className="muted">{t('autoFeedD')}</p></div><Toggle on={s.auto} set={(v) => setSchedule({ ...s, auto: v })} /></div>
      <div className="flex items-center justify-between"><p className="font-semibold">{t('dailySched')}</p>
        <button aria-label={t('addSched')} onClick={() => setSchedule({ ...s, items: [...s.items, { id: Date.now(), name: t('newSched'), time: '12:00', amount: 50, on: true }] })} className="grid h-8 w-8 place-items-center rounded-full bg-violet-600 text-white"><Plus size={18} /></button></div>
      {s.items.map((i) => (
        <div key={i.id} className="card flex flex-wrap items-center gap-3">
          <Ico I={Utensils} />
          <div className="min-w-[120px] flex-1">
            <input className="w-full bg-transparent font-semibold outline-none" value={i.name} onChange={(e) => upd(i.id, { name: e.target.value })} />
            <div className="mt-1 flex items-center gap-2">
              <input type="time" className="input !w-auto !py-1" value={i.time} onChange={(e) => upd(i.id, { time: e.target.value })} />
              <input type="number" min="10" max="200" className="input !w-20 !py-1" value={i.amount} onChange={(e) => upd(i.id, { amount: +e.target.value })} /><span className="muted">g</span>
            </div>
          </div>
          <Toggle on={i.on} set={(v) => upd(i.id, { on: v })} />
          <button aria-label={t('del')} onClick={() => setSchedule({ ...s, items: s.items.filter((x) => x.id !== i.id) })} className="text-slate-400 hover:text-rose-500"><Trash2 size={18} /></button>
        </div>
      ))}
    </div>
  )
}

export function ManualFeed() {
  const { feed, cfg, demo, feedAmount: a, setFeedAmount: setA, data, t } = useDevice()
  const R = 84, C = 2 * Math.PI * R
  return (
    <div className="mx-auto max-w-md space-y-6">
      <Title>{t('manualTitle')}</Title>
      <div className="relative mx-auto h-64 w-64">
        <svg viewBox="0 0 200 200" className="-rotate-90">
          <circle cx="100" cy="100" r={R} fill="none" strokeWidth="10" className="stroke-slate-200 dark:stroke-slate-700/60" />
          <circle cx="100" cy="100" r={R} fill="none" strokeWidth="10" strokeLinecap="round" stroke="url(#g)" strokeDasharray={C} strokeDashoffset={C * (1 - a / 200)} />
          <defs><linearGradient id="g"><stop offset="0" stopColor="#7c3aed" /><stop offset="1" stopColor="#38bdf8" /></linearGradient></defs>
        </svg>
        <div className="absolute inset-0 grid place-content-center text-center"><Utensils className="mx-auto text-violet-500" /><p className="text-5xl font-bold">{a}<span className="text-2xl"> g</span></p><p className="muted">{t('amountFood')}</p></div>
      </div>
      <div className="flex items-center gap-3">
        <button aria-label={t('dec')} onClick={() => setA(Math.max(10, a - 10))} className="grid h-11 w-11 place-items-center rounded-full border border-violet-500/50"><Minus size={18} /></button>
        <input type="range" min="10" max="200" step="5" value={a} onChange={(e) => setA(Number(e.target.value))} className="flex-1 accent-violet-500" />
        <button aria-label={t('inc')} onClick={() => setA(Math.min(200, a + 10))} className="grid h-11 w-11 place-items-center rounded-full border border-violet-500/50"><Plus size={18} /></button>
      </div>
      <div className="flex justify-between px-1 text-sm text-slate-400">{[10, 25, 50, 100, 200].map((n) => <button key={n} onClick={() => setA(n)} className={a === n ? 'font-bold text-violet-500' : ''}>{n}</button>)}</div>
      <p className="muted text-center">{t('foodWeight')}: <b>{data.weight} g</b> / {MAXF} g</p>
      <button className="btn-p w-full" onClick={() => feed(a)}><Send size={18} />{demo ? t('feedNow') : t('sendEsp')}</button>
      <p className="muted flex items-center gap-2"><Wifi size={18} className="shrink-0 text-emerald-500" />{demo ? t('demoNote') : t('mqttNote', { topic: cfg.pub })}</p>
    </div>
  )
}

export function Notif() {
  const { events, t, lang } = useDevice()
  const [tab, setTab] = useState('all')
  const map = { food: ['feed', 'food'], water: ['water'], system: ['system'] }
  const list = events.filter((e) => tab === 'all' || map[tab].includes(e.type))
  const style = { feed: [Check, 'green'], food: [AlertTriangle, 'amber'], water: [Droplet, 'sky'], system: [Cpu, 'violet'] }
  return (
    <div><Title>{t('notif')}</Title><Tabs list={['all', 'food', 'water', 'system'].map((k) => [k, t(k)])} v={tab} set={setTab} />
      <div className="space-y-2">
        {list.length === 0 && <p className="muted card">{t('noNotif')}</p>}
        {list.map((e) => { const [I, c] = style[e.type] || style.system; return (
          <div key={e.id} className="card flex items-center gap-3 !p-3"><Ico I={I} c={c} /><div className="flex-1"><p className="font-semibold">{evTitle(e, t)}</p><p className="muted">{evDesc(e, t)}</p></div><span className="muted text-xs">{fmt(e.ts, lang)}</span></div>
        ) })}
      </div>
    </div>
  )
}

export function Riwayat() {
  const { events, t, lang } = useDevice()
  const [tab, setTab] = useState('all') // all | feed | water
  const act = events.filter((e) => e.type === 'feed' || e.type === 'water')
  const today = act.filter((e) => new Date(e.ts).toDateString() === new Date().toDateString())
  const sum = (ty) => today.filter((e) => e.type === ty).reduce((a, e) => a + e.amount, 0)
  const ty = tab === 'water' ? 'water' : 'feed'
  const buckets = Array.from({ length: 6 }, (_, i) => today.filter((e) => e.type === ty && new Date(e.ts).getHours() >= i * 4 && new Date(e.ts).getHours() < i * 4 + 4).reduce((a, e) => a + e.amount, 0))
  const mx = Math.max(...buckets, 1)
  const list = act.filter((e) => tab === 'all' || e.type === tab)
  return (
    <div className="space-y-4"><Title>{t('histTitle')}</Title>
      <div className="grid grid-cols-2 gap-3">
        <div className="card"><Ico I={Utensils} /><p className="muted mt-2">{t('totFoodToday')}</p><p className="text-3xl font-bold">{sum('feed')} g</p></div>
        <div className="card"><Ico I={Droplet} c="sky" /><p className="muted mt-2">{t('totWaterToday')}</p><p className="text-3xl font-bold">{sum('water')} ml</p></div>
      </div>
      <Tabs list={[['all', t('all')], ['feed', t('food')], ['water', t('water')]]} v={tab} set={setTab} />
      <div className="card"><p className="mb-3 font-semibold">{t('chart')} ({ty === 'feed' ? t('food') : t('water')})</p>
        <div className="flex h-36 items-end justify-around gap-2">{buckets.map((b, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><div className={`w-full max-w-[36px] rounded-t-md ${ty === 'feed' ? 'bg-violet-500' : 'bg-sky-500'}`} style={{ height: Math.max(4, (b / mx) * 85) + '%' }} title={b + ''} /><span className="text-[11px] text-slate-400">{String(i * 4).padStart(2, '0')}:00</span></div>
        ))}</div></div>
      <div className="space-y-2">
        {list.length === 0 && <p className="muted card">{t('noAct')}</p>}
        {list.map((e) => (
          <div key={e.id} className="card flex items-center gap-3 !p-3"><Ico I={e.type === 'feed' ? Utensils : Droplet} c={e.type === 'feed' ? 'violet' : 'sky'} /><div className="flex-1"><p className="font-semibold">{evTitle(e, t)}</p><p className="muted">{evDesc(e, t)}</p></div><span className="muted text-xs">{new Date(e.ts).toLocaleDateString(loc(lang), { day: 'numeric', month: 'short' })} {fmt(e.ts, lang)}</span></div>
        ))}
      </div>
    </div>
  )
}

export function Profile({ go }) {
  const { prefs, setPrefs, lang, t } = useDevice()
  return (
    <div className="mx-auto max-w-xl space-y-4"><Title>{t('profile')}</Title>
      <div className="card flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-white"><Cat size={30} /></div>
        <div className="flex-1"><p className="text-lg font-bold">{prefs.name}</p><p className="muted">{prefs.email}</p></div>
        <button aria-label={t('editProfile')} onClick={() => go('edit')}><Pencil size={18} /></button></div>
      <div className="card !py-1">
        <Row icon={User} label={t('account')} onClick={() => go('edit')} />
        <Row icon={Settings} label={t('devSettings')} onClick={() => go('settings')} />
        <Row icon={Bell} label={t('notif')} onClick={() => go('notif')} />
        <Row icon={Globe} label={t('language')} right={t('langName')} onClick={() => setPrefs({ ...prefs, lang: lang === 'id' ? 'en' : 'id' })} />
        <Row icon={Info} label={t('about')} right="v1.1.0" />
      </div>
      <button onClick={() => { if (confirm(t('confirmReset'))) { localStorage.clear(); location.reload() } }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500 py-3 font-semibold text-rose-500"><LogOut size={18} />{t('logout')}</button>
    </div>
  )
}

export function Settings_({ go }) {
  const { cfg, setCfg, status, prefs, setPrefs, command, t } = useDevice()
  const [f, setF] = useState(cfg)
  const st = status === 'online' ? [t('ok'), true] : status === 'connecting' ? [t('connecting'), false] : status === 'demo' ? [t('demo'), false] : [t('offline'), false]
  return (
    <div className="mx-auto max-w-xl space-y-4"><Title back="profile" go={go}>{t('devSettings')}</Title>
      <div className="card flex items-center gap-3"><Ico I={FlaskConical} c="amber" /><div className="flex-1"><p className="font-semibold">{t('demoMode')}</p><p className="muted">{t('demoModeD')}</p></div><Toggle on={prefs.demo} set={(v) => setPrefs({ ...prefs, demo: v })} /></div>
      <div className="card space-y-3">
        <div className="flex items-center justify-between"><p className="font-semibold">{t('mqttConn')}</p><span className={`rounded-full px-3 py-1 text-xs font-semibold ${st[1] ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/15 text-slate-400'}`}>{st[0]}</span></div>
        {[['url', 'broker'], ['sub', 'topicSub'], ['pub', 'topicPub']].map(([k, l]) => (
          <label key={k} className="block text-sm"><span className="muted">{t(l)}</span><input className="input mt-1" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>
        ))}
        <button className="btn-p w-full" onClick={() => setCfg(f)}>{t('saveConn')}</button>
      </div>
      <div className="card !py-1">
        <div className="flex items-center gap-3 border-b border-slate-100 py-3 dark:border-indigo-500/10"><Ico I={Bell} c="green" /><span className="flex-1 font-medium">{t('push')}</span><Toggle on={prefs.push} set={(v) => setPrefs({ ...prefs, push: v })} /></div>
        <div className="flex items-center gap-3 border-b border-slate-100 py-3 dark:border-indigo-500/10"><Ico I={Radio} c="amber" /><span className="flex-1 font-medium">{t('eco')}</span><Toggle on={prefs.eco} set={(v) => setPrefs({ ...prefs, eco: v })} /></div>
        <Row icon={Scale} label={t('calScale')} onClick={() => command('calibrate_scale')} />
        <Row icon={Droplet} c="sky" label={t('calWater')} onClick={() => command('calibrate_water')} />
      </div>
    </div>
  )
}

export function EditProfile({ go }) {
  const { prefs, setPrefs, notify, t } = useDevice()
  const [f, setF] = useState(prefs)
  const fld = (k, l, type = 'text') => <label className="block text-sm"><span className="muted">{l}</span><input type={type} className="input mt-1" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></label>
  const breeds = [['Kucing Domestik', 'b1'], ['Persia', 'b2'], ['Anggora', 'b3'], ['Maine Coon', 'b4'], ['Lainnya', 'b5']]
  return (
    <div className="mx-auto max-w-md space-y-4"><Title back="profile" go={go}>{t('editProfile')}</Title>
      <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-white"><Cat size={44} /></div>
      {fld('name', t('name'))}{fld('email', t('email'), 'email')}
      <label className="block text-sm"><span className="muted">{t('breed')}</span>
        <select className="input mt-1" value={f.breed} onChange={(e) => setF({ ...f, breed: e.target.value })}>{breeds.map(([v, k]) => <option key={v} value={v}>{t(k)}</option>)}</select></label>
      {fld('birth', t('birth'), 'date')}
      <button className="btn-p w-full" onClick={() => { setPrefs(f); notify(t('saved')); go('profile') }}>{t('save')}</button>
    </div>
  )
}
