
var settings = {
    "notify": true,
    "check_interval": 0.1,
};

var interval_check_notifications = null;

onload = main;



function main()
{
    var spinbox_interval = document.querySelector("#spinbox-interval");
    spinbox_interval.value = settings["check_interval"];
    spinbox_interval.addEventListener("mouseenter", () => mouse_on_textarea = true);
    spinbox_interval.addEventListener("mouseleave", () => mouse_on_textarea = false);

    spinbox_interval.addEventListener("change", function(event) {
        var value = event.target.value;
        if(parseInt(value))
        {
            settings["check_interval"] = value;
            console.log("Check interval set to",value);
        }

        clearInterval(interval_check_notifications);
        interval_check_notifications = setInterval(check_notifications, settings["check_interval"]*1000);
    });


    check_notifications();
    clearInterval(interval_check_notifications);
    interval_check_notifications = setInterval(check_notifications, settings["check_interval"]*1000);

    console.log("Setting interval for",settings["check_interval"]);
}

function check_notifications()
{
    var now = new Date();
    console.log("Checking", now.getMinutes(), now.getSeconds());
}