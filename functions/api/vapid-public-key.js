const BACKEND = "https://genuine-manatee-f233e5.netlify.app/.netlify/functions/vapid-public-key";

export async function onRequestGet() {
  try {
    const response = await fetch(BACKEND);
    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: { "content-type": response.headers.get("content-type") || "application/json" }
    });
  } catch (error) {
    return Response.json({ publicKey: "", error: String(error) }, { status: 502 });
  }
}
