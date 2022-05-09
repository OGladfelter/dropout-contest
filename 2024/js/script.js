numberOfCandidates = 14;

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

/// data prep functions /////////////////////
// kendall tau rank distance function
function calculateKendallTauDistance(listA, listB){
  var distance = 0

  // get all potential non-self, non-duplicative pairs between the two arrays
  var combinations = [];
  listA.forEach(a => {
    listB.forEach(b => {
      if (a != b) {
        combinations.push([a, b].sort());
      }
    })
  });
  var pairs = Array.from(new Set(combinations.map(JSON.stringify)), JSON.parse);

  // for each pair, calc index of the pair objects, find index in lists, calc difference and add to distance
  for (let [x, y] of pairs) {
      a = listA.indexOf(x) - listA.indexOf(y);
      b = listB.indexOf(x) - listB.indexOf(y);
      
      if (a * b < 0){
          distance = distance + 1
      }
  }
  return distance;
}

function partialScoring(dropOutOrder, playerPredictionsArray) {
  // I will want to calculate everyone's scores after each candidate drops out
  // in the beginning stages, this is a challenge as there are lots of unknowns
  // contest participants scores' should be impacted only by candidates who have already dropped;
  // candidates still running should essentially be ignored. But removing them does not work
  // because it messes with the 'weight' of a correct/incorrect prediction. Instead, replace all ? with 'correct' guesses
  playerPredictionsArray.forEach(function(candidate, i) {
      if (!dropOutOrder.includes(candidate)) { // candidate hasn't dropped out
        playerPredictionsArray[i] = ''; // so remove them from the predictions array
      } 
  });

  var alphabet1 = ['A','B','C','D','E','F','G','H','I','J','K','L','M']; // needs to equal length of candidates still running

  playerPredictionsArray.forEach(function(d, i) {
    if (d == '') {
      playerPredictionsArray[i] = alphabet1.shift();
    }
  });

  var alphabet2 = ['A','B','C','D','E','F','G','H','I','J','K','L','M']; // needs to equal length of candidates still running

  dropOutOrder.forEach(function(d, i) {
    if (d == '') {
      dropOutOrder[i] = alphabet2.shift();
    }
  });

  return calculateKendallTauDistance(dropOutOrder,playerPredictionsArray);
}

// from first to last
//Marianne Williamson,Cory Booker,John Delaney,Andrew Yang,Michael Bennet,Deval Patrick,Tom Steyer,Pete Buttigieg,Amy Klobuchar,Michael Bloomberg,Elizabeth Warren,Tulsi Gabbard,Bernie Sanders,Joe Biden
//var dropoutOrder = ["Marianne Williamson", "Cory Booker", "John Delaney", "Andrew Yang", "Michael Bennet", "Deval Patrick", "Tom Steyer", "Pete Buttigieg", "Amy Klobuchar", "Michael Bloomberg", "Elizabeth Warren", "Tulsi Gabbard", "Bernie Sanders", "Joe Biden"];

function dataPrep() { 
  d3.csv("data/submissions.csv", function(data) {
      d3.text('data/droppedCandidates.csv', function(text) {
          var dropOutOrder = text.split(",");
          var numCandidatesStillRunning = numberOfCandidates - dropOutOrder.length
          for (var i = 0; i < numCandidatesStillRunning; i++) {
              dropOutOrder.push('');
          }
          // compute performance metrics
          data.forEach(d => {
              d.prediction = d.prediction.split(', ');
              //partialScoring(d.prediction);
              d.kendallDistance = partialScoring(dropOutOrder, JSON.parse(JSON.stringify(d.prediction)));
              d.kendallNormal = (d.kendallDistance / (numberOfCandidates * (numberOfCandidates - 1) / 2)); // normalized tau score = tau_distance / (n * n-1 / 2)
              d.accuracy = 100 - (d.kendallNormal * 100); // accuracy percentage = 100 - normalized score (which is 0-1) * 100
          });
          console.log(data);
          data = data.slice().sort((a, b) => d3.ascending(a.kendallDistance, b.kendallDistance)); // sort data ascending by kendall distance
          // compute rank for each player
          for (i = 0; i < data.length; i++) {
            if (i == 0) {
              data[i].rank = 1;
            }
            else if (data[i].kendallDistance == data[i-1].kendallDistance) {
              data[i].rank = data[i-1].rank;
            }
            else {
              data[i].rank = i + 1;
            }
          };

          // add each player to leaderboard
          var distanceToColorScale = d3.scaleLinear().domain([0, data.length]).range(["#333399","#8181df"]); // row color
          data.forEach(d => {
            addRow(d.rank, d.name, d.kendallDistance, d.accuracy.toFixed(1), distanceToColorScale(d.rank), d);
          });

          // get average drop out predictions
          var candidateScores = {}
          // find dropout num for each candidate in each guess. Add num to total value for that candidate in the dict.
          data.forEach(d => {
            d.prediction.forEach((p, i) => {
              if (candidateScores[p]) {
                candidateScores[p] += i;
              } else { candidateScores[p] = i}
            });
          });
          // calc average by dividing each value by number of participants
          var averagePredictions = Object.keys(candidateScores).map(function (key) {
            return {'candidate':key, 'value':candidateScores[key] / data.length};
          });
          averagePredictions = averagePredictions.slice().sort((a, b) => d3.ascending(a.value, b.value));
          var averageOrder = [];
          averagePredictions.forEach(ap => averageOrder.push(ap.candidate));

          // draw heatmap
          drawHeatmap(data, averageOrder);
      });
  }); 
};

