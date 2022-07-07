import { useAuth } from "../context/AuthContext";
import { ValidateUserPermissions } from "../utils/validateUserPermissions";

interface useCanProps {
  permissions?: string[];
  roles?: string[];
}

//hook para definir o que o usuário pode acessar
export function useCan({ permissions, roles }: useCanProps) {
  //pegar os dados do usuário e o estado de autenticação
  const { isAuthenticated, user } = useAuth();

  //se o usuário nem estiver autenticado, o processo de permissões não vai ocorrer
  if (!isAuthenticated) return false;

  //passando os dados para dentro do método de validação
  const userHasValidPermissions = ValidateUserPermissions({
    user,
    permissions,
    roles
  })


  //se tudo der certo
  return userHasValidPermissions;
}
