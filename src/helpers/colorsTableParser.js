'use strict';

let cheerio = require('cheerio');
let Promise = require('promise');

module.exports = {
	parseTable: parseTable
};
/**
 * Creates color value with opacity
 * @param {String} color – color in rgb() or HEX format
 * @param {Number} opacity – opacity in percents
 * @param {Boolean} useHex is color in HEX format
 * @return {Object.<String, string>}
 */
function addOpacity(color, opacity, useHex) {
	let newColor = useHex ? color : color.slice(color.indexOf('(') + 1, color.length - 1);

	return `rgba(${newColor}, ${opacity / 100})`;
}
/**
 * Parses HTML table into map of variables and its values
 * @param {String} string – HTML node
 * @return {Object.<String, string>}
 */
function parseTable(string, useHex) {
	let $ = cheerio.load(string),
		map = {};

	$('tbody tr').each((t, elem) => {
			if ($(elem).children('td').length > 1) {
				let colorIndex = $('td:first-child', elem).html(),
					names = $('td:last-child', elem).text() || '',
					hexColor = $('td:first-child + td', elem).text() || '',
					rgbColor = $('td:first-child + td + td', elem).attr('style') || '',
					color = useHex ? ('#' + hexColor) : '' +
					rgbColor.slice(('background-color: ').length, rgbColor.length - 1);

				names = names.replace(new RegExp('<(/)*span>', 'g'), '').replace(/&#xA0;/g, '').split(',');

				names.forEach(name => {
					let opacity = name.match(/(\d+)\%/);
					let processedColor = color;
					if (!!opacity) {
						name = name.slice(0, opacity.index - 1);
						processedColor = addOpacity(color, parseInt(opacity[1]), useHex);
					}
					name = name.replace(/ /g, '').toLowerCase().trim();
					map[name] = processedColor;
				});
			}

		}
	);

	return map;
}