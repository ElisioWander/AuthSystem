import { setupAPIClient } from "../services/axios"
import { withSSRAuth } from "../utils/withSSRAuth"

//vamos verificar se o usuário possue permissão para acessar essa página
export default function Metrics() {
  return (
    <>
      <h1>Metrics</h1>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const api = setupAPIClient(ctx)
  const response = await api.get('/me')

  return {
    props: {}
  }
}, {
  permissions: ['metrics.list'],
  roles: ['administrator']
})