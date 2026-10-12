# -*- coding: utf-8 -*-
"""Libreria di icone SVG in stile flat/monoline per il manuale FeniceOS.
Ogni icona e' un badge circolare con un glifo bianco stilizzato al centro,
in coerenza con la palette del manuale."""

def badge(glyph, bg="#1b3a4b", size=120):
    return f'''<svg width="{size}" height="{size}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
<circle cx="60" cy="60" r="58" fill="{bg}"/>
<circle cx="60" cy="60" r="58" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="2"/>
{glyph}
</svg>'''

# --- Glifi (tratti bianchi, viewBox coerente 0-120) ---

LEAF = '''<path d="M40 82 C40 50 60 32 92 30 C90 62 72 82 40 82 Z" fill="none" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
<path d="M42 80 C58 64 70 50 90 32" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>'''

RECYCLE = '''<path d="M60 28 L72 50 L60 50 Z M60 28 A32 32 0 0 1 88 46" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M92 62 L92 88 L68 88 Z M92 62 A32 32 0 0 1 78 90" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M28 62 L46 88 L58 78 Z M28 62 A32 32 0 0 1 46 34" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>'''

HEART = '''<path d="M60 88 C36 70 24 56 24 42 C24 30 33 22 44 22 C51 22 57 26 60 32 C63 26 69 22 76 22 C87 22 96 30 96 42 C96 56 84 70 60 88 Z" fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>'''

HOURGLASS = '''<path d="M38 24 H82 M38 96 H82 M40 24 C40 46 80 46 80 24 M40 96 C40 74 80 74 80 96" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M50 32 L70 32 L60 52 Z M50 88 L70 88 L60 68 Z" fill="#fff"/>'''

MONITOR = '''<rect x="26" y="32" width="68" height="46" rx="4" fill="none" stroke="#fff" stroke-width="5"/>
<path d="M46 92 H74 M60 78 V92" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
<path d="M38 55 L52 44 L64 58 L82 40" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'''

GEARS = '''<circle cx="46" cy="50" r="16" fill="none" stroke="#fff" stroke-width="4.5"/>
<circle cx="46" cy="50" r="5" fill="#fff"/>
<circle cx="78" cy="76" r="12" fill="none" stroke="#fff" stroke-width="4.5"/>
<circle cx="78" cy="76" r="4" fill="#fff"/>
<path d="M46 30 V34 M46 66 V70 M26 50 H30 M62 50 H66 M32 36 L35 39 M57 61 L60 64 M60 36 L57 39 M35 61 L32 64" stroke="#fff" stroke-width="4" stroke-linecap="round"/>'''

HANDSHAKE = '''<path d="M22 58 L40 48 L54 58 L46 66 L34 58" fill="none" stroke="#fff" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M98 58 L80 48 L66 58 L74 66 L86 58" fill="none" stroke="#fff" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M46 66 L54 74 L58 70 M58 70 L64 76 L68 72 M54 58 L66 58" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>'''

USERS = '''<circle cx="44" cy="42" r="12" fill="none" stroke="#fff" stroke-width="4.5"/>
<path d="M22 90 C22 72 32 62 44 62 C56 62 66 72 66 90" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>
<circle cx="80" cy="48" r="9" fill="none" stroke="#fff" stroke-width="4"/>
<path d="M64 90 C64 76 72 68 82 68 C92 68 100 76 100 90" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>'''

FOOTPRINTS = '''<ellipse cx="42" cy="42" rx="10" ry="15" fill="none" stroke="#fff" stroke-width="4"/>
<ellipse cx="78" cy="66" rx="10" ry="15" fill="none" stroke="#fff" stroke-width="4"/>
<circle cx="42" cy="24" r="4" fill="#fff"/><circle cx="78" cy="48" r="4" fill="#fff"/>'''

KEYBOARD = '''<rect x="22" y="40" width="76" height="42" rx="5" fill="none" stroke="#fff" stroke-width="4.5"/>
<path d="M32 52 H36 M42 52 H46 M52 52 H56 M62 52 H66 M72 52 H76 M82 52 H86 M32 62 H36 M42 62 H46 M52 62 H56 M62 62 H66 M72 62 H76 M82 62 H86 M38 72 H82" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>'''

TERMINAL = '''<rect x="24" y="30" width="72" height="60" rx="5" fill="none" stroke="#fff" stroke-width="4.5"/>
<path d="M36 50 L48 60 L36 70 M56 72 H76" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'''

TEACHER = '''<circle cx="60" cy="38" r="12" fill="none" stroke="#fff" stroke-width="4.5"/>
<path d="M36 90 C36 68 46 58 60 58 C74 58 84 68 84 90" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>
<path d="M40 74 H26 M26 74 V64 M26 74 L34 82" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'''

CLOCKBOOK = '''<path d="M28 30 H70 V90 H28 C24 90 24 30 28 30 Z" fill="none" stroke="#fff" stroke-width="4.5" stroke-linejoin="round"/>
<path d="M28 30 C24 30 24 90 28 90" fill="none" stroke="#fff" stroke-width="4"/>
<circle cx="84" cy="68" r="20" fill="#1b3a4b" stroke="#fff" stroke-width="4.5"/>
<path d="M84 58 V68 L92 74" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/>'''

GLOBE = '''<circle cx="60" cy="60" r="34" fill="none" stroke="#fff" stroke-width="4.5"/>
<ellipse cx="60" cy="60" rx="14" ry="34" fill="none" stroke="#fff" stroke-width="3.5"/>
<path d="M26 60 H94 M31 42 H89 M31 78 H89" stroke="#fff" stroke-width="3.5" fill="none"/>'''

