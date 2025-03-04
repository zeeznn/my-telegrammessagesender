// send images perfect;
export async function onRequestPost({ request, env }) {
    const authHeader = request.headers.get("Authorization");
    const expectedPassword = env.TGMSGTOKEN; // Retrieve password from environment variable

    if (expectedPassword && (!authHeader || authHeader !== `Bearer ${expectedPassword}`)) {
        return new Response("Unauthorized", { status: 401 });
    }

    const botToken = env.TGBOTTOKEN;
    const chatIds = [env.TGSENDERTARGET, env.TGSENDERTARGET2].filter(Boolean); // Collect non-empty target IDs
    const contentType = request.headers.get("Content-Type") || "";
    
    if (contentType.startsWith("multipart/form-data")) {
        const formData = await request.formData();
        const message = formData.get("message") || "";
        const images = formData.getAll("image");
        
        if (!message.trim() && images.length === 0) {
            return new Response("Error: Either a message or at least one image is required", { status: 400 });
        }

        console.log("Received message:", message);

        let response;
        if (images.length === 1) {
            const telegramData = new FormData();
            telegramData.append("photo", images[0], images[0].name);
            if (message.trim()) {
                telegramData.append("caption", message.trim());
            }
            telegramData.set("chat_id", chatIds[0]);
            response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                method: "POST",
                body: telegramData,
            });
            for (let i = 1; i < chatIds.length; i++) {
                telegramData.set("chat_id", chatIds[i]);
                await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                    method: "POST",
                    body: telegramData,
                });
            }
        } else if (images.length > 1) {
            const mediaArray = images.map((image, index) => ({
                type: "photo",
                media: `attach://photo${index}`
            }));
            if (message.trim()) {
                mediaArray[0].caption = message.trim(); // Add caption to the first image
            }
            
            const telegramData = new FormData();
            telegramData.append("media", JSON.stringify(mediaArray));
            images.forEach((image, index) => {
                telegramData.append(`photo${index}`, image, image.name);
            });
            
            telegramData.set("chat_id", chatIds[0]);
            response = await fetch(`https://api.telegram.org/bot${botToken}/sendMediaGroup`, {
                method: "POST",
                body: telegramData,
            });
            for (let i = 1; i < chatIds.length; i++) {
                telegramData.set("chat_id", chatIds[i]);
                await fetch(`https://api.telegram.org/bot${botToken}/sendMediaGroup`, {
                    method: "POST",
                    body: telegramData,
                });
            }
        } else if (message.trim()) {
            response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatIds[0], text: message.trim() }),
            });
            for (let i = 1; i < chatIds.length; i++) {
                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: "POST",
                    body: JSON.stringify({ chat_id: chatIds[i], text: message.trim() }),
                });
            }
        }

        if (!response.ok) {
            return new Response("Failed to send message to Telegram", { status: response.status });
        }

        return new Response("Message and/or images sent to Telegram successfully", { status: 200 });
    } else {
        const message = await request.text();
        if (!message.trim()) {
            return new Response("Error: Message cannot be empty", { status: 400 });
        }
        console.log("Received message:", message);
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatIds[0], text: message.trim() }),
        });


        for (let i = 1; i < chatIds.length; i++) {
            const chatId = chatIds[i];
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatId, text: message.trim() }),
            });
        }
        
        if (!response.ok) {
            return new Response("Failed to send message to Telegram", { status: response.status });
        }
        return new Response("Message sent to Telegram successfully", { status: 200 });
    }
}
