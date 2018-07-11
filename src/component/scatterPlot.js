import * as d3 from "d3";
import { default as palette } from "../palette";
import { default as dataParse } from "../dataParse";

/**
 * Reusable Scatter Plot Component
 *
 */
export default function() {

	/**
	 * Default Properties
	 */
	let width = 400;
	let height = 400;
	let transition = { ease: d3.easeLinear, duration: 0 };
	let colors = palette.categorical(3);
	let colorScale;
	let xScale;
	let yScale;
	let dispatch = d3.dispatch("customValueMouseOver", "customValueMouseOut", "customValueClick", "customSeriesMouseOver", "customSeriesMouseOut", "customSeriesClick");
	let classed = "scatterPlot";

	/**
	 * Initialise Data and Scales
	 */
	function init(data) {
		let slicedData = dataParse(data);
		let seriesNames = slicedData.seriesNames;
		let maxValue = slicedData.maxValue;
		let dateDomain = d3.extent(data[0].values, function(d) { return d.key; });

		// If the colorScale has not been passed then attempt to calculate.
		colorScale = (typeof colorScale === "undefined") ?
			d3.scaleOrdinal().domain(seriesNames).range(colors) :
			colorScale;

		// If the xScale has not been passed then attempt to calculate.
		xScale = (typeof xScale === "undefined") ?
			d3.scaleTime().domain(dateDomain).range([0, width]) :
			xScale;

		// If the yScale has not been passed then attempt to calculate.
		yScale = (typeof yScale === "undefined") ?
			d3.scaleLinear().domain([0, (maxValue * 1.05)]).range([height, 0]) :
			yScale;
	}

	/**
	 * Constructor
	 */
	function my(selection) {
		init(selection.data());
		selection.each(function() {

			// Update series group
			let seriesGroup = d3.select(this);
			seriesGroup
				.classed(classed, true)
				.attr("id", function(d) { return d.key; })
				.on("mouseover", function(d) { dispatch.call("customSeriesMouseOver", this, d); })
				.on("click", function(d) { dispatch.call("customSeriesClick", this, d); });

			// Create series group
			let seriesDots = seriesGroup.selectAll(".seriesDots")
				.data(function(d) { return [d]; });

			let series = seriesDots.enter()
				.append("g")
				.classed("seriesDots", true)
				.attr("fill", function(d) { return colorScale(d.key); })
				.on("mouseover", function(d) { dispatch.call("customSeriesMouseOver", this, d); })
				.on("click", function(d) { dispatch.call("customSeriesClick", this, d); })
				.merge(seriesDots);

			// Add dots to series
			let dots = series.selectAll(".dot")
				.data(function(d) { return d.values; });

			dots.enter()
				.append("circle")
				.attr("class", "dot")
				.attr("r", 3)
				.attr("cx", function(d) { return xScale(d.key); })
				.attr("cy", height)
				.on("mouseover", function(d) { dispatch.call("customValueMouseOver", this, d); })
				.on("click", function(d) { dispatch.call("customValueClick", this, d); })
				.merge(dots)
				.transition()
				.ease(transition.ease)
				.duration(transition.duration)
				.attr("cx", function(d) { return xScale(d.key); })
				.attr("cy", function(d) { return yScale(d.value); });

			dots.exit()
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
		return my;
	};

	my.xScale = function(_) {
		if (!arguments.length) return xScale;
		xScale = _;
		return my;
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
