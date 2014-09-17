/*
	mithril.animate - Copyright 2014 jsguy
	MIT Licensed.
*/
(function (m) {
	//	Known prefiex
	var prefixes = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'],
	transitionProps = ['TransitionProperty', 'TransitionTimingFunction', 'TransitionDelay', 'TransitionDuration', 'TransitionEnd'],
	transformProps = ['rotate', 'scale', 'skew', 'translate', 'translatex', 'translatey', 'matrix'],
	
	//	Capitalise		
	cap = function(str){
		return str.charAt(0).toUpperCase() + str.substr(1);
	},

	//	For checking what vendor prefixes are native
	div = document.createElement('div'),

	//	vendor prefix, ie: transitionDuration becomes MozTransitionDuration
	vendorProp = function (prop) {
		var vp;
		//	Handle unprefixed (eg: FF16+)
		if (prop in div.style) {
			return prop;
		}

		for (var i = 0; i < prefixes.length; i += 1) {
			vp = prefixes[i] + cap(prop);
			if (vp in div.style) {
				return vp;
			}
		}
		//	Can't find it - return original property.
		return prop;
	},

	//	See if we can use native transitions
	supportsTransitions = function() {
		var b = document.body || document.documentElement,
			s = b.style,
			p = 'transition';

		if (typeof s[p] == 'string') { return true; }

		// Tests for vendor specific prop
		p = p.charAt(0).toUpperCase() + p.substr(1);

		for (var i=0; i<prefixes.length; i++) {
			if (typeof s[prefixes[i] + p] == 'string') { return true; }
		}

		return false;
	},

	//	Converts CSS transition times to MS
	getTimeinMS = function(str) {
		var result = 0, tmp;
		str += "";
		str = str.toLowerCase();
		if(str.indexOf("ms") !== -1) {
			tmp = str.split("ms");
			result = Number(tmp[0]);
		} else if(str.indexOf("s") !== -1) {
			//	s
			tmp = str.split("s");
			result = Number(tmp[0]) * 1000;
		} else {
			result = Number(str);
		}

		return Math.round(result);
	},

	//	Set style properties
	setStyleProps = function(obj, props){
		for(var i in props) {if(props.hasOwnProperty(i)) {
			obj.style[vendorProp(i)] = props[i];
		}}
	},

	//	Set props for transitions and transforms with basic defaults
	defaultProps = function(args){
		var props = {
				//	ease, linear, ease-in, ease-out, ease-in-out, cubic-bezier(n,n,n,n) initial, inherit
				TransitionTimingFunction: "ease",
				TransitionDuration: "0.5s",
				TransitionProperty: "all"
			}, p, i, tmp, tmp2, found;

		//	Set any allowed properties 
		for(p in args) { if(args.hasOwnProperty(p)) {
			tmp = 'Transition' + cap(p);
			tmp2 = p.toLowerCase();
			found = false;

			//	Look at transition props
			for(i = 0; i < transitionProps.length; i += 1) {
				if(tmp == transitionProps[i]) {
					props[transitionProps[i]] = args[p];
					found = true;
					break;
				}
			}

			//	Look at transform props
			for(i = 0; i < transformProps.length; i += 1) {
				if(tmp2 == transformProps[i]) {
					props[vendorProp("transform")] = props[vendorProp("transform")] || "";
					props[vendorProp("transform")] += " " +p + "(" + args[p] + ")";
					found = true;
					break;
				}
			}

			if(!found) {
				props[p] = args[p];
			}
		}}
		return props;
	},

	//	If an object is empty
	isEmpty = function(obj) {
		for(var i in obj) {if(obj.hasOwnProperty(i)) {
			return false;
		}}
		return true; 
	},

	//	See if we can use transitions
	canTrans = supportsTransitions();

	//	Animate an element
	m.animate = function(el, args, cb){
		el.style = el.style || {};
		var props = defaultProps(args),
			//	TODO: Need to add delay!?
			time = getTimeinMS(props.TransitionDuration) || 0;

		//	See if we support transitions
		if(canTrans) {
			setStyleProps(el, props);
		} else {
			//	Try and fall back to jQuery
			if(typeof $ !== 'undefined' && $.fn && $.fn.animate) {
				$(el).animate(props, time);
			}
		}

		if(cb){
			setTimeout(cb, time+1);
		}
	};

/*

var myFrame = {
	'0%': 	{ left: 0, top: 0 },
	'25%': 	{ left: 100, top: 100, opacity: 0, rotate: "30deg" },
	'50%': 	{ left: 0, top: 300, opacity: 1, rotate: "0" },
	'100%': { left: 0, top: 0 }
};

var keyframes = {
	set: function($el, frames, duration) {
		var animate = function() {
			var elapsedTime = 0;
			
			$.each(frames, function(idx, val) {
				var time = duration * (idx.replace('%', '') / 100) - elapsedTime;
				console.log(val, time);
				
				$el.animate(val, time);

				return elapsedTime += time;
			});

			return setTimeout(animate, duration);
		};
		return animate();
	}
};

$(document).ready(function(){
	keyframes.set($('#mydiv'), myFrame, 2000); 
});


 */






	//	vDOM animation method - sets the properties on the object that represents the element
	//	Note: due to how mithril handles redraws for "on" events, this code will run 
	//	each time any "on" event is fired. The good news is that the DOM won't be rerendered
	//	as it uses the "diff" strategy, but the reality is, we don't really want this to run,
	//	it would be nice to be able to avoid it.
	m.animateVDOM = function (self, args, cb) {
		var oldConfig = self.config;

		//	Use config so we can access the element - we need to be able to
		//	remove transition/transform attributes after the animation is done,
		//	and this seems the only way. Note: the animation will work on a
		//	vDOM element, but we cannot remove the old attributes
		self.config = function(el){
			console.log(el);
			m.animate(el, args, cb);
			//	Run old config method, if one were supplied
			if(oldConfig) {
				oldConfig.apply(self, arguments);
			}
		}
	};



	m.animateKeyframe = function(self, keyFrames, duration, cb) {

		var oldConfig = self.config;

		// self.config = function(el, isInit, context){
			
		// 	context.count = context.count || 0;
		// 	var count = 0, idx, val, first;
		// 	//	Get our item
		// 	for(idx in keyFrames) {
		// 		first = first? first: keyFrames[idx];
		// 		if(count == context.count) {
		// 			console.log(idx);
		// 			val = keyFrames[idx];
		// 			break;
		// 		}
		// 		count += 1;
		// 	}

		// 	//	Back to the start
		// 	if(!val) {
		// 		val = first;
		// 	}


		// 	var elapsedTime = 0,
		// 		time = duration * (idx.replace('%', '') / 100) - elapsedTime;
		// 		//val = keyFrames[idx];

		// 	val.duration = time + "ms";
			
		// 	// setTimeout(function(el, val){
		// 	// 	return function(){
		// 	// 		console.log('animate', el, val);
		// 	// 		m.animate(el, val);
		// 	// 	}
		// 	// }(el, val), time);
		// 	console.log('animate', el, val);
		// 	m.animate(el, val);

		// 	elapsedTime += time;
		// 	context.count += 1;
		// };

		self.config = function(el, isInit, context){
			
			context.count = context.count || 0;
			var elapsedTime = 0;

			//	Get our item
			for(idx in keyFrames) {
				var delayTime = duration * (idx.replace('%', '') / 100),
					time = delayTime - elapsedTime,
					val = keyFrames[idx];
				val.duration = time + "ms";
				console.log(idx, delayTime, time, elapsedTime);
				setTimeout(function(el, val){
					return function(){
						//console.log('animate', el, val);
						m.animate(el, val);
					}
				}(el, val), delayTime);
				elapsedTime += time;
			}

			if(!isInit) {
				console.log('set timeout for old cfg', duration);
			}
		};

		//return animate();
	};








}(window.m || {}));