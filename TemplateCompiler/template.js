if (!HTMLElement.prototype.__tcA) { HTMLElement.prototype.__tcA = function(c) { c.apply(this); return this; }};const template = document.createElement('template').__tcA(function(){this.content.appendChild(document.createElement('style')).__tcA(function(){this.setAttribute('media', 'screen');}).appendChild(document.createTextNode('.window.mainWindow {height: 400px;width: 600px;left: 0px;top: 0px;background-color: #ccc6c6;border-radius: .5rem;box-shadow: .1rem .1rem .7rem rgba(0,0,0,.5);display: flex;flex-direction: column;}.window > .windowTitle {position: relative;padding: .8rem;}.window > .windowTitle:active {cursor: -webkit-grabbing;cursor: grabbing;}.window > .windowTitle .title {align-items: center;justify-content: center;display: flex;left: 50%;position: absolute;top: 0;bottom: 0;font-size: 1.4rem;transform: translateX(-50%);}.window > .windowTitle .action {border-radius: 50%;height: 1em;width: 1em;font-size: 1.2rem;display: inline-block;margin-right: .3rem;position: relative;}.window > .windowTitle .action.close {background-color: red;}.window > .windowTitle .action.hide {background-color: orange;}.window > .windowTitle .action.max {background-color: limegreen;}.window > .windowTitle .action.close:hover::after {position: absolute;left: 0;top: 0;content: \'x\';font-size: 1.2rem;display: flex;right: 0;bottom: 0;justify-content: center;align-items: center;cursor: pointer;user-select: none;-moz-user-select: none;}.mainWindow > .view-port-container {flex: 1 1 auto;position: relative;overflow: auto;margin: 0 .8rem .8rem;}')).parentNode.parentNode.appendChild(document.createElement('div')).__tcA(function(){this.setAttribute('class', 'window mainWindow');this.setAttribute('style', '{{calculateStyle()}}');}).appendChild(document.createElement('div')).__tcA(function(){this.setAttribute('class', 'windowTitle');this.setAttribute('bind-event_mousedown_', 'windowDrag.grab');this.setAttribute('bind-event_mouseup_', 'windowDrag.drop');}).appendChild(document.createElement('div')).__tcA(function(){this.setAttribute('class', 'title');}).appendChild(document.createTextNode('{{name}}')).parentNode.parentNode.appendChild(document.createElement('div')).__tcA(function(){this.setAttribute('class', 'actions');}).appendChild(document.createElement('span')).__tcA(function(){this.setAttribute('class', 'action close');this.setAttribute('bind-events', '{click:closeWindow}');}).parentNode.appendChild(document.createElement('span')).__tcA(function(){this.setAttribute('class', 'action hide');}).parentNode.appendChild(document.createElement('span')).__tcA(function(){this.setAttribute('class', 'action max');}).parentNode.parentNode.parentNode.appendChild(document.createElement('div')).__tcA(function(){this.setAttribute('class', 'view-port-container');}).appendChild(document.createElement('view-port')).__tcA(function(){this.setAttribute('scope-name', '{{id}}');}).parentNode.parentNode.parentNode}); export default template; export { template };