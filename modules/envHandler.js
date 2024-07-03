function envHandler(mode) {

    switch (mode) {
        case "development":
            return "http://localhost:3000";

        case "production":
            return "https://webapp-pragmatic-portal.azurewebsites.net";

        default:
            return "https://hcp-dispatcher-nextjs.azurewebsites.net";
    }
}
