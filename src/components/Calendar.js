import { useState, useEffect } from 'react'
import { supabase, localDate } from '../lib/supabase'
import { TASKS_BY_CAT, CAT_META } from '../lib/tasks'

const RU_MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const RU_DOW = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']

export default function Calendar() {
  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [monthData, setMonthData] = useState({}) // dateStr -> { freya: count, haru: count }
  const [selectedDay, setSelectedDay] = useState(null)
  const [report, setReport] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)

  // Load whole month's check counts
  useEffect(() => {
    const firstDay = `${calYear}-${String(calMonth+1).padStart(2,'0')}-01`
    const lastDay = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${new Date(calYear, calMonth+1, 0).getDate()}`
    supabase
      .from('daily_checks')
      .select('date, cat, done')
      .gte('date', firstDay)
      .lte('date', lastDay)
      .eq('done', true)
      .then(({ data }) => {
        const map = {}
        if (data) data.forEach(r => {
          if (!map[r.date]) map[r.date] = { freya: 0, haru: 0 }
          map[r.date][r.cat] = (map[r.date][r.cat] || 0) + 1
        })
        setMonthData(map)
      })
  }, [calYear, calMonth])

  const changeMonth = (delta) => {
    setCalMonth(prev => {
      let m = prev + delta, y = calYear
      if (m > 11) { m = 0; y++ }
      if (m < 0)  { m = 11; y-- }
      setCalYear(y)
      return m
    })
    setSelectedDay(null)
    setReport(null)
  }

  const selectDay = async (d) => {
    setSelectedDay(d)
    setReportLoading(true)
    const ds = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const dt = new Date(calYear, calMonth, d)

    const [checksRes, notesRes, customRes] = await Promise.all([
      supabase.from('daily_checks').select('cat, task_id, done').eq('date', ds),
      supabase.from('daily_notes').select('cat, note').eq('date', ds),
      supabase.from('custom_tasks').select('*'),
    ])

    const checksMap = {}
    if (checksRes.data) checksRes.data.forEach(r => {
      if (!checksMap[r.cat]) checksMap[r.cat] = {}
      checksMap[r.cat][r.task_id] = r.done
    })

    const notesMap = {}
    if (notesRes.data) notesRes.data.forEach(r => { notesMap[r.cat] = r.note })

    const customTasks = customRes.data || []

    setReport({ date: dt, dateStr: ds, checksMap, notesMap, customTasks })
    setReportLoading(false)
  }

  const today = new Date(); today.setHours(0,0,0,0)
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate()
  const startDow = (new Date(calYear, calMonth, 1).getDay() + 6) % 7

  const freyaTotal = TASKS_BY_CAT.freya.length
  const haruTotal  = TASKS_BY_CAT.haru.length

  return (
    <div>
      <div className="calendar-card">
        <div className="cal-header">
          <button className="cal-nav" onClick={() => changeMonth(-1)}>◀</button>
          <div className="cal-month">{RU_MONTHS[calMonth]} {calYear}</div>
          <button className="cal-nav" onClick={() => changeMonth(1)}>▶</button>
        </div>
        <div className="cal-grid">
          {RU_DOW.map(d => <div key={d} className="cal-dow">{d}</div>)}
          {Array(startDow).fill(null).map((_,i) => <div key={'e'+i} className="cal-day empty" />)}
          {Array.from({length: daysInMonth}, (_,i) => i+1).map(d => {
            const ds = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
            const dt = new Date(calYear, calMonth, d); dt.setHours(0,0,0,0)
            const isToday    = dt.getTime() === today.getTime()
            const isSel      = selectedDay === d
            const data       = monthData[ds] || {}
            let cls = 'cal-day'
            if (isToday) cls += ' today'
            else if (isSel) cls += ' selected'
            const freyaDone = data.freya || 0
            const haruDone  = data.haru  || 0
            return (
              <div key={d} className={cls} onClick={() => selectDay(d)}>
                {d}
                {(freyaDone > 0 || haruDone > 0) && (
                  <div className="dot-row">
                    {freyaDone > 0 && (
                      <div className="dot" style={{ background: freyaDone >= freyaTotal ? '#c97b5a' : '#e8c4a0' }} />
                    )}
                    {haruDone > 0 && (
                      <div className="dot" style={{ background: haruDone >= haruTotal ? '#4a6741' : '#8fad88' }} />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:16, marginBottom:16, paddingLeft:4 }}>
        {[
          { color:'#c97b5a', label:'Freya — всё выполнено' },
          { color:'#e8c4a0', label:'Freya — частично' },
          { color:'#4a6741', label:'Haru — всё выполнено' },
          { color:'#8fad88', label:'Haru — частично' },
        ].map(l => (
          <div key={l.label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.7rem', color:'#aaa' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:l.color, flexShrink:0 }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Day report */}
      {selectedDay && (
        <div className="day-report">
          <div className="day-report-header">
            <div className="day-report-title">
              {report?.date.toLocaleDateString('ru-RU', { weekday:'long', day:'numeric', month:'long' })}
            </div>
            <button className="close-btn" onClick={() => { setSelectedDay(null); setReport(null) }}>✕</button>
          </div>
          <div className="day-report-body">
            {reportLoading && <div className="report-empty">загружаем...</div>}
            {!reportLoading && report && (() => {
              const hasAny = Object.keys(report.checksMap).length > 0 || Object.values(report.notesMap).some(n => n)
              if (!hasAny) return <div className="report-empty">Нет данных за этот день</div>
              return (
                <>
                  {['freya','haru'].map(c => {
                    const meta = CAT_META[c]
                    const catChecks = report.checksMap[c] || {}
                    const baseTasks = TASKS_BY_CAT[c]
                    const customCat = report.customTasks.filter(t => t.cat === c || t.cat === 'both')
                    const allT = [...baseTasks, ...customCat]
                    const doneCount = allT.filter(t => catChecks[t.id]).length
                    const note = report.notesMap[c]
                    if (doneCount === 0 && !note) return null
                    return (
                      <div className="report-cat-section" key={c}>
                        <div className="report-cat-title" style={{ color: meta.color }}>
                          {meta.emoji} {meta.name}
                          <span className="report-progress">{doneCount} / {allT.length}</span>
                        </div>
                        {allT.map(t => (
                          <div className="report-task-row" key={t.id}>
                            <span style={{fontSize:'0.95rem', width:20, textAlign:'center'}}>
                              {catChecks[t.id] ? '✅' : '⬜'}
                            </span>
                            <span style={{ color: catChecks[t.id] ? 'var(--forest)' : '#ccc', textDecoration: catChecks[t.id] ? 'none' : 'line-through' }}>
                              {t.label}{t.time ? ` (${t.time})` : ''}
                            </span>
                          </div>
                        ))}
                        {note && (
                          <div className="report-notes">
                            <div className="report-notes-label">Заметки</div>
                            <div className="report-notes-text">{note}</div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
