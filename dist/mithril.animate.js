//	Mithril bindings.
//	Copyright (C) 2014 jsguy (Mikkel Bergmann)
//	MIT licensed
(function(context){
	context.m = context.m || {};

	//	Pub/Sub based extended properties
	context.m.p = function(value) {
		var self = this,
			subs = [],
			prevValue,
			delay = false,
			//  Send notifications to subscribers
			notify = function (value, prevValue) {
				var i;
				for (i = 0; i < subs.length; i += 1) {
					subs[i].func.apply(subs[i].context, [value, prevValue]);
				}
			},
			prop = function() {
				if (arguments.length) {
					value = arguments[0];
					if (prevValue !== value) {
						var tmpPrev = prevValue;
						prevValue = value;
						notify(value, tmpPrev);
					}
				}
				return value;
			};

		//	Allow push on arrays
		prop.push = function(val) {
			if(value.push && typeof value.length !== "undefined") {
				value.push(val);
			}
			prop(value);
		}

		//	Subscribe for when the value changes
		prop.subscribe = function (func, context) {
			subs.push({ func: func, context: context || self });
			return prop;
		};

		//	Allow property to not automatically render
		prop.delay = function(value) {
			delay = !!value;
			return prop;
		};

		//	Automatically update rendering when a value changes
		//	As mithril waits for a request animation frame, this should be ok.
		//	You can use .delay(true) to be able to manually handle updates
		prop.subscribe(function(val){
			if(!delay) {
				m.startComputation();
				m.endComputation();
			}
			return prop;
		});

		return prop;
	};

	//	Element function that applies our extended bindings
	//	Note: certain attributes can be removed when applied
	context.m.e = function(element, attrs, children) {
		for (var name in attrs) {
			if (m.bindings[name]) {
				m.bindings[name].func.apply(attrs, [attrs[name]]);
				if(m.bindings[name].removeable) {
					delete attrs[name];
				}
			}
		}
		return m(element, attrs, children);
	};

	//	Add bindings method
	//	Non-standard attributes do not need to be rendered, eg: valueInput
	//	so they are set as removable
	context.m.addBinding = function(name, func, removeable){
		context.m.bindings = context.m.bindings || {};
		context.m.bindings[name] = { func: func, removeable: removeable };
	};

	//	Get the underlying value of a property
	context.m.unwrap = function(prop) {
		return (typeof prop == "function")? prop(): prop;
	};

	//	Bi-directional binding of value
	context.m.addBinding("value", function(prop) {
		if (typeof prop == "function") {
			this.value = prop();
			this.onchange = m.withAttr("value", prop);
		} else {
			this.value = prop;
		}
	});

	//	Bi-directional binding of checked property
	context.m.addBinding("checked", function(prop) {
		if (typeof prop == "function") {
			this.checked = prop();
			this.onchange = m.withAttr("checked", prop);
		} else {
			this.checked = prop;
		}
	});

	//	Add value bindings for various event types 
	var events = ["Input", "Keyup", "Keypress"];
	for(var i = 0; i < events.length; i += 1) {
		var eve = events[i];
		(function(name, eve){
			//	Bi-directional binding of value
			context.m.addBinding(name, function(prop) {
				if (typeof prop == "function") {
					this.value = prop();
					this[eve] = m.withAttr("value", prop);
				} else {
					this.value = prop;
				}
			}, true);
		}("value" + eve, "on" + eve.toLowerCase()));
	}

	//	Hide node
	context.m.addBinding("hide", function(prop){
		this.style = {
			display: context.m.unwrap(prop)? "none" : ""
		};
	}, true);


	//	Toggle boolean value on click
	context.m.addBinding('toggle', function(prop){
		this.onclick = function(){
			var value = prop();
			prop(!value);
		}
	}, true);

}(window));;/*
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
	m.animateVDOM = function (self, args, cb) {
		var oldConfig = self.config;

		//	Use config so we can access the element - we need to be able to
		//	remove transition/transform attributes after the animation is done,
		//	and this seems the only way. Note: the animation will work on a
		//	vDOM element, but we cannot remove the old attributes
		self.config = function(el){
			m.animate(el, args, cb);
			//	Run old config method, if one were supplied
			if(oldConfig) {
				oldConfig.apply(self, arguments);
			}
		}
	};

	//	Animate an element
	m.animate = function(el, args, cb){
		el.style = el.style || {};
		var props = defaultProps(args),
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

}(window.m || {}));;/* Default transform2d bindings */
var basicBindings = ['opacity', 'scale', 'scalex', 'scaley', 'translate', 'translatex', 'translatey', 'matrix'], i;

for(i = 0; i < basicBindings.length; i += 1) {
	(function(name){
		m.addBinding(name, function(prop){
			var options = {};
			options[name] = prop();
			m.animateVDOM(this, options);
		}, true);
	}(basicBindings[i]));
}
m.addBinding("rotate", function(prop){
	m.animateVDOM(this, { rotate: prop() + "deg" });
}, true);
m.addBinding("skew", function(prop){
	m.animateVDOM(this, { skew: [prop().x+ "deg", prop().y + "deg"] });
}, true);
m.addBinding("skewx", function(prop){
	m.animateVDOM(this, { skewx: prop()+ "deg" });
}, true);
m.addBinding("skewy", function(prop){
	m.animateVDOM(this, { skewy: prop()+ "deg" });
}, true);
m.addBinding("skew", function(prop){
	m.animateVDOM(this, { skew: [prop().x+ "deg", prop().y + "deg"] });
}, true);