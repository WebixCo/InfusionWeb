// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const getWebsiteFavicon = require('get-website-favicon')
const contextMenu = require('electron-context-menu');
const path = require('path')
var request = require('request').defaults({ encoding: null });
require('electron-reload')(__dirname);
var loginopen = false
var logincallback = false
var mainWindow;
process.on('uncaughtException', (error) => {
  console.error('An uncaught exception occurred:', error)
})

var mainWindow;
contextMenu({
  prepend: (defaultActions, parameters, browserWindow) => [
    {
      label: 'Menu'
      // Only show it when right-clicking images
      
    }
  ]
});

function closeWindowsByTitle(title) {
  let windows = BrowserWindow.getAllWindows()
  windows.forEach(win => {
    if (win.getTitle() === title) {
      win.close()
    }
  })
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hidden',
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      spellcheck: true,
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // and load the index.html of the app.
  mainWindow.webContents.session.setProxy({mode:"system" });
 mainWindow.loadFile('index.html')
  mainWindow.removeMenu()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  mainWindow.webContents.on('page-favicon-updated', (event, favicons) => {
    if (favicons && favicons[0]) {
      mainWindow.webContents.send('favicon-updated', favicons[0])
      console.log(favicons[0])
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on('ready', function () {
  setTimeout(function () {
    createWindow();
  }, 10);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
app.on("web-contents-created", (e, contents) => {
  if (contents.getType() == "webview") {
    contextMenu({ window: contents });
  }
})
app.on('login', (event, webContents, request, authInfo, callback) => {
  event.preventDefault()
  mainWindow.focus()
  loginWindow = new BrowserWindow({
    width: 300,
    height: 400,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  loginWindow.loadFile(path.join(__dirname, 'login.html'))

  loginWindow.webContents.on('did-finish-load', () => {
    let message = authInfo.isProxy ? `The proxy ${authInfo.host} is requesting your username and password.` : `The site ${authInfo.host} is requesting your username and password.`
    loginWindow.webContents.send('set-proxy-info', message)
  })

  ipcMain.on('submit-credentials', (event, username, password) => {
    callback(username, password)
    loginWindow.close()
    closeWindowsByTitle("Login")
  })
})
app.on('login', (event, webContents, request, authInfo, callback) => {
  event.preventDefault()

  if (loginopen) {
    loginWindow.focus()
    return
  }
  else{
    loginWindow = new BrowserWindow({
      width: 300,
      height: 400,
      frame: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    })
  
    loginWindow.loadFile(path.join(__dirname, 'login.html'))
    loginopen = true
    logincallback = false
  }

  loginWindow.webContents.on('did-finish-load', () => {
    let message = authInfo.isProxy ? `The proxy ${authInfo.host} is requesting your username and password.` : `The site ${authInfo.host} is requesting your username and password.`
    loginWindow.webContents.send('set-proxy-info', message)
  })

  loginWindow.on('closed', () => {
    loginWindow = null
    loginopen = false
  })
  loginWindow.on("lost-focus", () => {
    loginWindow.close()
    loginopen = false

  })
  ipcMain.on('submit-credentials', (event, username, password) => {
    if(!logincallback){
      callback(username, password)
      logincallback = true
      mainWindow.webContents.send('proxysignedin')
    }
    
    loginWindow.close()
  })
})

ipcMain.on('get-favicon', async (event, url) => {
  // call the getWebsiteFavicon function here
  const result = await getWebsiteFavicon(url)
  request.get(result.icons[0].src, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        data = "data:" + response.headers["content-type"] + ";base64," + Buffer.from(body).toString('base64');
        event.sender.send('favicon-result', data)
        console.log(data);
    }
});
})
ipcMain.on('alert', async (event, text) => {
  // call the getWebsiteFavicon function here
  dialog.showMessageBox({message:text})
  console.log(text)
});
ipcMain.on('close', () => {
  mainWindow.close()
})
ipcMain.on('min', () => {
  mainWindow.minimize()
})
ipcMain.on('minmax', () => {
  if(mainWindow.isMaximized()){
    mainWindow.unmaximize()
  } else{
    mainWindow.maximize()
  }
})