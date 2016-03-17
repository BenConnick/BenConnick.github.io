/* 
 JS code for MorningStar_Animate
Author: Ben Connick
 */

// uses jQuery, jQuery UI, and d3 (also touchpunch)

/* Code is organized roughly in the order that it is expected to be run in
 * The exception to this rule is that subroutines are generally in proximity of the functions that use them
 * First, the global variables used by the graph are declared
 * Then functions called during graph creation are defined
 * Then the graph is defined and attached to an svg, which is appended to the existing elements
 * Then some global variables used by the follwing funcitons are declared
 * Then an "on load" sort of function sets everything up and populates the carousel with pictures and gives the pictures id numbers
 * The first action that the user is expected to take is to click, so that is the first function.
 * Next are some of the interactions with the buttons at the bottom of the screen
 *    (in the presentation, the first action is to turn everything except inflation off)
 * attachLineLabel is partly responsible for displaying the line-labels that appear in carousel view
 *    because these labels are not a standard featuer of d3's graphing library, their correct positions had to be estimated this way
 * Next is the declaration of everything imporatant to the jQuery UI slider, which is like an invisible scrollbar that sits on top of the graph and is controlled by dragging with the mouse or clicking
 * There is a function that handles behaviors common to dragging and clicking
 * The html mouse up event handles many of the click responses in all screens
 *    the mouse up event has several conditionals for specifiying each situation so that it is not running excessive or redundant code (hopefully)
 *    These include: "history view" (and single vs. double click), "verticals mode", "carousel mode", and whether the slider is at the edge of the screen in either direction
 * The old hover functions don't get used anymore, but we want to put them back someday, so they're still there, but they never run/fire
 * hideShowLines is a button behavior and its function is eponymous, the global variable lineToggles is an example of where global variables are declared in proximity of the functions that use them
 * adjustWithPictures is an old function repurposed to compute which vertical the graph should snap to, based on the decade the user has  moved to
 * The vertical click function uses the value of the decade clicked on to generate an appropriate data set and viewing window to pass to the switchToCarousel function
 *    it has two helper functions: (min/max)ValueForDateRange, which each use the helper function datesIndexOf
 *    as of recently, it also makes use of createNewData, which converts the existing arrays found in Data.js to make trends appear more dramatic by restarting the investment period. It's easier to understand if you play with it than for me to explain
 * The two "switchTo..." functions switch views, and if you run the program you will see that it is as though you have switched to another page
 * zoom controls the range of the graph, and where it displays on the screen by "zooming" in to the important bits
 * The misnamed "adjust x lines" actually moves the dates so that they are roughly centered in their year, rather than centered at the start of the year
 * Lastly is the definition of the function that runs when the user clicks a picture in carousel view, showHistoryView
 * And also the functions for using the arrows in the picture viewer (history view)
 */


// graph variable declarations
var margin = {top: 0, right: 0, bottom: 0, left: 0};
var width = 980 - margin.left - margin.right;
var height = 480 - margin.top - margin.bottom;
var large_cap_csv = lc_csv;
var small_cap_csv = sc_csv;
var bonds_csv = b_csv;
var tbills_csv = tb_csv;
var inflation_csv = inf_csv;

// large data moved to Data.js

// array of js Date objects
var dates = [];
// populate dates
dateStrings.forEach(function(d, i) {
    dates[i] = convertStringToDate(d);
});

