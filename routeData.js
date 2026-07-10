const STATE_COORDS = {
  AL:[32.8,-86.8], AK:[64.2,-149.5], AZ:[34.2,-111.7], AR:[35.2,-92.4], CA:[36.8,-119.4], CO:[39.0,-105.5],
  CT:[41.6,-72.7], DE:[39.0,-75.5], FL:[27.8,-81.7], GA:[32.7,-83.5], HI:[20.8,-156.3], ID:[44.1,-114.7],
  IL:[40.0,-89.2], IN:[40.3,-86.1], IA:[42.1,-93.5], KS:[38.5,-98.0], KY:[37.8,-84.3], LA:[31.2,-92.3],
  ME:[45.3,-69.0], MD:[39.0,-76.7], MA:[42.4,-71.8], MI:[44.3,-85.6], MN:[46.7,-94.7], MS:[32.7,-89.7],
  MO:[38.5,-92.5], MT:[46.9,-110.4], NE:[41.5,-99.7], NV:[39.5,-116.9], NH:[43.7,-71.6], NJ:[40.1,-74.7],
  NM:[34.4,-106.1], NY:[43.0,-75.0], NC:[35.5,-79.4], ND:[47.5,-100.5], OH:[40.3,-82.8], OK:[35.6,-97.5],
  OR:[44.0,-120.6], PA:[41.2,-77.2], RI:[41.7,-71.5], SC:[33.8,-80.9], SD:[44.4,-100.2], TN:[35.8,-86.4],
  TX:[31.0,-99.0], UT:[39.3,-111.7], VT:[44.0,-72.7], VA:[37.5,-78.7], WA:[47.4,-120.7], WV:[38.6,-80.6],
  WI:[44.6,-89.6], WY:[43.0,-107.5], DC:[38.9,-77.0]
};

const PLACE_COORDS = {
  "Philadelphia, PA":[39.9526,-75.1652], "Orlando, FL":[28.5383,-81.3792], "Baltimore, MD":[39.2904,-76.6122],
  "Washington, DC":[38.9072,-77.0369], "Richmond, VA":[37.5407,-77.4360], "Raleigh, NC":[35.7796,-78.6382],
  "Savannah, GA":[32.0809,-81.0912], "Jacksonville, FL":[30.3322,-81.6557], "New York, NY":[40.7128,-74.0060],
  "Boston, MA":[42.3601,-71.0589], "New Haven, CT":[41.3083,-72.9279], "Providence, RI":[41.8240,-71.4128],
  "Pittsburgh, PA":[40.4406,-79.9959], "Chicago, IL":[41.8781,-87.6298], "Cleveland, OH":[41.4993,-81.6944],
  "Toledo, OH":[41.6528,-83.5379], "Washington, DC":[38.9072,-77.0369], "Atlanta, GA":[33.7490,-84.3880],
  "Charlotte, NC":[35.2271,-80.8431], "Greenville, SC":[34.8526,-82.3940], "Los Angeles, CA":[34.0522,-118.2437],
  "Las Vegas, NV":[36.1699,-115.1398], "Barstow, CA":[34.8958,-117.0173], "Primm, NV":[35.6122,-115.3883],
  "San Francisco, CA":[37.7749,-122.4194], "Seattle, WA":[47.6062,-122.3321], "Denver, CO":[39.7392,-104.9903],
  "Miami, FL":[25.7617,-80.1918], "Austin, TX":[30.2672,-97.7431]
};

