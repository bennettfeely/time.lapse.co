/*
    time.lapse.co
    by Bennett Feely

    @bennetfeely
    bfeelyweb@gmail.com
*/

// Youtube authentication information
var YT_DEVELOPER_KEY = 'AI39si4v9RbGc_nfnQDwJ7hGknhk68Ka7vZ283hn5EmKaMdVCM7UTNmJ0KkWtD9DP5cFqgF-le0u5In0s5E0wTWrXQ2QH8ncig';
var YT_OAUTH2_SCOPE = 'https://gdata.youtube.com';
var OAUTH2_CLIENT_ID = '417733965826.apps.googleusercontent.com';
var OAUTH2_TOKEN_TYPE = 'Bearer';

$html = $("html");
$favicon = $("#favicon");
$body = $("body");

$header = $("header");
$slider = $(".slider");
$main_page = $("#main_page");


$title = $("#title");
$video = $("#video");
$preview_shot_container = $("#preview_shot_container");

$toggle_theater = $("#toggle_theater");
    $theater = $("#theater");
$toggle_home = $("#toggle_home");
$toggle_about = $("#toggle_about");

$start = $("#start");
$compile = $("#compile");
$login_button = $("#login-button");
$description = $("#description");
$download = $(".download");
$upload = $("#upload");
$progress_indicator = $("#progress_indicator");

$shotcontainer = $(".shot-container");

$hours = $("#hours");
$minutes = $("#minutes");
$seconds = $("#seconds");
$fps = $("#fps");
    fps = 24;
$setfps = $(".set-fps");

$audio = $("audio")[0];


// I should really fix this disgusting code....
function startAttemptAuth() {
    console.log("startAttemptAuth();");
    gapi.auth.init(function() {
        setTimeout(function() {
            gapi.auth.authorize({
                client_id: OAUTH2_CLIENT_ID,
                scope: [YT_OAUTH2_SCOPE],
                immediate: true
            }, startHandleAuthResult);
        }, 1);
    });
}

function attemptAuth() {
    console.log("attemptAuth();");
    gapi.auth.init(function() {
        setTimeout(function() {
            gapi.auth.authorize({
                client_id: OAUTH2_CLIENT_ID,
                scope: [YT_OAUTH2_SCOPE],
                immediate: true
            }, handleAuthResult);
        }, 1);
    });
}

function startHandleAuthResult(authResult){
    if (authResult){
        prepareUploadForm();

        $login_button.unbind('click').click(function() {
            toggleUploadForm();
        });

    }
    else {
        $login_button.unbind('click').click(function() {

            console.log("login button clicked from handleAuthResult");

            gapi.auth.authorize({
                client_id: OAUTH2_CLIENT_ID,
                scope: [YT_OAUTH2_SCOPE],
                immediate: false
            }, handleAuthResult);
        });
    }

}

function handleAuthResult(authResult) {
    console.log("handleAuthResult();");

    if (authResult) {
        console.log("we have authResult");

        prepareUploadForm();

        toggleUploadForm();
    }

    else {
        $login_button.unbind('click').click(function() {

            console.log("login button clicked from handleAuthResult");

            gapi.auth.authorize({
                client_id: OAUTH2_CLIENT_ID,
                scope: [YT_OAUTH2_SCOPE],
                immediate: false
            }, handleAuthResult);
        });
    }
}


function generateYouTubeApiHeaders() {
    console.log("generateYouTubeApiHeaders();");

    return {
        Authorization: OAUTH2_TOKEN_TYPE + ' ' + gapi.auth.getToken().access_token,
        'GData-Version': 2,
        'X-GData-Key': 'key=' + YT_DEVELOPER_KEY,
        'X-GData-Client': OAUTH2_CLIENT_ID
    };
}


