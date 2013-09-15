[time.lapse.co](http://time.lapse.co)
=============

Create an awesome timelapse video with your webcam.

![A majestic sunset that was never captured on time.lapse.co](http://time.lapse.co/img/screenshot.png "time.lapse.co")

How it works
------------

time.lapse.co does it's work completely in your browser using the awesome  [Whammy.js](https://github.com/antimatter15/whammy) encoder by [Antimatter15](https://github.com/antimatter15).

Browser Support
---------------
Browsers need to support the getUserMedia API, webM as well as webP decoding and encoding for time.lapse.co to work.

*Supported*
*   **Chrome 21+**. I haven't actually tested time.lapse.co in Chrome 21, but I would expect things to work.

*Currently Unsupported*
*   **Opera**. Supported getUserMedia [until version 12](http://caniuse.com/stream) then lamely gave up on it in version 15. As soon as support returns I would expect Opera to be fully supported. Keeping my fingers crossed.
*   **Firefox**. Supports getUserMedia but not WebP. Can't do much until WebP is supported.
*   **Safari**. The new Internet Explorer, these slowpokes haven't begun to support getUserMedia or webp yet. This might take a while unfortunately.
*   **Internet Explorer**. Might be a while, but things are promising as getUserMedia should be coming to IE11. Can't find anything about webP, and I wouldn't be suprised if support doesn't come for a long time.
*   **Chrome 29+ for Android**. Everything this browser needs to support is supported. I just need to get around to optimizing the site for mobile and everything will be good to go. The only problem is you need to set your phone to not sleep after x minutes.
