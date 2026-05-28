import { auth, signOut } from "@/lib/auth";

export async function POST() {
  const session = await auth();

  if (!session) {
    return new Response(null, { status: 204 });
  }

  await signOut({ redirect: false });
  return new Response(null, { status: 204 });
}
