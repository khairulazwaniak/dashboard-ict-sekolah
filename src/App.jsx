import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardUtama from './pages/DashboardUtama'
import TempahanBilik from './pages/TempahanBilik'
import PeminjamanICT from './pages/PeminjamanICT'
import SistemIDDelima from './pages/SistemIDDelima'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardUtama />} />
        <Route path="/tempahan" element={<TempahanBilik />} />
        <Route path="/ict" element={<PeminjamanICT />} />
        <Route path="/delima" element={<SistemIDDelima />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