//////////////////////////////////////////////////////////

// functions for entry form
// make interactive section on entry form sortable
$( function() {

    var candidates = ["Marianne Williamson", "Cory Booker", "John Delaney", "Andrew Yang", "Michael Bennet", "Deval Patrick", "Tom Steyer", "Pete Buttigieg", "Amy Klobuchar", "Michael Bloomberg", "Elizabeth Warren", "Tulsi Gabbard", "Bernie Sanders", "Joe Biden"];
    shuffle(candidates);

    $(".draggableNames").each(function(index) {
        $(this)[0].style.top = 25 * index + "px";
        $(this)[0].innerHTML = candidates[index];
        d3.select($(this)[0]).lower();
        //d3.select($(this)[0]).on("mouseover", function() { d3.select(this).raise(); })
    });

    $("#sortable").sortable({
        stop: function(event, ui) {
            $("#sortable li").each(function(index) {
                if (index == 0 && this.id == '') { // if first sortable li element is still blank, make sure it says 'drop nominee here'
                    this.innerHTML = 'Place 2024 nominee here';
                }
                else if (index == 1 && this.id == '') { // if second sortable li element is still blank, make sure it says 'drop last to drop here'
                    this.innerHTML = 'Place last to drop out here';
                }
                else if ($("#sortable li").length - index == 1 && this.id == '') {
                    this.innerHTML = 'Place first to drop out here';
                }
                else if ($("#sortable li").length - index == 2 && this.id == '') {
                    this.innerHTML = 'Place second to drop out here';
                }
                else if (this.id == '') { // middle items that haven't been spoken for yet should just be blank
                    this.innerHTML = '&nbsp;'
                }
            });
        }
    });

    $(".draggableNames").draggable({
        refreshPositions: true,
        helper: 'clone',
        start: function(event, ui) {
          var movingName = event.target;
          movingName.style.visibility = 'hidden';
          $("#sortable li").each(function() {
              if ($(this)[0].id == '') {
                  $(this)[0].style.boxShadow = 'rgba(17, 177, 177, 0.1) 0px 4px 16px, rgba(17, 177, 177, 0.1) 0px 8px 24px, rgba(17, 177, 177, 0.1) 0px 16px 56px';
              }
          });
        },
        stop: function (event, ui) {
          var movingName = event.target;
          movingName.style.visibility = 'visible';
          $("#sortable li").each(function() {
            $(this)[0].style.boxShadow = 'none';
        });
        },
    });

    $("#sortable li").droppable({
      accept: function(d) { // check if a piece can be dropped here
        if (this.id == '') { 
            return true;
        }
        return false;
      },
      drop: function(event, ui) {
        if (ui.draggable[0].classList.contains('draggableNames')) {
            ui.draggable[0].style.display = 'none';
            event.target.style.backgroundColor = 'whitesmoke';
            event.target.style.border = '1px black solid';
            event.target.style.color = 'black';
            event.target.innerHTML = ui.draggable[0].innerHTML;
            event.target.id = ui.draggable[0].innerHTML;
        }
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
function addRow(rank, name, kendallDistance, accuracy, rowColor, d) {
    var table = document.getElementById("leaderboardTable");
    var row = table.insertRow(-1);

    var rankCell = row.insertCell(0);
    var nameCell = row.insertCell(1);
    var distanceCell = row.insertCell(2);
    var accuracyCell = row.insertCell(3);
    rankCell.innerHTML = '<span class="circle">' + rank + '</span>';
    nameCell.innerHTML = name;
    distanceCell.innerHTML = kendallDistance;
    accuracyCell.innerHTML = accuracy;

    // make aggregate row stand out
    if (name == "Wisdom of the crowd") {
        rowColor = "#008b8b";
        row.addEventListener("click", function() {
            window.open("https://en.wikipedia.org/wiki/Wisdom_of_the_crowd", '_blank').focus();
        });
        row.style.cursor = 'pointer';
        nameCell.style.fontStyle = 'italic';
    }

    row.style.backgroundColor = rowColor;

    nameCell.style.textAlign = 'left';
    nameCell.style.fontSize = '18px';

    row.addEventListener("mouseover", function() {
        document.getElementById("playerHeader").innerHTML = d.name + " Prediction"; // customize title
            
        // change the order to match the player represented by the li moused over
        document.getElementById("1stDrop").innerHTML = d["prediction"][0];
        document.getElementById("2ndDrop").innerHTML = d["prediction"][1];
        document.getElementById("3rdDrop").innerHTML = d["prediction"][2];
        document.getElementById("4thDrop").innerHTML = d["prediction"][3];
        document.getElementById("5thDrop").innerHTML = d["prediction"][4];
        document.getElementById("6thDrop").innerHTML = d["prediction"][5];
        document.getElementById("7thDrop").innerHTML = d["prediction"][6];
        document.getElementById("8thDrop").innerHTML = d["prediction"][7];
        document.getElementById("9thDrop").innerHTML = d["prediction"][8];
        document.getElementById("10thDrop").innerHTML = d["prediction"][9];
        document.getElementById("11thDrop").innerHTML = d["prediction"][10];
        document.getElementById("12thDrop").innerHTML = d["prediction"][11];
        document.getElementById("13thDrop").innerHTML = d["prediction"][12];
        document.getElementById("winner").innerHTML = d["prediction"][13];
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

//////////////////////////

function drawScoresLineplot() {
  if (IsMobileCard()){
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 50},
    width = (screen.height/2) - margin.left - margin.right,
    height = (screen.width) - margin.top - margin.bottom;
    document.getElementById('select').style.display = 'none';
    //d3.select("body").append("p").text("Click any player name to remove their line");
  }
  else{
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 40, bottom: 30, left: 80},
    width = (screen.width * .75) - margin.left - margin.right,
    height = (screen.height/2) - margin.top - margin.bottom;
    document.getElementById('selectMobile').style.display = 'none';
  }

  if ($(window).width() < 870) {
    document.querySelector("#scoresLineplot select").size = "5";
  }
  else {
    document.querySelector("#scoresLineplot select").size = "20";
  }
      
  // append the svg object to the body of the page
  var svg = d3.select("#lineplot")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // make table and selector height matches graph
  document.querySelector('table').style.height = height + margin.top + margin.bottom;
  document.querySelector('#scoresLineplot select').style.height = height + margin.top + margin.bottom;

  //Read the data
  d3.csv("data/scoresOverTime.csv", function(data) {

    // get a dataset of only round 1, for name purposes
    filtered = data.filter(function(row) {
      return (row['round'] == 1); 
    })

    // add all names to selector
    select = document.getElementById('select');
    selectMobile = document.getElementById('selectMobile');
      LoL = [];
      for (row = 0; row < filtered.length; row++){
          // add each participant's name to name selector
          var opt = document.createElement('option');
          opt.value = row;
          opt.innerHTML = filtered[row]['name'];
          select.appendChild(opt);

          var optMobile = document.createElement('option');
          optMobile.value = row;
          optMobile.innerHTML = filtered[row]['name'];
          selectMobile.appendChild(optMobile);
      }

    // sort selector alphabetically
    sortSelect(select);
    sortSelect(selectMobile);

    // add section header for the players
    opt = document.createElement('option');
    opt.innerHTML = "Players";
    opt.disabled = true;
    select.add(opt,0);

    // add space to appear after special options
    opt = document.createElement('option');
    opt.innerHTML = "";
    opt.disabled = true;
    select.add(opt,0);

    // SPECIAL OPTIONS (reverse order)
    // add top 10 option
    opt = document.createElement('option');
    opt.value = 'top10past';
    opt.id = 'top10past';
    opt.innerHTML = "Previous Top 10";
    select.add(opt,0);

    // add top 3 option
    opt = document.createElement('option');
    opt.value = 'top3past';
    opt.id = 'top3past';
    opt.innerHTML = "Previous Top 3";
    select.add(opt,0);

    // add top 10 option
    opt = document.createElement('option');
    opt.value = 'top10';
    opt.id = 'top10';
    opt.innerHTML = "Current Top 10";
    select.add(opt,0);

    // add top 3 option
    opt = document.createElement('option');
    opt.value = 'top3';
    opt.id = 'top3';
    opt.innerHTML = "Current Top 3";
    select.add(opt,0);

    // attach special functions to special options
    d3.select("#top3").on("click", function(){selectTopNum(this, 3)});
    d3.select("#top10").on("click", function(){selectTopNum(this, 10)});
    d3.select("#top3past").on("click", function(){selectTopNumPreviousRound(this, 3)});
    d3.select("#top10past").on("click", function(){selectTopNumPreviousRound(this, 10)});
    ////////////////////////////////////////////////////

    // group the data: I want to draw one line per group
    var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
      .key(function(d) { return d.name;})
      .entries(data);
    sumstatCopy = sumstat;

    if (IsMobileCard()){ // update when candidate drops out
      yTicks = ["1st", "10", 20, 30, 40, 50, 60, 70, "80"];
      xTicks = ["MW", "CB", "JD", "AY", "MB", "DP", "TS", "PB", "AK", "MB", "EW", "TG", "BS"];
    }
    else{ // update when candidate drops out
      yTicks = ["1st Place", "10th", 20, 30, 40, 50, 60, 70, "80"];
      xTicks = ["Williamson", "Booker", "Delaney", "Yang", "Bennet", "Patrick", "Steyer", "Buttigieg", "Klobuchar", "Bloomberg", "Warren", "Gabbard", "Sanders"];
    }

    // Add X axis
    var x = d3.scaleLinear()
      .domain(d3.extent(data, function(d) { return Number(d.round); }))
      .range([ 0, width ]);
    svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(11).tickFormat(function(d, i){return xTicks[i]}));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.rank; })])
      .range([ 0, height ]);

    svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).tickFormat(function(d, i){return yTicks[i]}));

    // alphabetize sumstat
    sumstat.sort(alphabetize);

    // generate random array of colors
    hues = [];
    for (i=0; i < 361; i++){hues.push(i)};
    // remove 'yellows'
    hues = hues.filter(function(d) {
      return (d < 41) || (d > 70); 
    });
    shuffle(hues); // randomize the list
    hues = hues.splice(0,80); // grab the first 80 in the list
    
    brightness = [];
    for (i=0; i<80; i++){
      brightness.push(randomRange(30,70));
    };

    // recolor pre-populated names in legend table
    document.getElementById('alina').style.color = "hsl("+hues[1]+",100%,"+brightness[1]+"%)";
    document.getElementById('andrew').style.color = "hsl("+hues[2]+",100%,"+brightness[2]+"%)";
    document.getElementById('angela').style.color = "hsl("+hues[5]+",100%,"+brightness[5]+"%)";

    // Draw the line
    svg.selectAll(".line")
        .data(sumstat)
        .enter()
        .append("path")
          .attr("fill", "none")
          .attr("class", "scoreLine")
          .attr("id", function(d) { return d.key; })
          .style("stroke",function(d,i){return "hsl("+hues[i]+",100%,"+brightness[i]+"%)"})
          .attr("d", function(d){
            return d3.line()
              .curve(d3.curveCardinal)
              .x(function(d) { return x(d.round); })
              .y(function(d) { return y(d.rank); })
              (d.values)
          });

    // Define the div for the tooltip
    var tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

    // add circles for tooltip
    svg.selectAll("dot")	
      .data(data)			
      .enter().append("circle")								
      .attr("r", 10)
      .style("visibility", "hidden")	
      .style("opacity", 0)
      .attr("id", function(d) { return d.name.replace(" ", "").replace(".","") + "Scatter"; })
      .attr("cx", function(d) { return x(d.round); })		 
      .attr("cy", function(d) { return y(d.rank); })
      .on("mouseover", function(d) {	
        var line = document.getElementById(d.name);
        line.style.strokeWidth = "10px";	
        tooltip.transition()		
          .duration(550)		
          .style("opacity", 1)
          .style("left", (d3.event.pageX + 14) + "px")		
          .style("top", (d3.event.pageY + 14) + "px");		
        tooltip.html("<b>" + d.name + "</b>" + "<br/>" + "Rank: " + d.rank + "<br/>" + "Round: " + d.round);
        })
      .on("mouseout", function(d){
        var line = document.getElementById(d.name);
        line.style.strokeWidth = "3px";	
        tooltip.transition()		
          .duration(550)		
          .style("opacity", 0);
      });

    // give lines raising property
    d3.selectAll(".scoreLine").on("mouseover", function(){
      d3.select(this).raise(); 
      d3.select(this).style("stroke-width", "10px");
      d3.selectAll("#" + this.id.replace(" ", "").replace(".","")+"Scatter").raise(); // get scatter dots and make top
    })
    .on("mouseout",function(){
      d3.select(this).style("stroke-width", "3px");
    });

    // add styling to each selector option
    addColorToSelectOptions();

    // pre-select some names
    select = document.getElementById("select");
    select.options[7].selected = true; // magic number
    select.options[8].selected = true; // magic number
    select.options[11].selected = true; // magic number

    // get array of selected values
    var selectedValues = $("#select").val();

    // for each selected value, locate its line and make visible
    for (i=0; i<selectedValues.length; i++){
      var nameID = $('select option[value=' + selectedValues[i] + ']')[0].text // find option with matching value and get text
      var line = document.getElementById(nameID); // use text to find line with matching ID
      line.style.visibility = "visible"; // reveal
      d3.selectAll("#" + nameID.replace(" ", "").replace(".","")+"Scatter").style("visibility", "visible");; // get scatter dots and make visible
    }
  });

  // when selector is clicked
  $("#select").on('click',function () {

    // select selector
    var sel = document.getElementById('select');

    // hide all lines
    d3.selectAll('.scoreLine').style('visibility','hidden');
    // hide all dots
    d3.selectAll('circle').style('visibility', 'hidden');

    // get array of selected values
    var selectedValues = $("#select").val();

    // remove 'top 3' from selectedValues array as to not disrupt rest of function
    const indexTop3 = selectedValues.indexOf("top3");
    if (indexTop3 > -1) {
      selectedValues.splice(indexTop3, 1);
    };
    // remove 'top 10' from selectedValues array as to not disrupt rest of function
    const indexTop10 = selectedValues.indexOf("top10");
    if (indexTop10 > -1) {
      selectedValues.splice(indexTop10, 1);
    };
    // remove 'top 3 past' from selectedValues array as to not disrupt rest of function
    const indexTop3Past = selectedValues.indexOf("top3past");
    if (indexTop3Past > -1) {
      selectedValues.splice(indexTop3Past, 1);
    };
    // remove 'top 10 past' from selectedValues array as to not disrupt rest of function
    const indexTop10Past = selectedValues.indexOf("top10past");
    if (indexTop10Past > -1) {
      selectedValues.splice(indexTop10Past, 1);
    };

    var names = [];
    var playerColors = [];

    // for each selected value, locate its line and make visible
    for (i=0; i<selectedValues.length; i++){
      var nameID = $('select option[value=' + selectedValues[i] + ']')[0].text // find option with matching value and get text
      names.push(nameID);
      var line = document.getElementById(nameID); // use text to find line with matching ID
      line.style.visibility = "visible"; // reveal
      playerColors.push(line.style.stroke);
      d3.selectAll("#" + nameID.replace(" ", "").replace(".","")+"Scatter").style("visibility", "visible");; // get scatter dots and make visible
    }

    updateLegend(names, playerColors); // also add name to legend table
  });
}

