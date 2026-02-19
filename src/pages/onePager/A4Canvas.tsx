import { DndContext, DragEndEvent, useDraggable } from '@dnd-kit/core'
import { Rnd } from 'react-rnd'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { create } from 'zustand'
import { toast } from 'sonner'
import { createApiInstance } from '@/lib/api'
import FirebaseService from '@/services/firebase.service'
import { useMemo, useRef, useState } from 'react'

type BlockType = 'infoTable' | 'text' | 'highlights' | 'imageGroup'

type BlockBase = {
  id: string
  type: BlockType
  x: number
  y: number
  w: number
  h: number
  data: any
}

type SheetState = {
  headerTitle: string
  headerSubtitle: string
  blocks: BlockBase[]
  selectedId: string | null
  setHeader: (t: string, s: string) => void
  addBlock: (type: BlockType, x: number, y: number) => void
  updateBlock: (id: string, patch: Partial<BlockBase>) => void
  updateBlockData: (id: string, data: any) => void
  select: (id: string | null) => void
  remove: (id: string) => void
}

const genId = () => `${Date.now().toString(36)}-${Math.round(Math.random() * 1e6).toString(36)}`

const useSheetStore = create<SheetState>((set, get) => ({
  headerTitle: 'Título',
  headerSubtitle: 'Subtítulo',
  blocks: [],
  selectedId: null,
  setHeader: (t, s) => set({ headerTitle: t, headerSubtitle: s }),
  addBlock: (type, x, y) => {
    const id = genId()
    const base: Record<BlockType, { w: number; h: number; data: any }> = {
      infoTable: { w: 360, h: 180, data: { rows: [['Chave', 'Valor'], ['Item', 'Texto']] } },
      text: { w: 360, h: 160, data: { title: 'Título', paragraph: 'Texto do parágrafo' } },
      highlights: { w: 360, h: 160, data: { items: ['Destaque 1', 'Destaque 2', 'Destaque 3'] } },
      imageGroup: { w: 360, h: 220, data: { images: [''] } },
    }
    const def = base[type]
    set({ blocks: [...get().blocks, { id, type, x, y, w: def.w, h: def.h, data: def.data }], selectedId: id })
  },
  updateBlock: (id, patch) =>
    set({
      blocks: get().blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }),
  updateBlockData: (id, data) =>
    set({
      blocks: get().blocks.map((b) => (b.id === id ? { ...b, data } : b)),
    }),
  select: (id) => set({ selectedId: id }),
  remove: (id) => set({ blocks: get().blocks.filter((b) => b.id !== id), selectedId: null }),
}))

const PaletteItem = ({ type, label }: { type: BlockType; label: string }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `palette-${type}`, data: { type } })
  const style = useMemo(
    () => ({
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      opacity: isDragging ? 0.6 : 1,
    }),
    [transform, isDragging],
  )
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="px-2 py-1 rounded border border-neutral-300 bg-white cursor-grab active:cursor-grabbing text-sm">
      {label}
    </div>
  )
}

