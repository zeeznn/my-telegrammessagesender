export async function onRequestPost({ request, env }) {
    const authHeader = request.headers.get("Authorization");
    const expectedPassword = env.TGMSGTOKEN; // Retrieve password from environment variable

    console.log("Received Authorization header:", authHeader);
    console.log("Expected password:", expectedPassword);

    if (!authHeader || authHeader !== `Bearer ${expectedPassword}`) {
        return new Response("Unauthorized", { status: 401 });
    }
    
    const message = await request.text();
    if (!message.trim()) {
        return new Response("Error: Message cannot be empty", { status: 400 });
    }
    
    console.log("Received message:", message);
    
    return new Response("Message received successfully", { status: 200 });
}
