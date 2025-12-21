type AuthContextType = {
  authData: UserContextType;
  updateAuthData: (response: any) => void;
};

type UserContextType = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  expiresIn: number;
  tokenType: "bearer";
  aud: string;
  email: string;
  id: string;
  role: string;
  provider: string;
  emailVerified: boolean;
};

type ApiError = {
  data: {
    detail: string;
  };
  status: number;
};
