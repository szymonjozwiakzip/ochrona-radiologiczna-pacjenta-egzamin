import { useState, useMemo } from 'react'
import zadania from './zadania.json'
import './App.css'

// ─── Helpers ────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Home screen ────────────────────────────────────────────────────────────

function HomeScreen({ onKnowledgeBase, onTest }) {
  const [count, setCount] = useState('')
  const [mode, setMode] = useState('random')
  const [error, setError] = useState('')

  function handleStartCustom() {
    const n = parseInt(count, 10)
    if (!n || n < 1 || n > 140) {
      setError('Podaj liczbę od 1 do 140')
      return
    }
    setError('')
    onTest(n, mode)
  }

  return (
    <div className="home">
      <div className="home-header">
        <div className="home-badge">OCHRONA RADIOLOGICZNA</div>
        <h1 className="home-title">Baza Pytań Egzaminacyjnych</h1>
        <p className="home-subtitle">
          Przygotuj się do egzaminu z ochrony radiologicznej pacjenta.<br />
          Przeglądaj bazę wiedzy lub sprawdź się w losowym teście.
        </p>
        <div className="home-stats">
          <div className="stat-item">
            <span className="stat-number">140</span>
            <span className="stat-label">Pytań</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Kompletna baza</span>
          </div>
        </div>
      </div>

      <div className="home-cards">
        <div className="mode-card">
          <div className="mode-card-icon">📚</div>
          <h2>Baza Wiedzy</h2>
          <p>Przeglądaj wszystkie 140 pytań wraz z zaznaczonymi poprawnymi odpowiedziami.</p>
          <button className="btn-primary" onClick={onKnowledgeBase}>
            Otwórz bazę wiedzy
          </button>
        </div>

        <div className="mode-card">
          <div className="mode-card-icon">✏️</div>
          <h2>Test</h2>
          <p>Wpisz liczbę pytań lub kliknij, aby przejść przez wszystkie 140.</p>
          <div className="test-input-row">
            <input
              type="number"
              min="1"
              max="140"
              placeholder="Liczba pytań (1–140)"
              value={count}
              onChange={e => { setCount(e.target.value); setError('') }}
              className="test-count-input"
            />
            <button className="btn-primary" onClick={handleStartCustom}>
              Start
            </button>
          </div>
          <div className="test-mode-row" role="radiogroup" aria-label="Tryb kolejności pytań">
            <button
              type="button"
              className={`btn-secondary ${mode === 'random' ? 'mode-active' : ''}`}
              onClick={() => setMode('random')}
              aria-pressed={mode === 'random'}
            >
              Losowo
            </button>
            <button
              type="button"
              className={`btn-secondary ${mode === 'ordered' ? 'mode-active' : ''}`}
              onClick={() => setMode('ordered')}
              aria-pressed={mode === 'ordered'}
            >
              Po kolei
            </button>
          </div>
          {error && <p className="input-error">{error}</p>}
          <button className="btn-secondary" onClick={() => onTest(140, mode)}>
            Pełny test (140 pytań)
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Knowledge Base ──────────────────────────────────────────────────────────

function KnowledgeBase({ onBack }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 20

  const filtered = useMemo(() =>
    zadania.filter(q =>
      q['treść'].toLowerCase().includes(search.toLowerCase()) ||
      Object.values(q.odpowiedzi).some(a => a.toLowerCase().includes(search.toLowerCase()))
    ), [search])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function handleSearch(e) {
    setSearch(e.target.value)
    setPage(1)
  }

  return (
    <div className="kb-screen">
      <div className="screen-header">
        <button className="btn-back" onClick={onBack}>← Powrót</button>
        <div>
          <h2 className="screen-title">Baza Wiedzy</h2>
          <p className="screen-subtitle">{filtered.length} pytań</p>
        </div>
        <input
          className="search-input"
          type="search"
          placeholder="Szukaj pytania…"
          value={search}
          onChange={handleSearch}
        />
      </div>

      <div className="kb-list">
        {visible.map(q => (
          <div className="kb-card" key={q.index}>
            <div className="kb-card-num">#{q.index}</div>
            <p className="kb-question">{q['treść']}</p>
            <ul className="kb-answers">
              {Object.entries(q.odpowiedzi).map(([key, val]) => (
                <li
                  key={key}
                  className={`kb-answer ${key === q['poprawna_odpowiedź'] ? 'kb-correct' : ''}`}
                >
                  <span className={`answer-badge ${key === q['poprawna_odpowiedź'] ? 'badge-correct' : 'badge-normal'}`}>
                    {key}
                  </span>
                  {val}
                  {key === q['poprawna_odpowiedź'] && (
                    <span className="correct-mark">✓</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >‹ Poprzednia</button>
          <span className="page-info">{page} / {totalPages}</span>
          <button
            className="page-btn"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >Następna ›</button>
        </div>
      )}
    </div>
  )
}

// ─── Test Screen ─────────────────────────────────────────────────────────────

function TestScreen({ count, mode, onBack }) {
  const questions = useMemo(() => {
    const ordered = [...zadania].sort((a, b) => a.index - b.index)
    if (mode === 'ordered') {
      return ordered.slice(0, count)
    }
    return shuffle(ordered).slice(0, count)
  }, [count, mode])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [answers, setAnswers] = useState([])

  const q = questions[current]
  const isCorrect = selected === q['poprawna_odpowiedź']

  function handleSelect(key) {
    if (confirmed) return
    setSelected(key)
  }

  function handleConfirm() {
    if (!selected) return
    setConfirmed(true)
    const correct = selected === q['poprawna_odpowiedź']
    if (correct) setScore(s => s + 1)
    setAnswers(prev => [...prev, {
      question: q,
      selected,
      correct,
    }])
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      setFinished(true)
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setConfirmed(false)
    }
  }

  if (finished) {
    return <ResultScreen score={score} total={questions.length} answers={answers} onBack={onBack} />
  }

  const progress = ((current) / questions.length) * 100

  return (
    <div className="test-screen">
      <div className="test-topbar">
        <button className="btn-back" onClick={onBack}>← Wyjdź</button>
        <div className="test-progress-info">
          <span className="test-q-counter">Pytanie {current + 1} z {questions.length}</span>
          <span className="test-score-live">Poprawne: {score}</span>
        </div>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="test-card">
        <div className="test-q-num">#{q.index}</div>
        <p className="test-question">{q['treść']}</p>

        <ul className="test-answers">
          {Object.entries(q.odpowiedzi).map(([key, val]) => {
            let cls = 'test-answer'
            if (confirmed) {
              if (key === q['poprawna_odpowiedź']) cls += ' answer-correct'
              else if (key === selected && !isCorrect) cls += ' answer-wrong'
              else cls += ' answer-dimmed'
            } else if (key === selected) {
              cls += ' answer-selected'
            }
            return (
              <li key={key} className={cls} onClick={() => handleSelect(key)}>
                <span className="answer-key">{key}</span>
                <span className="answer-text">{val}</span>
                {confirmed && key === q['poprawna_odpowiedź'] && <span className="icon-correct">✓</span>}
                {confirmed && key === selected && !isCorrect && <span className="icon-wrong">✗</span>}
              </li>
            )
          })}
        </ul>

        {confirmed && !isCorrect && (
          <div className="feedback-wrong">
            Niepoprawna odpowiedź. Prawidłowa odpowiedź to: <strong>{q['poprawna_odpowiedź']}</strong> — {q.odpowiedzi[q['poprawna_odpowiedź']]}
          </div>
        )}
        {confirmed && isCorrect && (
          <div className="feedback-correct">
            Poprawna odpowiedź! ✓
          </div>
        )}

        <div className="test-actions">
          {!confirmed ? (
            <button
              className="btn-primary btn-confirm"
              disabled={!selected}
              onClick={handleConfirm}
            >
              Zatwierdź odpowiedź
            </button>
          ) : (
            <button className="btn-primary btn-confirm" onClick={handleNext}>
              {current + 1 >= questions.length ? 'Zobacz wynik' : 'Następne pytanie →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Result Screen ────────────────────────────────────────────────────────────

function ResultScreen({ score, total, answers, onBack }) {
  const pct = Math.round((score / total) * 100)
  const passed = pct >= 75

  return (
    <div className="result-screen">
      <div className="result-card">
        <div className={`result-badge ${passed ? 'result-pass' : 'result-fail'}`}>
          {passed ? '🎉 ZALICZONO' : '❌ NIEZALICZONO'}
        </div>
        <div className="result-score">{score} / {total}</div>
        <div className="result-pct">{pct}%</div>
        <p className="result-label">{passed ? 'Świetny wynik! Zdałeś egzamin.' : 'Nie osiągnięto progu 75%. Spróbuj ponownie.'}</p>

        <div className="result-stats">
          <div className="rstat correct-stat">
            <span>{score}</span> poprawnych
          </div>
          <div className="rstat wrong-stat">
            <span>{total - score}</span> błędnych
          </div>
        </div>

        <div className="result-review">
          <h3>Przegląd odpowiedzi</h3>
          {answers.map(({ question, selected, correct }, i) => (
            <div key={i} className={`review-item ${correct ? 'review-ok' : 'review-err'}`}>
              <div className="review-top">
                <span className="review-num">#{question.index}</span>
                <span className={`review-mark ${correct ? 'rmark-ok' : 'rmark-err'}`}>
                  {correct ? '✓' : '✗'}
                </span>
              </div>
              <p className="review-q">{question['treść']}</p>
              <p className="review-ans">
                Twoja odpowiedź: <strong>{selected}</strong> — {question.odpowiedzi[selected]}
              </p>
              {!correct && (
                <p className="review-correct-ans">
                  Poprawna: <strong>{question['poprawna_odpowiedź']}</strong> — {question.odpowiedzi[question['poprawna_odpowiedź']]}
                </p>
              )}
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={onBack} style={{ marginTop: '2rem' }}>
          ← Wróć do menu
        </button>
      </div>
    </div>
  )
}

// ─── App root ─────────────────────────────────────────────────────────────────

function App() {
  const [screen, setScreen] = useState('home') // 'home' | 'kb' | 'test'
  const [testCount, setTestCount] = useState(0)
  const [testMode, setTestMode] = useState('random')

  if (screen === 'kb') return <KnowledgeBase onBack={() => setScreen('home')} />
  if (screen === 'test') return <TestScreen count={testCount} mode={testMode} onBack={() => setScreen('home')} />

  return (
    <HomeScreen
      onKnowledgeBase={() => setScreen('kb')}
      onTest={(n, mode) => {
        setTestCount(n)
        setTestMode(mode)
        setScreen('test')
      }}
    />
  )
}

export default App