const InfoTable = ({ data, onChange }: { data: any; onChange: (d: any) => void }) => {
  const rows = data.rows as string[][]
  const setCell = (r: number, c: number, value: string) => {
    const copy = rows.map((row) => [...row])
    copy[r][c] = value
    onChange({ rows: copy })
  }
  return (
    <div className="w-full h-full p-3 bg-white">
      <table className="w-full h-full border border-neutral-300 text-xs">
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="odd:bg-neutral-50">
              {row.map((cell, ci) => (
                <td key={ci} className="border border-neutral-300 p-1">
                  <Input value={cell} onChange={(e) => setCell(ri, ci, e.target.value)} className="h-7 text-xs" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const TextBlock = ({ data, onChange }: { data: any; onChange: (d: any) => void }) => {
  return (
    <div className="w-full h-full p-3 bg-white">
      <Input value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} className="mb-2 font-semibold" />
      <textarea value={data.paragraph} onChange={(e) => onChange({ ...data, paragraph: e.target.value })} className="w-full h-[calc(100%-40px)] border rounded p-2 text-sm resize-none" />
    </div>
  )
}

const Highlights = ({ data, onChange }: { data: any; onChange: (d: any) => void }) => {
  const add = () => onChange({ items: [...data.items, 'Novo item'] })
  const remove = (idx: number) => onChange({ items: data.items.filter((_: any, i: number) => i !== idx) })
  const set = (idx: number, v: string) => onChange({ items: data.items.map((x: string, i: number) => (i === idx ? v : x)) })
  return (
    <div className="w-full h-full p-3 bg-white">
      <div className="space-y-2">
        {data.items.map((it: string, i: number) => (
          <div key={i} className="flex gap-2">
            <Input value={it} onChange={(e) => set(i, e.target.value)} className="text-sm" />
            <Button variant="outline" onClick={() => remove(i)} disabled={data.items.length <= 1}>
              Remover
            </Button>
          </div>
        ))}
        <Button onClick={add} disabled={data.items.length >= 8}>
          Adicionar
        </Button>
      </div>
    </div>
  )
}

const ImageGroup = ({ data, onChange }: { data: any; onChange: (d: any) => void }) => {
  const add = () => {
    if (data.images.length >= 3) return
    onChange({ images: [...data.images, ''] })
  }
  const remove = (idx: number) => onChange({ images: data.images.filter((_: any, i: number) => i !== idx) })
  const set = (idx: number, v: string) => onChange({ images: data.images.map((x: string, i: number) => (i === idx ? v : x)) })
  const cols = data.images.length === 1 ? 'grid-cols-1' : data.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
  return (
    <div className="w-full h-full p-3 bg-white">
      <div className="grid gap-2 mb-2">
        {data.images.map((src: string, i: number) => (
          <div key={i} className="flex gap-2">
            <Input placeholder="URL da imagem" value={src} onChange={(e) => set(i, e.target.value)} />
            <Button variant="outline" onClick={() => remove(i)} disabled={data.images.length <= 1}>
              Remover
            </Button>
          </div>
        ))}
      </div>
      <div className={`grid ${cols} gap-2 w-full`}>
        {data.images.map((src: string, i: number) => (
          <div key={i} className="w-full h-28 bg-neutral-100 flex items-center justify-center border">
            {src ? <img src={src} className="object-contain w-full h-full" /> : <span className="text-xs text-neutral-500">Pré-visualização</span>}
          </div>
        ))}
      </div>
      <div className="mt-2">
        <Button onClick={add} disabled={data.images.length >= 3}>
          Adicionar imagem
        </Button>
      </div>
    </div>
  )
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const A4Canvas = () => {
  const { headerTitle, headerSubtitle, blocks, selectedId, setHeader, addBlock, updateBlock, updateBlockData, select, remove } = useSheetStore()
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  const onDragEnd = (e: DragEndEvent) => {
    const t = e.active?.data?.current as { type?: BlockType } | undefined
    if (!t?.type) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const clientX = (e.activatorEvent as any)?.clientX ?? rect.left
    const clientY = (e.activatorEvent as any)?.clientY ?? rect.top
    const x = clamp(clientX - rect.left - 40, 0, rect.width - 120)
    const y = clamp(clientY - rect.top - 40, 60, rect.height - 120)
    addBlock(t.type, x, y)
  }

  const renderBlock = (b: BlockBase) => {
    const selected = selectedId === b.id
    const onResizeStop = (_: any, __: any, ref: HTMLDivElement, ___: any, pos: { x: number; y: number }) => {
      const parent = canvasRef.current
      if (!parent) return
      const pw = parent.clientWidth
      const ph = parent.clientHeight
      const w = clamp(ref.offsetWidth, 60, pw)
      const h = clamp(ref.offsetHeight, 60, ph)
      const x = clamp(pos.x, 0, pw - w)
      const y = clamp(pos.y, 60, ph - h)
      updateBlock(b.id, { x, y, w, h })
    }
    const onDragStop = (_: any, pos: { x: number; y: number }) => {
      const parent = canvasRef.current
      if (!parent) return
      const pw = parent.clientWidth
      const ph = parent.clientHeight
      const w = b.w
      const h = b.h
      const x = clamp(pos.x, 0, pw - w)
      const y = clamp(pos.y, 60, ph - h)
      updateBlock(b.id, { x, y })
    }
    const content =
      b.type === 'infoTable' ? (
        <InfoTable data={b.data} onChange={(d) => updateBlockData(b.id, d)} />
      ) : b.type === 'text' ? (
        <TextBlock data={b.data} onChange={(d) => updateBlockData(b.id, d)} />
      ) : b.type === 'highlights' ? (
        <Highlights data={b.data} onChange={(d) => updateBlockData(b.id, d)} />
      ) : (
        <ImageGroup data={b.data} onChange={(d) => updateBlockData(b.id, d)} />
      )
    return (
      <Rnd
        key={b.id}
        size={{ width: b.w, height: b.h }}
        position={{ x: b.x, y: b.y }}
        bounds="parent"
        onDragStop={onDragStop}
        onResizeStop={onResizeStop}
        onMouseDown={() => select(b.id)}
        className={selected ? 'border-2 border-dashed border-blue-500 bg-white' : 'border border-neutral-300 bg-white'}
        minWidth={120}
        minHeight={80}
      >
        <div className="w-full h-full">{content}</div>
        {selected ? (
          <div className="absolute -top-8 right-0 flex gap-2">
            <Button size="sm" variant="outline" onClick={() => remove(b.id)}>
              Remover
            </Button>
          </div>
        ) : null}
      </Rnd>
    )
  }

  const buildPrintCss = () => {
    return `
@page { size: A4; margin: 0; }
html, body { padding: 0; margin: 0; }
.sheet { width: 210mm; height: 297mm; position: relative; font-family: Inter, Arial, sans-serif; }
.header { position: absolute; top: 0; left: 0; right: 0; height: 40mm; padding: 12mm 12mm 0 12mm; box-sizing: border-box; display: flex; flex-direction: column; gap: 4mm; }
.title { font-size: 18pt; font-weight: 700; color: #111827; }
.subtitle { font-size: 11pt; color: #374151; }
.content { position: absolute; top: 40mm; left: 0; right: 0; bottom: 0; }
.block { position: absolute; background: #ffffff; border: 1px solid #e5e7eb; box-sizing: border-box; }
.tbl { width: 100%; border-collapse: collapse; }
.tbl td, .tbl th { border: 1px solid #e5e7eb; padding: 6px; font-size: 10pt; }
.hl { display: grid; gap: 6px; }
.hl-item { font-size: 10pt; }
.ig { display: grid; gap: 6px; width: 100%; height: 100%; }
.ig-1 { grid-template-columns: 1fr; }
.ig-2 { grid-template-columns: 1fr 1fr; }
.ig-3 { grid-template-columns: 1fr 1fr 1fr; }
.ig img { width: 100%; height: 100%; object-fit: contain; }
`
  }

  const pxToMm = (px: number, canvasWidthPx: number) => (px / canvasWidthPx) * 210

  const buildPrintHtml = () => {
    const cw = canvasRef.current?.clientWidth || 794
    const blocksHtml = blocks
      .map((b) => {
        const x = pxToMm(b.x, cw)
        const y = pxToMm(b.y, cw)
        const w = pxToMm(b.w, cw)
        const h = pxToMm(b.h, cw)
        if (b.type === 'infoTable') {
          const rows = (b.data.rows as string[][])
            .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`)
            .join('')
          return `<div class="block" style="left:${x}mm;top:${y + 40}mm;width:${w}mm;height:${h}mm;"><table class="tbl">${rows}</table></div>`
        }
        if (b.type === 'text') {
          return `<div class="block" style="left:${x}mm;top:${y + 40}mm;width:${w}mm;height:${h}mm;"><div style="padding:8px;"><div style="font-weight:700;font-size:12pt;margin-bottom:6px;">${b.data.title}</div><div style="font-size:10pt;line-height:1.35;">${b.data.paragraph}</div></div></div>`
        }
        if (b.type === 'highlights') {
          const items = (b.data.items as string[]).map((t) => `<div class="hl-item">• ${t}</div>`).join('')
          return `<div class="block" style="left:${x}mm;top:${y + 40}mm;width:${w}mm;height:${h}mm;"><div class="hl" style="padding:8px;">${items}</div></div>`
        }
        const imgs = (b.data.images as string[]).map((src) => `<div><img src="${src || ''}"/></div>`).join('')
        const cls = `ig ig-${b.data.images.length}`
        return `<div class="block" style="left:${x}mm;top:${y + 40}mm;width:${w}mm;height:${h}mm;"><div class="${cls}">${imgs}</div></div>`
      })
      .join('')
    return `<div class="sheet"><div class="header"><div class="title">${headerTitle}</div><div class="subtitle">${headerSubtitle}</div></div><div class="content">${blocksHtml}</div></div>`
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await FirebaseService.setDocument('one_pager', 'default', { headerTitle, headerSubtitle, blocks })
      toast('Lâmina salva')
    } catch (e) {
      toast('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const handleGeneratePDF = async () => {
    const baseURL = import.meta.env.VITE_API_GENERATORS
    const uriGsUtil = import.meta.env.VITE_GOOGLE_STORAGE_URI
    const api = createApiInstance(baseURL)
    const htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><style>${buildPrintCss()}</style></head><body>${buildPrintHtml()}</body></html>`
    const ts = Date.now()
    const data = {
      html: htmlContent,
      htmlContent: null,
      cssContent: null,
      uriGsUtil,
      filePath: `one-pagers/${ts}`,
      pdfName: `one-pager-${ts}`,
      useHtmlContent: false,
      useCssContent: false,
      urlFontFamily: null,
    }
    setGenerating(true)
    try {
      const res = await api.post('/pdf-generator', data)
      if (res.data?.success) {
        toast('PDF gerado')
      } else {
        toast('Falha ao gerar PDF')
      }
    } catch (e) {
      toast('Erro ao gerar PDF')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-12 gap-3 h-full">
        <div className="col-span-3 h-[calc(100vh-160px)] bg-neutral-50 border p-3 rounded">
          <div className="mb-3 text-sm font-semibold">Componentes</div>
          <div className="flex flex-col gap-2">
            <PaletteItem type="infoTable" label="InfoTable" />
            <PaletteItem type="text" label="TextBlock" />
            <PaletteItem type="highlights" label="Highlights" />
            <PaletteItem type="imageGroup" label="ImageGroup" />
          </div>
        </div>
        <div className="col-span-9">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2">
              <Input value={headerTitle} onChange={(e) => setHeader(e.target.value, headerSubtitle)} placeholder="Título" className="w-64" />
              <Input value={headerSubtitle} onChange={(e) => setHeader(headerTitle, e.target.value)} placeholder="Subtítulo" className="w-64" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSave} disabled={saving}>
                Salvar
              </Button>
              <Button onClick={handleGeneratePDF} disabled={generating}>
                Gerar PDF
              </Button>
            </div>
          </div>
          <div ref={canvasRef} className="relative w-[210mm] h-[297mm] shadow-2xl border border-neutral-800 bg-white overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-40 bg-neutral-100 border-b border-neutral-300 px-6 py-4 flex flex-col justify-center">
              <div className="text-2xl font-bold text-neutral-900">{headerTitle}</div>
              <div className="text-sm text-neutral-600">{headerSubtitle}</div>
            </div>
            <div className="absolute inset-x-0 top-40 bottom-0">
              {blocks.map((b) => renderBlock(b))}
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  )
}
export default A4Canvas;
