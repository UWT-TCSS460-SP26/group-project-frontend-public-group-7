import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    idToken?: string;
    accessTokenExpires?: number;
    error?: "RefreshAccessTokenError";
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    idToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    error?: "RefreshAccessTokenError";
  }
}
