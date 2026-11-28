import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TYPE_LABEL, deleteItem, getItem } from '../api'

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getItem(id).then(setItem).catch((e) => setError(e.message))
  }, [id])

  async function handleDelete() {
    if (!confirm('이 신고를 삭제할까요? 되돌릴 수 없습니다.')) return
    try {
      await deleteItem(id)
      navigate('/')
    } catch (e) {
      alert(e.message)
    }
  }

  if (error) return <p className="error">{error}</p>
  if (!item) return <p>불러오는 중...</p>

  return (
    <>
      <Link to="/" className="back">← 목록으로</Link>

      <article className="panel detail">
        <div className="detail-photo">
          {item.image ? <img src={item.image.url} alt={item.title} /> : <span>사진 없음</span>}
        </div>

        <div className="detail-info">
          <div>
            <span className={`badge ${item.type.toLowerCase()}`}>{TYPE_LABEL[item.type]}</span>
            <span className="category">{item.category}</span>
          </div>
          <h1>{item.title}</h1>

          <dl>
            <dt>장소</dt><dd>{item.location}</dd>
            <dt>{item.type === 'LOST' ? '분실 날짜' : '습득 날짜'}</dt><dd>{item.date}</dd>
          </dl>

          <p className={item.description ? 'description' : 'description muted'}>
            {item.description || '내용이 없습니다.'}
          </p>

          <div className="actions">
            {item.image && (
              <a href={item.image.url} download={item.image.name} className="button secondary">사진 다운로드</a>
            )}
            <Link to={`/items/${item.id}/edit`} className="button secondary">수정</Link>
            <button className="danger" onClick={handleDelete}>삭제</button>
          </div>
        </div>
      </article>
    </>
  )
}
