export var objectExtend = function(update){

    Object.keys(update).forEach(item => {
		if(typeof update[item] == 'object' && !Array.isArray(update[item]) && update[item] !== null)
			objectExtend.apply(this[item], [update[item]]);
		else
			this[item]= update[item];
	});
};

export var cloneObject= function(object){
	return JSON.parse(JSON.stringify(object));
};

// this function creates a new unique id
export var createUniqueId= function(){
	var time = Date.now();
	while (time == Date.now()){}
	return Date.now();
};
