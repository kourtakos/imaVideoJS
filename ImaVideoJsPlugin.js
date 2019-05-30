(function (root, factory) {

    var pluginName = 'ImaAdPlugin';

    if (typeof define === 'function' && define.amd) {
        define([], factory(pluginName));
    } else if (typeof exports === 'object') {
        module.exports = factory(pluginName);
    } else {
        root[pluginName] = factory(pluginName);
    }
}(this, function (pluginName) {

    'use strict';
    //Declaring the basic Variables
    var videoContainer, videoPlayer,scrollToVideo, closeButton, isPlaying = false, isPaused = false, cptlPlayer;


    var defaults = {
        container: '.yourSelector',
        adTagUrl: "",
        hideDefaultControls: false,
        playSoundOnMouseOver: false,
        showControlsForJSAds: false,
        showCloseButtonInVideo: true
    };
   
    var that = this;
    /**
     * Merge defaults with user options
     * @param {Object} defaults Default settings
     * @param {Object} options User options
     */
    var extend = function (target, options) {
        var prop, extended = {};
        for (prop in defaults) {
            if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                extended[prop] = defaults[prop];
            }
        }
        for (prop in options) {
            if (Object.prototype.hasOwnProperty.call(options, prop)) {
                extended[prop] = options[prop];
            }
        }
        return extended;
    };

 


    var currScript = document.getElementById("imaVideoJs");
    var fullUrl = currScript.src;
    var scriptsPath = fullUrl.substring(0, fullUrl.lastIndexOf("/"));



    function registerScriptCss(filename, filetype, onloadFunction) {
        if (filetype == "js") {
            var fileref = document.createElement('script');
            fileref.setAttribute("type", "text/javascript");
            fileref.setAttribute("src", filename);
            fileref.async = false;
            fileref.onload = onloadFunction;;
        }
        else if (filetype == "css") {
            var fileref = document.createElement("link")
            fileref.setAttribute("rel", "stylesheet")
            fileref.setAttribute("type", "text/css")
            fileref.setAttribute("href", filename)
        }
        if (typeof fileref != "undefined")
            document.getElementsByTagName("head")[0].appendChild(fileref)
    }



    

    function hideDefaultControls() {
        document.getElementById("imaPlugincontent_video_ima-seek-bar-div").remove();
        document.getElementById("imaPlugincontent_video_ima-play-pause-div").remove();
        document.getElementById("imaPlugincontent_video_ima-mute-div").remove();
        document.getElementById("imaPlugincontent_video_ima-fullscreen-div").remove();
        document.getElementById("imaPlugincontent_video_ima-slider-div").remove();
        
    }
   

	//Create The Video Player
    function createVideoPlayer() {

		//Get content of the container where player is going to be activated
		// and find the possition to ad it
        var articleBody = document.querySelectorAll(that.options.container);
        var containerWidth = articleBody[0].offsetWidth < 680 ? articleBody[0].offsetWidth : 680;
        
		//Create Video Container
        var videoContainer = document.createElement("figure");
        videoContainer.setAttribute("id", "imaPluginfeatured-media");
        videoContainer.classList.add("content-media", "content-media--video");
        videoContainer.style.textAlign = "right";

       
        //Create Video Player 
        var videoPlayer = document.createElement("video");
        videoPlayer.setAttribute("id", "imaPlugincontent_video");
        videoPlayer.classList.add("video-js", "vjs-default-skin", "featured-video");
        videoPlayer.setAttribute("preload", "auto");
        videoPlayer.setAttribute("width", containerWidth);  //<--get the width of the container
        videoPlayer.setAttribute("height", containerWidth / 1.7);   //<--calculate  the height of the container
        videoPlayer.style.display = "none"; //<-- Hide video until in viewport

        //and assign a dummy videoDummy Video to it
        var blankSource = document.createElement("source");
        blankSource.type = "video/mp4";
        blankSource.src = scriptsPath + "/dummy_video/blank_video.mp4";


        videoPlayer.appendChild(blankSource);
        videoContainer.appendChild(videoPlayer);

        //Επιστρέφω τον player
        return videoContainer;

    }

    //Add Close ad button over the player
    function addCloseButton(videoContainer) {

        var closeButton = document.createElement("img");
        closeButton.setAttribute("id", "imaVideoCloseButton");
        closeButton.setAttribute("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MzQzRjg2QkY1QzRDMTFFOUEwQjhBOURDMjE2NDJCODciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzQzRjg2QzA1QzRDMTFFOUEwQjhBOURDMjE2NDJCODciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozNDNGODZCRDVDNEMxMUU5QTBCOEE5REMyMTY0MkI4NyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozNDNGODZCRTVDNEMxMUU5QTBCOEE5REMyMTY0MkI4NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pj3Wh04AAAMXSURBVHjaxJjLa1NBFMbTiFr6sFStuGgRglZpLEV8YFbVum5xowiudCHuVPA/sEJWSpGWgovqQlcKpsmm+F65qEWKj7T1gUgVK9hSmtpYH9fvyAlcxztz53GbHPgtkjsn58vM3HPOTJXneTFLawcHwF6wFWwG6/hZAXwGb8FT8Ag8swlSZSiwCZwGR1igieXBbTAIPmp7kUANqkEaLHjutgQugwad2DriesB7L3qbAUddBV7wVt4u2Qq86ZXPMqYCyymuZDldgb1e5aw/TGCXV3k77Nfkz4OrObmul2SkOfAadIC1MXsbBRtAQvL8B2soiHkwrfhX46CRx20BeYuZKYKUL94txdgBcYnrwE+FQ5ewFeoNRS6DZEDy/6XwaaZxcZ7Wc2CVYllqhM8LYB+Y0FjSItgNXgrfV1OpVfid9S9xWKV4w7MmvlQ08xMKv0XQIUlld0NifiotcavmMk2yIF2RJK5dIu6OZswUDT5jsJdISK1EZF5oCHZKxA0bxOslhxuGb2NeMpO0BWZ5TFIiLmsYa4ScRi1SxivJnkwIqcRF3N845PjBMuPLZtJ1Wf95USjN1FpWhB3czjcrxjSADOi2jFEdj7nZdpADst9Jgx6XAPTD3xz8l8F5SqeS5wNgyuH3iyTwi60zV4h7CoHPwR4waRljPs4diqktgv3ghfD9GrAxoCzaipyOc/tjYrQlUmA84NkTFiK+eAVLkWOUAtoMj4xJjVSSl1Sc+pDaLVpnyXFaY/B3/jNB4nKSZF7nIHLG3w9eDBk8r6itWYuKQ99NhcS84hdI3fJvxeCTDhVCVnHaQmImxENTn2LwroAAmQi6IFlHfS3oVFcDChKHbASFn2aySfMM1Cg7dnYrnKjrGTJ8C0X7yrMzohhzPOzg3lfBM/F1UY/sfnDYoQOxtcd8IfpfsxBk1IFkyyjuQZA4lcCSyP4yiBsCh1xuWI+BuRXYb1Q2T0Rxw0psivjlGQQtOrFNL9G3gVO8/K2GS/mO9/XVgFuGyG75/dYJDnIb1cI3UqUrkiUwy7f5Y+AhuG8T5I8AAwAhzJPtopukhAAAAABJRU5ErkJggg==");
        closeButton.style.width = "40px";
        closeButton.style.height = "40px";
        closeButton.style.position = "absolute";
        closeButton.style.right = "7px";
        closeButton.style.zIndex = "999999999999999";
        closeButton.style.cursor = "pointer";
        closeButton.addEventListener('click', killPlayer, false);

        videoContainer.appendChild(closeButton);

    }


    //Add SoundButton over video
    function addSoundControl(videoContainer) {

        var soundButton = document.createElement("img");
        soundButton.setAttribute("id", "imaSoundControl");
        soundButton.setAttribute("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAmCAYAAAC29NkdAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NUZBOUQ0REY1QzQ4MTFFOUIzMDk5MTY5NTk5REU4NjkiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NUZBOUQ0RTA1QzQ4MTFFOUIzMDk5MTY5NTk5REU4NjkiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1RkE5RDRERDVDNDgxMUU5QjMwOTkxNjk1OTlERTg2OSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1RkE5RDRERTVDNDgxMUU5QjMwOTkxNjk1OTlERTg2OSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Ps/atosAAAI5SURBVHjazJhNKIRBGMetbw7YIuWwSihJybckJSXKzYEUyclXPnOhlAv5uDitg1XyUaQ4oCg57GElNy5IlEKpTWpbRa//MG+9TfPysjPv+z71q51nZqf/PjP7zDPjUBQlzM4WLni+IjAD2oTNSCIoiGxwonybH7hEzCsqgvXgHJTQdhJotcsS94NdEMX4k0UIjAzx+2ugWafvw0qBKWCP/il0t7dVS0z22cUv4ixLM93ghEbQFOMtcSUoALGMP0dofvuHwASwBWrseJJEgFOJ4siKLNCUZMTGgRtkqRHsAdmSxJH9eqZpp4OBH8Zvgkb6uUGNYLvEVXJyEvuUzthljThiaeqZ96aIt1nNmerm9E8y5+4SZ8yo2vkqWSBhkzNmjPZ5OH0TX6UgHfBigkDCEWfcOcc3LbqaMWrVwMf4cpn2HBiRVbAasXJa/fDO7l4wLLOiNmrvOv5n0eXWf+wYVHH8DrAO4oHHqgj6OOIemPYiaLFCoBeUMr5akAHuGP8KqNMKjJMoLBocggrG3wUOQBAUg3umnxTEZWp+upeYB5s4fR2cHOkEd8y4KzWCOxIj+MS0O+k+Y80P8sGjxnetqndJPkl6wTZoMXAXTgUbYJVEVdtRJ7homBVxcdfmwX2QSWvDQhDDLEEiyDM9a/7xF82ZHcG/5sEh0GH31y0PvfkF7Pz85qVl0o2d3wdvqch9mW+PoU4SpE9v83YVqFofGGR8lyImdgh+o66ld14//bcH7CZQuH0KMAA+O7sjDuZzGgAAAABJRU5ErkJggg==");
        soundButton.setAttribute("data-unmute", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAmCAYAAAC29NkdAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NjU5MDQ3N0Q1QzQ4MTFFOTkwRDVCNkM0REM5NUYyQTciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NjU5MDQ3N0U1QzQ4MTFFOTkwRDVCNkM0REM5NUYyQTciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo2NTkwNDc3QjVDNDgxMUU5OTBENUI2QzREQzk1RjJBNyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2NTkwNDc3QzVDNDgxMUU5OTBENUI2QzREQzk1RjJBNyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PlSSsFoAAAKKSURBVHjazJhLSJVREMe9n7rRmyQEiZlmbqQHlc8ecCEqF4qEuCjQEBJCAgklEncu2og7N0p3k7iwyIVEQQtdZKEEKaEIbQIxfEAEcntgUX7+B88Hw/Ddq3Lnewz8YOaccw9zz5zvzJwTsW07I8xiKc93HvSDdrUZaQWVOAZm7F35AUo05tVawWvgM7hk7Ch4EJYQd4JJ4xSXQg0Hs9L8/VPQlqTvb5AOHgKvQCzV9g4qxDGz32JhPGYonG+19peRVjAB6vcb4ougAuSCbRauU6rn266cBaNGv2mi8i6Zg/ngObjhY6KICJuicxIsyxDTwI8eO1cJhkUoF0C3cPilWybpsvVlRGQZLo0iY4yJ/ianzxnwwWMHy1z6jwsn11nfhkx1uR7vtS/gvmgbEfZjph91toKleervIUPgGbOvgtPMHmWnBkkLVUdWhr/SLpzoYHoCTDG7lv6E3w7+BtPMviL6Z5heAIr9dpBkNkXF85Xp9F3kBeHgL6Zn7lEBRYJwsITp30XfYbEdEkE4WMf0RdFXzvRvYM1vB6+LFZRnIU+Dc+C9pVRZ70eywRiz103R68g5cILZL+irtjSr3xSSQ6sBjrC2u2JML9O3wDjPJLMeO1gKapg9CN4wm26Dt5jdA/7xaqbI42IhC4yb9rgoEqJg061Q4NUM0QD+eOSgQ7Gwc8C8+N1lPoZ/HK9NNdthiks6yf+zPUoV94U0Q70i7Cox522R7g789NGX5gpK8sASWADNbmMOerz0gVXwROnjSYiSS+VeHAfVLmkqVM9vdME6Yy7woX0f3DDhmfDy7THdSag6bgIDSVJbaF5YH4F7ou2Tys1e+Y2aHjIfgp/gjsmpoXJQXXYEGAD3bqiMBX3DvwAAAABJRU5ErkJggg==");
        soundButton.style.width = "40px";
        soundButton.style.height = "38px";
        soundButton.style.position = "absolute";
        soundButton.style.left = "7px";
        soundButton.style.zIndex = "999999999999999";
        soundButton.style.cursor = "pointer";
        soundButton.addEventListener('click', toggleSound, false);

        videoContainer.appendChild(soundButton);

    }


	//Method that Checks if an element in within the viewPort
	//TODO intersection Observer
    var isInViewport = function (elem) {
        if (elem) {
            var bounding = elem.getBoundingClientRect();
            return (
                bounding.top >= 0 &&
                bounding.left >= 0 &&
                bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        } else {
            return false;
        }
    };






    //Method That creates the player- container  and inits player
    function addPlayerToBody() {
        console.log("addPlayerToBody");
		
        //Create the player and its container
        var player = createVideoPlayer();
        var articleBody = document.querySelectorAll(that.options.container);
        var childrenNumber = articleBody[0].children.length;
        var VideoPosition = Math.round(childrenNumber / 2) - 1;

        //I place the player on the middle of container content
        articleBody[0].insertBefore(player, articleBody[0].children[VideoPosition - 1]);

        //Wait until canAutoplay gives ok that the browser can play video
        //when TRUE initPlayer()

        var checkAutoPlay = setInterval(
            function () {
                canAutoplay.video({inline :true, muted:true}).then(function (obj) {
                    if (obj.result === true) {
                        console.log("Calling player Initialization");
                        initPlayer();
                        clearInterval(checkAutoPlay);
                    } else {
                        console.log("Player Not Ready");
                    }
                });
            }
            , 500);

    }


    //Method that kill the Player
    function killPlayer() {
        console.log("killPlayer");
        cptlPlayer.dispose();
        videoContainer.style.display = 'none';
        videoContainer.parentNode.removeChild(videoContainer);
        videoContainer = null;

    }


    //Sound and Icon Toggle
    function toggleSound() {
        var soundButton = document.getElementById("imaSoundControl");
        var imageSrc = soundButton.getAttribute("src");
        var imageAltSrc = soundButton.getAttribute("data-unmute");
        if(cptlPlayer.ima.getAdsManager().getVolume() == 0) {
            cptlPlayer.ima.getAdsManager().setVolume(1);
        } else {
            cptlPlayer.ima.getAdsManager().setVolume(0);
        };
        soundButton.setAttribute("src", imageAltSrc);
        soundButton.setAttribute("data-unmute", imageSrc);

    }

    //Player init
    function initPlayer() {
        console.log("Initiate player");

        cptlPlayer = videojs('imaPlugincontent_video');

        //IMA OPTIONS
        var adOptions = {

            id: 'imaPlugincontent_video',
            adTagUrl: that.options.adTagUrl,
            showControlsForJSAds: that.options.showControlsForJSAds
        };

        cptlPlayer.ima(adOptions);


		//Kill the player if time passes (the duration declared on dfp ) and for any reason the player delays video end event
        function countDowntoKill(timeleft) {
            console.log("countDowntoKill");
            timeleft += 1;
            var downloadTimer = setInterval(function () {
                timeleft -= 1;
                if (timeleft <= 0) {
                    clearInterval(downloadTimer);
                    console.log("countDowntoKillED");
                    killPlayer()
                }
            }, 1000);
        }



        cptlPlayer.ready(function () {
            videoContainer = document.getElementById("imaPluginfeatured-media");
            videoPlayer = document.getElementById("imaPlugincontent_video");

            if (isInViewport(videoContainer) && cptlPlayer) {
                cptlPlayer.play();
                isPlaying = true;
            }

			//Check property showCloseButtonInVideo if true display the closebutton
            if (that.options.showCloseButtonInVideo) {
                addCloseButton(videoPlayer);
            }
            if (!that.options.playSoundOnMouseOver) {
                addSoundControl(videoPlayer);
            }

            scrollToVideo = window.addEventListener('scroll', function () {
                if (cptlPlayer) {
                    if (isInViewport(videoContainer)) {
                        if (isPlaying == false) {
                            console.log("play");
                            cptlPlayer.play();
                            isPlaying = true;
                        }
                    }
                }


				//Checking the ScrollDepth in order to know when to place it fixed
                if (videoPlayer && videoContainer) {
                    var videoRect = videoContainer.getBoundingClientRect();
                    if (videoRect.top < 1) {
                        if (videoPlayer.classList.contains("is-sticky") == false) {
                            videoPlayer.classList.add("is-sticky");
                        }
                    } else {
                        if (videoPlayer.classList.contains("is-sticky") == true) {
                            videoPlayer.classList.remove("is-sticky");
                        }
                    }
                }

            });

        });


		//Error Handler to kill player on error
        cptlPlayer.on('adserror', function () {
            console.log("ERROR MAY DAY MAY DAY Kiiilling player ")
            killPlayer();
        });

        //Just checking events
        cptlPlayer.on('adplaying', function () {
            console.log("adPlaying");
        });

        cptlPlayer.on('adstart', function () {
            console.log("adstart");
            //Display the Video player when ad starts to play
            videoPlayer.style.display = "block";
            
            if (that.options.hideDefaultControls) {
                console.log("hideDefaultControls");
                hideDefaultControls();
            }
            cptlPlayer.ima.getAdsManager().setVolume(0);
            countDowntoKill(cptlPlayer.ima.getAdsManager().getRemainingTime());
            console.log("getRemainingTime-->", cptlPlayer.ima.getAdsManager().getRemainingTime());
        })

          //IE MUTE Extra Check
         cptlPlayer.muted(true);
         if (that.options.playSoundOnMouseOver) {
                //Στο mouseover Volume 100%
                cptlPlayer.on('mouseover', function () {
                        cptlPlayer.ima.getAdsManager().setVolume(1);
                });

                //On Mouse Out Volume 0%
                cptlPlayer.on('mouseout', function () {
                    if (that.options.playSoundOnMouseOver) {
                        cptlPlayer.ima.getAdsManager().setVolume(0);
                    }
                });
            }


        //When Video Ends I kill The player
        cptlPlayer.on('contentended', function () {
            console.log("CONTENTENDED LEME")
            killPlayer();
        });

        cptlPlayer.on('ended', function () {
            console.log("ENDED LEME")
            killPlayer();
        });


    }



    /**
     * Plugin Object
     * @param {Object} options User options
     * @constructor
     */
    function Plugin(options) {
        this.options = extend(defaults, options);
        that = this;
    }

    /**
     * Plugin prototype
     * @public
     * @constructor
     */
    Plugin.prototype = {
        init: function () {

            //REGISTER TA CSS
            registerScriptCss(scriptsPath + "/css/video-js.min.css", "css", null);
            registerScriptCss(scriptsPath + "/css/videojs.ads.css", "css", null);
            registerScriptCss(scriptsPath + "/css/videojs.ima.css", "css", null);
            registerScriptCss(scriptsPath + "/css/extras.css", "css", null);

            //REGISTER TA JS
            registerScriptCss(scriptsPath + "/js/can-autoplay.js", "js", null);
            registerScriptCss(scriptsPath + "/js/video.min.js", "js", null);
            //registerScriptCss(scriptsPath + "/js/ima3.js", "js", null);
            registerScriptCss("//imasdk.googleapis.com/js/sdkloader/ima3.js", "js", null);
            registerScriptCss(scriptsPath + "/js/videojs.ads.min.js", "js", null);
            registerScriptCss(scriptsPath + "/js/videojs.ima.js", "js", addPlayerToBody());  //<-- The Method That Has to run in order to actually Init things up

        }, // #! init
        destroy: function () {
            killPlayer();
        },
        doSomething: function (someData) {
            console.log(someData)
        } // #! doSomething
    };
    return Plugin;
}));

