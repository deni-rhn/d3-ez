import * as d3 from "d3";

/**
 * Data Rotate
 *
 */
export default function(input) {

	let columnKeys = input.map(function(x) {
		return x.key
	});

	let rowKeys = input[0].values.map(function(x) {
		return x.key
	});

	let output = rowKeys.map(function(x, i) {
		let values = [];
		for (let j = 0; j <= input.length - 1; j++) {
			values[j] = {
				key: columnKeys[j],
				value: input[j].values[i].value
			};
		}

		return {
			key: x,
			values: values
		}
	});

	return output;
}
