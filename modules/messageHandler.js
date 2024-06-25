let suggestedScheduleData = null;

async function messageHandler(event, SERVER_URL) {
    if (event.origin !== SERVER_URL) {
        return;
    }
    const { action, templateUrl, headers } = event.data;
    let response = "error";
    const btn = document.getElementById("floating-button");

    switch (action) {
        // region fetch
        case "fetch":
            const initialIframe = document.getElementById("upwork-init-iframe");
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
            break;
        // endregion

        //     region start sync
        case "sync started":
            btn.disabled = true;
            btn.style.cursor = "default";
            btn.classList.add("no-hover");
            btn.classList.add("sync-state");

            btn.innerHTML = `
                <img src="${chrome.runtime.getURL("images/icon48.png")}" alt="Dispatcher Button Icon" style="margin-right: 5px;"/>  
                <span>Data is syncing. DO NOT USE THIS TAB WHILE THIS MESSAGE IS SHOWN</span>`;
            break;
        // endregion

        // region sync finished
        case "sync finished":
            btn.disabled = false;
            btn.style.cursor = "pointer";
            btn.classList.remove("no-hover");
            btn.classList.remove("sync-state");

            btn.innerHTML = `
                <img src="${chrome.runtime.getURL("images/icon48.png")}" alt="Dispatcher Button Icon" style="margin-right: 5px;"/>  
                <span>Data synced. Click to repeat.</span>`;
            break;
        // endregion

        default:
            console.log(`Ignored message from unauthorized origin: ${event.origin}`);
    }
}
