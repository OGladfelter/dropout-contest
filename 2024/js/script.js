numberOfCandidates = 14;

function IsMobile() {
    return window.innerWidth < 600; 
}

// for tab navigation
function openTab(evt, tabID) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabID).style.display = "block";
  evt.currentTarget.className += " active";
}

//////////////////////////////////////////////////////////
// Entry form
//////////////////////////////////////////////////////////

// send user to rules tab then smooth scroll to scoring section
function goToScoring(event) {
  openTab(event, 'Rules');
  $(document).ready(function () {
      $('html, body').animate({
          scrollTop: $('#scoring').offset().top - 100
      }, 'slow');
  });
}

// make interactive section on entry form sortable
function addSortingToEntryForm() {

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
}

// dynamic options to "What should we call you on the leaderboard?" question
function changeLeaderboardOptions() {
  document.getElementById("option1").innerHTML = document.getElementById("firstName").value + " " + document.getElementById("lastName").value; 
  document.getElementById("option2").innerHTML = document.getElementById("firstName").value + " " + document.getElementById("lastName").value.charAt(0); 
}

// when user clicks submit entry form button
function submitEntryForm(e) {
  if(!confirm('Are you sure?')) {
      e.preventDefault();
  } else {
    console.log('submitted');
  }
}

//////////////////////////////////////////////////////////
// Data prep
//////////////////////////////////////////////////////////

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
  // contest participants scores' should be impacted only by candidates who have already dropped
  // candidates still campaigning should essentially be ignored. But removing them does not work because that would
  // mess with the weight of a correct/incorrect prediction. Instead, replace all unknowns with 'correct' placeholder guesses

  const alpha = Array.from(Array(dropOutOrder.length - 1)).map((e, i) => i + 65);
  const placeholderValues1 = alpha.map((x) => String.fromCharCode(x)); // needs to equal length of candidates still running - 1
  const placeholderValues2 = alpha.map((x) => String.fromCharCode(x)); // needs to equal length of candidates still running - 1

  const predictionsWithPlaceHolders = [];
  playerPredictionsArray.forEach(function(candidate) {
    if (!dropOutOrder.includes(candidate)) { // candidate hasn't dropped out
      predictionsWithPlaceHolders.push(placeholderValues1.shift()); // so instead add a placeholder
    } else {
      predictionsWithPlaceHolders.push(candidate);
    }
  });

  const dropsWithPlaceHolders = [];
  dropOutOrder.forEach(function(candidate) {
    if (candidate == '') {
      dropsWithPlaceHolders.push(placeholderValues2.shift());
    } else {
      dropsWithPlaceHolders.push(candidate);
    }
  });

  return calculateKendallTauDistance(dropsWithPlaceHolders, predictionsWithPlaceHolders);
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
              d.kendallDistance = partialScoring(dropOutOrder, d.prediction);
              d.kendallNormal = (d.kendallDistance / (numberOfCandidates * (numberOfCandidates - 1) / 2)); // normalized tau score = tau_distance / (n * n-1 / 2)
              d.accuracy = 100 - (d.kendallNormal * 100); // accuracy percentage = 100 - normalized score (which is 0-1) * 100
          });
          data = data.slice().sort((a, b) => d3.ascending(a.kendallDistance, b.kendallDistance)); // sort data ascending by kendall distance
          // compute rank for each player
          for (let i = 0; i < data.length; i++) {
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

          // compute scores for each player at each round so far
          let scoresOverTime = [];
          for (let roundNum = 1; roundNum <= text.split(",").length; roundNum++) {
            const partialDrops = text.split(",").slice(0, roundNum).concat(Array.from({length: numberOfCandidates - roundNum}, (_, roundNum) => ''));
            let scoresThisRound = [];
            data.forEach(d => {
              const score = partialScoring(partialDrops, d.prediction);
              // const kendallNormal = (score / (numberOfCandidates * (numberOfCandidates - 1) / 2)); // normalized tau score = tau_distance / (n * n-1 / 2)
              // const accuracy = 100 - (kendallNormal * 100); // accuracy percentage = 100 - normalized score (which is 0-1) * 100
              scoresThisRound.push({'id':d.participantID, 'name':d.name, 'score':score, 'round':roundNum});
            });
            // sort the scores for this round of the current loop iteration
            scoresThisRound = scoresThisRound.slice().sort((a, b) => d3.ascending(a.score, b.score)); // sort data ascending by kendall distance
            // add rank
            for (let i = 0; i < scoresThisRound.length; i++) {
              if (i == 0) {
                scoresThisRound[i].rank = 1;
              }
              else if (scoresThisRound[i].score == scoresThisRound[i-1].score) {
                scoresThisRound[i].rank = scoresThisRound[i-1].rank;
              }
              else {
                scoresThisRound[i].rank = i + 1;
              }
            };
            // finally, add this round's score data to overall data object
            scoresOverTime = scoresOverTime.concat(scoresThisRound);
          }
          drawScoresLineplot(scoresOverTime);

          // draw heatmap
          drawHeatmap(data, averageOrder);
      });
  }); 
};

//////////////////////////////////////////////////////////
// Leaderboard
//////////////////////////////////////////////////////////

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