function convertStringToDate(dateString) {
    // converts from abbreviations to values
    var monthMap = {'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11};
    var newDate;
    // date data is formatted two different ways for some reason...
    // format type 1
    if (isNaN(dateString.substring(0, 2))) {
        var lastTwoYearDigits = parseInt(dateString.substring(4, 6));
        var monthAbv = dateString.substring(0, 3);
        if (lastTwoYearDigits > 20) {
            newDate = new Date(1900 + lastTwoYearDigits, monthMap[monthAbv]);
        }
        else {
            newDate = new Date(2000 + lastTwoYearDigits, monthMap[monthAbv]);
        }
    }
    // format type 2
    else {
        var lastTwoYearDigits = parseInt(dateString.substring(0, 2));
        var monthAbv = dateString.substring(3, 6);
        if (lastTwoYearDigits > 20) {
            newDate = new Date(1900 + lastTwoYearDigits, monthMap[monthAbv]);
        }
        else {
            newDate = new Date(2000 + lastTwoYearDigits, monthMap[monthAbv]);
        }
    }
    return newDate;
}

var x = d3.time.scale()
        .domain([dates[0], dates[dates.length-1]])
        .range([0, width]);

var y = d3.scale.log()
        .domain([0.1, 30000])
        .range([height, 0]);
        

var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(600);

var yAxis = d3.svg.axis()
        .scale(y)
        .tickValues([1,2,5,10,100,1000,10000])
        .orient("left")
        .tickSize(2000)
        .tickFormat(function(d) {
            return y.tickFormat(5, d3.format("$"))(d);
        });

var svg = d3.select("#graphArea").append("svg")
        .attr("class","graph")
        .attr("position", "absolute")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// svg clip path, it's like a layer mask
svg.append("clipPath")
        .attr("id", "rectClip")
        .append("rect")
        .attr("width", 0)
        .attr("height", 100000); // arbitrary large value

// area definition
var area = d3.svg.area()
        .x(function(d, i) {
            return x(dates[i]);
        })
        .y0(function() {
            return y(1);
        })
        .y1(function(d, i) {
            return y(d);
        });

// line definition
var line = d3.svg.line()
        .x(function(d, i) {
            return x(dates[i]);
        })
        .y(function(d, i) {
            return y(d);
        });
//.interpolate("cardinal"); <- this controls whether it's smooth

 // area small stocks
svg.append("path")
        .datum(small_cap_csv)
        .attr("class", "area2")
        .attr("d", area)
        .attr("clip-path", "url(#rectClip)");
// path small stocks
svg.append("path")
        .datum(small_cap_csv)
        .attr("class", "line2")
        .attr("d", line)
        .attr("clip-path", "url(#rectClip)");
// area large stocks
svg.append("path")
        .datum(large_cap_csv)
        .attr("class", "area1")
        .attr("d", area)
        .attr("clip-path", "url(#rectClip)");
// path large stocks
svg.append("path")
        .datum(large_cap_csv)
        .attr("class", "line1")
        .attr("d", line)
        .attr("clip-path", "url(#rectClip)");
// area bonds
svg.append("path")
        .datum(bonds_csv)
        .attr("class", "area3")
        .attr("d", area)
        .attr("clip-path", "url(#rectClip)");
// path bonds
svg.append("path")
        .datum(bonds_csv)
        .attr("class", "line3")
        .attr("d", line)
        .attr("clip-path", "url(#rectClip)");

// area tbills
svg.append("path")
        .datum(tbills_csv)
        .attr("class", "area5")
        .attr("d", area)
        .attr("clip-path", "url(#rectClip)");

// path tbills
svg.append("path")
        .datum(tbills_csv)
        .attr("class", "line5")
        .attr("d", line)
        .attr("clip-path", "url(#rectClip)");

// area 4
svg.append("path")
        .datum(inflation_csv)
        .attr("class", "area4")
        .attr("d", area)
        .attr("clip-path", "url(#rectClip)");
// path 4
svg.append("path")
        .datum(inflation_csv)
        .attr("class", "line4")
        .attr("d", line)
        .attr("clip-path", "url(#rectClip)");

// x axis
svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0,-100)")
        .call(xAxis).call(adjustXLines);

// y axis
svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(2050,0)")
        .call(yAxis);

// large cap label
svg.append("text")
        .text("largeCapLabel")
        .attr("id","largeCapLabel")
        .attr("class","svgText")
        .attr("font-family","JosefinSans-Light")
        .attr("font-size","1.5em")
        .attr("x", 100)
        .attr("y", y(10));

// small cap label
svg.append("text")
        .text("smallCapLabel")
        .attr("id","smallCapLabel")
        .attr("class","svgText")
        .attr("font-family","JosefinSans-Light")
        .attr("font-size","1.5em")
        .attr("x", 100)
        .attr("y", y(10));

// bonds label
svg.append("text")
        .text("bondsLabel")
        .attr("id","bondsLabel")
        .attr("class","svgText")
        .attr("font-family","JosefinSans-Light")
        .attr("font-size","1.5em")
        .attr("x", 100)
        .attr("y", y(10));

// tbills label
svg.append("text")
        .text("tbillsLabel")
        .attr("id","tbillsLabel")
        .attr("class","svgText")
        .attr("font-family","JosefinSans-Light")
        .attr("font-size","1.5em")
        .attr("x", 100)
        .attr("y", y(10));

// inflation label
svg.append("text")
        .text("inflationLabel")
        .attr("id","inflationLabel")
        .attr("class","svgText")
        .attr("font-family","JosefinSans-Light")
        .attr("font-size","1.5em")
        .attr("x", 100)
        .attr("y", y(10));

// ***************************************************************************

var decadeClicked = -1;
var dataYear = 1926; // the starting year : the year that all investments are equal to $1
var year = 1925; // the first visible year in the zoomed-in view
var scrollPos = -1; // used for tracking slider => effectively the previous position of mouse
var verticalsMode = true; // lets the code know which mode / view is active
var historyViewOn = false; // used for checking if the history view is visible

// on load
$(function() {
    // populate images carousel
    for (i=0; i<88; i++) { 
        // images are named after their year, starting at 1926 i.e. 1926.jpg
        var $img = $("<img class='pic' id='"+(i+1926)+"' src='images/history/"+(i+1926)+".jpg' />");
        $img.click ( function() { showHistoryView( $(this).attr("id")); } ); // behavior
        $('#pictures').append($img);  // add to carousel
        var $p = $("<p class='picText'>"+(i+1926)+"</p>");
        $('#pictures').append($p); // add year label
    }
    switchToVerticalsMode(); // runs a lot of hide functions so that things that are supposed to be invisible are.
});

