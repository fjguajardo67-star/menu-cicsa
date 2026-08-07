/**
 * The drawn world. Every interface glyph in GOAL TIME comes from here —
 * authored SVG in one sticker style: chunky ink outlines, flat fills,
 * two-tone shading, a white glint. Emoji survive only as *content* (the
 * flags and animals a question is about), never as interface.
 */
import type { ReactNode, SVGProps } from 'react'
import type { SkillField } from '../lib/types'

const INK = 'var(--ink-line)'
const SW = 5

interface ArtProps extends SVGProps<SVGSVGElement> {
  size?: number | string
}

const Svg = ({
  size = 48,
  children,
  viewBox = '0 0 100 100',
  ...rest
}: ArtProps & { children: ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
)

/* ---------------------------------------------------------------- */
/* The ball — the club's crest in miniature.                         */
/* ---------------------------------------------------------------- */

export function Ball({ tone = 'white', ...rest }: ArtProps & { tone?: 'white' | 'gold' | 'gray' }) {
  const base = tone === 'gold' ? '#FFC531' : tone === 'gray' ? '#B9C4BC' : '#F7FAF5'
  const shade = tone === 'gold' ? '#E09A00' : tone === 'gray' ? '#93A099' : '#D8E2D8'
  const patch = tone === 'gold' ? '#8A5E00' : INK
  return (
    <Svg {...rest}>
      <circle cx="50" cy="50" r="42" fill={base} stroke={INK} strokeWidth={SW} />
      {/* Ground shade crescent */}
      <path d="M17 66a42 42 0 0 0 66 0 46 46 0 0 1-66 0Z" fill={shade} />
      {/* Centre pentagon + neighbours */}
      <path d="M50 32l14 10-5.4 16H41.4L36 42Z" fill={patch} />
      <path d="M50 32l-3-13M64 42l13-6M58.6 58l8 11M41.4 58l-8 11M36 42l-13-6" stroke={patch} strokeWidth={SW} strokeLinecap="round" />
      <path d="M47 19a34 34 0 0 1 18 2M23 36a34 34 0 0 1 9-9" stroke={INK} strokeWidth={0} />
      {/* Glint */}
      <ellipse cx="34" cy="26" rx="8" ry="5" fill="#fff" opacity="0.85" transform="rotate(-28 34 26)" />
    </Svg>
  )
}

export const GoldenBall = (p: ArtProps) => <Ball tone="gold" {...p} />

/* ---------------------------------------------------------------- */
/* Trophy, star, medal — the prize shelf.                            */
/* ---------------------------------------------------------------- */

export function Trophy(rest: ArtProps) {
  return (
    <Svg {...rest}>
      <path
        d="M30 16h40v16a20 20 0 0 1-40 0Z"
        fill="#FFC531"
        stroke={INK}
        strokeWidth={SW}
      />
      <path d="M40 16h30v16a20 20 0 0 1-11 17.9A20 20 0 0 0 40 32Z" fill="#E09A00" opacity=".55" />
      {/* Handles */}
      <path
        d="M30 22h-8a8 8 0 0 0 0 16h6M70 22h8a8 8 0 0 1 0 16h-6"
        stroke={INK}
        strokeWidth={SW}
        strokeLinecap="round"
        fill="none"
      />
      {/* Stem + base */}
      <path d="M44 50h12l3 12H41Z" fill="#E09A00" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <rect x="32" y="62" width="36" height="12" rx="4" fill="#8A5E00" stroke={INK} strokeWidth={SW} />
      <rect x="26" y="74" width="48" height="12" rx="5" fill="#FFC531" stroke={INK} strokeWidth={SW} />
      <ellipse cx="39" cy="23" rx="5" ry="8" fill="#fff" opacity=".7" transform="rotate(14 39 23)" />
    </Svg>
  )
}

export function Star5({ dim, ...rest }: ArtProps & { dim?: boolean }) {
  return (
    <Svg {...rest}>
      <path
        d="M50 8l12.4 25.2L90 37.2 69.9 56.7l4.8 27.7L50 71.3 25.3 84.4l4.8-27.7L10 37.2l27.6-4Z"
        fill={dim ? '#8E9A92' : '#FFC531'}
        stroke={INK}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path
        d="M50 8l12.4 25.2L90 37.2 69.9 56.7l4.8 27.7L50 71.3V8Z"
        fill={dim ? '#76837B' : '#E09A00'}
        opacity=".6"
      />
      <ellipse cx="38" cy="30" rx="6" ry="4" fill="#fff" opacity=".85" transform="rotate(-24 38 30)" />
    </Svg>
  )
}

export function Medal(rest: ArtProps) {
  return (
    <Svg {...rest}>
      <path d="M34 8h14l8 26-15 5-15-5Z" fill="#E63946" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M66 8H52l-8 26 15 5 15-5Z" fill="#2D9CDB" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <circle cx="50" cy="62" r="26" fill="#FFC531" stroke={INK} strokeWidth={SW} />
      <circle cx="50" cy="62" r="17" fill="#E09A00" stroke={INK} strokeWidth={3} />
      <path d="M42 62.5l5.5 5.5L59 56.5" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <ellipse cx="40" cy="50" rx="5" ry="3.4" fill="#fff" opacity=".8" transform="rotate(-24 40 50)" />
    </Svg>
  )
}

/* ---------------------------------------------------------------- */
/* Interface hardware: padlock, key, mic, speaker, gift, sun, glass. */
/* ---------------------------------------------------------------- */

export function Padlock({ open, ...rest }: ArtProps & { open?: boolean }) {
  return (
    <Svg {...rest}>
      {open ? (
        <path d="M33 44V32a17 17 0 0 1 33-6" stroke={INK} strokeWidth={SW + 2} strokeLinecap="round" fill="none" />
      ) : (
        <path d="M33 46V32a17 17 0 0 1 34 0v14" stroke={INK} strokeWidth={SW + 2} strokeLinecap="round" fill="none" />
      )}
      <rect x="24" y="44" width="52" height="42" rx="10" fill="#FFC531" stroke={INK} strokeWidth={SW} />
      <path d="M76 44v42h-8a52 42 0 0 0 0-42Z" fill="#E09A00" opacity=".5" />
      <circle cx="50" cy="61" r="7" fill={INK} />
      <path d="M50 64v12" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <ellipse cx="35" cy="52" rx="5" ry="3.4" fill="#fff" opacity=".7" transform="rotate(-20 35 52)" />
    </Svg>
  )
}

export function KeyIcon(rest: ArtProps) {
  return (
    <Svg {...rest}>
      <circle cx="34" cy="34" r="18" fill="#FFC531" stroke={INK} strokeWidth={SW} />
      <circle cx="34" cy="34" r="7" fill="var(--pitch-deep)" stroke={INK} strokeWidth={3} />
      <path d="M46 46l32 32M70 70l10-8M60 60l9-8" stroke={INK} strokeWidth={SW + 2} strokeLinecap="round" />
      <ellipse cx="27" cy="26" rx="4.4" ry="3" fill="#fff" opacity=".8" transform="rotate(-24 27 26)" />
    </Svg>
  )
}

export function Mic({ listening, ...rest }: ArtProps & { listening?: boolean }) {
  return (
    <Svg {...rest}>
      <rect x="36" y="10" width="28" height="48" rx="14" fill={listening ? '#E63946' : '#3D4A55'} stroke={INK} strokeWidth={SW} />
      <path d="M50 10a14 14 0 0 1 14 14v20a14 14 0 0 1-7 12.2C60 44 60 24 57 10Z" fill="#000" opacity=".18" />
      <path d="M40 22h20M40 32h20M40 42h20" stroke={listening ? '#8f1220' : INK} strokeWidth={3.4} strokeLinecap="round" opacity=".8" />
      <path d="M26 44v2a24 24 0 0 0 48 0v-2" stroke={INK} strokeWidth={SW + 1} strokeLinecap="round" fill="none" />
      <path d="M50 72v14M36 90h28" stroke={INK} strokeWidth={SW + 1} strokeLinecap="round" />
      <ellipse cx="43" cy="17" rx="4" ry="2.8" fill="#fff" opacity=".75" transform="rotate(-20 43 17)" />
      {listening && (
        <>
          <path d="M18 26a34 34 0 0 0 0 20" stroke="#E63946" strokeWidth={SW} strokeLinecap="round" fill="none" />
          <path d="M82 26a34 34 0 0 1 0 20" stroke="#E63946" strokeWidth={SW} strokeLinecap="round" fill="none" />
        </>
      )}
    </Svg>
  )
}

export function Speaker(rest: ArtProps) {
  return (
    <Svg {...rest}>
      <path d="M14 38h16l20-16v56L30 62H14Z" fill="#F7FAF5" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M62 36a20 20 0 0 1 0 28M72 26a34 34 0 0 1 0 48" stroke={INK} strokeWidth={SW + 1} strokeLinecap="round" fill="none" />
    </Svg>
  )
}

export function Gift(rest: ArtProps) {
  return (
    <Svg {...rest}>
      <rect x="18" y="40" width="64" height="46" rx="8" fill="#E63946" stroke={INK} strokeWidth={SW} />
      <path d="M74 40h8v38a8 8 0 0 1-8 8Z" fill="#B02633" opacity=".7" />
      <rect x="12" y="26" width="76" height="16" rx="6" fill="#FF6B6B" stroke={INK} strokeWidth={SW} />
      <path d="M44 26h12v60H44Z" fill="#FFC531" stroke={INK} strokeWidth={SW} />
      <path d="M50 26C42 14 28 12 30 20s14 8 20 6c6 2 18 2 20-6s-12-6-20 6Z" fill="#FFC531" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <ellipse cx="27" cy="50" rx="5" ry="3.4" fill="#fff" opacity=".55" transform="rotate(-18 27 50)" />
    </Svg>
  )
}

export function SunIcon(rest: ArtProps) {
  return (
    <Svg {...rest}>
      {Array.from({ length: 8 }, (_, i) => (
        <path
          key={i}
          d="M50 4l6 14H44Z"
          fill="#FFC531"
          stroke={INK}
          strokeWidth={3.4}
          strokeLinejoin="round"
          transform={`rotate(${i * 45} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="26" fill="#FFC531" stroke={INK} strokeWidth={SW} />
      <path d="M50 24a26 26 0 0 1 0 52 30 30 0 0 0 0-52Z" fill="#E09A00" opacity=".55" />
      <ellipse cx="41" cy="40" rx="6" ry="4" fill="#fff" opacity=".8" transform="rotate(-24 41 40)" />
    </Svg>
  )
}

export function Hourglass(rest: ArtProps) {
  return (
    <Svg {...rest}>
      <path d="M28 10h44M28 90h44" stroke={INK} strokeWidth={SW + 2} strokeLinecap="round" />
      <path
        d="M32 14h36v10c0 12-10 18-14 26 4 8 14 14 14 26v10H32V76c0-12 10-18 14-26-4-8-14-14-14-26Z"
        fill="#CFE3F5"
        stroke={INK}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path d="M40 20h20l-8 16h-4Z" fill="#FFC531" />
      <path d="M50 58l12 16v6H38v-6Z" fill="#FFC531" />
    </Svg>
  )
}

export function Whistle(rest: ArtProps) {
  return (
    <Svg {...rest}>
      <path d="M20 34h44a10 10 0 0 1 10 10v2l-16 6a20 20 0 1 1-38-8v-10Z" fill="#FFC531" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <circle cx="39" cy="58" r="7" fill={INK} />
      <path d="M78 22l8-8M84 34h10M70 16l4-10" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
      <ellipse cx="30" cy="42" rx="5" ry="3.4" fill="#fff" opacity=".7" transform="rotate(-18 30 42)" />
    </Svg>
  )
}

export function Target(rest: ArtProps) {
  return (
    <Svg {...rest}>
      <circle cx="50" cy="50" r="38" fill="#F7FAF5" stroke={INK} strokeWidth={SW} />
      <circle cx="50" cy="50" r="25" fill="#E63946" stroke={INK} strokeWidth={4} />
      <circle cx="50" cy="50" r="11" fill="#F7FAF5" stroke={INK} strokeWidth={4} />
      <ellipse cx="36" cy="32" rx="7" ry="4.4" fill="#fff" opacity=".8" transform="rotate(-26 36 32)" />
    </Svg>
  )
}

export function Gloves(rest: ArtProps) {
  return (
    <Svg viewBox="0 0 120 100" {...rest}>
      {[0, 1].map((side) => (
        <g key={side} transform={side ? 'translate(120 0) scale(-1 1)' : undefined}>
          <path
            d="M14 58c-4-14 2-34 10-36 5-1 7 3 8 8 1-8 3-13 8-13s7 5 7 13c2-6 5-9 9-8 5 2 8 16 6 30-2 12-9 22-24 22S17 68 14 58Z"
            fill="#2D9CDB"
            stroke={INK}
            strokeWidth={SW}
            strokeLinejoin="round"
          />
          <path d="M20 62h34" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity=".5" />
          <ellipse cx="26" cy="36" rx="4.4" ry="3" fill="#fff" opacity=".7" />
        </g>
      ))}
    </Svg>
  )
}

export function CrossMark(rest: ArtProps) {
  return (
    <Svg {...rest}>
      <path d="M26 26l48 48M74 26 26 74" stroke="#E63946" strokeWidth={14} strokeLinecap="round" />
      <path d="M26 26l48 48M74 26 26 74" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity=".35" />
    </Svg>
  )
}

export function CheckMark(rest: ArtProps) {
  return (
    <Svg {...rest}>
      <circle cx="50" cy="50" r="40" fill="#35C88A" stroke={INK} strokeWidth={SW} />
      <path d="M50 10a40 40 0 0 1 0 80 46 46 0 0 0 0-80Z" fill="#1E9E68" opacity=".55" />
      <path
        d="M31 52l13 13 25-30"
        stroke="#fff"
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <ellipse cx="36" cy="30" rx="6" ry="4" fill="#fff" opacity=".55" transform="rotate(-24 36 30)" />
    </Svg>
  )
}

export function PlayBadge(rest: ArtProps) {
  return (
    <Svg {...rest}>
      <circle cx="50" cy="50" r="40" fill="#FFC531" stroke={INK} strokeWidth={SW} />
      <path d="M50 10a40 40 0 0 1 0 80 46 46 0 0 0 0-80Z" fill="#E09A00" opacity=".5" />
      <path d="M41 32l28 18-28 18Z" fill={INK} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx="35" cy="29" rx="6" ry="4" fill="#fff" opacity=".8" transform="rotate(-24 35 29)" />
    </Svg>
  )
}

export function PauseIcon(rest: ArtProps) {
  return (
    <Svg {...rest}>
      <rect x="26" y="22" width="17" height="56" rx="7" fill="currentColor" />
      <rect x="57" y="22" width="17" height="56" rx="7" fill="currentColor" />
    </Svg>
  )
}

export function TvIcon(rest: ArtProps) {
  return (
    <Svg {...rest}>
      <path d="M32 8l18 18L68 8" stroke={INK} strokeWidth={SW + 1} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="10" y="26" width="80" height="56" rx="10" fill="#3D4A55" stroke={INK} strokeWidth={SW} />
      <rect x="18" y="34" width="54" height="40" rx="6" fill="#9FD8FF" stroke={INK} strokeWidth={3} />
      <path d="M18 60c14-10 32-12 54-6v20H18Z" fill="#5FB8E8" opacity=".7" />
      <circle cx="81" cy="42" r="4" fill="#FFC531" stroke={INK} strokeWidth={2.4} />
      <circle cx="81" cy="56" r="4" fill="#E63946" stroke={INK} strokeWidth={2.4} />
      <path d="M28 88h44" stroke={INK} strokeWidth={SW} strokeLinecap="round" />
    </Svg>
  )
}

export function KitBag(rest: ArtProps) {
  return (
    <Svg {...rest}>
      <path d="M34 40a16 16 0 0 1 32 0" stroke={INK} strokeWidth={SW + 1} fill="none" strokeLinecap="round" />
      <rect x="10" y="38" width="80" height="44" rx="20" fill="#0F7D45" stroke={INK} strokeWidth={SW} />
      <path d="M50 38h20a20 22 0 0 1 20 22 20 22 0 0 1-20 22H50Z" fill="#0B6B3A" opacity=".8" />
      <rect x="40" y="38" width="20" height="44" fill="#FFC531" stroke={INK} strokeWidth={4} />
      <path d="M50 47l3.4 6.9 7.6 1.1-5.5 5.4 1.3 7.6-6.8-3.6-6.8 3.6 1.3-7.6-5.5-5.4 7.6-1.1Z" fill={INK} />
      <ellipse cx="24" cy="48" rx="6" ry="4" fill="#fff" opacity=".5" transform="rotate(-16 24 48)" />
    </Svg>
  )
}

/** A team shirt in the kit's two colours — body first, sleeves second. */
export function Jersey({ kit, ...rest }: ArtProps & { kit: string[] }) {
  const [body, sleeve] = [kit[0] ?? '#F7FAF5', kit[1] ?? '#F7FAF5']
  return (
    <Svg {...rest}>
      <path
        d="M37 10L50 18l13-8 28 15-10 22-12-6v49H31V41l-12 6L9 25Z"
        fill={body}
        stroke={INK}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <path d="M37 10L9 25l10 22 12-6v-9Z" fill={sleeve} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M63 10l28 15-10 22-12-6v-9Z" fill={sleeve} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M37 10c3 7 23 7 26 0l-5 10H42Z" fill={INK} />
      <path d="M69 41v49h-8c4-16 4-33 0-49Z" fill={INK} opacity=".12" />
      <ellipse cx="41" cy="34" rx="5" ry="3.4" fill="#fff" opacity=".5" transform="rotate(-20 41 34)" />
    </Svg>
  )
}

/** The keeper — gloves up, daring the child to pick a corner. */
export function Keeper(rest: ArtProps) {
  return (
    <Svg {...rest}>
      {/* Arms raised */}
      <path d="M33 58L19 32M67 58l14-26" stroke={INK} strokeWidth={13} strokeLinecap="round" />
      <path d="M33 58L19 32M67 58l14-26" stroke="#E63946" strokeWidth={7} strokeLinecap="round" />
      {/* Gloves */}
      <circle cx="17" cy="27" r="10" fill="#2D9CDB" stroke={INK} strokeWidth={4} />
      <circle cx="83" cy="27" r="10" fill="#2D9CDB" stroke={INK} strokeWidth={4} />
      <path d="M11 22a10 10 0 0 1 8-4M77 22a10 10 0 0 1 8-4" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" opacity=".7" />
      {/* Torso */}
      <path d="M29 98c0-26 7-42 21-42s21 16 21 42Z" fill="#E63946" stroke={INK} strokeWidth={SW} />
      <path d="M50 56c10 0 16 9 19 24l-8 4-4-12-7 6-7-6-4 12-8-4c3-15 9-24 19-24Z" fill="#B02633" opacity=".55" />
      {/* Number 1 on the chest */}
      <path d="M50 76v14M46 79l4-3" stroke="#fff" strokeWidth={4.4} strokeLinecap="round" />
      {/* Head */}
      <circle cx="50" cy="38" r="17" fill="#F6BE8E" stroke={INK} strokeWidth={SW} />
      <path d="M50 21a17 17 0 0 1 0 34 20 20 0 0 0 0-34Z" fill="#E8A26C" opacity=".5" />
      {/* Hair */}
      <path d="M34 34c1-10 8-16 16-16s15 6 16 16c-5-6-10-8-16-8s-11 2-16 8Z" fill="#4A2F1B" stroke={INK} strokeWidth={3.4} strokeLinejoin="round" />
      {/* Face */}
      <circle cx="44" cy="39" r="2.6" fill={INK} />
      <circle cx="56" cy="39" r="2.6" fill={INK} />
      <path d="M45 46c3 3 7 3 10 0" stroke={INK} strokeWidth={3.4} strokeLinecap="round" fill="none" />
    </Svg>
  )
}

/* ---------------------------------------------------------------- */
/* Coach — the face of the app. One character, everywhere.           */
/* ---------------------------------------------------------------- */

export function CoachMascot({ talking, ...rest }: ArtProps & { talking?: boolean }) {
  return (
    <Svg viewBox="0 0 120 120" {...rest}>
      {/* Badge */}
      <circle cx="60" cy="60" r="56" fill="#F2F7F1" stroke={INK} strokeWidth={SW} />
      <path d="M60 4a56 56 0 0 1 0 112Z" fill="#DCE7DC" opacity=".6" />
      {/* Torso: club track jacket */}
      <path
        d="M24 108c4-24 16-32 36-32s32 8 36 32"
        fill="#0F7D45"
        stroke={INK}
        strokeWidth={SW}
      />
      <path d="M60 76c14 0 24 4 30 12l-10 6-8-10-12 4-12-4-8 10-10-6c6-8 16-12 30-12Z" fill="#0B6B3A" />
      {/* Collar + zip */}
      <path d="M48 78l12 10 12-10" stroke="#F2F7F1" strokeWidth={SW} strokeLinecap="round" fill="none" />
      <path d="M60 88v20" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      {/* Whistle lanyard */}
      <path d="M50 82l8 14M70 82l-6 12" stroke="#FFC531" strokeWidth={4} strokeLinecap="round" />
      <rect x="55" y="94" width="13" height="9" rx="4" fill="#FFC531" stroke={INK} strokeWidth={3.4} />
      {/* Head */}
      <circle cx="60" cy="48" r="26" fill="#F6BE8E" stroke={INK} strokeWidth={SW} />
      <path d="M60 22a26 26 0 0 1 0 52 30 30 0 0 0 0-52Z" fill="#E8A26C" opacity=".5" />
      {/* Ears */}
      <circle cx="33" cy="50" r="6" fill="#F6BE8E" stroke={INK} strokeWidth={4} />
      <circle cx="87" cy="50" r="6" fill="#F6BE8E" stroke={INK} strokeWidth={4} />
      {/* Cap */}
      <path d="M34 40a26 26 0 0 1 52 0l-2 4H36Z" fill="#0F7D45" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M60 14a26 26 0 0 1 26 26l-2 4H74C74 30 70 20 60 14Z" fill="#0B6B3A" opacity=".8" />
      <path d="M84 40c8 0 12 3 12 7-4 2-9 2-14-1" fill="#0F7D45" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <circle cx="60" cy="16" r="4.4" fill="#FFC531" stroke={INK} strokeWidth={3} />
      {/* Brows + eyes */}
      <path d="M44 46c3-3 8-3 11 0M65 46c3-3 8-3 11 0" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
      <circle cx="50" cy="53" r="5.6" fill="#fff" stroke={INK} strokeWidth={3} />
      <circle cx="70" cy="53" r="5.6" fill="#fff" stroke={INK} strokeWidth={3} />
      <circle cx="51.5" cy="54" r="2.6" fill={INK} />
      <circle cx="71.5" cy="54" r="2.6" fill={INK} />
      <circle cx="50" cy="52" r="1" fill="#fff" />
      <circle cx="70" cy="52" r="1" fill="#fff" />
      {/* Cheeks */}
      <ellipse cx="42" cy="60" rx="4.4" ry="2.8" fill="#F0836B" opacity=".55" />
      <ellipse cx="78" cy="60" rx="4.4" ry="2.8" fill="#F0836B" opacity=".55" />
      {/* Mouth */}
      {talking ? (
        <>
          <ellipse cx="60" cy="66" rx="7.5" ry="5.5" fill="#7A3B2E" stroke={INK} strokeWidth={3} />
          <path d="M54.5 68.5a7 4 0 0 0 11 0 7 5 0 0 0-11 0Z" fill="#F0836B" />
        </>
      ) : (
        <path d="M52 64c4 5 12 5 16 0" stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" />
      )}
    </Svg>
  )
}

/* ---------------------------------------------------------------- */
/* Skill-field badges — one per station, same sticker grammar.       */
/* ---------------------------------------------------------------- */

export function FieldBadge({ field, ...rest }: ArtProps & { field: SkillField }) {
  switch (field) {
    case 'flags':
      return (
        <Svg {...rest}>
          <path d="M30 10v80" stroke={INK} strokeWidth={SW + 2} strokeLinecap="round" />
          <path d="M34 14h48l-12 14 12 14H34Z" fill="#E63946" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M34 24h37l-4 4 4 4H34Z" fill="#F7FAF5" />
          <circle cx="30" cy="10" r="5" fill="#FFC531" stroke={INK} strokeWidth={3} />
        </Svg>
      )
    case 'counting':
      return (
        <Svg {...rest}>
          <rect x="12" y="24" width="76" height="52" rx="10" fill="#17301f" stroke={INK} strokeWidth={SW} />
          <text
            x="50"
            y="62"
            textAnchor="middle"
            fontFamily="var(--display)"
            fontSize="34"
            fill="#FFC531"
          >
            1 2 3
          </text>
          <circle cx="24" cy="18" r="8" fill="#F7FAF5" stroke={INK} strokeWidth={4} />
          <circle cx="76" cy="18" r="8" fill="#F7FAF5" stroke={INK} strokeWidth={4} />
        </Svg>
      )
    case 'letters':
      return (
        <Svg {...rest}>
          <rect x="14" y="34" width="40" height="40" rx="8" fill="#2D9CDB" stroke={INK} strokeWidth={SW} />
          <rect x="46" y="26" width="40" height="40" rx="8" fill="#FFC531" stroke={INK} strokeWidth={SW} />
          <text x="34" y="62" textAnchor="middle" fontFamily="var(--display)" fontSize="26" fill="#fff">
            A
          </text>
          <text x="66" y="54" textAnchor="middle" fontFamily="var(--display)" fontSize="26" fill="#17301f">
            B
          </text>
        </Svg>
      )
    case 'story':
      return (
        <Svg {...rest}>
          <path d="M50 26C42 18 28 16 14 20v56c14-4 28-2 36 6 8-8 22-10 36-6V20c-14-4-28-2-36 6Z" fill="#F7FAF5" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M50 26v56" stroke={INK} strokeWidth={4} />
          <path d="M22 32c8-2 16-1 22 2M22 44c8-2 16-1 22 2M56 34c6-3 14-4 22-2M56 46c6-3 14-4 22-2" stroke="#9AA8A0" strokeWidth={4} strokeLinecap="round" />
        </Svg>
      )
    case 'art':
      return (
        <Svg {...rest}>
          <path d="M62 10l14 14-34 40-18 6 6-18Z" fill="#FFC531" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M62 10l14 14 8-8a10 10 0 0 0-14-14Z" fill="#E63946" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <path d="M24 70l6-18 12 12Z" fill="#F6BE8E" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d="M20 88c10 4 22 4 34-2" stroke="#2D9CDB" strokeWidth={7} strokeLinecap="round" />
        </Svg>
      )
    case 'fairplay':
      return (
        <Svg {...rest}>
          <path
            d="M50 84C30 70 14 56 14 40a18 18 0 0 1 33-10 18 18 0 0 1 39 10c0 16-16 30-36 44Z"
            fill="#FF6B8A"
            stroke={INK}
            strokeWidth={SW}
            strokeLinejoin="round"
          />
          <path d="M50 84C60 76 86 58 86 40a18 18 0 0 0-10-16C82 44 66 66 50 84Z" fill="#E63946" opacity=".6" />
          <ellipse cx="32" cy="38" rx="7" ry="4.6" fill="#fff" opacity=".8" transform="rotate(-24 32 38)" />
        </Svg>
      )
    case 'english':
      return (
        <Svg {...rest}>
          <path
            d="M14 22h72a8 8 0 0 1 8 8v34a8 8 0 0 1-8 8H46L26 88V72H14a8 8 0 0 1-8-8V30a8 8 0 0 1 8-8Z"
            fill="#2D9CDB"
            stroke={INK}
            strokeWidth={SW}
            strokeLinejoin="round"
          />
          <text x="50" y="56" textAnchor="middle" fontFamily="var(--display)" fontSize="30" fill="#fff">
            EN
          </text>
        </Svg>
      )
  }
}

/* ---------------------------------------------------------------- */
/* Parent-tab line icons — thinner stroke, same ink.                 */
/* ---------------------------------------------------------------- */

export function TabGlyph({ kind, ...rest }: ArtProps & { kind: 'today' | 'plan' | 'catalog' | 'rewards' | 'progress' }) {
  const stroke = 'currentColor'
  const w = 7
  switch (kind) {
    case 'today':
      return (
        <Svg viewBox="0 0 100 100" {...rest}>
          <rect x="20" y="14" width="60" height="74" rx="10" stroke={stroke} strokeWidth={w} fill="none" />
          <path d="M38 8h24v14H38Z" fill="currentColor" />
          <path d="M34 42h32M34 56h32M34 70h20" stroke={stroke} strokeWidth={w} strokeLinecap="round" />
        </Svg>
      )
    case 'plan':
      return (
        <Svg viewBox="0 0 100 100" {...rest}>
          <path d="M14 30h44M74 30h12M14 70h12M42 70h44" stroke={stroke} strokeWidth={w} strokeLinecap="round" />
          <circle cx="66" cy="30" r="10" stroke={stroke} strokeWidth={w} fill="none" />
          <circle cx="34" cy="70" r="10" stroke={stroke} strokeWidth={w} fill="none" />
        </Svg>
      )
    case 'catalog':
      return (
        <Svg viewBox="0 0 100 100" {...rest}>
          <rect x="12" y="26" width="76" height="52" rx="10" stroke={stroke} strokeWidth={w} fill="none" />
          <path d="M34 10l16 14 16-14" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M42 42l20 10-20 10Z" fill="currentColor" />
        </Svg>
      )
    case 'rewards':
      return (
        <Svg viewBox="0 0 100 100" {...rest}>
          <path
            d="M50 12l11 22 25 4-18 17 4 25-22-12-22 12 4-25-18-17 25-4Z"
            stroke={stroke}
            strokeWidth={w}
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      )
    case 'progress':
      return (
        <Svg viewBox="0 0 100 100" {...rest}>
          <path d="M16 14v72h70" stroke={stroke} strokeWidth={w} strokeLinecap="round" />
          <path d="M32 66l16-18 12 10 22-26" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      )
  }
}

/** A row of drawn stars, for payouts. */
export function StarRow({ count, size = 52 }: { count: number; size?: number | string }) {
  return (
    <span style={{ display: 'inline-flex', gap: 6 }}>
      {Array.from({ length: Math.min(5, Math.max(1, count)) }, (_, i) => (
        <Star5 key={i} size={size} />
      ))}
    </span>
  )
}

/** An inline star that sits in running text where "⭐" used to. */
export function StarInline(rest: ArtProps) {
  return <Star5 size="0.95em" style={{ verticalAlign: '-0.12em' }} {...rest} />
}
