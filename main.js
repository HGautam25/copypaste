const electron = require('electron')
const path = require('path')
const { app, clipboard, globalShortcut, Menu, Tray } = electron
const STACK_LENGTH = 5
const ITEM_MAX_LENGTH=20 
function addToStack(item, stack) {
  if (stack.indexOf(item) == -1) {
    return [item].concat(stack.length >= STACK_LENGTH ? stack.slice(0, stack.length - 1) : stack)
  }
  else {
    return stack 
  }
}
function formatItem(item) {
  return item && item.length > ITEM_MAX_LENGTH ? item.substr(0, ITEM_MAX_LENGTH) + '...' : item    
}
function formatMenuTemplateForStack(clipboard,stack) {
  return stack.map((item, i) => {
    return {
      label: `Ctrl+${i+1} : ${formatItem(item)}`,
      click: _ => clipboard.writeText(item),
      accerlerator:`Ctrl+${i+1}`
    }
  })
}
function registerShortcuts(globalShortcut, clipboard, stack) {
  globalShortcut.unregisterAll()
  for (let i = 0; i < STACK_LENGTH; ++i){
    globalShortcut.register(`Ctrl+${i + 1}`,_=>{
      clipboard.writeText(stack[i])
    })
  }
}
function checkClipBoardForChange(clipboard,onchange) {
  let latest
  let cache = clipboard.readText()
  setInterval(_ => {
    latest = clipboard.readText()
    if (latest != cache) {
      cache = latest
      onchange(cache)
    }
  },1000)
}
app.on('ready', _ => {
  let stack=[]
  const tray = new Tray(path.join('trayIcon.png'))
  tray.setContextMenu(Menu.buildFromTemplate([{ label: '<Empty>', enabled:false }]))
  
  checkClipBoardForChange(clipboard, text => {
    stack = addToStack(text, stack)
    tray.setContextMenu(Menu.buildFromTemplate(formatMenuTemplateForStack(clipboard, stack)))
    registerShortcuts(globalShortcut,clipboard,stack)
  })
})
