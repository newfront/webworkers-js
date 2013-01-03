var Context = {
	current: 0,
	loops: 200,
	multi: function (cb) {
		var offset;
		while (Context.loops >= 0) {
			offset = Context.current + Math.ceil(Math.random()*100) * 100;
			Context.current = offset;
			Context.loops -= 1;
		}
		cb(offset);
	}
};
self.addEventListener('message', function (event) {

	var data = event.data,
		timeout = Math.ceil(Math.random()*100) * 100; // can create a large number!

		switch (data.cmd) {

			case "start":
			self.postMessage({
				type: "info",
				message: "WebWorker (" + data.id+ ") will complete in " + timeout + " milliseconds"
			});
			setTimeout( function () {
				self.postMessage({
					type: "response",
					action: "close",
					message: "WebWorker Complete",
					payload: [{
						title: "Me",
						meta: "me.me.me"
					}]
				});
			}, timeout);
			
			break;

			case "recursive":
				self.postMessage({
					type: "info",
					message: "Context.mulit fired will run 200 loop"
				});
				Context.multi(function (value) {
					self.postMessage({
						type: "response",
						action: "close",
						message: "recursive value is " + value,
						payload: [{
							title: "Context.mulit offset is " + value,
							meta: "Context.mulit finished 200 loops"
						}]
					});
				});
				break;

			case "stop":
			self.postMessage("Worker Stopped");
			self.close();
			break;

			default:
				self.postMessage("Unknown Command");
				break;
		}

	}, false);