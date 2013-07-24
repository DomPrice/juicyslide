/*
  JUICY SLIDE ALL IN ONE CUSTOMIZABLE JQUERY SLIDESHOW 
  version 2.3.3
  author: Dom Price
  email: info@domprice.com

  USAGES:
    JuicySlide({
      "option":"value"
    });

  PARAMETERS:
    animate:
      BOOL: specifies whether or not the slideshow auto scrolls
    carousel: 
      STRING: CSS Selector ("#idname"), default "#slideshow_carousel", specifies the container element that will act as the carousel.
      this element will contain all the slides.
    circular:
      STRING: (true/false), default true, specifies if the last slide leads into the first or rewinds to the first
    interval:
      INTEGER: default 300, specifies the length in milliseconds the transition animation time
    speed:
      INTEGER: default 5000, specifies the length in milliseconds the time a slide stays displayed
    prev_button:
      STRING: CSS Selector, default ".slide-trigger-prev", specifies the element to click to make the slideshow show the previous slide
    next_button:
      STRING: CSS Selector, default ".slide-trigger-next", specifies the element to click to make the slideshow show the next slide
    viewport:
      STRING: CSS Selector ("#idname"), default "#slideshow_viewport", specifies the viewport container element that will act as window for the
      slideshow.
    direction:
      STRING: Specify the scroll direction of the slides, options (l2r: left-to-right, r2l: right-to-left [default], t2b: top-to-bottom, b2t: bottom-to-top),
    onslidechange:
      FUNCTION: Function to be performed when the slide has rotated.
    onrotate:
      FUNCTION: Alias for onslidechange.
    
    CHANGES:
      + Added omnidirectional slide ability as per v2.0.1
      + Added "goto_slide(slide_num)" public function (not yet fully tested)
      + Corrected I.E. 8.0.6 bug where the rewind would not trigger, solved by adding/subracting viewport width from carosel width
      + onrotate now works
      + renamed onrotate to onslidechange, (onrotate kept as alias for onslidechange) will not effect older versions because it never worked before v2.3.1
      
    KNOWN BUGS
      + Corrected I.E 8.0.6 glitches, however there is still a bug with slides being off by 1px that I can't seem to fix in I.E. 8.0.6 only

*/
function JuicySlide(opts) {
  
  // OPTIONS
  
  if((opts["interval"] != "") && (opts["interval"] != undefined)) {   
    var slide_interval = opts["interval"]; 
  } else {  
    var slide_interval = 5000; 
  }
  
  if((opts["speed"] != "") && (opts["speed"] != undefined)) {   
    var slide_speed = opts["speed"]; 
  } else {  
    var slide_speed = 300; 
  }
  
  if((opts["carousel"] != "") && (opts["carousel"] != undefined)) {   
    var slide_carousel = opts["carousel"]; 
  } else {  
    var slide_carousel = "#slideshow_carousel"; 
  }
  
  if((opts["circular"] != "") && (opts["circular"] != undefined)) { 
    if(opts["circular"] == "true") { 
      var slideshow_circular = true;
    } else if(opts["circular"] == "false") { 
      var slideshow_circular = false;
    }
  } else {  
    var slideshow_circular = true; 
  }
  
  if((opts["animate"] != "") && (opts["animate"] != undefined)) {   
    var slideshow_animate = opts["animate"]; 
  } else {  
    var slideshow_animate = true; 
  }
  
  if((opts["prev_button"] != "") && (opts["prev_button"] != undefined)) {   
    var slideshow_prev_button = opts["prev_button"]; 
  } else {  
    var slideshow_prev_button = ".slide-trigger-prev";  
  }
  
  if((opts["next_button"] != "") && (opts["next_button"] != undefined)) {   
    var slideshow_next_button = opts["next_button"]; 
  } else {  
    var slideshow_next_button = ".slide-trigger-next";  
  }
  
  if((opts["viewport"] != "") && (opts["viewport"] != undefined)) {   
    var slide_viewport = opts["viewport"]; 
  } else {  
    var slide_viewport = "#slideshow_viewport";  
  }
  
  if((opts["direction"] != "") && (opts["direction"] != undefined)) { 
    if(opts["direction"] == "l2r" || opts["direction"] == "left-to-right" || opts["direction"] == "east" || opts["direction"] == "right") {
      var slide_direction = "l2r";
    } else if(opts["direction"] == "r2l" || opts["direction"] == "right-to-left" || opts["direction"] == "west" || opts["direction"] == "left") {
      var slide_direction = "r2l";
    } else if(opts["direction"] == "t2b" || opts["direction"] == "top-to-bottom" || opts["direction"] == "south" || opts["direction"] == "down") {
      var slide_direction = "t2b";
    } else if(opts["direction"] == "b2t" || opts["direction"] == "bottom-to-top" || opts["direction"] == "north" || opts["direction"] == "up") {
      var slide_direction = "b2t";
    }
  } else {  
    var slide_direction = "r2l";  // defaults to right to left
  }
  
  if((opts["onslidechange"] != "") && (opts["onslidechange"] != undefined)) {   
    var on_slide_change = opts["onslidechange"]; 
  }  
  
  if((opts["onrotate"] != "") && (opts["onrotate"] != undefined)) {   // alias for onslidechange
    var on_slide_change = opts["onrotate"]; 
  }  
  
  /* PRIVATE FUNCTIONS AND VARS */

  var index = 0;
    var images = new Array();
    var slideshow_clicked = false;
  var slideshow_pause = false;
  var first_run = true;
  var slideshow_numslides = $(slide_carousel+" .slide").length;
  
    /* SLIDE SHOW CAROUSEL SETUP */
  var slideshow_viewport_width = parseInt($(slide_viewport).css("width"));
  var slideshow_viewport_height = parseInt($(slide_viewport).css("height"));
  var slideshow_carousel_width = parseInt($(slide_viewport).css("width"));
  var slideshow_carousel_height = parseInt($(slide_viewport).css("height"));
  
  /* ONLY RUN SLIDESHOW IF MULTIPLE SLIDES EXIST */
  if(slideshow_numslides > 1) {
    
    /* RUN INITIALIZER */
    slideShowSetup();
  
    /* SLIDE SHOW CONTROLS */
      $(slideshow_prev_button).click(
      function() { 
        gotoPrev();
      }
    ).hover( // pause when user hovers over controls
      function() { pauseSlideShow(); },
      function() { resumeSlideShow(); }
    );
  
      $(slideshow_next_button).click(
      function() { 
        gotoNext();
      }
    ).hover( // pause when user hovers over controls
      function() { pauseSlideShow(); },
      function() { resumeSlideShow(); }
    );
  
    /* PAUSE IT WHEN THE USER HOVERS OVER THE VIEWPORT */
    $(slide_viewport).hover(
      function() { pauseSlideShow(); },
      function() { resumeSlideShow(); }
    );
  
    /* AUTO ANIMATE */
    if(slideshow_animate == true) {
      var timer = setInterval(playSlide,slide_interval);
    }
    
  }
  
  function slide_scroll_left() {
    
        if(slideshow_clicked == true) {
          return;
        }
        var slideshow_viewport_width = parseInt($(slide_viewport).css("width"));
        var slideshow_carousel_width = parseInt($(slide_carousel).css("width"));
        var cur_xpos = parseInt($(slide_carousel).css("left"));
        var new_xpos = cur_xpos-slideshow_viewport_width;
    
        slideshow_clicked = true;
        animateSlideX(new_xpos);

    }
  
  function slide_scroll_right() {
    
    if(slideshow_clicked == true) {
      return;
    }
    var slideshow_viewport_width = parseInt($(slide_viewport).css("width"));
    var slideshow_carousel_width = parseInt($(slide_carousel).css("width"));
        var cur_xpos = parseInt($(slide_carousel).position().left);
        var new_xpos = cur_xpos+slideshow_viewport_width;

    slideshow_clicked = true;
        animateSlideX(new_xpos);
    
    }
  
  function slide_scroll_up() {
    
    if(slideshow_clicked == true) {
      return;
    }
    var slideshow_viewport_height = parseInt($(slide_viewport).css("height"));
    var slideshow_carousel_height = parseInt($(slide_carousel).css("height"));
        var cur_ypos = parseInt($(slide_carousel).position().top);
        var new_ypos = cur_ypos-slideshow_viewport_height;
    
    slideshow_clicked = true;
        animateSlideY(new_ypos);
    
    }
  
  function slide_scroll_down() {
    
    if(slideshow_clicked == true) {
      return;
    }
    var slideshow_viewport_height = parseInt($(slide_viewport).css("height"));
    var slideshow_carousel_height = parseInt($(slide_carousel).css("height"));
        var cur_ypos = parseInt($(slide_carousel).position().top);
        var new_ypos = cur_ypos+slideshow_viewport_height;
    
    slideshow_clicked = true;
        animateSlideY(new_ypos);
    
    }
  
  function slide_scroll_beginning() {
        if(slideshow_clicked == true) {
          return;
        }
    slideshow_clicked = true; // turn off so no one can advance the slide while we are resetting
    
    if(slideshow_circular == true) {
      
      // RESET SLIDE POSITIONS TO START
      resetSlidePositionsStart();
            slideshow_clicked = false; // turn off so we can advance the slide
      
    } else {
      
      // SCROLL TO FIRST SLIDE
      if(slide_direction == "r2l") {
        var new_xpos = 0;
            $(slide_carousel).animate({
          "left":new_xpos+"px"
        },{
                duration: (slide_speed*2),
                complete:  function() {
                  slideshow_clicked = false;
          }
        });
      } else if(slide_direction == "l2r") {
        var new_xpos = 0;
            $(slide_carousel).animate({
          "left":new_xpos+"px"
        },{
                duration: (slide_speed*2),
                complete:  function() {
                  slideshow_clicked = false;
          }
        });
      } else if(slide_direction == "b2t") {
        var new_ypos = 0;
            $(slide_carousel).animate({
          "top":new_ypos+"px"
        },{
                duration: (slide_speed*2),
                complete:  function() {
                  slideshow_clicked = false;
          }
        });
      } else if(slide_direction == "t2b") {
        var new_ypos = 0;
            $(slide_carousel).animate({
          "top":new_ypos+"px"
        },{
                duration: (slide_speed*2),
                complete:  function() {
                  slideshow_clicked = false;
          }
        });
      }
      
    }
    }
  
  function slide_scroll_end() {
        if(slideshow_clicked == true) {
          return;
        }
    slideshow_clicked = true; // turn off so no one can advance the slide while we are resetting
    
    if(slideshow_circular == true) {

      // RESET SLIDE POSITIONS TO START
      resetSlidePositionsEnd();
            slideshow_clicked = false; // turn off so we can advance the slide
      
    } else {
      
      if(slide_direction == "l2r" || slide_direction == "r2l") {
        var slideshow_viewport_width = parseInt($(slide_viewport).css("width"));
        var slideshow_carousel_width = parseInt($(slide_carousel).css("width"));
      } else if(slide_direction == "t2b" || slide_direction == "b2t") {
        var slideshow_viewport_height = parseInt($(slide_viewport).css("height"));
        var slideshow_carousel_height = parseInt($(slide_carousel).css("height"));
      }
      
      // SCROLL TO FIRST SLIDE
      if(slide_direction == "r2l") {
        var new_xpos = 0-(slideshow_carousel_width+slideshow_viewport_width);
        $(slide_carousel).animate({
          "left":new_xpos+"px"
        },{
                duration: (slide_speed*2),
                complete:  function() {
                  slideshow_clicked = false;
          }
        });
      } else if(slide_direction == "l2r") {
        var new_xpos = 0-(slideshow_carousel_width-slideshow_viewport_width);
            $(slide_carousel).animate({
          "left":new_xpos+"px"
        },{
                duration: (slide_speed*2),
                complete:  function() {
                  slideshow_clicked = false;
          }
        });
      } else if(slide_direction == "b2t") {
        var new_ypos = 0-(slideshow_carousel_height+slideshow_viewport_height);
            $(slide_carousel).animate({
          "top":new_ypos+"px"
        },{
                duration: (slide_speed*2),
                complete:  function() {
                  slideshow_clicked = false;
          }
        });
      } else if(slide_direction == "t2b") {
        var new_ypos = 0-(slideshow_carousel_height-slideshow_viewport_height);
            $(slide_carousel).animate({
          "top":new_ypos+"px"
        },{
                duration: (slide_speed*2),
                complete:  function() {
                  slideshow_clicked = false;
          }
        });
      }
      
    }
    }
  
  function playSlide() {
    
    if(slideshow_pause == false) { // check if slide show is paused
    
      // GET VIEWPORT SETTINGS
      if(slide_direction == "r2l" || slide_direction == "l2r") {
            var slideshow_viewport_width = parseInt($(slide_viewport).css("width"));
            var slideshow_carousel_width = parseInt($(slide_carousel).css("width"));
      } else if(slide_direction == "t2b" || slide_direction == "b2t") {
            var slideshow_viewport_height = parseInt($(slide_viewport).css("height"));
            var slideshow_carousel_height = parseInt($(slide_carousel).css("height"));
      }
      
      // ADJUST WIDTH/HEIGHT
      if(slide_direction == "r2l") {  // works: I.E. 8.0.6, I.E. 8.0.7, Firefox
        var cur_xpos   = parseInt($(slide_carousel).position().left);
        var new_xpos   = cur_xpos-slideshow_viewport_width;
        var limit     = (0-(slideshow_carousel_width-slideshow_viewport_width));
        var new_slide = (Math.ceil(Math.abs(new_xpos/slideshow_viewport_width)))%slideshow_numslides + 1;
        if(new_xpos < limit) { // We have to subtract slideshow width because IE will not trigger the rewind if we don't
          slide_scroll_beginning();
          slide_scroll_left();
          resetTimer();
        } else {
          slide_scroll_left();
        }
      } else if(slide_direction == "l2r") { // works: I.E. 8.0.6 (with glitches), I.E. 8.0.7, Firefox
        var cur_xpos   = parseInt($(slide_carousel).position().left);
        var new_xpos   = cur_xpos+slideshow_viewport_width;
        var limit     = slideshow_viewport_width;
        var new_slide = (Math.ceil(Math.abs(new_xpos/slideshow_viewport_width)))%slideshow_numslides + 1;
        if(new_xpos >= limit) {
          slide_scroll_end();
          slide_scroll_right();
          resetTimer();
        } else {
          slide_scroll_right();
        }
      } else if(slide_direction == "t2b") { // works: I.E. 8.0.6, I.E. 8.0.7, Firefox
        var cur_ypos   = parseInt($(slide_carousel).position().top);
        var new_ypos   = cur_ypos+slideshow_viewport_height;
        var limit    = 0;
        var new_slide = (Math.ceil(Math.abs(new_ypos/slideshow_viewport_height)))%slideshow_numslides + 1;
        if(new_ypos > limit) {
          slide_scroll_end();
          slide_scroll_down();
          resetTimer();
        } else {
          slide_scroll_down();
        }
      } else if(slide_direction == "b2t") { // works: I.E. 8.0.6, works: I.E. 8.0.7, Firefox
        var cur_ypos   = parseInt($(slide_carousel).position().top);
        var new_ypos   = cur_ypos-slideshow_viewport_height;
        var limit     = (0-(slideshow_carousel_height-slideshow_viewport_height));
        var new_slide = (Math.ceil(Math.abs(new_ypos/slideshow_viewport_height)))%slideshow_numslides + 1;
        if(new_ypos < limit) { // We have to subtract slideshow height because IE will not trigger the rewind if we don't
          slide_scroll_beginning();
          slide_scroll_up();
          resetTimer();
        } else {
          slide_scroll_up();
        }
      }
    }
    
    // EXECUTE ON SLIDE CHANGE FUNCTION
    if(slideshow_pause === false){
      if(on_slide_change != undefined){
        on_slide_change(new_slide);
      }
    }
  }  
  
  function rewindSlide() {
    
    if(slideshow_pause == false) { // check if slide show is paused
    
      // GET VIEWPORT SETTINGS
      if(slide_direction == "r2l" || slide_direction == "l2r") {
            var slideshow_viewport_width = parseInt($(slide_viewport).css("width"));
            var slideshow_carousel_width = parseInt($(slide_carousel).css("width"));
      } else if(slide_direction == "t2b" || slide_direction == "b2t") {
            var slideshow_viewport_height = parseInt($(slide_viewport).css("height"));
            var slideshow_carousel_height = parseInt($(slide_carousel).css("height"));
      }
    
      if(slide_direction == "r2l") { // works: I.E. 8.0.6 (with glitches), I.E. 8.0.7, Firefox
        var cur_xpos   = parseInt($(slide_carousel).position().left);
        var new_xpos   = cur_xpos+slideshow_viewport_width;
        var limit     = slideshow_viewport_width;
        var new_slide = (Math.ceil(Math.abs(new_xpos/slideshow_viewport_width)))%slideshow_numslides + 1;
        if(new_xpos >= limit) {
          slide_scroll_end();
          slide_scroll_right();
          resetTimer();
        } else {
          slide_scroll_right();
        }
      } else if(slide_direction == "l2r") { // works: I.E. 8.0.6, works: I.E. 8.0.7, Firefox
        var cur_xpos   = parseInt($(slide_carousel).position().left);
        var new_xpos  = cur_xpos-slideshow_viewport_width;
        var limit     = ((slideshow_viewport_width-slideshow_carousel_width));
        var new_slide = (Math.ceil(Math.abs(new_xpos/slideshow_viewport_width)))%slideshow_numslides + 1;
        if(new_xpos < limit) {
          slide_scroll_beginning();
          slide_scroll_left();
          resetTimer();
        } else {
          slide_scroll_left();
        }
      } else if(slide_direction == "t2b") { // works: I.E. 8.0.6, I.E. 8.0.7, Firefox
        var cur_ypos   = parseInt($(slide_carousel).position().top);
        var new_ypos   = cur_ypos+slideshow_viewport_height;
        var limit     = ((slideshow_viewport_height*2)+(slideshow_viewport_height-slideshow_carousel_height));
        var new_slide = (Math.ceil(Math.abs(new_ypos/slideshow_viewport_height)))%slideshow_numslides + 1;
        if(new_ypos < limit) {
          slide_scroll_beginning();
          slide_scroll_up();
          resetTimer();
        } else {
          slide_scroll_up();
        }
      } else if(slide_direction == "b2t") { // works: I.E. 8.0.6, I.E. 8.0.7, Firefox
        var cur_ypos   = parseInt($(slide_carousel).position().top);
        var new_ypos   = cur_ypos-slideshow_viewport_height;
        var limit     = 0-(slideshow_viewport_height*2);
        var new_slide = (Math.ceil(Math.abs(new_ypos/slideshow_viewport_height)))%slideshow_numslides + 1;
        if(new_ypos > limit) {
          slide_scroll_end();
          slide_scroll_down();
          resetTimer();
        } else {
          slide_scroll_down();
        }
      }
      
      // EXECUTE ON SLIDE CHANGE FUNCTION
      if(slideshow_pause === false){
        if(on_slide_change != undefined){
          on_slide_change(new_slide);
        }
      }
    }
    
  }
  
  function slideShowSetup() {
    
    // IF CIRCULAR, APPEND A GHOST SLIDE TO THE END TO MAKE IT APPEAR INFINITE
    if(slideshow_circular) {
      var first_slide_html = "<div class=\"slide\">"+$(slide_carousel+" .slide:first").html()+"</div>"; // grab first slide class child of the carousel
      $(slide_carousel).append(first_slide_html);
    }
    
    // SET SLIDE POSITIONS
    resetSlidePositionsStart();

  }
  
  function resetSlidePositionsStart() {
    
    // STARTING DIMENSIONS
    if(slide_direction == "r2l" || slide_direction == "l2r" ) {
        var slideshow_car_width = 0;
        $(slide_carousel+" .slide").each(function() { //  grab slide class child of the carousel
          slideshow_car_width += slideshow_viewport_width; // adjust for each new slide
        });
      $(slide_carousel).css({"width" : slideshow_car_width+"px" });
    } else if(slide_direction == "t2b" || slide_direction == "b2t" ) {
      var slideshow_car_height = 0;
        $(slide_carousel+" .slide").each(function() { //  grab slide class child of the carousel
          slideshow_car_height += slideshow_viewport_height; // adjust for each new slide
        });
      $(slide_carousel).css({"height" : slideshow_car_height+"px" });
    }
    
    // START POSITIONS AND DIMENSIONS
    if(slide_direction == "r2l") {
      $(slide_carousel).css({"left" : "0px"}); // start at first slide
    } else if(slide_direction == "l2r") {
      $(slide_carousel).css({"left" : "0px"}); // start at first slide
    } else if(slide_direction == "b2t") {
      $(slide_carousel).css({"top" : "0px"}); // start at first slide  
    } else if(slide_direction == "t2b") {
      $(slide_carousel).css({"top" : "0px"}); // start at first slide
    }
    
  }
  
  function resetSlidePositionsEnd() {
    
    // STARTING DIMENSIONS
    if(slide_direction == "r2l" || slide_direction == "l2r" ) {
        var slideshow_car_width = 0;
        $(slide_carousel+" .slide").each(function() { //  grab slide class child of the carousel
          slideshow_car_width += slideshow_viewport_width; // adjust for each new slide
        });
      $(slide_carousel).css({"width" : slideshow_car_width+"px" });
    } else if(slide_direction == "t2b" || slide_direction == "b2t" ) {
      var slideshow_car_height = 0;
        $(slide_carousel+" .slide").each(function() { //  grab slide class child of the carousel
          slideshow_car_height += slideshow_viewport_height; // adjust for each new slide
        });
      $(slide_carousel).css({"height" : slideshow_car_height+"px" });
    }

    // START POSITIONS AND DIMENSIONS
    if(slide_direction == "r2l") {
      $(slide_carousel).css({"left" : (0-(slideshow_car_width-slideshow_viewport_width))+"px"}); // start at last slide
    } else if(slide_direction == "l2r") {
      $(slide_carousel).css({"left" : (0-(slideshow_car_width-slideshow_viewport_width))+"px"}); // start at last slide
    } else if(slide_direction == "b2t") {
      $(slide_carousel).css({"top" : (0-(slideshow_car_height-slideshow_viewport_height))+"px"}); // start at last slide  
    } else if(slide_direction == "t2b") {
      $(slide_carousel).css({"top" : (0-(slideshow_car_height-slideshow_viewport_height))+"px"}); // start at last slide
    }
    
  }
  
  function resetTimer() {
    if(slideshow_animate == true) {
      window.clearInterval(timer);
      timer = setInterval(playSlide,slide_interval); //reset timer when button is clicked so the slide doesn't immediately change
    }  
  }  
  
  function animateSlideX(new_xpos) {
    $(slide_carousel).animate({
      "left":new_xpos+"px"
    },{
            duration: slide_speed,
            complete:  function() { 
        resetTimer(); //reset timer when button is clicked so the slide doesn't immediately change
                slideshow_clicked = false;
            }
    });  
  }
  
  function animateSlideY(new_ypos) {
    $(slide_carousel).animate({
      "top":new_ypos+"px"
    },{
            duration: slide_speed,
            complete:  function() { 
        resetTimer(); //reset timer when button is clicked so the slide doesn't immediately change
                slideshow_clicked = false;
            }
    });  
  }
  
  function pauseSlideShow() {
    slideshow_pause = true;
  }
  
  function resumeSlideShow() {
    slideshow_pause = false;  
  }

  function gotoPrev() {
    resumeSlideShow();
    rewindSlide();
  }
  
  function gotoNext() {
    resumeSlideShow();
    playSlide();
  }
  
  function gotoSlide(slide_num) {
    if(slide_direction == "l2r" || slide_direction == "r2l") {
      var new_xpos = (0-((slideshow_viewport_width*parseInt(slide_num))-slideshow_viewport_width));
      $(slide_carousel).animate({
        "left":new_xpos+"px"
      },{
              duration: slide_speed,
              complete:  function() { 
          $(slide_carousel).css({"left":new_xpos+"px"}); // for older versions of I.E., Forces the slide into the correct position;
          resetTimer(); //reset timer when button is clicked so the slide doesn't immediately change
                  slideshow_clicked = false;
              }
      });  
    } else if(slide_direction == "t2b" || slide_direction == "b2t") {
      var new_ypos = (0-((slideshow_viewport_height*parseInt(slide_num))-slideshow_viewport_height));
      $(slide_carousel).animate({
        "top":new_ypos+"px"
      },{
              duration: slide_speed,
              complete:  function() { 
          $(slide_carousel).css({"top":new_ypos+"px"}); // for older versions of I.E., Forces the slide into the correct position;
          resetTimer(); //reset timer when button is clicked so the slide doesn't immediately change
                  slideshow_clicked = false;
              }
      });  
    }
      
    // EXECUTE ON SLIDE CHANGE FUNCTION
    if(on_slide_change != undefined){
      on_slide_change(slide_num);
    }
    
  }
  
  /* PUBLIC FUNCTIONS */
  
  this.run = function() {
    resumeSlideShow();
  };
  
  this.pause = function() {
    pauseSlideShow();
  };
    
  this.next = function() {
    gotoNext();
  };
  
  this.prev = function() {
    gotoPrev();
  };
  
  this.goto_slide = function(slide_num) {
    gotoSlide(slide_num);
  };
  
} // END JUICYSLIDE