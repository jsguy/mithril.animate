/*
	mithril.animate - Copyright 2014 jsguy
	MIT Licensed.
*/
(function (m) {
	//	Known prefiex
	var prefixes = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'],
	transitionProps = ['TransitionProperty', 'TransitionTiming', 'TransitionDelay', 'TransitionDuration', 'TransitionEnd'],
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
				TransitionTiming: "ease",
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

	//	vDOM animation method - sets the properties on the object that represents the element
	//	Note: due to how mithril handles redraws for "on" events, this code will run 
	//	each time any "on" event is fired. The good news is that the DOM won't be rerendered
	//	as it uses the "diff" strategy, but the reality is, we don't really want this to run,
	//	it would be nice to be able to avoid it.
	m.animateVDOM = function (self, args) {
		var oldConfig = self.config;

		//	Use config so we can access the element - we need to be able to
		//	remove transition/transform attributes after the animation is done,
		//	and this seems the only way. Note: the animation will work on a
		//	vDOM element, but we cannot remove the old attributes
		self.config = function(element, isInitialised, ctx){
			m.animateElement(element, args);
			//	Run old config method, if one were supplied
			if(oldConfig) {
				oldConfig.apply(self, arguments);
			}
		}
	};

	//	Animate an element, correctly restoring properties we might change
	m.animate = function(el, args){
		el.style = el.style || {};
		var props = defaultProps(args), oldProps = {},
			time = getTimeinMS(props.TransitionDuration) || 0;

		//	Save old properties
		transitionProps.map(function(prop, idx){
			var theProp = el.style[prop];
			if(theProp) {
				oldProps[prop] = theProp;
			}
		});
		if(el.style['transform']) {
			oldProps['transform'] = el.style['transform'];
		}

		clearTimeout(el.propTimer);

		//	To restore old props
		el.propTimer = setTimeout(function(){
			//	Remove our used properties
			transitionProps.map(function(prop){
				var propObj = {};
				propObj[prop] = "";
				setStyleProps(el, propObj);
			});

			//	Add back old properties
			if(!isEmpty(oldProps)) {
				setStyleProps(el, oldProps);
			}
		}, time);

		//	See if we support transitions
		if(canTrans) {
			setStyleProps(el, props);
		} else {
			//	Try and fall back to jQuery
			if(typeof $ !== 'undefined' && $.fn && $.fn.animate) {
				$(el).animate(props, getTimeinMS(props.TransitionDuration));
			}
		}
	};

}(window.m || {}));