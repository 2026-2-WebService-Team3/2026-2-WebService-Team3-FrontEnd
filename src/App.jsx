import { Link, NavLink, Route, Routes } from 'react-router-dom'
import ItemList from './pages/ItemList'
import ItemDetail from './pages/ItemDetail'
import ItemForm from './pages/ItemForm'

export default function App() {
  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">
            <span className="logo-mark">CL</span>
            Campus Lost
          </Link>
          <nav>
            <NavLink to="/" end className="nav-link">목록</NavLink>
            <Link to="/items/new" className="button">+ 신고 등록</Link>
          </nav>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<ItemList />} />
          <Route path="/items/:id" element={<ItemDetail />} />
          <Route path="/items/new" element={<ItemForm />} />
          <Route path="/items/:id/edit" element={<ItemForm />} />
        </Routes>
      </main>
    </>
  )
}
