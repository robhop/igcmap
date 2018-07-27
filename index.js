const fs = require('fs')
const IGCParser = require('igc-parser')
const _ = require("lodash")
const turf = require('@turf/turf')
const h3 = require('h3-js')

const express = require('express')
const app = express()
app.use(express.static('public'))

let result = IGCParser.parse(fs.readFileSync('2017-08-12-XFH-000-02.IGC', 'utf8'))
let zoom = 9

app.get('/api/track', (req, res) => {
	var l = _.map(result.fixes,(f) => {return [f.longitude,f.latitude]})
	res.send(turf.lineString(l))
})


app.get('/api/h3', (req, res) => {
	let h3Dictionary = {};
	let hx = null
	let alt = result.fixes[0].pressureAltitude

	console.log('\n\n\n\n\n');
	const edgelengt = h3.edgeLength(zoom,'m')
	_.each(result.fixes,(f) => {
		const tmp_hx = h3.geoToH3(f.latitude,f.longitude, zoom); 
		if (tmp_hx == hx) {

		} else {
			
			let rate = (f.pressureAltitude - alt) / edgelengt
			console.log("Hex " + hx + ' ' + rate.toFixed(2))
			if(!h3Dictionary.hasOwnProperty(tmp_hx))
				h3Dictionary[tmp_hx] = [];
			h3Dictionary[tmp_hx].push(rate)								

			hx = tmp_hx
			alt = f.pressureAltitude
		}

		
	})

	//const geo = h3.h3SetToMultiPolygon(Object.keys(_.pickBy(h3Dictionary,(v,k) => { return v})),true);
	//res.send(turf.multiPolygon(geo))
	res.send(h3Dictionary);
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))







//fs.writeFileSync('ut.json', JSON.stringify(result))