// hide tutorial
$("html").on("mousedown", function() {
    $("#tut").css("display","none");
    $("#vignette").css("display","none");
    $("html").on("mousedown", function() {} ); // so this only runs once
} );

// hover state for the buttons
$(".buttonLight").hover( function () {$("#uncheckedHoverBox").css("left",$(this).css("left"));}); // highlight is a white div that moves behind translucent buttons
$("#back").hover( function () {$("#back").css("opacity",1);}, function() { $("#back").css("opacity",0); }); // back has its own kind of highlight, it's usually transparent unless hovered because its actually drawn on the background
$("#bottom").hover( function() {}, function () { $("#uncheckedHoverBox").css("left","-100%");}); // hide the highlight when nothing is hovered

// line labels
function attachAllLineLabels(duration) {
    d3.selectAll('.svgText').attr("opacity", "1"); // make visible
    attachLineLabel("largeCapLabel", large_cap_csv, duration);
    attachLineLabel("smallCapLabel", small_cap_csv, duration);
    attachLineLabel("bondsLabel", bonds_csv, duration); 
    attachLineLabel("inflationLabel", inflation_csv, duration);
    attachLineLabel("tbillsLabel", tbills_csv, duration);
}
function attachLineLabel(labelId, dataCSV, duration) {
    if (!duration) {duration = 0;}
    var start = x.domain()[0];
    var end = x.domain()[1];
    //var idx = Math.floor($("#slider").slider("value")/1000*(12*(end.getFullYear()-start.getFullYear())) + (start.getFullYear()-1926)*12 + 5 + Math.floor($("#slider").slider("value")/170));
    var idx = Math.floor($("#slider").slider("value")/1000*(12*(1 + end.getFullYear()-start.getFullYear())) + (start.getFullYear()-1926)*12);
    if (idx < 0) { idx = 0; }
     // move the label to the end of the line
    svg.select("#"+labelId).transition()
            .duration(duration)
            .attr("y",y(dataCSV[idx]))
            .attr("x",width*$("#slider").slider("value")/1000+25);
    svg.select("#"+labelId).text("$"+dataCSV[idx].toFixed(2));
}

// slider stuff
$("#slider").slider({
        min: 1,
        max: 1000});
$("#slider").on("slide", function(event, ui) {
    if (verticalsMode == true) {
        scrollPos = -1;
        $(".vertical").css({opacity: "0"});
        var num = 1 + Math.floor($("#slider").slider("value") / 101);
        $("#vert"+num).css({opacity:'0.9'});
        adjustWithPictures($("#vert"+num).attr("id")); 
    }
    else {
        slideOrClickEvents()
    }
});
function slideOrClickEvents() {
    $("#needle2").css({left: ""+(17.5+($("#slider").slider("value")/ 1000)*75)+"%"});
    $("#bb1").css("left",""+(25+($("#slider").slider("value")/ 1000)*75)+"%");
    $("#bb2").css("right",""+(100-(17.5+($("#slider").slider("value")/ 1000)*75))+"%");
    d3.select("#rectClip rect")
            .attr("width", width * ($("#slider").slider("value")) / 1000);
    attachAllLineLabels();
    //console.log( "years "+(year-1925 + $("#slider").slider("value")*0.1) + "\n" + Math.floor( $("#pictures")[0].scrollHeight) * (( $("#slider").slider("value")*0.1 + (year-1926) )/(89) ) +" : "+$("#pictures")[0].scrollHeight);
    $("#pictures").scrollTop( Math.floor( $("#pictures")[0].scrollHeight * (( $("#slider").slider("value")*0.01 + (year-1926) )/(90) ) ));
}
$("#slider").on("mousedown", function(event, ui) {
    if (verticalsMode == true) {
        scrollPos = $("#slider").slider("value");
        $(".vertical").css({opacity: "0"});
        var num = 1 + Math.floor($("#slider").slider("value") / 101);
        $("#vert" + num).css({opacity: '0.9'});
        adjustWithPictures($("#vert" + num).attr("id"));
    }
    else {
        slideOrClickEvents();
    }
});

