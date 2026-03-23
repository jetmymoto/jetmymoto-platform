const DEFAULT_OPERATOR = {
  status: "seeded",
  pricing_model: "affiliate",
  commission_type: "percentage",
  commission_value: 15
};

function operator(data) {
  return {
    ...DEFAULT_OPERATOR,
    ...data,
    websiteUrl: data.website_url
  };
}

export const OPERATORS = {
  "eagle-rider-mxp": operator({
    id: "eagle-rider-mxp",
    slug: "eagle-rider-mxp",
    name: "EagleRider Milan Airport",
    type: "global",
    country: "IT",
    airports: ["MXP"],
    website_url: "https://www.eaglerider.com/milan-airport"
  }),
  "motorcycle-rental-europe-mxp": operator({
    id: "motorcycle-rental-europe-mxp",
    slug: "motorcycle-rental-europe-mxp",
    name: "Motorcycle Rental Europe",
    type: "local",
    country: "IT",
    airports: ["MXP"],
    website_url: "https://www.motorcycle-rental-europe.com/"
  }),
  "superbike-rental-lhr": operator({
    id: "superbike-rental-lhr",
    slug: "superbike-rental-lhr",
    name: "Superbike Rental",
    type: "local",
    country: "GB",
    airports: ["LHR"],
    website_url: "https://www.superbikerental.co.uk/"
  }),
  "hibike4u-lhr": operator({
    id: "hibike4u-lhr",
    slug: "hibike4u-lhr",
    name: "HiBike4u",
    type: "local",
    country: "GB",
    airports: ["LHR"],
    website_url: "https://hibike4u.co.uk/"
  }),
  "gogreen-motorcycles-lhr": operator({
    id: "gogreen-motorcycles-lhr",
    slug: "gogreen-motorcycles-lhr",
    name: "GoGreen Motorcycles",
    type: "local",
    country: "GB",
    airports: ["LHR"],
    website_url: "https://gogreenmotorcycles.com/"
  }),
  "eagle-rider-lax": operator({
    id: "eagle-rider-lax",
    slug: "eagle-rider-lax",
    name: "EagleRider Los Angeles",
    type: "global",
    country: "US",
    airports: ["LAX"],
    website_url:
      "https://www.eaglerider.com/motorcycle-rental/lax-los-angeles-international-airport"
  }),
  "ride2rideagain-lax": operator({
    id: "ride2rideagain-lax",
    slug: "ride2rideagain-lax",
    name: "Ride2RideAgain",
    type: "local",
    country: "US",
    airports: ["LAX"],
    website_url: "https://www.ride2rideagain.com/"
  }),
  "motorentals-lax": operator({
    id: "motorentals-lax",
    slug: "motorentals-lax",
    name: "Motorentals.net",
    type: "local",
    country: "US",
    airports: ["LAX"],
    website_url: "https://www.motorentals.net/"
  }),
  "cycle-bc-yvr": operator({
    id: "cycle-bc-yvr",
    slug: "cycle-bc-yvr",
    name: "Cycle BC Rentals",
    type: "local",
    country: "CA",
    airports: ["YVR"],
    website_url: "https://cyclebc.ca/vancouver/motorcycles/rentals-and-tours/rentals/"
  }),
  "eagle-rider-yvr": operator({
    id: "eagle-rider-yvr",
    slug: "eagle-rider-yvr",
    name: "EagleRider Vancouver",
    type: "global",
    country: "CA",
    airports: ["YVR"],
    website_url:
      "https://www.eaglerider.com/motorcycle-rental/yvr-vancouver-international-airport"
  }),
  "eagle-rider-bna": operator({
    id: "eagle-rider-bna",
    slug: "eagle-rider-bna",
    name: "EagleRider Nashville",
    type: "global",
    country: "US",
    airports: ["BNA"],
    website_url:
      "https://www.eaglerider.com/motorcycle-rental/bna-nashville-international-airport"
  }),
  "riders-share-bna": operator({
    id: "riders-share-bna",
    slug: "riders-share-bna",
    name: "Riders Share Nashville",
    type: "local",
    country: "US",
    airports: ["BNA"],
    website_url: "https://www.riders-share.com/us/nashville-tn"
  }),
  "hertz-ride-alicante": operator({
    id: "hertz-ride-alicante",
    slug: "hertz-ride-alicante",
    name: "Hertz Ride Alicante",
    type: "global",
    country: "ES",
    airports: ["ALC"],
    website_url: "https://www.hertzride.com/en/locations"
  }),
  "hertz-ride-milan": operator({
    id: "hertz-ride-milan",
    slug: "hertz-ride-milan",
    name: "Hertz Ride Milan",
    type: "global",
    country: "IT",
    airports: ["MXP", "LIN"],
    website_url: "https://www.hertzride.com/en/locations"
  }),
  "hertz-ride-paris": operator({
    id: "hertz-ride-paris",
    slug: "hertz-ride-paris",
    name: "Hertz Ride Paris",
    type: "global",
    country: "FR",
    airports: ["CDG", "ORY"],
    website_url: "https://www.hertzride.com/en/locations"
  }),
  "hertz-ride-stockholm": operator({
    id: "hertz-ride-stockholm",
    slug: "hertz-ride-stockholm",
    name: "Hertz Ride Stockholm",
    type: "global",
    country: "SE",
    airports: ["ARN"],
    website_url: "https://www.hertzride.com/en/locations"
  }),
  "hertz-ride-lisbon": operator({
    id: "hertz-ride-lisbon",
    slug: "hertz-ride-lisbon",
    name: "Hertz Ride Lisbon",
    type: "global",
    country: "PT",
    airports: ["LIS"],
    website_url: "https://www.hertzride.com/en/locations"
  }),
  "hertz-ride-porto": operator({
    id: "hertz-ride-porto",
    slug: "hertz-ride-porto",
    name: "Hertz Ride Porto",
    type: "global",
    country: "PT",
    airports: ["OPO"],
    website_url: "https://www.hertzride.com/en/locations"
  }),
  "hertz-ride-vienna": operator({
    id: "hertz-ride-vienna",
    slug: "hertz-ride-vienna",
    name: "Hertz Ride Vienna",
    type: "global",
    country: "AT",
    airports: ["VIE"],
    website_url: "https://www.hertzride.com/locations"
  }),
  "imtbike-madrid": operator({
    id: "imtbike-madrid",
    slug: "imtbike-madrid",
    name: "IMTBIKE Madrid",
    type: "global",
    country: "ES",
    airports: ["MAD"],
    website_url: "https://www.imtbike.com/"
  }),
  "imtbike-lisbon": operator({
    id: "imtbike-lisbon",
    slug: "imtbike-lisbon",
    name: "IMTBIKE Lisbon",
    type: "global",
    country: "PT",
    airports: ["LIS"],
    website_url: "https://www.imtbike.com/"
  }),
  "eagle-rider-den": operator({
    id: "eagle-rider-den",
    slug: "eagle-rider-den",
    name: "EagleRider Denver",
    type: "global",
    country: "US",
    airports: ["DEN"],
    website_url: "https://www.eaglerider.com/denver"
  }),
  "eagle-rider-las": operator({
    id: "eagle-rider-las",
    slug: "eagle-rider-las",
    name: "EagleRider Las Vegas",
    type: "global",
    country: "US",
    airports: ["LAS"],
    website_url: "https://www.eaglerider.com/lasvegas"
  }),
  "eagle-rider-sea": operator({
    id: "eagle-rider-sea",
    slug: "eagle-rider-sea",
    name: "EagleRider Seattle",
    type: "global",
    country: "US",
    airports: ["SEA"],
    website_url: "https://www.eaglerider.com/seattle"
  }),
  "eagle-rider-sfo": operator({
    id: "eagle-rider-sfo",
    slug: "eagle-rider-sfo",
    name: "EagleRider San Francisco",
    type: "global",
    country: "US",
    airports: ["SFO"],
    website_url: "https://www.eaglerider.com/sanfrancisco"
  }),
  "eagle-rider-phx": operator({
    id: "eagle-rider-phx",
    slug: "eagle-rider-phx",
    name: "EagleRider Phoenix",
    type: "global",
    country: "US",
    airports: ["PHX"],
    website_url: "https://www.eaglerider.com/phoenix"
  }),
  "eagle-rider-atl": operator({
    id: "eagle-rider-atl",
    slug: "eagle-rider-atl",
    name: "EagleRider Atlanta North",
    type: "global",
    country: "US",
    airports: ["ATL"],
    website_url: "https://www.eaglerider.com/atlanta"
  }),
  "riders-share-atl": operator({
    id: "riders-share-atl",
    slug: "riders-share-atl",
    name: "Riders Share Atlanta",
    type: "local",
    country: "US",
    airports: ["ATL"],
    website_url: "https://www.riders-share.com/us/atlanta-ga"
  }),
  "riders-share-den": operator({
    id: "riders-share-den",
    slug: "riders-share-den",
    name: "Riders Share Denver",
    type: "local",
    country: "US",
    airports: ["DEN"],
    website_url: "https://www.riders-share.com/us/denver-co"
  }),
  "riders-share-dca": operator({
    id: "riders-share-dca",
    slug: "riders-share-dca",
    name: "Riders Share Washington D.C.",
    type: "local",
    country: "US",
    airports: ["DCA", "IAD", "BWI"],
    website_url: "https://www.riders-share.com/us/washington-dc"
  }),
  "riders-share-mia": operator({
    id: "riders-share-mia",
    slug: "riders-share-mia",
    name: "Riders Share Miami",
    type: "local",
    country: "US",
    airports: ["MIA"],
    website_url: "https://www.riders-share.com/us/miami-fl"
  }),
  "riders-share-hnl": operator({
    id: "riders-share-hnl",
    slug: "riders-share-hnl",
    name: "Riders Share Honolulu",
    type: "local",
    country: "US",
    airports: ["HNL"],
    website_url: "https://www.riders-share.com/us/honolulu-hi"
  }),
  "eagle-rider-chicago": operator({
    id: "eagle-rider-chicago",
    slug: "eagle-rider-chicago",
    name: "EagleRider Chicago",
    type: "global",
    country: "US",
    airports: ["ORD"],
    website_url: "https://www.eaglerider.com/chicago"
  }),
  "eagle-rider-dallas": operator({
    id: "eagle-rider-dallas",
    slug: "eagle-rider-dallas",
    name: "EagleRider Dallas",
    type: "global",
    country: "US",
    airports: ["DFW"],
    website_url: "https://www.eaglerider.com/dallas"
  }),
  "eagle-rider-new-york-city": operator({
    id: "eagle-rider-new-york-city",
    slug: "eagle-rider-new-york-city",
    name: "EagleRider New York City",
    type: "global",
    country: "US",
    airports: ["JFK"],
    website_url: "https://www.eaglerider.com/motorcycle-rental/new-york-city-new-york-united-states"
  }),
  "eagle-rider-mexico-city": operator({
    id: "eagle-rider-mexico-city",
    slug: "eagle-rider-mexico-city",
    name: "EagleRider Mexico City",
    type: "global",
    country: "MX",
    airports: ["MEX"],
    website_url: "https://www.eaglerider.com/motorcycle-rental/mexico-city-mexico"
  }),
  "joy-riders-toronto": operator({
    id: "joy-riders-toronto",
    slug: "joy-riders-toronto",
    name: "Joy Riders Motorcycle Agency",
    type: "local",
    country: "CA",
    airports: ["YYZ"],
    website_url: "https://www.joyriders.ca/rentals"
  }),
  "motogreece-athens": operator({
    id: "motogreece-athens",
    slug: "motogreece-athens",
    name: "MotoGreece",
    type: "local",
    country: "GR",
    airports: ["ATH"],
    website_url: "https://motogreece.gr/"
  }),
  "lemonrock-dublin": operator({
    id: "lemonrock-dublin",
    slug: "lemonrock-dublin",
    name: "Lemonrock Motorcycle Tours & Rentals",
    type: "local",
    country: "IE",
    airports: ["DUB"],
    website_url: "https://ridelemonrock.com/"
  }),
  "saltire-motorcycles-edinburgh": operator({
    id: "saltire-motorcycles-edinburgh",
    slug: "saltire-motorcycles-edinburgh",
    name: "Saltire Motorcycles",
    type: "local",
    country: "GB",
    airports: ["EDI"],
    website_url: "https://www.saltiremotorcycles.com/"
  }),
  "soulful-bikes-faro": operator({
    id: "soulful-bikes-faro",
    slug: "soulful-bikes-faro",
    name: "Soulful Bikes",
    type: "local",
    country: "PT",
    airports: ["FAO"],
    website_url: "https://www.soulfulbikes.com/en/"
  }),
  "moto-bike-gran-canaria": operator({
    id: "moto-bike-gran-canaria",
    slug: "moto-bike-gran-canaria",
    name: "Moto & Bike Rent Gran Canaria",
    type: "local",
    country: "ES",
    airports: ["LPA"],
    website_url: "https://www.motoandbike.com/"
  })
};
