import { useRef } from 'react'
import { useEyeBlob } from '../hooks/useEyeBlob'

export default function Eyes({ containerRef }) {
  useEyeBlob(containerRef)
  return (
    <div className="eyes" ref={containerRef}>
      <EyeSvg side="l" />
      <EyeSvg side="r" />
    </div>
  )
}

function EyeSvg({ side }) {
  const L    = side === 'l'
  const S    = L ? 'L' : 'R'
  const gCx  = L ? '38%' : '62%'
  const sCx  = L ? '34%' : '66%'
  const esCx = L ? 88 : 152
  const pinX = L ? 76 : 164

  return (
    <div className={`eye ${side}`} data-eye={side}>
      <svg viewBox="0 0 240 240" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id={`body${S}`} cx={gCx} cy="32%" r="74%">
            <stop offset="0%"   stopColor="rgba(180,210,255,.03)" />
            <stop offset="52%"  stopColor="rgba(100,145,220,.09)" />
            <stop offset="78%"  stopColor="rgba(90,130,215,.28)"  />
            <stop offset="90%"  stopColor="rgba(160,195,255,.52)" />
            <stop offset="100%" stopColor="rgba(200,220,255,.12)" />
          </radialGradient>
          <radialGradient id={`spec${S}`} cx={sCx} cy="20%" r="20%">
            <stop offset="0%"   stopColor="rgba(255,255,255,.98)" />
            <stop offset="42%"  stopColor="rgba(240,248,255,.42)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)"   />
          </radialGradient>
          <radialGradient id={`caustic${S}`} cx="50%" cy="82%" r="32%">
            <stop offset="0%"   stopColor="rgba(160,195,255,.28)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)"         />
          </radialGradient>
          <clipPath id={`clip${S}`}><path id={`shape${S}`} d="" /></clipPath>
        </defs>
        <g className="floater">
          <path id={`bodyPath${S}`} d="" fill={`url(#body${S})`} />
          <g clipPath={`url(#clip${S})`}>
            <ellipse cx="120" cy="192" rx="52" ry="25" fill={`url(#caustic${S})`} />
            <ellipse id={`specPath${S}`} cx={esCx} cy="68" rx="42" ry="17" fill={`url(#spec${S})`} />
            <ellipse id={`pin${S}`}      cx={pinX} cy="60" rx="9"  ry="4"  fill="rgba(255,255,255,.93)" />
          </g>
          <path id={`strokePath${S}`} d="" fill="none" stroke="rgba(190,215,255,.70)" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  )
}
