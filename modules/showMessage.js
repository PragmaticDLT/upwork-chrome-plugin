function showUserMessage(message, type) {
    let messageDiv = document.getElementById("message-div");
    const color = type === "success" ? "green" : "red";

    if (!messageDiv) {
        messageDiv = document.createElement("div");
        messageDiv.id = "message-div";
        messageDiv.style.position = "fixed";
        messageDiv.style.top = "15%";
        messageDiv.style.left = "50%";
        messageDiv.style.transform = "translateX(-50%)";
        messageDiv.style.backgroundColor = "lavenderblush";
        messageDiv.style.color = "white";
        messageDiv.style.zIndex = "10000";
        messageDiv.style.borderRadius = "5px";
        messageDiv.style.maxWidth = "80%";
        messageDiv.style.width = "500px"; // Фиксированная ширина
        messageDiv.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
        messageDiv.style.display = "flex";
        messageDiv.style.flexDirection = "column";
        messageDiv.style.boxSizing = "border-box";

        const closeButton = document.createElement("button");
        closeButton.innerHTML = "&#10005;";
        closeButton.style.alignSelf = "flex-end";
        closeButton.style.border = "none";
        closeButton.style.backgroundColor = "transparent";
        closeButton.style.color = "black";
        closeButton.style.fontSize = "20px";
        closeButton.style.cursor = "pointer";
        closeButton.style.padding = "5px 10px";

        closeButton.onclick = function () {
            messageDiv.remove();
        };

        messageDiv.appendChild(closeButton);

        const messagesContainer = document.createElement("div");
        messagesContainer.style.overflowY = "auto";
        messagesContainer.style.overflowX = "hidden";
        messagesContainer.style.maxHeight = "400px";
        messagesContainer.style.padding = "10px";
        messagesContainer.style.paddingTop = "0";
        messagesContainer.style.width = "100%";
        messagesContainer.style.wordWrap = "break-word";
        messageDiv.appendChild(messagesContainer);

        document.body.appendChild(messageDiv);
    }

    const messagesContainer = messageDiv.lastChild;

    const messageText = document.createElement("p");
    messageText.innerText = message;
    messageText.style.color = color;
    messageText.style.margin = "5px 0";
    messageText.style.wordWrap = "break-word";
    messagesContainer.appendChild(messageText);

    // Прокручиваем к последнему сообщению
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
