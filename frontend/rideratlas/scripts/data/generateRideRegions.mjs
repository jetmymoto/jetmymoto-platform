import fs from "fs"

const pois = JSON.parse(
  fs.readFileSync("src/features/poi/poiHero.json", "utf8")
)

function classifyRegion(poi) {

  const { lat, lng } = poi

  if (!lat || !lng) return "other"

  // Alps
  if (lat > 44 && lat < 48 && lng > 5 && lng < 15)
    return "alps"

  // Dolomites
  if (lat > 45 && lat < 47 && lng > 10 && lng < 13)
    return "dolomites"

  // Pyrenees
  if (lat > 42 && lat < 44 && lng > -1 && lng < 3)
    return "pyrenees"

  // Norway
  if (lat > 60 && lat < 70 && lng > 5 && lng < 20)
    return "norway"

  // Scotland
  if (lat > 55 && lat < 60 && lng > -8 && lng < -1)
    return "scotland"

  // Carpathians
  if (lat > 44 && lat < 49 && lng > 18 && lng < 26)
    return "carpathians"

  // Balkans
  if (lat > 40 && lat < 46 && lng > 15 && lng < 22)
    return "balkans"

  return "other"
}

const regions = {}

Object.values(pois).forEach(poi => {

  const region = classifyRegion(poi)

  if (!regions[region]) {

    regions[region] = {
      slug: region,
      name: region.charAt(0).toUpperCase() + region.slice(1),
      pois: []
    }

  }

  regions[region].pois.push({
    slug: poi.slug,
    name: poi.name,
    lat: poi.lat,
    lng: poi.lng
  })

})

fs.writeFileSync(
  "src/features/rides/rideRegions.json",
  JSON.stringify(regions, null, 2)
)

console.log("Generated regions:", Object.keys(regions).length)