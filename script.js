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

    initVariables();
    setObjects();
    $(window).resize(handleResize);
    $(window).scroll(handleScroll);
    handleClick();
    handleDrag();
    animateGenie(0, 1);

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
    }

    function setObjects()
    {
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

                if(genieHorizontalCenter < documentWidth/2)
                {
                    genieHorizontalStartPosition = - genie.width();
                }
                else
                {
                    genieHorizontalStartPosition = documentWidth;
                }
                geniesPositions.push(genieHorizontalStartPosition);
                genie.css("left", genieHorizontalStartPosition);
            });
            $(this).find("h1, h2, p, .final_animation").each(function(){
                $(this).fadeTo(0, 0);
            });
        });
    }

    function handleResize()
    {
        $(".items_box").css("height", $(".items_box").width()/3);
        height = $(window).height();
        documentLength = $(document).height();
        slidesCount = Math.round(documentLength / height) - 1;
        pinStep = height*0.7/slidesCount;
        progressBarOffset = height*0.3/2;
        handleHeight = $("#progress_handle").height();
    }

    function handleScroll()
    {
        scrollTop = $(window).scrollTop();
        animateBg(".plain_subpage");
        animateBg(".products_subpage");
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
        $( "#progress_bar" ).click(function() {
            $("#submenu").toggle(effect, options, duration);
        });

        $( "#scroll_down, #arrow_down").click(function(){
            animateScroll(windowHeight);
        });
    }
    function handleDrag()
    {
        $("#progress_handle").draggable({axis: "y", containment: "parent", grid: [ 0, Math.round(pinStep) ], stop: onDrag });
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
            $(this).css("background-position", "0 "+(($(this).position().top - scrollTop)/10 - 0.2 * windowHeight) +"px");
        });

    }
    function animateGenie(slide_id, new_slide_id)
    {
        //alert(slide_id+" "+new_slide_id);
        var current_genie = $("article:nth-of-type("+new_slide_id+") .genie");
        var previous_genie = $("article:nth-of-type("+slide_id+") .genie");
        var currentGenieLeftTargetPosition;
        var previousGenieLeftTargetPosition;
        if(geniesPositions[new_slide_id - 1] < documentWidth)
        {
            currentGenieLeftTargetPosition = 0+"";
        }
        else
        {
            currentGenieLeftTargetPosition = (parseInt($("article:nth-of-type("+slide_id+") .center_box").css("width")) - current_genie.width());
        }

        previousGenieLeftTargetPosition = Math.abs(geniesPositions[slide_id - 1]);

        var currentGenieAnimationDuration = 500;//Math.abs(geniesPositions[slide_id - 1]) * 3;
        var previousGenieAnimationDuration = 500;//Math.abs(geniesPositions[new_slide_id - 1]) * 3;

        // removes animation delay effect
        deQueueContentAnimation(new_slide_id);
        current_genie.dequeue();
        //--
        current_genie.animate({
            opacity: 1,
            left: currentGenieLeftTargetPosition
          }, previousGenieAnimationDuration, "easeInOutExpo", function(){
            showContent(new_slide_id);
          });

        // SAA
        deQueueContentAnimation(slide_id);
        previous_genie.dequeue();
        //--
        previous_genie.animate({
            opacity: 0,
            left: previousGenieLeftTargetPosition
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
        animateContent(id, 1);
    }
    function hideContent(id)
    {
        animateContent(id, 0);
    }
    function animateContent(id, alphaValue)
    {
        var _article = "article:nth-of-type("+id+")";
        var animatedObject = $(_article+" h1, "+_article+" h2,"+_article+" p");
        var finalAnimation = $(_article+" .final_animation");
        animatedObject.animate({opacity: alphaValue}, 500, function(){
            finalAnimation.animate({opacity: alphaValue}, 500);
        });
    }
    function deQueueContentAnimation(id)
    {
        var _article = "article:nth-of-type("+id+")";
        var animatedObject = $(_article).find("h1, h2, p");
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
