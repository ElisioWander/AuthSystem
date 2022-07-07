import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";
import decode from 'jwt-decode'
import { ValidateUserPermissions } from "./validateUserPermissions";

type WithSSRAuthOptions = {
  permissions?: string[];
  roles?: string[];
}

// 1 - lógica para evitar que o usuário que não esteja autenticado acesse determinadas páginas
//nesse caso o usuário não autenticado não pode acessar a página "dashboard"

// 2 - lógica para evitar que o usuário que esteja autenticado, mas não possua autorização, acesse determinada página
export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    //pegar todos os cookies
    const cookies = parseCookies(ctx)

    //retirar o token de dentro dos cookies
    //decode vai decodificar o token e nos mostrar os dados dentro dele
    const token = cookies['auth-jwt.token']

    //VALIDAÇÃO DE AUTORIZAÇÃO PARA NÃO PERMITIR O ACESSO PARA USUÁRIOS NÃO AUTENTICADOS
    //verificar se exite o token para que o usuário tenha acesso a pagina de dashboard,
    //caso não exita, redirecionar o usuário para
    //a tela inicial
    if(!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }

    //caso exita alguma página que precise de alguns níveis de autorização especificos, 
    //as permissões serão enviadas para as options
    //nesse caso, a página de "metrics" está enviando as permissões que o usuário deve ter para
    //conseguir acessa-la
    if(options) {
      //pegar os dados do usuário atravez do token para serem verificados
      const user = decode<{ permissions: string[], roles: string[] }>(token)
      
      //pegar os dados enviados pela página "metrics"
      const { permissions, roles } = options;
      
      //fazer a validação das permissões do usuário
      const userHasValidPermissions = ValidateUserPermissions({
        user,
        permissions,
        roles
      })

      //caso o usuário não tenha permissão ele será redirecionado para a dashboard
      if(!userHasValidPermissions) {
        return {
          redirect: {
            destination: '/not-permitted',
            permanent: false
          }
        }
      }

      //se tudo ocorreu bem, então o usuário consegue acessar a página "metrics"
    }

    try {
      return await fn(ctx)
    } catch (error) {
      //TRATATIVA DE ERROR COM O TOKEN
      //se acontecer algum erro com o token que foi requisitado aqui, no lado do servidor,
      //então o usuário será deslogado e redirecionado para a página de login
      if(error instanceof AuthTokenError) {
        destroyCookie(ctx, 'auth-jwt.token')
        destroyCookie(ctx, 'auth-jwt.refreshToken')

        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        }
      } else {
        //caso aconteça algum error inesperado
        return {
          redirect: {
            destination: '/error',
            permanent: false
          }
        }
      }
    } 
  }
}