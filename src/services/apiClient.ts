import { setupAPIClient } from "./axios";

//utilizar a api no lado do servidor, sem precisar passar o "ctx"
export const api = setupAPIClient()