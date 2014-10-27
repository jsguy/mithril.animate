//	Custom animations
m.addAnimation("rotateCWOpacity", function(prop){
	var value = prop()? 0: 1;
	return {
		opacity: value,
		rotate: (value * -180) + "deg"
	};
});

m.addAnimation("rotateCCWOpacityIn", function(prop){
	var value = prop()? 1: 0;
	return {
		opacity: value,
		rotate: (value * 180) + "deg"
	};
});

//	Basic animation examples
var allExample = {
	model: function() {
		this.opacity = m.p();
		this.scale = m.p();
		this.rotate = m.p();
		this.skew = m.p([0,0]);
		this.translateX = m.p();
		this.opacityScale = m.p();
		this.opacityUp = m.p({
			up: m.p(0),
			opacity: m.p(1)
		});
		this.spinMenu = m.p();
	},
	controller: function() {
		var self = this;
		self.model = new allExample.model();

		//	Shortcut to set a value in view
		//	TODO: Would be nice to include somewhere as default behaviour
		self.set = function(prop, value){
			return function(){
				prop(value);
			};
		};

		//	Shortcut to set hover opacity up
		self.opacityUpHover = [
			function(){
				self.model.opacityUp().up("-6em");
				self.model.opacityUp().opacity("0");
			},
			function(){
				self.model.opacityUp().up("0");
				self.model.opacityUp().opacity("1");
			}
		];
	},
	view: function(c) {
		var o = c.model;
		return [
			m.e("h2", "Single animation"),
			
			m.e("div.exampleBox", { hover: [c.set(o.opacity, 0), c.set(o.opacity, 1)] }, [
				m.e("h3", "Opacity"),
				m.e("div.eBox", { opacity: o.opacity })
			]),
			m.e("div.exampleBox", { hover: [c.set(o.scale, 0), c.set(o.scale, 1)] }, [
				m.e("h3", "Scale"),
				m.e("div.eBox", { scale: o.scale })
			]),
			m.e("div.exampleBox", { hover: [c.set(o.rotate, 225), c.set(o.rotate, 0)] }, [
				m.e("h3", "Rotate"),
				m.e("div.eBox", { rotate: o.rotate })
			]),
			m.e("div.exampleBox", { hover: [c.set(o.skew, [25, -50]), c.set(o.skew, [0,0])] }, [
				m.e("h3", "Skew"),
				m.e("div.eBox", { skew: o.skew })
			]),
			m.e("div.exampleBox", { hover: [c.set(o.translateX, "6em"), c.set(o.translateX, 0)] }, [
				m.e("h3", "translateX"),
				m.e("div.eBox", { translatex: o.translateX})
			]),

			m.e("h2", "Multiple animation"),

			m.e("div.exampleBox", { hover: [c.set(o.opacityScale, 0), c.set(o.opacityScale, 1)] }, [
				m.e("h3", "Opacity scale"),
				m.e("div.eBox", { opacity: o.opacityScale, scale: o.opacityScale})
			]),
			m.e("div.exampleBox", { hover: c.opacityUpHover }, [
				m.e("h3", "Opacity up"),
				m.e("div.eBox", { translatey: o.opacityUp().up, opacity: o.opacityUp().opacity })
			]),
			
			m.e("h2", "Custom animation"),

			m.e("div.exampleBox", { hover: [c.set(o.spinMenu, 1), c.set(o.spinMenu, 0)] }, [
				m.e("h3", "Material menu"),
				m.e("a", { target: "_blank", href: "http://www.google.com/design/spec/animation/delightful-details.html" }, "Based on this"),
				m.e("div.boxSurround", [
					m.e("div.eBox.icon", { rotateCWOpacity: o.spinMenu }),
					m.e("div.eBox.alt1.icon", { rotateCCWOpacityIn: o.spinMenu }),
				])
			])
		];
	}
};	