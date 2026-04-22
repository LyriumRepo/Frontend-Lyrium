'use client';

// LogoLyrium.tsx — caritas animadas por horario (v2 · React/Next.js port)
// Requiere: npm install animejs@3.2.2 y npm install --save-dev @types/animejs

import anime from 'animejs/lib/anime.es.js';
import React, { useEffect, useRef, useState } from 'react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Mood = 'welcome' | 'morning' | 'afternoon' | 'evening' | 'night';

interface LogoLyriumProps {
  frontImg?: string;
  sideImg?: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function getMood(isFirst: boolean): Mood {
  if (isFirst) return 'welcome';
  const now      = new Date();
  const totalMin = now.getHours() * 60 + now.getMinutes();

  if (totalMin >= 360  && totalMin < 810)  return 'morning';
  if (totalMin >= 810  && totalMin < 960)  return 'afternoon';
  if (totalMin >= 960  && totalMin < 1080) return 'morning';
  if (totalMin >= 1080 && totalMin < 1260) return 'morning';
  if (totalMin >= 1260 || totalMin < 90)   return 'evening';
  return 'night';
}

// ─────────────────────────────────────────────
// SVG faces (idénticos al original)
// ─────────────────────────────────────────────
const FACES: Record<Mood, string> = {
  welcome: `
    <svg viewBox="0 0 100 100" width="92%" height="92%" overflow="visible" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glowW" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect class="lyr-conf1" x="8"  y="10" width="6" height="6" rx="1.5" fill="rgba(255,230,60,.9)"  transform="rotate(20,8,10)"/>
      <rect class="lyr-conf2" x="82" y="14" width="5" height="6" rx="1"   fill="rgba(255,90,190,.9)"   transform="rotate(-18,82,14)"/>
      <rect class="lyr-conf3" x="84" y="74" width="6" height="5" rx="1.5" fill="rgba(80,255,180,.9)"   transform="rotate(32,84,74)"/>
      <rect class="lyr-conf4" x="7"  y="72" width="5" height="6" rx="1"   fill="rgba(100,200,255,.9)"  transform="rotate(-28,7,72)"/>
      <text class="lyr-tw1" x="2"  y="26" font-size="11" fill="rgba(255,230,80,.95)"  font-family="sans-serif">✦</text>
      <text class="lyr-tw2" x="84" y="22" font-size="9"  fill="rgba(255,140,230,.95)" font-family="sans-serif">★</text>
      <text class="lyr-tw3" x="88" y="52" font-size="8"  fill="rgba(140,255,210,.9)"  font-family="sans-serif">✦</text>
      <text class="lyr-tw4" x="3"  y="54" font-size="7"  fill="rgba(200,180,255,.9)"  font-family="sans-serif">★</text>
      <g class="lyr-party">
        <ellipse cx="16" cy="66" rx="11" ry="6.5" fill="rgba(255,170,170,.25)" class="lyr-ck-l"/>
        <ellipse cx="84" cy="66" rx="11" ry="6.5" fill="rgba(255,170,170,.25)" class="lyr-ck-r"/>
        <path d="M14 31 C 20 20, 40 20, 45 28" stroke="white" stroke-width="5.5" fill="none" stroke-linecap="round"/>
        <path d="M55 25 C 62 14, 82 14, 87 22" stroke="white" stroke-width="5.5" fill="none" stroke-linecap="round"/>
        <circle cx="30" cy="45" r="13.5" fill="white" filter="url(#glowW)"/>
        <circle cx="30" cy="45" r="6"    fill="#0d0d12"/>
        <circle cx="34.5" cy="40.5" r="3.6" fill="white"/>
        <circle cx="26"   cy="50"   r="1.6" fill="white" opacity="0.45"/>
        <g id="wk-eye-open">
          <circle cx="70" cy="45" r="13.5" fill="white" filter="url(#glowW)"/>
          <circle cx="70" cy="45" r="6"    fill="#0d0d12"/>
          <circle cx="74.5" cy="40.5" r="3.6" fill="white"/>
          <circle cx="66"   cy="50"   r="1.6" fill="white" opacity="0.45"/>
        </g>
        <path id="wk-eye-closed" d="M58 46 C 62 57, 78 57, 82 46" stroke="white" stroke-width="5" fill="none" stroke-linecap="round" opacity="0"/>
        <path class="lyr-smile" d="M17 63 C 23 95, 77 95, 83 63" stroke="white" stroke-width="5.5" fill="none" stroke-linecap="round"/>
        <g id="wk-glasses">
          <ellipse cx="30" cy="45" rx="15.5" ry="14.5" fill="rgba(0,0,0,.32)" stroke="#111" stroke-width="3.8"/>
          <ellipse cx="70" cy="45" rx="15.5" ry="14.5" fill="rgba(0,0,0,.32)" stroke="#111" stroke-width="3.8"/>
          <path d="M45.5 44 L54.5 44" stroke="#111" stroke-width="3.2" fill="none" stroke-linecap="round"/>
          <path d="M14.5 43 Q7 43 5 48" stroke="#111" stroke-width="3.2" fill="none" stroke-linecap="round"/>
          <path d="M85.5 43 Q93 43 95 48" stroke="#111" stroke-width="3.2" fill="none" stroke-linecap="round"/>
          <path d="M19 36 Q22 33 26 34" stroke="rgba(255,255,255,.35)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <path d="M59 36 Q62 33 66 34" stroke="rgba(255,255,255,.35)" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        </g>
        <text class="lyr-heart" x="42" y="99" font-size="14" fill="rgba(255,180,230,.93)" font-family="sans-serif">♡</text>
      </g>
    </svg>`,

  morning: `
    <svg viewBox="0 0 100 100" width="92%" height="92%" overflow="visible" xmlns="http://www.w3.org/2000/svg">
      <text class="lyr-tw1" x="4"  y="22" font-size="13" fill="rgba(255,255,200,.95)" font-family="sans-serif">★</text>
      <text class="lyr-tw2" x="81" y="17" font-size="10" fill="rgba(220,255,150,.9)"  font-family="sans-serif">✦</text>
      <text class="lyr-tw3" x="86" y="47" font-size="8"  fill="rgba(255,255,180,.88)" font-family="sans-serif">★</text>
      <g class="lyr-hyper">
        <ellipse cx="18" cy="65" rx="10" ry="6.5" fill="rgba(255,255,255,.17)" class="lyr-ck-l"/>
        <ellipse cx="82" cy="65" rx="10" ry="6.5" fill="rgba(255,255,255,.17)" class="lyr-ck-r"/>
        <path d="M22 31 Q32 19 44 29" stroke="rgba(255,255,255,.95)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M56 29 Q68 19 78 31" stroke="rgba(255,255,255,.95)" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M22 48 Q33 37 44 48" stroke="rgba(255,255,255,.95)" stroke-width="8" fill="none" stroke-linecap="round"/>
        <circle cx="22" cy="48" r="2"   fill="rgba(255,255,255,.8)"/>
        <circle cx="44" cy="48" r="2"   fill="rgba(255,255,255,.8)"/>
        <circle cx="33" cy="39" r="1.3" fill="rgba(255,255,255,.35)"/>
        <path d="M56 48 Q67 37 78 48" stroke="rgba(255,255,255,.95)" stroke-width="8" fill="none" stroke-linecap="round"/>
        <circle cx="56" cy="48" r="2"   fill="rgba(255,255,255,.8)"/>
        <circle cx="78" cy="48" r="2"   fill="rgba(255,255,255,.8)"/>
        <circle cx="67" cy="39" r="1.3" fill="rgba(255,255,255,.35)"/>
        <path class="lyr-smile" d="M19 63 Q50 96 81 63" stroke="rgba(255,255,255,.93)" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M27 68 Q50 91 73 68" stroke="rgba(255,255,255,.18)" stroke-width="2.2" fill="none"/>
      </g>
    </svg>`,

  afternoon: `
    <svg viewBox="0 0 100 100" width="92%" height="92%" overflow="visible" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glowA" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glowAB" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <text class="lyr-tw1" x="3"  y="20" font-size="10" fill="rgba(255,255,150,.9)"  font-family="sans-serif">✦</text>
      <text class="lyr-tw2" x="85" y="18" font-size="9"  fill="rgba(255,200,100,.9)"  font-family="sans-serif">★</text>
      <text class="lyr-tw3" x="88" y="60" font-size="7"  fill="rgba(255,230,80,.85)"  font-family="sans-serif">✦</text>
      <text class="lyr-tw4" x="2"  y="58" font-size="8"  fill="rgba(255,255,180,.88)" font-family="sans-serif">★</text>
      <ellipse class="lyr-aura" cx="50" cy="50" rx="44" ry="44" fill="rgba(255,220,80,.06)" filter="url(#glowAB)"/>
      <g class="lyr-sway">
        <ellipse cx="16" cy="63" rx="12" ry="7" fill="rgba(255,150,150,.28)" class="lyr-ck-l"/>
        <ellipse cx="84" cy="63" rx="12" ry="7" fill="rgba(255,150,150,.28)" class="lyr-ck-r"/>
        <path class="lyr-aft-brow-l" d="M14 28 C 20 17, 40 17, 45 25" stroke="white" stroke-width="5.5" fill="none" stroke-linecap="round"/>
        <path class="lyr-aft-brow-r" d="M55 22 C 62 11, 82 11, 87 19" stroke="white" stroke-width="5.5" fill="none" stroke-linecap="round"/>
        <circle cx="30" cy="46" r="13.5" fill="white" filter="url(#glowA)" class="lyr-bl-l"/>
        <circle cx="30" cy="46" r="5.8"  fill="#0d0d12" class="lyr-wan-l"/>
        <circle cx="34.5" cy="41.5" r="3.4" fill="white"/>
        <circle cx="26"   cy="51"   r="1.5" fill="white" opacity="0.4"/>
        <circle cx="27"   cy="43"   r="1.2" fill="rgba(255,255,255,.6)"/>
        <circle cx="70" cy="46" r="13.5" fill="white" filter="url(#glowA)" class="lyr-bl-r"/>
        <circle cx="70" cy="46" r="5.8"  fill="#0d0d12" class="lyr-wan-r"/>
        <circle cx="74.5" cy="41.5" r="3.4" fill="white"/>
        <circle cx="66"   cy="51"   r="1.5" fill="white" opacity="0.4"/>
        <circle cx="67"   cy="43"   r="1.2" fill="rgba(255,255,255,.6)"/>
        <path class="lyr-smile" d="M15 62 C 20 100, 80 100, 85 62" stroke="white" stroke-width="5.5" fill="none" stroke-linecap="round"/>
        <text class="lyr-aft-spark1" x="8"  y="36" font-size="9"  fill="rgba(255,240,100,.9)" font-family="sans-serif">✦</text>
        <text class="lyr-aft-spark2" x="85" y="38" font-size="8"  fill="rgba(255,200,80,.9)"  font-family="sans-serif">✦</text>
        <text class="lyr-aft-spark3" x="46" y="10" font-size="10" fill="rgba(255,230,60,.9)"  font-family="sans-serif">★</text>
      </g>
    </svg>`,

  evening: `
    <svg viewBox="0 0 100 100" width="92%" height="92%" overflow="visible" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glowE" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g class="lyr-eve-nod">
        <ellipse cx="16" cy="67" rx="11" ry="6.5" fill="rgba(255,255,255,.15)" class="lyr-ck-l"/>
        <ellipse cx="84" cy="67" rx="11" ry="6.5" fill="rgba(255,255,255,.15)" class="lyr-ck-r"/>
        <path d="M14 37 C 20 27, 40 26, 45 33" stroke="white" stroke-width="5.5" fill="none" stroke-linecap="round"/>
        <path d="M55 30 C 62 20, 82 20, 87 27" stroke="white" stroke-width="5.5" fill="none" stroke-linecap="round"/>
        <g class="lyr-eve-eye-l">
          <circle cx="30" cy="46" r="13.5" fill="white" filter="url(#glowE)"/>
          <circle cx="30" cy="46" r="5.8"  fill="#0d0d12"/>
          <circle cx="34.5" cy="41.5" r="3.4" fill="white"/>
        </g>
        <g class="lyr-eve-eye-r">
          <circle cx="70" cy="46" r="13.5" fill="white" filter="url(#glowE)"/>
          <circle cx="70" cy="46" r="5.8"  fill="#0d0d12"/>
          <circle cx="74.5" cy="41.5" r="3.4" fill="white"/>
        </g>
        <path class="lyr-eve-close-l" d="M18 47 C 22 57, 38 57, 42 47" stroke="white" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path class="lyr-eve-close-r" d="M58 47 C 62 57, 78 57, 82 47" stroke="white" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path class="lyr-eve-smile"   d="M25 67 C 30 82, 70 82, 75 67" stroke="white" stroke-width="5.5" fill="none" stroke-linecap="round"/>
        <g class="lyr-eve-yawn">
          <ellipse cx="50" cy="73" rx="14" ry="11" fill="rgba(10,3,30,.94)"/>
          <ellipse cx="50" cy="73" rx="14" ry="11" fill="none" stroke="white" stroke-width="3"/>
          <ellipse cx="50" cy="80" rx="7"  ry="4"  fill="rgba(210,90,120,.85)"/>
        </g>
        <text class="lyr-eve-z1" x="64" y="40" font-size="15" fill="rgba(255,255,255,.78)" font-family="sans-serif" font-weight="900">z</text>
        <text class="lyr-eve-z2" x="74" y="23" font-size="21" fill="rgba(255,255,255,.85)" font-family="sans-serif" font-weight="900">Z</text>
        <text class="lyr-eve-z3" x="83" y="5"  font-size="27" fill="rgba(255,255,255,.92)" font-family="sans-serif" font-weight="900">Z</text>
      </g>
    </svg>`,

  night: `
    <svg viewBox="0 0 100 100" width="92%" height="92%" overflow="visible" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glowN" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g class="lyr-heavy">
        <ellipse cx="16" cy="67" rx="10" ry="6" fill="rgba(255,255,255,.1)" class="lyr-ck-l"/>
        <ellipse cx="84" cy="67" rx="10" ry="6" fill="rgba(255,255,255,.1)" class="lyr-ck-r"/>
        <path d="M14 40 C 20 30, 40 28, 45 36" stroke="white" stroke-width="5.5" fill="none" stroke-linecap="round"/>
        <path d="M55 33 C 62 24, 82 23, 87 31" stroke="white" stroke-width="5.5" fill="none" stroke-linecap="round"/>
        <circle cx="30" cy="47" r="13" fill="rgba(255,255,255,.42)" filter="url(#glowN)"/>
        <circle cx="70" cy="47" r="13" fill="rgba(255,255,255,.42)" filter="url(#glowN)"/>
        <g class="lyr-ngt-lidtl"><path d="M17 47 C 20 28, 43 28, 43 47 Z" fill="rgba(14,8,50,.96)"/></g>
        <g class="lyr-ngt-lidtr"><path d="M57 47 C 57 28, 83 28, 83 47 Z" fill="rgba(14,8,50,.96)"/></g>
        <g class="lyr-ngt-lidbl"><path d="M17 50 C 20 66, 43 66, 43 50 Z" fill="rgba(14,8,50,.78)"/></g>
        <g class="lyr-ngt-lidbr"><path d="M57 50 C 57 66, 83 66, 83 50 Z" fill="rgba(14,8,50,.78)"/></g>
        <circle cx="30" cy="49" r="1.3" fill="rgba(255,255,255,.5)" class="lyr-ngt-spark"/>
        <circle cx="70" cy="49" r="1.3" fill="rgba(255,255,255,.5)" class="lyr-ngt-spark"/>
        <path class="lyr-ngt-smile" d="M30 72 C 35 85, 65 85, 70 72" stroke="white" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <text class="lyr-zzz1" x="70" y="36" font-size="11" fill="rgba(255,255,255,.6)"  font-family="sans-serif" font-weight="900">z</text>
        <text class="lyr-zzz2" x="77" y="23" font-size="15" fill="rgba(255,255,255,.65)" font-family="sans-serif" font-weight="900">z</text>
        <text class="lyr-zzz3" x="84" y="8"  font-size="19" fill="rgba(255,255,255,.7)"  font-family="sans-serif" font-weight="900">Z</text>
        <text class="lyr-sd1"  x="7"  y="29" font-size="10" fill="rgba(200,210,255,.88)" font-family="sans-serif">✦</text>
        <text class="lyr-sd2"  x="82" y="45" font-size="8"  fill="rgba(220,220,255,.82)" font-family="sans-serif">★</text>
        <text class="lyr-sd3"  x="9"  y="52" font-size="7"  fill="rgba(255,255,255,.72)" font-family="sans-serif">✦</text>
      </g>
    </svg>`,
};

// ─────────────────────────────────────────────
// CSS (idéntico al original, necesario dentro del scope del componente)
// ─────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');

