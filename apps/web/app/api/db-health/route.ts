import { Client } from "pg";

export async function GET() {
  const url = process.env.DATABASE_URL;
  if (!url) return new Response("Missing DATABASE_URL", { status: 500 });
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    const res = await client.query("select 1 as ok");
    return Response.json({ ok: res.rows?.[0]?.ok === 1 });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
    });
  } finally {
    await client.end().catch(() => {});
  }
}