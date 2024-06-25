// Unavailable server error message modal window
function showUserMessage(message, type) {
    const color = type === "success" ? "green" : "red";

    const messageDiv = document.createElement('div');
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '15%';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.padding = '10px';
    messageDiv.style.backgroundColor = color;
    messageDiv.style.color = 'white';
    messageDiv.style.zIndex = '10000';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.maxWidth = '20%';
    messageDiv.style.paddingRight = '40px';

    const messageText = document.createElement('span');
    messageText.innerText = message;
    messageDiv.appendChild(messageText);


    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&#10005;';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '10px';
    closeButton.style.border = 'none';
    closeButton.style.backgroundColor = 'white';
    closeButton.style.color = color;
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '20px';
    closeButton.style.height = '20px';
    closeButton.style.fontSize = '17px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0';

    closeButton.onclick = function() {
        messageDiv.remove();
    };

    messageDiv.appendChild(closeButton);

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 10000);
}