  /* ── Hover scale ── */
  .lyr-root { transition: transform 0.3s; }
  .lyr-root:hover { transform: scale(1.03); }

  /* ── Spark particles (generadas por JS) ── */
  .spark {
    position: absolute; border-radius: 50%;
    pointer-events: none; opacity: 0;
    left: 50%; top: 50%;
    transform: translate(-50%, -50%);
  }
  .click-spark {
    position: absolute; border-radius: 50%;
    pointer-events: none; opacity: 0;
  }

  /* ── 3D flip ── */
  .lyr-scene { perspective: 900px; width: 100%; height: 100%; }
  .lyr-card  { width: 100%; height: 100%; transform-style: preserve-3d; position: relative; }
  .lyr-card.live { transition: transform 1.3s cubic-bezier(0.4,0,0.2,1); }
  .lyr-scene:hover .lyr-card.live { transform: rotateY(180deg) !important; }

  /* ── Faces ── */
  .lyr-face {
    position: absolute; inset: 0; border-radius: 50%;
    backface-visibility: hidden; -webkit-backface-visibility: hidden;
    display: flex; align-items: center; justify-content: center; overflow: hidden;
  }
  .lyr-face-front { background: white; z-index: 2; }
  .lyr-face-back  {
    transform: rotateY(180deg);
    background: linear-gradient(135deg, #a3e635 0%, #0ea5e9 100%);
    box-shadow: 0 8px 30px rgba(0,0,0,0.5);
  }
  .lyr-front-img { width: 110%; height: 110%; object-fit: cover; }

  /* ── Imagen lateral ── */
  .lyr-side-container::after {
    content: ''; position: absolute;
    top: -10%; left: -30%;
    width: 28%; height: 120%;
    background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%);
    transform: rotate(18deg);
    pointer-events: none;
    animation: shinePass 7s 6s infinite ease-in-out;
  }
  @keyframes shinePass {
    0%        { left: -30%; opacity: 0; }
    6%        { opacity: 1; }
    68%, 100% { left: 115%; opacity: 0; }
  }
  .lyr-side-img {
    max-height: 60px; width: auto; object-fit: contain;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
    transform-origin: center center;
    will-change: transform, filter;
    display: block;
    padding: 4px 6px;
  }
  @media(min-width:768px){ .lyr-side-img { max-height: 80px; } }

