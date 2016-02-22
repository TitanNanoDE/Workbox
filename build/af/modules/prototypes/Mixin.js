export default function (prototypes) {

    return new Proxy(prototypes, {
        get : function(prototypes, key){
            var prototype = Object.keys(prototypes)
                .map(key => parseInt(key))
                .sort((a, b) => {　return a > b; }).find(p => {
                    return prototypes[p][key];
            });

            return prototypes[prototype][key];
        }
    });

}
