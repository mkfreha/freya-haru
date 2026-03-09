import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Scratch() {
  const [items, setItems] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('scratch_items').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setItems(data); setLoading(false) })
  }, [])

  const add = async () => {
    const t = text.trim()
    if (!t) return
    const { data } = await supabase.from('scratch_items').insert({ text: t, done: false }).select().single()
    if (data) setItems(prev => [data, ...prev])
    setText('')
  }

  const toggle = async (id) => {
    const item = items.find(i => i.id === id)
    const newDone = !item.done
    setItems(prev => prev.map(i => i.id === id ? {...i, done: newDone} : i))
    await supabase.from('scratch_items').update({ done: newDone }).eq('id', id)
  }

  const del = async (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('scratch_items').delete().eq('id', id)
  }

  return (
    <div>
      <div className="scratch-header">
        <div className="section-title">Идеи и заметки без даты</div>
        <p className="scratch-desc">Срочные мысли, непонятно когда — но важно не забыть.</p>
      </div>
      <div className="scratchpad-wrap">
        <div className="scratch-toolbar">
          <input
            className="scratch-input"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="Написать идею или заметку..."
          />
          <button className="add-btn" onClick={add}>+ Добавить</button>
        </div>
        <div className="scratch-list">
          {loading && <div className="scratch-empty">загружаем...</div>}
          {!loading && items.length === 0 && <div className="scratch-empty">Пока пусто — добавь первую идею ✨</div>}
          {items.map(item => (
            <div key={item.id} className={`scratch-item ${item.done ? 'done' : ''}`}>
              <div className="scratch-dot" />
              <div className="scratch-text" onClick={() => toggle(item.id)}>{item.text}</div>
              <button className="scratch-del" onClick={() => del(item.id)}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
