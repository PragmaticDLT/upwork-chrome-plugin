const ENV_MODE = "development";
// 'development' || 'staging' || 'production'

let serverUrl;
switch (ENV_MODE) {
    case "development":
        serverUrl = "http://localhost:3000";
        break;
    case "production":
        serverUrl = "https://webapp-pragmatic-portal.azurewebsites.net";
        break;
    default:
        serverUrl = "https://hcp-dispatcher-nextjs.azurewebsites.net";
}

let bearerToken = '';
let bearerTokenPromiseResolve;

const bearerTokenPromise = new Promise(resolve => {
    bearerTokenPromiseResolve = resolve;
});

// region Get request header
chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details) {

        for (var header of details.requestHeaders) {
            if (header.name.toLowerCase() === "authorization") {
                console.log("Authorization header:", header.value);
                bearerToken = header.value;
                bearerTokenPromiseResolve(bearerToken);
                break;
            }
        }
        return { requestHeaders: details.requestHeaders };
    },
    { urls: ["https://www.upwork.com/api/v3/rooms/rooms/simplified?limit=20&callerOrgId=*"] },
    ["requestHeaders"]
);
// endregion


// region Get cookies
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "readCookies") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const url = "https://www.upwork.com/ab/messages/rooms/";

            if (tabs[0] && tabs[0].url && tabs[0].url.startsWith(url)) {
                const referer = tabs[0].url;
                console.log("==BG== referer ==> ", referer);
                const urlParams = new URLSearchParams(new URL(referer).search);
                console.log("==BG== urlParams ==> ", urlParams);
                const roomRegex = /room_[a-f0-9]{32}/;
                const match = referer.match(roomRegex);
                let room;
                if (match) room = match[0];
                const companyReference = urlParams.get("companyReference");
                console.log("==BG== companyReference ==> ", companyReference);
                chrome.cookies.getAll({ url: tabs[0].url }, async (cookies) => {
                    const cookieDetails = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join("; ");
                    await bearerTokenPromise;
                    sendResponse({ cookie: cookieDetails, companyReference, referer, room, bearerToken });
                });
                console.log("Cookie true");
                return true;
            } else {
                console.log("Not on the correct page, or the tab URL is undefined.");
                sendResponse({ data: "Not on the correct page, or the tab URL is undefined." });
            }
        });
        return true;
    }
});
//endregion
