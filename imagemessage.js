document.getElementById('media_form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData();
    const message = document.getElementById('message').value.trim();
    const password = document.getElementById('password').value.trim(); // Get the password entered by the user
    const mediaFiles = document.getElementById('media').files; // Get the selected files (images & videos)

    console.log("Password entered:", password); // Log the password (for debugging only, don't log in production!)
    console.log("Message entered:", message); // Log message
    console.log("Media files selected:", mediaFiles.length); // Log number of files selected

    if (!password) {
        alert("Password is required.");
        return; // Don't proceed if no password is provided
    }

    if (message) {
        formData.append('message', message);  // Add message if present
    }
    
    formData.append('password', password);  // Add the password to the formData

    // Log the details of each media file (image or video)
    for (let i = 0; i < mediaFiles.length; i++) {
        console.log(`File ${i + 1}:`, mediaFiles[i].name, `(${mediaFiles[i].size} bytes, Type: ${mediaFiles[i].type})`); // Log file name, size, and type
        formData.append('media', mediaFiles[i]);
    }

    // Send the form data to the server
    try {
        const response = await fetch('/imagemessage', {  // Make sure the path is correct
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${password}`  // Include password as Bearer token in Authorization header
            },
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

document.getElementById('media').addEventListener('change', function() {
    const clearButton = document.getElementById('clear_button');
    if (this.files.length > 0) {
        clearButton.style.display = 'inline-block'; // Show the "Clear" button
    } else {
        clearButton.style.display = 'none'; // Hide the "Clear" button if no files selected
    }
});

document.getElementById('clear_button').addEventListener('click', function() {
    // Reset the file input and the message textarea
    document.getElementById('media').value = ''; // Clear selected files
    document.getElementById('message').value = ''; // Clear message
    this.style.display = 'none'; // Hide the "Clear" button again
});