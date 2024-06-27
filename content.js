const ENV_MODE = "production"; // 'development' || 'staging' || 'production'
const SERVER_URL = envHandler(ENV_MODE);
let companyReference = "";
let referer = "";
let room = "";
let bearerToken = "";
let cookie = "";


function startWhenDOMLoaded() {
    console.log("==== startWhenDOMLoaded ==> ", );
    // region Create iframe
    const initialPopup = document.createElement("div");
    initialPopup.id = "upwork-init-popup";

    const initialIframe = document.createElement("iframe");
    initialIframe.id = "upwork-init-iframe";
    initialIframe.src = `${SERVER_URL}/extension-connector`;

    initialPopup.appendChild(initialIframe);
    document.body.appendChild(initialPopup);

    console.log("==Plugin== iframe created");

    initialIframe.onload = async () => {
        try {
            console.log("Checking server...");
            const result = await fetch(SERVER_URL, { method: "GET", mode: "no-cors" });
            console.log("Server responded". result);
        } catch (error) {
            console.error("Check error");
            showUserMessage(
                "Dispatcher Assistant is currently unavailable as there is no connection to the server. Please try again later or contact the application developer for assistance.");
            return;
        }

        setTimeout(() => {
            initialIframe.contentWindow.postMessage({
                type: "iframe created",
                companyReference
            }, initialIframe.src);

        }, 2000);
        console.log("==Plugin== Send message \"iframe created\"");
    };
// endregion


    // region Get cookie
    chrome.runtime.sendMessage({ action: "readCookies" }, async (res) => {
            ({ companyReference, referer, room, bearerToken, cookie } = res);
            console.log("==Plugin== companyReference", companyReference);
            console.log("==Plugin== referer", referer);
            console.log("==Plugin== room", room);
            console.log("==Plugin== bearerToken.length", bearerToken?.length);
            console.log("==Plugin== bearerToken.length", cookie?.length);
        }
    );
    // endregion

    window.addEventListener("message", (event) => messageHandler(event, SERVER_URL));
    console.log("==Plugin== added EventListener");
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

console.log("==== start ==> ");
// Check if the document has already loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startWhenDOMLoaded);
}
else {
    startWhenDOMLoaded();
}
