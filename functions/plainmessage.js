export async function onRequestPost({ request, env }) {
    const authHeader = request.headers.get("Authorization");
    const expectedPassword = env.TGMSGTOKEN;

    if (expectedPassword && (!authHeader || authHeader !== `Bearer ${expectedPassword}`)) {
        return new Response("Unauthorized", { status: 401 });
    }
    
    const message = await request.text();
    if (!message.trim()) {
        return new Response("Error: Message cannot be empty", { status: 400 });
    }

    const r = await sendPlainText(env, message.trim())

    return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2))
}


async function sendPlainText (env, text) {
    const ret1 = (await fetch(apiUrl(env, 'sendMessage', {
      chat_id: env.TGSENDERTARGET,
      text
    }))).json()

    if (env.TGSENDERTARGET2) {
        (await fetch(apiUrl(env, 'sendMessage', {
            chat_id: env.TGSENDERTARGET2,
            text
          }))).json()
    }

    return ret1;
  }

  function apiUrl (env, methodName, params = null) {
    let query = ''
    if (params) {
      query = '?' + new URLSearchParams(params).toString()
    }
    return `https://api.telegram.org/bot${env.TGBOTTOKEN}/${methodName}${query}`
  }