  /* ── Glow ring ── */
  .lyr-glow-ring {
    position: absolute; inset: -8px;
    border-radius: 12px;
    border: 2px solid rgba(163,230,53,0);
    pointer-events: none;
  }

  /* ── Keyframes caritas ── */
  @keyframes groovySway{0%{transform:rotate(-5deg) scale(1);}22%{transform:rotate(4deg) scale(1.05) translateY(-5px);}50%{transform:rotate(-3deg) scale(1);}78%{transform:rotate(5deg) scale(1.04) translateY(-3px);}100%{transform:rotate(-5deg) scale(1);}}
  @keyframes superBounce{0%,100%{transform:translateY(0) scaleX(1) scaleY(1);}18%{transform:translateY(0) scaleX(1.18) scaleY(.82);}35%{transform:translateY(-20px) scaleX(.88) scaleY(1.14);}55%{transform:translateY(-24px) scaleX(.91) scaleY(1.11);}70%{transform:translateY(-8px) scaleX(1.1) scaleY(.92);}85%{transform:translateY(-14px) scaleX(.94) scaleY(1.07);}}
  @keyframes lazySway{0%,100%{transform:rotate(-4.5deg) translateY(0);}25%{transform:rotate(6deg) translateY(-4px) scale(1.04);}50%{transform:rotate(-5deg) translateY(-1px);}75%{transform:rotate(5.5deg) translateY(-3px) scale(1.03);}}
  @keyframes drowsyNod{0%,100%{transform:rotate(-3deg) translateY(0);}45%{transform:rotate(4.5deg) translateY(6px);}75%{transform:rotate(-1.5deg) translateY(2px);}}
  @keyframes sinkDrift{0%,100%{transform:translateY(0) rotate(-2deg);}50%{transform:translateY(9px) rotate(3.5deg);}}
  @keyframes blinkSlow{0%,78%,100%{transform:scaleY(1);}86%{transform:scaleY(.5);}90%{transform:scaleY(.03);}94%{transform:scaleY(.5);}}
  @keyframes wander{0%,100%{transform:translate(0,0);}20%{transform:translate(2.5px,-1px);}55%{transform:translate(-1.5px,1.5px);}80%{transform:translate(1.5px,-.5px);}}
  @keyframes ckPulse{0%,100%{opacity:.18}50%{opacity:.38}}
  @keyframes smileScale{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
  @keyframes lyrTwinkle{0%,100%{opacity:.07;transform:scale(.25) rotate(0)}50%{opacity:1;transform:scale(1.5) rotate(40deg)}}
  @keyframes lyrZzz{0%{opacity:0;transform:translate(0,0) scale(.4)}40%{opacity:.9}100%{opacity:0;transform:translate(13px,-24px) scale(1.2)}}
  @keyframes lyrZzzBig{0%{opacity:0;transform:translate(0,4px) scale(.5)}30%{opacity:1}85%{opacity:.7}100%{opacity:0;transform:translate(16px,-32px) scale(1.35)}}
  @keyframes lyrSdrift{0%{opacity:0;transform:translate(0,0) scale(0)}25%{opacity:.9}100%{opacity:0;transform:translate(var(--sdx),var(--sdy)) scale(.2) rotate(230deg)}}
  @keyframes lyrConf{0%{opacity:1;transform:rotate(0deg) translate(0,0) scaleX(1);}45%{opacity:1;transform:rotate(380deg) translate(0,-12px) scaleX(-1);}100%{opacity:0;transform:rotate(720deg) translate(0,-26px) scaleX(1);}}
  @keyframes lyrHeart{0%,100%{transform:scale(1) rotate(-8deg)}50%{transform:scale(1.4) rotate(-8deg)}}
  @keyframes lyrAuraPulse{0%,100%{transform:scale(1);opacity:.06;}50%{transform:scale(1.12);opacity:.14;}}
  @keyframes lyrAftBrow{0%,100%{transform:translateY(0);}40%{transform:translateY(-3px);}70%{transform:translateY(-1.5px);}}
  @keyframes lyrAftSpark{0%,100%{opacity:0;transform:scale(0) rotate(0deg);}35%{opacity:1;transform:scale(1.4) rotate(20deg);}65%{opacity:.7;transform:scale(1.1) rotate(-10deg);}}
  @keyframes lyrEveNod{0%{transform:rotate(0deg) translateY(0) scale(1);}5%{transform:rotate(-6deg) translateY(-4px) scale(1.06);}10%{transform:rotate(5deg) translateY(-3px) scale(1.04);}16%{transform:rotate(-3deg) translateY(-1px) scale(1.01);}20%{transform:rotate(3deg) translateY(2px);}38%,52%{transform:rotate(15deg) translateY(9px);}58%{transform:rotate(-8deg) translateY(-6px);}65%,78%{transform:rotate(1deg) translateY(1px);}92%,100%{transform:rotate(3deg) translateY(2px);}}
  @keyframes lyrEveEyeOpen{0%,14%{transform:scaleY(1.05);}20%{transform:scaleY(1);}36%,52%{transform:scaleY(.06);}58%{transform:scaleY(1.25);}66%,78%{transform:scaleY(.72);}92%,100%{transform:scaleY(.62);}}
  @keyframes lyrEveEyeClosed{0%,32%{opacity:0;}44%,54%{opacity:1;}60%,100%{opacity:0;}}
  @keyframes lyrEveSmileAnim{0%,14%{opacity:1;transform:scaleX(1.1);}20%,34%{opacity:1;transform:scaleX(.95);}40%,56%{opacity:0;transform:scaleX(.82);}60%,62%{opacity:1;transform:scaleX(1.08);}70%,100%{opacity:1;transform:scaleX(.85);}}
  @keyframes lyrEveYawnAnim{0%,38%{opacity:0;transform:scaleY(.05) scaleX(.3);}50%,55%{opacity:1;transform:scaleY(1) scaleX(1);}62%,100%{opacity:0;transform:scaleY(.05) scaleX(.3);}}
  @keyframes lyrEveZ1{0%,46%{opacity:0;transform:translate(0,0);}55%,59%{opacity:.82;transform:translate(3px,-7px);}65%,100%{opacity:0;transform:translate(9px,-20px);}}
  @keyframes lyrEveZ2{0%,50%{opacity:0;transform:translate(0,0);}57%,61%{opacity:.88;transform:translate(4px,-9px);}67%,100%{opacity:0;transform:translate(11px,-25px);}}
  @keyframes lyrEveZ3{0%,53%{opacity:0;transform:translate(0,0);}59%,63%{opacity:.94;transform:translate(5px,-11px);}69%,100%{opacity:0;transform:translate(13px,-30px);}}
  @keyframes lyrNgtLidTop{0%,20%{transform:translateY(0);}30%,42%{transform:translateY(-10px);}55%,100%{transform:translateY(0);}}
  @keyframes lyrNgtLidBot{0%,20%{transform:translateY(0);}30%,42%{transform:translateY(8px);}55%,100%{transform:translateY(0);}}
  @keyframes lyrNgtSpark{0%,22%{opacity:.5;}32%,40%{opacity:.9;}52%,100%{opacity:.35;}}
  @keyframes lyrNgtSmile{0%,20%{d:path("M30 72 C 35 85, 65 85, 70 72");stroke-width:3.5;}30%,42%{d:path("M22 70 C 28 92, 72 92, 78 70");stroke-width:4.5;}55%,100%{d:path("M30 72 C 35 85, 65 85, 70 72");stroke-width:3.5;}}

  .lyr-aura{animation:lyrAuraPulse 2.2s ease-in-out infinite;}
  .lyr-aft-brow-l{animation:lyrAftBrow 1.8s ease-in-out infinite;transform-origin:29px 22px;}
  .lyr-aft-brow-r{animation:lyrAftBrow 1.8s ease-in-out .2s infinite;transform-origin:71px 16px;}
  .lyr-aft-spark1{animation:lyrAftSpark 1.5s ease-in-out infinite;transform-origin:12px 32px;}
  .lyr-aft-spark2{animation:lyrAftSpark 1.5s ease-in-out .5s infinite;transform-origin:89px 34px;}
  .lyr-aft-spark3{animation:lyrAftSpark 1.5s ease-in-out .9s infinite;transform-origin:51px 5px;}
  .lyr-ngt-lidtl{animation:lyrNgtLidTop 8s ease-in-out infinite;transform-origin:30px 47px;}
  .lyr-ngt-lidtr{animation:lyrNgtLidTop 8s ease-in-out infinite;transform-origin:70px 47px;}
  .lyr-ngt-lidbl{animation:lyrNgtLidBot 8s ease-in-out infinite;transform-origin:30px 50px;}
  .lyr-ngt-lidbr{animation:lyrNgtLidBot 8s ease-in-out infinite;transform-origin:70px 50px;}
  .lyr-ngt-spark{animation:lyrNgtSpark 8s ease-in-out infinite;}
  .lyr-ngt-smile{animation:lyrNgtSmile 8s ease-in-out infinite;}
  .lyr-eve-nod{animation:lyrEveNod 16s ease-in-out infinite;transform-origin:50px 55px;}
  .lyr-eve-eye-l{animation:lyrEveEyeOpen 16s ease-in-out infinite;transform-origin:30px 46px;}
  .lyr-eve-eye-r{animation:lyrEveEyeOpen 16s ease-in-out infinite;transform-origin:70px 46px;}
  .lyr-eve-close-l{animation:lyrEveEyeClosed 16s ease-in-out infinite;}
  .lyr-eve-close-r{animation:lyrEveEyeClosed 16s ease-in-out infinite;}
  .lyr-eve-smile{animation:lyrEveSmileAnim 16s ease-in-out infinite;transform-origin:50px 73px;}
  .lyr-eve-yawn{animation:lyrEveYawnAnim 16s ease-in-out infinite;transform-origin:50px 73px;}
  .lyr-eve-z1{animation:lyrEveZ1 16s ease-in-out infinite;}
  .lyr-eve-z2{animation:lyrEveZ2 16s ease-in-out infinite;}
  .lyr-eve-z3{animation:lyrEveZ3 16s ease-in-out infinite;}
  .lyr-party{animation:groovySway 1.7s ease-in-out infinite;transform-origin:50px 56px;}
  .lyr-hyper{animation:superBounce 1.3s ease-in-out infinite;transform-origin:50px 60px;}
  .lyr-sway{animation:lazySway 2.2s ease-in-out infinite;transform-origin:50px 56px;}
  .lyr-nod{animation:drowsyNod 3.5s ease-in-out infinite;transform-origin:50px 56px;}
  .lyr-heavy{animation:sinkDrift 4.8s ease-in-out infinite;transform-origin:50px 56px;}
  .lyr-bl-l{animation:blinkSlow 5.5s ease-in-out 0s infinite;transform-origin:34px 49px;}
  .lyr-bl-r{animation:blinkSlow 5.5s ease-in-out 0s infinite;transform-origin:66px 49px;}
  .lyr-wan-l{animation:wander 5.5s ease-in-out infinite;}
  .lyr-wan-r{animation:wander 5.5s ease-in-out .3s infinite;}
  .lyr-ck-l{animation:ckPulse 2.2s ease-in-out infinite;}
  .lyr-ck-r{animation:ckPulse 2.2s ease-in-out .6s infinite;}
  .lyr-smile{animation:smileScale 2s ease-in-out infinite;transform-origin:50px 68px;}
  .lyr-tw1{animation:lyrTwinkle 1.05s ease-in-out infinite;}
  .lyr-tw2{animation:lyrTwinkle 1.05s ease-in-out .4s infinite;}
  .lyr-tw3{animation:lyrTwinkle 1.05s ease-in-out .8s infinite;}
  .lyr-tw4{animation:lyrTwinkle 1.05s ease-in-out .2s infinite;}
  .lyr-zzz1{animation:lyrZzz 2.8s ease-in-out infinite;}
  .lyr-zzz2{animation:lyrZzzBig 2.8s ease-in-out 1.0s infinite;}
  .lyr-zzz3{animation:lyrZzzBig 2.8s ease-in-out 2.0s infinite;}
  .lyr-sd1{animation:lyrSdrift 3.5s ease-in-out infinite;--sdx:9px;--sdy:-15px;}
  .lyr-sd2{animation:lyrSdrift 3.5s ease-in-out 1.3s infinite;--sdx:-12px;--sdy:-11px;}
  .lyr-sd3{animation:lyrSdrift 3.5s ease-in-out 2.4s infinite;--sdx:6px;--sdy:-20px;}
  .lyr-conf1{animation:lyrConf 2s ease-in-out infinite;}
  .lyr-conf2{animation:lyrConf 2s ease-in-out .5s infinite;}
  .lyr-conf3{animation:lyrConf 2s ease-in-out 1s infinite;}
  .lyr-conf4{animation:lyrConf 2s ease-in-out 1.5s infinite;}
  .lyr-heart{animation:lyrHeart 1.4s ease-in-out infinite;transform-origin:50px 91px;}

  /* Pausa animaciones en hover del círculo */
  .lyr-scene:hover .lyr-party,
  .lyr-scene:hover .lyr-hyper,
  .lyr-scene:hover .lyr-sway,
  .lyr-scene:hover .lyr-heavy,
  .lyr-scene:hover .lyr-eve-nod,
  .lyr-scene:hover .lyr-eve-eye-l,
  .lyr-scene:hover .lyr-eve-eye-r { animation-play-state: paused; }
`;

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function LogoLyrium({
  frontImg = 'ICON.jpg',
  sideImg  = 'Letras.png',
}: LogoLyriumProps) {
  const circleWrapRef      = useRef<HTMLDivElement>(null);
  const cardRef            = useRef<HTMLDivElement>(null);
  const faceFrontRef       = useRef<HTMLDivElement>(null);
  const faceBackRef        = useRef<HTMLDivElement>(null);
  const sideContainerRef   = useRef<HTMLDivElement>(null);
  const sideImageRef       = useRef<HTMLImageElement>(null);
  const sideGlowRingRef    = useRef<HTMLDivElement>(null);
  const sceneRef           = useRef<HTMLDivElement>(null);

  const [currentFace, setCurrentFace] = useState<string>(FACES[getMood(true)]);

  useEffect(() => {
    const circleWrap    = circleWrapRef.current;
    const card          = cardRef.current;
    const faceFront     = faceFrontRef.current;
    const faceBack      = faceBackRef.current;
    const sideContainer = sideContainerRef.current;
    const sideImage     = sideImageRef.current;
    const sideGlowRing  = sideGlowRingRef.current;
    const scene         = sceneRef.current;

    if (!circleWrap || !card || !faceFront || !faceBack ||
        !sideContainer || !sideImage || !sideGlowRing || !scene) return;

    const COLORS: string[]      = ['#a3e635','#3b82f6','#0ea5e9','#ffffff','#86efac','#facc15'];
    const CLICK_COLORS: string[] = ['#a3e635','#facc15','#0ea5e9','#f472b6','#86efac','#fff'];

    // ── Sparks de entrada ──
    const spawnSparks = (count: number): void => {
      for (let i = 0; i < count; i++) {
        const s     = document.createElement('div');
        s.className = 'spark';
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const w     = Math.random() * 4 + 2;
        const h     = Math.random() * 12 + 6;
        const angle = Math.random() * 360;
        const dist  = Math.random() * 55 + 30;
        const dur   = Math.random() * 500 + 400;
        s.style.cssText = `width:${w}px;height:${h}px;background:${color};border-radius:${w}px;box-shadow:0 0 ${w * 3}px ${color};transform:translate(-50%,-50%) rotate(${angle}deg);`;
        circleWrap.appendChild(s);
        const rad = (angle * Math.PI) / 180;
        anime({
          targets: s,
          translateX: [0, Math.cos(rad) * dist],
          translateY: [0, Math.sin(rad) * dist],
          opacity: [1, 0],
          scaleY: [1, 0.2],
          duration: dur,
          easing: 'easeOutExpo',
          complete: () => s.remove(),
        });
      }
    };

    // ── Partículas de click ──
    const spawnClickParticles = (count: number): void => {
      for (let i = 0; i < count; i++) {
        const p     = document.createElement('div');
        p.className = 'click-spark';
        const color = CLICK_COLORS[Math.floor(Math.random() * CLICK_COLORS.length)];
        const size  = Math.random() * 7 + 3;
        const angle = (i / count) * 360 + Math.random() * 20;
        const dist  = Math.random() * 60 + 25;
        const dur   = Math.random() * 400 + 350;
        p.style.cssText = `width:${size}px;height:${size}px;background:${color};box-shadow:0 0 ${size * 2}px ${color};border-radius:50%;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;`;
        sideContainer.appendChild(p);
        const rad = (angle * Math.PI) / 180;
        anime({
          targets: p,
          translateX: [0, Math.cos(rad) * dist],
          translateY: [0, Math.sin(rad) * dist],
          opacity: [1, 0],
          scale: [1, 0],
          duration: dur,
          easing: 'easeOutExpo',
          complete: () => p.remove(),
        });
      }
    };

    // ── Reset animaciones al hacer hover en el círculo ──
    const handleSceneEnter = (): void => {
      const animated = scene.querySelectorAll<HTMLElement>(
        '.lyr-party,.lyr-hyper,.lyr-sway,.lyr-heavy,.lyr-eve-nod,.lyr-eve-eye-l,.lyr-eve-eye-r,.lyr-eve-smile,.lyr-ngt-lidtl,.lyr-ngt-lidtr,.lyr-ngt-lidbl,.lyr-ngt-lidbr'
      );
      animated.forEach((el) => {
        el.style.animationPlayState = 'paused';
        el.style.animation = 'none';
        void el.offsetWidth; // reflow
        el.style.animation = '';
        el.style.animationPlayState = 'running';
      });
    };
    scene.addEventListener('mouseenter', handleSceneEnter);

    // ── Hover ola fluida en imagen lateral ──
    let waveRunning = false;
    const handleSideEnter = (): void => {
      if (waveRunning) return;
      waveRunning = true;
      anime({
        targets: sideImage,
        keyframes: [
          { translateY: -8,  rotate: -3,   scaleX: 1.03, scaleY: 0.94, duration: 220, easing: 'easeOutSine' },
          { translateY:  3,  rotate:  1.5, scaleX: 0.98, scaleY: 1.04, duration: 240, easing: 'easeInOutSine' },
          { translateY: -3,  rotate: -1,   scaleX: 1.01, scaleY: 0.98, duration: 180, easing: 'easeInOutSine' },
          { translateY:  0,  rotate:  0,   scaleX: 1,    scaleY: 1,    duration: 280, easing: 'easeOutElastic(1, 0.5)' },
        ],
        complete: () => { waveRunning = false; },
      });
      anime({
        targets: sideImage,
        filter: [
          'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
          'drop-shadow(0 10px 22px rgba(163,230,53,0.55))',
          'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
        ],
        duration: 920,
        easing: 'easeInOutSine',
      });
    };
    sideContainer.addEventListener('mouseenter', handleSideEnter);

    // ── Click en imagen lateral ──
    const handleSideClick = (): void => {
      anime({ targets: sideImage, scaleX: [1, 0.82, 1.15, 0.94, 1.05, 1], scaleY: [1, 1.18, 0.88, 1.10, 0.97, 1], duration: 600, easing: 'easeOutElastic(1, 0.4)' });
      anime({ targets: sideGlowRing, scale: [0.85, 1.35], opacity: [0, 0.9, 0], borderColor: ['rgba(163,230,53,0.9)', 'rgba(14,165,233,0)'], duration: 520, easing: 'easeOutExpo' });
      spawnClickParticles(18);
    };
    sideContainer.addEventListener('click', handleSideClick);

    // ── Cambiar carita después de 5s ──
    const moodTimer = setTimeout(() => {
  setCurrentFace(FACES[getMood(false)]);
}, 5000);

const moodInterval = setInterval(() => {
  setCurrentFace(FACES[getMood(false)]);
}, 5 * 60 * 1000);


    // ── Secuencia de entrada ──
    const seq = anime.timeline({ autoplay: true });
    seq
      .add({
        targets: circleWrap, scale: [0, 1.2, 1], opacity: [0, 1], duration: 650, easing: 'easeOutBack',
        begin: () => {
          anime({ targets: faceFront, boxShadow: ['0 0 0px 0px rgba(163,230,53,0)', '0 0 55px 28px rgba(163,230,53,0.75)', '0 0 0px 0px rgba(163,230,53,0)'], duration: 700, easing: 'easeOutExpo' });
          setTimeout(() => spawnSparks(28), 80);
        },
      }, 200)
      .add({
        targets: card, rotateY: [0, 180], duration: 650, easing: 'easeInOutBack',
        begin: () => {
          anime({ targets: faceFront, boxShadow: ['0 0 0px rgba(59,130,246,0)', '0 0 45px 22px rgba(59,130,246,0.65)', '0 0 0px rgba(59,130,246,0)'], duration: 600, easing: 'easeOutExpo' });
          setTimeout(() => spawnSparks(20), 120);
        },
      }, 1050)
      .add({ targets: sideContainer, opacity: [0, 1], translateY: [-32, 0], duration: 380, easing: 'easeOutBack(2.2)' }, 3620)
      .add({ targets: sideImage,     scaleY: [0.75, 1.06, 1], scaleX: [1.18, 0.97, 1], opacity: [0, 1], duration: 360, easing: 'easeOutBack(1.6)' }, 3620)
      .add({
        targets: card, rotateY: [180, 360], duration: 650, easing: 'easeInOutBack',
        begin: () => spawnSparks(24),
        complete: () => {
          card.style.transform = 'rotateY(0deg)';
          card.classList.add('live');
        },
      }, 5900);

    // ── Guiño periódico (solo welcome) ──
    const doWelcomeWink = (): void => {
      const eyeOpen   = scene.querySelector<SVGElement>('#wk-eye-open');
      const eyeClosed = scene.querySelector<SVGElement>('#wk-eye-closed');
      const glasses   = scene.querySelector<SVGElement>('#wk-glasses');
      if (!eyeOpen || !eyeClosed || !glasses) return;

      anime.timeline({
        autoplay: true,
        complete: () => { setTimeout(doWelcomeWink, 3800 + Math.random() * 3000); },
      })
        .add({ targets: eyeOpen,   opacity: [1, 0], scaleY: [1, 0.05], duration: 140, easing: 'easeInQuad' }, 0)
        .add({ targets: eyeClosed, opacity: [0, 1],                     duration: 120, easing: 'easeOutQuad' }, 80)
        .add({ targets: glasses,   translateY: [0, 5],                  duration: 160, easing: 'easeOutQuad' }, 60)
        .add({ targets: glasses,   translateY: [5, 0],                  duration: 200, easing: 'easeInOutQuad' }, 460)
        .add({ targets: eyeClosed, opacity: [1, 0],                     duration: 120, easing: 'easeInQuad' }, 480)
        .add({ targets: eyeOpen,   opacity: [0, 1], scaleY: [0.05, 1],  duration: 180, easing: 'easeOutBack' }, 540);
    };
    const winkTimer = setTimeout(doWelcomeWink, 2200);

    // ── Wink periódico ojo derecho en tarde ──
    const doWink = (): void => {
      const eyeR = scene.querySelector<SVGElement>('.lyr-bl-r');
      if (!eyeR) return;
      anime({
        targets: eyeR, scaleY: [1, 0.04, 1], duration: 340, easing: 'easeInOutQuad',
        complete: () => setTimeout(doWink, 4200 + Math.random() * 2800),
      });
    };
    const winkTimer2 = setTimeout(doWink, 8200);

    // ── Cleanup ──
    return () => {
      scene.removeEventListener('mouseenter', handleSceneEnter);
      sideContainer.removeEventListener('mouseenter', handleSideEnter);
      sideContainer.removeEventListener('click', handleSideClick);
      clearTimeout(moodTimer);
      clearTimeout(winkTimer);
      clearTimeout(winkTimer2);
      clearInterval(moodInterval);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="lyr-root inline-flex items-center gap-1 px-3 py-2 bg-transparent cursor-default font-[Outfit,sans-serif]">

        {/* Círculo con flip 3D */}
        <div
          ref={circleWrapRef}
          className="flex-shrink-0 w-14 h-14 md:w-[4.8rem] md:h-[4.8rem] opacity-0 relative"
        >
          <div ref={sceneRef} className="lyr-scene">
            <div ref={cardRef} className="lyr-card">
              <div ref={faceFrontRef} className="lyr-face lyr-face-front">
                <img className="lyr-front-img" src={frontImg} alt="Lyrium" />
              </div>
              <div
                ref={faceBackRef}
                className="lyr-face lyr-face-back"
                dangerouslySetInnerHTML={{ __html: currentFace }}
              />
            </div>
          </div>
        </div>

        {/* Imagen lateral */}
        <div
          ref={sideContainerRef}
          className="lyr-side-container flex items-center justify-center opacity-0 relative cursor-pointer overflow-hidden rounded-[4px]"
        >
          <div ref={sideGlowRingRef} className="lyr-glow-ring" />
          <img
            ref={sideImageRef}
            className="lyr-side-img"
            src={sideImg}
            alt="Logo"
          />
        </div>
      </div>
    </>
  );
}
