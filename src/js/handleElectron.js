// get ipcrenderer from electron
const ipcRenderer = require("electron").ipcRenderer;

var prevDracoValue = null;
var currentDracoValue = null;
// get element  with id notify-value
var notifyValue = document.getElementById("notify-value");
// get element  with id should-notify
var shouldNotify = document.getElementById("should-notify");
var shouldNotifyLabel = document.getElementById("should-notify-label");
// Try to get the value from local storage for notifyValue and shouldNotify, and set the values to the elements
// if notifyValue or shouldNotify doen't exist in local storage, set the default values
const setValues = () => {
  if (localStorage.getItem("notifyValue") === null) {
    localStorage.setItem("notifyValue", "0");
  }
  if (localStorage.getItem("shouldNotify") === null) {
    localStorage.setItem("shouldNotify", "false");
  }
  notifyValue.value = localStorage.getItem("notifyValue");
  shouldNotify.checked = localStorage.getItem("shouldNotify") === "true";
  //   if shouldNotify is checked, show a tooltip that says "Notificaciones activas", else "Notificaciones desactivadas"
  if (shouldNotify.checked) {
    shouldNotifyLabel.setAttribute("title", "Notificaciones activas");
  } else {
    shouldNotifyLabel.setAttribute("title", "Notificaciones desactivadas");
  }
};

setValues();
var dracoUpdDate = document.getElementById("draco-upd-date");
var loader = document.getElementById("loader");
var dracoPriceValue = document.getElementById("draco-price-value");
var dracoPriceChange = document.getElementById("draco-price-change");

// when receiving data from main process from an event called "draco_value"
// log the data
var timeoutGetDraco = null;
const sendNotification = () => {
  if (currentDracoValue === null) {
    return;
  }
  ipcRenderer.send("send_notification", {
    title: "Draco price alert",
    body: `Draco price is $${currentDracoValue}`,
  });
};

ipcRenderer.on("draco_value", (event, arg) => {
  prevDracoValue = currentDracoValue;
  currentDracoValue = arg;

  if (prevDracoValue != currentDracoValue) {
    //   if current draco value is not null hide the loader
    if (currentDracoValue != null) {
      loader.style.display = "none";
    }
    //   dracoPriceValue must show the new price formated with , on the decimals
    dracoPriceValue.innerHTML = `$${currentDracoValue}`;
    // change dracoUpdDate to the current date in spanish format
    dracoUpdDate.innerHTML = `Actualizado: ${new Date().toLocaleString(
      "es-ES",
      {
        timeZone: "America/Argentina/Buenos_Aires",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
      }
    )}`;

    // if draco price is higher than notifyValue and shouldNotify is true
    // send a notification
    if (
      currentDracoValue != null &&
      shouldNotify.checked &&
      currentDracoValue > notifyValue.value
    ) {
      //   send a notification
      sendNotification();
    }

    // dracoPriceChange should show the percent of change in price, if newer price
    // is higher add a positive sign and a positive class, if lower add a negative sign and a negative class
    // only if the prevDracoValue is not null
    if (prevDracoValue != null) {
      // remove d-none class from dracoPriceChange
      dracoPriceChange.classList.remove("d-none");
      let percentChange =
        ((currentDracoValue - prevDracoValue) / prevDracoValue) * 100;
      dracoPriceChange.innerHTML = `${
        percentChange > 0 ? "+" : ""
      }${percentChange.toFixed(3)}%`;
      if (currentDracoValue > prevDracoValue) {
        dracoPriceChange.classList.add("positive");
        dracoPriceChange.classList.remove("negative");
      } else if (currentDracoValue < prevDracoValue) {
        dracoPriceChange.classList.add("negative");
        dracoPriceChange.classList.remove("positive");
      }
    }
  }

  //   wait 5 seconds and send "get_draco" event to main process
  if (timeoutGetDraco) {
    clearTimeout(timeoutGetDraco);
  }
  timeoutGetDraco = setTimeout(() => {
    ipcRenderer.send("get_draco");
  }, 5000);
});

ipcRenderer.send("get_draco");

// if notifyValue or shouldNotify values changes, save the new value to local storage
// if now, shouldNotify is true and currentDracoValue is not null and is higher than notifyValue
// send a notification

sendNotification();
shouldNotify.addEventListener("change", () => {
  localStorage.setItem("shouldNotify", shouldNotify.checked);
  if (shouldNotify.checked) {
    shouldNotifyLabel.setAttribute("title", "Notificaciones activas");
  } else {
    shouldNotifyLabel.setAttribute("title", "Notificaciones desactivadas");
  }
  if (
    shouldNotify.checked &&
    currentDracoValue != null &&
    currentDracoValue > notifyValue.value
  ) {
    sendNotification();
  }
});

notifyValue.addEventListener("change", () => {
  localStorage.setItem("notifyValue", notifyValue.value);
  if (
    shouldNotify.checked &&
    currentDracoValue != null &&
    currentDracoValue > notifyValue.value
  ) {
    sendNotification();
  }
});
