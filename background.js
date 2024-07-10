// region Preparations
const ENV_MODE = "production";
// 'development' || 'staging' || 'production'


let serverUrl;
switch (ENV_MODE) {
    case "development":
        serverUrl = "http://localhost:3000";
        break;
    case "production":
        serverUrl = "https://webapp-pragmatic-portal.azurewebsites.net";
        break;
}
// endregion

let bearerToken = "";
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
                if (match) {
                    room = match[0];
                }
                const companyReference = urlParams.get("companyReference");
                console.log("==BG== companyReference ==> ", companyReference);
                chrome.cookies.getAll({ url: tabs[0].url }, async (cookies) => {
                    const cookieDetails = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join("; ");
                    await bearerTokenPromise;
                    sendResponse({ cookie: cookieDetails, companyReference, referer, room, bearerToken });
                });
                console.log("Cookie true");
                return true;
            }
            else {
                console.log("Not on the correct page, or the tab URL is undefined.");
                sendResponse({ data: "Not on the correct page, or the tab URL is undefined." });
            }
        });
        return true;
    }
});
// endregion Get cookies


async function checkTabs(tabId, changeInfo, tab) {
    if (changeInfo?.status === "complete") {
        let activeTabs = 0;

        // region Get Chrome tabs
        const tabs = await new Promise((resolve) => {
            chrome.tabs.query({}, (result) => resolve(result));
        });
        // endregion Get chrome tabs

        // region Check if script is on tab
        for (const tab of tabs) {
            try {
                const response = await new Promise((resolve) => {
                    chrome.tabs.sendMessage(tab?.id, { action: "checkContentScript" }, (response) => {
                        if (chrome.runtime.lastError) {
                            resolve(null);
                        }
                        else {
                            resolve(response);
                        }
                    });
                });
                if (response && response.status === "active") {
                    activeTabs++;
                }
            } catch (error) {
                console.error(`Error checking tab ${tab.id}:`, error);
            }
        }
        // endregion Check if script is on tab

        console.log("Are there another tabs with working plugin? ", activeTabs > 1, activeTabs);
        if (!activeTabs) {
            const targetUrl = "https://www.upwork.com/ab/messages/rooms/";
            if (tab.url.startsWith(targetUrl)) {
                chrome.tabs.sendMessage(tabId, { action: "start" });
            }
        }
    }
}

chrome.tabs.onUpdated.addListener(checkTabs);
chrome.tabs.onCreated.addListener(checkTabs);