// removes need to use ctrl for multiple select
$("#select").mousedown(function(e){
  e.preventDefault();
  
  var select = this;
  var scroll = select.scrollTop;
  
  e.target.selected = !e.target.selected;
  
  setTimeout(function(){select.scrollTop = scroll;}, 0);
  
  $(select).focus();
}).mousemove(function(e){e.preventDefault()});



function sortSelect(selElem) {
  var tmpAry = new Array();
  for (var i=0;i<selElem.options.length;i++) {
      tmpAry[i] = new Array();
      tmpAry[i][0] = selElem.options[i].text;
      tmpAry[i][1] = selElem.options[i].value;
  }
  tmpAry.sort();
  while (selElem.options.length > 0) {
      selElem.options[0] = null;
  }
  for (var i=0;i<tmpAry.length;i++) {
      var op = new Option(tmpAry[i][0], tmpAry[i][1]);
      selElem.options[i] = op;
  }
  return;
}

// sorts sumstat alphabetically
function alphabetize( a, b ) {
  if ( a.key < b.key ){
    return -1;
  }
  if ( a.key > b.key ){
    return 1;
  }
  return 0;
}

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function addColorToSelectOptions(){
  // for each of the options, add styling so the checked color matches corresponding line
  for (i=0; i<80; i++){
    var sheet = document.createElement('style')
    sheet.innerHTML = "select option:nth-child("+(i+1+6)+"):checked { box-shadow: inset 20px 20px hsl("+hues[i]+",100%,"+brightness[i]+"%) }"; // magic number (3)
    document.body.appendChild(sheet);
  }
}

