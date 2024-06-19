const ENV_MODE = "development"; // 'development' || 'staging' || 'production'
const SERVER_URL = envHandler(ENV_MODE);
let companyReference = "";
let referer = "";
let room = "";
let bearerToken = "";
let cookie = "";


function addButtonWhenDOMLoaded() {
    const button = document.createElement("button");
    button.id = "floating-button";
    button.style.cursor = "pointer";
    button.innerHTML = `
        <img src="${chrome.runtime.getURL("images/icon48.png")}" alt="Dispatcher Button Icon" style="margin-right: 5px;"/>  
        <span>Sync data</span>`;
    const currentURL = window.location.href;
    console.log("==== currentURL ==> ", currentURL);

    if (currentURL.startsWith("https://www.upwork.com/ab/messages/rooms")) {
        document.body.appendChild(button);
        waitForTargetElementAndAdjustButton();
    }


// handle button click
    button.addEventListener("click", function (event) {
        console.log("==== click ==> ", event);
        initialIframe.contentWindow.postMessage({
            type: "start sync",
            companyReference
        }, initialIframe.src);
    });

// get cookie
    chrome.runtime.sendMessage({ action: "readCookies" }, async (res) => {
            ({ companyReference, referer, room, bearerToken, cookie } = res);
        }
    );


// create iframe
    const initialPopup = document.createElement("div");
    initialPopup.id = "upwork-popup";

    const initialIframe = document.createElement("iframe");
    initialIframe.id = "modal-window";
    initialIframe.src = `${SERVER_URL}/extension-connector`;

    initialPopup.appendChild(initialIframe);
    document.body.appendChild(initialPopup);

    initialIframe.onload = () => {
        setTimeout(() => {
            initialIframe.contentWindow.postMessage({
                type: "initial iframe",
                companyReference
            }, initialIframe.src);
        }, 500);
    };


    // Add an event listener to the button
    window.addEventListener("message", async (event) => {
        const { action, templateUrl, headers } = event.data;
        let response = "error";

        if (action === "fetch") {
            const url = templateUrl.replace("${companyReference}", companyReference).replace("${room}", room);
            const options = {
                method : "GET",
                headers: {
                    ...headers,
                    Authorization          : bearerToken,
                    Cookie                 : cookie,
                    Referer                : referer,
                    "Vnd-Eo-Orguid"        : companyReference,
                    "X-Upwork-Api-Tenantid": companyReference
                }
            };

            const dataRes = await fetch(url, options);
            const data = await dataRes.json();
            if (!dataRes.ok) {
                console.error("Failed to fetch", url);
            }
            else {
                response = data;
            }
            initialIframe.contentWindow.postMessage({
                type: "fetch result",
                response
            }, initialIframe.src);
        }
    });
}


function waitForTargetElementAndAdjustButton() {
    const targetSelector = "[data-testid=\"calendar-menu-button\"]";
    const button = document.getElementById("floating-button");

    const observer = new MutationObserver((mutations, obs) => {
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
            const targetTop = targetElement.getBoundingClientRect().top + 8;
            button.style.top = `${targetTop}px`; // Adjust button position
            obs.disconnect(); // Stop observing once the target is found
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

// Check if the document has already loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addButtonWhenDOMLoaded);
}
else {
    addButtonWhenDOMLoaded();
}
