import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CATEGORIES, createItem, getItem, readImage, updateItem } from '../api'

const EMPTY_FORM = { type: 'LOST', title: '', category: CATEGORIES[0], location: '', date: '', description: '', image: null }

// 등록(/items/new)과 수정(/items/:id/edit)을 같은 화면으로 처리합니다.
export default function ItemForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) getItem(id).then(setForm).catch((e) => setError(e.message))
  }, [id])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      setForm({ ...form, image: await readImage(file) })
      setError('')
    } catch (err) {
      setError(err.message)
    }
    e.target.value = '' // 같은 파일을 다시 골라도 change가 일어나도록 비웁니다.
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.location.trim() || !form.date) {
      setError('제목, 장소, 날짜는 꼭 입력해야 합니다.')
      return
    }
    try {
      const saved = id ? await updateItem(id, form) : await createItem(form)
      navigate(`/items/${saved.id}`)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form className="panel item-form" onSubmit={handleSubmit}>
      <h1>{id ? '신고 수정' : '신고 등록'}</h1>

      <fieldset className="field">
        <legend>유형</legend>
        <div className="segmented">
          <label className={form.type === 'LOST' ? 'on' : ''}>
            <input type="radio" name="type" value="LOST" checked={form.type === 'LOST'} onChange={handleChange} />
            물건을 잃어버렸어요
          </label>
          <label className={form.type === 'FOUND' ? 'on' : ''}>
            <input type="radio" name="type" value="FOUND" checked={form.type === 'FOUND'} onChange={handleChange} />
            물건을 주웠어요
          </label>
        </div>
      </fieldset>

      <label className="field">
        <span>제목 <em>*</em></span>
        <input name="title" value={form.title} onChange={handleChange} placeholder="예: 검은색 가죽 지갑" required />
      </label>

      <div className="row">
        <label className="field">
          <span>카테고리</span>
          <select name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{form.type === 'LOST' ? '분실 날짜' : '습득 날짜'} <em>*</em></span>
          <input type="date" name="date" value={form.date} onChange={handleChange} required />
        </label>
      </div>

      <label className="field">
        <span>장소 <em>*</em></span>
        <input name="location" value={form.location} onChange={handleChange} placeholder="예: 뉴턴홀 313호" required />
      </label>

      <label className="field">
        <span>내용</span>
        <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="색상, 특징 등을 적어 주세요." />
      </label>

      <div className="field">
        <span>사진 <small>(1MB 이하)</small></span>
        {form.image ? (
          <div className="preview">
            <img src={form.image.url} alt="첨부한 사진 미리보기" />
            <button type="button" className="secondary" onClick={() => setForm({ ...form, image: null })}>사진 빼기</button>
          </div>
        ) : (
          <label className="upload">
            <input type="file" accept="image/*" onChange={handleImage} />
            클릭해서 사진 고르기
          </label>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      <div className="actions end">
        <button type="button" className="secondary" onClick={() => navigate(-1)}>취소</button>
        <button type="submit">{id ? '수정하기' : '등록하기'}</button>
      </div>
    </form>
  )
}