function escapeXmlEntities(input) {
    console.log("escapeXmlEntities();");

    if (input) {
        return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    else {
        return '';
    }
}


function getDisplayName() {
    console.log("getDisplayName();");

    $.ajax({
        dataType: 'json',
        type: 'GET',
        url: 'https://gdata.youtube.com/feeds/api/users/default?alt=json',
        headers: generateYouTubeApiHeaders(),
        success: function(responseJson) {
            var displayName = responseJson['entry']['yt$username']['display'];
            var thumbnail = responseJson['entry']['media$thumbnail']['url'];
            var profile = '<a target="_blank" class="profile-link button" href="http://www.youtube.com/my_videos">'
                        + '<div class="pic" style="background-image: url(' + thumbnail + ')"></div> ' + displayName
                        + '</a>';

            $toggle_about.after(profile);
        }
    });
}


function prepareUploadForm() {
    console.log("prepareUploadForm();");

    if($(".profile-link").length == 0){
        getDisplayName();
    }

    $upload.click(function() {
        console.log("upload button clicked");

        var title = escapeXmlEntities($('#video_title').val());
        var description = escapeXmlEntities($('#description').val());

        if(title !== ""){
            // Make sure we aren't uploading the same video twice
            $upload.unbind("click");

            var xmlBody = '<?xml version="1.0"?> <entry xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:yt="http://gdata.youtube.com/schemas/2007"> <media:group> <media:title type="plain">' + title + '</media:title> <media:description type="plain">' + description + '</media:description> <media:category scheme="http://gdata.youtube.com/schemas/2007/developertags.cat">timelapseco</media:category> <media:category scheme="http://gdata.youtube.com/schemas/2007/categories.cat">Film</media:category> </media:group> </entry>';

            $.ajax({
                dataType: 'xml',
                type: 'POST',
                url: 'https://gdata.youtube.com/action/GetUploadToken',
                headers: generateYouTubeApiHeaders(),
                contentType: 'application/atom+xml; charset=UTF-8',
                processData: false,
                data: xmlBody,
                success: function(responseXml) {
                    $html.addClass("uploading");
                    $upload.html('Uploading').unbind("click");
                    var xml = $(responseXml);

                    var nextUrl = window.location.href;
                    var submissionUrl = xml.find('url').text() + '?nexturl=' + encodeURIComponent(nextUrl);
                    var token = xml.find('token').text();

                    $('#upload-form').attr('action', submissionUrl);
                    $video.prop("controls", false);

                    $('<input>').attr({
                        type: 'hidden',
                        name: 'token',
                        value: token
                    }).appendTo('#upload-form');

                    var $formElement = $("#upload-form")[0];
                    var formData = new FormData($formElement);
                    formData.append("file", output, "timelapse.webm");

                    var xhr = new XMLHttpRequest();
                    xhr.upload.addEventListener("progress", updateProgress, false);
                    xhr.upload.addEventListener("load", transferComplete, false);

                    function updateProgress(oEvent) {
                      if (oEvent.lengthComputable) {
                        var progress = oEvent.loaded / oEvent.total;
                        var percent = Math.round(progress * 100) + '%';

                        $progress_indicator.css("height", percent);
                        $upload.html('Uploading (' + percent + ')');
                      }
                    }
                    function transferComplete() {
                        console.log("transferComplete();");

                        $upload.text('Uploaded');
                        setTimeout(function() {
                            toggleFinished();
                            $html.addClass("uploaded");
                        }, 600);

                    }

                    xhr.open('POST', submissionUrl, true);
                    xhr.send(formData);
                },
                error: function(jqXHR) {
                    $upload.text('Retry').click(prepareUploadForm);

                }
            });
        }
        else {
            $("#required").removeClass("none");
        }
    });
}

function loadLocalStorage() {
    console.log("loadLocalStorage();");

    // Lets get some localstorage values if they exist
    var storedhours = Math.abs(localStorage.getItem("timelapse_hours"));
    var storedminutes = Math.abs(localStorage.getItem("timelapse_minutes"));
    var storedseconds = Math.abs(localStorage.getItem("timelapse_seconds"));
    var storedfps = Math.abs(localStorage.getItem("timelapse_fps"));
    var storednoflash = localStorage.getItem("timelapse_noflash");
    var storedaudio = localStorage.getItem("timelapse_audio");
    var storedhd = localStorage.getItem("timelapse_hd");

    // And if we have those things locally stored... set it up
    if (storedhours) { $hours.val(storedhours); }
    if (storedminutes) { $minutes.val(storedminutes); }
    if (storedseconds) { $seconds.val(storedseconds); }
    if (storedfps) { $fps.val(storedfps); }
    if (storednoflash) { $html.addClass("noflash"); }
    if (storedaudio) { $html.addClass("audio"); }
    if (storedhd) { $html.addClass("HD"); }


    shotclock = getShotclock();
}


function setLocalStorage() {

    console.log("setLocalStorage();");

    // Remembers the settings you put for next time

    var hours = $hours.val();
    var minutes = $minutes.val();
    var seconds = Math.round($seconds.val());
        fps = Math.round($fps.val());

    var timecheck = (hours * 36e5) + (minutes * 6e4) + (seconds * 1000);

    var hours = Math.floor(timecheck / 36e5),
        minutes = Math.floor((timecheck % 36e5) / 6e4),
        seconds = Math.floor((timecheck % 6e4) / 1000);

    if (timecheck < 1000) { var seconds = 1; }

    // Keep the fps between 1 and 72
    if (fps < 1) { var fps = 1; }
    if (fps > 72) { var fps = 72; }

    if( isNumeric(hours) && isNumeric(minutes) && isNumeric(seconds) && isNumeric(fps) ) {

        $hours.val(hours);
        $minutes.val(minutes);
        $seconds.val(seconds);
        $fps.val(fps);

        console.log("its numeric!");

        localStorage.setItem('timelapse_hours', hours);
        localStorage.setItem('timelapse_minutes', minutes);
        localStorage.setItem('timelapse_seconds', seconds);
        localStorage.setItem('timelapse_fps', fps);

    }

    shotclock = getShotclock();
}

function isNumeric(n){
    return !isNaN(n);
}


function getShotclock() {
    // Grabs the values from the inputs
    var store_hours = $hours.val();
    var store_minutes = $minutes.val();
    var store_seconds = Math.round($seconds.val());
    var store_fps = $fps.val();

    // Check to make sure we aren't taking a frame less than every second
    // So things don't explode
    var timecheck = ((store_hours * 3600) + (store_minutes * 60) + store_seconds);
    if (timecheck < 1) {
        var store_seconds = 1;
    }
    $seconds.val(store_seconds);

    // Get the time interval between shooting frames in milliseconds
    var shotclock = (store_hours * 3600000) + (store_minutes * 60000) + (store_seconds * 1000);

    return shotclock;
}


function startTimelapse() {

    $start.text('Starting in 0:05');


    if($html.hasClass("HD")){

        console.log("We have hd at startTimelapse();");

        $("#video, #canvas").attr({
            width : 1280,
            height : 960
        });

        console.log("We're live in HD!!!");
    }


    // Start a 5 sec countdown timer
    var p = 5;
    countDown = setInterval(function() {
        p -= 1;
        $start.html('Starting in 0:0' + p);

        if (p === 0) {

            $html.addClass("recording");

            $title.removeAttr("href");

            $start.remove();

            // Get the time we started the timelapse for later
            var date = new Date();
            starttime = date.getTime();

            // Set up Whammy.js
            fps = Math.round($fps.val());
            encoder = new Whammy.Video(fps);

            var shotclock = getShotclock();
            clearInterval(countDown);

            // Capture a frame
            shootFrame();

            // Confirmation message when clicking on the header title link while recording
            $("#title, #no").mousedown(function(){
                $("#title, #confirmation").toggleClass("none");
            });

            return;
        }

    }, 1000);
}


function realTime(milli) {
    // Converts milliseconds to realTime
    // m:s or h:m:s formats

    var h = Math.floor(milli / 36e5),
        m = Math.floor((milli % 36e5) / 6e4),
        s = Math.floor((milli % 6e4) / 1000);
    if (s < 10) {
        var s = '0' + s;
    }

    var time = m + ":" + s;

    if (h > 0) {
        if(m < 10){ var m = '0' + m; }

        var time = h + ":" + m + ":" + s;
    }

    return time;
}


function humanRealTime(milli, totaltime) {
    // Converts milliseconds to a human readable time
    // Puts how long the recording time was in the description when uploading to YouTube

    var seconds = milli / 1000;
    var dSeconds = Math.floor(seconds % 60);
	var minutes = seconds / 60;
	var dMinutes = Math.floor(minutes % 60);
	var hours = minutes / 60;
	var dHours = Math.floor(hours % 24);
	var days = hours / 24;
	var dDays = Math.floor(days % 365);
	var dYears = Math.floor(days / 365);

    var seconds = dSeconds + " seconds";
    var minutes = dMinutes + " minutes";
    var hours = dHours + " hours";
    var days = dDays + " days";

    // Make things grammatically correct
    if(dSeconds == 1){ var seconds = "1 second" }
    if(dMinutes == 1){ var minutes = "1 minute" }
    if(dHours == 1){ var hours = "1 hour" }
    if(dDays == 1){ var days = "1 day" }

    // Write only what's necessary
    var time = seconds + " compressed into a timelapse on http://time.lapse.co";
    if (dMinutes > 0) { var time = minutes + " and " + seconds + " made into a timelapse on http://time.lapse.co"; }
    if (dHours > 0) { var time = hours + ", " + minutes + " and " + seconds + " made into a timelapse on http://time.lapse.co"; }
    if (dDays > 0) { var time = days + ", " + hours + ", " + minutes + " and " + seconds + " made into a timelapse on http://time.lapse.co"; }

    if (totaltime == true) { var time = days + ", " + hours + ", " + minutes + " and " + seconds; }

    return time;
}


function realDate(time) {
    // Convert the published time on YouTube videos in the theater
    // to a human readable output

    var date = new Date((time || "").replace(/-/g, "/").replace(/[TZ]/g, " ")),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);

    if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) return;

    return day_diff == 0 && (
    diff < 60 && "seconds ago" || diff < 120 && "one minute ago" || diff < 3600 && Math.floor(diff / 60) + " minutes ago" || diff < 7200 && "1 hour" || diff < 86400 && Math.floor(diff / 3600) + " hours ago") || day_diff == 1 && "yesterday" || day_diff < 7 && day_diff + " days ago" || day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago";
}

