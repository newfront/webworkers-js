/**
 * WebWorker queue 
 */

/**
 * @class WebWorkerQueue
 * @constructor
*/
var WebWorkerQueue = function (config) {
	var that = this,
		default_config = {
			worker_pool: 4,
			queue: [];
		};

	that.config = Y.merge(default_config, config);

	// worker_poll let's us have a specific number of tasks running before we being to queue up tasks
	
	// queue is a standard FIFO queue

	return that;
};


/**
 * User can add more tasks to the queue
 *
 * @method add
 * @param params {Object} Stores the configuration for your task
 *   @param params.method_uri {String} Is the uri of the script to run
 *   @param params.callback {Function} Is the callback to run when this task is completed
*/ 
WebWorkerQueue.prototype.add = function (params) {
	var passed = this.validate_queue_object(params);
	if (!Y.Lang.isArray(passed)) {
		console.log("can add this task. validation came back with no errors");
	} else {
		console.log("validation failed");
		console.log(passed);
	}
};

/**
 * Validate that the config object has a method_uri and a callback
*/
WebWorkerQueue.prototype.validate_queue_object = function (config) {
	var error = false,
		errors = [];

	if (!config) {
		error = true;
		errors.push({name: "ArgumentError", message: "Your config object is undefined"});
		return errors;
	}

	if (!config.method_uri) {
		error = true;
		errors.push({name: "ArgumentError", message: "You are missing your method_uri. This is the path to the Web Worker script to run"});
		return errors;
	}

	if (!config.callback || typeof config.callback !== "function") {
		error = true;
		errors.push({name: "ArgumentError", message: "You are missing the callback method to run when the WebWorker completes"});
		return errors;
	}

	return error;
};

/**
 * When you want to start running the tasks in the queue, call run and it will run through the items in the Queue
*/
WebWorkerQueue.prototype.run = function () {
	if (!this.paused) {
		console.log("Not Paused. Can Run tasks");
		if (this.queue.length >= 1) {
			console.log("can run the next task");
		}
	} else {
		console.log("Can't run now. I'm paused");
	}
};

/**
 * When you want to pause the queue, just call pause and the actions that have yet to be run won't run until you tell the queue to run again.
*/
WebWorkerQueue.prototype.pause = function () {
	if (!this.paused) { this.paused = true; }
};