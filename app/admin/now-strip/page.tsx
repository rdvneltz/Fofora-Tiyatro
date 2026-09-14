'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Loader2, Pencil, Check,
  Rows3, ArrowLeftRight, Megaphone, MousePointerClick
} from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'
import ImageUploader from '@/components/ImageUploader'

interface StripItem {
  id: string
  blockId: string
  label?: string
  text: string
  order: number
  active: boolean
  clickAction: string
  linkUrl?: string
  sectionId?: string
  modalMediaType?: string
  modalMediaUrl?: string
  modalTitle?: string
  modalBody?: string
  ctaLabel?: string
}

interface StripBlock {
  id: string
  type: string
  heading?: string
  order: number
  active: boolean
  durationSeconds: number
  marqueeSpeed: number
  items: StripItem[]
}

const blockTypes = [
  { value: 'items', label: 'Maddeler', hint: 'Yan yana 3-4 başlık', icon: Rows3, defaultHeading: 'Şu Anda Fofora’da' },
  { value: 'marquee', label: 'Kayan Yazı', hint: 'Tek satırda akan metin', icon: ArrowLeftRight, defaultHeading: '' },
  { value: 'spotlight', label: 'Öne Çıkan Duyuru', hint: 'Tek büyük vurgu + buton', icon: Megaphone, defaultHeading: '' },
]
const sectionOptions = [
  ['', 'Seçiniz'], ['hero', 'Üst kısım (Hero)'], ['oyunlar', 'Oyunlar / Takvim'], ['egitimler', 'Eğitimler'],
  ['neler-yaptik', 'Neler Yaptık'], ['haberler', 'Bizden Haberler'], ['ekip', 'Ekibimiz'], ['iletisim', 'İletişim'],
]
const emptyItemForm = { label: '', text: '', clickAction: 'none', linkUrl: '', sectionId: '', modalMediaType: '', modalMediaUrl: '', modalTitle: '', modalBody: '', ctaLabel: '' }

