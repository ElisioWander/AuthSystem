import { FaCircleNotch } from "react-icons/fa"

export function Loading() {
  return (
    <div className="w-full flex items-center justify-center animate-spin" >
      <FaCircleNotch fontSize={15} />
    </div>
  )
}