import { CanSee } from "../Components/CanSee";
import { Header } from "../Components/Header";
import { useAuth } from "../context/AuthContext";
import { setupAPIClient } from "../services/axios";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-full">
      <Header />
      <main>
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </header>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 text-zinc-200 ">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-lg" >User email: {user?.email}</h1>

            <CanSee permissions={['metrics.list']} >
              <span>Metrics</span>
            </CanSee>
          </div>
        </div>
      </main>
    </div>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const api = setupAPIClient(ctx)
  const response = await api.get('/me')

  return {
    props: {}
  }
})
