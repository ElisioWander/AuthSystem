import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from "nookies"
import { api } from "../services/apiClient";
import Router from "next/router"

//dados do usuário após login
type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

//dados que vem pelo formulário
type SignInCredentials = {
  email: string;
  password: string;
}

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  user?: User;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function signOut() {
  destroyCookie(undefined, 'auth-jwt.token')
  destroyCookie(undefined, 'auth-jwt.refreshToken')
  
  //após destruir o token e refreshToken, redirecionar o usuário para a tela de login
  Router.push('/')
}

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>()
  //por padrão a variável "user" é false, se negar uma vez "!" ela vai para true, se negar outra vez "!!" false
  const isAuthenticated = !!user

  //recuperando estado da autenticação utilizando o token
  useEffect(() => {
    const { 'auth-jwt.token': token } = parseCookies() //mostra todos os cookies

    //se tiver um token, então vamos chamar a rota "/me" que tem a função de buscar os dados do usuário
    //e salvar eles no estado "user" para que os dados estejam sempre atualizados
    //OBS**verificar o axios para ver os headers configurados
    if(token) {
      api.get("/me").then(response => {
        
        const { email, permissions, roles } = response.data

        setUser({ email, permissions, roles })

      }).catch(() => {
        //no axios já está configurado uma tratativa de erro caso o erro for do tipo "401" e for
        //"token.expired"
        //essa tratativa de erro aqui, se refere a qualquer tipo de erro que possa acontecer com a requisição,
        //ou até mesmo algum problema diretamente no token
        
        //caso ocorra um erro nessa requisição o token e refreshToken irão ser destruidos
        signOut()
      })
    }
  }, [])

  async function signIn({ email, password }: SignInCredentials) {
    try {
      //enviando os dados para a validação do back-end
      const response = await api.post('sessions', {
        email, password
      })

      //pegando os dados do usuário retornado da sessão
      const { token, refreshToken, permissions, roles } = response.data

      //salvar o token nos cookies para utilizar mais tarde a fim de pegar os dados do usuário logado
      setCookie(undefined, 'auth-jwt.token', token, {
        maxAge: 60 * 60 * 24 * 30,  //30 days
        path: '/'
      })

      //salver refreshToken nos cookies para utilizar mais tarde a fim de pegar os dados do usuário logado
      setCookie(undefined, 'auth-jwt.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: '/'
      })

      //salvando os dados do usuário em um estado
      setUser({
        email,
        permissions,
        roles
      })
      
      //enviar o token no cabeçalho após o login
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      //redirecionar usuário para dashboard
      Router.push("/dashboard")
      
    } catch (error) {
      console.log(error)

      Router.push('/error')
    }
  }


  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }} >
      { children }
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 