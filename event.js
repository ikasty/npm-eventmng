var eventlist = {};

exports.insert = (name, fn) => {
	if (!eventlist[name]) eventlist[name] = [];
	eventlist[name].push(fn);
};

var get = (fn, args) => {
	return new Promise((res, rej) => {
		args.push((err, result) => {
			if (err) rej(err);
			else res(result);
		});
		fn.apply(null, args);
	});
};

exports.chain = (name) => {
	var args = [].slice.call(arguments, 1);
	var callback = args.pop();

	if (typeof callback != 'function') return ;
	if (typeof eventlist[name] != 'array') {
		return callback("not found", false);
	}

	var queue = []
	eventlist[name].forEach((fn) => {
		queue.push(get(fn, args));
	});

	Promise.all(queue).then((result) => {
		callback(null, result);
	}).catch((error) => {
		callback(error);
	});
};

exports.call = (name) => {
	var args = [].slice.call(arguments, 1);

	if (typeof eventlist[name] != 'array') return ;

	args.push(()=>{}, ()=>{});
	eventlist[name].forEach((fn) => {
		fn.apply(null, args);
	});
};
