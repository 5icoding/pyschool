/* eslint-env browser */

// @ts-ignore
import CodeMirror from 'codemirror'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { CodemirrorBinding } from 'y-codemirror'
// import 'codemirror/mode/javascript/javascript.js'

import 'codemirror/mode/python/python.js'

import axios from 'axios'

window.addEventListener('load', () => {
  const ydoc = new Y.Doc()
  const provider = new WebsocketProvider(
    'wss://demos.yjs.dev',
    'codemirror-demo-2',
    ydoc
  )
  const ytext = ydoc.getText('codemirror')

  // const editorContainer = document.createElement('div')
  // editorContainer.setAttribute('id', 'editor')

  const editorContainer = /** @type {HTMLElement} */ (document.getElementById('editor-div'))
  document.body.insertBefore(editorContainer, null)
  
  document.body.insertBefore(editorContainer, null)

  const editor = CodeMirror(editorContainer, {
    mode: 'python',
    lineNumbers: true
  })
  editor.setSize(600,500)
  const binding = new CodemirrorBinding(ytext, editor, provider.awareness)

  const connectBtn = /** @type {HTMLElement} */ (document.getElementById('y-connect-btn'))
  connectBtn.addEventListener('click', () => {
    if (provider.shouldConnect) {
      provider.disconnect()
      connectBtn.textContent = 'Connect'
    } else {
      provider.connect()
      connectBtn.textContent = 'Disconnect'
    }
  })

  const saveBtn = /** @type {HTMLElement} */ (document.getElementById('save-btn'))
  saveBtn.addEventListener('click', () => {
    alert('save')
    let code = editor.getValue()
    console.log(code)
    let data = {'code':code}
    axios.post('/api/class/save', data,
    { headers: { "Content-Type": "application/json; charset=UTF-8" } })
    .then(function(response){
      console.log(response.data);
      alert(response.data['result']);
    })
    .catch(function(error){
      console.log(error);
    });
  })

  const outDiv = /** @type {HTMLElement} */ (document.getElementById('out-div'))
  document.body.insertBefore(outDiv, null)

  const runBtn = /** @type {HTMLElement} */ (document.getElementById('run-btn'))
  runBtn.addEventListener('click', () => {
    let code = editor.getValue()
    console.log(code)
    let data = {'code':code}
    axios.post('/api/exec2', data,
    { headers: { "Content-Type": "application/json; charset=UTF-8" } })
    .then(function(response){
      console.log(response.data);
      outDiv.innerHTML = response.data['result'].replace(/\n/g,"<br>");
    })
    .catch(function(error){
      console.log(error);
    });
  })


  // @ts-ignore
  window.example = { provider, ydoc, ytext, binding, Y }
})
