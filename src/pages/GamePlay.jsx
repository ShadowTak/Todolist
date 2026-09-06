import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getSession, saveDemoScore } from '../api'
import { getGameDefinition, shuffle } from '../games'
import Icon from '../components/Icon'
import './Games.css'

const MATCH_EMOJI = { 'น้ำ': '💧', 'ต้นไม้': '🌱', 'จักรยาน': '🚲', 'รีไซเคิล': '♻️', 'พลังงานแสงอาทิตย์': '☀️', 'แก้วใช้ซ้ำ': '🥤' }

export default function GamePlay() {
  const { gameType } = useParams()
  const game = getGameDefinition(gameType)
  const session = getSession()
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)
  const [answers, setAnswers] = useState([])

  useEffect(() => {
    setStarted(false); setFinished(false); setScore(0); setRound(0); setAnswers([])
  }, [game.key])

  const finish = (finalScore, metadata = {}) => {
    const saved = saveDemoScore({ student_code: session?.code, game_type: game.key, score: finalScore, metadata })
    setScore(saved.score); setFinished(true)
  }

  if (finished) return <GameResult game={game} score={score} onReplay={() => { setFinished(false); setStarted(false); setRound(0); setScore(0); setAnswers([]) }} />
  if (!started) return <GameIntro game={game} onStart={() => setStarted(true)} />

  if (game.type === 'quiz') return <QuizGame game={game} round={round} setRound={setRound} answers={answers} setAnswers={setAnswers} onFinish={finish} />
  if (game.type === 'sorting') return <SortingGame game={game} round={round} setRound={setRound} answers={answers} setAnswers={setAnswers} onFinish={finish} />
  return <MatchingGame game={game} onFinish={finish} />
}

function GameIntro({ game, onStart }) {
  return <div className="game-shell fade-in">
    <Link className="back-link" to="/games">← ห้องเกม</Link>
    <div className="card game-intro" style={{ '--game-accent': game.color }}>
      <div className="game-card-icon" style={{ background: game.color }}><Icon name={game.icon} size={34} /></div>
      <div className="game-card-kicker">เดโมเกม · คะแนนเต็ม 100</div>
      <h1>{game.title}</h1><p className="muted">{game.description}</p>
      <div className="game-rules"><div><strong>{game.type === 'matching' ? '6' : '10'}</strong><span>{game.type === 'matching' ? 'คู่' : 'รอบ'}</span></div><div><strong>{game.type === 'matching' ? '−5' : '+10'}</strong><span>ต่อคำตอบ</span></div><div><strong>∞</strong><span>เล่นซ้ำได้</span></div></div>
      <button className="btn btn-block" onClick={onStart}>เริ่มเล่นเกม <span aria-hidden="true">→</span></button>
    </div>
  </div>
}

function Progress({ current, total }) {
  return <div className="game-progress"><div className="game-progress-top"><span>รอบที่ {Math.min(current + 1, total)} / {total}</span><span>{Math.round((current / total) * 100)}%</span></div><div className="progress-track"><div className="progress-fill" style={{ width: `${(current / total) * 100}%` }} /></div></div>
}

function QuizGame({ game, round, setRound, answers, setAnswers, onFinish }) {
  const [selected, setSelected] = useState(null)
  const question = game.questions[round]
  const choose = (index) => { if (selected !== null) return; setSelected(index); setAnswers([...answers, index === question.answer]); }
  const next = () => { const nextRound = round + 1; if (nextRound >= game.questions.length) { const correct = [...answers, selected === question.answer].filter(Boolean).length; onFinish(correct * 10, { correct, total: game.questions.length }); } else { setRound(nextRound); setSelected(null); } }
  return <div className="game-shell fade-in"><Link className="back-link" to="/games">← ออกจากเกม</Link><div className="card game-panel"><Progress current={round} total={game.questions.length}/><div className="question-number">คำถาม {round + 1}</div><h1>{question.prompt}</h1><div className="option-grid">{question.options.map((option, i) => <button key={option} className={`game-option ${selected !== null ? (i === question.answer ? 'correct' : i === selected ? 'wrong' : '') : ''}`} onClick={() => choose(i)}>{option}<span>{selected !== null && i === question.answer ? '✓' : ''}</span></button>)}</div>{selected !== null && <div className={`answer-note ${selected === question.answer ? 'correct-note' : 'wrong-note'}`}><strong>{selected === question.answer ? 'เก่งมาก! ตอบถูก' : 'ยังไม่ใช่คำตอบนี้'}</strong><p>{question.explanation}</p></div>}{selected !== null && <button className="btn btn-block" onClick={next}>{round + 1 === game.questions.length ? 'ดูผลลัพธ์' : 'ข้อต่อไป'} <span aria-hidden="true">→</span></button>}</div></div>
}

