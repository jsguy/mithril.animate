/*
	mithril.animate - Copyright 2014 jsguy
	MIT Licensed.
*/
(function (m) {
	//	Known prefiex
	var prefixes = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'],
	transitionProps = ['TransitionProperty', 'TransitionTimingFunction', 'TransitionDelay', 'TransitionDuration', 'TransitionEnd'],
	transformProps = ['rotate', 'rotatex', 'rotatey', 'scale', 'skew', 'translate', 'translatex', 'translatey', 'matrix'],

	defaultDuration = 400,
	
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
				TransitionDuration: defaultDuration + "ms",
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

	//	Animate using keyframes
	m.animateKeyframe = function(prop, self, keyFrames, duration, animateOnload, cb) {
		duration = (typeof duration == 'undefined')? defaultDuration: duration;
		animateOnload = animateOnload || false;
		var oldConfig = self.config;


		prop.subscribe(function(value){
			console.log('prop value', value);
		});



		//	Try to use the prop to trigger the animation?
		//	Next step if this doesn't work - use prop.subscribe
		if(prop()) {
			//	Maybe get a refernce to the el and use it?
			self.config = function(el, isInit){
				var elapsedTime = 0, idx, first;
				console.log('config', el);




				//	On first load only - ie: when something changed.
				if(!isInit) {
					//	Run old config method, if one were supplied
					if(oldConfig) {
						setTimeout(function(){
							oldConfig.apply(self, arguments);
						}, duration);
					}

					//	Run cb config method, if one were supplied
					if(cb) {
						setTimeout(function(){
							cb();
						}, duration + 1);
					}

					for(idx in keyFrames) {
						first = keyFrames[idx];
						break;
					}

					//	Need to animate to first step immediately on first load
					m.animate(el, first);

					//	Get our item
					for(idx in keyFrames) {
						var time = duration * (idx.replace('%', '') / 100) - elapsedTime,
							val = keyFrames[idx];

						val.duration = time + "ms";
						setTimeout(function(el, val){
							return function(){
								m.animate(el, val);
							}
						}(el, val), elapsedTime);
						elapsedTime += time;
					}
				}





			};
		}


		return;




		//	We MUST have access to the element - the vDOM reference does not help,
		//	as it loses scope and is orphaned when a repaint occurs, so using 
		//	setTimeout on a vDOM element does not work.
		//	Note: there does not seem to be any other way to get a 
		//	reference, so config will have to do.
		self.config = function(el, isInit){
			var elapsedTime = 0, idx, first;






			//	TODO: Problem - this is run whenever anything changes, 
			//	including other parts of the page, and other mithril "apps".






			//	On first load
			if(!isInit) {
				//	Run old config method, if one were supplied
				if(oldConfig) {
					setTimeout(function(){
						oldConfig.apply(self, arguments);
					}, duration);
				}

				//	Run cb config method, if one were supplied
				if(cb) {
					setTimeout(function(){
						cb();
					}, duration + 1);
				}
				//	Check if we should animate onload
				if(!animateOnload) {
					return;
				}

				for(idx in keyFrames) {
					first = keyFrames[idx];
					break;
				}

				//	Need to animate to first step immediately on first load
				m.animate(el, first);
			}

			//	Get our item
			for(idx in keyFrames) {
				var time = duration * (idx.replace('%', '') / 100) - elapsedTime,
					val = keyFrames[idx];

				val.duration = time + "ms";
				setTimeout(function(el, val){
					return function(){
						m.animate(el, val);
					}
				}(el, val), elapsedTime);
				elapsedTime += time;
			}
		};
	};

}(window.m || {}));