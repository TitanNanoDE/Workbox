/*****************************************************************
 * Base64 Lib v1.1  part of the ApplicationFrame                 *
 * © copyright by Jovan Gerodetti (TitanNano.de)                 *
 * The following Source is licensed under the Appache 2.0        *
 * License. - http://www.apache.org/licenses/LICENSE-2.0         *
 *****************************************************************/

export var b64 = {
    decode : function(string){
        var catalog= "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var buffer= new ArrayBuffer((string.length * 6) / 8);
        var viewer= new Int8Array(buffer);
        var counter= 0;
        var freeBytes= 0;
        if(string.match(/=/g) !== null){
            freeBytes= string.match(/=/g).length;
        }
        string.replace(/=/g, '');

        for(var i= 0; i < string.length; i+= 4){
            var x= (string[i] === '+') ? '\\+' : string[i];
            var oB1= catalog.search(x);
            x= (string[i+1] === '+') ? '\\+' : string[i+1];
            var oB2= catalog.search(x);
            x= (string[i+2] === '+') ? '\\+' : string[i+2];
            var oB3= catalog.search(x);
            x= (string[i+3] === '+') ? '\\+' : string[i+3];
            var oB4= catalog.search(x);


// ----------------------------- Handling original Byte 1 -----------------------------
            var nB1= oB1 << 2;

// ----------------------------- Handling original Byte 2 -----------------------------
            var cache= oB2 >> 4;
            nB1= nB1 | cache;

            var nB2= oB2 << 4;

// ----------------------------- Handling original Byte 3 & 4 -----------------------------
            cache= oB3 >> 2;
            nB2= nB2 | cache;

            var nB3= oB3 << 6;
            nB3= nB3 | oB4;


            viewer[counter]= nB1;
            counter++;
            viewer[counter]= nB2;
            counter++;
            viewer[counter]= nB3;
            counter++;
        }

        buffer= buffer.slice(0, buffer.byteLength - freeBytes);
        return buffer;
    }
};

export var config = {
    main : 'b64',
    version : '1.0',
    author : 'Jovan Gerodetti',
    name : 'Base 64 Library Module'
};
