import Link from "next/link";
import { Header } from "../Components/Header";
import { setupAPIClient } from "../services/axios";
import { withSSRAuth } from "../utils/withSSRAuth";

//vamos verificar se o usuário possue permissão para acessar essa página
export default function Metrics() {
  return (
    <>
      <Header />

      <div className="w-full h-screen flex flex-col gap-5 items-center justify-center">
        <h1 className="text-2xl text-zinc-200">Metrics</h1>

        <Link href="/dashboard">
          <a className="w-40 h-12 flex items-center justify-center rounded-full hover:brightness-75 transition-all bg-zinc-700 text-zinc-200">
            Voltar
          </a>
        </Link>
      </div>
    </>
  );
}

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const api = setupAPIClient(ctx);
    const response = await api.get("/me");

    return {
      props: {},
    };
  },
  {
    permissions: ["metrics.list"],
    roles: ["administrator"],
  }
);
