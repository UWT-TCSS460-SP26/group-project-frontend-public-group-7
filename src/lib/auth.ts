import NextAuth from "next-auth";

/**
 * Auth.js v5 configuration for the auth-squared OIDC provider.
 *
 * The `audience` parameter on the authorize call is non-negotiable: auth-squared
 * issues audience-scoped access tokens, and without it the token endpoint
 * returns a token whose `aud` claim does not match what `backend-3` validates.
 *
 * Both the OIDC `id_token` (identity) and the OAuth `access_token` (authorization
 * to call `backend-3`) are stashed on the JWT session cookie via the `jwt`
 * callback and surfaced to client code via the `session` callback.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    {
      id: "tcss460",
      name: "TCSS 460 Auth",
      type: "oidc",
      issuer: process.env.AUTH_TCSS460_ISSUER,
      clientId: process.env.AUTH_TCSS460_CLIENT_ID,
      clientSecret: process.env.AUTH_TCSS460_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid profile email",
          audience: process.env.AUTH_TCSS460_AUDIENCE,
        },
      },
      checks: ["pkce", "state"],
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : undefined;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      session.accessTokenExpires = token.accessTokenExpires;
      // `token.sub` is set by Auth.js from the OIDC id_token's `sub` claim.
      // ⚠ FOOTGUN: this is NOT necessarily the same as the access_token's `sub`,
      // and `backend-3` keys local user rows off the access_token sub (via
      // `resolveLocalUser`). For "is this resource mine?" checks against the
      // backend, decode `session.accessToken` directly — see `useMyLocalUserId`.
      // `session.user.id` here is convenient for greetings / display only.
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
});
