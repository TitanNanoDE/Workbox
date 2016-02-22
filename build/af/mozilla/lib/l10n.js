
this.$$= this;
var { $_ }= $$.require('af/core');

$_('addon').hook($$);

$_('addon').modules({
    'self' : $$.require('sdk/self'),
    'sdk-l10n' : $$.require('sdk/l10n'),
});

$_('addon').module(function(){
    var defaultStrings= null;
	var ready= false;
	var queue= [];
    
    this.setup= function(str){
        defaultStrings= str;
		ready= true;
		var self= this;
		queue.forEach(function(item){
			self.localize(item);
		});
    };
    
    this.localize= function(worker){
		if(ready){
			$_('addon').talkTo(worker).listen('l10n', function(string, answert){
				var trans= $_('sdk-l10n').get(string);
				if(trans != string)
					answert(trans);
				else
					answert(defaultStrings[string]);
			});
    	}else{
			queue.push(worker);
		}
	};
});