/*****************************************************************
 * net.js v0.2  part of the ApplicationFrame                     *
 * © copyright by Jovan Gerodetti (TitanNano.de)                 *
 * The following Source is licensed under the Appache 2.0        *
 * License. - http://www.apache.org/licenses/LICENSE-2.0         *
 *****************************************************************/

'use strict';

var $$= (typeof global != 'undefined') ? global : window;

var encode= function(text){
    text= $$.encodeURIComponent(text);

    text= text.replace(/\!/g, '%21');
    text= text.replace(/\~/g, '%7E');
    text= text.replace(/\*/g, '%2A');
    text= text.replace(/\'/g, '%27');
    text= text.replace(/\(/g, '%28');
    text= text.replace(/\)/g, '%29');

    return text;
};

var apply= (update, target) => $$.Object.keys(update).forEach(key => target[key]= update[key]);

var createOAuthSignature= function(header, data, method, url, secred, tokenSecred){
    var hash= {};
    var raw= '';
    var base= '';

    $$.Object.keys(header).forEach(item => hash[encode(item)]= encode(header[item]));

    if(data) $$.Object.keys(data).forEach(key => hash[encode(key)]= encode(data[key]));

    raw= $$.Object.keys(hash).sort().map(item => item+'='+hash[item]).join('&');

    base+= method + '&' + encode(url) + '&' + encode(raw);
    var key= secred + '&' + tokenSecred;

//  console.log(raw);
//  console.log(base);
//  console.log(key);

    hash= $$.CryptoJS.HmacSHA1(base, key);

    return $$.btoa(hash.toString($$.CryptoJS.enc.Latin1));
};

var createOAuthHeader= function(object){
    return 'OAuth ' + $$.Object.keys(object).sort().map(item => item+'="'+ encode(object[item]) +'"').join(',');
};

var createOAuthNonce= function(){
    var nonce= '';
    for(var i= 0; i <= 32; i++){
        nonce+= $$.String.fromCharCode(Math.round(Math.random() * 25) + 97);
    }
    return $$.btoa(nonce);
};

var socketPrivateStorage= new $$.WeakMap();

var Socket = {

    _make : function(type, url, options){
        socketPrivateStorage.set(this, {
            type : type,
            url : url,
            lastMessage : null,
            open : false,
            options : options
        });
    },

    get url(){
        return socketPrivateStorage.get(this).url;
    },

    get lastMessage(){
        return socketPrivateStorage.get(this).lastMessage;
    },

    get open(){
        return socketPrivateStorage.get(this).open;
    },

    push : function(message, headers){
        var self= socketPrivateStorage.get(this);
        var selfPublic= this;
        var xhr= new $$.XMLHttpRequest(this._options);

        return new Promise(((setValue, setError) => {
            xhr.onreadystatechange= function(){
                if(this.readyState == 4){
                    if(this.status == 200){
                        setValue(this.responseText);
                    }else{
                        setError({status : this.status, statusText : this.statusText});
                    }
                    self._lastMessage= this.statusText;
                }
            };

            apply(headers, this.headers);
            Object.keys(this.headers).forEach(key => xhr.setRequestHeader(key, selfPublic.headers));

            if(self.type == SocketFlags.HTTP_POST){
                xhr.open('POST', self.url, true);
                xhr.send(message);
            }else if(self.type == SocketFlags.HTTP_GET){
                xhr.open('GET', self.url + '?' + message, true);
                xhr.send();
            }
        }).bind(this));
    },

    request : function(url, message, headers){
        var self = socketPrivateStorage.get(this);
        var selfPublic = this;
        var xhr = new $$.XMLHttpRequest(this.options);

        return new Promise((setValue, setError) => {
            xhr.onreadystatechange= function(){
                if(this.readyState == 4){
                    if(this.status == 200){
                        setValue(this.responseText);
                    }else{
                        setError({status : this.status, statusText : this.statusText});
                    }
                    self.lastMessage= this.statusText;
                }
            };

            apply(headers, selfPublic.headers);
            $$.Object(selfPublic.headers).forEach(key => xhr.setRequestHeader(key, selfPublic.headers));

            if(self.type == SocketFlags.HTTP_POST){
                xhr.open('POST', self.url + url,  true);
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
                xhr.send(message);
            }else if(self.type == SocketFlags.HTTP_GET){
                xhr.open('GET', self.url + url + (message ? '?' + message : ''), true);
                xhr.send();
            }
        });
    }
};

var SocketFlags = {
    HTTP_GET : 'http_get',
    HTTP_POST : 'http_post',
    HTTP : 'http_post'
};

var oauthsocketStorage= new $$.WeakMap();

var OAuthSocket = {

    _make : function(id, host, key, secred, options){
        oauthsocketStorage.set(this, {
            host : host,
            key : key,
            options : options,
            secred : secred,
            id : id,
            token : $$.localStorage.getItem('af.oauth.'+ id +'.token') || '',
            tokenSecred : $$.localStorage.getItem('af.oauth.'+ id +'.tokenSecred') || ''
        });

        this._make = null;
    },

    post : function(endpoint, data){
        var self= oauthsocketStorage.get(this);

        return new $$.Promise(function(success, failed){
            var response= (new OAuthRequest('POST', endpoint, data, self)).send();
            response.then(function(data){
                success(data.responseText);
            });
            response.catch(failed);
        });
    },

    get : function(endpoint, data){
        var self= oauthsocketStorage.get(this);

        return new $$.Promise(function(success, failed){
            var response= (new OAuthRequest('GET', endpoint, data, self)).send();
            response.then(function(data){
                success(data.responseText);
            });
            response.catch(failed);
        });
    },

    download : function(url, onprogress){
        var self= oauthsocketStorage.get(this);

        return new $$.Promise(function(success, failed){
            var request= new OAuthRequest('GET', url, null, self);
            request.responseType= 'blob';
            request.addQuery= false;
            request.send().then(function(data){
                success(data.response);
            }, failed);
        });
    },

    upload : function(url, blob, onprogress){
        var self= oauthsocketStorage.get(this);

        return new $$.Promise(function(success, failed){
            var data= new $$.FormData();
            data.append('media', blob);
            var request= new OAuthRequest('POST', url, data, self);
            request.useDataInSignature= false;
            request.encodeData= false;
            request.addQuery= false;
            request.send(onprogress).then(function(data){
                success(data.responseText);
            }, failed);
        });
    },

    requestToken : function(endpoint, callback_url){
        var self= oauthsocketStorage.get(this);

        return new $$.Promise(function(success, failed){
            var request= new OAuthRequest('POST', endpoint, null, self);
            request.oauthHeader.oauth_callback= callback_url;

            request.send().then(function(data){
                data= data.responseText.split('&');
                self._token= data[0].split('=')[1];
                self._tokenSecred= data[1].split('=')[1];

                success();
            }, failed);
        });
    },

    verify : function(endpoint, verifier){
        var self= oauthsocketStorage.get(this);

        return new $$.Promise(function(success){
            var request= new OAuthRequest('POST', endpoint, null, self);

            request.oauthHeader.oauth_verifier= verifier;
            request.send().then(function(data){
                var { token, secred, info } = data.responseText.split('&').map(item => item.split('=')[1]);
                self.token= token;
                self.tokenSecred= secred;

                $$.localStorage.setItem('af.oauth.'+ self.id +'.token', self.id);
                $$.localStorage.setItem('af.oauth.'+ self.id +'.tokenSecred', self.id);

                success(info);
            });
        });
    },

    authenticate : function(endpoint){
        var self= oauthsocketStorage.get(this);
        $$.open(self.host + endpoint + '?oauth_token=' + self.token);
    },

    isLoggedIn : function(){
        return (oauthsocketStorage.get(this).token !== '');
    },

    exposeToken : function(){
        var self= oauthsocketStorage.get(this);
        return [self.token, this.tokenSecred];
    }
};

var oauthrequestStorage= new $$.WeakMap();

var OAuthRequest = {

    _make : function(method, url, data, client, addQuery){
        var selfP= oauthrequestStorage.set(this, {
            client : client,
            data : data,
            method : method
        });

        this.oauthHeader= {
            'oauth_consumer_key' : client.key,
            'oauth_nonce' : createOAuthNonce(),
            'oauth_signature_method' : 'HMAC-SHA1',
            'oauth_timestamp' : $$.parseInt($$.Date.now().toString()) / 1000,
            'oauth_version' : '1.0'
        };
        this.headers= {};
        url= new URL(url);
        if(url.host === ''){
            url.host= client.host;
        }
        selfP.url= url.href;
        if(client.token !== '') this.oauthHeader.oauth_token= client.token;
    },

    send : function(onUploadProgress, onDownloadProgress){
        var self= this;
        var selfP= oauthrequestStorage.get(this);
        var dataGet= '';
        var dataPost= '';
        var xhr= new $$.XMLHttpRequest(selfP.client.options);

        this.oauthHeader.oauth_signature= createOAuthSignature(this.oauthHeader, (this.useDataInSignature ? selfP.data : null), selfP.method, selfP.url, selfP.client.secred, selfP.client.tokenSecred);

        if(selfP.data && !(selfP.data instanceof $$.FormData)){
            $$.Object.keys(selfP.data).forEach(function(item){
                if(dataGet.length > 0) dataGet+= '&';
                if(dataPost.length > 0) dataPost+= '&';

                dataPost+= item + '=' + self._data[item];
                dataGet+= item + '=' + encode(self._data[item]);
            });
        }else if(selfP.data instanceof $$.FormData){
            dataPost= selfP.data;
        }

        if(dataGet !== '' && this.addQuery)
            xhr.open(selfP.method, selfP.url + '?' + dataGet, true);
        else
            xhr.open(selfP.method, selfP.url, true);

        xhr.setRequestHeader('Authorization', createOAuthHeader(this.oauthHeader));

        Object.keys(this.headers).forEach(key => xhr.setRequestHeader(key, self.headers[key]));

        if(this.responseType !== '') xhr.responseType= this.responseType;

        if(onUploadProgress) xhr.upload.onprogress= onUploadProgress;

        if(onDownloadProgress) xhr.onprogress= onDownloadProgress;

        return new $$.Promise(function(success, failed){
            xhr.onreadystatechange= function(){
                if(this.readyState == 4){
                    if(this.status == 200){
                        success(this);
                    }else{
                        var error= null;

                        try{
                            error= JSON.parse(this.responseText);
                        }catch(e){
                            error= { status : this.responseText };
                        }

                        failed({
                            status : this.status +' - ' + this.statusText,
                            error : error,
                            nextTry : this.getResponseHeader('X-Rate-Limit-Reset'),
                            remainingTrys : this.getResponseHeader('x-rate-limit-remaining')
                        });
                    }
                }
            };

            if(selfP.method == 'POST')
                xhr.send((this.encodeData ? dataGet : dataPost));
            else
                xhr.send();
        });
    }
};

var request= function(url, options){
    return new Promise(function(okay, fail){
        var xhr= new $$.XMLHttpRequest(options);
        xhr.onreadystatechange= function(){
            if(this.readyState == 4){
                if(this.status == 200)
                    okay(this.responseText);
                else
                    fail({ status : this.status, statusText : this.statusText });
            }
        };
        xhr.open('GET', url, true);
        xhr.send();
    });
};

var require= function(url){
    var xhr= new $$.XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send();
    if(xhr.status == 200)
        return xhr.responseText;
    else
        return null;
};

export var net = {
    Socket : Socket,
    OAuthSocket : OAuthSocket,
    request : request,
    require : require
};

export var config = {
    main : 'net',
    version : '1.0',
    author : 'Jovan Gerodetti',
    name : 'Network Interfaces Module'
};
