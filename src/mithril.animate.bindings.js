/* Default transform2d bindings */
(function (m) {
	var basicBindings = ['scale', 'scalex', 'scaley', 'translate', 'translatex', 'translatey', 'matrix', 'backgroundColor', 'backgroundPosition', 'borderBottomColor', 'borderBottomWidth', 'borderLeftColor', 'borderLeftWidth', 'borderRightColor', 'borderRightWidth', 'borderSpacing', 'borderTopColor', 'borderTopWidth', 'bottom', 'clip', 'color', 'fontSize', 'fontWeight', 'height', 'left', 'letterSpacing', 'lineHeight', 'marginBottom', 'marginLeft', 'marginRight', 'marginTop', 'maxHeight', 'maxWidth', 'minHeight', 'minWidth', 'opacity', 'outlineColor', 'outlineWidth', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingTop', 'right', 'textIndent', 'textShadow', 'top', 'verticalAlign', 'visibility', 'width', 'wordSpacing', 'zIndex'], i;

	for(i = 0; i < basicBindings.length; i += 1) {
		(function(name){
			m.addBinding(name, function(prop){
				var options = {};
				options[name] = prop();
				m.animate(this, options);
			}, true);
		}(basicBindings[i]));
	}
	m.addBinding("rotate", function(prop){
		m.animate(this, { rotate: prop() + "deg" });
	}, true);
	m.addBinding("skew", function(prop){
		m.animate(this, { skew: [prop()[0]+ "deg", prop()[1] + "deg"] });
	}, true);
	m.addBinding("skewx", function(prop){
		m.animate(this, { skewx: prop()+ "deg" });
	}, true);
	m.addBinding("skewy", function(prop){
		m.animate(this, { skewy: prop()+ "deg" });
	}, true);
}(window.m));