const fs = require('fs')
const IGCParser = require('igc-parser')
const kml = require('gtran-kml');
const turf = require('@turf/turf')
const _ = require("lodash")
const moment = require('moment')
const { renderTemplateFile } = require('template-file')




let result = IGCParser.parse(fs.readFileSync('2018-07-26-XFH-000-01.IGC', 'utf8'))
const start = moment(result.fixes[0].timestamp,'x')

let SecondsFromTimeOfFirstPoint = [];
let PressureAltitude = [];
let coordinates = [];
let points = [];

_.each(result.fixes,(f) => 
	{ 
		let t = moment(f.timestamp,'x')
		let d = moment.duration(t.diff(start))

		SecondsFromTimeOfFirstPoint.push(d.asSeconds())
		PressureAltitude.push(f.pressureAltitude)
		coordinates.push([f.longitude, f.latitude, f.gpsAltitude].join(','))
		points.push([f.longitude, f.latitude])

	})

const feature =  turf.featureCollection(_.map(result.fixes,(f,i) => 
	{
		return turf.point([f.longitude, f.latitude],f,{id:i})
	}));
const hull = turf.convex(feature);

const data = {
	time_of_first_point : start.format(),
	SecondsFromTimeOfFirstPoint : SecondsFromTimeOfFirstPoint.join(' '),
	PressureAltitude: PressureAltitude.join(' '),
	coordinates: coordinates.join(' '),
}


const max = maxDistance(result.fixes)
console.log(max)
console.log(feature)

fs.writeFileSync('hull.geojson',JSON.stringify(hull))

renderTemplateFile('track.kml', data)
  .then(renderedString =>  fs.writeFileSync('ut.kml',renderedString))

 function maxDistance(points) {

 	let max = 0;
 	let a = null;
 	let b = null;
 	for (var i = points.length - 1; i >= 0; i--) {
 		//points[i]
	 	for (var j = points.length - 1; j >= 0; j--) {
	 		if(i==j) continue;

	 		let distance = turf.distance([points[i].longitude,points[i].latitude], 
	 			                         [points[j].longitude,points[j].latitude], 
	 			                         {units: 'meters'})
	 		if(distance > max) {
	 			max = distance;
	 			a = points[i]
	 			b = points[j]

	 		} 
	 		
	 	} 		
 	}
 	return {max:max, a:a, b:b};
 }