var doubleclick = false;
$("html").on("mouseup", function(event, ui) {
    if (historyViewOn) { 
        if (!overPicture && !overPrev && !overNext) {
            historyViewOn = false;
            $("#historyViewer").css("opacity",0);
            $("#historyViewer").css("display","none");
        }
    }
    if (verticalsMode == true) {
        if (scrollPos === $("#slider").slider("value")) {
            if (doubleclick) {
                var num = 1 + Math.floor($("#slider").slider("value") / 100);
                decadeClicked = num;
                $("#vert"+num).trigger("click");
            }
            else 
            {
                doubleclick = true;
                window.setTimeout(function() { doubleclick = false; },200);
            }
        }
    }
    else {
        //console.log("slider Value: "+$("#slider").slider("value"))
        if ($("#slider").slider("value") > 950) {
           $("#slider").slider("value",500);
           var sampleStart = new Date(year,0);
           var sampleEnd = new Date(10+year,0);
            if (sampleStart.getFullYear()<2000) {
                year === 1926 ? year = 1925 : year=year;
                year+=5; 
                var sampleStart = new Date(year,0);
                var sampleEnd = new Date(10+year,0);
                d3.select("#rectClip rect")
                .attr("width", width);
                d3.select("#rectClip rect")
                .transition().duration(500)
                .attr("width", width / 2);
                attachAllLineLabels(500);
                $("#needle2").animate({left: "55%"},500);
                $("#bb1").animate({left: "62.5%"},500);
                $("#bb2").animate({right: "45%"}, 500);
                zoom(sampleStart, sampleEnd, minValueForDateRange(sampleStart,sampleEnd), maxValueForDateRange(sampleStart,sampleEnd));
            }
            else {
                if (sampleStart.getFullYear() == 2000) { 
                    year+=5; 
                    var sampleStart = new Date(2004,0);
                    sampleEnd.setFullYear(2014);
                    d3.select("#rectClip rect")
                    .attr("width", width);
                    d3.select("#rectClip rect")
                    .transition().duration(500)
                    .attr("width", width / 2);
                    attachAllLineLabels(500);
                    zoom(sampleStart, sampleEnd, minValueForDateRange(sampleStart,sampleEnd), maxValueForDateRange(sampleStart,sampleEnd));
                    $("#needle2").animate({left: "55%"},500);
                    $("#bb1").animate({left: "62.5%"},500);
                    $("#bb2").animate({right: "45%"}, 500);
                }
                else {
                year=2005;
                sampleStart.setFullYear(2004);
                sampleEnd.setFullYear(2014);
                }
            }
        }
        if ($("#slider").slider("value") < 50) {
            $("#slider").slider("value",500);
            var sampleStart = new Date(year,0);
            var sampleEnd = new Date(10+year,0);
            if (sampleStart.getFullYear()>1934) {
                year-=5; 
                sampleStart = new Date(year,0);
                sampleEnd = new Date(10+year,0);
            }
            else {
                year=1925;
                sampleStart.setFullYear(1926);
                sampleEnd.setFullYear(1936);
            }
            if (year < dataYear) {
                // check for exception
                if (Math.floor(year/10)*10 > 1926) {
                    // build new data set
                    large_cap_csv = createNewData(Math.floor(year/10)*10,lc_csv);
                    small_cap_csv = createNewData(Math.floor(year/10)*10,sc_csv);
                    bonds_csv = createNewData(Math.floor(year/10)*10,b_csv);
                    tbills_csv = createNewData(Math.floor(year/10)*10,tb_csv);
                    inflation_csv = createNewData(Math.floor(year/10)*10,inf_csv);
                }
                else {
                    // build new data set
                    large_cap_csv = createNewData(1926,lc_csv);
                    small_cap_csv = createNewData(1926,sc_csv);
                    bonds_csv = createNewData(1926,b_csv);
                    tbills_csv = createNewData(1926,tb_csv);
                    inflation_csv = createNewData(1926,inf_csv);
                }
            }
            $("#needle2").animate({left: "55%"},500);
            $("#bb1").animate({left: "62.5%"},500);
            $("#bb2").animate({right: "45%"}, 500);
            attachAllLineLabels(500);
            zoom(sampleStart, sampleEnd, minValueForDateRange(sampleStart,sampleEnd), maxValueForDateRange(sampleStart,sampleEnd));
            d3.select("#rectClip rect")
            .attr("width", 0);
            d3.select("#rectClip rect")
            .transition().duration(500)
            .attr("width", width /2);
        } 
    }
});

