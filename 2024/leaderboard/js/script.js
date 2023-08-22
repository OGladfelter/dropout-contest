const numberOfCandidates = 12;

const candidateDict = {
  'trump': "Donald Trump",
  'haley': "Nikki Haley",
  'ramaswamy': "Vivek Ramaswamy",
  'hutchinson': "Asa Hutchinson",
  'elder': "Larry Elder",
  'scott': "Tim Scott",
  'desantis': "Ron DeSantis",
  'pence': "Mike Pence",
  'christie': "Chris Christie",
  'burgum': "Doug Burgum",
  'suarez': "Francis Suarez",
  'hurd': "Will Hurd"
}

const dropOutOrder = ["Will Hurd","Francis Suarez","Larry Elder","Doug Burgum","Vivek Ramaswamy","Tim Scott"]; // from first to last
//var dropoutOrder = ["Marianne Williamson", "Cory Booker", "John Delaney", "Andrew Yang", "Michael Bennet", "Deval Patrick", "Tom Steyer", "Pete Buttigieg", "Amy Klobuchar", "Michael Bloomberg", "Elizabeth Warren", "Tulsi Gabbard", "Bernie Sanders", "Joe Biden"];

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

// send user to rules tab then smooth scroll to scoring section
function goToScoring(event) {
  openTab(event, 'Rules');
  $(document).ready(function () {
      $('html, body').animate({
          scrollTop: $('#scoring').offset().top - 100
      }, 'slow');
  });
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

function readData() { 
  d3.csv("data/submissions2024.csv").then(function(data) {
      // compute performance metrics
      data.forEach((d, i) => {
          d.prediction = d.prediction.split(',').slice(0, numberOfCandidates); // slice since splitting adds empty string to array
          d.kendallDistance = 0;
          d.kendallNormal = (d.kendallDistance / (numberOfCandidates * (numberOfCandidates - 1) / 2)); // normalized tau score = tau_distance / (n * n-1 / 2)
          d.accuracy = 100 - (d.kendallNormal * 100); // accuracy percentage = 100 - normalized score (which is 0-1) * 100
          d.participantID = i;
          d.round_1_rank = 13;
          d.round_2_rank = 5;
          d.round_3_rank = 6;
          d.round_4_rank = 23;
          d.round_5_rank = 1;
          d.round_6_rank = 2;
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
        addRow(d.rank, d.leaderboardAlias, d.kendallDistance, d.accuracy.toFixed(1), distanceToColorScale(d.rank), d);
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
      
      // add some viz
      drawScoresLineplot(data); // draw scores over time lineplot
      drawHeatmap(data); // draw heatmap
  }); 
};

//////////////////////////////////////////////////////////
// Leaderboard
//////////////////////////////////////////////////////////

function addRow(rank, name, kendallDistance, accuracy, rowColor, d) {
    var table = document.getElementById("leaderboardTable");
    var row = table.insertRow(-1);
    row.id = "leaderboardRow" + d.participantID;
    row.classList.add('leaderboardRow');

    var rankCell = row.insertCell(0);
    var nameCell = row.insertCell(1);
    var distanceCell = row.insertCell(2);
    var accuracyCell = row.insertCell(3);
    rankCell.innerHTML = '<span class="circle">' + rank + '</span>';
    nameCell.innerHTML = name == "Wisdom of the crowd" ? "<a href='https://en.wikipedia.org/wiki/Wisdom_of_the_crowd' target='_blank' id='wikiLink'>Wisdom of the crowd &#9432;</a>" : name;
    distanceCell.innerHTML = kendallDistance;
    accuracyCell.innerHTML = accuracy;

    // make aggregate row stand out
    if (name == "Wisdom of the crowd") {
        row.addEventListener("mouseover", function() {
            document.getElementById('wikiLink').classList.add('blackText');
        });
        row.addEventListener("mouseout", function() {
          document.getElementById('wikiLink').classList.remove('blackText');
        });
        nameCell.style.fontWeight = 'bold';
        nameCell.style.color = 'cyan';
    }

    row.style.backgroundColor = rowColor;

    nameCell.style.textAlign = 'left';
    nameCell.style.fontSize = '18px';

    row.addEventListener("mouseover", function() {
        document.getElementById("playerHeader").innerHTML = d.leaderboardAlias + " Prediction"; // customize title
        for (i=0; i<d.prediction.length; i++ ) {
          document.getElementById("drop_" + (i + 1)).innerHTML = candidateDict[d["prediction"][i]];
        }
    });
    row.addEventListener("click", function() { // click a row to show their line in Standings Over Time tab
      document.getElementById('lineplotRow' + d.participantID).click();
      openTab(event, 'scoresLineplot');
    })

}

function addInteractionToPredictionsList() {
    d3.select("#playerPredictions")
      .on("mouseover", function() {
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
}

//////////////////////////

function drawScoresLineplot(data) {

  // set the dimensions and margins of the graph
  if (window.innerWidth < 600) {
    var margin = {top: 10, right: 30, bottom: 50, left: 50},
    width = (screen.height / 2) - margin.left - margin.right,
    height = (screen.width) - margin.top - margin.bottom;
  }
  else {
    var margin = {top: 10, right: 40, bottom: 50, left: 80},
    width = (screen.width * .75) - margin.left - margin.right,
    height = (screen.height / 1.5) - margin.top - margin.bottom;
    document.getElementById('tableContainer').style.maxHeight = height + 'px';
  }
     
  // append a svg object to the page
  var svg = d3.select("#lineplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .on('click', function() {
      d3.selectAll("[data-scatterplotMark]").remove();
      d3.selectAll('.scoreLine').remove();
      d3.selectAll("[data-selected]").style('background-color', 'white');
      document.querySelectorAll("[data-selected='1']").forEach(tr => tr.dataset.selected = 0);
    })
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const xTicks = [];
  if (window.innerWidth < 600) {
    yTicks = ["1st", "10", 20, 30, 40, 50, 60, 70, "80"]; // TODO: automate this based on highest rank
    dropOutOrder.forEach(candidate => xTicks.push(candidate.split(" "[1]))); // TODO: switch out with candidate initials?
  }
  else {
    yTicks = ["1st Place", "10th", 20, 30, 40, 50, 60, 70, "80"]; // TODO: automate this based on highest rank
    dropOutOrder.forEach(candidate => xTicks.push(candidate.split(" "[1])));
  }

  // Add X axis
  var x = d3.scaleLinear()
    .domain([0, dropOutOrder.length - 1]) // 1 tick for each round
    .range([ 0, width ]);
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(dropOutOrder.length).tickFormat(function(d){return xTicks[d]}));
  
  // Add Y axis
  let maxRank = 1;
  dropOutOrder.forEach((d, i) => maxRank = d3.max([maxRank, d3.max(data, c => c[`round_${i+1}_rank`])])); // for every 'round_x_rank' column, find highest possible rank
  var y = d3.scaleLinear()
    .domain([1, maxRank]) // min rank will always be 1
    .range([0, height]);

  svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).ticks(5).tickFormat(function(d){ return d + nth(d) }));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.top + (margin.bottom / 1.5))
    .attr("class", "axis")
    .style("text-anchor", "middle")
    .text("Candidate drop out order");

  // Define the div for the tooltip
  var tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

  // add all names to table menu
  const tableSelector = document.getElementById('scoresLineplotTable');
  data.forEach(d => {
    let randomHue = Math.floor(Math.random() * 360);
    const blueMin = 210;
    const purpleMax = 270;
    if (blueMin < randomHue & randomHue < purpleMax) { // shift hue to get out of dark blue - purple range
        randomHue += purpleMax - blueMin;
    }
    d.color = 'hsl(' + randomHue + ', 100%, 50%';
    // add each participant's name to table menu
    var row = document.createElement('tr');
    row.participantID = d.participantID;
    row.dataset.selected = 0;
    var column = document.createElement('td');
    column.innerHTML = d.leaderboardAlias;
    row.appendChild(column);
    row.addEventListener('click', drawPlayerLine, false);
    row.id = 'lineplotRow' + d.participantID;
    tableSelector.appendChild(row);

    if (d.leaderboardAlias == 'Wisdom of the crowd') {
      row.click();
    }
  });

  function drawPlayerLine(event) {
    this.dataset.selected == 0 ? this.dataset.selected = 1 : this.dataset.selected = 0; // flip 'truthiness' of if row is selected or not

    const participantData = data.filter((d) => d.participantID == event.currentTarget.participantID)[0]; // access data for the player corresponding to clicked row

    if (this.dataset.selected == 1) { // draw the line

      // highlight the row
      this.style.backgroundColor = participantData.color;

      const roundData = [];
      dropOutOrder.forEach((d, i) => roundData.push({'round': i, 'rank': participantData[`round_${i+1}_rank`]}));
      
      // define the line
      var valueline = d3.line()
        .x(function(d) { return x(d.round); })
        .y(function(d) { return y(d.rank); });

      // Draw lines
      svg.append("path")
        .data([roundData])
        .attr("d", valueline)
        .attr("id", d => "scoreLine" + participantData.participantID)
        .attr("class", "scoreLine")
        .style("stroke", participantData.color)
        .on("mouseover", function() {
          d3.select(this).raise(); 
          d3.select(this).style("stroke-width", "8px");
          d3.selectAll(".scoreDots" + participantData.participantID).raise(); // get scatter dots and make top
        })
        .on("mouseout",function() {
          d3.select(this).style("stroke-width", "3px");
        });

      // add circles to look at
      svg.selectAll(".dot")	
        .data(roundData)			
        .enter().append("circle")								
        .attr("r", 5)
        .style("stroke", participantData.color)
        .attr("class", d => "scoreDots" + participantData.participantID)
        .attr('data-scatterplotMark', 1)
        .attr("cx", function(d) { return x(d.round); })		 
        .attr("cy", function(d) { return y(d.rank); });

      // add invisible circles for tooltip
      svg.selectAll(".dot")	
        .data(roundData)			
        .enter().append("circle")								
        .attr("r", 15)
        .style("opacity", 0.1)
        .attr("class", d => "scoreDots" + participantData.participantID)
        .attr('data-scatterplotMark', 1)
        .style("fill", participantData.color)
        .attr("cx", function(d) { return x(d.round); })		 
        .attr("cy", function(d) { return y(d.rank); })
        .on("mouseover", function(event, d) {	
          d3.select(this).transition().duration(500).attr("r", 20);
          tooltip
            .html("<b>" + participantData.leaderboardAlias + "</b>" + "<br/>" + "Rank: " + d.rank + "<br/>" + "Round: " + d.round)
            .style('left', event.pageX / window.innerWidth <= 0.75 ? event.pageX + 5 + 'px' : event.pageX - tooltip.node().getBoundingClientRect().width - 10 + 'px')
            .style("top", (event.pageY + 10) + "px")
            .transition()		
            .duration(500)		
            .style("opacity", 1);		
        })
        .on("mouseout", function(d) {
          d3.select(this).transition().duration(500).attr("r", 15);
          tooltip
            .transition()		
            .duration(250)		
            .style("opacity", 0);
        });
    } else { // remove the line
      d3.select("#scoreLine" + participantData.participantID).remove();
      d3.selectAll(".scoreDots" + participantData.participantID).remove();
      this.style.backgroundColor = 'white';
    }
  }
}

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

