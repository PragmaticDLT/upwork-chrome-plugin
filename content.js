const ENV_MODE = "development"; // 'development' || 'staging' || 'production'
const SERVER_URL = envHandler(ENV_MODE);
let companyReference = "";
let referer = "";
let room = "";
let bearerToken = "";
let cookie = "";


function addButtonWhenDOMLoaded() {
    // region create button
    const button = document.createElement("button");
    button.id = "floating-button";
    button.style.cursor = "pointer";
    button.innerHTML = `
        <img src="${chrome.runtime.getURL("images/icon48.png")}" alt="Dispatcher Button Icon" style="margin-right: 5px;"/>  
        <span>Sync data</span>`;
    // endregion

    // region Create iframe
    const currentURL = window.location.href;
    if (currentURL.startsWith("https://www.upwork.com/ab/messages/rooms")) {
        document.body.appendChild(button);
        waitForTargetElementAndAdjustButton();
    }

    // create iframe
    const initialPopup = document.createElement("div");
    initialPopup.id = "upwork-init-popup";

    const initialIframe = document.createElement("iframe");
    initialIframe.id = "upwork-init-iframe";
    initialIframe.src = `${SERVER_URL}/extension-connector`;

    initialPopup.appendChild(initialIframe);
    document.body.appendChild(initialPopup);

    initialIframe.onload = () => {
        initialIframe.contentWindow.postMessage({
            type: "initial iframe",
            companyReference
        }, initialIframe.src);
    };
// endregion

    // region Handle button click
    button.addEventListener("click", function (event) {
        initialIframe.contentWindow.postMessage({
            type: "start sync",
            companyReference
        }, initialIframe.src);
    });
    // endregion

    // region Get cookie
    chrome.runtime.sendMessage({ action: "readCookies" }, async (res) => {
            ({ companyReference, referer, room, bearerToken, cookie } = res);
        }
    );
// endregion

    window.addEventListener("message", (event) => messageHandler(event, SERVER_URL));
}


function waitForTargetElementAndAdjustButton() {
    const targetSelector = "[data-testid=\"calendar-menu-button\"]";
    const button = document.getElementById("floating-button");

    const observer = new MutationObserver((mutations, obs) => {
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
            const targetTop = targetElement.getBoundingClientRect().top + 8;
            button.style.top = `${targetTop}px`;
            obs.disconnect();
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