HD = 1;
var shotcount = 0;
var shootFrame = function() {

    console.log("fps: " + fps);

    // Count the frames
    shotcount += 1;

    // Users can modify the time interval between shots
    // While the timelapse is running
    var shotclock = getShotclock();


    // Play a camera sound effect
    if($html.hasClass("audio")){
        $audio.play();
    }

    // Set things up for HD capturing
    if($html.hasClass("HD")){ HD = 2; }

    // Capture the frame
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    ctx.drawImage(video, 0, 0, (640 * HD), (480 * HD));


    // Add the frame to Whammy
    encoder.add(canvas);

    // Put the frame in the film roll
    var src = canvas.toDataURL("image/webp");

    // Write a time the shots were taken
    var time = new Date();
    var s = time.getSeconds();
        if(s < 10){ s = "0" + s; }
    var m = time.getMinutes();
        if(m < 10){ m = "0" + m; }
    var ampm = "AM";
    var h = time.getHours();
        if(h >= 12) { var h = h - 12; var ampm = "PM"; }
        if(h == 0) { var h = 12; }

    var shottime = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][time.getDay()];
    if(shotclock < 86400000){ var shottime = h + ' ' + ampm; }
        if(shotclock < 36e5) { var shottime = h + ':' + m; }
        if(shotclock < 60000){ var shottime = h + ':' + m + ':' + s; }


    // Clean up the excess frames to make things run faster
    $(".shot:eq(4)", $shotcontainer).remove();


    // Make the frame
    var frame = '<div class="shot">' +
                    '<img src="' + src + '" width="' + (640 * HD) + '" height="' + (480 * HD) + '" />' +
                    '<time>' + shottime + '</time>' +
                '</div>';




    // Put the first frame taken first,
    // All others in reverse chronological order after the first frame
    // i.e. 1, 6, 5, 4, 3, 2, 1...
    if (shotcount == 1) {
        $shotcontainer.append(frame);
    } else {
        $(".shot:first", $shotcontainer).after(frame);
    }


    // Preview shot on hover,
    $(".shot img").hover(function() {
        var url = 'url(' + $(this).attr("src") + ')';
        $preview_shot_container.css("background-image", url);

        $html.addClass("shot-previewing");
    });

    $shotcontainer.mouseleave(function(){
        $html.removeClass("shot-previewing");
    });



    // Write how many frames were captured
    // var fps = Math.round($fps.val());
    console.log("FPS from sh:: " + fps);
    var millifps = 1000 / fps;
    var milliduration = shotcount * millifps;
    var timeestimate = '<span class="static">' + realTime(milliduration) + '</span>';

    if(milliduration < 1000){
        var timeestimate = 'less than <span class="static">0:01</span>';
    }

    console.log(milliduration);



    // Countdown until next shot and tell people how many shots they took
    $setfps.html('Next frame in <span class="static">' + realTime(shotclock) + '</span> Timelapse currently ' + timeestimate);
    var ticker = setInterval(function() {
        var milli = shotclock -= 1000;

        $setfps.html('Next frame in <span class="static">' + realTime(shotclock) + '</span> Timelapse currently ' + timeestimate);


        if (milli == 0) { clearInterval(ticker); }
    }, 1000);



    // Camera flash
    var $flash = $('<div class="flash"></div>');



    // Users can turn off the flash for whatever reason
    if(!$html.hasClass("noflash")){
        $favicon.attr("href", "img/favicon-flash.ico");
        $body.append($flash);
        setTimeout(function() {
            $favicon.attr("href", "img/favicon.ico");
            $flash.remove();
        }, 700);
    }

    shootFrame_timer = setTimeout(shootFrame, shotclock);
}

