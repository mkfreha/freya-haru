// Задачи которые делаются 2 раза в день (утро + вечер) — для каждого кота отдельный ID
export const TWICE_DAILY = ['eyes_wash', 'eyes_drops', 'teeth']

export const TASKS_FREYA = [
  { id: 'eyes_wash_am',    section: 'Гигиена глаз',  icon: '👁️', label: 'Промыть глаза', time: 'утро' },
  { id: 'eyes_wash_pm',    section: 'Гигиена глаз',  icon: '👁️', label: 'Промыть глаза', time: 'вечер' },
  { id: 'eyes_drops_am',   section: 'Гигиена глаз',  icon: '💧', label: 'Закапать глаза', time: 'утро' },
  { id: 'eyes_drops_pm',   section: 'Гигиена глаз',  icon: '💧', label: 'Закапать глаза', time: 'вечер' },
  { id: 'teeth_am',        section: 'Уход за зубами', icon: '🦷', label: 'Помазать зубы гелем', time: 'утро' },
  { id: 'teeth_pm',        section: 'Уход за зубами', icon: '🦷', label: 'Помазать зубы гелем', time: 'вечер' },
  { id: 'brush',           section: 'Шерсть',         icon: '🪮', label: 'Вычёсывание', time: null },
  { id: 'feed_morning',    section: 'Кормёжка',       icon: '🍖', label: 'Утреннее кормление', time: null },
  { id: 'feed_evening',    section: 'Кормёжка',       icon: '🌙', label: 'Вечернее кормление', time: null },
  { id: 'fish_oil',        section: 'Кормёжка',       icon: '🐟', label: 'Рыбий жир', time: null },
  { id: 'immunomod',       section: 'Кормёжка',       icon: '💊', label: 'Иммуномодуляторы', time: null },
  { id: 'probiotics',      section: 'Кормёжка',       icon: '🦠', label: 'Пробиотики для ЖКТ', time: null },
  { id: 'plates',          section: 'Кормёжка',       icon: '🫧', label: 'Помыть тарелки', time: null },
  { id: 'litter',          section: 'Туалет',         icon: '🧹', label: 'Уборка туалета', time: null },
  { id: 'play',            section: 'Активность',     icon: '🎾', label: 'Поиграть', time: null },
  { id: 'harness',         section: 'Активность',     icon: '🦺', label: 'Приучивание к шлейке', time: null },
]

export const TASKS_HARU = [
  { id: 'eyes_wash_am',    section: 'Гигиена глаз',  icon: '👁️', label: 'Промыть глаза', time: 'утро' },
  { id: 'eyes_wash_pm',    section: 'Гигиена глаз',  icon: '👁️', label: 'Промыть глаза', time: 'вечер' },
  { id: 'eyes_drops_am',   section: 'Гигиена глаз',  icon: '💧', label: 'Закапать глаза', time: 'утро' },
  { id: 'eyes_drops_pm',   section: 'Гигиена глаз',  icon: '💧', label: 'Закапать глаза', time: 'вечер' },
  { id: 'teeth_am',        section: 'Уход за зубами', icon: '🦷', label: 'Помазать зубы гелем', time: 'утро' },
  { id: 'teeth_pm',        section: 'Уход за зубами', icon: '🦷', label: 'Помазать зубы гелем', time: 'вечер' },
  { id: 'brush',           section: 'Шерсть',         icon: '🪮', label: 'Вычёсывание', time: null },
  { id: 'feed_morning',    section: 'Кормёжка',       icon: '🍖', label: 'Утреннее кормление', time: null },
  { id: 'feed_evening',    section: 'Кормёжка',       icon: '🌙', label: 'Вечернее кормление', time: null },
  { id: 'fish_oil',        section: 'Кормёжка',       icon: '🐟', label: 'Рыбий жир', time: null },
  { id: 'immunomod',       section: 'Кормёжка',       icon: '💊', label: 'Иммуномодуляторы', time: null },
  { id: 'probiotics',      section: 'Кормёжка',       icon: '🦠', label: 'Пробиотики для ЖКТ', time: null },
  { id: 'plates',          section: 'Кормёжка',       icon: '🫧', label: 'Помыть тарелки', time: null },
  { id: 'litter',          section: 'Туалет',         icon: '🧹', label: 'Уборка туалета', time: null },
  { id: 'play',            section: 'Активность',     icon: '🎾', label: 'Поиграть', time: null },
  { id: 'harness',         section: 'Активность',     icon: '🦺', label: 'Приучивание к шлейке', time: null },
]

export const TASKS_BY_CAT = { freya: TASKS_FREYA, haru: TASKS_HARU }

export const CAT_META = {
  freya: { name: 'Freya', emoji: '🌸', color: '#c97b5a' },
  haru:  { name: 'Haru',  emoji: '🌿', color: '#4a6741' },
}
