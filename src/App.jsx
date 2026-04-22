import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import DashboardUtama from './pages/DashboardUtama'
import TempahanBilik from './pages/TempahanBilik'
import PeminjamanICT from './pages/PeminjamanICT'
import SistemIDDelima from './pages/SistemIDDelima'
import PinjamPublik from './pages/PinjamPublik'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/mula" element={<Landing />} />
        <Route path="/" element={<DashboardUtama />} />
        <Route path="/tempahan" element={<TempahanBilik />} />
        <Route path="/ict" element={<PeminjamanICT />} />
        <Route path="/delima" element={<SistemIDDelima />} />
        <Route path="/pinjam/:barangId" element={<PinjamPublik />} />
        <Route path="*" element={<Navigate to="/mula" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
