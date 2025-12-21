interface RegisterUserPayload {
  email: string;
  password: string;
  name?: string;
}

interface LoginUserPayload {
  username: string;
  password: string;
}
