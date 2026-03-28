import { Header } from '@/components/layout/Header'
import { SolvePage } from '@/pages/SolvePage'

function App() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <SolvePage />
      </main>
    </div>
  )
}

export default App
