this.$$ = this;
var { $_ }= $$.require('af/core');

$_('addon').hook($$);

$_('addon').modules({
    'self' : $$.require('sdk/self'),
    'window' : $$.require('sdk/window/utils'),
    'worker' : $$.require('sdk/content/worker'),
    'timers' : $$.require('sdk/timers')
});

$_('addon').module(function(){
    
    var { setTimeout }= $_('timers');
    var { Worker } = $_('worker');
    
    $$.exports.Window= function(options){
        this.options= options;
		this._window= null;
    };
    
    $$.exports.Window.prototype= {
        port : {
			_queue : [],
			_worker : null,
            on : function(){
                if(!this._worker)
                    this._queue.push(arguments);
                else
                    this._worker.port.on.apply(this._worker.port, arguments);
            },
            emit : function(){
                if(!this._worker)
                    return false;
                else       
                    return this._worker.port.emit.apply(this._worker.port, arguments);
            }
        },
        open : function(){
		    var activeBrowserWindow= $_('window').getMostRecentBrowserWindow();    
            var features= {
                height : this.options.height,
                width : this.options.width,
                left: activeBrowserWindow.screenX + (activeBrowserWindow.outerWidth / 2) - (this.options.width / 2),
                top: activeBrowserWindow.screenY + (activeBrowserWindow.outerHeight / 2) - (this.options.height / 2),
                chrome : !this.options.webView,
                titlebar : !this.options.popup,
                alwaysRaised : this.options.modal,
                minimizable : !this.options.popup
            };
            
//          open window
            var window= $_('window').open(this.options.url, { name : this.options.title, features : features });
			this._window= window;
            
//          hide popup form taskbar
//          if(options.popup)
//              $_('window').backgroundify(this._window, { close : true });
        
//          create communication
                var self= this;
            setTimeout(function(){
                self.port._worker= new Worker({
                    window : window,
                    contentScriptFile : self.options.contentScriptFile
                });
                self.port._queue.forEach(function(item){
					self.port.on.apply(self.port, item);
                });
            }, 1);
        },
		close : function(){
			this._window.close();
		}
    };
});
