function IsMobileCard() {
    var check =  false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;   
}

// for tab navigation
function openTab(evt, cityName, bgColor) {
    document.body.style.background = bgColor;
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

// functions for entry form
// make interactive section on entry form sortable
$( function() {
    $( "#sortable" ).sortable({
        stop: function( ) {
            var order = $("#sortable li")[0];
            document.getElementById("sortable").querySelectorAll("li").forEach(li => li.innerHTML = li.id); // reset inner html for all items
            order.innerHTML = '<i class="fas fa-crown" aria-hidden="true"></i> ' + order.innerHTML + ' <i class="fas fa-crown" aria-hidden="true"></i>'; // add crowns to top list item
        }
    });
} );

// send user to rules tab then smooth scroll to scoring section
function goToScoring(event) {
    openTab(event, 'Rules', '#312e2b');
    $(document).ready(function () {
        $('html, body').animate({
            scrollTop: $('#scoring').offset().top
        }, 'slow');
    });
}

// dynamic options to "What should we call you on the leaderboard?" question
function changeLeaderboardOptions() {
    document.getElementById("option1").innerHTML = document.getElementById("firstName").value + " " + document.getElementById("lastName").value; 
    document.getElementById("option2").innerHTML = document.getElementById("firstName").value + " " + document.getElementById("lastName").value.charAt(0); 
}
////////////////////////////////////

// functions for leaderboard
function addRow(rank, name, kendallDistance, accuracy, rowColor) {
    var table = document.getElementById("leaderboardTable");
    var row = table.insertRow(-1);
    row.style.backgroundColor = rowColor;
    var rankCell = row.insertCell(0);
    var nameCell = row.insertCell(1);
    var distanceCell = row.insertCell(2);
    var accuracyCell = row.insertCell(3);
    rankCell.innerHTML = '<span class="circle">' + rank + '</span>';
    nameCell.innerHTML = name;
    distanceCell.innerHTML = kendallDistance;
    accuracyCell.innerHTML = accuracy;

    nameCell.style.textAlign = 'left';
    nameCell.style.fontSize = '18px';

    // if (name == "Wisdom of the crowd"){
    //     var a = document.createElement("a");
    //     a.href = "https://en.wikipedia.org/wiki/Wisdom_of_the_crowd";
    //     a.target = "_blank";
    //     li.appendChild(a);
    //     li.setAttribute("id", "aggregate"); // overwrite id
    // }
}

function readData() { // reads data
  
    list = []; // used later on to count how many participants there are

    // import data from csv
    d3.csv("data/scoreboardDataApril8.csv", function(data) {

        var distanceToColorScale = d3.scaleLinear().domain([0, data.length]).range(["#333399","#8181df"]);

        for (i=0;i<data.length;i++) {
            list.push(data[i].name);
            addRow(i, data[i].name, data[i].score, Number(data[i].percentage).toFixed(1), distanceToColorScale(i)); // add one row for each participant
        }
      
        return;
        document.getElementById("aggregate").style.backgroundColor = "#008b8b"; // make aggregate row unique

        d3.select("#Leaderboard").selectAll("li").on("mouseover", function() { // on li mouse over, show predictions div
            return;
            if (IsMobileCard()){
                return;
            }

            liId = d3.select(this).attr("id") // get list item ID

            if (typeof d3.select(this).select('a')["_groups"][0][0] !== "undefined"){
                d3.select(this).select('mark')["_groups"][0][0].style.textDecoration = "underline";
            }

            console.log(data[liId]);
            document.getElementById("playerHeader").innerHTML = (data[liId]["name"]) + " Prediction"; // customize title
            
            // change the order to match the player represented by the li moused over
            document.getElementById("1stDrop").innerHTML = data[liId]["1"];
            document.getElementById("2ndDrop").innerHTML = data[liId]["2"];
            document.getElementById("3rdDrop").innerHTML = data[liId]["3"];
            document.getElementById("4thDrop").innerHTML = data[liId]["4"];
            document.getElementById("5thDrop").innerHTML = data[liId]["5"];
            document.getElementById("6thDrop").innerHTML = data[liId]["6"];
            document.getElementById("7thDrop").innerHTML = data[liId]["7"];
            document.getElementById("8thDrop").innerHTML = data[liId]["8"];
            document.getElementById("9thDrop").innerHTML = data[liId]["9"];
            document.getElementById("10thDrop").innerHTML = data[liId]["10"];
            document.getElementById("11thDrop").innerHTML = data[liId]["11"];
            document.getElementById("12thDrop").innerHTML = data[liId]["12"];
            document.getElementById("13thDrop").innerHTML = data[liId]["13"];
            document.getElementById("winner").innerHTML = data[liId]["14"];
            
            document.getElementById("playerPredictions").style.visibility = 'visible';
            
        }).on("mouseout", function() { 
            d3.select(this).select('mark')["_groups"][0][0].style.textDecoration = "none";
        });
    }); 
}

d3.select("#playerPredictions").on("mouseover", function() {
    tds = d3.select("#playerTable").selectAll("td")._groups[0]
    for (i=0; i < tds.length; i++){
        if (tds[i].innerText == 'Marianne Williamson'){
            scoreEffect = Math.abs(13 - (i/2))
            if (scoreEffect==0){
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "✔"
            }
            else{
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "-" + scoreEffect
            }
        }
        else if (tds[i].innerText == 'Cory Booker'){
            scoreEffect = Math.abs(12 - (i/2))
            if (scoreEffect==0){
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "✔"
            }
            else{
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "-" + scoreEffect
            }
        }
        else if (tds[i].innerText == 'John Delaney'){
            scoreEffect = Math.abs(11 - (i/2))
            if (scoreEffect==0){
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "✔"
            }
            else{
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "-" + scoreEffect
            }
        }
        else if (tds[i].innerText == 'Andrew Yang'){
            scoreEffect = Math.abs(10 - (i/2))
            if (scoreEffect==0){
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "✔"
            }
            else{
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "-" + scoreEffect
            }
        }
        else if (tds[i].innerText == 'Michael Bennet'){
            scoreEffect = Math.abs(9 - (i/2))
            if (scoreEffect==0){
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "✔"
            }
            else{
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "-" + scoreEffect
            }
        }
        else if (tds[i].innerText == 'Deval Patrick'){
            scoreEffect = Math.abs(8 - (i/2))
            if (scoreEffect==0){
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "✔"
            }
            else{
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "-" + scoreEffect
            }
        }
        else if (tds[i].innerText == 'Tom Steyer'){
            scoreEffect = Math.abs(7 - (i/2))
            if (scoreEffect==0){
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "✔"
            }
            else{
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "-" + scoreEffect
            }
        }
        else if (tds[i].innerText == 'Pete Buttigieg'){
            scoreEffect = Math.abs(6 - (i/2))
            if (scoreEffect==0){
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "✔"
            }
            else{
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "-" + scoreEffect
            }
        }
        else if (tds[i].innerText == 'Amy Klobuchar'){
            scoreEffect = Math.abs(5 - (i/2))
            if (scoreEffect==0){
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "✔"
            }
            else{
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "-" + scoreEffect
            }
        }
        else if (tds[i].innerText == 'Michael Bloomberg'){
            scoreEffect = Math.abs(4 - (i/2))
            if (scoreEffect==0){
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "✔"
            }
            else{
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "-" + scoreEffect
            }
        }
        else if (tds[i].innerText == 'Elizabeth Warren'){
            scoreEffect = Math.abs(3 - (i/2))
            if (scoreEffect==0){
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "✔"
            }
            else{
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "-" + scoreEffect
            }
        }
        else if (tds[i].innerText == 'Tulsi Gabbard'){
            scoreEffect = Math.abs(2 - (i/2))
            if (scoreEffect==0){
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "✔"
            }
            else{
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "-" + scoreEffect
            }
        }
        else if (tds[i].innerText == 'Bernie Sanders'){
            scoreEffect = Math.abs(1 - (i/2))
            if (scoreEffect==0){
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "✔"
            }
            else{
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "-" + scoreEffect
            }
        }
        else if (tds[i].innerText == 'Joe Biden'){
            scoreEffect = Math.abs(0 - (i/2))
            if (scoreEffect==0){
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "✔"
            }
            else{
                tds[i+1].id = tds[i+1].innerText;
                tds[i+1].innerText = "-" + scoreEffect
            }
        }
    }
})
.on("mouseout", function() {
    tds = d3.select("#playerTable").selectAll("td")._groups[0]
    
    for (i=0; i < tds.length; i++){
        if (tds[i].innerText == 'Marianne Williamson'){
            tds[i+1].innerText = tds[i+1].id;
        }
        else if (tds[i].innerText == 'Cory Booker'){
            tds[i+1].innerText = tds[i+1].id;
        }
        else if (tds[i].innerText == 'John Delaney'){
            tds[i+1].innerText = tds[i+1].id;
        }
        else if (tds[i].innerText == 'Andrew Yang'){
            tds[i+1].innerText = tds[i+1].id;
        }
        else if (tds[i].innerText == 'Michael Bennet'){
            tds[i+1].innerText = tds[i+1].id;
        }
        else if (tds[i].innerText == 'Deval Patrick'){
            tds[i+1].innerText = tds[i+1].id;
        }
        else if (tds[i].innerText == 'Tom Steyer'){
            tds[i+1].innerText = tds[i+1].id;
        }
        else if (tds[i].innerText == 'Pete Buttigieg'){
            tds[i+1].innerText = tds[i+1].id;
        }
        else if (tds[i].innerText == 'Amy Klobuchar'){
            tds[i+1].innerText = tds[i+1].id;
        }
        else if (tds[i].innerText == 'Michael Bloomberg'){
            tds[i+1].innerText = tds[i+1].id;
        }
        else if (tds[i].innerText == 'Elizabeth Warren'){
            tds[i+1].innerText = tds[i+1].id;
        }
        else if (tds[i].innerText == 'Tulsi Gabbard'){
            tds[i+1].innerText = tds[i+1].id;
        }
        else if (tds[i].innerText == 'Bernie Sanders'){
            tds[i+1].innerText = tds[i+1].id;
        }
        else if (tds[i].innerText == 'Joe Biden'){
            tds[i+1].innerText = tds[i+1].id;
        }
    }
});

// code for opening/closing collapsible sections
// var coll = document.getElementsByClassName("collapsible");
// var i;

// for (i = 0; i < coll.length; i++) {
//   coll[i].addEventListener("click", function() {
//     this.classList.toggle("active");
//     var content = this.nextElementSibling;
//     if (content.style.maxHeight){
//       content.style.maxHeight = null;
//     } else {
//       content.style.maxHeight = content.scrollHeight + "px";
//     } 
//   });
// }

//////////////////////////

// functions for analysis section
function drawHeatmap() {
    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 30, bottom: 160, left: 160},
        width = screen.height -100 - margin.left - margin.right,
        height = screen.height - 100 - margin.top - margin.bottom;

    if (screen.width < 600){
        margin = {top: 30, right: 30, bottom: 70, left: 70},
        width = screen.width - 40 - margin.left - margin.right,
        height = screen.width - 40 - margin.top - margin.bottom;
    }

    // append the svg object to the body of the page
    var svg = d3.select("#heatmap")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Labels of rows and columns
    names = ["Joe Biden", "Elizabeth Warren", "Bernie Sanders", "Pete Buttigieg", "Michael Bloomberg", "Andrew Yang", "Amy Klobuchar", "Tulsi Gabbard", "Tom Steyer", "Cory Booker", "Marianne Williamson", "John Delaney", "Deval Patrick", "Michael Bennet"]

    if (screen.width < 600){
        names = ["Biden", "Warren", "Sanders", "Buttigieg", "Bloomberg", "Yang", "Klobuchar", "Gabbard", "Steyer", "Booker", "Williamson", "Delaney", "Patrick", "Bennet"]
    }

    columnLabels = [1,2,3,4,5,6,7,8,9,10,11,12,13,"Win"];

    // Build color scale for cells
    var myColor = d3.scaleLinear()
        .range(["white", "blue"])
        .domain([0,35])
    // Build color scale for text
    var textColor = d3.scaleLinear()
        .range(["black", "white"])
        .domain([0,35])

    //Read the data
    d3.csv("data/heatmapLongData.csv", function(data) {

        // create arrays of unique values in both index and dropoutposition columns
        candidates = data.map(function(d) { return d.index }).filter((v, i, a) => a.indexOf(v) === i);
        dropOutPositions = data.map(function(d) { return d.dropOutPosition }).filter((v, i, a) => a.indexOf(v) === i);
        
        candidates.sort((a, b) => a - b);

        var padding = 0.1;

        // Build X scales and axis:
        var x = d3.scaleBand()
            .range([ 0, width ])
            .domain(dropOutPositions)
            .padding(padding);
            svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(function(d, i){return columnLabels[i]}));
        
        // Build Y scales and axis:
        var y = d3.scaleBand()
            .range([ 0, height ])
            .domain(candidates)
            .padding(padding);
            svg.append("g")
            .attr("class", "axis")
            .attr('transform', 'translate(0, 0)')
            .call(d3.axisLeft(y).tickFormat(function(d, i){return names[i]}));

        if (screen.width < 600){
            d3.selectAll(".axis>.tick>text")
            .each(function(d, i){
                d3.select(this).style("font-size","12px");
            });
        }
        
        // create a tooltip
        var tooltip = d3.select("body")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")

        // Three function that change the tooltip when user hover / move / leave a cell
        var mouseover = function(d) {
            tooltip
                .style("opacity", 1)
            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", 2);
        }
        var mousemove = function(d) {

            var player;
            var statement;

            if (d.value == 0){
                player = "No one predicts "
            }
            else if (d.value == 1) {
                player = "1 respondent predicts "
            }
            else {
                player = d.value + " players predict "
            }

            if (d.dropOutPosition == 1){
                statement = " will drop out 1st"
            }
            else if (d.dropOutPosition == 2){
                statement = " will drop out 2nd"
            } 
            else if (d.dropOutPosition == 3){
                statement = " will drop out 3rd"
            }
            else if (d.dropOutPosition < 14){
                statement = " will drop out " + d.dropOutPosition + "th"
            } 
            else{
                statement = " will win"
            }

            var matrix = this.getScreenCTM()
                .translate(+ this.getAttribute("cx"), + this.getAttribute("cy"));

                tooltip
                    .html(player + "<br>" + names[d.index-1] + statement)
                    .style("left", (d3.event.pageX) + 40 + "px")
                    .style("top", (d3.event.pageY) + "px")
            
        }
        var mouseleave = function(d) {
            tooltip
            .style("opacity", 0)
            d3.select(this)
            .style("stroke", "none")
        }

        // draw and color the cells
        svg.selectAll()
            .data(data, function(d) {return d.index+':'+d.dropOutPosition;})
            .enter()
            .append("rect")
            .attr("y", function(d) { return y(d.index) })
            .attr("x", function(d) { return x(d.dropOutPosition) })
            .attr("width", width / 14 )
            .attr("height", height / 14 )
            .style("fill", function(d) {return myColor(d.value)} )
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)


        squareLabelFontSize = '18px'
        if (screen.width < 600){
            squareLabelFontSize = '10px'
        }

        // labels for squares
        var texts = svg.selectAll("text")
            .data(data, function(d) {return d.index+':'+d.dropOutPosition;})
            .enter();
        texts.append("text")
                .text(function(d){return d.value;})
                .attr("y", function(d) { return y(d.index) + (height/14/2) })
                .attr("x", function(d) { return x(d.dropOutPosition) + (width/14/2) })
                .style("text-anchor", "middle")
                .attr("dominant-baseline", "central")
                .attr('font-size', squareLabelFontSize)
                .style("fill", function(d) {if (d.value > 14){return 'white'} else if (d.value > 9){return 'black'} else{return "none"}})
                .attr('pointer-events', 'none');
                
        // text label for the x axis
        svg.append("text")             
            .attr("transform",
                    "translate(" + (width/2) + " ," + 
                                (height + margin.top + 10) + ")")
            .style("text-anchor", "middle")
            .attr('font-size', squareLabelFontSize)
            .text("Predicted Drop Out Position");

        chartTitleFontSize = '26px'
        if (screen.width < 600){
            chartTitleFontSize = '14px'
        }

        // Heading 
        svg.append("g")
            //.attr("transform","translate(0,30)")
            .append("text")
            .attr("x",(width)/2)
            .attr('y', 0-margin.top+20)
            .attr('font-weight', 'bold')
            .attr('font-size', chartTitleFontSize)
            .attr('font-family', 'Segoe UI bold')
            .style("text-anchor", "middle")
            .text("74 Predictions Of Candidate Drop Out Order")

    });
}
//////////////////////////////        

function onPageLoad() {

    // leaderboard
    readData();

    // analysis section
    drawHeatmap();
}

onPageLoad();