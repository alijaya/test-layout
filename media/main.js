const vscode = acquireVsCodeApi();

/** @type {HTMLInputElement} */
var pathInput = document.getElementById('pathInput');
var addButton = document.getElementById('addButton');
var imageList = document.getElementById('imageList');

addButton.addEventListener('click', () => {
  loadImage(pathInput.value);
});

function loadImage(path) {
  var img = document.createElement('img');
  img.src = path;
  imageList.appendChild(img);
}

window.addEventListener('message', event => {
  const message = event.data;
  switch (message.command) {
    case 'loadImage':
      loadImage(message.path);
      break;
  }
})