import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, localDate } from '../lib/supabase'
import { TASKS_BY_CAT, CAT_META } from '../lib/tasks'

function celebrate() {
  const el = document.createElement('div')
  el.className = 'celebration'
  el.textContent = ['🐾','✨','💛','🌿','⭐'][Math.floor(Math.random()*5)]
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 1300)
}

export default function Tracker() {
  const [cat, setCat] = useState('freya')
  const [currentDate, setCurrentDate] = useState(() => { const d = new Date(); d.setHours(0,0,0,0); return d })
  const [checks, setChecks] = useState({})
  const [notes, setNotes] = useState('')
  const [customTasks, setCustomTasks] = useState([])
  const [hiddenTasks, setHiddenTasks] = useState(new Set()) // скрытые базовые задачи
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)
  const notesTimer = useRef(null)

  const dateStr = localDate(currentDate)
  const baseTasks = TASKS_BY_CAT[cat].filter(t => !hiddenTasks.has(t.id))
  const catCustom = customTasks.filter(t => t.cat === cat || t.cat === 'both')
  const allTasks = [...baseTasks, ...catCustom]
  const total = allTasks.length
  const done = allTasks.filter(t => checks[t.id]).length

  const loadDay = useCallback(async () => {
    setLoading(true)
    const [checksRes, notesRes] = await Promise.all([
      supabase.from('daily_checks').select('task_id, done').eq('date', dateStr).eq('cat', cat),
      supabase.from('daily_notes').select('note').eq('date', dateStr).eq('cat', cat).maybeSingle(),
    ])
    const map = {}
    if (checksRes.data) checksRes.data.forEach(r => { map[r.task_id] = r.done })
    setChecks(map)
    setNotes(notesRes.data?.note || '')
    setLoading(false)
  }, [dateStr, cat])

  // Load custom tasks + hidden tasks when cat changes
  useEffect(() => {
    Promise.all([
      supabase.from('custom_tasks').select('*'),
      supabase.from('hidden_tasks').select('task_id').eq('cat', cat),
    ]).then(([customRes, hiddenRes]) => {
      if (customRes.data) setCustomTasks(customRes.data)
      if (hiddenRes.data) setHiddenTasks(new Set(hiddenRes.data.map(r => r.task_id)))
    })
  }, [cat])

  useEffect(() => { loadDay() }, [loadDay])

  const toggleTask = async (taskId) => {
    const newVal = !checks[taskId]
    setChecks(prev => ({ ...prev, [taskId]: newVal }))
    if (newVal) celebrate()
    await supabase.from('daily_checks').upsert(
      { date: dateStr, cat, task_id: taskId, done: newVal, updated_at: new Date().toISOString() },
      { onConflict: 'date,cat,task_id' }
    )
  }

  const saveNotes = (val) => {
    setNotes(val)
    clearTimeout(notesTimer.current)
    notesTimer.current = setTimeout(async () => {
      await supabase.from('daily_notes').upsert(
        { date: dateStr, cat, note: val, updated_at: new Date().toISOString() },
        { onConflict: 'date,cat' }
      )
    }, 600)
  }

  const addCustomTask = async () => {
    const label = newTask.trim()
    if (!label) return
    const { data } = await supabase.from('custom_tasks').insert({ label, cat, section: 'Дополнительно' }).select().single()
    if (data) setCustomTasks(prev => [...prev, data])
    setNewTask('')
  }

  const deleteCustomTask = async (id) => {
    await supabase.from('custom_tasks').delete().eq('id', id)
    setCustomTasks(prev => prev.filter(t => t.id !== id))
    setChecks(prev => { const next = {...prev}; delete next[id]; return next })
  }

  // Скрыть базовую задачу (с подтверждением)
  const hideBaseTask = async (e, taskId) => {
    e.stopPropagation()
    if (!window.confirm('Убрать эту задачу из списка? Её можно будет вернуть через настройки.')) return
    await supabase.from('hidden_tasks').upsert({ task_id: taskId, cat }, { onConflict: 'task_id,cat' })
    setHiddenTasks(prev => new Set([...prev, taskId]))
  }

  const resetDay = async () => {
    if (!window.confirm('Сбросить все отметки за этот день?')) return
    await supabase.from('daily_checks').delete().eq('date', dateStr).eq('cat', cat)
    setChecks({})
  }

  // Восстановить все скрытые задачи
  const restoreAllTasks = async () => {
    await supabase.from('hidden_tasks').delete().eq('cat', cat)
    setHiddenTasks(new Set())
  }

  const changeDay = (delta) => {
    setCurrentDate(prev => {
      const d = new Date(prev.getTime() + delta * 86400000)
      d.setHours(0,0,0,0)
      return d
    })
  }
  const goToday = () => { const d = new Date(); d.setHours(0,0,0,0); setCurrentDate(d) }

  const today = new Date(); today.setHours(0,0,0,0)
  const isToday = currentDate.getTime() === today.getTime()

  const sections = {}
  allTasks.forEach(t => {
    if (!sections[t.section]) sections[t.section] = []
    sections[t.section].push(t)
  })

  const meta = CAT_META[cat]

  return (
    <div>
      {/* Cat tabs */}
      <div className="cat-tabs">
        {Object.entries(CAT_META).map(([key, m]) => (
          <button
            key={key}
            className={`cat-tab ${cat === key ? `active-${key}` : ''}`}
            onClick={() => setCat(key)}
          >
            {m.emoji} {m.name}
          </button>
        ))}
      </div>

      {/* Date nav */}
      <div className="date-nav">
        <button className="date-btn" onClick={() => changeDay(-1)}>◀</button>
        <div className="date-display" onClick={goToday}>
          {currentDate.toLocaleDateString('ru-RU', { weekday:'long', day:'numeric', month:'long' })}
          {isToday && <span className="today-badge">сегодня</span>}
        </div>
        <button className="date-btn" onClick={() => changeDay(1)}>▶</button>
      </div>

      {/* Progress */}
      <div className="progress-wrap">
        <div className="progress-bar-bg">
          <div
            className={`progress-bar-fill ${cat}`}
            style={{ width: total ? `${done/total*100}%` : '0%' }}
          />
        </div>
        <div className="progress-label">{done} / {total} выполнено</div>
      </div>

      {loading ? <div className="loading">загружаем...</div> : (
        <>
          {/* Task sections */}
          {Object.entries(sections).map(([section, tasks]) => (
            <div className="section" key={section}>
              <div className="section-title">{section}</div>
              {tasks.map(task => {
                const isDone = !!checks[task.id]
                const isCustom = !!task.cat // custom tasks have a cat field from DB
                return (
                  <div
                    key={task.id}
                    className={`task-card ${isDone ? 'done' : ''}`}
                    onClick={() => toggleTask(task.id)}
                  >
                    <div className="task-icon">{task.icon || '📌'}</div>
                    <div className="task-label">{task.label}</div>
                    {task.time && <div className="task-time-badge">{task.time}</div>}
                    <button
                      className="delete-task-btn"
                      onClick={e => isCustom ? (e.stopPropagation(), deleteCustomTask(task.id)) : hideBaseTask(e, task.id)}
                      title="Удалить задачу"
                    >✕</button>
                    <div className="check-circle">{isDone ? '✓' : ''}</div>
                  </div>
                )
              })}
            </div>
          ))}

          {/* Add custom task */}
          <div className="section">
            <div className="section-title">+ Добавить задачу</div>
            <div className="custom-task-form">
              <input
                className="custom-task-input"
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomTask()}
                placeholder={`Новая задача для ${meta.name}...`}
              />
              <button className="add-btn" onClick={addCustomTask}>Добавить</button>
            </div>
          </div>

          {/* Restore hidden tasks */}
          {hiddenTasks.size > 0 && (
            <div style={{ textAlign:'center', marginBottom:10 }}>
              <button className="reset-btn" onClick={restoreAllTasks}>
                ↩ Восстановить скрытые задачи ({hiddenTasks.size})
              </button>
            </div>
          )}

          {/* Notes */}
          <div className="section">
            <div className="section-title">Заметки на день</div>
            <div className="notes-card">
              <textarea
                value={notes}
                onChange={e => saveNotes(e.target.value)}
                placeholder={`Наблюдения за ${meta.name}...`}
                rows={3}
              />
            </div>
          </div>

          <button className="reset-btn" onClick={resetDay}>↺ Сбросить день</button>
        </>
      )}
    </div>
  )
}

