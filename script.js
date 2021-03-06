
$.fn.slideFadeToggle  = function(speed, easing, callback) {
        return this.animate({opacity: 'toggle', height: 'toggle'}, speed, easing, callback);
    };
    $.fn.animateRotate = function(angle, duration, easing, complete) {
      return this.each(function() {
        var $elem = $(this);

        $({deg: $(this).getRotationDegrees()}).animate({deg: angle}, {
          duration: duration,
          easing: easing,
          step: function(now) {
            $elem.css({
               transform: 'rotate(' + now + 'deg)'
             });
          },
          complete: complete || $.noop
        });
      });
    };
    $.fn.getRotationDegrees = function() {
        var matrix = this.css("-webkit-transform") ||
        this.css("-moz-transform")    ||
        this.css("-ms-transform")     ||
        this.css("-o-transform")      ||
        this.css("transform");
        if(matrix !== 'none') {
            var values = matrix.split('(')[1].split(')')[0].split(',');
            var a = values[0];
            var b = values[1];
            var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
        } else { var angle = 0; }
        return (angle < 0) ? angle + 360 : angle;
    }
$(document).ready(function(){
    var windowHeight;
    var documentWidth;
    var documentLength;
    var scrollTop;
    var slidesCount;
    var pinStep;
    var progressBarOffset;
    var handleHeight;
    var pinPosition;
    var slideID;
    var newSlideID;
    var manualScrolling;
    var geniesPositions;
    var triggerWindowScroll;
    var checkIfSlideAdjustedInterval;
    var wheelScrollValue;

    initVariables();
    setObjects();
    $(window).resize(handleResize);
    $(window).scroll(handleScroll);
    handleSlideSnapping();
    handleClick();
    handleDrag();
    animateGenie(2, 1);

    function initVariables()
    {
        windowHeight = $(window).height();
        documentWidth = $(document).width();
        documentLength = $(document).height();
        slidesCount = Math.round(documentLength / windowHeight) - 1;
        pinStep = windowHeight*0.7/slidesCount;
        progressBarOffset = windowHeight*0.3/2;
        handleHeight = $("#progress_handle").height();
        slideID = 2;
        newSlideID = 1;
        manualScrolling = true;
        geniesPositions = [];
        triggerWindowScroll = true;
    }
    function setObjects()
    {
        animateScroll(0);

        //add progress bar items
        for(var i=0; i<slidesCount; i++)
        {
            $("#progress_bar > ul").append( "<li></li>" );
        }

        //submenu settings
        $("#submenu").hide();

        //set objects on animation start positions
        $("article").each(function(){
            $(this).find(".genie").each(function(){
                var genie = $(this);
                var genieHorizontalCenter = genie.offset().left + genie.width()/2;
                var genieHorizontalStartPosition;
                var genieHorizontalTargetPosition;

                if(genieHorizontalCenter < documentWidth/2)
                {
                    genieHorizontalStartPosition = -genie.offset().left - genie.width();
                    genieHorizontalTargetPosition = 0;
                }
                else
                {
                    genieHorizontalStartPosition = genie.offset().left + genie.width();
                    genieHorizontalTargetPosition = genie.position().left;
                }

                var positions = [genieHorizontalStartPosition, genieHorizontalTargetPosition];
                geniesPositions.push(positions);
                genie.css("left", genieHorizontalStartPosition);
            });
            $(this).find("h1, h2, h3, p, .illustration, .final_animation").each(function(){
                $(this).fadeTo(0, 0);
            });
            $(this).find("li").prev().each(function(){
                $(this).fadeTo(0, 0);
            });
            $(this).find("li").next().each(function(){
                $(this).fadeTo(0, 0);
            });
            $(".foldable_box:nth-of-type(2) ul").hide();
            $(".foldable_box:nth-of-type(1) h2").find("span").animateRotate(180);
        });
    }

    function handleResize()
    {
        windowHeight = $(window).height();
        documentWidth = $(document).width();
        documentLength = $(document).height();
        slidesCount = Math.round(documentLength / windowHeight) - 1;
        pinStep = windowHeight*0.7/slidesCount;
        progressBarOffset = windowHeight*0.3/2;
        handleHeight = $("#progress_handle").height();
        $(".items_box").css("height", $(".items_box").width()/3);
        handleDrag();
        triggerWindowScroll = false;
        $(window).scrollTop(newSlideID * windowHeight);
        checkIfSlideAdjustedInterval = setInterval(checkIfSlideAdjusted, 100);
    }
    function checkIfSlideAdjusted()
    {
        if($(window).scrollTop() == newSlideID * windowHeight)
        {
            clearInterval(checkIfSlideAdjustedInterval);
            triggerWindowScroll = true;
        }
    }
    function handleSlideSnapping()
    {
         $("html, body").bind('DOMMouseScroll', function(e){
             var _scrollValue = e.originalEvent.detail * -1;
             if(triggerWindowScroll)
             {
                triggerWindowScroll = false;
                setTimeout(function(){
                    triggerWindowScroll = true;
                }, 250);
                if(_scrollValue < 0) {
                     newSlideID++;
                     animateScroll(windowHeight * newSlideID);
                 }else if(_scrollValue > 0){
                     newSlideID--;
                     animateScroll(windowHeight * newSlideID);
                 }
             }

             //prevent page fom scrolling
             return false;
         });

         //IE, Opera, Safari
         $(window).bind('mousewheel', function(e){
             if(triggerWindowScroll)
             {
                triggerWindowScroll = false;
                setTimeout(function(){
                    triggerWindowScroll = true;
                }, 250);
                if(e.originalEvent.wheelDelta < 0 && newSlideID < slidesCount) {
                     newSlideID++;
                     animateScroll(windowHeight * newSlideID);
                 }else if(e.originalEvent.wheelDelta > 0 && newSlideID > 0){
                     newSlideID--;
                     animateScroll(windowHeight * newSlideID);
                 }
             }

             //prevent page fom scrolling
             return false;
         });
    }
    function handleScroll()
    {
        scrollTop = $(window).scrollTop();
        animateBg(".plain_page");
        animateBg(".products_page");
        newSlideID = Math.round(scrollTop / windowHeight);

        if(slideID != newSlideID)
        {
            animateGenie(slideID+1, newSlideID+1);

            var current;
            slideID = newSlideID;
            $("#progress_bar > ul > li").removeAttr("id","current");
            $("#progress_bar > ul").removeAttr("id","current");

            if(slideID == 0)
            {
                current = "#progress_bar > ul";
            }
            else
            {
                current = "#progress_bar > ul > li:nth-child("+slideID+")";
            }
            $(current).attr("id","current");
            $("#progress_handle").text(slideID+1);
        }
        pinPosition = scrollTop + progressBarOffset + slideID*pinStep - handleHeight/2;
        if(manualScrolling) $("#progress_handle").offset({top: pinPosition});
    }

    function handleClick()
    {
        var effect = "slide";
        var options = { direction: "right" };
        var duration = 500;
        $("#progress_bar").click(function() {
            $("#submenu").toggle(effect, options, duration);
        });

        $("#scroll_down, #arrow_down").click(function(){
            animateScroll(windowHeight);
        });

        $(".foldable_box h2").click(function(){
            $(".foldable_box:nth-of-type(1) ul, .foldable_box:nth-of-type(2) ul").slideFadeToggle(500, "easeOutCubic");
            $(".foldable_box").each(function(){
                var currentRotation = $(this).find("span").getRotationDegrees();
                $(this).find("span").animateRotate(Math.abs(currentRotation - 180));
            });
        });
    }
    function handleDrag()
    {
        $("#progress_handle").draggable({axis: "y", containment: "parent", grid: [ 0, Math.round(pinStep)/5 ], stop: onDrag });
    }
    function onDrag()
    {
        manualScrolling = false;
        var scrollValue = Math.round($("#progress_handle").position().top / pinStep) * windowHeight;
        animateScroll(scrollValue);
    }
    function animateBg(containerClass)
    {
        $(containerClass).each(function(){
            //$(this).css("background-position", "0 "+(($(this).position().top + scrollTop)/5 - 0.2 * windowHeight  - 1/7 * windowHeight * $(this).index()) +"px");
            $(this).css("background-position", "0 "+(($(this).index()*windowHeight - $(window).scrollTop())/5 + windowHeight)+"px");
        });
    }
    function animateGenie(slide_id, new_slide_id)
    {
        var current_genie = $("article:nth-of-type("+new_slide_id+") .genie");
        var previous_genie = $("article:nth-of-type("+slide_id+") .genie");
        var currentGenieTargetPosition;
        var previousGenieTargetPosition;
        var animationDurationTreshold = 2500;

        currentGenieTargetPosition = geniesPositions[new_slide_id - 1][1];
        previousGenieTargetPosition = geniesPositions[slide_id - 1][0];

        var currentGenieAnimationDuration = Math.abs(geniesPositions[slide_id - 1][0] - geniesPositions[slide_id - 1][1]) * 4;
        var previousGenieAnimationDuration = Math.abs(geniesPositions[new_slide_id - 1][0] - geniesPositions[new_slide_id - 1][1]) * 4;

        if(currentGenieAnimationDuration > animationDurationTreshold) currentGenieAnimationDuration = animationDurationTreshold;
        if(previousGenieAnimationDuration > animationDurationTreshold) previousGenieAnimationDuration = animationDurationTreshold;

        // removes animation delay effect
        deQueueContentAnimation(new_slide_id);
        current_genie.stop();
        //--
        current_genie.animate({
            opacity: 1,
            left: currentGenieTargetPosition
          }, previousGenieAnimationDuration, "easeInOutExpo", function(){
            showContent(new_slide_id);
          });
        // SAA
        deQueueContentAnimation(slide_id);
        previous_genie.stop();
        //--
        previous_genie.animate({
            opacity: 0,
            left: previousGenieTargetPosition
          }, currentGenieAnimationDuration, "easeInOutExpo", function(){
            hideContent(slide_id);
          });
    }
    function animateScroll(targetPosition)
    {
        $("html, body").animate({ scrollTop: targetPosition}, 700, "easeOutCubic", function(){
            manualScrolling = true;
        });
    }
    function showContent(id)
    {
        animateContent(id, 1, 500);
    }
    function hideContent(id)
    {
        animateContent(id, 0, 500);
    }
    function animateContent(id, alphaValue, duration)
    {
        var _article = "article:nth-of-type("+id+")";
        var animatedObject = $(_article+" h1, "+_article+" h2,"+_article+" h3,"+_article+" .illustration,"+_article+" p");
        var animatedBefore = $(_article+" li").prev();
        var animatedNext = $(_article+" li").next();
        var finalAnimation = $(_article+" .final_animation");
        animatedObject.animate({opacity: alphaValue}, duration, function(){
            finalAnimation.animate({opacity: alphaValue}, duration);
        });

        //animate punctuation:
        animatedBefore.animate({opacity: alphaValue}, duration);
        animatedNext.animate({opacity: alphaValue}, duration);
    }
    function deQueueContentAnimation(id)
    {
        var _article = "article:nth-of-type("+id+")";
        var animatedObject = $(_article).find("h1, h2, h3, .illustration, p");
        var finalAnimation = $(_article).find(".final_animation");
        animatedObject.each(function(){
            $(this).stop();
        });
        finalAnimation.each(function(){
            $(this).stop();
        });
    }
    /*
    $("#submenu").hide();

    var effect = 'slide';

    // Set the options for the effect type chosen
    var options = { direction: "right"};

    // Set the duration (default: 400 milliseconds)
    var duration = 500;





    $("#progress_handle").draggable({axis: "y", containment: "parent", grid: [ 0, Math.round(pinStep) ], stop: onDrag });

    for(var i=0; i<slidesCount; i++)
    {
        $("#progress_bar > ul").append( "<li></li>" );
    }

    $(window).scroll(onScroll);

    function onDrag()
    {
        manualScrolling = false;
        var scrollValue = Math.round($("#progress_handle").position().top / pinStep) * windowHeight;
        $("html, body").animate({ scrollTop: scrollValue }, 500, function(){
            manualScrolling = true;
        });
    }

    function animateBg(containerClass)
    {
        $(containerClass).each(function(){
            $(this).css("background-position", "0 "+(($(this).position().top - scrollTop)/10 - 0.2 * windowHeight) +"px");
        });

    }
    function animateGenie(slide_id, new_slide_id)
    {
        $("article:nth-of-type("+new_slide_id+") .genie").animate({
            opacity: 1,
            left: "0"
          }, 500, function(){
            showContent(new_slide_id);
          });

        $("article:nth-of-type("+slide_id+") .genie").animate({
            opacity: 0,
            left: "-=200"
          }, 500, function(){
            hideContent(slide_id);
          });
    }
    function showContent(id)
    {
        $("article:nth-of-type("+id+") h1, article:nth-of-type("+id+") h2, article:nth-of-type("+id+") p").animate({
            opacity: 1
            }, 500, function(){
        });
    }
    function hideContent(id)
    {
        $("article:nth-of-type("+id+") h1, article:nth-of-type("+id+") h2, article:nth-of-type("+id+") p").animate({
            opacity: 0
            }, 500, function(){
        });
    }
    $( window ).resize(onResize);
    function onResize()
    {
        $(".items_box").css("height", $(".items_box").width()/3);
        height = $(window).height();
        documentLength = $(document).height();
        slidesCount = Math.round(documentLength / height) - 1;
        pinStep = height*0.7/slidesCount;
        progressBarOffset = height*0.3/2;
        handleHeight = $("#progress_handle").height();
    }


*/

});
