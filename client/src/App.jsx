import { Routes, Route } from 'react-router-dom'
import { Landing } from './pages/Landing'
import { Scan } from './pages/Scan'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/scan" element={<Scan />} />
    </Routes>
  )
}
