import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";

type RefreshResponse = {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
};

function getOidcDiscoveryUrl(issuer: string) {
  return issuer.endsWith("/")
    ? `${issuer}.well-known/openid-configuration`
    : `${issuer}/.well-known/openid-configuration`;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  const issuer = process.env.AUTH_TCSS460_ISSUER;
  const clientId = process.env.AUTH_TCSS460_CLIENT_ID;
  const clientSecret = process.env.AUTH_TCSS460_CLIENT_SECRET;

  if (!issuer || !clientId || !clientSecret || !token.refreshToken) {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }

  try {
    const discoveryResponse = await fetch(getOidcDiscoveryUrl(issuer), {
      cache: "no-store",
    });

    if (!discoveryResponse.ok) {
      throw new Error(
        `Failed to fetch OIDC discovery document: ${discoveryResponse.status}`,
      );
    }

    const discovery = (await discoveryResponse.json()) as {
      token_endpoint?: string;
    };

    if (!discovery.token_endpoint) {
      throw new Error("OIDC discovery document did not include token_endpoint");
    }

    const refreshResponse = await fetch(discovery.token_endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
      cache: "no-store",
    });

    if (!refreshResponse.ok) {
      throw new Error(
        `Failed to refresh access token: ${refreshResponse.status}`,
      );
    }

    const refreshedTokens = (await refreshResponse.json()) as RefreshResponse;

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      idToken: refreshedTokens.id_token ?? token.idToken,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (error) {
    console.error("Failed to refresh access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

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
          scope: "openid profile email offline_access",
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
    async jwt({ token, account, trigger }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : undefined;
        token.error = undefined;
        return token;
      }

      if (trigger === "update" && token.refreshToken) {
        return refreshAccessToken(token);
      }

      if (
        token.accessTokenExpires &&
        Date.now() >= token.accessTokenExpires &&
        token.refreshToken
      ) {
        return refreshAccessToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.idToken = token.idToken;
      session.accessTokenExpires = token.accessTokenExpires;
      session.error = token.error;
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
