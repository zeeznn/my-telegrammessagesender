document.getElementById('media_form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData();
    const message = document.getElementById('message').value.trim();
    const images = document.getElementById('image').files;
    const videos = document.getElementById('video').files;

    console.log("Message entered:", message); // Log message
    console.log("Images selected:", images.length); // Log number of images selected
    console.log("Videos selected:", videos.length); // Log number of videos selected

    if (message) {
        formData.append('message', message);  // Add message if present
    }

    // Log the details of each image file
    for (let i = 0; i < images.length; i++) {
        console.log(`Image ${i + 1}:`, images[i].name, `(${images[i].size} bytes)`); // Log file name and size
        formData.append('image', images[i]);
    }

    // Log the details of each video file
    for (let i = 0; i < videos.length; i++) {
        console.log(`Video ${i + 1}:`, videos[i].name, `(${videos[i].size} bytes)`); // Log file name and size
        formData.append('video', videos[i]);
    }

    // Send the form data to the server
    try {
        const response = await fetch('/your-server-path', {  // Make sure the path is correct
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (response.ok) {
            alert('Message and media sent successfully!');
        } else {
            alert(`Error: ${result.error || 'Failed to send message to Telegram'}`);
        }
    } catch (error) {
        alert('An error occurred while sending the media.');
    }
});
