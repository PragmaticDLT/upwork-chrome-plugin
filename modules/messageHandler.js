let suggestedScheduleData = null;

async function messageHandler(event, SERVER_URL) {
    if (event.origin !== SERVER_URL) {
        console.log("==Plugin== bad event.origin", event.origin);
        return;
    }
    const { action, templateUrl, headers, message = "" } = event.data;
    console.log("==Plugin== action: ", action);

    const btn = document.getElementById("floating-button");
    const initialIframe = document.getElementById("upwork-init-iframe");

    switch (action) {
        // region create button
        case "server ok":
            console.log("==Plugin== start creating button");
            const currentURL = window.location.href;
            if (!currentURL.startsWith("https://www.upwork.com/ab/messages/rooms")) {
                console.log("==Plugin== bad current url: ", currentURL);
                showUserMessage("Bad current url. Please ensure that you are on https://www.upwork.com/ab/messages/rooms/* page.", "error");
                return;
            }

            const button = document.createElement("button");
            button.id = "floating-button";
            button.style.cursor = "pointer";
            button.innerHTML = `
                <img src="${chrome.runtime.getURL("images/icon48.png")}" alt="Dispatcher Button Icon" style="margin-right: 5px;"/>  
                <span>Sync data</span>`;

            document.body.appendChild(button);
            waitForTargetElementAndAdjustButton();

            button.addEventListener("click", function (event) {
                initialIframe.contentWindow.postMessage({
                    type: "start sync",
                    companyReference
                }, initialIframe.src);
                console.log("==Plugin== Send message \"start sync\" after button click");
            });
            console.log("==Plugin== button created");
            showUserMessage("The server responded that it is ready for synchronization.", "success");
            break;
        // endregion

        // region fetch
        case "fetch":
            let response = "error";
            const url = templateUrl.replace("${companyReference}", companyReference).replace("${room}", room);
            console.log("==Plugin== fetch url: ", url);
            showUserMessage("Sync started. Please wait while the button become white", 'success');
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

            try {
                const dataRes = await fetch(url, options);
                const data = await dataRes.json();
                console.log("==Plugin== fetched data: ", data);
                if (!dataRes.ok) {
                    console.error("==Plugin== Failed to fetch", data);
                    showUserMessage(`Failed to fetch data. URL ${url}`, "error");
                }
                else {
                    response = data;
                }
            } catch (error) {
                console.error("==Plugin== Fetch error: ", error);
                showUserMessage(`Fetch error. URL ${url}`, "error");
            }

            initialIframe.contentWindow.postMessage({
                type: "fetch result",
                response
            }, initialIframe.src);
            console.log("==Plugin== message 'fetch result' sent");
            break;
        // endregion


        // region start sync
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

        case "error":
            showUserMessage(message, "error");
            btn.disabled = false;
            btn.style.cursor = "pointer";
            btn.classList.remove("no-hover");
            btn.classList.remove("sync-state");

            btn.innerHTML = `
                <img src="${chrome.runtime.getURL("images/icon48.png")}" alt="Dispatcher Button Icon" style="margin-right: 5px;"/>  
                <span>Sync failed. Click to repeat.</span>`;
            break

        case "notification":
            showUserMessage(message, "success");
            break


        default:
            console.log(`Ignored message from origin: ${event.origin}`);
    }
}
