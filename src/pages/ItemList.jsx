import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES, TYPE_LABEL, getItems } from '../api'

const EMPTY_SEARCH = { type: '', category: '', location: '', from: '', to: '', keyword: '' }

export default function ItemList() {
  const [form, setForm] = useState(EMPTY_SEARCH) // 입력 중인 검색 조건
  const [search, setSearch] = useState(EMPTY_SEARCH) // 검색 버튼을 눌러 적용된 조건
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState('newest')
  const [result, setResult] = useState({ content: [], totalPages: 1, totalElements: 0 })

  useEffect(() => {
    getItems({ ...search, page, sort }).then(setResult)
  }, [search, page, sort])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSearch(e) {
    e.preventDefault()
    setSearch(form)
    setPage(0)
  }

  function handleReset() {
    setForm(EMPTY_SEARCH)
    setSearch(EMPTY_SEARCH)
    setPage(0)
  }

  return (
    <>
      <section className="page-head">
        <h1>분실물·습득물 찾기</h1>
        <p className="sub">잃어버린 물건과 주운 물건을 한곳에서 찾아보세요.</p>
      </section>

      <form className="panel search" onSubmit={handleSearch}>
        <label className="field">
          <span>유형</span>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="">전체</option>
            <option value="LOST">분실</option>
            <option value="FOUND">습득</option>
          </select>
        </label>
        <label className="field">
          <span>카테고리</span>
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="">전체</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>장소</span>
          <input name="location" value={form.location} onChange={handleChange} placeholder="예: 뉴턴홀" />
        </label>
        <label className="field">
          <span>키워드</span>
          <input name="keyword" value={form.keyword} onChange={handleChange} placeholder="제목·내용" />
        </label>
        <fieldset className="field wide">
          <legend>날짜</legend>
          <div className="range">
            <input type="date" name="from" value={form.from} onChange={handleChange} aria-label="시작 날짜" />
            <span>~</span>
            <input type="date" name="to" value={form.to} onChange={handleChange} aria-label="끝 날짜" />
          </div>
        </fieldset>
        <div className="search-actions">
          <button type="button" className="secondary" onClick={handleReset}>초기화</button>
          <button type="submit">검색</button>
        </div>
      </form>

      <div className="list-bar">
        <span>총 <strong>{result.totalElements}</strong>건</span>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0) }} aria-label="정렬">
          <option value="newest">최신순</option>
          <option value="oldest">오래된순</option>
        </select>
      </div>

      {result.content.length === 0 ? (
        <div className="panel empty">
          <p>조건에 맞는 신고가 없습니다.</p>
          <Link to="/items/new" className="button">신고 등록하기</Link>
        </div>
      ) : (
        <ul className="cards">
          {result.content.map((item) => (
            <li key={item.id}>
              <Link to={`/items/${item.id}`} className="card">
                <div className="thumb">
                  {item.image ? <img src={item.image.url} alt="" /> : <span>사진 없음</span>}
                  <span className={`badge ${item.type.toLowerCase()}`}>{TYPE_LABEL[item.type]}</span>
                </div>
                <div className="card-body">
                  <span className="category">{item.category}</span>
                  <h3>{item.title}</h3>
                  <p className="meta">{item.location}</p>
                  <p className="meta">{item.date}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {result.totalPages > 1 && (
        <nav className="pagination" aria-label="페이지">
          <button className="secondary" disabled={page === 0} onClick={() => setPage(page - 1)}>이전</button>
          {Array.from({ length: result.totalPages }, (_, i) => (
            <button
              key={i}
              className={i === page ? '' : 'secondary'}
              aria-current={i === page ? 'page' : undefined}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </button>
          ))}
          <button className="secondary" disabled={page >= result.totalPages - 1} onClick={() => setPage(page + 1)}>다음</button>
        </nav>
      )}
    </>
  )
}
