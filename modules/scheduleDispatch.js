function scheduleDispatch(event) {
    try {
        if (!event.start) {
            throw new Error(`Event missing start time: ${JSON.stringify(event)}`);
        }

        const startTimeSlot = document?.querySelector(`[data-date="${event.day}T${event.start_str}:00"]`);
        const startPlusHalfHour = document?.querySelector(`[data-date="${event.day}T${event.start_plus_half_hour}:00"]`);
        const row = document?.querySelector(`td[data-resource-id=${event.techId}][role="gridcell"]`);

        const startCoords = startTimeSlot?.getBoundingClientRect()?.left;
        const startHalfHourCoords = startPlusHalfHour?.getBoundingClientRect()?.left;
        const deltaOneHour = (startHalfHourCoords - startCoords) * 2;

        if (!startCoords || !startHalfHourCoords || !row) {
            return
        }
        const height = Math.round(row.clientHeight * 0.98);
        const leftWall = document.querySelector(`.fc-timeline-slot`)?.getBoundingClientRect()?.left;
        const leftFront = startCoords - leftWall;
        const leftStartPlusOneHour = leftFront + deltaOneHour;
        const slotWidth = parseFloat(((leftStartPlusOneHour - leftFront) * (event.end - event.start)).toFixed(1));

        const avatar = event.avatarThumb ?
            `<img src="${event.avatarThumb}" alt="${event.name}">` :
            `<div>${event.initials || "T"}</div>`;

        let techName = `<div class="eventHeader">
                            <div class="eventName">
                                <div class="nameContainer">
                                    <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true" data-color="#03796b" style="height: 11px;width: 11px;">
                                        <path d="M20.7967573 17.6504468l-7.4479265-7.44792652c.7366081-1.88244296.3273814-4.09226731-1.2276802-5.64732889-1.63690693-1.63690693-4.09226732-1.96428832-6.05655563-1.0639895l3.51934989 3.51934989-2.45536039 2.45536039-3.60119524-3.5193499c-.98214416 1.96428832-.57291742 4.41964871 1.0639895 6.05655563 1.55506158 1.5550616 3.76488594 1.9642883 5.6473289 1.2276802l7.44792647 7.4479265c.3273814.3273814.8184535.3273814 1.1458349 0l1.882443-1.8824429c.4092267-.3273814.4092267-.9002989.0818453-1.1458349z"></path>
                                    </svg>
                                    <span class="techName">${event.name}<br></span>
                                </div>
                                <div class="techAvatar">
                                   ${avatar}
                                </div>
                            </div>
                        </div>`;

        let timeslot = `<div class="eventTime">
                            <svg focusable="false" viewBox="0 0 24 24" aria-hidden="true" style="height: 11px; width: 11px; margin-right: 2px;">
                                <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path>
                            </svg>
                            <span>
                                <span>${event.start_str_usa} - ${event.end_str_usa}</span><br>
                            </span>
                        </div>`;

        const eventBlock = document.createElement("div");

        eventBlock.className =
            `${event.status === "Overlap" ? "overbooked" : ""} custom-event-block ${event.risk === "High" || event.quality ===
            "Low" ? "high-risk" : event.risk === "Medium" ||
            event.quality === "Medium" ? "medium-risk" : "low-risk"}`;

        eventBlock.style.top = "0";
        eventBlock.style.left = `${leftFront}px`;
        eventBlock.style.width = `${slotWidth}px`;
        eventBlock.style.height = `${height}px`;
        const travel = event.ETA === "N/A" ? "N/A" : `${event.distance} (${Math.floor(event.ETA / 60)} mins)`;
        eventBlock.innerHTML = `${techName} ${timeslot}\nTravel: ${travel}`;

        eventBlock.addEventListener("mouseenter", () => {
            const parent = eventBlock.parentNode;
            parent.style.zIndex = "10000";
            eventBlock.style.height = eventBlock.scrollHeight > height ? "fit-content" : `${height}px`;
        });
        eventBlock.addEventListener("mouseleave", () => {
            const parent = eventBlock.parentNode;
            parent.style.zIndex = "";
            eventBlock.style.height = `${height}px`; // Сбрасываем минимальную высоту блока
        });

        eventBlock.addEventListener("click",
            () => window.open(`https://pro.housecallpro.com/pro/jobs/new?${event.query_string}`, "_blank"));

        const techRow = document.querySelector(`.fc-timeline-lane[data-resource-id="${event.techId}"]`);
        techRow.querySelector(".fc-timeline-events")?.appendChild(eventBlock);

    } catch (error) {
        console.error("Schedule Dispatch error", error);
        const iframe = document.getElementById("modal-window");
        if (iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: "error", error: "scheduleDispatch: " + error.toString() }, "*");
        }
    }
}