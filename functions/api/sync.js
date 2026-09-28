const BACKEND = "https://genuine-manatee-f233e5.netlify.app/.netlify/functions/sync";

export async function onRequestPost(context) {
  try {
    const body = await context.request.text();
    const response = await fetch(BACKEND, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body
    });
    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") || "application/json" }
    });
  } catch (error) {
    return Response.json({ ok: false, error: String(error) }, { status: 502 });
  }
}
