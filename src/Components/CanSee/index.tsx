import { ReactNode } from "react";
import { useCan } from "../../hooks/useCan";

interface CanSeeProps {
  permissions?: string[];
  roles?: string[];
  children: ReactNode;
}

//verificar se o usuário tem permissão de acessar este component
export function CanSee({ children, permissions, roles }: CanSeeProps) {
  const userCanSeeComponent = useCan({
    permissions,
    roles
  })

  //se não tiver permissões então não será mostrado
  if(!userCanSeeComponent) return null

  return (
    <>
      { children }
    </>
  )
}