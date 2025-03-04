
async function onRequest (context) {
    // if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== context.env.INSTALLTOKEN) {
    //     return new Response('Unauthorized', { status: 403 })
    // }
    const req = await context.request.json();
    const password = req.password;
    if (!password) {
        return new Response(JSON.stringify({ message: "Password is required" }), { status: 400 });
    }
    if (password !== context.env.INSTALLTOKEN) {
        return new Response(JSON.stringify({ message: "Password is wrong" }), { status: 400 });
    }


    const webhookUrl = `${requestUrl.protocol}//${requestUrl.hostname}tgmsg`;
    const r = await (await fetch(apiUrl('setWebhook', { url: webhookUrl, secret_token: context.env.TGSECRET }))).json()
    return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2))
}

function apiUrl (methodName, params = null) {
    let query = ''
    if (params) {
      query = '?' + new URLSearchParams(params).toString()
    }
    return `https://api.telegram.org/bot${c_botTOKEN}/${methodName}${query}`
  }