$(".vertical").hover(
    function() {
        if (verticalsMode) {
            adjustWithPictures($(this).attr("id"));
            //$(this).stop("fadeQueue");
            //$(this).animate({opacity:'0.9'},{duration: 0, queue: "fadeQueue"});
            $(this).css({opacity:'0.9'});
            //$(".vertical").dequeue("fadeQueue");
        }
    },
    function() {
        if (verticalsMode) {
            //adjustWithPictures("none");
            $(this).stop("fadeQueue");
            $(this).animate({opacity:'0'},{duration: 100, queue: "fadeQueue"});
            $(".vertical").dequeue("fadeQueue");
        }
    }

        /* Old hover state stuff that would light up and fade adjacent verticals
        if ($(this).attr("id")=="vertEND") {
            $(".vertical").stop("fadeQueue");
            $(".vertical").animate({opacity: '0'},{duration: 250, queue: "fadeQueue"});
            $(".vertical").dequeue("fadeQueue");
        }
        $(this).stop("fadeQueue");
        $(this).animate({opacity:'0.5'},{duration: 250, queue: "fadeQueue"});
        $("#"+$(this).attr("id").substring(0,4)+(parseInt($(this).attr("id").substring(4,5))+1)).stop("fadeQueue");
        $("#"+$(this).attr("id").substring(0,4)+(parseInt($(this).attr("id").substring(4,5))+1)).animate({opacity:'0.3'},{duration: 250, queue: "fadeQueue"});
        $("#"+$(this).attr("id").substring(0,4)+(parseInt($(this).attr("id").substring(4,5))+2)).stop("fadeQueue");
        $("#"+$(this).attr("id").substring(0,4)+(parseInt($(this).attr("id").substring(4,5))+2)).animate({opacity:'0.2'},{duration: 250, queue: "fadeQueue"});
        $("#"+$(this).attr("id").substring(0,4)+(parseInt($(this).attr("id").substring(4,5))-1)).stop("fadeQueue");
        $("#"+$(this).attr("id").substring(0,4)+(parseInt($(this).attr("id").substring(4,5))-1)).animate({opacity:'0.3'},{duration: 250, queue: "fadeQueue"});
        $("#"+$(this).attr("id").substring(0,4)+(parseInt($(this).attr("id").substring(4,5))-2)).stop("fadeQueue");
        $("#"+$(this).attr("id").substring(0,4)+(parseInt($(this).attr("id").substring(4,5))-2)).animate({opacity:'0.2'},{duration: 250, queue: "fadeQueue"});
        $(".vertical").dequeue("fadeQueue");
        
    }, 
    function() {
        if ($(this).attr("id")=="vertEND") {
            $(".vertical").stop("fadeQueue");
            $(".vertical").animate({opacity: '0.2'},{duration: 1000, queue: "fadeQueue"});
            $(".vertical").dequeue("fadeQueue");
        }
        $(this).stop("fadeQueue");
        $(this).animate({opacity:'0.2'},{duration: 1000, queue: "fadeQueue"});
        $("#"+$(this).attr("id").substring(0,4)+(parseInt($(this).attr("id").substring(4,5))+1)).stop("fadeQueue");
        $("#"+$(this).attr("id").substring(0,4)+(parseInt($(this).attr("id").substring(4,5))+1)).animate({opacity:'0.2'},{duration: 1000, queue: "fadeQueue"});
        $("#"+$(this).attr("id").substring(0,4)+(parseInt($(this).attr("id").substring(4,5))+2)).stop("fadeQueue");
        $("#"+$(this).attr("id").substring(0,4)+(parseInt($(this).attr("id").substring(4,5))+2)).animate({opacity:'0.2'},{duration: 1000, queue: "fadeQueue"});
        $("#"+$(this).attr("id").substring(0,4)+(parseInt($(this).attr("id").substring(4,5))-1)).stop("fadeQueue");
        $("#"+$(this).attr("id").substring(0,4)+(parseInt($(this).attr("id").substring(4,5))-1)).animate({opacity:'0.2'},{duration: 1000, queue: "fadeQueue"});
        $("#"+$(this).attr("id").substring(0,4)+(parseInt($(this).attr("id").substring(4,5))-2)).stop("fadeQueue");
        $("#"+$(this).attr("id").substring(0,4)+(parseInt($(this).attr("id").substring(4,5))-2)).animate({opacity:'0.2'},{duration: 1000, queue: "fadeQueue"});
        $(".vertical").dequeue("fadeQueue");*/
    );

var lineToggles = {largeLit: true, smallLit: true, bondsLit: true, inflLit: true, tbillsLit: true};

$(".buttonLight").on("mouseup", function() {
    lineToggles[""+$(this).attr("id")+"Lit"] = !lineToggles[""+$(this).attr("id")+"Lit"];
    //console.log(lineToggles[""+$(this).attr("id")+"Lit"]);
    hideShowLines();
});
$("#back").on("mousedown", function() { $(this).css("opacity",0); });
$("#back").on("mouseup", function() { $("#back").css("opacity",1); if (!verticalsMode) { switchToVerticalsMode(); } });

