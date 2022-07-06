import { useEffect } from "react";
import { Header } from "../Components/Header";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/axios";

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
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
              <h1>User {user?.email}</h1>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
