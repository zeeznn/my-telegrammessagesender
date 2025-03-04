
async function onRequest (context) {
    const req = await context.request.json();
    const password = req.password;
    if (!password) {
        return new Response(JSON.stringify({ message: "Password is required" }), { status: 400 });
    }
    if (password !== context.env.INSTALLTOKEN) {
        return new Response(JSON.stringify({ message: "Password is wrong" }), { status: 400 });
    }

    const r = await (await fetch(apiUrl('setWebhook', { url: '' }))).json()
    return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2))
}