function updateLegend(names, colors){
  d3.selectAll('tr').remove(); // remove all current table rows

  // add row (with 2 columns) for every name
  for (i=0;i<(names.length/2);i++){
    var row = d3.select('table').append('tr');
    c1 = row.append('td');
    c2 = row.append('td');
  }

  // loop over all cells, add in names
  columns = document.querySelectorAll('td');
  for (c=0;c<names.length;c++){
      columns[c].innerHTML = names[c];
      columns[c].style.color = colors[c];
  }

  // give all the tds a mouseover function
  d3.selectAll('td').on('mouseover',function(){
    // select line corresponding to name in td and raise it
    line = document.getElementById(this.innerHTML);
    d3.select(line).raise();
    d3.select(line).style("stroke-width", "10px");
    d3.selectAll("#" + this.innerHTML.replace(" ", "").replace(".","")+"Scatter").raise(); // get scatter dots and make top
  })
  .on("mouseout",function(){
    line = document.getElementById(this.innerHTML);
    d3.select(line).style("stroke-width", "3px");
  })
  .on("click", function(){
    line = document.getElementById(this.innerHTML);
    line.style.visibility = 'hidden'; // hide line
    d3.selectAll("#" + this.innerHTML.replace(" ", "").replace(".","")+"Scatter").style("visibility", "hidden"); // hide dots
    playerIndex = $('select').find('option:contains('+this.innerHTML+')').index(); // find player index
    document.getElementById("select").options[playerIndex].selected = false; // deselect player option
    this.remove() // self destruct!
  });
}

