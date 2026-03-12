import fs from "fs"
import path from "path"

const poiPath = "src/features/poi/poiIndex.json"

const raw = JSON.parse(fs.readFileSync(poiPath, "utf8"))

const allowedCategories = [
 "SCENIC_POINT",
 "VIEWPOINT",
 "MOUNTAIN_PASS"
]

const filtered = {}

Object.values(raw).forEach(poi => {

 if (allowedCategories.includes(poi.category)) {

   filtered[poi.slug] = poi

 }

})

const output = "src/features/poi/poiFiltered.json"

fs.writeFileSync(
 output,
 JSON.stringify(filtered, null, 2)
)

console.log(`Filtered POIs: ${Object.keys(filtered).length}`)
