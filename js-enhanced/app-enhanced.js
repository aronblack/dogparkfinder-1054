/**
 *	@preserve Ottawa Dog Park Finder
 *	@author: Thomas J Bradley <theman@thomasjbradley.ca>
 *	@link: http://thomasjbradley.ca
 *	@copyright: Copyright MMXI, Thomas J Bradley (http://thomasjbradley.ca)
 */

/**
 *	Utility function for calucating the length of an oject
 *
 *	@param	object	obj
 *
 *	@return	 int
 */
function objlength(obj)
{
	var size = 0;
	for(var key in obj)
	{
		if(obj.hasOwnProperty(key))
		{
			size++;
		}
	}
	
	return size;
}

/**
 *	Application logic that revolves around the interface and functionality
 *
 *	@author: Thomas J Bradley <theman@thomasjbradley.ca>
 *	@link: http://thomasjbradley.ca
 *	@copyright: Copyright MMXI, Thomas J Bradley (http://thomasjbradley.ca)
 */
var ParkFinder =
{
	/**
	 *	Holds a reference to the Maps object
	 *
	 *	@var	object
	 */
	map: null

	/**
	 *	The max number of parks to show in the list
	 *
	 *	@var	int
	 */
	,maxParks: 10

	/**
	 *	The geo located latitude/longitude based on navigator.geolocation
	 *
	 *	@var	object
	 */
	,navgeo: null

	/**
	 *	The geo located latitude/longitude based on what the user entered
	 *
	 *	@var	object
	 */
	,usergeo: null

	/**
	 *	Holds the template for the park list
	 *
	 *	@var	object	A jQuery object
	 */
	,parkTemplate: null

	/**
	 *	The template for the park loader
	 *
	 *	@var	string
	 */
	,parkLoader: '<div id="parksloader" role="status">{{l.loading}}</div>'

	/**
	 *	Initialises all the functionality of the application
	 *
	 *	@param	object	map	Dependency on the Map object
	 *
	 *	@return	void
	 */
	,init: function(map)
	{
		ParkFinder.map = map;
		
		$('#map').attr('tabindex', -1).attr('aria-live', 'polite');
		
		ParkFinder.initGeoLoc();
		ParkFinder.initLocForm();
		ParkFinder.initParkLists();
		ParkFinder.initRatings();
		
		if(navigator.onLine && window.applicationCache && window.applicationCache.status !== window.applicationCache.UNCACHED)
		{
			setTimeout(ParkFinder.updateParks, 6000);
		}
		
		ParkFinder.map.initMarkers();
		ParkFinder.parkTemplate = $('#popular ol li:first-child').eq(0).clone();
		ParkFinder.updateParkList('clean', ParkFinder.map.sortParksOn('cleanlinessBayesian'));
	}

	/**
	 *	Initialises all the current location based on navigator.geolocation:
	 *
	 *	@return	void
	 */
	,initGeoLoc: function()
	{
		if(geo_position_js.init())
		{
			geo_position_js.getCurrentPosition(function(geo)
			{
				ParkFinder.navgeo = new google.maps.LatLng(geo.coords.latitude, geo.coords.longitude);
				ParkFinder.setUpGeoButton();
			}, function(e){});
		}
		else
		{
			ParkFinder.navgeo = new google.maps.LatLng(ParkFinder.map.params.center.lat(), ParkFinder.map.params.center.lng());
		}
	}

	/**
	 *	Initialises the search form
	 *	Displays the current location button if navigator.geolocation is available
	 *	
	 *	@return	void
	 */
	,initLocForm: function()
	{
		$('#locform').submit(function()
		{
			ParkFinder.setUserLocation($('#loc').val(), ParkFinder.navgeo);
			
			return false;
		});
		
		$('#loc').focus(function()
		{
			$('label.loc').hide();
		});
		
		$('#loc').blur(function()
		{
			if($('#loc').val() === '')
			{
				$('label.loc').show();
			}
		});
		
		if($('#loc').val() !== '')
		{
			$('label.loc').hide();
		}
	}

	/**
	 *	Initialises all the functionality of the park lists and tabs
	 *
	 *	@return	void
	 */
	,initParkLists: function()
	{
		$('.parklists').delegate('ol li .rate', 'click', function()
		{
			ParkFinder.displayRateScreen($(this).parent().attr('data-guid'));
			return false;
		});
		
		$('.parklists').delegate('ol li .parkinfo', 'click', function()
		{
			window.scrollTo(0,0);
			ParkFinder.map.displayInfoWindow($(this).parent().attr('data-guid'));
			return false;
		});
	}

	/**
	 *	Initialises all the functionality of the ratings panel:
	 *
	 *	@return	void
	 */
	,initRatings: function()
	{
		$('.ratewidget').css({'top':-($('.ratewidget').outerHeight() + 100)});
		
		$('#map').delegate('.info button', 'click', function()
		{
			ParkFinder.displayRateScreen($(this).attr('data-guid'));
			return false;
		});
		
		$('#cancel-button').click(function()
		{
			ParkFinder.closeRateScreen();
			return false;
		});
		
		$('#rate-button').click(function()
		{
			ParkFinder.closeRateScreen();
			ParkFinder.submitRating();
			return false;
		});
		
		$('#rate-form').submit(function()
		{
			ParkFinder.closeRateScreen();
			ParkFinder.submitRating();
			return false;
		});
	}

	/**
	 *	Slides the rating screen into place
	 *	Places the correct information into the rating screen
	 *
	 *	@param	string	guid	The guid of the park to rate
	 *
	 *	@return	void
	 */
	,displayRateScreen: function(guid)
	{
		ParkFinder.map.closeInfoWindows();
		
		$('#rate-button').attr('disabled', false);
		$('#cancel-button').attr('disabled', false);
		
		var parktype = ParkFinder.map.getParkType(ParkFinder.map.parks[guid]);
		var rw = $('.ratewidget');
		
		$('input[type="radio"]', rw).attr('checked', false);
		$('h2', rw).html(ParkFinder.map.parks[guid].name);
		$('form', rw).attr('data-guid', guid);
		$('header em', rw)
			.removeClass()
			.addClass(parktype)
			.attr('title', ParkFinder.map.labels[parktype])
			.html(ParkFinder.map.labels[parktype]);
		
		window.scrollTo(0,0);
		$('.ratebox').show().css({'opacity':1.0});
		rw.css({'top':25});
		rw.focus();
	}

	/**
	 *	Slides the rating screen out of view
	 *
	 *	@return	void
	 */
	,closeRateScreen: function()
	{
		$('.ratebox').css({'opacity':0});
		$('.ratewidget').css({'top':-($('.ratewidget').outerHeight() + 100)});
		setTimeout(function(){ $('.ratebox').hide(); }, 500);
		$('#map').focus();
	}

	/**
	 *	Triggers an Ajax request to submit the rating
	 *
	 *	@return	void
	 */
	,submitRating: function()
	{
		$('#rate-button').attr('disabled', true);
		$('#cancel-button').attr('disabled', true);
		
		var data = ParkFinder.getValidRatingData();
		$('.parks-group header').prepend(ParkFinder.parkLoader);
		
		$.ajax({
			url: '/parks/' + data.guid + '/rate',
			type: 'post',
			data: data,
			success: function()
			{
				$('#parksloader').remove();
			},
			error: function()
			{
				$('#parksloader').remove();
			}
		});
	}

	/**
	 *	Triggers an Ajax request to update the parks list
	 *
	 *	@return	void
	 */
	,updateParks: function()
	{
		$('.parks-group header').prepend(ParkFinder.parkLoader);
		
		var d = new Date();
		
		$.ajax({
			url: '/parks.js?' + d.getTime(),
			success: function()
			{
				$('#parksloader').remove();
				ParkFinder.updateParkList('popular', ParkFinder.map.sortParksOn('overallBayesian'));
				ParkFinder.updateParkList('friendly', ParkFinder.map.sortParksOn('friendlinessBayesian'));
				ParkFinder.updateParkList('clean', ParkFinder.map.sortParksOn('cleanlinessBayesian'));
			},
			error: function()
			{
				$('#parksloader').remove();
			}
		});
	}

	/**
	 *	Retrieves the rating data from the rating form and validates it
	 *
	 *	@return	void
	 */
	,getValidRatingData: function()
	{
		var facility = parseInt($('input[name="facility"]:checked').val(), 10);
		var friendly = parseInt($('input[name="friendly"]:checked').val(), 10);
		var clean = parseInt($('input[name="clean"]:checked').val(), 10);
		
		if(facility < 0){ facility = 0; }
		if(facility > 2){ facility = 2; }
		if(friendly < 0){ friendly = 0; }
		if(friendly > 2){ friendly = 2; }
		if(clean < 0){ clean = 0; }
		if(clean > 2){ clean = 2; }
		
		return {
			guid: $('#rate-form').attr('data-guid'),
			facility: facility,
			friendly: friendly,
			clean: clean
		};
	}

	/**
	 *	Given a new list of parks, replaces the current list with the new version
	 *
	 *	@param	string	list	Selector for obtaining the list
	 *	@param	array	parks	The updated parks list
	 *	@param	object	param	Extra parameters for the list display
	 *
	 *	@return	void
	 */
	,updateParkList: function(list, parks, params)
	{
		var symbol = '%';
		var precision = 0;
		var total = (parks.length > ParkFinder.maxParks) ? ParkFinder.maxParks : parks.length;
		
		if(typeof params != 'undefined')
		{
			if(params.hasOwnProperty('symbol'))
			{
				symbol = params.symbol;
			}
			
			if(params.hasOwnProperty('precision'))
			{
				precision = params.precision;
			}
		}
		
		var ollist = $('<ol class="parks"></ol>');
		
		for(var i=0; i<total; i++)
		{
			var guid = parks[i][0];
			var parktype = ParkFinder.map.getParkType(ParkFinder.map.parks[guid]);
			var valueBits = parks[i][1].toString().split(/\./);
			var item = ParkFinder.parkTemplate.clone();
			
			if(precision > 0)
			{
				value = valueBits[0];
				
				if(valueBits[1] != 'undefined')
				{
					value += '.' + valueBits[1].slice(0, precision);
				}
			}
			else
			{
				value = valueBits[0];
			}
			
			$(item).attr('data-guid', guid).removeClass('first-child');
			
			if(i == 0)
			{
				$(item).addClass('first-child');
			}
			
			$('.parkinfo', item).attr('href', '/parks/' + guid);
			$('.rategroup .value', item).html(value);
			$('.rategroup .symbol', item).html(symbol);
			$('.name', item).html(ParkFinder.map.parks[guid].name);
			$('.amount-votes .vote-total', item).html(ParkFinder.map.parks[guid].amountVotes);
			$('em', item)
				.removeClass()
				.addClass('park-type')
				.addClass(parktype)
				.attr('title', ParkFinder.map.labels[parktype])
				.html(ParkFinder.map.labels[parktype]);
			
			ollist.append(item);
		}
		
		$('#' + list).html(ollist);
	}

	/**
	 *	Adds a click handler and displays the current location button
	 *
	 *	@return	void
	 */
	,setUpGeoButton: function()
	{
		$('#locform').addClass('geo');
		$('#currentloc').removeClass('no-geo');
		addClass($id('locform'), 'geo');
		
		$('#currentloc').click(function()
		{
			ParkFinder.usergeo = ParkFinder.navgeo;
			ParkFinder.displayUserLocation();
			
			$('#map').focus();
			
			return false;
		});
	}

	/**
	 *	Geocodes the address string
	 *
	 *	@param	string	userlocation	The address string for geocoding
	 *
	 *	@return	void
	 */
	,setUserLocation: function(userlocation)
	{
		var geocoder = new google.maps.Geocoder();
		
		if(geocoder)
		{
			geocoder.geocode({'address':userlocation+ParkFinder.map.address, region:'{{l.region}}'}, function(results, status)
			{
				if(status == google.maps.GeocoderStatus.OK)
				{
					ParkFinder.usergeo = results[0].geometry.location;
					ParkFinder.displayUserLocation();
				}
			});
		}
	}

	/**
	 *	Displays the user's location on the map and updates the closest parks list
	 *
	 *	@return	void
	 */
	,displayUserLocation: function()
	{
		ParkFinder.map.setUserLocation(ParkFinder.usergeo);
		ParkFinder.displayNearby(ParkFinder.usergeo);
		ParkFinder.map.closeInfoWindows();
	}

	/**
	 *	Updates and displays the nearby parks list
	 *
	 *	@param	LatLng	latlng	The lat/lng of the user location
	 *
	 *	@return	void
	 */
	,displayNearby: function(latlng)
	{
		var parks = ParkFinder.map.sortNearbyParks(latlng);
		
		if($('#nearby').html() === '')
		{
			$('#nearby').html($('#popular').html());
		}
		
		ParkFinder.updateParkList('nearby', parks, {symbol:'km', precision:1});
		
		SimpleTabs.hide();
		$('#tablist-wrapper').removeClass('no-nearby');
		SimpleTabs.show('nearby');
	}
};


