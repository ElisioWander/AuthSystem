import { useEffect } from "react";
import { Header } from "../Components/Header";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/apiClient";
import { setupAPIClient } from "../services/axios";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
  const { user, signOut } = useAuth()

  useEffect(() => {
    api.get("/me").then(response => {
      console.log(response.data)
    }).catch(() => {
      signOut()
    })
  }, [])

  return (
    <div className="min-h-full">
      <Header />
      <main>
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </header>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-zinc-200 text-lg" >User email: {user?.email}</h1>
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
