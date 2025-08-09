import { Client } from "pg";

export async function GET() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return new Response(JSON.stringify({ ok: false, error: "Missing DATABASE_URL" }), { status: 500 });
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query<{ ok: number }>("select 1 as ok");
    return Response.json({ ok: res.rows?.[0]?.ok === 1 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ ok: false, error: message }), { status: 500 });
  } finally {
    await client.end().catch(() => {});
  }
}
