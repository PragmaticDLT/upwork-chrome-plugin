const ENV_MODE = "staging";
// 'development' || 'staging' || 'production'

let serverUrl;
switch (ENV_MODE) {
    case "development":
        serverUrl = "http://localhost:3000";
        break;
    case "production":
        serverUrl = "https://app.hcpdispatcher.com";
        break;
    default:
        serverUrl = "https://hcp-dispatcher-nextjs.azurewebsites.net";
}

let bearerToken = '';
let bearerTokenPromiseResolve;
const bearerTokenPromise = new Promise(resolve => {
    bearerTokenPromiseResolve = resolve;
});


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
    { urls: ["https://www.upwork.com/api/v3/rooms/*"] },
    ["requestHeaders", "extraHeaders"]
);


// getting cookies
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "readCookies") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const url = "https://www.upwork.com/";

            if (tabs[0] && tabs[0].url && tabs[0].url.startsWith(url)) {
                const referer = tabs[0].url;
                const urlParams = new URLSearchParams(new URL(referer).search);
                const roomRegex = /room_[a-f0-9]{32}/;
                const match = referer.match(roomRegex);
                let room;
                if (match) room = match[0];
                const companyReference = urlParams.get("companyReference");
                chrome.cookies.getAll({ url: tabs[0].url }, async (cookies) => {
                    const cookieDetails = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join("; ");
                    const token = await bearerTokenPromise; // Wait for the bearer token
                    sendResponse({ cookie: cookieDetails, companyReference, referer, room, bearerToken: token });
                });
                return true;
            } else {
                sendResponse({ data: "Not on the correct page, or the tab URL is undefined." });
            }
        });
        return true;
    }
});


// on extension click - open settings or onboarding
// chrome.action.onClicked.addListener(function (tab) {
//     if (tab?.url.includes("/settings?key") || tab?.url.includes("/not-eligible")) {
//         return;
//     }
//
//
//     if (!allowedUrls.some(allowedUrl => tab?.url?.startsWith(allowedUrl))) {
//         chrome.tabs.create({ url: `${serverUrl}/not-eligible` });
//         return;
//     }
//     chrome.tabs.sendMessage(tab.id, { action: "open settings" });
// });


// open onboarding when installation
// chrome.runtime.onInstalled.addListener(function (details) {
//     if (details.reason === "install") {
//         chrome.tabs.create({ url: `${serverUrl}/onboarding` });
//     }
// });
