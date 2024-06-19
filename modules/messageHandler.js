let suggestedScheduleData = null;

function messageHandler(event, SERVER_URL, renderScheduleBlocks) {
    if (event.origin === SERVER_URL) {

        const closePopUp = (title, action) => {
            const popup = document.getElementById(title);
            if (action === "remove") {
                popup.remove();
            }
            else {
                popup.style.display = "none";
            }
        };

        switch (event.data.action) {
            case "closeIframe":
                closePopUp("dispatcher-popup", "none");
                break;

            case "server ok":
                const initPopup = document.getElementById("init-popup");
                const btn = document.getElementById("floating-button");
                if (initPopup) {
                    initPopup.style.display = "block";
                }
                const currentURL = window.location.href;
                if (currentURL === "https://pro.housecallpro.com/pro/calendar_new") {
                    btn.disabled = false;
                }
                break;

            case "suggestedSchedule":
                suggestedScheduleData = event.data.data;
                closePopUp("dispatcher-popup", "none");
                renderScheduleBlocks(suggestedScheduleData.schedule, event.data.view);
                break;

            case "suggestedSchedule-background":
                suggestedScheduleData = event.data.data;
                renderScheduleBlocks(suggestedScheduleData.schedule, event.data.view);
                break;

            case "closeAll":
                closePopUp("dispatcher-popup", "remove");
                break;

            case "onboarding false, isAdmin false":
                if (event.data.eventType === "settings opened") {
                    closePopUp("settings-popup", "remove");
                    return;
                }
                closePopUp("init-popup", "remove");
                break;

            case "closeInitIframe":
                if (event.data.eventType === "settings opened") {
                    closePopUp("settings-popup", "remove");
                    return;
                }
                closePopUp("init-popup", "remove");
                break;

            case "onboarding true":
                if (event.data.eventType === "settings opened") {
                    closePopUp("settings-popup", "remove");
                    return;
                }
                closePopUp("init-popup", "remove");
                break;

            default:
                console.log(`Ignored message from unauthorized origin: ${event.origin}`);
        }
    }
}
