import { cookies } from "next/headers";

export async function GET() {
  const store = await cookies();
  let id = store.get("qid")?.value;
  if (!id) {
    id = crypto.randomUUID();
    store.set({
      name: "qid",
      value: id,
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 180, // ~6 months
    });
  }
  return Response.json({ id });
}
