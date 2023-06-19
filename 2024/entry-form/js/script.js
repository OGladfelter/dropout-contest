function IsMobile() {
    return window.innerWidth < 600; 
}

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
  'suarez': "Francis Suarez"
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

// send user to rules tab then smooth scroll to scoring section
function goToScoring(event) {
  openTab(event, 'Rules');
  // $(document).ready(function () {
  //     $('html, body').animate({
  //         scrollTop: $('#scoring').offset().top - 100
  //     }, 'slow');
  // });
}

// dynamic options to "What should we call you on the leaderboard?" question
function changeLeaderboardOptions() {
  document.getElementById("option1").innerHTML = document.getElementById("firstName").value + " " + document.getElementById("lastName").value; 
  document.getElementById("option2").innerHTML = document.getElementById("firstName").value + " " + document.getElementById("lastName").value.charAt(0); 
}

// used to randomize candidate order
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

// add candidates to the carousel
function addCandidatesToDOM() {
  const candidates = Object.keys(candidateDict);
  shuffle(candidates); // randomize since it is a survey

  // select the gallery container div
  const gallery = document.querySelector(".gallery");

  candidates.forEach(c => {
    // add a gallery cell div to the gallery
    const galleryCell = document.createElement("div");
    galleryCell.dataset.candidate = c;
    galleryCell.dataset.ranked = 0; // used to track if candidate has been added later on
    galleryCell.classList.add("gallery-cell");

    // create headshot div
    const div = document.createElement("div");
    div.classList.add("headshot");
    div.classList.add(c);

    // create span with name
    const span = document.createElement("span");
    span.innerHTML = candidateDict[c];

    // add headshot div and span to gallery cell
    galleryCell.appendChild(div);
    galleryCell.appendChild(span);

    // add gallery cell to gallery
    gallery.appendChild(galleryCell);
  })
}

// make interactive section on entry form sortable
function addSortingToEntryForm() {

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

// when user clicks a candidate in the carousel
function candidateHeadshotClicked(event, cellElement) {
  const alreadyClicked = cellElement.getAttribute("data-ranked");
  if (alreadyClicked == 1) {
    return; // do nothing
  }
  const candidate = cellElement.getAttribute("data-candidate");
  cellElement.style.opacity = 0.25;
  cellElement.dataset.ranked = 1;

  // iterate over sortable list items, add candidate that was clicked
  $("#sortable li").each(function(index, li) {
    if (!li.id) {
      li.style.backgroundColor = 'whitesmoke';
      li.style.border = '1px black solid';
      li.style.color = 'black';
      li.innerHTML = candidateDict[candidate];
      li.id = candidate;
      return false; // break out of each loop
    }
  });
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
    // jquery code for sorting and dragging abilities
    addSortingToEntryForm();

    // add candidates to DOM
    addCandidatesToDOM();

    // use Flickity to set up a carousel
    var flkty = new Flickity( '.js-flickity', {
      // options
      cellAlign: 'center',
      contain: true,
      wrapAround: true,
      freeScroll: true,
      // autoPlay: true,
      // autoPlay: 1500,
      arrowShape: { 
        x0: 15,
        x1: 70, y1: 30,
        x2: 60, y2: 5,
        x3: 60
      },
      imagesLoaded: true
    });
    flkty.on( 'staticClick', function( event, pointer, cellElement ) {
      candidateHeadshotClicked(event, cellElement);
    });

}

main();