//////////////////////////////////////////////////////////
// Heatmap functions
//////////////////////////////////////////////////////////

function range(start, end) {
  return Array(end - start + 1).fill().map((_, idx) => start + idx);
}

function nth(n){return["st","nd","rd"][((n+90)%100-10)%10-1]||"th"}

function drawHeatmap(predictionsData) {

  // read heatmap data generated by python script
  d3.csv("data/heatmapData.csv").then(function(data) {
    
    const averagePredictedDropOutOrder = data.map(function(d) { return d.index}); // list candidates by 'average' drop out order
    const dropOutPositions = range(1, numberOfCandidates); // an array of numbers, 1 - 12

    // reformat data into long format
    const heatmapData = [];
    data.forEach(d => {
      dropOutPositions.forEach(p => {
        heatmapData.push({name:d.index, dropOutPosition:p, value: parseInt(d[p])})
      });
    });

    // set the dimensions and margins of the graph
    var margin = {top: 40, right: 40, bottom: 100, left: 140},
        width = screen.height - 150 - margin.left - margin.right,
        height = screen.height - 150 - margin.top - margin.bottom;

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
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
        .domain(averagePredictedDropOutOrder)
        .range([ 0, height ])
        .padding(padding);
    svg.append("g")
        .attr("class", "axis noAxis")
        .attr('transform', 'translate(0, 0)')
        .call(d3.axisLeft(y).tickFormat(function(d){return candidateDict[d].split(" ")[1]}));
    
    // create a tooltip
    var tooltip = d3.select("body")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip");
    var mousemove = function(event, d) {
        let player;
        if (d.value == 0){
            player = "No one predicts "
        }
        else if (d.value == 1) {
            player = "One player predicts "
        }
        else {
            player = d.value + " players predict "
        }
        
        let statement;
        if (d.dropOutPosition == numberOfCandidates){
            statement = " will win";
        } 
        else {
            statement = " will drop out " + d.dropOutPosition + nth(d.dropOutPosition);
        }
      
        tooltip
            .html(player + "<br>" + candidateDict[d.name] + statement)
            .style("left", (event.pageX) + 20 + "px")
            .style("top", (event.pageY) + "px");
    }

    // Build color scale for cells
    var heatmapColors = d3.scaleLinear()
      .domain(d3.extent(heatmapData, function(d) { return (d.value); }))
      .range(["#312e2b", "cyan"]); // from background color of charcoal to less-light cyan
      
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
        .style('cursor', function(d) { return d.value > 0 ? 'pointer' : 'default' })
        .on("mouseover", function() {
          tooltip.style("opacity", 1);
          d3.select(this).style("fill", "orange");
        })
        .on("mousemove", mousemove)
        .on("mouseleave", function() {
          tooltip.style("opacity", 0);
          d3.select(this).style("fill", function(d) {return heatmapColors(d.value)} );
        })
        .on("click", function(event, d) {
            document.querySelectorAll('.leaderboardRow').forEach(d => d.classList.remove('orangeFill'));
            // figure out who made this prediction and highlight them on the leaderboard
            const theGuessers = predictionsData.filter(t => t.prediction[d.dropOutPosition - 1] == d.name);
            if (theGuessers.length) {
                theGuessers.forEach(g => document.getElementById("leaderboardRow" + g.participantID).classList.add('orangeFill'));
                document.getElementById("contestInfo").innerHTML = 'Remove highlighting';
                openTab(event, 'Leaderboard');
            }
        })

    // Build color scale for text label
    var textColor = d3.scaleQuantile()
      .domain(d3.extent(heatmapData, function(d) { return (d.value); })) // pass only the extreme values to a scaleQuantize’s domain
      .range(["none", "white", "black", "black"])

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
        .text("Candidate Drop Out Order Predictions");
  });
}

function main() {
    // calls a few other functions too
    readData();

    // leaderboard interaction
    addInteractionToPredictionsList();
}

main();