/*

Preview timelapse as it is being made --

function preview(){

    output = encoder.compile();
    var url = window.URL.createObjectURL(output);

    $html.addClass("previewing");
    $preview.attr("src", url).prop({
        loop: true,
        controls: true
    }).bind("ended", function() {
        $html.removeClass("previewing");
        $preview.removeAttr("src");
    });
}
*/

function compile() {

    console.log("compile();");

    // Stop the shooting
    clearInterval(shootFrame_timer);

    var date = new Date();
    endtime = date.getTime();
    var timelapselength = endtime - starttime;
    $description.text(humanRealTime(timelapselength));

    timeKeeper(timelapselength);

    /* Whammy compile the video */
    $compile.html('<span class="ellip">Compiling...</span>');
    output = encoder.compile();
    var url = window.URL.createObjectURL(output);

    /* Set up the download button */
    $download.attr("href", url);

    /* Set up the bigscreen */
    $html.addClass("bigscreen");

    $video.attr("src", url).prop({
        loop: true,
        controls: true
    });

    $shotcontainer.remove();
    $preview_shot_container.remove();

    $("#start_menu").hide();
    $("#compiled_menu").show();
}

function toggleUploadForm() {
    console.log("toggleUploadForm();");

    $("#compiled_menu").hide();
    $("#upload-form").show();
}