const ROUTE_GUIDES = {
  "PA|Philadelphia|FL|Orlando": {
    distance: 1070, driveHours: 17, flyHours: 6, trainHours: 21, busHours: 22,
    routeStops: [
      {city:"Baltimore, MD", place:"Inner Harbor", where:"Downtown Baltimore waterfront", why:"Good short stop for food, a walk, and harbor views.", bestFor:"drive/train/bus"},
      {city:"Washington, DC", place:"National Mall", where:"Central Washington, DC", why:"Famous monuments and museums; best sightseeing stop on this route.", bestFor:"drive/train/bus"},
      {city:"Richmond, VA", place:"Canal Walk + Carytown", where:"Downtown Richmond and west Richmond", why:"Strong food/rest stop with walkable areas and easy overnight options.", bestFor:"drive/bike"},
      {city:"Raleigh, NC", place:"North Carolina Museum of Art", where:"West Raleigh", why:"Useful cultural stop with outdoor space for a longer break.", bestFor:"drive"},
      {city:"Savannah, GA", place:"Historic District + River Street", where:"Downtown Savannah", why:"Best overnight city on the route; walkable, famous, and scenic.", bestFor:"drive/bike"},
      {city:"Jacksonville, FL", place:"Jacksonville Beach", where:"East of Jacksonville", why:"Good final coastal break before Orlando.", bestFor:"drive"}
    ],
    stayZones: [
      {area:"Downtown Richmond, VA", where:"Near Canal Walk / Carytown access", why:"Good first long-drive rest area with food, walkable stops, and hotels.", bestFor:"one-night drive split"},
      {area:"Savannah Historic District, GA", where:"Downtown Savannah near River Street", why:"Best scenic overnight stop if you want the trip to feel like part of the vacation.", bestFor:"vacation drive"},
      {area:"Jacksonville Southbank or Jacksonville Beach, FL", where:"Near St. Johns River or the coast", why:"Good final overnight or long break before Orlando.", bestFor:"relaxed arrival"},
      {area:"International Drive / Lake Buena Vista, Orlando", where:"Near Orlando attractions", why:"Best arrival area for theme parks, restaurants, and shuttle access.", bestFor:"arrival stay"}
    ],
    destinationAttractions: [
      {place:"Walt Disney World Resort", where:"Lake Buena Vista, southwest of Orlando", why:"Most famous Orlando vacation attraction."},
      {place:"Universal Orlando Resort", where:"International Drive / Universal Blvd", why:"Major theme park and entertainment district."},
      {place:"Disney Springs", where:"Lake Buena Vista", why:"Good first-night food, shopping, and entertainment stop without needing a park ticket."},
      {place:"Lake Eola Park", where:"Downtown Orlando", why:"Easy city park stop if staying near downtown."},
      {place:"Winter Park / Park Avenue", where:"North of downtown Orlando", why:"Restaurants, shops, and a calmer local area outside theme parks."}
    ]
  },
  "NY|New York|MA|Boston": {
    distance: 215, driveHours: 4.5, flyHours: 4, trainHours: 4.2, busHours: 5,
    routeStops: [
      {city:"New Haven, CT", place:"Yale University campus", where:"Downtown New Haven", why:"Historic campus walk and strong food stop.", bestFor:"drive/train"},
      {city:"New Haven, CT", place:"Wooster Square", where:"East of downtown New Haven", why:"Known for pizza and a practical meal break.", bestFor:"drive"},
      {city:"Providence, RI", place:"Waterplace Park", where:"Downtown Providence", why:"Good waterfront stop and easy city break.", bestFor:"drive/train/bus"}
    ],
    stayZones: [
      {area:"Downtown New Haven, CT", where:"Near Yale and Union Station", why:"Good budget overnight if splitting the route slowly.", bestFor:"train/drive"},
      {area:"Downtown Providence, RI", where:"Near Waterplace Park", why:"Nice midpoint stay with restaurants and a walkable core.", bestFor:"scenic stop"},
      {area:"Back Bay or Seaport, Boston", where:"Central Boston", why:"Best for walkability and sightseeing after arrival.", bestFor:"arrival stay"}
    ],
    destinationAttractions: [
      {place:"Freedom Trail", where:"Downtown Boston", why:"Classic first-time Boston sightseeing route."},
      {place:"Boston Common", where:"Central Boston", why:"Easy starting point for walking and transit."},
      {place:"Fenway Park", where:"Fenway-Kenmore", why:"Famous sports landmark."},
      {place:"Faneuil Hall / Quincy Market", where:"Downtown waterfront area", why:"Food, shops, and tourist-friendly historic area."}
    ]
  },
  "PA|Pittsburgh|IL|Chicago": {
    distance: 460, driveHours: 7.5, flyHours: 4.5, trainHours: 10, busHours: 11,
    routeStops: [
      {city:"Cleveland, OH", place:"Rock & Roll Hall of Fame", where:"Downtown lakefront Cleveland", why:"Famous museum and strong road-trip stop.", bestFor:"drive"},
      {city:"Cleveland, OH", place:"West Side Market", where:"Ohio City, Cleveland", why:"Food stop with local character.", bestFor:"drive"},
      {city:"Toledo, OH", place:"Toledo Museum of Art", where:"Old West End, Toledo", why:"Useful cultural stop before continuing west.", bestFor:"drive"}
    ],
    stayZones: [
      {area:"Downtown Cleveland, OH", where:"Near lakefront / Playhouse Square", why:"Best overnight split with food and attractions.", bestFor:"drive/train"},
      {area:"South Bend, IN area", where:"Near University of Notre Dame", why:"Practical late-route overnight if splitting near Chicago.", bestFor:"drive"},
      {area:"The Loop / River North, Chicago", where:"Central Chicago", why:"Best arrival zone for sightseeing and transit.", bestFor:"arrival stay"}
    ],
    destinationAttractions: [
      {place:"Millennium Park", where:"The Loop, Chicago", why:"Famous city landmark and easy first stop."},
      {place:"Chicago Riverwalk", where:"Downtown Chicago", why:"Great walking route with architecture views."},
      {place:"Art Institute of Chicago", where:"Michigan Avenue, The Loop", why:"Major museum next to Millennium Park."},
      {place:"Navy Pier", where:"Lakefront Chicago", why:"Classic tourist stop with lake views."}
    ]
  },
  "DC|Washington|GA|Atlanta": {
    distance: 640, driveHours: 10, flyHours: 4.5, trainHours: 14, busHours: 13,
    routeStops: [
      {city:"Richmond, VA", place:"Canal Walk", where:"Downtown Richmond", why:"Convenient food and walk stop south of DC.", bestFor:"drive/bus"},
      {city:"Charlotte, NC", place:"Uptown Charlotte", where:"Central Charlotte", why:"Good long-break or overnight city with food and hotels.", bestFor:"drive"},
      {city:"Greenville, SC", place:"Falls Park on the Reedy", where:"Downtown Greenville", why:"Scenic park and walkable downtown.", bestFor:"drive"}
    ],
    stayZones: [
      {area:"Uptown Charlotte, NC", where:"Central Charlotte", why:"Best overnight split with restaurants and hotels.", bestFor:"drive"},
      {area:"Downtown Greenville, SC", where:"Near Falls Park", why:"Scenic, walkable stop before Atlanta.", bestFor:"vacation drive"},
      {area:"Midtown or Downtown Atlanta", where:"Near attractions and MARTA", why:"Best arrival zone for sightseeing.", bestFor:"arrival stay"}
    ],
    destinationAttractions: [
      {place:"Georgia Aquarium", where:"Downtown Atlanta", why:"Major Atlanta attraction."},
      {place:"World of Coca-Cola", where:"Downtown Atlanta", why:"Popular museum next to Centennial Olympic Park."},
      {place:"Atlanta BeltLine Eastside Trail", where:"East Atlanta / Old Fourth Ward", why:"Great walking, food, and local activity area."},
      {place:"Ponce City Market", where:"Old Fourth Ward", why:"Food hall and rooftop-style destination."}
    ]
  },
  "CA|Los Angeles|NV|Las Vegas": {
    distance: 270, driveHours: 4.5, flyHours: 3.5, trainHours: 8, busHours: 5.5,
    routeStops: [
      {city:"Barstow, CA", place:"Route 66 Mother Road Museum", where:"Barstow", why:"Classic Route 66 road-trip stop.", bestFor:"drive"},
      {city:"Yermo, CA", place:"Calico Ghost Town", where:"Near Barstow / Yermo", why:"Historic desert stop that fits the road-trip theme.", bestFor:"drive"},
      {city:"Jean, NV", place:"Seven Magic Mountains", where:"South of Las Vegas", why:"Colorful public art stop before arriving in Vegas.", bestFor:"drive"}
    ],
    stayZones: [
      {area:"Barstow, CA", where:"Mid-route desert stop", why:"Practical overnight only if leaving late or traveling slowly.", bestFor:"budget split"},
      {area:"The Strip, Las Vegas", where:"Central Las Vegas Boulevard", why:"Best arrival zone for first-time visitors and major attractions.", bestFor:"arrival stay"},
      {area:"Downtown Las Vegas / Fremont Street", where:"North of the Strip", why:"Often better value and good for nightlife.", bestFor:"budget travelers"}
    ],
    destinationAttractions: [
      {place:"The Strip", where:"Las Vegas Boulevard", why:"Most famous Las Vegas attraction zone."},
      {place:"Fremont Street Experience", where:"Downtown Las Vegas", why:"Classic downtown lights and entertainment."},
      {place:"Red Rock Canyon", where:"West of Las Vegas", why:"Best nearby outdoor/scenic option."},
      {place:"Bellagio Fountains", where:"Center Strip", why:"Free and famous quick stop."}
    ]
  }
};

