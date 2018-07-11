import * as d3 from "d3";
import { default as palette } from "../palette";
import { default as dataParse } from "../dataParse";

/**
 * Reusable Stacked Bar Chart Component
 *
 */
export default function() {

	/**
	 * Default Properties
	 */
	let width = 100;
	let height = 300;
	let transition = { ease: d3.easeBounce, duration: 500 };
	let colors = palette.categorical(3);
	let dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
	let yScale;
	let colorScale;
	let classed = "barsStacked";

	/**
	 * Initialise Data and Scales
	 */
	function init(data) {
		let slicedData = dataParse(data);
		let seriesTotalsMax = slicedData.seriesTotalsMax;
		let categoryNames = slicedData.categoryNames;

		// If the colorScale has not been passed then attempt to calculate.
		colorScale = (typeof colorScale === "undefined") ?
			d3.scaleOrdinal().domain(categoryNames).range(colors) :
			colorScale;

		// If the yScale has not been passed then attempt to calculate.
		yScale = (typeof yScale === "undefined") ?
			d3.scaleLinear().domain([0, seriesTotalsMax]).range([0, height]).nice() :
			yScale;
	}

	/**
	 * Constructor
	 */
	function my(selection) {
		init(selection.data());
		selection.each(function() {

			// Stack Generator
			let stacker = function(data) {
				let series = [];
				let y0 = 0;
				let y1 = 0;
				data.forEach(function(d, i) {
					y1 = y0 + d.value;
					series[i] = {
						key: d.key,
						value: d.value,
						y0: y0,
						y1: y1
					};
					y0 += d.value;
				});

				return series;
			};

			// Update series group
			let seriesGroup = d3.select(this);
			seriesGroup
				.classed(classed, true)
				.attr("id", function(d) { return d.key; })
				.on("mouseover", function(d) { dispatch.call("customSeriesMouseOver", this, d); })
				.on("click", function(d) { dispatch.call("customSeriesClick", this, d); });

			// Add bars to series
			let bars = seriesGroup.selectAll(".bar")
				.data(function(d) { return stacker(d.values); });

			bars.enter()
				.append("rect")
				.classed("bar", true)
				.attr("width", width)
				.attr("x", 0)
				.attr("y", height)
				.attr("rx", 0)
				.attr("ry", 0)
				.attr("height", 0)
				.attr("fill", function(d) { return colorScale(d.key); })
				.on("mouseover", function(d) { dispatch.call("customValueMouseOver", this, d); })
				.on("click", function(d) { dispatch.call("customValueClick", this, d); })
				.merge(bars)
				.transition()
				.ease(transition.ease)
				.duration(transition.duration)
				.attr("width", width)
				.attr("x", 0)
				.attr("y", function(d) { return height - yScale(d.y1); })
				.attr("height", function(d) { return yScale(d.value); });

			bars.exit()
				.transition()
				.style("opacity", 0)
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

	my.colorScale = function(_) {
		if (!arguments.length) return colorScale;
		colorScale = _;
		return my;
	};

	my.colors = function(_) {
		if (!arguments.length) return colors;
		colors = _;
		return this;
	};

	my.yScale = function(_) {
		if (!arguments.length) return yScale;
		yScale = _;
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