function toggleFinished() {
    console.log("toggleFinished();");

    $("#upload-form").hide();
    $("#finished_menu").show();
}

function theaterSearch() {
    console.log("theaterSearch();");

    $theater.text("Loading...");

    var url = 'http://gdata.youtube.com/feeds/api/videos/?category=%7Bhttp%3A%2F%2Fgdata.youtube.com%2Fschemas%2F2007%2Fdevelopertags.cat%7Dtimelapseco&orderby=published&max-results=16&alt=json-in-script&callback=?&key=AI39si4v9RbGc_nfnQDwJ7hGknhk68Ka7vZ283hn5EmKaMdVCM7UTNmJ0KkWtD9DP5cFqgF-le0u5In0s5E0wTWrXQ2QH8ncig';
    $.getJSON(url, function(data) {

        $theater.empty();

        $.each(data.feed.entry, function(i, item) {
            var api_id = item.id.$t;
            api_id.match(/\/(\w+?)$/);

            var id = RegExp.$1;
            var title = item.title.$t;
            var image = '<img width="480" height="360" src="http://img.youtube.com/vi/' + id + '/hqdefault.jpg">';
            var author = item.author[0].name.$t;
            var description = item.media$group.media$description.$t;
            var published = realDate(item.published.$t);
            var duration = realTime(item.media$group.yt$duration.seconds * 1000);

            if (description !== "") {
                description = '<p>' + description + '</p>'
            }

            var video_item = '<figure>'
                + '<div class="timelapse" data-duration="' + duration + '" data-id="' + id + '">'
                + image
                + '</div>'
                + '<figcaption>' + '<a href="http://www.youtube.com/watch?&v=' + id + '">' + title + ' by ' + author + '</a>'
                + description + '</ficaption>' + '</figure>'


            $(video_item).appendTo($theater);
        });
    });

    $theater.delegate('.timelapse:not(.playing)', 'click', function() {

        $(".playing").removeClass("playing").children().remove("object");

        console.log("theater refresh");

        // Clear out any other video that might be open
        var id = $(this).attr("data-id");
        var image = '<img width="480" height="360" src="http://img.youtube.com/vi/' + id + '/hqdefault.jpg">';


        var video = '<object width="448" height="336">' + '<param name="movie" value="http://www.youtube.com/v/' + id + '&hl=en&fs=1"></param><param name="allowFullScreen" value="true"></param>' + '<embed src="http://www.youtube.com/v/' + id + '&hl=en&fs=1&autoplay=1&showinfo=0?html5=1&autohide=1" type="application/x-shockwave-flash" allowfullscreen="true" width="448" height="336"></embed>' + '</object>';

        $(this).addClass("playing").append(video);
    });

}

