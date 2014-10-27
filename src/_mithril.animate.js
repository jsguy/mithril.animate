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
	vp = function (prop) {
		var pf;
		//	Handle unprefixed
		if (prop in div.style) {
			return prop;
		}

		//	Handle keyframes
		if(prop == "@keyframes") {
			for (var i = 0; i < prefixes.length; i += 1) {
				pf = prefixes[i] + "Transition";
				if (pf in div.style) {
					return "@-" + prefixes[i].toLowerCase() + "-keyframes";
				}
			}
			return prop;
		}

		for (var i = 0; i < prefixes.length; i += 1) {
			pf = prefixes[i] + cap(prop);
			if (pf in div.style) {
				return pf;
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
			obj.style[vp(i)] = props[i];
		}}
	},

	//	Set props for transitions and transforms with basic defaults
	defaultProps = function(args){
		// var props = {
		// 		//	ease, linear, ease-in, ease-out, ease-in-out, cubic-bezier(n,n,n,n) initial, inherit
		// 		TransitionTimingFunction: "ease",
		// 		TransitionDuration: defaultDuration + "ms",
		// 		TransitionProperty: "all"
		// 	},
		var props = {},
			p, i, tmp, tmp2, found;

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
					props[vp("transform")] = props[vp("transform")] || "";
					props[vp("transform")] += " " +p + "(" + args[p] + ")";
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
		var props = defaultProps(args), time;

		if(!canTrans || cb) {
			time = getTimeinMS(props.TransitionDuration) || 0;
		}

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

	//	Animate using faked "keyframes"
	m.animateKeyframe = function(prop, self, keyFrames, duration, animateOnload, cb) {
		duration = (typeof duration == 'undefined')? defaultDuration: duration;
		animateOnload = animateOnload || false;
		var oldConfig = self.config;

		//	Use the prop to trigger the animation
		if(prop() || animateOnload) {
			//	Maybe get a refernce to the el and use it?
			self.config = function(el, isInit){
				var elapsedTime = 0, idx, first;

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
	};

















	//	Just run the keyframes
	//	TODO: Remove ALL previous properties for each frame
	//		- it is inconsistent for chrome/FF
	m.doAnimateKeyframe = function(el, keyFrames, duration, cb) {
		duration = (typeof duration == 'undefined')? defaultDuration: duration;
		var elapsedTime = 0, idx;

		//	Run old config method, if one were supplied
		//	Run cb config method, if one were supplied
		if(cb) {
			setTimeout(function(){
				cb();
			}, duration + 1);
		}

		//	Need to animate to first step immediately?
		//m.animate(el, first);

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













	//	Fix animatiuon properties
	//	Normalises transforms, eg: rotate, scale, etc...
	var defAniProps = function(args){
		var props = {},
			tmpProp,
			p, i, found,
			normal = function(props, p, value){
				var tmp = p.toLowerCase(),
					found = false, i;

				//	Look at transform props
				for(i = 0; i < transformProps.length; i += 1) {
					if(tmp == transformProps[i]) {
						props[vp("transform")] = props[vp("transform")] || "";
						props[vp("transform")] += " " +p + "(" + value + ")";
						found = true;
						break;
					}
				}

				if(!found) {
					props[p] = value;
				} else {
					//	Remove transform property
					delete props[p];
				}
			};

		//	Set any allowed properties 
		for(p in args) { if(args.hasOwnProperty(p)) {
			//	If we have a percentage, we have a key frame
			if(p.indexOf("%") !== -1) {
				for(i in args[p]) { if(args[p].hasOwnProperty(i)) {
					normal(args[p], i, args[p][i]);
				}}
				props[p] = args[p];
			} else {
				normal(props, p, args[p]);
			}
		}}

		console.log(props);
		return props;
	};

	//	Creates a hashed name for the animation
	var aniName = function(props){
		return "a" + JSON.stringify(props).split(/[{},%":]/).join("");
	};

	//	IE10+ http://caniuse.com/#search=css-animations
	m.anik = function(el, props, duration, cb) {
		var aniId = aniName(props),
			kf,
			hasAni = document.getElementById(aniId);

		//	Only inset once
		if(!hasAni) {
			defAniProps(props);

			//  Dodgy as - can generate seperately in proper thingy...
			kf = vp("@keyframes") + " " + aniId + " " + JSON.stringify(props)
				.split("\"").join("")
				.split("},").join("}\n")
				.split(",").join(";")
				.split("%:").join("% ");

			var s = document.createElement('style');
			s.setAttribute('id', aniId);
			s.id = aniId;
			s.textContent = kf;
			//  Might not have head?
			document.head.appendChild(s);
		}

		el.style = el.style || {};
		el.style[vp("animationName")] = "";
		el.style[vp("animationDuration")] = "";

		//	Must use two request animation frame calls, for FF to work properly.
		requestAnimationFrame(function(){
			requestAnimationFrame(function(){
				el.style[vp("animationName")] = aniId;
				el.style[vp("animationDuration")] = duration + 'ms';
			});
		});
		// el.style.animationDirection = 'alternate';
		// el.style.webkitAnimationDirection = 'alternate';
		// el.style.animationIterationCount = 'infinite';
		// el.style.webkitAnimationIterationCount = 'infinite';
	};


	//	Create an animation for later use
	var animations = {};
	m.addAnimation = function(name, props, duration){
		var aniId = aniName(props), kf,
			hasAni = document.getElementById(aniId);

		//	Only inset once
		if(!hasAni) {
			defAniProps(props);
			//  Create keyframes
			kf = vp("@keyframes") + " " + aniId + " " + JSON.stringify(props)
				.split("\"").join("")
				.split("},").join("}\n")
				.split(",").join(";")
				.split("%:").join("% ");

			var s = document.createElement('style');
			s.setAttribute('id', aniId);
			s.id = aniId;
			s.textContent = kf;
			//  Might not have head?
			document.head.appendChild(s);
		}
		animations[name] = { name: aniId, duration: duration };

		//	Add bindings for it
		m.addBinding(name, function(prop){
			console.log('bind', name, this);
			m.bindAnimation(name, this, duration, prop);
		}, true);


	};



	m.doAnimate = function(name, el, duration, cb){
		duration = duration || animations[name].duration || 500;
		aniName = animations[name].name;
		if(!aniName) {
			throw "Animation " + name + " not found.";
		}

		el.style = el.style || {};
		el.style[vp("animationName")] = "";
		el.style[vp("animationDuration")] = "";

		//	Must use two request animation frame calls, for FF to work properly.
		requestAnimationFrame(function(){
			requestAnimationFrame(function(){
				el.style[vp("animationName")] = aniName;
				el.style[vp("animationDuration")] = duration + 'ms';
			});
		});
		// el.style.animationDirection = 'alternate';
		// el.style.animationIterationCount = 'infinite';

		//TODO: cb
	};

	m.triggerAnimation = function(name, duration, cb){
		return function(){
			m.doAnimate(name, this, duration, cb);
		}
	};


	m.bindAnimation = function(name, el, duration, prop) {
		var oldConfig = el.config;
		if(prop()) {
			el.config = function(el, isInit){
				//	Only when it has already been initialised
				//	TODO: Same probelm as before - animation always fires...
				if(!isInit) {
					m.doAnimate(name, el, duration);
				}
				if(oldConfig) {
					console.log('oldConfig', oldConfig);
				}
			};
		}
	};



}(window.m || {}));