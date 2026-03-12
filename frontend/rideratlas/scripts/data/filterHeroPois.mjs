import fs from "fs"

const raw = JSON.parse(
  fs.readFileSync("src/features/poi/poiFiltered.json", "utf8")
)

const hero = {}

Object.values(raw).forEach(poi => {

  const isScenic =
    poi.category === "SCENIC_POINT" ||
    poi.category === "VIEWPOINT"

  const inMountainRegion =
    poi.region &&
    ["Alps","Dolomites","Pyrenees","Norway","Scotland"]
      .includes(poi.region)

  if (isScenic && inMountainRegion) {

    hero[poi.slug] = poi

  }

})

fs.writeFileSync(
  "src/features/poi/poiHero.json",
  JSON.stringify(hero, null, 2)
)

console.log("Hero POIs:", Object.keys(hero).length)