function hideShowLines() {
    if (lineToggles["largeLit"]) {
        d3.select(".line1").attr("style","opacity: 1");
        d3.select(".area1").attr("style","opacity: 0.2");
        $("#large").animate({opacity: "1"},250);
        if (!verticalsMode) { $("#largeCapLabel").css("opacity", 1); }
    }
    else {
        d3.select(".line1").attr("style","opacity: 0");
        d3.select(".area1").attr("style","opacity: 0");
        $("#large").animate({opacity: "0"},250);
        $("#largeCapLabel").css("opacity", 0);
    }
    if (lineToggles["smallLit"]) {
        d3.select(".line2").attr("style","opacity: 1");
        d3.select(".area2").attr("style","opacity: 0.2");
        $("#small").animate({opacity: "1"},250);
        if (!verticalsMode) { $("#smallCapLabel").css("opacity", 1); }
    }
    else {
        d3.select(".line2").attr("style","opacity: 0");
        d3.select(".area2").attr("style","opacity: 0");
        $("#small").animate({opacity: "0"},250);
        $("#smallCapLabel").css("opacity", 0);
    }
    if (lineToggles["bondsLit"]) {
        d3.select(".line3").attr("style","opacity: 1");
        d3.select(".area3").attr("style","opacity: 0.2");
        $("#bonds").animate({opacity: "1"},250);
        if (!verticalsMode) { $("#bondsLabel").css("opacity", 1); }
    }
    else {
        d3.select(".line3").attr("style","opacity: 0");
        d3.select(".area3").attr("style","opacity: 0");
        $("#bonds").animate({opacity: "0"},250);
        $("#bondsLabel").css("opacity", 0);
    }
    if (lineToggles["inflLit"]) {
        d3.select(".line4").attr("style","opacity: 1");
        d3.select(".area4").attr("style","opacity: 0.2");
        $("#infl").animate({opacity: "1"},250);
        if (!verticalsMode) { $("#inflationLabel").css("opacity", 1); }
    }
    else {
        d3.select(".line4").attr("style","opacity: 0");
        d3.select(".area4").attr("style","opacity: 0");
        $("#infl").animate({opacity: "0"},250);
        $("#inflationLabel").css("opacity", 0);
    }
    if (lineToggles["tbillsLit"]) {
        d3.select(".line5").attr("style","opacity: 1");
        d3.select(".area5").attr("style","opacity: 0.2");
        $("#tbills").animate({opacity: "1"},250);
        if (!verticalsMode) { $("#tbillsLabel").css("opacity", 1); }
    }
    else {
        d3.select(".line5").attr("style","opacity: 0");
        d3.select(".area5").attr("style","opacity: 0");
        $("#tbills").animate({opacity: "0"},250);
        $("#tbillsLabel").css("opacity", 0);
    }
}

function defaultFor(arg, val) { return typeof arg !== 'undefined' ? arg : val; }

$(window).resize(function() {resize();});

resize();

function resize(w,h) {
    // font stuff
    var preferredWidth = 100;  
    var currentWidth = $("#bounds").width();
    var ratio = currentWidth / preferredWidth;
    var newFontSize = Math.floor(2.6 * ratio);
    $(".date").css("font-size", newFontSize );
    $(".date").css("letter-spacing", ratio*0.5 );
    $("#date9").css("letter-spacing", ratio*0.4);
    $(".lineLabel").css("font-size", newFontSize/1.5 );
    $('.picText').css("font-size", newFontSize/1.5 );
    $('#information').css("font-size", newFontSize*0.55 );
    // end font stuff
    
    if (verticalsMode) {
        d3.select(".graph")
                .attr("viewBox","0,0,"+defaultFor(w,width)+","+defaultFor(h,height)+"")
                .attr("preserveAspectRatio","none");
    }
    else {
        attachAllLineLabels();
        d3.select(".graph")
                .attr("viewBox","0,0,"+defaultFor(w,width)+","+defaultFor(h,height+50)+"")
                .attr("preserveAspectRatio","none");
    }
}

var pictures = {"none": 0, "vert1" : 0.0455,"vert2" : 0.159,"vert3" : 0.272,"vert4" : 0.386,"vert5" : 0.5, "vert6" : 0.614 ,"vert7" : 0.727,"vert8" : 0.841,"vert9" : 0.955, "vert10":1};
function adjustWithPictures(idStr) {
    d3.select("#rectClip rect")
            //.transition().duration(000).ease("linear")
            .attr("width", width * pictures[idStr]);
    $("#needle").css({left: ""+10*(parseInt(idStr.substring(4,idStr.length))-1)+"%"});
    $(".date").css("opacity",0.2);
    $("#date"+parseInt(idStr.substring(4,idStr.length))).css("opacity",1);
}

$(".vertical").on("click",
function() {
    if (verticalsMode) {
    var s = new Date(1910+10*parseInt($(this).attr("id").substring(4)),0);
    var e = new Date(1920+10*parseInt($(this).attr("id").substring(4)),0);

        // excceptions for the 9 year periods
        if (s.getFullYear()<1930) {
            s.setFullYear(1926);
            e.setFullYear(1936);
        }
        if (s.getFullYear()>2000) {
            s.setFullYear(2004);
            e.setFullYear(2014);
        }
        
        // build new data set
        large_cap_csv = createNewData(s.getFullYear(),lc_csv);
        small_cap_csv = createNewData(s.getFullYear(),sc_csv);
        bonds_csv = createNewData(s.getFullYear(),b_csv);
        tbills_csv = createNewData(s.getFullYear(),tb_csv);
        inflation_csv = createNewData(s.getFullYear(),inf_csv);
        
        switchToCarouselMode(s,e,
        minValueForDateRange(s,e), 
        maxValueForDateRange(s,e));
        $("#pictures").scrollTop( Math.floor( $("#pictures")[0].scrollHeight * (((year-1926) )/(89) ) ) );
    }
});

function createNewData(decadeFullYear, investment_csv) {
    dataYear = decadeFullYear;
    var new_csv = investment_csv.slice(0);
    var startIndex = 12*(decadeFullYear-1926);
    var divisor = investment_csv[startIndex];
    for (i=0; i < new_csv.length; i++) {
        if (i<startIndex) {
            new_csv[i] = 1;
        }
        else {
            new_csv[i] = investment_csv[i]/divisor;
        }
    }
    return new_csv;
}

