const { app, BrowserWindow, Menu, Notification } = require("electron");
const path = require("path");
const url = require("url");
const { ipcMain } = require("electron");
const getDraco = require("./getDracoValue");
app.setAppUserModelId("mir4_draco.app");

// if (process.env.NODE_ENV !== "production") {
//   require("electron-reload")(__dirname, {});
// }
let win;

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 500,
    height: 320,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    resizable: false,
  });

  // and load the index.html of the app.
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, "src/index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  win.setMenu(null);

  // Open the DevTools.
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// when receiving a signal called "get_draco" from renderer process
// send the draco value to the renderer process
ipcMain.on("get_draco", (event, arg) => {
  //   asyncrhonously get the draco value
  getDraco()
    .then((draco) => {
      event.sender.send("draco_value", draco);
    })
    .catch((e) => console.log(e));
});

// when receiving signal "send_notification" from renderer process
// send a windows notification with the title and message
ipcMain.on("send_notification", (event, arg) => {
  let title = arg.title;
  let body = arg.body;
  console.log(title, body);
  let notification = new Notification({
    title,
    body,
  });
  notification.show();
});
