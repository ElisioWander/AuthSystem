import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";

//lógica para evitar que o usuário que não esteja autenticado acesse determinadas páginas
//nesse caso o usuário não autenticado não pode acessar a página "dashboard"
export function withSSRAuth<P>(fn: GetServerSideProps<P>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    //pegar todos os cookies
    const cookies = parseCookies(ctx)

    //retirar o token de dentro dos cookies
    const { 'auth-jwt.token': token } = cookies

    //VALIDAÇÃO DE AUTORIZAÇÃO PARA ACESSAR DETERMINADA PÁGINA
    //verificar se exite o token para que o usuário tenha acesso a determinada pagina,
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