function showUserMessage(message, type) {
    let messageDiv = document.getElementById("message-div");
    const color = type === "success" ? "green" : "red";

    if (!messageDiv) {
        messageDiv = document.createElement("div");
        messageDiv.id = "message-div";
        messageDiv.style.position = "fixed";
        messageDiv.style.top = "8%";
        messageDiv.style.left = "65%";
        messageDiv.style.transform = "translate(-50%)";
        messageDiv.style.backgroundColor = "#fff";
        messageDiv.style.color = "#333";
        messageDiv.style.zIndex = "10000";
        messageDiv.style.borderRadius = "8px";
        messageDiv.style.maxWidth = "90%";
        messageDiv.style.width = "400px";
        messageDiv.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
        messageDiv.style.display = "flex";
        messageDiv.style.flexDirection = "column";
        messageDiv.style.boxSizing = "border-box";
        messageDiv.style.padding = "5px";
        messageDiv.style.fontFamily = "'Arial', sans-serif";


        const closeButton = document.createElement("button");
        closeButton.innerHTML = "&#10005;";
        closeButton.style.position='fixed'
        closeButton.style.top = "5px";
        closeButton.style.right = "5px";
        closeButton.style.alignSelf = "flex-end";
        closeButton.style.border = "none";
        closeButton.style.backgroundColor = "transparent";
        closeButton.style.color = "#aaa";
        closeButton.style.fontSize = "20px";
        closeButton.style.cursor = "pointer";
        closeButton.style.padding = "5px 10px";
        closeButton.style.transition = "color 0.3s";
        closeButton.style.margin = "-10px -10px 10px 0";


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
