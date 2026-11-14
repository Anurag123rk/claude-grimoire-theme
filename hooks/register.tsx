import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// "Grimoire": AMOLED black, ink-gray panels, paper-white words.
// Roles are desaturated so it stays monochrome while keeping their meaning.
const { theme, problems } = makeColors({
  label: 'Grimoire',
  only: 'dark',
  roles: { accent: '#b8b8b8', danger: '#c47a7a', success: '#8fae8f', warning: '#bfa878', pro: '#a39cb3' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#000000',
        'surface-1': '#0a0a0a',
        'surface-2': '#111111',
        'surface-3': '#181818',
        'text-primary': '#ededed',
        'text-secondary': '#bdbdbd',
        'text-muted': '#8c8c8c',
      },
    },
  },
})

// A faint ink clover in the top-right corner, a single brush stroke along the
// bottom, and a few ash motes drifting up. Low opacity, slow, and away from the text.
const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<style>
  .mote { fill: #ffffff; opacity: 0; animation: rise 26s linear infinite; }
  .m2 { animation-delay: -7s; animation-duration: 31s; }
  .m3 { animation-delay: -15s; animation-duration: 23s; }
  .m4 { animation-delay: -21s; animation-duration: 35s; }
  .m5 { animation-delay: -4s; animation-duration: 29s; }
  @keyframes rise {
    0% { transform: translate(0, 0); opacity: 0; }
    15% { opacity: .18; }
    85% { opacity: .12; }
    100% { transform: translate(30px, -700px); opacity: 0; }
  }
  .clover { animation: breathe 14s ease-in-out infinite; transform-origin: 50px 50px; }
  @keyframes breathe { 0%,100% { opacity: .07; } 50% { opacity: .12; } }
  @media (prefers-reduced-motion: reduce) { .mote, .clover { animation: none; } .mote { opacity: .1; } }
</style>
<rect width="1600" height="1000" fill="#000000"/>
<svg x="1100" y="0" width="500" height="500" viewBox="0 0 500 500" preserveAspectRatio="xMaxYMin meet">
  <g transform="translate(330 150) rotate(-18)">
    <g class="clover" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round">
      <path d="M50 50 C 20 10, 70 -10, 50 50 C 30 -10, 80 10, 50 50" transform="translate(-50 -50)"/>
      <path d="M50 50 C 90 20, 110 70, 50 50 C 110 30, 90 80, 50 50" transform="translate(-50 -50)"/>
      <path d="M50 50 C 80 90, 30 110, 50 50 C 70 110, 20 90, 50 50" transform="translate(-50 -50)"/>
      <path d="M50 50 C 10 80, -10 30, 50 50 C -10 70, 10 20, 50 50" transform="translate(-50 -50)"/>
      <path d="M0 0 Q 18 40, 8 78" />
    </g>
  </g>
</svg>
<path d="M-40 985 C 300 955, 700 975, 1000 962 S 1500 950, 1660 968" fill="none" stroke="#ffffff" stroke-opacity=".05" stroke-width="10" stroke-linecap="round"/>
<circle class="mote" cx="180" cy="980" r="1.6"/>
<circle class="mote m2" cx="420" cy="1000" r="1.2"/>
<circle class="mote m3" cx="1250" cy="990" r="1.8"/>
<circle class="mote m4" cx="1450" cy="1010" r="1.3"/>
<circle class="mote m5" cx="80" cy="1005" r="1.1"/>
</svg>`

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'grimoire', glass: false },
}

async function apply($: EngineInterface) {
  const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
  if (unpainted !== undefined) $.ui.toast(unpainted)
  return $.theme.set(LOOK)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'grimoire',
      description: 'Grimoire monochrome theme: /grimoire on | off',
    })
    if ((await $.store.get('off')) !== true) await apply($)
    return next(e)
  })

  on('command.run', { command: 'grimoire' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'off') {
      await $.store.set('off', true)
      await $.theme.clear()
      return { text: 'Grimoire theme off.' }
    }
    await $.store.set('off', false)
    const set = await apply($)
    return {
      text: set.isDrawn
        ? 'Grimoire theme on (AMOLED black).'
        : `Grimoire theme set, but not drawn here: ${set.reason}`,
    }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') return next(e)
    const { Svg } = $.ui.resolve(e)
    return <Svg source={SCENE} alt="A faint ink clover and drifting ash on black" />
  })
}