function noSupport() {
    console.log("noSupport()");
    var nosupport_msg = '<div class="nosupport container">'
        + '<h1>I\'m Sorry.</h1>'
        + '<p>I am working hard on bring time.lapse.co to all modern web browsers<span class="devices-msg"></span>. <br>The browser you are currently using isn\'t supported at this time.</p>'
        + '<p>Make a timelapse using:</p>'
        + '<a class="download-browser supported" href="http://chrome.google.com">Google Chrome 21+</a>'
        + '<a class="download-browser unsupported">Opera (coming soon)</a>'
        + '<a class="download-browser unsupported">Firefox (someday)</a>'
        + '<a class="download-browser unsupported">Safari (someday)</a>'
        + '<a class="download-browser unsupported">Internet Explorer (someday)</a>'
        + '</div>';

    $main_page.html(nosupport_msg);
}

function timeKeeper(timelapselength){
    var milli = timelapselength;
    $.post('server/settime.php', { timelapselength: milli }, function(data) {
        console.log("Hey you, your timelapse was " + milli + " milliseconds long. Sincerely, NSA. ;)");
    });
}



$(function() {

    // Local storage handling
    loadLocalStorage();
    $("input").blur(setLocalStorage);


    // Scrolling shadows on main page
    $main_page.scroll(function(){
        if($main_page.scrollTop() > 0) {
            $header.addClass("shadow");
        } else {
            $header.removeClass("shadow");
        }
    });


    $(window).load(function() {

        window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

        // If the browser can do the essentials
        if (navigator.getUserMedia && Modernizr.todataurlwebp) {

            startAttemptAuth();

            navigator.getUserMedia({ video: true }, function(stream) {

                feed = (navigator.getUserMedia) ? window.URL.createObjectURL(stream) : stream;

                $video.attr("src", feed);
                localMediaStream = stream;

                $html.removeClass("not-allowed").addClass("webcam");

                $start.text("Start recording timelapse");
                $(".helper").remove();

                started = false;
                $start.mousedown(function() {
                    console.log("start bytton pressed");
                    if(!$("input").is(":focus") && started == false){
                        started = true;

                        startTimelapse();
                    }
                });
                $compile.one("click", function() {
                    compile();
                });

                $("#goback").mousedown(function() {
                    $("#upload-form").hide();
                    $("#compiled_menu").show();
                });
            },

            function(e) {
                // Webcam probs?
                $html.addClass("not-allowed");
                $start.html("Unblock and allow access to a webcam to start");
            });


        /*
            // Pretty share buttons with Sharrre plugin
            $(".twitter").sharrre({share:{twitter:true},className:"share",template:'<span class="share-button twitter-button"><i>t</i>Tweet</span><span class="count">{total}</span>',enableHover:false,enableTracking:true,shorterTotal:false,click:function(e,t){e.simulateClick();e.openPopup("twitter")}});
            $(".facebook").sharrre({share:{facebook:true},className:"share",template:'<span class="share-button facebook-button"><i>v</i>Share</span><span class="count">{total}</span>',enableHover:false,enableTracking:true,shorterTotal:false,click:function(e,t){e.simulateClick();e.openPopup("facebook")}});
            $(".gplus").sharrre({share:{googlePlus:true},className:"share",template:'<span class="share-button googleplus-button"><i>Ć</i>+1</span><span class="count">{total}</span>',enableHover:false,enableTracking:true,shorterTotal:false,click:function(e,t){e.simulateClick();e.openPopup("googlePlus")}})
        */


        } else {
            // Browser does not support getusermedia and/or todataurl webP, no go...
            noSupport();
        }

        // Prevent flash of main page for people who can't make timelapses
        $html.addClass("go");
    });


    $toggle_home.click(function(){
        $(".timelapse").children().remove("object").removeClass("playing");
        $body.removeClass("showing-about showing-theater");
    });


    // Theater page toggle
    one_theater = false;
    $toggle_theater.click(function() {

        // Load the theater only once
        if(one_theater == false) {
            theaterSearch();
            one_theater = true;
        }

        $(".timelapse").children().remove("object").removeClass("playing");
        $body.removeClass("showing-about").addClass("showing-theater");
    });

    // About page toggle
    one_about = false;
    $toggle_about.click(function() {

        // Load the total recorded time once
        if(one_about == false) {
            $.get('server/gettime.php', function(milli) {
                var totaltime = true;
                var time = '<h2>How much time has been recorded on time.lapse.co?</h2>'
                         + '<p>A total of ' + humanRealTime(milli, totaltime) + ' has been recorded on time.lapse.co.</p>';
                $("#total_time").html(time);
            });
            one_about = true;
        }

        $(".timelapse").children().remove("object").removeClass("playing");
        $body.removeClass("showing-theater").addClass("showing-about");
    });


    // Play camera audio sound effect on frame capture toggle
    $(".options-toggle").click(function() {
        $html.toggleClass("show-options");
    });


    // Show camera flash effect toggle
    $(".flash-toggle").click(function() {

        $html.toggleClass("noflash");
        if($html.hasClass("noflash")){
            localStorage.setItem('timelapse_noflash', true);
        }
        else {
            localStorage.removeItem('timelapse_noflash');
        }
    });

    // Play camera audio sound effect on frame capture toggle
    $(".audio-toggle").click(function() {
        $html.toggleClass("audio");
        if($html.hasClass("audio")){
            localStorage.setItem('timelapse_audio', true);
        }
        else {
            localStorage.removeItem('timelapse_audio');
        }
    });

    $(".hd-toggle").click(function() {

        $html.toggleClass("HD");

        if($html.hasClass("HD")){
            localStorage.setItem('timelapse_hd', true);
        }
        else {
            localStorage.removeItem('timelapse_hd');
        }
    });
});