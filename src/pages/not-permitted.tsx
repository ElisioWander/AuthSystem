import Link from "next/link"
import { GoAlert } from "react-icons/go"
export default function() {
  return (
    <div className="w-full h-screen flex flex-col gap-5 items-center justify-center text-zinc-200 text-lg" >
      <GoAlert fontSize={45} className="text-yellow-400" />
      <span className="p-5 block bg-red-500" >You do not have permission to access this page!</span>
      
      <Link 
        href="/dashboard">
        <a className="w-40 h-12 flex items-center justify-center rounded-full hover:brightness-75 transition-all bg-zinc-700 text-zinc-200" >Voltar</a>
      </Link>
    </div>
  )
}