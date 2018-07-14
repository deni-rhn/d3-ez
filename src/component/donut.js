import * as d3 from "d3";
import { default as palette } from "../palette";
import { default as dataAnalysis } from "../dataAnalysis";

/**
 * Reusable Donut Chart Component
 *
 */
export default function() {

	/**
	 * Default Properties
	 */
	let width = 300;
	let height = 300;
	let radius = 150;
	let innerRadius;
	let transition = { ease: d3.easeBounce, duration: 500 };
	let colors = palette.categorical(3);
	let colorScale;
	let dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
	let classed = "donut";

	/**
	 * Initialise Data and Scales
	 */
	function init(data) {
		let dataDimensions = dataAnalysis(data);
		let seriesNames = dataDimensions.columnKeys;

		// If the radius has not been passed then calculate it from width/height.
		radius = (typeof radius === "undefined") ?
			(Math.min(width, height) / 2) :
			radius;

		innerRadius = (typeof innerRadius === "undefined") ?
			(radius / 4) :
			innerRadius;

		// If the colorScale has not been passed then attempt to calculate.
		colorScale = (typeof colorScale === "undefined") ?
			d3.scaleOrdinal().domain(seriesNames).range(colors) :
			colorScale;
	}

	/**
	 * Constructor
	 */
	function my(selection) {
		selection.each(function(data) {
			init(data);

			// Pie Generator
			let pie = d3.pie()
				.value(function(d) { return d.value; })
				.sort(null)
				.padAngle(0.015);

			// Arc Generator
			let arc = d3.arc()
				.innerRadius(innerRadius)
				.outerRadius(radius)
				.cornerRadius(2);

			// Arc Tween
			let arcTween = function(d) {
				let i = d3.interpolate(this._current, d);
				this._current = i(0);
				return function(t) {
					return arc(i(t));
				};
			};

			// Update series group
			let seriesGroup = d3.select(this);
			seriesGroup
				.classed(classed, true)
				.attr("id", function(d) { return d.key; })
				.on("mouseover", function(d) { dispatch.call("customSeriesMouseOver", this, d); })
				.on("click", function(d) { dispatch.call("customSeriesClick", this, d); });

			// Slices
			let slices = seriesGroup.selectAll("path.slice")
				.data(function(d) { return pie(d.values); });

			slices.enter()
				.append("path")
				.attr("class", "slice")
				.attr("fill", function(d) { return colorScale(d.data.key); })
				.attr("d", arc)
				.on("mouseover", function(d) { dispatch.call("customValueMouseOver", this, d); })
				.on("click", function(d) { dispatch.call("customValueClick", this, d); })
				.merge(slices)
				.transition()
				.duration(transition.duration)
				.ease(transition.ease)
				.attrTween("d", arcTween);

			slices.exit()
				.remove();
		});
	}

	/**
	 * Configuration Getters & Setters
	 */
	my.width = function(_) {
		if (!arguments.length) return width;
		width = _;
		return this;
	};

	my.height = function(_) {
		if (!arguments.length) return height;
		height = _;
		return this;
	};

	my.radius = function(_) {
		if (!arguments.length) return radius;
		radius = _;
		return this;
	};

	my.innerRadius = function(_) {
		if (!arguments.length) return innerRadius;
		innerRadius = _;
		return this;
	};

	my.colorScale = function(_) {
		if (!arguments.length) return colorScale;
		colorScale = _;
		return my;
	};

	my.colors = function(_) {
		if (!arguments.length) return colors;
		colors = _;
		return my;
	};

	my.dispatch = function(_) {
		if (!arguments.length) return dispatch();
		dispatch = _;
		return this;
	};

	my.on = function() {
		let value = dispatch.on.apply(dispatch, arguments);
		return value === dispatch ? my : value;
	};

	return my;
}
