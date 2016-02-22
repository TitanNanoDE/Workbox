
var $$= this;
var { $_ }= $$.require('af/core');

$_('addon').hook($$);

$_('addon').modules({
    'globalPrefs' : $$.require('sdk/preferences/service'),
    'self' : $$.require('sdk/self')
});

$_('addon').module(function(){
    var prefName= 'extensions.'+$_('self').id+'.sdk.console.logLevel';
    this.enabled= function(value){
        var status= (value) ? 'debug' : 'error';
        $_('globalPrefs').set(prefName, status);
    };
});