function datesIndexOf(o) {    
    for (var i = 0; i < dates.length; i++) {
        if (dates[i].getFullYear() == o.getFullYear() && dates[i].getMonth() == o.getMonth()) {
            return i;
        }
    }
    return -1;
}

var minGlobal = 1;
function minValueForDateRange(start,end) {
    // finds the minimum value of the four resources in a given date range
    var min = 1;
    var iStart = datesIndexOf(start);
    var iEnd = datesIndexOf(end);
    var largeMin = Math.min.apply(Math, large_cap_csv.slice(iStart,iEnd));
    var smallMin = Math.min.apply(Math, small_cap_csv.slice(iStart,iEnd));
    var bondsMin = Math.min.apply(Math, bonds_csv.slice(iStart,iEnd));
    var inflMin = Math.min.apply(Math, inflation_csv.slice(iStart,iEnd));
    if (min > largeMin) {
        min = largeMin;
    }
    if (min > smallMin) {
        min = smallMin;
    }
    if (min > bondsMin) {
        min = bondsMin;
    }
    if (min > inflMin) {
        min = inflMin;
    }
    //console.log("Time: "+start.getFullYear()+" to "+ end.getFullYear()+"\nmin: "+min);
    minGlobal = min;
    return min;
}

var maxGlobal = 1;
function maxValueForDateRange(start,end) {
    var max = 1;
    var iStart = datesIndexOf(start);
    var iEnd = datesIndexOf(end);
    var largeMax = Math.max.apply(Math, large_cap_csv.slice(iStart,iEnd));
    var smallMax = Math.max.apply(Math, small_cap_csv.slice(iStart,iEnd));
    var bondsMax = Math.max.apply(Math, bonds_csv.slice(iStart,iEnd));
    var inflMax = Math.max.apply(Math, inflation_csv.slice(iStart,iEnd));
    if (max < largeMax) {
        max = largeMax;
    }
    if (max < smallMax) {
        max = smallMax;
    }
    if (max < bondsMax) {
        max = bondsMax;
    }
    if (max < inflMax) {
        max = inflMax;
    }
    //console.log("max: "+max);
    maxGlobal = max;
    return max;
}

function switchToVerticalsMode() {
    // resetting everything
    // build new data set
    large_cap_csv = lc_csv;
    small_cap_csv = sc_csv;
    bonds_csv = b_csv;
    tbills_csv = tb_csv;
    inflation_csv = inf_csv;
    
    d3.selectAll('.svgText').attr("opacity", 0);
    // make slider cover the whole area
    $("#slider").css({left: "0%", width: "100%"});
    // uncover the background and numbers
    $("#background_curtain").animate({opacity: "0"},500);
    $("#verticals").animate({opacity: "1"},500,function() {verticalsMode = true;});
    $(".date").animate({opacity: "0.2"},500);
    $("#date"+decadeClicked).stop().css("opacity",1);
    zoom(new Date(1926, 0), new Date(2014, 0),  0.1, 30000, 0);
    // bring the carousel to the back
    $("#carouselPane").css( {"z-index": "-100"} );
    $("#carouselPane").animate({opacity: "0"},500);
    // reset
    d3.select("#rectClip rect").attr("width", 0);
    // resize the graph to fit the new window
    $(".graph").css({top: "13.5%", height: "85%",left: "6.25%",width: "88%"});
    // hide needle but make it opaque
    $("#needle").css({opacity: 1, left: "-100%"});
    resize(width, height); // the default resize values are set for verticals mode
    $(".axis line").css("stroke", "rgba(255,255,255,0.0)");
    $(".y.axis text").css("opacity", 0);
    $(".svgText").css({opacity: 0, top: "1000%"});
    d3.selectAll('.svgText').attr("opacity", "0");
    $("#needle2").css({opacity: 0, left: -1000});
    $(".blackBar").css({opacity: 0});
    $("#")
    $("#historyViewer").css("display","none");
    //hide map locator
    $("#mapLocator").css("opacity",0);
    $("#mapBG").css("opacity",0);
    $("#topFade").css("opacity",0);
}

