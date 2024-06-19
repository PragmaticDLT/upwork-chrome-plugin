function envHandler(mode) {

    switch (mode) {
        case "development":
            return "http://localhost:3000";

        case "production":
            // return "https://hcp-dispatcher-nextjs-production.azurewebsites.net";
            return "https://app.hcpdispatcher.com";

        default:
            return "https://hcp-dispatcher-nextjs.azurewebsites.net";
    }
}

function removeBlocks() {
    document.querySelectorAll(".custom-event-block").forEach(block => {
        block.remove();
    });
}