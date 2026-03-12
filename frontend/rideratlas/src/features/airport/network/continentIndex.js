import { AIRPORT_INDEX } from "./airportIndex"

const continents = {
  europe: [],
  "north-america": [],
  "south-america": [],
  asia: [],
  oceania: [],
  africa: []
}

Object.values(AIRPORT_INDEX).forEach(airport => {

  const continent = airport.continent

  if (!continents[continent]) return

  continents[continent].push(airport.slug)

})

export const continentIndex = Object.fromEntries(
  Object.entries(continents).map(([k, v]) => [
    k,
    { airports: v }
  ])
)
