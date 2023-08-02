// TODO:
// [] Make tab names change
// [] Add favicons to tabs
//

// Importing required modules   
const { ipcRenderer, remote } = require('electron')

// Declaring global variables
var searchUrl = "https://you.com/search?q="
var newTabURL = "./newtab.html"
var totalWebviews = 1
var currentWebView = "#wbv1"
var inputIs;
let root = document.documentElement;
var settings =


// Adding window.alert function
window.alert = function(text){
    ipcRenderer.send('alert', text)
}

// Function to remove a tab
function removeTab(id){
    document.querySelector("#"+id).remove()
    document.querySelector("#"+id.replace("tab", "")).remove()
    if(document.querySelectorAll("webview").length == 1){document.querySelector("webview").classList.remove("notcurrent")}
}

// Function to add a new tab
function addTab(){
    totalWebviews = totalWebviews + 1;
    addthisview = document.createElement("webview")
    addthisview.src = newTabURL
    addthisview.id = "wbv" + totalWebviews.toString()
    addthisview.allowpopups = true
    addthisview.classList = ['mainView']
    document.querySelector(".mvDiv").appendChild(addthisview)
    addthistab = document.createElement("table")
    addthistab.id = `tabwbv${totalWebviews.toString()}`
    addthistab.classList = ["tab"]
    addthistab.innerHTML = `<tr><td class="tabTitle" onclick="changeTab('#wbv${totalWebviews.toString()}')">New Tab</td><td class="tabClose mso" onclick=""><button class="mso textualBtn" onclick="removeTab('tabwbv${totalWebviews.toString()}')">close</button></td></tr>`
    document.querySelector(".vtabs").appendChild(addthistab)
    changeTab("#wbv"+totalWebviews.toString())
}

// Function to check if a URL is valid
const isValidUrl = urlString => {
    try {
        return Boolean(new URL(urlString));
    }
    catch (e) {
        return false;
    }
}

// Function to check if the input is a URL or a search query
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
    
    // If the input is unknown, display options for search or URL
    if (inputIs == "unknown") {
        document.querySelector("#urlorsearch").innerHTML = "<option value='🔎 "+url+"'><option value='http://"+url+"'>"
        
    }
    
}

// Event listeners for the URL input field and fakebox
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
        console.log()
    }
});

// Function to update the title and favicon of the page
function titleFaviUpdate() {
    document.title = document.querySelector(currentWebView).getTitle() + " - 🔥 Flame Browser"
    document.querySelector("#fakeboxp").innerText = document.querySelector(currentWebView).getTitle()

}

// Function to update the page when web navigation occurs
function webNavigated() {
    titleFaviUpdate()
    document.querySelector("#url").value = document.querySelector(currentWebView).getURL()
    ipcRenderer.send('get-favicon', document.querySelector(currentWebView).getURL())
    if (document.querySelector(currentWebView).canGoBack()) {
        document.querySelector("#goBack").classList.remove("nonvis")
    }
    else {
        document.querySelector("#goBack").classList.add("nonvis")
    }
    if (document.querySelector(currentWebView).canGoForward()) {
        document.querySelector("#goForward").classList.remove("nonvis")
    }
    else {
        document.querySelector("#goForward").classList.add("nonvis")
    }
}

// Function to perform actions on the webview
function doWebViewAction(act) {
    if (act == "back") {
        document.querySelector(currentWebView).goBack()
    }
    else if (act == "forward") {
        document.querySelector(currentWebView).goForward()
    }
    else if (act == "reload") {
        document.querySelector(currentWebView).reload()
    }
}

// Function to update the theme
function themeUpdated(t) {
    root.style.setProperty('--siteColor', t.themeColor);
}

// Function to update the URL of the webview
function updateURL(e) {
    if(document.querySelector("#url").value.includes(" ")){
        document.querySelector(currentWebView).src = searchUrl + document.querySelector("#url").value
    } else if (document.querySelector("#url").value.includes("/")){
        if(document.querySelector("#url").value.startsWith("http://") || document.querySelector("#url").value.startsWith("https://")){
            document.querySelector(currentWebView).src = document.querySelector("#url").value    
        
        } else{
            document.querySelector(currentWebView).src = "http://" + document.querySelector("#url").value
        }
        
    } else{
        document.querySelector(currentWebView).src = searchUrl + document.querySelector("#url").value
    }
    
}

// Function to add event listeners to the current tab
// Function to add event listeners to the current tab
function tabEvents() {
    document.querySelector(currentWebView).addEventListener("did-navigate", webNavigated)
    document.querySelector(currentWebView).addEventListener("did-navigate-in-page", webNavigated)
    document.querySelector(currentWebView).addEventListener("did-redirect-navigation", webNavigated)
    document.querySelector(currentWebView).addEventListener("page-title-updated", titleFaviUpdate)
    document.querySelector(currentWebView).addEventListener("did-stop-loading", webNavigated)
    document.querySelector(currentWebView).addEventListener("did-frame-finish-load", webNavigated)
}

// Function to change the current tab
function changeTab(wbvid) {
    console.log(currentWebView)
    document.querySelector(currentWebView).removeEventListener("did-navigate", webNavigated)
    document.querySelector(currentWebView).removeEventListener("did-navigate-in-page", webNavigated)
    document.querySelector(currentWebView).removeEventListener("did-redirect-navigation", webNavigated)
    document.querySelector(currentWebView).removeEventListener("page-title-updated", titleFaviUpdate)
    document.querySelector(currentWebView).removeEventListener("did-stop-loading", webNavigated)
    document.querySelector(currentWebView).removeEventListener("did-frame-finish-load", webNavigated)
    
    for (const el of document.querySelectorAll("webview")) {
        el.classList.add("notcurrent")
    }
    
    currentWebView = wbvid
    document.querySelector(wbvid).classList.remove("notcurrent")
    document.querySelector(wbvid).style.display = "block !important"

    tabEvents()
    webNavigated()
    ipcRenderer.send('get-favicon', document.querySelector(currentWebView).getURL())
}

// Event listeners for proxy sign in and favicon result
ipcRenderer.on('proxysignedin', (event, host) => {
    document.querySelector(currentWebView).reload()
})
ipcRenderer.on('favicon-result', (event, result) => {
    // do something with result
    document.querySelector("#favi").src = result
    console.log(result)
})

document.DOMContentLoaded = function(){addTab()}
// There is no tab by default
