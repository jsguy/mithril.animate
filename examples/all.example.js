//	A few basic animation binders
var ani = {
	fade: function(prop){
		return function(el){
			m.animate(el, {
				opacity: prop()? 0: 1 
			});
		};
	},
	scale: function(prop, duration){
		return function(el){
			m.animate(el, {
				scale: prop()? 0: 1,
				duration: duration
			});
		};
	},
	rotate: function(prop, degrees){
		return function(el){
			m.animate(el, {
				rotate: (prop() * degrees) + "deg"
			});
		};
	},
	skew: function(prop){
		return function(el){
			m.animate(el, {
				skew: [(prop() * 30) + "deg", (prop() * 30) + "deg"]
			});
		};
	},
	translateX: function(prop){
		return function(el){
			var value = prop()? 1: 0;
			m.animate(el, {
				translateX: (value? "6em": "0")
			});
		};
	},
	fadeScale: function(prop){
		return function(el){
			m.animate(el, {
				opacity: prop()? 0: 1,
				scale: prop()? 0: 1 
			});
		};
	},
	fadeUp: function(prop){
		return function(el){
			var value = prop()? 0: 1;
			m.animate(el, {
				opacity: value,
				translateY: (value? "0": "-6em")
			});
		};
	},
	rotateCWFade: function(prop){
		return function(el){
			var value = prop()? 0: 1;
			m.animate(el, {
				opacity: value,
				rotate: (value * -180) + "deg"
			});
		};
	},
	rotateCCWFadeIn: function(prop){
		return function(el){
			var value = prop()? 1: 0;
			m.animate(el, {
				opacity: value,
				rotate: (value * 180) + "deg"
			});
		};
	}
};

//	Basic animation examples
var allExample = {
	model: function() {
		this.fade = m.prop();
		this.scale = m.prop();
		this.rotate = m.prop();
		this.skew = m.prop();
		this.translateX = m.prop();
		this.fadeScale = m.prop();
		this.fadeUp = m.prop();
		this.spinMenu = m.prop();
	},
	controller: function() {
		var self = this;
		self.model = new allExample.model();

		//	Shortcut to set a value
		self.set = function(prop, value){
			return function(){
				prop(value);
			};
		};

		//	Shortcut for binding hover states
		//	TODO: Add as a default binding in mithril.bindings! :)
		self.hoverBind = function(prop){
			return {
				onmouseover: self.set(prop, true), 
				onmouseout: self.set(prop, false)
			};
		};
	},
	view: function(c) {
		var o = c.model;
		return [
			m("h2", "Single animation"),
			m("div.exampleBox", c.hoverBind(o.fade), [
				m("h3", "Fade"),
				m("div.eBox", { config: ani.fade(o.fade)})
			]),
			m("div.exampleBox", c.hoverBind(o.scale), [
				m("h3", "Scale"),
				m("div.eBox", { config: ani.scale(o.scale, "1s")})
			]),
			m("div.exampleBox", c.hoverBind(o.rotate), [
				m("h3", "Rotate"),
				m("div.eBox", { config: ani.rotate(o.rotate, 225)})
			]),
			m("div.exampleBox", c.hoverBind(o.skew), [
				m("h3", "Skew"),
				m("div.eBox", { config: ani.skew(o.skew)})
			]),
			m("div.exampleBox", c.hoverBind(o.translateX), [
				m("h3", "translateX"),
				m("div.eBox", { config: ani.translateX(o.translateX)})
			]),
			m("h2", "Multiple animation"),
			m("div.exampleBox", c.hoverBind(o.fadeScale), [
				m("h3", "Fade and scale"),
				m("div.eBox", { config: ani.fadeScale(o.fadeScale)})
			]),
			m("div.exampleBox", c.hoverBind(o.fadeUp), [
				m("h3", "Fade up"),
				m("div.eBox", { config: ani.fadeUp(o.fadeUp)})
			]),
			m("h2", "Useful animation"),
			m("div.exampleBox", c.hoverBind(o.spinMenu), [
				m("h3", "Material menu"),
				m("a", { target: "_blank", href: "http://www.google.com/design/spec/animation/delightful-details.html" }, "Based on this"),
				m("div.bosSurround", [
					m("div.eBox.icon", {config: ani.rotateCWFade(o.spinMenu)}),
					m("div.eBox.alt1.icon", { config: ani.rotateCCWFadeIn(o.spinMenu)}),
				])
			])
		];
	}
};	