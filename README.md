# Welcome to imaVideoJs Plugin

Hello and Welcome.
imaVideoJs plugin aims to make DFP Vast implementation for inline ad units as easy as it can be.

## How Stuff Works
After  plugin is fired it  splits the declared container in two halfs and places a hidden container with a videojs in it
When the user scrolls to the point when the container is it reveals it and begins to play the 
video ad as a preroll to a dummy video file.

The extra feature that is implemented within this plug in is that when you the video is going over the top of the viewport then in stucks on the bottom right corner of the page
so it increases viewability and completion  ratio


## Installation
- Download  all files and place then in a folder  (eg. /scripts/imaVideoJs)

- Load the Script in your html like the following example (please don't change id and onLoad)
```html
<script src="/scripts/imaVideoJs/ImaVideoJsPlugin.js" id="imaVideoJs" async="true" onload="setUpVideoAd()"></script>
```
- Declare properties and init()
```javascript
    <script>
        var imaVideo;
        function setUpVideoAd(){
            imaVideo =  new ImaAdPlugin({
                container: "The container Class or Id where the player is going to be added",
                adTagUrl: "VAST URL FROM DFP",
                hideDefaultControls: true | false,
                playSoundOnMouseOver: true | false,
                showCloseButtonInVideo: true | false
            }).init();
        }
    </script>
```
 - And basically That's it.

