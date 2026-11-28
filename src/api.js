// 백엔드(Spring Boot) 연동 전까지 localStorage로 API를 흉내 내는 파일입니다.
// shortcut: localStorage mock, 14주차 React 연동 때 각 함수 안을 fetch('/api/...') 호출로 바꾸면 됩니다.
// 모든 함수가 Promise를 반환하므로 화면 코드는 바꿀 필요가 없습니다.

const ITEMS_KEY = 'campuslost.items'

export const CATEGORIES = ['전자기기', '지갑/카드', '가방', '의류', '도서/문구', '기타']
export const TYPE_LABEL = { LOST: '분실', FOUND: '습득' }

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// 로그인·회원가입은 아직 제외했습니다. Spring Security 연동 때 인증과 "본인 글만 수정·삭제"를 추가합니다.

// ---------- 신고 (GET/POST/PUT/DELETE /api/items) ----------

// GET /api/items?type=&category=&location=&from=&to=&keyword=&page=&size=&sort=
export async function getItems({ type, category, location, from, to, keyword, page = 0, size = 6, sort = 'newest' }) {
  let items = load(ITEMS_KEY, [])

  if (type) items = items.filter((i) => i.type === type)
  if (category) items = items.filter((i) => i.category === category)
  if (location) items = items.filter((i) => i.location.includes(location))
  if (from) items = items.filter((i) => i.date >= from)
  if (to) items = items.filter((i) => i.date <= to)
  if (keyword) items = items.filter((i) => i.title.includes(keyword) || i.description.includes(keyword))

  items.sort((a, b) => (sort === 'oldest' ? a.id - b.id : b.id - a.id))

  const totalPages = Math.max(1, Math.ceil(items.length / size))
  return {
    content: items.slice(page * size, page * size + size),
    page,
    totalPages,
    totalElements: items.length,
  }
}

export async function getItem(id) {
  const item = load(ITEMS_KEY, []).find((i) => i.id === Number(id))
  if (!item) throw new Error('신고를 찾을 수 없습니다.')
  return item
}

export async function createItem(data) {
  const items = load(ITEMS_KEY, [])
  const id = items.reduce((max, i) => Math.max(max, i.id), 0) + 1
  const item = { ...data, id, createdAt: new Date().toISOString() }
  items.push(item)
  save(ITEMS_KEY, items)
  return item
}

export async function updateItem(id, data) {
  const items = load(ITEMS_KEY, [])
  const index = items.findIndex((i) => i.id === Number(id))
  if (index < 0) throw new Error('신고를 찾을 수 없습니다.')
  items[index] = { ...items[index], ...data }
  save(ITEMS_KEY, items)
  return items[index]
}

export async function deleteItem(id) {
  save(ITEMS_KEY, load(ITEMS_KEY, []).filter((i) => i.id !== Number(id)))
}

// ---------- 사진 업로드 (POST /api/items/{id}/attachments) ----------

// mock 전용: 파일을 data URL로 바꿔 신고 안에 저장합니다. localStorage 용량 때문에 1MB로 제한합니다.
export const MAX_IMAGE_SIZE = 1024 * 1024

export function readImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('이미지 파일만 올릴 수 있습니다.'))
    if (file.size > MAX_IMAGE_SIZE) return reject(new Error('사진은 1MB 이하만 올릴 수 있습니다.'))
    const reader = new FileReader()
    reader.onload = () => resolve({ name: file.name, url: reader.result })
    reader.onerror = () => reject(new Error('사진을 읽지 못했습니다.'))
    reader.readAsDataURL(file)
  })
}
