/**
 *	@preserve Ottawa Dog Park Finder
 *	@author: Thomas J Bradley <theman@thomasjbradley.ca>
 *	@link: http://thomasjbradley.ca
 *	@copyright: Copyright MMXI, Thomas J Bradley (http://thomasjbradley.ca)
 */

/**
 *	Utilities
 */
function $id(id)
{
	return document.getElementById(id);
}

function bind(ev, obj, func)
{
	if(obj.addEventListener)
	{
		obj.addEventListener(ev, func, false);
	}
	else if(obj.attachEvent)
	{
		obj.attachEvent('on' + ev, func);
	}
}

function unbind(ev, obj, func)
{
	if(obj.removeEventListener)
	{
		obj.removeEventListener(ev, func, false);
	}
	else if(obj.detachEvent)
	{
		obj.detachEvent('on' + ev, func);
	}
}

function addClass(obj, cssClass)
{
	obj.className += ' ' + cssClass;
}

function removeClass(obj, cssClass)
{
	var regex = new RegExp('\s*' + cssClass, 'g');
	obj.className = obj.className.replace(regex, '');
}


/**
 *	Modernizr extra tests
 */

// Detect if XMLHttpRequest is available
Modernizr.addTest('xhr', function(){ return !(typeof XMLHttpRequest == "undefined"); });

// Detect basic media query support
Modernizr.addTest('mediaqueries', function()
{
	var ret = false, test = document.createElement('div'),
	styles = document.createElement('style'),
	styledef = document.createTextNode('#modernizr-mq-tester{top:-999em;position:absolute;display:none;} @media screen and (min-width:5px){#modernizr-mq-tester{display:block;}}'),
	head = document.getElementsByTagName('head')[0];

	test.id = 'modernizr-mq-tester';
	test.innerHTML = '&nbsp;';
	styles.id = 'modernizr-mq-styles';

	try{
		styles.appendChild(styledef);
		head.appendChild(styles);
		document.documentElement.appendChild(test);
		ret = getComputedStyle(test, null).getPropertyValue('display') == 'block';
		head.removeChild(styles);
		document.documentElement.removeChild(test);
	}catch(e){}

	return ret;
});

// Detect Google Maps support, kinda
Modernizr.addTest('googlemaps', function()
{
	var cw = document.documentElement.clientWidth,
	isIE7 = document.documentElement.className.indexOf('ie7') > -1,
	isIE8 = document.documentElement.className.indexOf('ie8') > -1,
	isIEMobile = document.documentElement.className.indexOf('ie7mobile') > -1;

	if(cw < 600 || !Modernizr.xhr || isIEMobile){ return false; }

	if(
		(cw < 780 && Modernizr.touch && Modernizr.mediaqueries)
		|| (cw >= 780 && (Modernizr.mediaqueries || isIE8 || isIE7))
	){ return true; }

	return false;
});


/**
 *	Simple park list tabs
 */
var SimpleTabs =
{
	init: function()
	{
		if(!$id('nearby-tab'))
		{
			return;
		}
		
		bind('click', $id('nearby-tab').childNodes[0], function(e)
		{
			SimpleTabs.hide();
			SimpleTabs.show('nearby');
			
			if(e.preventDefault){ e.preventDefault(); }
			e.returnValue = false;
		});
		
		bind('click', $id('popular-tab').childNodes[0], function(e)
		{
			SimpleTabs.hide();
			SimpleTabs.show('popular');
			
			if(e.preventDefault){ e.preventDefault(); }
			e.returnValue = false;
		});
		
		bind('click', $id('friendly-tab').childNodes[0], function(e)
		{
			SimpleTabs.hide();
			SimpleTabs.show('friendly');
			
			if(e.preventDefault){ e.preventDefault(); }
			e.returnValue = false;
		});
		
		bind('click', $id('clean-tab').childNodes[0], function(e)
		{
			SimpleTabs.hide();
			SimpleTabs.show('clean');
			
			if(e.preventDefault){ e.preventDefault(); }
			e.returnValue = false;
		});
	}
	
	,hide: function()
	{
		removeClass($id('nearby'), 'tabpanel-expanded');
		removeClass($id('popular'), 'tabpanel-expanded');
		removeClass($id('friendly'), 'tabpanel-expanded');
		removeClass($id('clean'), 'tabpanel-expanded');
		
		removeClass($id('nearby-tab'), 'tab-active');
		removeClass($id('popular-tab'), 'tab-active');
		removeClass($id('friendly-tab'), 'tab-active');
		removeClass($id('clean-tab'), 'tab-active');
	}
	
	,show: function(id)
	{
		addClass($id(id), 'tabpanel-expanded');
		addClass($id(id + '-tab'), 'tab-active');
	}
};


