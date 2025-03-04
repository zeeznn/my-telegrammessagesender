document.getElementById('media_form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData();
    const message = document.getElementById('message').value.trim();
    const password = document.getElementById('password').value.trim();
    const mediaFiles = document.getElementById('media').files;

    if (!password) {
        displayActionMessage("Password is required.", "danger");
        return;
    }

    if (message) {
        formData.append('message', message);
    }
    
    formData.append('password', password);

    for (let i = 0; i < mediaFiles.length; i++) {
        formData.append('media', mediaFiles[i]);
    }

    try {
        const response = await fetch('/imagemessage', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${password}`
            },
            body: formData,
        });

        if (response.ok) {
            displayActionMessage("Message and media sent successfully!", "success");
        } else {
            const errorText = await response.text();
            displayActionMessage(`Failed to send message. HTTP status: ${response.status}, Error: ${errorText}`, "danger");
        }
    } catch (error) {
        displayActionMessage("An error occurred while sending the media. Please check the console for details.", "danger");
    }
});

function displayActionMessage(message, type) {
    const actionMessageDiv = document.getElementById('action_message');
    actionMessageDiv.innerHTML = message;
    actionMessageDiv.classList.remove('alert-info', 'alert-success', 'alert-danger');
    actionMessageDiv.classList.add(`alert-${type}`);
    actionMessageDiv.style.display = 'block';
}

document.getElementById('media').addEventListener('change', function() {
    const clearButton = document.getElementById('clear_button');
    if (this.files.length > 0) {
        clearButton.style.display = 'inline-block';
    } else {
        clearButton.style.display = 'none';
    }
});

document.getElementById('clear_button').addEventListener('click', function() {
    document.getElementById('media').value = '';
    document.getElementById('message').value = '';
    this.style.display = 'none';
});