function ItemForm({ initial, onSave, onCancel, saving }: { initial: typeof emptyItemForm; onSave: (v: typeof emptyItemForm) => void; onCancel: () => void; saving: boolean }) {
  const [v, setV] = useState(initial)
  const set = (k: string, val: string) => setV(s => ({ ...s, [k]: val }))
  return (
    <div className="bg-navy-900/60 rounded-lg p-4 border border-blue-500/30 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-white/70 text-xs font-medium">Kısa etiket (opsiyonel)
          <input value={v.label} onChange={e => set('label', e.target.value)} placeholder="SIRADAKİ OYUN" maxLength={30} className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <span className="block mt-1 text-white/30 text-[10px]">{v.label.length}/30 — şeritte tek satırda görünür, uzunu kesilir</span>
        </label>
        <label className="text-white/70 text-xs font-medium">Ana metin *
          <input value={v.text} onChange={e => set('text', e.target.value)} placeholder="Yeni sezon kayıtları başladı" maxLength={70} className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <span className="block mt-1 text-white/30 text-[10px]">{v.text.length}/70 — şeritte tek satırda görünür, uzunu kesilir</span>
        </label>
      </div>
      <label className="block text-white/70 text-xs font-medium">Tıklayınca ne olsun?
        <select value={v.clickAction} onChange={e => set('clickAction', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="none">Hiçbir şey — tıklanamaz</option>
          <option value="modal">Modal aç (yazı + foto/video)</option>
          <option value="expand">Aşağı doğru genişlet (şeridin altında açılsın)</option>
          <option value="link">Bir bağlantıya git</option>
          <option value="section">Sayfada bir bölüme kaydır</option>
        </select>
      </label>
      {v.clickAction === 'link' && (
        <label className="block text-white/70 text-xs font-medium">Bağlantı
          <input value={v.linkUrl} onChange={e => set('linkUrl', e.target.value)} placeholder="https://... veya /oyunlar" className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
      )}
      {v.clickAction === 'section' && (
        <label className="block text-white/70 text-xs font-medium">Bölüm
          <select value={v.sectionId} onChange={e => set('sectionId', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {sectionOptions.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
        </label>
      )}
      {(v.clickAction === 'modal' || v.clickAction === 'expand') && (
        <div className="space-y-3 border-t border-white/10 pt-3">
          <label className="block text-white/70 text-xs font-medium">İçerik türü
            <div className="mt-1 grid grid-cols-4 gap-2">
              {[['', 'Yok'], ['image', 'Foto'], ['video', 'Video'], ['youtube', 'YouTube']].map(([val, label]) => (
                <button key={val} type="button" onClick={() => set('modalMediaType', val)} className={`px-2 py-2 rounded-lg text-xs font-medium border-2 transition-all ${v.modalMediaType === val ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'}`}>{label}</button>
              ))}
            </div>
          </label>
          {v.modalMediaType === 'youtube' ? (
            <label className="block text-white/70 text-xs font-medium">YouTube URL
              <input value={v.modalMediaUrl} onChange={e => set('modalMediaUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
          ) : (v.modalMediaType === 'image' || v.modalMediaType === 'video') && (
            <ImageUploader currentUrl={v.modalMediaUrl} onUrlChange={u => set('modalMediaUrl', u)} label={v.modalMediaType === 'video' ? 'Video dosyası' : 'Fotoğraf'} folder="now-strip" acceptVideo={v.modalMediaType === 'video'} />
          )}
          <label className="block text-white/70 text-xs font-medium">Başlık
            <input value={v.modalTitle} onChange={e => set('modalTitle', e.target.value)} placeholder="Açılan içeriğin başlığı" className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <label className="block text-white/70 text-xs font-medium">Açıklama metni
            <textarea value={v.modalBody} onChange={e => set('modalBody', e.target.value)} rows={3} placeholder="Detay yazısı..." className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-white/70 text-xs font-medium">Buton metni (opsiyonel)
              <input value={v.ctaLabel} onChange={e => set('ctaLabel', e.target.value)} placeholder="Devamını gör" className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
            <label className="text-white/70 text-xs font-medium">Buton bağlantısı (opsiyonel)
              <input value={v.linkUrl} onChange={e => set('linkUrl', e.target.value)} placeholder="https://... veya /oyunlar" className="mt-1 w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
          </div>
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <button type="button" disabled={saving || !v.text.trim()} onClick={() => onSave(v)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-all">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Kaydet
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-all">İptal</button>
      </div>
    </div>
  )
}

function ItemRow({ item, index, total, busy, onMove, onToggle, onEdit, onDelete }: {
  item: StripItem; index: number; total: number; busy: boolean
  onMove: (dir: 'up' | 'down') => void; onToggle: () => void; onEdit: () => void; onDelete: () => void
}) {
  const actionLabel: Record<string, string> = { none: 'Tıklanamaz', modal: 'Modal açar', expand: 'Aşağı genişler', link: 'Bağlantıya gider', section: 'Bölüme kaydırır' }
  return (
    <div className={`flex flex-wrap items-center gap-3 p-3 rounded-lg border ${item.active ? 'border-white/15 bg-white/5' : 'border-white/5 bg-white/[0.02] opacity-60'}`}>
      <div className="flex-1 min-w-[160px]">
        {item.label && <div className="text-blue-300 text-[10px] font-bold tracking-wide">{item.label}</div>}
        <div className="text-white text-sm font-medium">{item.text}</div>
        <div className="text-white/40 text-xs flex items-center gap-1 mt-0.5"><MousePointerClick className="w-3 h-3" /> {actionLabel[item.clickAction] || 'Tıklanamaz'}</div>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={onToggle} disabled={busy} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 ${item.active ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-gray-500/20 text-gray-400 border-gray-500/40'}`}>{item.active ? 'Aktif' : 'Pasif'}</button>
        <button onClick={() => onMove('up')} disabled={busy || index === 0} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-all"><ChevronUp className="w-4 h-4 text-white" /></button>
        <button onClick={() => onMove('down')} disabled={busy || index === total - 1} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-all"><ChevronDown className="w-4 h-4 text-white" /></button>
        <button onClick={onEdit} disabled={busy} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 transition-all"><Pencil className="w-4 h-4 text-white" /></button>
        <button onClick={onDelete} disabled={busy} className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 disabled:opacity-40 transition-all"><Trash2 className="w-4 h-4 text-red-400" /></button>
      </div>
    </div>
  )
}

function BlockCard({ block, index, total, busy, onMove, onToggleActive, onSaveSettings, onDelete, onAddItem, onUpdateItem, onMoveItem, onToggleItem, onDeleteItem }: {
  block: StripBlock; index: number; total: number; busy: boolean
  onMove: (dir: 'up' | 'down') => void; onToggleActive: () => void
  onSaveSettings: (patch: Partial<StripBlock>) => void; onDelete: () => void
  onAddItem: (v: typeof emptyItemForm) => Promise<void>
  onUpdateItem: (id: string, v: typeof emptyItemForm) => Promise<void>
  onMoveItem: (itemId: string, dir: 'up' | 'down') => void
  onToggleItem: (item: StripItem) => void
  onDeleteItem: (id: string) => void
}) {
  const meta = blockTypes.find(t => t.value === block.type) || blockTypes[0]
  const Icon = meta.icon
  const [heading, setHeading] = useState(block.heading || '')
  const [duration, setDuration] = useState(block.durationSeconds)
  const [speed, setSpeed] = useState(block.marqueeSpeed)
  const [dirty, setDirty] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [addingItem, setAddingItem] = useState(false)
  const [savingItem, setSavingItem] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  const saveSettings = async () => {
    setSavingSettings(true)
    await onSaveSettings({ heading, durationSeconds: duration, marqueeSpeed: speed })
    setSavingSettings(false)
    setDirty(false)
  }

  return (
    <div className={`bg-white/5 backdrop-blur-lg rounded-xl border ${block.active ? 'border-blue-500/40' : 'border-white/10'} overflow-hidden`}>
      <div className="p-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-blue-300 flex-shrink-0"><Icon className="w-5 h-5" /><span className="font-semibold text-sm">{meta.label}</span></div>
        <label className="flex-1 min-w-[160px]">
          <input value={heading} onChange={e => { setHeading(e.target.value); setDirty(true) }} placeholder="Şerit başlığı (opsiyonel)" className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </label>
        <label className="flex items-center gap-1.5 text-white/60 text-xs flex-shrink-0">
          {total > 1 ? 'Ekranda kalma süresi' : 'Süre'}
          <input type="number" min={2} max={60} value={duration} onChange={e => { setDuration(Number(e.target.value) || 8); setDirty(true) }} className="w-16 px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm" /> sn
        </label>
        {block.type === 'marquee' && (
          <label className="flex items-center gap-1.5 text-white/60 text-xs flex-shrink-0">
            Kayma hızı
            <input type="number" min={6} max={120} value={speed} onChange={e => { setSpeed(Number(e.target.value) || 28); setDirty(true) }} className="w-16 px-2 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm" /> sn/tur
          </label>
        )}
        {dirty && (
          <button onClick={saveSettings} disabled={savingSettings} className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-all">
            {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Kaydet
          </button>
        )}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
          <button onClick={onToggleActive} disabled={busy} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 ${block.active ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-gray-500/20 text-gray-400 border-gray-500/40'}`}>{block.active ? 'Aktif' : 'Pasif'}</button>
          <button onClick={() => onMove('up')} disabled={busy || index === 0} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-all"><ChevronUp className="w-4 h-4 text-white" /></button>
          <button onClick={() => onMove('down')} disabled={busy || index === total - 1} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-all"><ChevronDown className="w-4 h-4 text-white" /></button>
          <button onClick={onDelete} disabled={busy} className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 disabled:opacity-40 transition-all"><Trash2 className="w-4 h-4 text-red-400" /></button>
        </div>
      </div>
      {block.type === 'spotlight' && block.items.filter(i => i.active).length > 1 && (
        <p className="px-5 pb-2 text-yellow-400/80 text-xs">Bu tasarımda sadece ilk aktif madde büyük duyuru olarak gösterilir, diğerleri gösterilmez.</p>
      )}
      <div className="border-t border-white/10 p-5 space-y-3">
        {block.items.length === 0 && !addingItem && <p className="text-white/40 text-sm">Henüz madde eklenmemiş.</p>}
        {block.items.map((item, i) => editingItemId === item.id ? (
          <ItemForm key={item.id} saving={savingItem} initial={{ label: item.label || '', text: item.text, clickAction: item.clickAction, linkUrl: item.linkUrl || '', sectionId: item.sectionId || '', modalMediaType: item.modalMediaType || '', modalMediaUrl: item.modalMediaUrl || '', modalTitle: item.modalTitle || '', modalBody: item.modalBody || '', ctaLabel: item.ctaLabel || '' }}
            onCancel={() => setEditingItemId(null)}
            onSave={async v => { setSavingItem(true); await onUpdateItem(item.id, v); setSavingItem(false); setEditingItemId(null) }} />
        ) : (
          <ItemRow key={item.id} item={item} index={i} total={block.items.length} busy={busy}
            onMove={dir => onMoveItem(item.id, dir)} onToggle={() => onToggleItem(item)}
            onEdit={() => setEditingItemId(item.id)} onDelete={() => onDeleteItem(item.id)} />
        ))}
        {addingItem ? (
          <ItemForm saving={savingItem} initial={emptyItemForm} onCancel={() => setAddingItem(false)}
            onSave={async v => { setSavingItem(true); await onAddItem(v); setSavingItem(false); setAddingItem(false) }} />
        ) : (
          <button onClick={() => setAddingItem(true)} className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all"><Plus className="w-4 h-4" /> Madde ekle</button>
        )}
      </div>
    </div>
  )
}

export default function AdminNowStrip() {
  const { status } = useSession()
  const router = useRouter()
  const [blocks, setBlocks] = useState<StripBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (status === 'unauthenticated') router.push('/admin/login') }, [status, router])
  useEffect(() => { fetchBlocks() }, [])

  const fetchBlocks = async () => {
    try {
      const { data } = await axios.get('/api/now-strip')
      setBlocks(data.sort((a: StripBlock, b: StripBlock) => a.order - b.order).map((b: StripBlock) => ({ ...b, items: [...b.items].sort((x, y) => x.order - y.order) })))
    } catch (error) {
      console.error('Failed to fetch now-strip blocks', error)
    } finally {
      setLoading(false)
    }
  }

  const addBlock = async (type: string) => {
    if (busy) return
    setBusy(true)
    try {
      const meta = blockTypes.find(t => t.value === type)!
      const maxOrder = blocks.length > 0 ? Math.max(...blocks.map(b => b.order)) : -1
      await axios.post('/api/now-strip', { type: 'block', blockType: type, heading: meta.defaultHeading, order: maxOrder + 1 })
      await fetchBlocks()
    } catch { alert('Tasarım eklenemedi') } finally { setBusy(false) }
  }

  const moveBlock = async (index: number, dir: 'up' | 'down') => {
    if (busy || (dir === 'up' && index === 0) || (dir === 'down' && index === blocks.length - 1)) return
    const arr = [...blocks], target = dir === 'up' ? index - 1 : index + 1
    ;[arr[index], arr[target]] = [arr[target], arr[index]]
    setBusy(true)
    try {
      for (let i = 0; i < arr.length; i++) await axios.put('/api/now-strip', { type: 'block', id: arr[i].id, order: i })
      await fetchBlocks()
    } catch { alert('Sıralama güncellenemedi') } finally { setBusy(false) }
  }

  const toggleBlockActive = async (block: StripBlock) => {
    if (busy) return
    setBusy(true)
    try { await axios.put('/api/now-strip', { type: 'block', id: block.id, active: !block.active }); await fetchBlocks() }
    catch { alert('Güncellenemedi') } finally { setBusy(false) }
  }

  const saveBlockSettings = async (block: StripBlock, patch: Partial<StripBlock>) => {
    try { await axios.put('/api/now-strip', { type: 'block', id: block.id, ...patch }); await fetchBlocks() }
    catch { alert('Kaydedilemedi') }
  }

  const deleteBlock = async (id: string) => {
    if (busy || !confirm('Bu tasarımı ve içindeki tüm maddeleri silmek istediğinize emin misiniz?')) return
    setBusy(true)
    try { await axios.delete(`/api/now-strip?type=block&id=${id}`); await fetchBlocks() }
    catch { alert('Silinemedi') } finally { setBusy(false) }
  }

  const addItem = async (blockId: string, v: typeof emptyItemForm) => {
    const block = blocks.find(b => b.id === blockId)
    const maxOrder = block && block.items.length > 0 ? Math.max(...block.items.map(i => i.order)) : -1
    try { await axios.post('/api/now-strip', { type: 'item', blockId, order: maxOrder + 1, ...cleanItem(v) }); await fetchBlocks() }
    catch { alert('Madde eklenemedi') }
  }

  const updateItem = async (id: string, v: typeof emptyItemForm) => {
    try { await axios.put('/api/now-strip', { type: 'item', id, ...cleanItem(v) }); await fetchBlocks() }
    catch { alert('Madde güncellenemedi') }
  }

  const moveItem = async (block: StripBlock, itemId: string, dir: 'up' | 'down') => {
    if (busy) return
    const index = block.items.findIndex(i => i.id === itemId)
    if (index === -1 || (dir === 'up' && index === 0) || (dir === 'down' && index === block.items.length - 1)) return
    const arr = [...block.items], target = dir === 'up' ? index - 1 : index + 1
    ;[arr[index], arr[target]] = [arr[target], arr[index]]
    setBusy(true)
    try {
      for (let i = 0; i < arr.length; i++) await axios.put('/api/now-strip', { type: 'item', id: arr[i].id, order: i })
      await fetchBlocks()
    } catch { alert('Sıralama güncellenemedi') } finally { setBusy(false) }
  }

  const toggleItem = async (item: StripItem) => {
    if (busy) return
    setBusy(true)
    try { await axios.put('/api/now-strip', { type: 'item', id: item.id, active: !item.active }); await fetchBlocks() }
    catch { alert('Güncellenemedi') } finally { setBusy(false) }
  }

  const deleteItem = async (id: string) => {
    if (busy || !confirm('Bu maddeyi silmek istediğinize emin misiniz?')) return
    setBusy(true)
    try { await axios.delete(`/api/now-strip?type=item&id=${id}`); await fetchBlocks() }
    catch { alert('Silinemedi') } finally { setBusy(false) }
  }

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 flex items-center justify-center"><div className="text-white text-xl">Yükleniyor...</div></div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/dashboard" className="text-gold-500 hover:text-gold-400"><ArrowLeft className="w-6 h-6" /></Link>
            <h1 className="text-4xl font-bold text-white">Şimdi Fofora’da Şeridi</h1>
          </div>
          <p className="text-white/60">
            Ana sayfada hero'nun hemen altındaki şerit. Birden fazla tasarım ekleyip aralarında otomatik geçiş yaptırabilir, her maddeye tıklanınca ne olacağını ayrı ayrı belirleyebilirsiniz.
          </p>
        </div>

        {blocks.length > 1 && (
          <p className="mb-4 text-blue-300 text-sm bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-2">
            Birden fazla aktif tasarımınız var — sırayla, her biri kendi süresi kadar ekranda kalacak şekilde otomatik geçiş yapılır.
          </p>
        )}

        <div className="space-y-4 mb-8">
          <AnimatePresence initial={false}>
            {blocks.map((block, index) => (
              <motion.div key={block.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
                <BlockCard
                  block={block} index={index} total={blocks.length} busy={busy}
                  onMove={dir => moveBlock(index, dir)}
                  onToggleActive={() => toggleBlockActive(block)}
                  onSaveSettings={patch => saveBlockSettings(block, patch)}
                  onDelete={() => deleteBlock(block.id)}
                  onAddItem={v => addItem(block.id, v)}
                  onUpdateItem={(id, v) => updateItem(id, v)}
                  onMoveItem={(itemId, dir) => moveItem(block, itemId, dir)}
                  onToggleItem={toggleItem}
                  onDeleteItem={deleteItem}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h2 className="text-white font-semibold mb-3">Yeni tasarım ekle</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {blockTypes.map(t => (
              <button key={t.value} type="button" disabled={busy} onClick={() => addBlock(t.value)} className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-white/10 bg-white/5 text-white/70 hover:border-blue-500/50 hover:text-blue-300 transition-all disabled:opacity-50">
                <t.icon className="w-6 h-6" />
                <span className="text-sm font-semibold">{t.label}</span>
                <span className="text-xs text-white/40 text-center">{t.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-blue-300 font-semibold mb-2 flex items-center gap-2"><Megaphone className="w-5 h-5" /> Önemli Notlar</h3>
          <ul className="text-white/60 text-sm space-y-1 list-disc list-inside">
            <li><b>Maddeler</b> tasarımı hepsini yan yana sabit gösterir (mevcut görünüm); <b>Kayan Yazı</b> maddeleri tek satırda kaydırır; <b>Öne Çıkan Duyuru</b> ilk aktif maddeyi büyük bir buton ile gösterir</li>
            <li>Birden fazla tasarım eklerseniz, her biri kendi süresi kadar gösterilip otomatik sıradakine geçilir</li>
            <li>Her maddeye ayrı ayrı tıklama davranışı tanımlayabilirsiniz: modal, aşağı açılır panel, bağlantı ya da sayfada bir bölüme kaydırma</li>
            <li>Pasif tasarımlar ve pasif maddeler ana sayfada görünmez</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function cleanItem(v: typeof emptyItemForm) {
  return {
    label: v.label || null, text: v.text, clickAction: v.clickAction,
    linkUrl: (v.clickAction === 'none' || v.clickAction === 'section') ? null : v.linkUrl || null,
    sectionId: v.clickAction === 'section' ? v.sectionId || null : null,
    modalMediaType: (v.clickAction === 'modal' || v.clickAction === 'expand') ? v.modalMediaType || null : null,
    modalMediaUrl: (v.clickAction === 'modal' || v.clickAction === 'expand') ? v.modalMediaUrl || null : null,
    modalTitle: (v.clickAction === 'modal' || v.clickAction === 'expand') ? v.modalTitle || null : null,
    modalBody: (v.clickAction === 'modal' || v.clickAction === 'expand') ? v.modalBody || null : null,
    ctaLabel: (v.clickAction === 'modal' || v.clickAction === 'expand') ? v.ctaLabel || null : null,
  }
}
