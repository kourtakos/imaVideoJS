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
    //Init τις μεταβλήτες που θα μου χρειαστούν
    var videoContainer, videoPlayer,scrollToVideo, closeButton, isPlaying = false, isPaused = false, cptlPlayer;


    var defaults = {
        container: '.yourSelector',
        someDefaultOption: 'foo',
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

    /**
     * Helper Functions
     @private
     */
    //Method που κάνει το Register τον JS k CSS που χρειάζεται ο Player
    


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
        //document.getElementById("imaPlugincontent_video_ima-controls-div").remove();
        document.getElementById("imaPlugincontent_video_ima-seek-bar-div").remove();
        document.getElementById("imaPlugincontent_video_ima-play-pause-div").remove();
        document.getElementById("imaPlugincontent_video_ima-mute-div").remove();
        document.getElementById("imaPlugincontent_video_ima-fullscreen-div").remove();
        document.getElementById("imaPlugincontent_video_ima-slider-div").remove();
        
    }
   


    function createVideoPlayer() {

        //Βρίσκω το article container για να υπολογίσω τις διαστάσεις του player
        var articleBody = document.querySelectorAll(that.options.container);
        var containerWidth = articleBody[0].offsetWidth < 680 ? articleBody[0].offsetWidth : 680;
        //Δημιουργώ τo Container του Video
        var videoContainer = document.createElement("figure");
        videoContainer.setAttribute("id", "imaPluginfeatured-media");
        videoContainer.classList.add("content-media", "content-media--video");
        videoContainer.style.textAlign = "right";

       
        //Δημιουργώ τον Player με ένα Dummy Video
        var videoPlayer = document.createElement("video");
        videoPlayer.setAttribute("id", "imaPlugincontent_video");
        videoPlayer.classList.add("video-js", "vjs-default-skin", "featured-video");
        videoPlayer.setAttribute("preload", "auto");
        videoPlayer.setAttribute("width", containerWidth);  //<--υπολογίζω τις διαστάσεις από το πλάτος του container
        videoPlayer.setAttribute("height", containerWidth / 1.7);
        videoPlayer.style.display = "none"; //<-- κρύβω το video μέχρι να μπει στo viewport



        //To Dummy Video
        var blankSource = document.createElement("source");
        blankSource.type = "video/mp4";
        blankSource.src = "https://files.capital.gr/banners/blank_video.mp4";


        videoPlayer.appendChild(blankSource);
        videoContainer.appendChild(videoPlayer);

        //Επιστρέφω τον player
        return videoContainer;

    }

    function addCloseButton(videoContainer) {

        //Δημιουργώ το close button και το τοποθετώ στο video container
        var closeButton = document.createElement("img");
        closeButton.setAttribute("id", "imaVideoCloseButton");
        closeButton.setAttribute("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAAABHNCSVQICAgIfAhkiAAAAMJJREFUWIXt1dENgjAURuFzjTswhpswhkM5Bps4RqeoLyWppFDtvcEH/+8FIlROSFtARERERCSMeQbnnO/ABCxm9uzcewNmIJnZY/SZl9GBxVSOcwlqqmLrMUO8wUt13ozexG7HfM01JaAdtE6Po2uj3MFw+BZDYyEoGJrRtZBYCAyG3eiwWPAvutP955Q4c9FdvX/Q2daors05Z366rX2yz0bvxd5F1w0pv719ET0P9Aancjx8a5votHefiIiIiMjJXh1kXYGi1IhRAAAAAElFTkSuQmCC");
        closeButton.style.width = "44px";
        closeButton.style.height = "44px";
        closeButton.style.position = "absolute";
        closeButton.style.right = "7px";
        closeButton.style.zIndex = "999999999999999";
        closeButton.style.cursor = "pointer";
        closeButton.addEventListener('click', killPlayer, false);

        videoContainer.appendChild(closeButton);

    }


    function addSoundControl(videoContainer) {

        //Δημιουργώ το close button και το τοποθετώ στο video container
        var soundButton = document.createElement("img");
        soundButton.setAttribute("id", "imaSoundControl");
        soundButton.setAttribute("src", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAAABHNCSVQICAgIfAhkiAAAAQhJREFUWIXt1SFWw0AUheH/chBxrQsOWYmsYwmVyEoWhewSKrsDJBKJA4eMe5gXGDjtoROmNdxPZV6SyU3yMgEzMzMzs/9LrSeMiCVwCzxJ2rWe/7LlZBGxAm5yeNVy7lGTwBHRAWugP7Rf0vBb7RjVgTPcCuiKcv9jXB7fA/cRMQCbLK+BLiIeJL2dNHCGW0w4b3wL4/YkF1NPPFY+wW0OO77CbmufLpwhcHoFyn4dslbt5IEjYk72bFHugHXuqzIlcO2XPaNoA763x6z24pN+HLlSlEvYvpXjRdImj18C75Kec7wA5pIezxJ4n7yJO+A6S5+BW2rWw5KGDLjjDx+VmZmZmZkd9gHhtU0Aieq7pgAAAABJRU5ErkJggg==");
        soundButton.setAttribute("data-unmute", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAYAAAAehFoBAAAABHNCSVQICAgIfAhkiAAAAdhJREFUWIXtl6Fy20AQhr/tdKaCZQpzWMoMzRLmsMBCw75BX6aPUFgWs4YZBppZrGItU9FfcHtTjao2WtuxM9P7ZjQ769Pd/be3pz1DoVAoFAqF/xlJlaRq3/6vjilmIitgta/ocwjeATVwvU/nkwj2NLgBMLM10AILSbPoWKeK8BK4ljR3/97tTXSgowmWtJD0UdJypHkNdMBSUmVmDdAAM0lvI/McLNi3+44UxQq46P3+QVJtZh3w4O05yhu3VycT7NFZ9UT0qf25BTCzDSnKc/e3/l5I8OugwPdTJzCzRtIjMPcot8DW/cqj3gChgxeNcCgaJIEAl25bt7Xbb8Hxnv0r0bjNRWIo8CeApJqJnKNw/IGnyySeW3DOz87txaD9TXTA0KEj5WT/DlAP/CE553e99+F3Lg8X8CQhwWb2ue/7BeaOkcPoZXcONL0tvwJa/0JA2oFm2PdfHJQSZtb5ItYjza0/95AqIWk3Ht3Pi9yO9P0r0ZQYxcw2knbAO3z7PYqfXFxFup11WTCwcHt6wS4wR3SMXLa/mFnn6TIjpcv3yDxHE/wEa+CHmeXo3rr9Gh3IjiZpIn6bWwAbvxuHOEfhuCSlzsMZ5o5z6J/QQqFQKBQKL4pfVN+pcP4aGaUAAAAASUVORK5CYII=");
        soundButton.style.width = "44px";
        soundButton.style.height = "44px";
        soundButton.style.position = "absolute";
        soundButton.style.left = "7px";
        soundButton.style.zIndex = "999999999999999";
        soundButton.style.cursor = "pointer";
        soundButton.addEventListener('click', toggleSound, false);

        videoContainer.appendChild(soundButton);

    }


    //Method που τσεκάρει εαν ένα element είναι μέσα στο viewPort
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






    //Method που τοποθετεί τον player στη σωστή θέση
    //και κατόπιν κάνει init τον player
    function addPlayerToBody() {
        console.log("addPlayerToBody");
        //Δημιουργώ τον Player Μαζί με το container
        var player = createVideoPlayer();
        var articleBody = document.querySelectorAll(that.options.container);
        var childrenNumber = articleBody[0].children.length;
        var VideoPosition = Math.round(childrenNumber / 2) - 1;

        //Για την ώρα βάζω τον player στη μέση του container
        articleBody[0].insertBefore(player, articleBody[0].children[VideoPosition - 1]);

        //Τσεκάρω μέσω του canAutoplay library ,εαν μπορεί να παίξει video
        //εαν Ναι κάνω init τον player!!

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


    //Method που σκοτώνει τον player
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


        //Method που σκοτώνει τον player όταν τελειώσει το video βάσει χρόνου για να μην περιμένω το event του player
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

            //εαν το property showCloseButtonInVideo είναι true δείχνω το closeButton
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


                //Τσεκάρω το ScrollDepth για να ξέρω εάν o player έχει περάσει επάνω από το top για να τον κάνω sticky
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



        cptlPlayer.on('adserror', function () {
            console.log("ERROR MAY DAY MAY DAY Kiiilling player ")
            killPlayer();
        });

        //Βάζω τον ήχο στο Mute
        cptlPlayer.on('adplaying', function () {
            console.log("adPlaying");
        });

        cptlPlayer.on('adstart', function () {
            console.log("adstart");
            //Εμφανίζω τον player όταν ξεκινήσει η διαφήμιση
            videoPlayer.style.display = "block";
            
            if (that.options.hideDefaultControls) {
                console.log("hideDefaultControls");
                hideDefaultControls();
            }
            cptlPlayer.ima.getAdsManager().setVolume(0);
            countDowntoKill(cptlPlayer.ima.getAdsManager().getRemainingTime());
            console.log("getRemainingTime-->", cptlPlayer.ima.getAdsManager().getRemainingTime());
        })

          //IE MUTE ΓΙΑ ΝΑ ΜΗΝ ΦΩΝΑΖΕΙ
         cptlPlayer.muted(true);
         if (that.options.playSoundOnMouseOver) {
                //Στο mouseover Volume 100%
                cptlPlayer.on('mouseover', function () {
                        cptlPlayer.ima.getAdsManager().setVolume(1);
                });

                //Στο mouseout Volume 0%
                cptlPlayer.on('mouseout', function () {
                    if (that.options.playSoundOnMouseOver) {
                        cptlPlayer.ima.getAdsManager().setVolume(0);
                    }
                });
            }


        //Όταν Τελειώσει το Video Κάνω Kill τον Player
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
       // this.init(); // Initialization Code Here
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
            registerScriptCss(scriptsPath + "/js/videojs.ima.js", "js", addPlayerToBody());  //<-- Το τελευταίο είναι η Method που πρέπει να τρέξει μετά το init

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


/**************
    EXAMPLE:
**************/

//// create new Plugin instance
// var pluginInstance = new PluginNameHere({
//     selector: ".box",
//     someDefaultOption: 'foo2',
//     classToAdd: "custom-new-class-name",
// })

//// access public plugin methods
// pluginInstance.doSomething("Doing Something Else")