// for the preloaded tds
d3.selectAll('td').on('mouseover',function(){
  // select line corresponding to name in td and raise it
  line = document.getElementById(this.innerHTML);
  d3.select(line).raise();
  d3.select(line).style("stroke-width", "10px");
  d3.selectAll("#" + this.innerHTML.replace(" ", "").replace(".","")+"Scatter").raise(); // get scatter dots and make top
})
.on("mouseout",function(){
  line = document.getElementById(this.innerHTML);
  d3.select(line).style("stroke-width", "3px");
})
.on("click", function(){
  line = document.getElementById(this.innerHTML);
  line.style.visibility = 'hidden'; // hide line
  d3.selectAll("#" + this.innerHTML.replace(" ", "").replace(".","")+"Scatter").style("visibility", "hidden"); // hide dots
  playerIndex = $('select').find('option:contains('+this.innerHTML+')').index(); // find player index
  document.getElementById("select").options[playerIndex].selected = false; // deselect player option
  this.remove() // self destruct!
});

function selectTopNum(option, rankNum){

  // grab select
  select = document.getElementById("select");

  // filter sumstatCopy to only contestants with rank 1-3 in most recent round
  topNum = sumstatCopy.filter(function(row) {
    return (row['values'][sumstatCopy[0]["values"].length-1]["rank"] <= rankNum);
  })
  
  // loop over these players
  for (i=0;i<topNum.length;i++){
    // get player's index which corresponds to their option. Then select the option with their name.
    playerIndex = $('select').find('option:contains('+topNum[i].key+')').index();

    if (option.selected){ // if selecting "top 3", select all top 3 individuals
      select.options[playerIndex].selected = true;
    }
    else{ // if deselecting, deselect all top 3 individuals
      select.options[playerIndex].selected = false;
    }
  }
};