function addInteractionToPredictionsList() {
  d3.text('data/droppedCandidates.csv', function(text) {
    var dropOutOrder = text.split(",");
    d3.select("#playerPredictions").on("mouseover", function() {
        document.getElementById("winnerColumn2").innerHTML = '';
        document.getElementById("1stDropColumn2").innerHTML = '';
        $("#playerTable tr").each(function(index) {
            var columns = this.querySelectorAll('td');
            if (dropOutOrder.includes(columns[0].innerHTML)) {
                var scoreEffect = Math.abs(numberOfCandidates - 1 - dropOutOrder.indexOf(columns[0].innerHTML) - index);
                if (scoreEffect == 0) {
                    columns[1].innerHTML = "✔";
                } else {
                    columns[1].innerHTML = "-" + scoreEffect;
                }
            }
        });
    })
    .on("mouseout", function() {
        $("#playerTable tr").each(function(index) {
          var columns = this.querySelectorAll('td');
          columns[1].innerHTML = "";
          document.getElementById("winnerColumn2").innerHTML = 'Winner';
          document.getElementById("1stDropColumn2").innerHTML = '1st drop';
        });
    });
  });
}

//////////////////////////

function drawScoresLineplot(data) {

  data = data.filter(d => d.name != 'Anonymous');

  if (IsMobile()) {
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 50},
    width = (screen.height/2) - margin.left - margin.right,
    height = (screen.width) - margin.top - margin.bottom;
  }
  else {
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 40, bottom: 30, left: 80},
    width = (screen.width * .75) - margin.left - margin.right,
    height = (screen.height/2) - margin.top - margin.bottom;
  }
      
  // append the svg object to the body of the page
  var svg = d3.select("#lineplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  ////////////////////////////////////////////////////

  // group the data by player
  var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.id;})
    .entries(data);
  console.log(sumstat);

  if (IsMobile()){ // update when candidate drops out
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
    .range([0, height]);

  svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).tickFormat(function(d, i){return yTicks[i]}));

  // alphabetize sumstat
  sumstat.sort(alphabetize);

  // add all names to table menu
  const tableSelector = document.getElementById('scoresLineplotTable');

  sumstat.forEach((d, i) => { 
    // add each participant's name to table menu
    var row = document.createElement('tr');
    row.value = d.key; // should be ID
    var column = document.createElement('td');
    column.innerHTML = d.values[0].name;
    row.appendChild(column);
    row.addEventListener('click', drawPlayerLine);
    tableSelector.appendChild(row);
  });

  // generate random array of colors
  hues = [];
  for (i=0; i < 361; i++){hues.push(i)};
  // remove 'yellows'
  // hues = hues.filter(function(d) {
  //   return (d < 41) || (d > 70); 
  // });
  shuffle(hues); // randomize the list
  hues = hues.splice(0, sumstat.length); // grab the first X in the list
  
  brightness = [];
  for (i = 0; i < sumstat.length; i++){
    brightness.push(randomRange(40,90));
  };

  // Draw lines
  svg.selectAll(".line")
    .data(sumstat)
    .enter()
    .append("path")
    .attr("class", "scoreLine")
    .attr("id", function(d) { return d.key; })
    .style("stroke",function(d, i){return "hsl("+hues[i]+",100%,"+brightness[i]+"%)"})
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
    //d3.selectAll("#" + this.id.replace(" ", "").replace(".","")+"Scatter").raise(); // get scatter dots and make top
  })
  .on("mouseout",function(){
    d3.select(this).style("stroke-width", "3px");
  });

  // add styling to each selector option
  //addColorToSelectOptions();

  function drawPlayerLine() {
    console.log(this.value);
    const selectedData = sumstat.filter(s => s.key == this.value);
    // Draw lines
    svg.selectAll(".line")
    .data(selectedData)
    .enter()
    .append("path")
    .attr("class", "scoreLine")
    .style('visibility', 'visible')
    .attr("id", function(d) { return d.key; })
    .style("stroke",function(d, i){return "hsl("+hues[i]+",100%,"+brightness[i]+"%)"})
    .attr("d", function(d){
      return d3.line()
        .curve(d3.curveCardinal)
        .x(function(d) { return x(d.round); })
        .y(function(d) { return y(d.rank); })
        (d.values)
    });
  }
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
    sheet.innerHTML = "select option:nth-child("+(i+1)+"):checked { box-shadow: inset 20px 20px hsl("+hues[i]+",100%,"+brightness[i]+"%) }"; // magic number (3)
    document.body.appendChild(sheet);
  }
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

//////////////////////////////////////////////////////////
// Analysis section
//////////////////////////////////////////////////////////

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
        .attr("class", "axis noAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(function(d, i){return i + 1 == numberOfCandidates ? 'Win' : i + 1}));
    
    // Build Y scales and axis:
    var y = d3.scaleBand()
        .domain(dropOutOrder)
        .range([ 0, height ])
        .padding(padding);
    svg.append("g")
        .attr("class", "axis noAxis")
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
      .range(["#312e2b", "white"]); // from background color of charcoal to less-light cyan
      
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
          d3.select(this).style("fill", "orange");
        })
        .on("mousemove", mousemove)
        .on("mouseleave", function(d) {
          tooltip.style("opacity", 0);
          d3.select(this).style("fill", function(d) {return heatmapColors(d.value)} );
        });

    // Build color scale for text label
    var textColor = d3.scaleQuantile()
      .domain(d3.extent(heatmapData, function(d) { return (d.value); })) // pass only the extreme values to a scaleQuantize’s domain
      .range(["none", "black", "black"])

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
        .attr('class', 'heatmapHeader')
        .attr('font-family', 'Segoe UI bold')
        .style("text-anchor", "middle")
        .text("74 Predictions Of Candidate Drop Out Order")
}

function main() {
    // entry form
    addSortingToEntryForm();

    // dataPrep() calls a few other functions, such as addRow() and drawHeatmap()
    dataPrep();

    // leaderboard interaction
    addInteractionToPredictionsList();
}

main();