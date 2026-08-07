import { useEffect, useMemo, useRef, useState } from 'react'
import { Coach } from '../../components/Coach'
import { ART_PROMPTS, CRAYONS, type ArtPrompt } from '../../content/art'
import { uid } from '../../lib/db'
import { sampleContent } from '../../lib/mastery'
import { sfx } from '../../lib/sfx'
import { useStore } from '../../lib/store'
import type { StationProps } from './types'

/**
 * Art Corner.
 *
 * The star is for finishing, never for the drawing itself — nothing here
 * judges what a five-year-old draws. The finished picture is saved to the
 * parent-visible gallery.
 */
export function ArtCorner({ profile, progress, served, onServed, onAnswer, onDone }: StationProps) {
  const { dispatch } = useStore()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawing = useRef(false)
  const [colour, setColour] = useState(CRAYONS[0])
  const [width, setWidth] = useState(10)
  const [touched, setTouched] = useState(false)

  const art = useMemo(() => {
    const [picked] = sampleContent<ArtPrompt>(ART_PROMPTS, progress, 1, served)
    onServed([picked.item.id])
    return picked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Size the backing store to the device pixel ratio so strokes are crisp.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const snapshot =
        canvas.width > 0 ? canvas.toDataURL('image/png') : null
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(dpr, dpr)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.fillStyle = '#fffdf6'
      ctx.fillRect(0, 0, rect.width, rect.height)
      if (snapshot) {
        const img = new Image()
        img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height)
        img.src = snapshot
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    // Capture the pointer so a stroke keeps drawing past the canvas edge.
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    setTouched(true)
    const { x, y } = point(e)
    ctx.strokeStyle = colour
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + 0.1, y + 0.1)
    ctx.stroke()
  }

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = point(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const end = () => {
    drawing.current = false
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.fillStyle = '#fffdf6'
    ctx.fillRect(0, 0, rect.width, rect.height)
    setTouched(false)
    sfx.tap()
  }

  const finish = () => {
    const canvas = canvasRef.current
    if (canvas) {
      // JPEG at modest quality: a gallery of PNGs fills localStorage fast.
      const image = canvas.toDataURL('image/jpeg', 0.7)
      dispatch({
        type: 'addDrawing',
        drawing: {
          id: uid('art'),
          profileId: profile.id,
          day: new Date().toISOString().slice(0, 10),
          prompt: art.item.prompt,
          image,
          at: new Date().toISOString(),
        },
      })
    }
    onAnswer(art.item.id, true)
    sfx.star()
    onDone({ stars: art.paysStars ? 1 : 0, voiceAnswers: 0 })
  }

  return (
    <>
      <Coach line={art.item.prompt} cue={art.item.id} emoji="🎨" />

      <div className="art-stage">
        <canvas
          ref={canvasRef}
          className="art-canvas"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          aria-label="Drawing canvas"
        />

        <div className="crayons">
          {CRAYONS.map((c) => (
            <button
              key={c}
              className="crayon press"
              data-active={c === colour}
              style={{ background: c }}
              onClick={() => {
                setColour(c)
                sfx.tap()
              }}
              aria-label={`Colour ${c}`}
              type="button"
            />
          ))}
        </div>

        <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
          {[6, 12, 24].map((w) => (
            <button
              key={w}
              className="crayon press"
              data-active={w === width}
              style={{ background: 'rgba(255,255,255,0.16)', display: 'grid', placeContent: 'center' }}
              onClick={() => setWidth(w)}
              aria-label={`Brush size ${w}`}
              type="button"
            >
              <span style={{ width: w, height: w, borderRadius: '50%', background: colour }} />
            </button>
          ))}
          <button className="tap-instead press" onClick={clear} type="button">
            🧽 Clear
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', justifyItems: 'center' }}>
        <button className="cta press" onClick={finish} disabled={!touched} type="button">
          {touched ? "I'm finished! ⭐" : 'Draw something first'}
        </button>
      </div>
    </>
  )
}