function selectTopNumPreviousRound(option, rankNum){

  if (option.selected){ // update line below when candidate drops out
    // prompt user for round number of interest
    roundNumber = prompt("Enter a round number to see the top players for that round.\n\n1 = round after Marianne Williamson dropped\n2 = round after Cory Booker dropped\n3 = after John Delaney\n4 = after Andrew Yang\n5 = after Michael Bennet\n6 = after Deval Patrick\n7 = after Tom Steyer\n8 = after Pete Buttigieg\n9 = after Amy Klobuchar\n10 = after Michael Bloomberg\n11 = after Elizabeth Warren\n12 = after Tulsi Gabbard  \n\n Show me round:", 4);
  }

  // grab select
  select = document.getElementById("select");

  // filter sumstatCopy to only contestants with rank 1-3 in most recent round
  topNum = sumstatCopy.filter(function(row) {
    return (row['values'][roundNumber-1]["rank"] <= rankNum);
  })
  
  // loop over these players
  for (i=0;i<topNum.length;i++){
    // get player's index which corresponds to their option. Then select the option with their name.
    playerIndex = $('select').find('option:contains('+topNum[i].key+')').index();

    if (option.selected){ // if selecting "top 3", select all top 3 individuals
      select.options[playerIndex].selected = true;
    }
    else{ // if deselecting, deselect all top 3 individuals
      select.options[playerIndex].selected = false;
    }
  }
};