function switchToCarouselMode(minvx, maxvx,  minvy, maxvy) {
    // toggle mode
    verticalsMode = false;
    // set year
    year = minvx.getFullYear();
    if (year === 1926) { year = 1925; }
    
    // resize slider
    $("#slider").css({left: "25%", width: "75%"});

    // hide needle
    $("#needle").css("opacity",0);
    
    // cover the background
    $("#background_curtain").animate({opacity: "1"},500);
    
    if (!minvx || !maxvx) {
        maxvx=new Date(2014, 0);
        minvx=new Date(1926, 0);
    }
    if (!minvy || !maxvy) {
        maxvy=5000;
        minvy=0.1;
    }
    
    // show labels
    $(".y.axis text").css("opacity", 1);
    
    // animate verticals / blinds
    $("#verticals").animate({opacity: "0"},500);
    $(".date").animate({opacity: "0"},500);
    /*$(".vertical").css({opacity: "0", left: "0.5%"});
    $(".vertical").animate({opacity: "1", left: "0.5%"},{duration: 500, easing: "linear", queue: "specialQueue"});
    $(".vertical").dequeue("specialQueue");*/
        
    d3.select("#rectClip rect").attr("width", 0);
    
    // bring the carousel to the front
    $("#carouselPane").css( {"z-index": "5"} );
    $("#carouselPane").animate({opacity: "1"},500);
    $("#carouselPane").scrollTop(600);
    
    // resize graph
    resize();
    zoom(minvx,maxvx,  minvy, maxvy,0);
    // resize the graph container 
    $(".graph").css({left: "25%", width: "75%"});
    $(".axis line").css("stroke", "rgba(255,255,255,0.05)");
    
    // show y labels
    $(".yLabel").css("opacity",1);
    
    $("#needle2").css("opacity", 1);
    $(".blackBar").css({opacity: 0.8});
    $("#topFade").css("opacity",1);
    
    d3.selectAll(".svgText").transition().duration(10).attr("opacity","0");
    
    //show map locator
    $("#mapLocator").css("opacity",1);
    $("#mapBG").css("opacity",1);
    
    // fake click on first box
    $("#slider").slider("value",100);
    $("#slider").trigger("mousedown");
    hideShowLines();
}

function zoom(minvx, maxvx, minvy, maxvy, duration) {
    duration = defaultFor(duration, 500);
    
    // change domain
    if (!minvx || !maxvx) {
    }
    else {
        x.domain([minvx, maxvx-1]);
    }
    if (!minvy || !maxvy) {
    }
    else {
        y.domain([minvy, maxvy]);
    }
    
    attachAllLineLabels(duration);
    
    // transition axis
    svg.transition().duration(duration)
    .select(".x.axis").call(xAxis)
    .call(adjustXLines);
    svg.transition().duration(duration)
    .select(".y.axis").call(yAxis);

    // transitions
    
    // large
    svg.transition().duration(duration)
    .select(".line1").attr("d", line(large_cap_csv));
    svg.transition().duration(duration)
    .select(".area1").attr("d", area(large_cap_csv));
    
    // small
    svg.transition().duration(duration)
    .select(".line2").attr("d", line(small_cap_csv));
    svg.transition().duration(duration)
    .select(".area2").attr("d", area(small_cap_csv));
    
    // bonds
    svg.transition().duration(duration)
    .select(".line3").attr("d", line(bonds_csv));
    svg.transition().duration(duration)
    .select(".area3").attr("d", area(bonds_csv));
    
    // tbills
    svg.transition().duration(duration)
    .select(".line5").attr("d", line(tbills_csv));
    svg.transition().duration(duration)
    .select(".area5").attr("d", area(tbills_csv));
    
    // inflation
    svg.transition().duration(duration)
    .select(".line4").attr("d", line(inflation_csv));
    svg.transition().duration(duration)
    .select(".area4").attr("d", area(inflation_csv));  
    
    // map bar update
    $("#mapLocator").animate({left : (""+(27+75*(year-1925)/89)+"%")},{ duration: duration, queue: "moveQueue" });
    $("#mapLocator").dequeue("moveQueue");
    $("#mapLocator").stop("fadeQueue",true);
    $("#mapLocator").css("opacity",1);
    $("#mapLocator").animate( {opacity: 0},{ duration: 1500, queue: "fadeQueue" });
    clearTimeout(timeoutID);
    timeoutID = setTimeout(function() { $("#mapLocator").dequeue("fadeQueue");  }, 1000);
}
var timeoutID;

function adjustXLines(selection) {
    selection.selectAll('.axis text')
        .attr('transform', 'translate(50,0)');
}

var historyYear = 0;
function showHistoryView(id) {
    historyYear = parseInt(id);
    historyViewOn = true;
    $("#historyViewer").css("opacity",1);
    $("#historyViewer").css("display","block");
    $("#bigSlide").attr("src", 'images/history/'+id+'.jpg');
    $("#bigFade").css("width",$("#bigSlide").css("width"));
    $("#information").text(descriptions[id-1926].slice(5));
}

var overPicture = false;
$("#slideContainer").on("mouseenter", function() { overPicture = true; } );
$("#slideContainer").on("mouseleave", function() { overPicture = false; } );

var overPrev = false;
$("#prev").on("mouseenter", function() { overPrev = true; } );
$("#prev").on("mouseleave", function() { overPrev = false; } );

var overNext = false;
$("#next").on("mouseenter", function() { overNext = true; } );
$("#next").on("mouseleave", function() { overNext = false; } );

$("#prev").on("click", function () { if (historyYear > 1926) { showHistoryView(historyYear-1); } } );
$("#next").on("click", function () { if (historyYear < 2013) { showHistoryView(historyYear+1); } } );