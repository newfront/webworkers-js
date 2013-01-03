importScripts("http://yui.yahooapis.com/3.6.0/build/yui-core/yui-core-min.js");

YUI().use('event', 'json', function (Y) {

	self.console = {
		// fill in console.log so we can use in Web Worker
		log: function (message, type) {
			self.postMessage({
				type: type || "info",
				message: message || ""
			});
		},
		error: function (message) {
			self.console.log(message, "error");
		}
	};

	// xmlhttprequest
	self.createRequest = function createRequest(method, url, cors) {
		var xhr = new self.XMLHttpRequest();

		if (xhr) {
			xhr.hasCORS = false;

			if (cors) {
				if ("withCredentials" in xhr) {
					xhr.hasCORS = true;
					xhr.open(method, url, true);
				} else if (typeof XDomainRequest !== "undefined") {
					// syncronus in IE... I know
					xhr = new XDomainRequest();
					xhr.open(method, url);
				}
			} else {
				xhr.open(method, url, true);
			}
		}
		return xhr;
	};

	self.makeRequest = function (config, payload) {
		// params.method
		// params.url
		// params.payload
		var xhr = self.createRequest(config.method, config.url, config.cors);

		if (!xhr) {
			self.console.error("XMLHttpRequest v2 not defined");
			return;
		}

		if (config.cors && xhr.hasCORS) {
			//xhr.withCredentials = true;
		}

		if (config.headers) {
			//xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		}
		
		xhr.onload = function (e) {
			var responseText = xhr.responseText;
			// config.type = ['script', 'data', 'image']
			//self.console.log(responseText, config.type);
			self.postMessage({
				type: "script",
				payload: responseText
			});
		}

		xhr.onerror = function (e) {
			self.console.error(JSON.stringify(e));
			self.console.error("Error with XHR");
		}

		if (config.method === "POST") {
			xhr.send(payload);
		} else {
			xhr.send();
		}
	};

	self.addEventListener("message", function (e) {
		switch (e.data.type) {
			
			case "url-request":
				self.makeRequest(e.data.config, e.data.payload);
				break;
		}
	}, false);
});