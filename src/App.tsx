import { generate } from '@ant-design/colors'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import './App.css'

type PaletteKind = 'accent' | 'neutral'

const DEFAULT_DARK_BACKGROUND = '#141414'

const defaultColors: Record<PaletteKind, string> = {
  accent: '#1677FF',
  neutral: '#6B7280',
}

const kindCopy: Record<
  PaletteKind,
  { label: string; hint: string; presets: string[]; tokenPrefix: string }
> = {
  accent: {
    label: '主色',
    hint: '适合品牌色、按钮、强调信息和高亮操作。',
    presets: ['#1677FF', '#13C2C2', '#722ED1', '#F97316'],
    tokenPrefix: 'brand',
  },
  neutral: {
    label: '中性色',
    hint: '适合文字、边框、背景和整套灰阶系统。',
    presets: ['#6B7280', '#475569', '#52525B', '#78716C'],
    tokenPrefix: 'neutral',
  },
}

function normalizeHex(value: string) {
  const trimmed = value.trim().replace(/^#/, '')

  if (/^[\da-fA-F]{3}$/.test(trimmed)) {
    const expanded = trimmed
      .split('')
      .map((char) => `${char}${char}`)
      .join('')

    return `#${expanded.toUpperCase()}`
  }

  if (/^[\da-fA-F]{6}$/.test(trimmed)) {
    return `#${trimmed.toUpperCase()}`
  }

  return null
}

function getReadableTextColor(color: string) {
  const hex = color.replace('#', '')
  const red = Number.parseInt(hex.slice(0, 2), 16)
  const green = Number.parseInt(hex.slice(2, 4), 16)
  const blue = Number.parseInt(hex.slice(4, 6), 16)
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000

  return brightness > 166 ? '#0F172A' : '#F8FAFC'
}

function toRgba(color: string, alpha: number) {
  const hex = color.replace('#', '')
  const red = Number.parseInt(hex.slice(0, 2), 16)
  const green = Number.parseInt(hex.slice(2, 4), 16)
  const blue = Number.parseInt(hex.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function App() {
  const [paletteKind, setPaletteKind] = useState<PaletteKind>('accent')
  const [colors, setColors] = useState<Record<PaletteKind, string>>(defaultColors)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [darkBackground, setDarkBackground] = useState(DEFAULT_DARK_BACKGROUND)
  const [copyFeedback, setCopyFeedback] = useState('点击色块即可复制 HEX')

  const activeInput = colors[paletteKind]
  const normalizedColor = normalizeHex(activeInput)
  const resolvedColor = normalizedColor ?? defaultColors[paletteKind]
  const normalizedDarkBackground =
    normalizeHex(darkBackground) ?? DEFAULT_DARK_BACKGROUND
  const palette = generate(
    resolvedColor,
    isDarkMode
      ? { theme: 'dark', backgroundColor: normalizedDarkBackground }
      : { theme: 'default' },
  )
  const description = kindCopy[paletteKind]
  const tokenBlock = palette
    .map(
      (color, index) =>
        `--${description.tokenPrefix}-${String(index + 1).padStart(2, '0')}: ${color};`,
    )
    .join('\n')

  const appStyle = {
    '--accent': resolvedColor,
    '--accent-soft': toRgba(resolvedColor, 0.14),
    '--accent-strong': toRgba(resolvedColor, 0.34),
  } as CSSProperties

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? 'dark' : 'light'

    return () => {
      delete document.documentElement.dataset.theme
    }
  }, [isDarkMode])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCopyFeedback('点击色块即可复制 HEX')
    }, 1800)

    return () => {
      window.clearTimeout(timer)
    }
  }, [copyFeedback])

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopyFeedback(`${label} 已复制`)
    } catch {
      setCopyFeedback(`无法自动复制，请手动复制 ${label}`)
    }
  }

  function updateActiveColor(nextValue: string) {
    setColors((current) => ({
      ...current,
      [paletteKind]: nextValue,
    }))
  }

  return (
    <div
      className={`app-shell ${isDarkMode ? 'theme-dark' : 'theme-light'}`}
      style={appStyle}
    >
      <main className="app">
        <section className="hero-panel panel">
          <div className="hero-copy">
            <span className="eyebrow">@ant-design/colors</span>
            <h1>色板生成器</h1>
            <p>
              输入一个主色或中性色，立即生成一组 10 阶色板。切到暗黑模式时，会基于深色背景重新推导结果，更接近真实 UI
              场景。
            </p>
          </div>

          <div className="hero-actions">
            <button
              type="button"
              className={`mode-toggle ${isDarkMode ? 'is-active' : ''}`}
              onClick={() => setIsDarkMode((current) => !current)}
              aria-pressed={isDarkMode}
            >
              <span className="mode-track" aria-hidden="true">
                <span className="mode-thumb" />
              </span>
              <span>{isDarkMode ? '黑暗模式已开启' : '切换到黑暗模式'}</span>
            </button>
          </div>
        </section>

        <section className="workspace">
          <aside className="panel controls-panel">
            <div className="section-heading">
              <h2>输入配置</h2>
              <p>{description.hint}</p>
            </div>

            <div className="field">
              <span className="field-label">颜色类型</span>
              <div className="segmented" aria-label="颜色类型">
                {(Object.keys(kindCopy) as PaletteKind[]).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    className={kind === paletteKind ? 'is-selected' : ''}
                    onClick={() => setPaletteKind(kind)}
                    aria-pressed={kind === paletteKind}
                  >
                    {kindCopy[kind].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="hex-input">
                HEX 颜色
              </label>
              <div className="input-row">
                <input
                  type="color"
                  className="color-pick"
                  value={normalizedColor ?? resolvedColor}
                  onChange={(event) => updateActiveColor(event.target.value)}
                  aria-label="颜色选择器"
                />
                <input
                  id="hex-input"
                  className="text-input"
                  value={activeInput}
                  onChange={(event) => updateActiveColor(event.target.value)}
                  placeholder="#1677FF"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <p className={`field-note ${normalizedColor ? '' : 'is-warning'}`}>
                {normalizedColor
                  ? `当前生成色：${resolvedColor}`
                  : `请输入 3 位或 6 位 HEX。现在先用默认色 ${resolvedColor} 预览。`}
              </p>
            </div>

            {isDarkMode ? (
              <div className="field">
                <label className="field-label" htmlFor="background-input">
                  暗黑背景色
                </label>
                <div className="input-row">
                  <input
                    type="color"
                    className="color-pick"
                    value={normalizedDarkBackground}
                    onChange={(event) => setDarkBackground(event.target.value)}
                    aria-label="暗黑背景色选择器"
                  />
                  <input
                    id="background-input"
                    className="text-input"
                    value={darkBackground}
                    onChange={(event) => setDarkBackground(event.target.value)}
                    placeholder={DEFAULT_DARK_BACKGROUND}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <p className="field-note">
                  `generate()` 在暗黑模式下会把色阶和背景色混合，默认使用{' '}
                  {DEFAULT_DARK_BACKGROUND}。
                </p>
              </div>
            ) : null}

            <div className="field">
              <span className="field-label">推荐预设</span>
              <div className="preset-grid">
                {description.presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className="preset-pill"
                    onClick={() => updateActiveColor(preset)}
                  >
                    <span
                      className="preset-dot"
                      aria-hidden="true"
                      style={{ backgroundColor: preset }}
                    />
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="info-card">
              <span className="mini-title">算法说明</span>
              <p>
                `@ant-design/colors` 会输出 10 阶色板，通常第 6 阶最接近输入色。主色适合按钮和重点信息，中性色更适合作为边框、
                文本和背景系统的基础。
              </p>
            </div>
          </aside>

          <section className="panel result-panel">
            <div className="section-heading result-heading">
              <div>
                <h2>{description.label}色板</h2>
                <p>{copyFeedback}</p>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={() => copyText(tokenBlock, `${description.label}变量`)}
              >
                复制变量
              </button>
            </div>

            <div className="palette-grid">
              {palette.map((color, index) => (
                <button
                  key={`${color}-${index}`}
                  type="button"
                  className={`swatch ${index === 5 ? 'is-core' : ''}`}
                  onClick={() => copyText(color, color)}
                  style={
                    {
                      backgroundColor: color,
                      color: getReadableTextColor(color),
                    } as CSSProperties
                  }
                >
                  <span className="swatch-step">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <strong>{color}</strong>
                  <span className="swatch-meta">
                    {index === 5 ? '基准色' : '点击复制'}
                  </span>
                </button>
              ))}
            </div>

            <div className="preview-grid">
              <article className="preview-card demo-card">
                <div className="card-heading">
                  <h3>应用预览</h3>
                  <p>看看这组色阶在界面里的层次感。</p>
                </div>

                <div className="demo-surface">
                  <div
                    className="demo-banner"
                    style={
                      {
                        background: `linear-gradient(135deg, ${palette[2]}, ${palette[5]})`,
                        color: getReadableTextColor(palette[2]),
                      } as CSSProperties
                    }
                  >
                    <span>Palette Studio</span>
                    <small>{description.label}系统</small>
                  </div>

                  <div className="demo-row">
                    <span
                      className="demo-chip"
                      style={
                        {
                          backgroundColor: palette[0],
                          color: getReadableTextColor(palette[0]),
                        } as CSSProperties
                      }
                    >
                      Token 01
                    </span>
                    <button
                      type="button"
                      className="demo-action"
                      style={
                        {
                          backgroundColor: palette[5],
                          color: getReadableTextColor(palette[5]),
                          boxShadow: `0 16px 32px ${toRgba(palette[5], 0.28)}`,
                        } as CSSProperties
                      }
                    >
                      Primary Action
                    </button>
                  </div>

                  <div className="demo-list">
                    {[palette[1], palette[3], palette[7]].map((tone, index) => (
                      <div
                        key={tone}
                        className="demo-line"
                        style={
                          {
                            backgroundColor: tone,
                            color: getReadableTextColor(tone),
                          } as CSSProperties
                        }
                      >
                        <span>{`Level ${index + 1}`}</span>
                        <span>{tone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="preview-card">
                <div className="card-heading">
                  <h3>变量导出</h3>
                  <p>适合直接贴进 CSS 变量、Token 文件或设计系统草稿。</p>
                </div>

                <pre className="token-block">{tokenBlock}</pre>

                <div className="resource-links">
                  <a
                    href="https://github.com/ant-design/ant-design-colors"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub 仓库
                  </a>
                  <a
                    href="https://ant.design/docs/spec/colors"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ant Design 色彩规范
                  </a>
                </div>
              </article>
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}

export default App
