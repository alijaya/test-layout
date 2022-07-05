import { createApp } from "vue";
import App from "./App.vue";
import { Vscode, WebviewData } from "./vscode.web";

const vscode = new Vscode();
const webviewData = new WebviewData(vscode);
webviewData.$activate();
const app = createApp(App);
app.provide("vscode", vscode);
app.provide("webviewData", webviewData);
app.mount("#app");