function removeDuplicates(array) {
  array.splice(0, array.length, ...(new Set(array)))
};

mobileNames = [];
mobileColors = [];
function mobileSelectFunction(value){

  // var names = [];
  // var playerColors = [];

  var nameID = $('#selectMobile option[value=' + value + ']')[0].text // find option with matching value and get text
  mobileNames.push(nameID);
  var line = document.getElementById(nameID); // use text to find line with matching ID
  line.style.visibility = "visible"; // reveal
  mobileColors.push(line.style.stroke);
  d3.selectAll("#" + nameID.replace(" ", "").replace(".","")+"Scatter").style("visibility", "visible");; // get scatter dots and make visible
  
  removeDuplicates(mobileNames);
  removeDuplicates(mobileColors);

  if (!mobileNames.includes("Alina P.")){
    document.getElementById("Alina P.").style.visibility = 'hidden';
  };
  if (!mobileNames.includes("Andrew B.")){
    document.getElementById("Andrew B.").style.visibility = 'hidden';
  };
  if (!mobileNames.includes("Angela G.")){
    document.getElementById("Angela G.").style.visibility = 'hidden';
  };

  d3.selectAll('tr').remove(); // remove all current table rows

  // add row (with 2 columns) for every name
  for (i=0;i<(mobileNames.length/2);i++){
    var row = d3.select('table').append('tr');
    row.append('td');
    row.append('td');
    row.append('td');
  }
  
  columns = document.querySelectorAll('td');
  for (i=0; i<mobileNames.length; i++){
    columns[i].innerHTML = mobileNames[i];
    columns[i].style.color = mobileColors[i];
  }
  
  // give the td a mouseover function
  d3.selectAll('td').on('mouseover',function(){
    // select line corresponding to name in td and raise it
    line = document.getElementById(this.innerHTML);
    d3.select(line).raise();
    d3.select(line).style("stroke-width", "10px");
    d3.selectAll("#" + this.innerHTML.replace(" ", "").replace(".","")+"Scatter").raise(); // get scatter dots and make top
  })
  .on("mouseout",function(){
    line = document.getElementById(this.innerHTML);
    d3.select(line).style("stroke-width", "3px");
  })
  .on("click", function(){
    line = document.getElementById(this.innerHTML);
    line.style.visibility = 'hidden'; // hide line
    d3.selectAll("#" + this.innerHTML.replace(" ", "").replace(".","")+"Scatter").style("visibility", "hidden"); // hide dots
    playerIndex = $('select').find('option:contains('+this.innerHTML+')').index(); // find player index
    document.getElementById("select").options[playerIndex].selected = false; // deselect player option

    // remove name and color from arrays
    var index = mobileNames.indexOf(this.innerHTML);
    if (index > -1) {
      mobileNames.splice(index, 1);
      mobileColors.splice(index, 1);
    }

    this.remove() // self destruct!
  });

}
/////////////////////////////////////

// functions for analysis section