const DESTINATION_GUIDES = {
  "FL|Orlando": ROUTE_GUIDES["PA|Philadelphia|FL|Orlando"].destinationAttractions,
  "MA|Boston": ROUTE_GUIDES["NY|New York|MA|Boston"].destinationAttractions,
  "IL|Chicago": ROUTE_GUIDES["PA|Pittsburgh|IL|Chicago"].destinationAttractions,
  "GA|Atlanta": ROUTE_GUIDES["DC|Washington|GA|Atlanta"].destinationAttractions,
  "NV|Las Vegas": ROUTE_GUIDES["CA|Los Angeles|NV|Las Vegas"].destinationAttractions,
  "NY|New York": [
    {place:"Times Square", where:"Midtown Manhattan", why:"Famous first-time visitor landmark."},
    {place:"Central Park", where:"Manhattan", why:"Large urban park with museums nearby."},
    {place:"Brooklyn Bridge", where:"Lower Manhattan / Brooklyn", why:"Iconic walking route and skyline views."},
    {place:"Statue of Liberty ferry area", where:"Battery Park", why:"Classic New York sightseeing starting point."}
  ],
  "CA|Los Angeles": [
    {place:"Santa Monica Pier", where:"Santa Monica", why:"Classic beach and pier stop."},
    {place:"Griffith Observatory", where:"Los Feliz / Griffith Park", why:"Views of LA and the Hollywood Sign."},
    {place:"Hollywood Walk of Fame", where:"Hollywood Boulevard", why:"Famous tourist landmark."},
    {place:"The Getty Center", where:"Brentwood", why:"Art, architecture, and city views."}
  ],
  "CA|San Francisco": [
    {place:"Golden Gate Bridge", where:"Northern San Francisco", why:"Most famous city landmark."},
    {place:"Fisherman's Wharf", where:"Waterfront", why:"Tourist-friendly food and bay views."},
    {place:"Golden Gate Park", where:"Western San Francisco", why:"Museums, gardens, and outdoor space."},
    {place:"Chinatown", where:"Near downtown", why:"Historic food and walking area."}
  ],
  "WA|Seattle": [
    {place:"Pike Place Market", where:"Downtown Seattle", why:"Famous market and food stop."},
    {place:"Space Needle", where:"Seattle Center", why:"Iconic observation tower."},
    {place:"Museum of Pop Culture", where:"Seattle Center", why:"Popular museum near Space Needle."},
    {place:"Kerry Park", where:"Queen Anne", why:"Classic skyline viewpoint."}
  ],
  "CO|Denver": [
    {place:"Union Station", where:"Downtown Denver", why:"Food, transit, and walkable arrival point."},
    {place:"Red Rocks Park and Amphitheatre", where:"Morrison, west of Denver", why:"Famous outdoor venue and scenic stop."},
    {place:"Denver Art Museum", where:"Civic Center", why:"Major museum in central Denver."},
    {place:"RiNo Art District", where:"North of downtown", why:"Murals, food halls, and breweries."}
  ],
  "TX|Austin": [
    {place:"Texas State Capitol", where:"Downtown Austin", why:"Historic landmark and easy downtown stop."},
    {place:"South Congress Avenue", where:"South Austin", why:"Food, shops, and classic Austin feel."},
    {place:"Lady Bird Lake Trail", where:"Central Austin waterfront", why:"Walking/biking route with skyline views."},
    {place:"Barton Springs Pool", where:"Zilker Park", why:"Popular outdoor swimming spot."}
  ],
  "FL|Miami": [
    {place:"South Beach", where:"Miami Beach", why:"Famous beach and Art Deco area."},
    {place:"Wynwood Walls", where:"Wynwood", why:"Street art and food area."},
    {place:"Little Havana", where:"Calle Ocho", why:"Culture, food, and music."},
    {place:"Bayside Marketplace", where:"Downtown waterfront", why:"Easy food and boat tour area."}
  ],
  "DC|Washington": [
    {place:"National Mall", where:"Central Washington, DC", why:"Monuments and Smithsonian museums."},
    {place:"U.S. Capitol area", where:"Capitol Hill", why:"Major government landmark."},
    {place:"Georgetown Waterfront", where:"Georgetown", why:"Food, walking, and river views."},
    {place:"Smithsonian museums", where:"National Mall", why:"Free major museums."}
  ]
};
