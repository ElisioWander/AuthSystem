//motivo de criar uma class de error foi para identificar qual o tipo
//expecífico de erro que aconteceu
export class AuthTokenError extends Error {
  constructor() {
    super("Error with authentication token.")
  }
}