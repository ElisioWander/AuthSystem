type User = {
  permissions: string[];
  roles: string[];
};

interface ValidateUserPermissionsProps {
  user: User;
  permissions?: string[];
  roles?: string[];
}

//validação foi desacoplada do hook "useCan" para conseguir ser utilizada dentro do SSR
export function ValidateUserPermissions({
  user,
  permissions,
  roles,
}: ValidateUserPermissionsProps) {
  //verificar se exite permissões array de permissões ou se ele está vazio,
  //caso tenha permissões, então o método every vai verificar se todas as permissões que vieram no array
  //de permissions bate com as permissões que o usuário autenticado possue. O método every exige que todas
  //as condições sejam verdadeiras para retornar "true"
  if (permissions?.length > 0) {
    const hasAllPermissions = permissions.every((permission) => {
      return user.permissions.includes(permission);
    });

    //se o método every falhar indicando que o usuário não tem permissão para acessar
    //determinado local da aplicação, a variável "hasAllPermissions" vai ficar vazia e, então,
    //vamos retornar "false"
    if (!hasAllPermissions) return false;
  }

  //a mesma lógica que as permissions, com a diferença que o usuário pode ter algumas das roles
  //listadas no backend para que o resultado seja true, diferente do método "every" que precisa que
  //todas as condições sejam verdadeiras para retornar "true", o método "some" indica que se alguma das
  //condições sejam verdadeira, então ele retorna "true"
  if (roles?.length > 0) {
    const hasAllRoles = roles.some((role) => {
      return user.roles.includes(role);
    });

    if (!hasAllRoles) return false;
  }

  return true;
}
