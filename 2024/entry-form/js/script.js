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

function main() {
    // entry form
    addSortingToEntryForm();
}

main();