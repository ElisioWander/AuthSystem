import axios, { AxiosError } from "axios";
import Router from "next/router";
import { destroyCookie, parseCookies, setCookie } from "nookies";

type FaildRequestsQueue = {
  onSuccess: (token: string) => void;
  onFailure: (err: AxiosError) => void;
};

//iniciar a verificação de refreshToken
let isRefreshing = false;
//aqui vai ficar armazenado todas as requsições que falharem por causa do token expirado
let failedRequestsQueue = Array<FaildRequestsQueue>();
const { "auth-jwt.token": token } = parseCookies();

export const api = axios.create({
  baseURL: "http://localhost:3333/",
});

//enviar o token no cabeçalho da requisição
api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//trabalhar com refreshToken
//interceptar a resposta do servidor e verificar se tudo ocorreu bem,
//caso tenha dado error, vamos trata-lo
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (error.response.data.code === "token.expired") {
        //se o erro for por conta do token expirado, então vamos aplicar a lógica
        //de refreshToken

        //pegar o refresh token de dentro dos cookies para começar o processo de renovação do token
        const { "auth-jwt.refreshToken": refreshToken } = parseCookies();

        //error.config possue todas as informações sobre as requisições para o backend que falharam
        //em posse dessas informações, nós podemos repetir a requisição novamente
        const originalConfig = error.config;

        //se não estiver acontecendo um refreshToken, então o bloco está
        //livre para iniciar e gerar um token novo
        if (!isRefreshing) {
          //enquanto o refresh estiver acontecendo, não vai iniciar outro processo
          //de refreshToken
          //Isso vai impedir que mais de uma requisição seja feita ao mesmo tempo para a rota "refresh",
          //criando assim, uma fila de requisições que irá aguardar o resultado do processo de refreshToken
          isRefreshing = true;

          //enviar o refreshToken para a rota refresh e pegar o token novo
          //vai vai ser retornado
          api
            .post("/refresh", {
              refreshToken,
            })
            .then((response) => {
              const { token } = response.data;

              //salvar o novo token dentro dos cookies novamente
              setCookie(undefined, "auth-jwt.token", token, {
                maxAge: 60 * 60 * 24 * 30, //32 days
                path: "/",
              });

              //salvar o novo refreshToken dentro dos cookies novamente
              setCookie(
                undefined,
                "auth-jwt.refreshToken",
                response.data.refreshToken,
                {
                  maxAge: 60 * 60 * 24 * 30,
                  path: "/",
                }
              );

              //atualizar o token que vai ser enviado no cabeçalho da requisição
              api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

              //caso tudo tenha corrido de acordo com seu fluxo e dado sucesso
              //então a promise "onSuccess" vai ser chamada passando para as requisições que falharam
              //toda a lógica pra renovalas
              failedRequestsQueue.forEach((request) =>
                request.onSuccess(token)
              );
              failedRequestsQueue = [];
            })
            .catch((err) => {
              failedRequestsQueue.forEach((request) => request.onFailure(err));
              failedRequestsQueue = [];
            })
            .finally(() => {
              isRefreshing = false;
            });
        }

        //o axios não aceita async await, então temos que utilizar as promises para criar a fila de requisições
        return new Promise((resolve, reject) => {
          //enviar as requsições que falharam por causa do token expirado para a variável "faildRequestsQueue"
          failedRequestsQueue.push({
            //caso o processo de refreshToken executado no bloco acima tenha dado certo
            //enviar o novo token retornado do backend para a variável "failedRequestsQueue"
            //e tentar novamente a requisição que tinha falhado por causa do token expirado
            onSuccess: (token: string) => {
              //enviar o token novo para o cabeçalho da requisição que falou
              originalConfig.headers["Authorization"] = `Bearer ${token}`;

              //após enviar o token novo para as configs, agora devemos fazer uma nova chamada a api
              //passando as "originalConfig" para a requisição
              resolve(api(originalConfig));
            },
            //caso o processo de rereshToken executado no bloco acima tenha falhado
            onFailure: (err: AxiosError) => {
              reject(err);
            },
          });
        });
      } else {
        //se houver um erro do tipo "401" e não for por causa de token exirado, então vamos desologar
        //o usuário
        destroyCookie(undefined, "auth-jwt.token");
        destroyCookie(undefined, "auth-jwt.refreshToken");

        Router.push("/");

        console.log(error.response.status);
      }
    }

    return Promise.reject(error);
  }
);
