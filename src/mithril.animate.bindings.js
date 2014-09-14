/* Default transform2d bindings */
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