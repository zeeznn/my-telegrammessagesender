
export async function onRequestPost({ request, env }) {
    const authHeader = request.headers.get("Authorization");
    const expectedPassword = env.TGMSGTOKEN; // Retrieve password from environment variable

    // Check if the Authorization header exists and if it matches the expected password
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response("Unauthorized", { status: 401 });
    }

    const password = authHeader.split(" ")[1]; // Extract password from the header
    if (expectedPassword && password !== expectedPassword) {
        return new Response("Unauthorized", { status: 401 });
    }

    const botToken = env.TGBOTTOKEN;
    const chatIds = [env.TGSENDERTARGET, env.TGSENDERTARGET2].filter(Boolean); // Collect non-empty target IDs
    const contentType = request.headers.get("Content-Type") || "";

    if (contentType.startsWith("multipart/form-data")) {
        const formData = await request.formData();
        const message = formData.get("message") || "";
        const mediaFiles = formData.getAll("media");

        if (!message.trim() && mediaFiles.length === 0) {
            return new Response("Error: Either a message or at least one image/video is required", { status: 400 });
        }

        let response;
        if (mediaFiles.length > 0) {
            const mediaArray = mediaFiles.map((file, index) => ({
                type: file.type.startsWith("image") ? "photo" : "video", // Check MIME type to determine if it's an image or video
                media: `attach://media${index}`
            }));

            if (message.trim()) {
                mediaArray[0].caption = message.trim(); // Add caption to the first media
            }

            const telegramData = new FormData();
            telegramData.append("media", JSON.stringify(mediaArray));
            mediaFiles.forEach((file, index) => {
                telegramData.append(`media${index}`, file, file.name);
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
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chat_id: chatIds[i], text: message.trim() }),
                });
            }
        }

        if (!response.ok) {
            return new Response("Failed to send message to Telegram", { status: response.status });
        }

        return new Response("Message and/or media sent to Telegram successfully", { status: 200 });
    } else {
        const message = await request.text();
        if (!message.trim()) {
            return new Response("Error: Message cannot be empty", { status: 400 });
        }
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatIds[0], text: message.trim() }),
        });

        if (!response.ok) {
            return new Response("Failed to send message to Telegram", { status: response.status });
        }

        return new Response("Message sent to Telegram successfully", { status: 200 });
    }
}




/*export async function onRequestPost({ request, env }) {
    const authHeader = request.headers.get("Authorization");
    const expectedPassword = env.TGMSGTOKEN;

    if (expectedPassword && (!authHeader || authHeader !== `Bearer ${expectedPassword}`)) {
        return new Response("Unauthorized", { status: 401 });
    }

    const botToken = env.TGBOTTOKEN;
    const chatIds = [env.TGSENDERTARGET, env.TGSENDERTARGET2].filter(Boolean);
    const contentType = request.headers.get("Content-Type") || "";

    if (contentType.startsWith("multipart/form-data")) {
        const formData = await request.formData();
        const message = formData.get("message") || "";
        const images = formData.getAll("image");
        const videos = formData.getAll("video");

        console.log("Received message:", message); // Log the received message
        console.log("Number of images received:", images.length); // Log number of images
        console.log("Number of videos received:", videos.length); // Log number of videos

        // Log details of each received file
        images.forEach((image, index) => {
            console.log(`Image ${index + 1}:`, image.name, `(${image.size} bytes)`);
        });

        videos.forEach((video, index) => {
            console.log(`Video ${index + 1}:`, video.name, `(${video.size} bytes)`);
        });

        if (!message.trim() && images.length === 0 && videos.length === 0) {
            return new Response("Error: Either a message or at least one media file is required", { status: 400 });
        }

        let response;
        const mediaArray = [];

        images.forEach((image, index) => {
            mediaArray.push({
                type: "photo",
                media: `attach://image${index}`
            });
        });

        videos.forEach((video, index) => {
            mediaArray.push({
                type: "video",
                media: `attach://video${index}`
            });
        });

        if (mediaArray.length > 0) {
            if (message.trim()) {
                mediaArray[0].caption = message.trim(); // Add caption to the first media file
            }

            const telegramData = new FormData();
            telegramData.append("media", JSON.stringify(mediaArray));

            images.forEach((image, index) => {
                telegramData.append(`image${index}`, image, image.name);
            });

            videos.forEach((video, index) => {
                telegramData.append(`video${index}`, video, video.name);
            });

            telegramData.set("chat_id", chatIds[0]);
            response = await fetch(`https://api.telegram.org/bot${botToken}/sendMediaGroup`, {
                method: "POST",
                body: telegramData,
            });

            // Log response for debugging
            const result = await response.json();
            console.log("Telegram API response:", result);

            if (!response.ok) {
                return new Response(`Failed to send message to Telegram: ${result.description}`, { status: response.status });
            }

            // Send to other targets
            for (let i = 1; i < chatIds.length; i++) {
                telegramData.set("chat_id", chatIds[i]);
                const clonedResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMediaGroup`, {
                    method: "POST",
                    body: telegramData,
                });

                const clonedResult = await clonedResponse.json();
                console.log(`Response for target ${chatIds[i]}:`, clonedResult);
            }

        } else if (message.trim()) {
            response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: chatIds[0], text: message.trim() }),
            });

            const result = await response.json();
            console.log("Telegram API response for message:", result);

            if (!response.ok) {
                return new Response(`Failed to send message to Telegram: ${result.description}`, { status: response.status });
            }

            for (let i = 1; i < chatIds.length; i++) {
                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: "POST",
                    body: JSON.stringify({ chat_id: chatIds[i], text: message.trim() }),
                });
            }
        }

        return new Response("Message and/or media sent to Telegram successfully", { status: 200 });
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

        const result = await response.json();
        console.log("Telegram API response for message:", result);

        if (!response.ok) {
            return new Response(`Failed to send message to Telegram: ${result.description}`, { status: response.status });
        }

        for (let i = 1; i < chatIds.length; i++) {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                body: JSON.stringify({ chat_id: chatIds[i], text: message.trim() }),
            });
        }

        return new Response("Message sent to Telegram successfully", { status: 200 });
    }
}
*/