function SortingGame({ game, round, setRound, answers, setAnswers, onFinish }) {
  const [selected, setSelected] = useState(null)
  const item = game.items[round]
  const choose = (index) => { if (selected !== null) return; setSelected(index); setAnswers([...answers, index === item.answer]); }
  const next = () => { const nextRound = round + 1; if (nextRound >= game.items.length) { const correct = [...answers, selected === item.answer].filter(Boolean).length; onFinish(correct * 10, { correct, total: game.items.length }); } else { setRound(nextRound); setSelected(null); } }
  return <div className="game-shell fade-in"><Link className="back-link" to="/games">← ออกจากเกม</Link><div className="card game-panel"><Progress current={round} total={game.items.length}/><div className="sorting-item"><div className="sorting-symbol">{['♻️','🍌','🔋','📦','💡','🍱','🥫','😷','🍫','🍾'][round]}</div><div><div className="question-number">ขยะชิ้นที่ {round + 1}</div><h1>{item.name}</h1></div></div><div className="bin-grid">{item.bins.map((bin, i) => <button key={bin} className={`bin-option bin-${i} ${selected !== null ? (i === item.answer ? 'correct' : i === selected ? 'wrong' : '') : ''}`} onClick={() => choose(i)}><span className="bin-icon">{['🗑️','♻️','🍃','☣️'][i]}</span>{bin}</button>)}</div>{selected !== null && <div className={`answer-note ${selected === item.answer ? 'correct-note' : 'wrong-note'}`}><strong>{selected === item.answer ? 'แยกถูกถังแล้ว' : 'ลองจำไว้สำหรับครั้งหน้า'}</strong><p>{item.tip}</p></div>}{selected !== null && <button className="btn btn-block" onClick={next}>{round + 1 === game.items.length ? 'ดูผลลัพธ์' : 'ขยะชิ้นต่อไป'} <span aria-hidden="true">→</span></button>}</div></div>
}

function MatchingGame({ game, onFinish }) {
  const cards = useMemo(() => shuffle([...game.pairs, ...game.pairs]).map((value, i) => ({ id: i, value, matched: false })), [game])
  const [deck, setDeck] = useState(cards)
  const [open, setOpen] = useState([])
  const [moves, setMoves] = useState(0)
  const [locked, setLocked] = useState(false)
  useEffect(() => { if (deck.every((card) => card.matched)) onFinish(Math.max(0, 100 - Math.max(0, moves - 6) * 5), { moves }) }, [deck, moves, onFinish])
  const flip = (id) => {
    if (locked || open.includes(id) || deck.find((card) => card.id === id)?.matched) return
    const nextOpen = [...open, id]; setOpen(nextOpen)
    if (nextOpen.length === 2) { setMoves((m) => m + 1); setLocked(true); const [a, b] = nextOpen.map((value) => deck.find((card) => card.id === value)); if (a.value === b.value) { setTimeout(() => { setDeck((current) => current.map((card) => nextOpen.includes(card.id) ? { ...card, matched: true } : card)); setOpen([]); setLocked(false) }, 450) } else setTimeout(() => { setOpen([]); setLocked(false) }, 750) }
  }
  return <div className="game-shell fade-in"><Link className="back-link" to="/games">← ออกจากเกม</Link><div className="card game-panel"><div className="game-progress-top"><span>จับคู่ให้ครบ 6 คู่</span><span>เปิดผิด {Math.max(0, moves - 6)} ครั้ง</span></div><div className="matching-grid">{deck.map((card) => <button key={card.id} className={`matching-card ${open.includes(card.id) || card.matched ? 'open' : ''} ${card.matched ? 'matched' : ''}`} onClick={() => flip(card.id)} aria-label={open.includes(card.id) || card.matched ? card.value : 'การ์ดคว่ำ'}><span>{open.includes(card.id) || card.matched ? MATCH_EMOJI[card.value] : '?'}</span><small>{open.includes(card.id) || card.matched ? card.value : 'เปิดการ์ด'}</small></button>)}</div><div className="matching-tip"><Icon name="target" size={18}/> เปิดสองใบเพื่อจับคู่ · คะแนนเริ่ม 100 และหักครั้งละ 5 เมื่อจับคู่ผิด</div></div></div>
}

function GameResult({ game, score, onReplay }) {
  const grade = score >= 80 ? 'ยอดเยี่ยม!' : score >= 50 ? 'ทำได้ดี!' : 'ลองอีกครั้งได้เสมอ'
  return <div className="game-shell fade-in"><div className="card result-card"><div className="result-icon" style={{ background: game.color }}><Icon name="trophy" size={38}/></div><div className="game-card-kicker">เล่นจบแล้ว · {game.title}</div><h1>{grade}</h1><div className="result-score">{score}<span>/100</span></div><p className="muted">บันทึกคะแนนไว้ในหน้า “คะแนนของฉัน” เรียบร้อยแล้ว</p><div className="result-actions"><button className="btn" onClick={onReplay}>เล่นอีกครั้ง</button><Link className="btn btn-ghost" to="/my-score">ดูคะแนนของฉัน</Link><Link className="btn btn-ghost" to="/games">เลือกเกมอื่น</Link></div></div></div>
}