/**
 *	Map specific logic for the application
 *
 *	@author: Thomas J Bradley <theman@thomasjbradley.ca>
 *	@link: http://thomasjbradley.ca
 *	@copyright: Copyright MMXI, Thomas J Bradley (http://thomasjbradley.ca)
 */
var Map = 
{
	/**
	 *	The id used for displaying the map
	 *	
	 *	@var	stirng
	 */
	id: 'map'
	
	/**
	 *	The selector for the map wrapper
	 *
	 *	@var	string
	 */
	,wrapper: '#map-wrapper'
	
	/**
	 *	The Id for the marker loader
	 */
	,markersLoaderId: 'markers-loader'

	/**
	 *	Reference to the Google Maps object
	 *
	 *	@var	object
	 */
	,map: null

	/**
	 *	Reference to the MarkerManager
	 *
	 *	@var	object
	 */
	,markerManager: null

	/**
	 *	Holds the park markers
	 *
	 *	@var	object
	 */
	,parkMarkers: {}

	/**
	 *	Holds a list of the open info window objects
	 *
	 *	@var	array
	 */
	,openInfoWindows: []

	/**
	 *	Reference to the user's current location marker
	 *
	 *	@var	object
	 */
	,userMarker: null

	/**
	 *	The extension of the address used when geocoding user locations
	 *
	 *	@var	string
	 */
	,address: '{{l.adr_extra}}'

	/**
	 *	Options for the Google Maps instance
	 *	parseFloat is a hack to get around the build process yet allow Django templates
	 *
	 *	@var	object
	 */
	,params: {
		zoom: 7,
		center: new google.maps.LatLng(parseFloat('{{l.geo_position_lat}}'), parseFloat('{{l.geo_position_lng}}')),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}

	/**
	 *	The available marker types for dislaying on the map
	 *
	 *	@var	object
	 */
	,markers: {
		free: new google.maps.MarkerImage(
			'/theme/img/icons-basic.png',
			new google.maps.Size(22, 26),
			new google.maps.Point(183, 19),
			new google.maps.Point(13, 26)
		)
		,no: new google.maps.MarkerImage(
			'/theme/img/icons-basic.png',
			new google.maps.Size(22, 26),
			new google.maps.Point(139, 19),
			new google.maps.Point(13, 26)
		)
		,leashed: new google.maps.MarkerImage(
			'/theme/img/icons-basic.png',
			new google.maps.Size(22, 26),
			new google.maps.Point(205, 19),
			new google.maps.Point(13, 26)
		)
		,restrictions: new google.maps.MarkerImage(
			'/theme/img/icons-basic.png',
			new google.maps.Size(22, 26),
			new google.maps.Point(161, 19),
			new google.maps.Point(13, 26)
		)
		,shadow: new google.maps.MarkerImage(
			'/theme/img/icons-basic.png',
			new google.maps.Size(30, 26),
			new google.maps.Point(88, 19),
			new google.maps.Point(13, 26)
		)
		,user: new google.maps.MarkerImage(
			'/theme/img/icons-basic.png',
			new google.maps.Size(22, 26),
			new google.maps.Point(117, 19),
			new google.maps.Point(13, 26)
		)
	}

	/**
	 *	The park type labels for how dogs are allowed/disallowed in the park
	 *
	 *	@var	object
	 */
	,labels: {
		free: '{{l.dogs_free}}'
		,no: '{{l.dogs_no}}'
		,leashed: '{{l.dogs_leashed}}'
		,restrictions: '{{l.dogs_restricted}}'
		,user: '{{l.user_location}}'
	}

	/**
	 *	Initlaises the Google map and adds a listener for MarkerManager updates
	 *
	 *	@return	void
	 */
	,init: function()
	{
		Map.map = new google.maps.Map(document.getElementById(Map.id), Map.params);
		
		$(Map.wrapper).prepend('<div id="' + Map.markersLoaderId + '">{{l.mapping_parks}}</div>');
		
		/**
		 *	Triggers an update to MarkerManager
		 */
		google.maps.event.addListener(Map.map, 'center_changed', function()
		{
			google.maps.event.trigger(Map.map, 'dragend');
		});
	}

	/**
	 *	Creates the marker manager and adds the markers to the map
	 *
	 *	@return	void
	 */
	,initMarkers: function()
	{
		Map.createMarkers();
		Map.markerManager = new MarkerManager(Map.map);
		
		var listener = google.maps.event.addListener(Map.markerManager, 'loaded', function()
		{
			google.maps.event.removeListener(listener);
			Map.markerManager.addMarkers(Map.getMarkers(), 3);
			Map.markerManager.refresh();
			$('#' + Map.markersLoaderId).remove();
		});
	}

	/**
	 *	Creates all the markers to be added to the map
	 *
	 *	@return	void
	 */
	,createMarkers: function()
	{
		for(var guid in Map.parks)
		{
			if(Map.parks.hasOwnProperty(guid))
			{
				var parktype = Map.getParkType(Map.parks[guid]);
				
				Map.parkMarkers[guid] = new google.maps.Marker({
					position: new google.maps.LatLng(Map.parks[guid].geolocation[0], Map.parks[guid].geolocation[1]),
					icon: Map.getMarker(Map.parks[guid]),
					shadow: Map.markers.shadow,
					title: Map.parks[guid].name + '; ' + Map.labels[parktype]
				});
				
				Map.parkMarkers[guid].guid = guid;
				
				google.maps.event.addListener(Map.parkMarkers[guid], 'click', function(event)
				{
					Map.displayInfoWindow(this.guid);
				});
			}
		}
	}

	/**
	 *	Gets all the markers in an array
	 *
	 *	@return	array
	 */
	,getMarkers: function()
	{
		var markers = [];
		
		for(var guid in Map.parkMarkers)
		{
			if(Map.parkMarkers.hasOwnProperty(guid))
			{
				markers.push(Map.parkMarkers[guid]);
			}
		}
		
		return markers;
	}

	/**
	 *	Return the string representation of the park type
	 *	Used in classes and other places
	 *
	 *	@param	object	park
	 *
	 *	@return	string
	 */
	,getParkType: function(park)
	{
		if(!park.dogs)
		{
			return 'no';
		}
		
		if(park.restrictions)
		{
			return 'restrictions';
		}
		
		if(park.leashed)
		{
			return 'leashed';
		}
		
		return 'free';
	}

	/**
	 *	Returns a specific marker type for a park
	 *
	 *	@param	object	park
	 *
	 *	@return	object	The Google Maps marker object
	 */
	,getMarker: function(park)
	{
		return Map.markers[Map.getParkType(park)];
	}

	/**
	 *	Triggers the display of an info window
	 *
	 *	@param	string	guid
	 *
	 *	@return	void
	 */
	,displayInfoWindow: function(guid)
	{
		var parktype = Map.getParkType(Map.parks[guid]);
		
		Map.closeInfoWindows();
		Map.map.setCenter(Map.parkMarkers[guid].getPosition());
		
		var content = $('<div class="info ' + parktype + ' map-info"></div>');
		content.append('<span class="icon" title="' + Map.labels[parktype] + '">' + Map.labels[parktype] + '</span>');
		content.append('<strong class="park-name">' + Map.parks[guid].name + '</strong>');
		content.append('<p class="adr">' + Map.parks[guid].address + '</p>');
		content.append('<p class="parktype">' + Map.labels[parktype] + '</p>');
		
		if(Map.parks[guid].notes !== '')
		{
			content.append('<p class="notes">' + Map.parks[guid].notes + '</p>');
		}
		
		var rating = $('<ul class="rating"></ul>');
		rating.append('<li class="overall" title="{{l.rate_overall}}"><span class="value">' + Map.parks[guid].overallBayesian + '</span>{{l.rate_percent}}</li>');
		rating.append('<li class="facility"><span title="{{l.rate_facility}}" class="icon"></span><span class="value">' + Map.parks[guid].facilityBayesian + '</span>{{l.rate_percent}}</li>');
		rating.append('<li class="friendly"><span title="{{l.rate_friendly}}" class="icon"></span><span class="value">' + Map.parks[guid].friendlinessBayesian + '</span>{{l.rate_percent}}</li>');
		rating.append('<li class="clean"><span title="{{l.rate_clean}}" class="icon"></span><span class="value">' + Map.parks[guid].cleanlinessBayesian + '</span>{{l.rate_percent}}</li>');
		
		rating.append('<li class="amount-ratings"><span class="value">' + Map.parks[guid].amountVotes + '</span> {{l.ratings}}</li>');
		
		content.append(rating);
		
		content.append('<div class="buttonbox"><button class="btn btn-alt" data-guid="' + guid + '">{{l.rate}}</button></div>');
		
		var infowindow = new google.maps.InfoWindow({
			content: $('<div>').append(content).html(),
			maxWidth: 350
		});
		
		infowindow.open(Map.map, Map.parkMarkers[guid]);
		Map.openInfoWindows.push(infowindow);
	}

	/**
	 *	Closes all open info windonws
	 *
	 *	@return	void
	 */
	,closeInfoWindows: function()
	{
		var total = Map.openInfoWindows.length;
		
		for(var i=0; i<total; i++)
		{
			Map.openInfoWindows[i].close();
		}
		
		Map.openInfoWindows = [];
	}

	/**
	 *	Sorts the parks on a specific passed key
	 *
	 *	@param	string	key
	 *	@param	array	parks	Optional: a list of parks to sort
	 *
	 *	@return	array
	 */
	,sortParksOn: function(key, parklist)
	{
		var parks = [];
		
		if(typeof parklist == 'undefined')
		{
			parklist = Map.parks;
		}
		
		for(var guid in parklist)
		{
			if(Map.parks.hasOwnProperty(guid))
			{
				parks.push([guid, Map.parks[guid][key]]);
			}
		}
		
		parks.sort(function(a, b)
		{
			return b[1] - a[1];
		});
		
		return parks;
	}

	/**
	 *	Sorts the parks based on their proximity to the passed lat/lng
	 *
	 *	@param	object	latlng
	 *
	 *	@return	array
	 */
	,sortNearbyParks: function(latlng, parklist)
	{
		var parks = [];
		
		if(typeof parklist == 'undefined')
		{
			parklist = Map.parks;
		}
		
		for(var guid in parklist)
		{
			if(Map.parks.hasOwnProperty(guid))
			{
				var current = new LatLon(latlng.lat(), latlng.lng());
				parks.push([guid, current.distanceTo(new LatLon(Map.parks[guid].geolocation[0], Map.parks[guid].geolocation[1]))]);
			}
		}
		
		parks.sort(function(a, b)
		{
			return a[1] - b[1];
		});
		
		return parks;
	}

	/**
	 *	Puts a marker on the user's location and centres the map
	 *
	 *	@param	object	latlng
	 *
	 *	@return	void
	 */
	,setUserLocation: function(latlng)
	{
		if(Map.userMarker !== null)
		{
			Map.userMarker.setMap(null);
		}
		
		Map.userMarker = new google.maps.Marker({
			position: latlng
			,map: Map.map
			,icon: Map.markers.user
			,shadow: Map.markers.shadow
			,title: Map.labels.user
		});
		
		Map.map.setCenter(latlng);
	}
};


/**
 *	Initialise everything when ready
 *
 *	@author: Thomas J Bradley <theman@thomasjbradley.ca>
 *	@link: http://thomasjbradley.ca
 *	@copyright: Copyright MMXI, Thomas J Bradley (http://thomasjbradley.ca)
 */
$.getScript('/parks.js', function()
{
	ParkFinder.init(Map);
});

Map.init();