/**
 *	Simple geo location system
 */
var SimpleGeo =
{
	init: function()
	{
		if(!geo_position_js.init())
		{
			return;
		}
		
		SimpleGeo.getGeo();
	}
	
	,getGeo: function()
	{
		geo_position_js.getCurrentPosition(SimpleGeo.getGeoSuccess, SimpleGeo.getGeoError);
	}
	
	,getGeoSuccess: function(geo)
	{
		removeClass($id('currentloc'), 'no-geo');
		addClass($id('locform'), 'geo');
		
		$id('currentloc').href += '?lat=' + geo.coords.latitude + '&lng=' + geo.coords.longitude;
		
		if(!$id('static-map-img'))
		{
			removeClass($id('map-wrapper'), 'no-map');
			var script = document.createElement('script');
			script.async = true;
			script.src = '/nearby?r=jsonp&lat=' + geo.coords.latitude + '&lng=' + geo.coords.longitude;
			document.getElementsByTagName('body')[0].appendChild(script);
		}
	}
	
	,getGeoError: function()
	{
		return;
	}
	
	,response: function(obj)
	{
		if($id('map') && $id('nearby'))
		{
			$id('map').innerHTML = obj.image;
			$id('nearby').innerHTML = obj.nearby;
			SimpleTabs.hide();
			removeClass($id('tablist-wrapper'), 'no-nearby');
			SimpleTabs.show('nearby');
		}
	}
};


/**
 *	Triggers desktop enhanced version
 */
var Enhancer =
{
	isEnhanced: false
	
	,enhance: function()
	{
		if(!Modernizr.googlemaps)
		{
			return;
		}
		
		Enhancer.isEnhanced = true;
		
		var style = document.createElement('link');
		style.rel = 'stylesheet';
		style.href = (env == 'dev') ? '/theme/css/enhanced.css' : '/theme/css/enhanced.min.css';
		style.media = 'screen,projection,tv';
		document.getElementsByTagName('head')[0].appendChild(style);
		
		var style = document.createElement('link');
		style.rel = 'stylesheet';
		style.href = (env == 'dev') ? '/theme/css/enhanced-wide.css' : '/theme/css/enhanced-wide.min.css';
		style.media = (Modernizr.mediaqueries) ? 'screen and (min-width:1000px)' : 'screen,projection,tv';
		document.getElementsByTagName('head')[0].appendChild(style);
		
		removeClass($id('map-wrapper'), 'no-map');
		removeClass($id('map-wrapper'), 'map-static');
		removeClass($id('tablist-wrapper'), 'no-clean');
		removeClass($id('parks'), 'no-rating');
		addClass($id('nearby-loader'), 'no-nearby-loader');
		
		Enhancer.loadScriptAsync('http://maps.google.com/maps/api/js?sensor=false&region=CA&callback=gmapSuccess');
	}
	
	,loadScript: function(src)
	{
		document.write('<' + 'script src="' + src + '"' + '><' + '/script>');
	}
	
	,loadScriptAsync: function(src)
	{
		var script = document.createElement('script');
		script.src = src;
		script.async = true;
		document.getElementsByTagName('head')[0].appendChild(script);
	}
};

/**
 *	Callback for when Google Maps finished loading
 */
function gmapSuccess()
{
	Enhancer.loadScriptAsync('/app-enhanced.min.js');
}

Enhancer.enhance();

bind('load', window, function()
{
	SimpleTabs.init();
	
	if(!Enhancer.isEnhanced)
	{
		setTimeout(function(){ SimpleGeo.init(); }, 250);
	}
});
