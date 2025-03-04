document.getElementById("sendForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("message").value.trim();
    const images = document.getElementById("images").files;
    const statusMessage = document.getElementById("statusMessage");

    if (!message && images.length === 0) {
        statusMessage.innerHTML = "<p class='text-danger'>Error: Please provide a message or images.</p>";
        return;
    }

    const formData = new FormData();
    formData.append("message", message);
    for (let i = 0; i < images.length; i++) {
        formData.append("image", images[i]);
    }

    const headers = {};
    if (password) {
        headers["Authorization"] = `Bearer ${password}`;
    }

    statusMessage.innerHTML = "<p class='text-info'>Sending...</p>";

    try {
        const response = await fetch("/imagemessage", { 
            method: "POST",
            headers: headers,
            body: formData
        });

        const result = await response.text();
        if (response.ok) {
            statusMessage.innerHTML = "<p class='text-success'>Success: " + result + "</p>";
        } else {
            statusMessage.innerHTML = "<p class='text-danger'>Error: " + result + "</p>";
        }
    } catch (error) {
        statusMessage.innerHTML = "<p class='text-danger'>Error: Failed to send request.</p>";
    }
});
