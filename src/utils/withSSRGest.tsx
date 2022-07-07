import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

//lógica para evitar que o usuário que esteja autenticado acesse determinadas páginas
//nesse caso expecífico, um usuário que esteja logado não pode acessar a página de login
export function withSSRGest<P>(fn: GetServerSideProps<P>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {

    //pegar todos os kookies
    const cookies = parseCookies(ctx)

    //pegar o token de dentro dos cookies
    const { 'auth-jwt.token':token } = cookies
    
    //redirecionar o usuário para a página de dashboard caso 
    //tenha o token
    if(token) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false
        }
      }
    }

    return await fn(ctx)
  }
}