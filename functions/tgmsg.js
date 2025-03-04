

async function onRequest (context) {
    // Check secret 
    if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== context.env.TGSECRET) {
      return new Response('Unauthorized', { status: 403 })
    }
  
    // Read request body synchronously
    const update = await request.json()
    // Deal with response asynchronously
    //event.waitUntil(onUpdate(update))
    await onUpdate(context.env, update)
  
    return new Response('Ok')
  }

  async function onUpdate (env, update) {
    const msg1 = 'update1' + update.channel_post.chat.id + '  ' + update.channel_post.text;
    await sendPlainText(env.TGSENDERTARGET,  msg1)
    if (env.TGSENDERTARGET2) {
        await sendPlainText(env.TGSENDERTARGET2,  msg1)
    }
    // if ('message' in update) {
    //   await onMessage(env, update.message)
    // } else if ('channel_post' in update) {
    //   await onChannelMessage(update.channel_post)
    //   //await sendPlainText(OWNERID, 'channel' + update.channel_post.chat.id + '  ' + update.channel_post.text )
    // } else {
    //   await sendPlainText(c_OWNERID, 'message not handler: ')
    // }
  }

  async function sendPlainText (chatId, text) {
    return (await fetch(apiUrl('sendMessage', {
      chat_id: chatId,
      text
    }))).json()
  }