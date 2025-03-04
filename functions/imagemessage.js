export async function onRequestPost({ request, env }) {
    const authHeader = request.headers.get("Authorization");
    const expectedPassword = env.TGMSGTOKEN; // Retrieve password from environment variable

    if (expectedPassword && (!authHeader || authHeader !== `Bearer ${expectedPassword}`)) {
        return new Response("Unauthorized", { status: 401 });
    }

    const contentType = request.headers.get("Content-Type") || "";
    
    if (contentType.startsWith("multipart/form-data")) {
        const formData = await request.formData();
        const message = formData.get("message") || "";
        const images = formData.getAll("image");
        
        if (!message.trim() && images.length === 0) {
            return new Response("Error: Either a message or at least one image is required", { status: 400 });
        }

        console.log("Received message:", message);

        const botToken = env.TGBOTTOKEN;
        const chatId = env.TGSENDERTARGET;

        // Create form data for Telegram request
        const telegramData = new FormData();
        telegramData.append("chat_id", chatId);

        if (images.length === 1) {
            telegramData.append("photo", images[0], images[0].name);
            if (message.trim()) {
                telegramData.append("caption", message.trim());
            }
            await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                method: "POST",
                body: telegramData,
            });
        } else if (images.length > 1) {
            telegramData.append("media", JSON.stringify(
                images.map((image, index) => ({
                    type: "photo",
                    media: `attach://photo${index}`,
                }))
            ));
            images.forEach((image, index) => {
                telegramData.append(`photo${index}`, image, image.name);
            });
            await fetch(`https://api.telegram.org/bot${botToken}/sendMediaGroup`, {
                method: "POST",
                body: telegramData,
            });
        } else if (message.trim()) {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text: message.trim() }),
            });
        }

        return new Response("Message and/or images sent to Telegram successfully", { status: 200 });
    } else {
        const message = await request.text();
        if (!message.trim()) {
            return new Response("Error: Message cannot be empty", { status: 400 });
        }
        console.log("Received message:", message);
        const botToken = env.TELEGRAM_BOT_TOKEN;
        const chatId = env.TELEGRAM_CHAT_ID;
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: message.trim() }),
        });
        return new Response("Message sent to Telegram successfully", { status: 200 });
    }
}
