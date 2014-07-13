/*
   MPFinder main.js
   Built in the UK with love by Jamie Hoyle and Ross Penman
*/

/*
  All functions that are specific to a country.
    * Should be relatively easy to modify based on the data you get back.
 */

var apiKey = 'INSERT-SUNLIGHT-API-KEY-HERE';

var config = {
  //Sunlight Foundation API key
  'apiKey': 'INSERT-SUNLIGHT-API-KEY-HERE',
  //structure: 'http://postcodes.cloudapp.net/postcode/' + postcode
  'postcodeBaseUrl': 'http://congress.api.sunlightfoundation.com/legislators/locate/?apikey=' + apiKey + '&',
  //structure: config.latlngBaseUrl + lat + '/' + lng
  'latlngBaseUrl': 'http://congress.api.sunlightfoundation.com/legislators/locate/?apikey=' + apiKey + '&',
  //structure: http://jamiehoyle.com/mp (in <a href="" things)
  'siteUrl': 'http://jamiehoyle.com/rep'
}

var localised = {
  displayMP: function(data) {
    //clear current search terms
    $('.results').html('');
    $('.emailModal').remove();
    console.log(data);
    //find constituency name
    //consURI = encodeURIComponent(cons);
    if(data.count == 0) {
      $('.waiting').fadeOut(250);
      $('.results').html('Sorry, but there were no results. If you are using Geolocation, try manually entering your ZIP by clicking the link above.');
    } else {
      $.each(data.results, function(i,v) {
        //window.location.hash = consURI;
        //render the data, in a horrible horrible way
        if(v.chamber == 'house') {
          type = 'Representative'
        } else {
          type = 'Senator'
        }
        //create the results
        $('.results').append('<article id="article' + i + '"><h2 class="mpName"></h2><h4 class="mpHouse"></h4><a href="#" class="emailMP button">Email</a><div class="moreInformation"><p class="mpConstituency"></p><p class="mpEmail"></p><p class="mpTwitter"></p><p class="mpWebsite"></p></div><a href="#" class="moreInfo">more</a></article>')
        $('#header p').hide();
        $('.longer').hide();
        $('.waiting').fadeOut(250);
        $('article').fadeIn(500);
        $('#article' + i).attr('result', i);
        $('#article' + i + ' .shareables').fadeIn(1000);
        $('#article' + i + ' .moreInformation').slideUp(250);
        $('#article' + i + ' .mpName').text('Your ' + type + ' is ' + v.title + ' ' + v.first_name + ' ' + v.last_name);
        $('#article' + i + ' .mpNameModal').text(v.name);
        $('#article' + i + ' .mpConstituency').text(v.constituency);
        $('#article' + i + ' .mpEmail').html('<a href="mailto:' + v.oc_email + '">' + v.oc_email + '</a>');
        $('#emailModal h3').text(v.email);
        if(v.twitter_id != undefined) {
          $('#article' + i + ' .mpTwitter').html('<a href="http://twitter.com/' + v.twitter_id + '">@' + v.twitter_id + '</a>');
        }
        $('#phoneModal h3').text(v.tel);
        $('#article' + i + ' .mpWebsite').html('<a target="_blank" href="' + v.website + '">' + v.website + '</a>');
        $('#article' + i + ' .callMP').attr('href', 'tel:' + v.oc_tel);
        $('#article' + i + ' .emailMP').attr('href', 'mailto:' + v.oc_email);
        $('#article' + i).addClass('party' + v.party);
        //create the modal
        $('body').prepend('<div class="emailModal modal" id="emailModal' + i + '"><p>A new email to <b><span class="mpNameModal">' + v.title + ' ' + v.first_name + ' ' + v.last_name + '</span></b> should have opened in your chosen email client. The email address is listed below:</p><h3>' + v.oc_email + '</h3></div>');
      })
      all.loaded = 1;
      return;
    }
  },

  manualEntry: function(postcode) {
      $('.waiting').fadeIn(250);
      setTimeout(all.timed, 15000);
      $.ajax({
        url: config.postcodeBaseUrl + 'zip=' + postcode,
        jsonpCallback: 'localised.displayMP',
        dataType: 'jsonp'
      });
  },

  getCoords: function(position) {
    //get latitude and longitude
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
    //make request to postcode API
    $.ajax({
      url: config.latlngBaseUrl + 'latitude=' + lat + '&longitude=' + long,
      jsonpCallback: 'localised.displayMP',
      dataType: 'jsonp'
    });
  }
}

/*
 * All functions that are country-agnostic.
 */
var all = {
  //set the page
  loaded: 0,

  timed: function() {
    if(all.loaded == 0) {
    $('header').append('<p class="longer">This request is taking slightly longer than usual. You can wait, reload this page, or try the manual entry link above.</p>');
    }
  },

  getLocation: function() {
    //check for geolocation support
    if (Modernizr.geolocation) {
      //get lat/long
      navigator.geolocation.getCurrentPosition(localised.getCoords);
      $('.waiting').fadeIn(250);
      setTimeout(all.timed, 15000);
      //get postcode
    } else {
      //unsupported
      $('#welcome').append('<br/><b>Your browser does not support gelocation. Please click on the link above.</b>');
    }
  }
}

//deal with document ready items.
$(document).ready(function() {
  //check if we've launched
  var hasLaunched = localStorage.getItem('hasLaunched');
  //edit the welcome message to suit:
  if(window.location.hash) {
    //if the user has arrived from a permalink
    $('#welcome').html('You arrived at RepFinder from a permalink. If you would rather find your own Representative, click <a href="' + config.siteUrl + '">here</a>.');
  } else if(hasLaunched == 'yes') {
    //if the user has used MPFinder before, don't ask them to accept a geolocation request
    $('#welcome').html('We&#39;re going to use your geolocation settings from last time. If you would rather enter a ZIP code manually, please click <a href="#" class="geoOptOut">here</a>.');
  } else {
    //if the user hasn't used it before, guide them through the geolocation request.
    $('#welcome').html('Welcome to RepFinder. Please click &quot;allow&quot; on the Geolocation request that will appear. If you don&#39;t want to use Geolocation, please click <a href="#" class="geoOptOut">here</a>.')
  }

  //check if a URL fragment exists
  if(window.location.hash) {
    // Fragment exists, use that
    var constituency = decodeURIComponent(window.location.hash.substring(1));
    // skip requests to API, we can just send the non-encoded constituency to our displayMP function
    localised.displayMP(constituency);
  } else {
    // Fragment doesn't exist, start location request
    all.getLocation();
  }
})

/*
  Ways to handle events
 */

/*
  show an input form if the user requests it
  TODO: make this nicer and don't rely on $.html
 */
$(document.body).on('click', '.geoOptOut', function(event) {
  event.preventDefault();
  $('.search').html('<input id="postcodeManual" placeholder="37188" /><button id="submitManual">Find</button>');
})

/*
  send a postcode across to a function
*/
$(document.body).on('click', '#submitManual', function(event) {
  var postcode = $('#postcodeManual').val();
  localised.manualEntry(postcode);
})

/*
  show more information for a representative if requested
 */
$(document.body).on('click', '.moreInfo', function(event) {
  event.preventDefault();
  $(this).siblings('.moreInformation').slideDown(250);
  $(this).hide();
})

/*
  show some modal dialogs only on big (assumed desktop) screens.
 */
$(document.body).on('click', '.emailMP', function() {
  //assume mobile has less than 1024px width
  if (Modernizr.mq('only screen and (max-width: 1024px)')) {
    //don't show modal
  } else {
    var resultID = $(this).parent().attr('result');
    $('#emailModal' + resultID).modal();
  }
})
