/*globals YUI, Worker*/
/*
 * Here is an example of running a WebWorkerQueue in your Mojit
 * <code>
 runQueueTasks: function (ac) {
    var queue,
        self = this;

    if (!this.webworkers_queue) {
        queue = new Y.Media.WebWorkersQueue({
            pool: 5
        });
        
        this.webworkers_queue = queue;
            
            this.webworkers_queue.add({
                uri: "/webworkers/task/calculate.js",
                callback: Y.bind(self.webWorkerEvent, self),
                cmd: 'start'
            });

            this.webworkers_queue.add({
                uri: "/static/assets/js/webworker_example.js",
                callback: Y.bind(self.webWorkerEvent, self),
                cmd: 'start'
            });

            this.webworkers_queue.run();

        }
    },

        webWorkerEvent: function (e) {
            console.log(e);
            switch(e.type) {

                case "message":
                    if (e.data.type === "response") {
                        console.log("RESPONSE");
                        console.log(e.data.message);
                    } else {
                        console.log("INFO");
                        console.log(e.data.message);
                    }
                    break;
                
                case "error":
                    console.log(e.data);
                    break;
            }
        }
    </code>
 * Don't forget to include this autoload in your mojit ( requires: ['media.web_workers_queue'] )
 */

 YUI.add('media.web_workers_queue', function (Y, NAME) {
    'use strict';

    var WebWorkersQueue = function WebWorkersQueue(config) {
        
        var default_config = {
                /**
                 * pool stores the number of concurrent WebWorkers to run
                 * @property default_config.pool
                 * @type {Number}
                 */
                 pool: 4,
                /**
                 * queue stores the tasks to run, run as a FIFO queue
                 *
                 * @property default_config.queue
                 * @type {Array}
                 */
                 queue: [],
                /**
                 * workers stores the current number of invoked worker threads
                 *
                 * @property workers
                 * @type {Number}
                 */
                 workers: 0,
                /**
                 * tasks stores the history of each task that is run, with running flag
                 * 
                 * @property default_config.tasks
                 * @type {Object}
                 */
                 tasks: {},
                /**
                 * completed stores the history of task ids that have completed
                 *
                 * @property default_config.completed
                 * @type {Array}
                 */
                 completed: []
                },
                that = this;

        /**
         * Flag to tell this instance of the WebWorkersQueue to not run new tasks ( if on )
         *
         * @property paused
         * @type {Boolean}
         */
         that.paused = false;

         that.config = Y.merge(default_config, config);
         console.log(that);
         return that;
        };

    /**
     * User can add more tasks to the queue
     *
     * @method add
     * @param params {Object} Stores the configuration for your task
     *   @param params.uri {String} Is the uri of the script to run
     *   @param params.callback {Function} Is the callback to run when this task is completed
     */

     WebWorkersQueue.prototype.add = function add(task) {
        var passed = this.validate_queue_object(task),
            _task = task,
            task_id = Math.random().toString(36).substr(2, 10) // creates a random uuid

            if (!Y.Lang.isArray(passed)) {
                _task.id = task_id;
                this.config.queue.push(_task);
                return true;
            } else {
                return passed;
            }
        };

    /**
     * Validate that the config object has a method_uri and a callback
     */

     WebWorkersQueue.prototype.validate_queue_object = function validate_queue_object(config) {
        
        var error = false,
        errors = [];

        if (!config) {
            error = true;
            errors.push({name: "ArgumentError", message: "Your config object is undefined"});
            return errors;
        }

        if (!config.uri) {
            error = true;
            errors.push({name: "ArgumentError", message: "You are missing your task.uri. This is the path to the Web Worker script to run"});
            return errors;
        }

        if (!config.callback || typeof config.callback !== "function") {
            error = true;
            errors.push({name: "ArgumentError", message: "You are missing the task.callback method to run when the WebWorker completes"});
            return errors;
        }

        if (!config.cmd) {
            error = true;
            errors.push({name: "ArgumentError", message: "You need to send a cmd (command) to run against the WebWorker"});
            return errors;
        }
        console.log(error);
        return error;
     };

    /**
     * Returns the WebWorkersQueue object
     *
     * @method instance
     * @returns {WebWorkersQueue} The instance of this WebWorkersQueue
     */
     WebWorkersQueue.prototype.instance = function () {
        return this;
     };

    /**
     * Runs the tasks in your queue
     *
     * @method run
     */
     WebWorkersQueue.prototype.run = function run() {
        var task,
        self = this,
        i;
        // if this worker queue hasn't been paused
        if (!this.paused) {
            //console.log(self.config.queue);
            // if we have workers available and we have at least one item in the queue
            while (this.config.workers < this.config.pool && this.config.queue.length > 0) {
                // shift is the reverse of pop, intended for FIFO queues
                task = this.config.queue.shift();
                this.run_task(task);
                console.log("RUNNING TASK...." + task.id);
            }
            console.log("out of loop");

        } else {
            console.log("Can't run now. I'm paused");
        }
    };

    /**
     * Run a task from the task queue
     *
     * @method run_task
     * @param task {Object} Is the task from the config.queue
     */
     WebWorkersQueue.prototype.run_task = function (task) {
        var worker,
        self = this;

        if (task) {

            this.config.workers += 1; // increment the workers so we can exit the while loop from this.run

            worker = new Worker(task.uri); // spawn a new web worker 
            
            worker.onmessage = function (event) { // add message event listener to worker instance

                /*

                event.data = {
                    type: "response",
                    action: "close",
                    message: "WebWorker Complete",
                    payload: [{
                        title: "Me",
                        meta: "me.me.me"
                    }]
                };
                
                */
                
                if (event.data.type === "response") {
                    task.callback(event); // notify the calling application regarding this task
                    if (event.data.hasOwnProperty('action') && event.data.action === "close") {
                        worker.postMessage({'cmd': 'stop', 'msg': 'That will do'});
                        self.cleanUpWorkerPool(task); // clean the WebWorkersPool
                    }
                } else if (event.data.type === "info") {
                    /*
                    event.data = {
                        type: "info",
                        message: "WebWorker will complete in " + timeout + " milliseconds"
                    };
                    */
                    task.callback(event);
                }
                
            };
            console.log("trigger worker");
            worker.postMessage({'cmd': task.cmd, 'msg': task.msg, "id": task.id}); // trigger the WebWorker

            // keep track of task id
            // task id will auto-increment in the add method
            this.config.tasks[task.id] = {
                worker: worker,
                running: true
            };
        }
    };

    /**
     * Cleans the WebWorkerPool and updates data, this can be referred to as the post-complete state of the webworker
     *
     * @method cleanUpWorkerPool
     * @param task_object {Object} Is the task object from the (this.run_task) method
     */
     WebWorkersQueue.prototype.cleanUpWorkerPool = function cleanUpWorkerPool(task_object) {
        
        if (this.config.tasks[task_object.id] && this.config.tasks[task_object.id].running ) {
            console.log("task is running. clean up the worker");
            this.config.workers -= 1;
            this.config.tasks[task_object.id].running = false;
            this.config.completed.push(task_object.id);
        }

        if (this.config.queue.length >= 1) {
            this.run();
        }

        //console.log(this);
     };

    /**
     * When you want to pause the queue, just call pause and the actions that have yet to be run won't run until you tell the queue to run again.
     *
     * @method pause
     */
     WebWorkersQueue.prototype.pause = function pause() {
        if (!this.paused) { 
            this.paused = true; 
        }
     };

    /**
     * When you want to start the WebWorker back up again
     *
     * @method start
     * @alias run
     */
     WebWorkersQueue.prototype.start = function start() {
        if (this.paused) {
            this.paused = false;
        }
        this.run();
     };

     Y.namespace('Media').WebWorkersQueue = WebWorkersQueue;

    }, '0.0.1', { requires: [] });