BRAIN = '''<circle cx="60" cy="60" r="33" fill="none" stroke="#fff" stroke-width="4.5"/>
<circle cx="42" cy="46" r="4" fill="#fff"/><circle cx="60" cy="38" r="4" fill="#fff"/><circle cx="78" cy="46" r="4" fill="#fff"/>
<circle cx="38" cy="68" r="4" fill="#fff"/><circle cx="60" cy="80" r="4" fill="#fff"/><circle cx="82" cy="68" r="4" fill="#fff"/>
<circle cx="60" cy="58" r="5" fill="#fff"/>
<path d="M42 46 L60 58 M60 38 L60 58 M78 46 L60 58 M38 68 L60 58 M60 80 L60 58 M82 68 L60 58" stroke="#fff" stroke-width="3" fill="none"/>'''

QUIZ = '''<circle cx="60" cy="46" r="26" fill="none" stroke="#fff" stroke-width="4.5"/>
<path d="M50 40 C50 32 70 32 70 42 C70 50 60 48 60 58" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/>
<circle cx="60" cy="70" r="3.5" fill="#fff"/>
<rect x="34" y="86" width="16" height="16" rx="3" fill="none" stroke="#fff" stroke-width="4"/>
<rect x="70" y="86" width="16" height="16" rx="3" fill="none" stroke="#fff" stroke-width="4"/>'''

CHECK = '''<path d="M32 62 L52 82 L90 40" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'''

BOOKOPEN = '''<path d="M60 34 C50 26 32 26 24 32 V88 C32 82 50 82 60 90 C70 82 88 82 96 88 V32 C88 26 70 26 60 34 Z" fill="none" stroke="#fff" stroke-width="4.5" stroke-linejoin="round"/>
<path d="M60 34 V90" stroke="#fff" stroke-width="3.5"/>'''

SPARK = '''<path d="M60 24 L68 52 L96 60 L68 68 L60 96 L52 68 L24 60 L52 52 Z" fill="none" stroke="#fff" stroke-width="4.5" stroke-linejoin="round"/>'''

def phoenix_mark(size=380, warm="#e07a3e", warm2="#f2b25c", dark="#1b3a4b"):
    """Marchio stilizzato della fenice: corpo centrale, piume/ali a ventaglio, coda a fiamma."""
    feathers_left = ""
    feathers_right = ""
    import math
    cx, cy = 190, 210
    n = 7
    for i in range(n):
        t = i / (n - 1)
        angle = math.radians(200 - t * 80)  # ventaglio ala sinistra
        length = 150 + (1 - abs(t - 0.5) * 2) * 30
        x2 = cx + length * math.cos(angle)
        y2 = cy - length * math.sin(angle) * 0.7
        cxp = cx + (length * 0.6) * math.cos(angle + 0.12)
        cyp = cy - (length * 0.6) * math.sin(angle + 0.12) * 0.7
        feathers_left += f'<path d="M{cx},{cy} Q{cxp:.1f},{cyp:.1f} {x2:.1f},{y2:.1f}" fill="none" stroke="url(#featherGrad)" stroke-width="{9 - abs(t-0.5)*6:.1f}" stroke-linecap="round" opacity="{0.55+0.4*(1-abs(t-0.5)*2):.2f}"/>'
    for i in range(n):
        t = i / (n - 1)
        angle = math.radians(200 - t * 80)
        length = 150 + (1 - abs(t - 0.5) * 2) * 30
        x2 = cx - length * math.cos(angle)
        y2 = cy - length * math.sin(angle) * 0.7
        cxp = cx - (length * 0.6) * math.cos(angle + 0.12)
        cyp = cy - (length * 0.6) * math.sin(angle + 0.12) * 0.7
        feathers_right += f'<path d="M{cx},{cy} Q{cxp:.1f},{cyp:.1f} {x2:.1f},{y2:.1f}" fill="none" stroke="url(#featherGrad)" stroke-width="{9 - abs(t-0.5)*6:.1f}" stroke-linecap="round" opacity="{0.55+0.4*(1-abs(t-0.5)*2):.2f}"/>'

    return f'''<svg width="{size}" height="{size}" viewBox="0 0 380 380" xmlns="http://www.w3.org/2000/svg">
<defs>
  <linearGradient id="featherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="{warm2}"/>
    <stop offset="100%" stop-color="{warm}"/>
  </linearGradient>
  <radialGradient id="glow" cx="50%" cy="45%" r="60%">
    <stop offset="0%" stop-color="#ffe1b0" stop-opacity="0.9"/>
    <stop offset="100%" stop-color="#ffe1b0" stop-opacity="0"/>
  </radialGradient>
</defs>
<circle cx="190" cy="200" r="175" fill="url(#glow)"/>
{feathers_left}
{feathers_right}
<path d="M190 200 C170 250 175 300 190 335 C205 300 210 250 190 200 Z" fill="url(#featherGrad)" opacity="0.85"/>
<ellipse cx="190" cy="185" rx="26" ry="34" fill="{warm2}"/>
<path d="M190 152 C182 138 168 132 156 134 C164 146 174 152 190 158 C206 152 216 146 224 134 C212 132 198 138 190 152 Z" fill="{warm2}"/>
<circle cx="190" cy="148" r="15" fill="{warm2}"/>
<path d="M190 138 L202 132 L192 146 Z" fill="{dark}"/>
<circle cx="185" cy="145" r="2.6" fill="{dark}"/>
</svg>'''
