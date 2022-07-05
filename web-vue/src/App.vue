<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from "./components/HelloWorld.vue";
import { ref, inject } from "vue";
import { Vscode, WebviewData } from "./vscode.web";

const webviewData = inject<WebviewData>("webviewData");
const vscode = inject<Vscode>("vscode");
const msg = ref("ali");

function getExtensionPath() {
  msg.value = webviewData?.extensionPath ?? "";
}

async function selectFile() {
  const response = await vscode?.showOpenDialog({ canSelectFiles: true });
  msg.value = response?.data[0];
}

function alert() {
  vscode?.showMessage({ txt: "This is alert!" });
}

function output() {
  vscode?.showTxt2Output({ txt: "This is Output Dialog" });
}
</script>

<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="Hello Vue 3 + TypeScript + Lie" />
  <button @click="getExtensionPath">Get Extension Path</button>
  <button @click="selectFile">Select File</button>
  <button @click="alert">Alert</button>
  <button @click="output">Output</button>
  <div>{{ msg }}</div>
</template>

<style>
/* #app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
} */
</style>
