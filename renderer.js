/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

var searchUrl = "https://you.com/search?q="
var inputIs;
const { ipcRenderer, remote } = require('electron')
let root = document.documentElement;
function alert(text){
    ipcRenderer.send('alert', text)
}
const isValidUrl = urlString => {
    try {
        return Boolean(new URL(urlString));
    }
    catch (e) {
        return false;
    }
}

function urlInputted(url) {
    inputIs = "";
    if (url.includes(" ")) {
        inputIs = "search"
    }
    else if (url.includes("/")) {
        inputIs = "url"
    }
    else {
        inputIs = "unknown"
    }
    if (inputIs == "unknown") {
        document.querySelector("#urlorsearch").innerHTML = "<option value='🔎 "+url+"'><option value='http://"+url+"'>"
        alert("AAAH")
    }
    alert("AAAH")
}

document.querySelector("#url").addEventListener("oninput", function () { urlInputted(document.querySelector("#url").value) })
document.querySelector("#fakebox").addEventListener("mouseover", function () { 
    document.querySelector("#url").style.display = "block";
    document.querySelector("#fakebox").style.display = "none";
})
document.querySelector("#url").addEventListener("blur", function () {
    document.querySelector("#url").style.display = "none";
    document.querySelector("#fakebox").style.display = "block";
})
document.querySelector("#url").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        updateURL()
        alert()
        console.log()
    }
  });
webviewID = "#wbv1"
function titleFaviUpdate() {
    document.title = document.querySelector(webviewID).getTitle() + " - 🔥 Flame Browser"
    document.querySelector("#fakeboxp").innerText = document.querySelector(webviewID).getTitle()

}
function webNavigated() {
    titleFaviUpdate()
    document.querySelector("#url").value = document.querySelector(webviewID).getURL()
    ipcRenderer.send('get-favicon', document.querySelector(webviewID).getURL())
    if (document.querySelector(webviewID).canGoBack()) {
        document.querySelector("#goBack").classList.remove("nonvis")
    }
    else {
        document.querySelector("#goBack").classList.add("nonvis")
    }
    if (document.querySelector(webviewID).canGoForward()) {
        document.querySelector("#goForward").classList.remove("nonvis")
    }
    else {
        document.querySelector("#goForward").classList.add("nonvis")
    }
}

function doWebViewAction(act) {
    if (act == "back") {
        document.querySelector(webviewID).goBack()
    }
    else if (act == "forward") {
        document.querySelector(webviewID).goForward()
    }
    else if (act == "reload") {
        document.querySelector(webviewID).reload()
    }
}

function themeUpdated(t) {
    root.style.setProperty('--siteColor', t.themeColor);
}

function updateURL(e) {
    if(document.querySelector("#url").value.includes(" ")){
        document.querySelector(webviewID).src = searchUrl + document.querySelector("#url").value
    } else if (document.querySelector("#url").value.includes("/")){
        if(document.querySelector("#url").value.startsWith("http://") || document.querySelector("#url").value.startsWith("https://")){
            document.querySelector(webviewID).src = document.querySelector("#url").value    
        
        } else{
            document.querySelector(webviewID).src = "http://" + document.querySelector("#url").value
        }
        
    } else{
        document.querySelector(webviewID).src = searchUrl + document.querySelector("#url").value
    }
    
}
function tabEvents() {
    document.querySelector(webviewID).addEventListener("did-navigate", webNavigated)
    document.querySelector(webviewID).addEventListener("did-navigate-in-page", webNavigated)
    document.querySelector(webviewID).addEventListener("did-redirect-navigation", webNavigated)
    document.querySelector(webviewID).addEventListener("page-title-updated", titleFaviUpdate)
    document.querySelector(webviewID).addEventListener("did-stop-loading", webNavigated)
    document.querySelector(webviewID).addEventListener("did-frame-finish-load", webNavigated)
    document.querySelector(webviewID).hidden = false
}
function changeTab(wbvid) {
    document.querySelector(webviewID).removeEventListener("did-navigate", webNavigated)
    document.querySelector(webviewID).removeEventListener("did-navigate-in-page", webNavigated)
    document.querySelector(webviewID).removeEventListener("did-redirect-navigation", webNavigated)
    document.querySelector(webviewID).removeEventListener("page-title-updated", titleFaviUpdate)
    document.querySelector(webviewID).removeEventListener("did-stop-loading", webNavigated)
    document.querySelector(webviewID).removeEventListener("did-frame-finish-load", webNavigated)
    document.querySelector(webviewID).hidden = true
    webviewID = wbvid
    tabEvents()
}


document.querySelector("#updateURL").addEventListener("click", updateURL)
document.querySelector("#goForward").addEventListener("click", function () { doWebViewAction("forward") })
document.querySelector("#goBack").addEventListener("click", function () { doWebViewAction("back") })
document.querySelector("#reload").addEventListener("click", function () { doWebViewAction("reload") })
tabEvents()
/** SNIPETS
document.querySelector(webviewID).goBack()
document.querySelector(webviewID).goForward()
document.querySelector(webviewID).addEventListener("")
document.querySelector(webviewID).canGoForward()
document.querySelector(webviewID).reload()
document.querySelector(webviewID).addEventListener("did-navigate", function(){
    document.querySelector("#url").value = document.querySelector(webviewID).src
})
*/
ipcRenderer.on('proxysignedin', (event, host) => {
    document.querySelector(webviewID).reload()
})
ipcRenderer.on('favicon-result', (event, result) => {
    // do something with result
    document.querySelector("#favi").src = result
    console.log(result)
})
