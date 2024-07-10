async function messageHandler(event, SERVER_URL, bearerToken) {
    if (event.origin !== SERVER_URL) {
        return;
    }
    const { action, templateUrl, headers, message = "" } = event.data;
    console.log("==Plugin== action: ", action);

    const btn = document.getElementById("floating-button");
    const initialIframe = document.getElementById("upwork-init-iframe");

    switch (action) {
        // region Server Ok - create button and stat sync
        case "server ok":
            console.log("==Plugin== start creating button");
            const currentURL = window.location.href;
            if (!currentURL.startsWith("https://www.upwork.com/ab/messages/rooms")) {
                console.log("==Plugin== bad current url: ", currentURL);
                showUserMessage("Bad current url. Please ensure that you are on https://www.upwork.com/ab/messages/rooms/* page.", "error");
                return;
            }

            if (!document.getElementById("floating-button")) {
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


                initialIframe.contentWindow.postMessage({
                    type: "start sync",
                    companyReference
                }, initialIframe.src);
                console.log("==Plugin== Send message \"start sync\" after button click");
                console.log("==Plugin== button created");
                showUserMessage("The server responded that it is ready for synchronization.", "success");
            }
            break;
        // endregion

        // region Fetch
        case "fetch":
            let response = "error";
            console.log("==MH== companyReference ==> ", companyReference);
            const url = templateUrl.replace("${companyReference}", companyReference).replace("${room}", room);
            console.log("==MH== fetch url: ", url);
            console.log("==MH== bearerToken ==> ", bearerToken);
            console.log("==MH== referer ==> ", referer);

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
                console.log("==Plugin== url ==> ", url);
                console.log("==== options ==> ", options);
                const dataRes = await fetch(url, options);
                const data = await dataRes.json();
                console.log("==Plugin== fetched data: ", data);
                if (!dataRes.ok) {
                    console.error("==Plugin== Failed to fetch", data);
                    showUserMessage(`Failed to fetch URL ${url}`, "error");
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

        // region Started sync
        case "sync started":
            btn.disabled = true;
            btn.style.cursor = "default";
            btn.classList.add("no-hover");
            btn.classList.add("sync-state");

            btn.innerHTML = `
                <img src="${chrome.runtime.getURL("images/icon48.png")}" alt="Dispatcher Button Icon" style="margin-right: 5px;"/>  
                <span>Data is syncing. DO NOT USE THIS TAB WHILE THIS MESSAGE IS SHOWN</span>`;
            showUserMessage(`⏩ Sync started.\n`, "success");
            break;

        // endregion

        // region Sync finished
        case "sync finished":
            btn.disabled = false;
            btn.style.cursor = "pointer";
            btn.classList.remove("no-hover");
            btn.classList.remove("sync-state");

            btn.innerHTML = `
                <img src="${chrome.runtime.getURL("images/icon48.png")}" alt="Dispatcher Button Icon" style="margin-right: 5px;"/>  
                <span>Data synced. Click to repeat.</span>`;
            showUserMessage(`✅ Sync finished.`, "success");

            break;
        // endregion Sync finished

        //     region Error
        case "error":
            showUserMessage(message, "error");
            btn.disabled = false;
            btn.style.cursor = "pointer";
            btn.classList.remove("no-hover");
            btn.classList.remove("sync-state");

            btn.innerHTML = `
                <img src="${chrome.runtime.getURL("images/icon48.png")}" alt="Dispatcher Button Icon" style="margin-right: 5px;"/>  
                <span>Sync failed. Click to repeat.</span>`;
            showUserMessage(`❗Sync error.`, "error");
            break;
        //endregion

        //region Notification
        case "notification":
            showUserMessage(message, "success");
            break;
        // endregion

        default:
            console.log(`Ignored message from origin: ${event.origin}`);
    }
}
