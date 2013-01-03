=============================
Overview
=============================

*webworker_queue* is a queable approach to manage and handle many different workers / tasks through a general handler

*yui-worker* is an example using YUI inside of a Web Worker
note: yui-worker uses the BlobBuilder interface for creating binary blobs ( files ). This works in Chrome, but can be polyfilled w/ https://github.com/eligrey/BlobBuilder.js filling in the blanks for older browsers.

*Blobs*
BlobBuilder
http://caniuse.com/blobbuilder
http://eligrey.com/blog/
https://github.com/eligrey/BlobBuilder.js
http://dev.w3.org/2009/dap/file-system/file-writer.html

Support
Safari 6
IOS Safari 6
IE 10
Firefix > 6.0 (prefixed Moz), > 13 (not prefixed)
Chrome > 8.0 (prefixed), > 20 (not prefixed)
Android Browser (> 3.0 prefixed Webkit)
Chrome for Android >= 18.0 (prefixed Webkit)

universal support (homegrown) = https://github.com/eligrey/BlobBuilder.js