function drawHeatmap(data, dropOutOrder) {
    // set the dimensions and margins of the graph
    var margin = {top: 40, right: 40, bottom: 100, left: 140},
        width = screen.height - 100 - margin.left - margin.right,
        height = screen.height - 100 - margin.top - margin.bottom;

    if (screen.width < 600){
        margin = {top: 30, right: 30, bottom: 10, left: 10},
        width = screen.width - 40 - margin.left - margin.right,
        height = screen.width - 40 - margin.top - margin.bottom;
    }

    var padding = 0.05;

    // append the svg object to the body of the page
    var svg = d3.select("#heatmap")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    function range(start, end) {
      return Array(end - start + 1).fill().map((_, idx) => start + idx)
    }
    var dropOutPositions = range(1, numberOfCandidates); 

    var heatmapData = [];

    // populate heatmapData with all possible combinations of candidates and drop out positions - default value is 0 predictions
    dropOutOrder.forEach(c => {
      dropOutPositions.forEach(p => {
        heatmapData.push({name:c, dropOutPosition:p, value: 0})
      })
    });

    // add every single prediction (player x candidate combo) to heatmapData's value counts
    data.forEach(d => {
      dropOutPositions.forEach(p => {
        var relevantRow = heatmapData.find(h => {return h.name == d['prediction'][p-1] && h.dropOutPosition == p});
        relevantRow['value'] += 1;
      })
    });

    // Build X scales and axis:
    var x = d3.scaleBand()
        .domain(dropOutPositions)
        .range([ 0, width ])
        .padding(padding);
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(function(d, i){return i + 1 == numberOfCandidates ? 'Win' : i + 1}));
    
    // Build Y scales and axis:
    var y = d3.scaleBand()
        .domain(dropOutOrder)
        .range([ 0, height ])
        .padding(padding);
    svg.append("g")
        .attr("class", "axis")
        .attr('transform', 'translate(0, 0)')
        .call(d3.axisLeft(y).tickFormat(function(d){return d.split(" ")[1]}));

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
        .attr("class", "tooltip");
    var mousemove = function(d) {
        var player, statement;
        if (d.value == 0){
            player = "No one predicts "
        }
        else if (d.value == 1) {
            player = "1 player predicts "
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
        tooltip
            .html(player + "<br>" + d.name + statement)
            .style("left", (d3.event.pageX) + 40 + "px")
            .style("top", (d3.event.pageY) + "px");
    }

    // Build color scale for cells
    var heatmapColors = d3.scaleLinear()
      .domain(d3.extent(heatmapData, function(d) { return (d.value); }))
      .range(["white", "blue"]);
      
    // draw and color the cells
    svg.selectAll()
        .data(heatmapData)
        .enter()
        .append("rect")
        .attr("y", function(d) { return y(d.name) })
        .attr("x", function(d) { return x(d.dropOutPosition) })
        .attr("width", width / numberOfCandidates )
        .attr("height", height / numberOfCandidates )
        .style("fill", function(d) {return heatmapColors(d.value)} )
        .on("mouseover", function() {
          tooltip.style("opacity", 1);
          d3.select(this).style("stroke", "black").style("stroke-width", 2);
        })
        .on("mousemove", mousemove)
        .on("mouseleave", function() {
          tooltip.style("opacity", 0);
          d3.select(this).style("stroke", "none");
        });

    // Build color scale for text label
    var textColor = d3.scaleQuantile()
      .domain(d3.extent(heatmapData, function(d) { return (d.value); })) // pass only the extreme values to a scaleQuantize’s domain
      .range(["none", "black", "white"])

    // labels for squares
    svg.selectAll(".heatmapLabel")
        .data(heatmapData)
        .enter()
        .append("text")
        .text(function(d) { return d.value; })
        .attr("y", function(d) { return y(d.name) + (height / numberOfCandidates / 2) })
        .attr("x", function(d) { return x(d.dropOutPosition) + (width / numberOfCandidates / 2) })
        .style("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr('class', 'heatmapLabel')
        .style("fill", function(d) { return textColor(d.value)})
        .attr('pointer-events', 'none');
            
    // text label for the x axis
    svg.append("text")             
        .attr("transform",
                "translate(" + (width/2) + " ," + 
                            (height + margin.top + 10) + ")")
        .style("text-anchor", "middle")
        .attr('class', 'heatmapLabel')
        .text("Predicted Drop Out Position");

    // Heading 
    svg.append("g")
        .append("text")
        .attr("x",(width)/2)
        .attr('y', 0-margin.top+20)
        .attr('font-weight', 'bold')
        .attr('class', 'heatmapHeader')
        .attr('font-family', 'Segoe UI bold')
        .style("text-anchor", "middle")
        .text("74 Predictions Of Candidate Drop Out Order")
}
//////////////////////////////        

function onPageLoad() {

    dataPrep();

    // leaderboard

    // scores lineplot
    drawScoresLineplot();

    // analysis section
}

onPageLoad();