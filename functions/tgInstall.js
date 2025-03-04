
async function onRequest (context) {
    if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== context.env.INSTALLTOKEN) {
        return new Response('Unauthorized', { status: 403 })
    }

    const webhookUrl = `${requestUrl.protocol}//${requestUrl.hostname}tgmsg`;
    const r = await (await fetch(apiUrl('setWebhook', { url: webhookUrl, secret_token: context.env.TGSECRET }))).json()
    return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2))
}