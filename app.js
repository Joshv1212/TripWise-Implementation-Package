const $ = id => document.getElementById(id);
const money = n => "$" + Math.round(n).toLocaleString();
const fmtTime = h => h >= 24 ? `${Math.floor(h/24)}d ${Math.round(h%24)}h` : `${Math.round(h*10)/10}h`;

const MODE_META = {
  drive:{label:"Drive", icon:"🚗", comfort:72, safety:78, flex:92, effort:45},
  fly:{label:"Fly", icon:"✈️", comfort:82, safety:90, flex:48, effort:28},
  train:{label:"Train", icon:"🚆", comfort:80, safety:88, flex:62, effort:30},
  bus:{label:"Bus", icon:"🚌", comfort:58, safety:76, flex:60, effort:52},
  bike:{label:"Bike", icon:"🚲", comfort:40, safety:56, flex:92, effort:92},
  mixed:{label:"Mixed", icon:"🧭", comfort:65, safety:76, flex:86, effort:55}
};

function init(){
  populateStates();
  setupNav();
  setupInputs();
  buildPlan();
}

function populateStates(){
  const states = Object.keys(STATE_CITY_DATA).sort();
  const options = states.map(s=>`<option value="${s}">${STATE_NAMES[s]} (${s})</option>`).join("");
  $("originState").innerHTML = options;
  $("destinationState").innerHTML = options;
  $("originState").value = "PA";
  $("destinationState").value = "FL";
  updateCityLists();
}

function updateCityLists(){
  const os = $("originState").value, ds = $("destinationState").value;
  $("originCityList").innerHTML = (STATE_CITY_DATA[os] || []).map(c=>`<option value="${c}"></option>`).join("");
  $("destinationCityList").innerHTML = (STATE_CITY_DATA[ds] || []).map(c=>`<option value="${c}"></option>`).join("");
}

function setupNav(){
  document.querySelectorAll(".nav").forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll(".nav").forEach(b=>b.classList.remove("active"));
      document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
      btn.classList.add("active");
      $(btn.dataset.page).classList.add("active");
    });
  });
}

function setupInputs(){
  ["originState","destinationState"].forEach(id=>$(id).addEventListener("change",()=>{updateCityLists(); buildPlan();}));
  ["originCity","destinationCity","tripType","travelers","daysAvailable","budget","lodging","luggage","bikeExperience","bikeMiles","comfortNeed","flexNeed","costWeight","speedWeight","comfortWeight","flexWeight","safetyWeight"].forEach(id=>{
    $(id).addEventListener("input",buildPlan);
  });
  document.querySelectorAll(".mode-check").forEach(c=>c.addEventListener("change",buildPlan));
  $("buildPlan").addEventListener("click",()=>{buildPlan(); openPage("advisor");});
}

function openPage(id){
  document.querySelectorAll(".nav").forEach(b=>b.classList.remove("active"));
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.querySelector(`.nav[data-page="${id}"]`).classList.add("active");
  $(id).classList.add("active");
}

function getInputs(){
  return {
    os:$("originState").value,
    ds:$("destinationState").value,
    oc:($("originCity").value || "Philadelphia").trim(),
    dc:($("destinationCity").value || "Orlando").trim(),
    trip:$("tripType").value,
    travelers:+$("travelers").value,
    days:+$("daysAvailable").value,
    budget:+$("budget").value,
    lodging:$("lodging").value,
    luggage:$("luggage").value,
    bikeExp:$("bikeExperience").value,
    bikeMiles:+$("bikeMiles").value,
    comfortNeed:$("comfortNeed").value,
    flexNeed:$("flexNeed").value,
    modes:[...document.querySelectorAll(".mode-check")].filter(x=>x.checked).map(x=>x.value),
    w:{cost:+$("costWeight").value, speed:+$("speedWeight").value, comfort:+$("comfortWeight").value, flex:+$("flexWeight").value, safety:+$("safetyWeight").value}
  };
}

function normalizeCity(city){
  return city.split(",")[0].trim();
}

function routeKey(i){
  return `${i.os}|${normalizeCity(i.oc)}|${i.ds}|${normalizeCity(i.dc)}`;
}

function reverseRouteKey(i){
  return `${i.ds}|${normalizeCity(i.dc)}|${i.os}|${normalizeCity(i.oc)}`;
}

function getRoute(i){
  const key = routeKey(i), rev = reverseRouteKey(i);
  if(ROUTE_GUIDES[key]) return {...ROUTE_GUIDES[key], curated:true};
  if(ROUTE_GUIDES[rev]) return {...ROUTE_GUIDES[rev], curated:true};

  const a = coordsFor(i.oc, i.os);
  const b = coordsFor(i.dc, i.ds);
  const distance = Math.max(80, Math.round(haversine(a[0],a[1],b[0],b[1]) * 1.18));
  return {
    curated:false,
    distance,
    driveHours:Math.round(distance/62*10)/10,
    flyHours:distance > 700 ? 6 : distance > 350 ? 4.7 : 3.8,
    trainHours:Math.round((distance/48 + 2)*10)/10,
    busHours:Math.round((distance/43 + 2)*10)/10,
    routeStops: genericStops(i),
    stayZones: genericStayZones(i),
    destinationAttractions: destinationAttractions(i)
  };
}

function coordsFor(city,state){
  const exact = PLACE_COORDS[`${normalizeCity(city)}, ${state}`];
  if(exact) return exact;
  return STATE_COORDS[state] || [39,-98];
}

function haversine(lat1,lon1,lat2,lon2){
  const R=3958.8, rad=x=>x*Math.PI/180;
  const dLat=rad(lat2-lat1), dLon=rad(lon2-lon1);
  const a=Math.sin(dLat/2)**2 + Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}

function destinationAttractions(i){
  const key = `${i.ds}|${normalizeCity(i.dc)}`;
  if(DESTINATION_GUIDES[key]) return DESTINATION_GUIDES[key];
  return [
    {place:"Visitor center or official tourism office", where:`${i.dc}, ${i.ds}`, why:"Best first stop for accurate local maps, events, transit, and current attraction information."},
    {place:"Downtown / main street district", where:`Central ${i.dc}`, why:"Usually the easiest area for food, walking, and first-night exploring."},
    {place:"Top-rated local museum or historic site", where:`${i.dc}, ${i.ds}`, why:"Good reliable activity when the exact destination is not in the curated database."},
    {place:"Major park, waterfront, or scenic viewpoint", where:`${i.dc}, ${i.ds}`, why:"Good low-cost option after travel."}
  ];
}

function genericStops(i){
  const osCities = STATE_CITY_DATA[i.os] || [];
  const dsCities = STATE_CITY_DATA[i.ds] || [];
  const picks = [osCities[1], osCities[2], dsCities[2], dsCities[1]].filter(Boolean);
  return picks.slice(0,4).map((city,idx)=>({
    city:`${city}, ${idx < 2 ? i.os : i.ds}`,
    place: idx % 2 === 0 ? "Downtown / main street stop" : "Food + fuel stop",
    where:`${city}, ${idx < 2 ? STATE_NAMES[i.os] : STATE_NAMES[i.ds]}`,
    why:"Use this as a practical route break. For exact places, open the live Google Maps route.",
    bestFor:"drive/bus/train"
  }));
}

function genericStayZones(i){
  return [
    {area:`Midpoint lodging near the route`, where:"Use Google Maps along the route", why:"Choose a hotel, hostel, or campground near the midpoint to avoid over-driving.", bestFor:"long drive or bike route"},
    {area:`Downtown ${i.dc}`, where:`Central ${i.dc}, ${i.ds}`, why:"Best for walkability, food, public transit, and first-time arrival.", bestFor:"arrival stay"},
    {area:`Airport or station area`, where:`Near the arrival airport/train/bus station`, why:"Best if arriving late, flying, or using transit.", bestFor:"fly/train/bus"}
  ];
}

function lodgeCost(type){
  return {camping:32, hostel:62, mixed:88, hotel:138}[type] || 138;
}

function calculate(i,r){
  const travelers=i.travelers, lodge=lodgeCost(i.lodging);
  const distance=r.distance;
  const driveNights = r.driveHours > 12 ? Math.ceil(r.driveHours/10)-1 : 0;
  const bikeDays = Math.max(1,Math.ceil(distance/Math.max(15,i.bikeMiles)));
  const bikeNights = Math.max(0,bikeDays-1);
  const lugFactor = i.luggage === "heavy" ? 1.18 : i.luggage === "light" ? .93 : 1;

  const modes = {
    drive:{mode:"drive", cost:distance/28*3.65 + distance*.12 + driveNights*lodge + travelers*r.driveHours*3.7 + 48, time:r.driveHours, days:Math.max(1,Math.ceil(r.driveHours/10)), notes:"Most control over luggage, route, stops, and schedule."},
    fly:{mode:"fly", cost:((distance>700?270:180)*travelers*lugFactor) + travelers*42 + 80 + 95, time:r.flyHours, days:1, notes:"Fastest option, but includes airport transfer, parking/rideshare, and baggage cost."},
    train:{mode:"train", cost:distance*.23*travelers*lugFactor + 38, time:r.trainHours, days:Math.max(1,Math.ceil(r.trainHours/18)), notes:"Comfortable, safer, and lower stress when the route has reasonable rail access."},
    bus:{mode:"bus", cost:distance*.135*travelers + 25, time:r.busHours, days:Math.max(1,Math.ceil(r.busHours/16)), notes:"Usually cheapest motorized option but slower and less comfortable."},
    bike:{mode:"bike", cost:bikeDays*travelers*28 + bikeNights*lodge + 95, time:bikeDays*8, days:bikeDays, notes:"Adventure option; only wins when time, fitness, weather, and lodging are realistic."},
    mixed:{mode:"mixed", cost:distance*.10*travelers + lodge*Math.max(1,Math.ceil(r.driveHours/11)-1) + 150, time:Math.round((r.busHours*.55 + r.trainHours*.45)*10)/10, days:Math.max(1,Math.ceil(r.busHours/15)), notes:"Blends train, bus, rideshare, walking, or bike rental for cost and flexibility."}
  };
  return score(i,r,modes);
}

function score(i,r,modes){
  const selected = i.modes.length ? i.modes : Object.keys(modes);
  const list = selected.map(k=>modes[k]).filter(Boolean);
  const maxCost = Math.max(...list.map(x=>x.cost));
  const maxTime = Math.max(...list.map(x=>x.time));
  const w=i.w, total=w.cost+w.speed+w.comfort+w.flex+w.safety;

  return list.map(x=>{
    const meta=MODE_META[x.mode];
    let penalty=0;
    if(x.cost > i.budget) penalty += 22;
    if(x.mode==="bike" && x.days > i.days) penalty += 42;
    if(x.mode==="bike" && i.bikeExp==="beginner" && r.distance > 180) penalty += 25;
    if(x.mode==="bike" && i.luggage==="heavy") penalty += 16;
    if(x.mode==="bus" && i.luggage==="heavy") penalty += 8;
    if(x.mode==="fly" && i.trip==="bike") penalty += 7;
    if(i.comfortNeed==="high" && (x.mode==="bus" || x.mode==="bike")) penalty += 10;
    if(i.flexNeed==="high" && x.mode==="fly") penalty += 8;

    const costScore=(1-x.cost/maxCost)*100;
    const speedScore=(1-x.time/maxTime)*100;
    const raw=(costScore*w.cost + speedScore*w.speed + meta.comfort*w.comfort + meta.flex*w.flex + meta.safety*w.safety)/total;
    const feasibility= penalty < 22 ? "Strong" : penalty < 42 ? "Possible" : "Weak";

    return {...x, label:meta.label, icon:meta.icon, comfort:meta.comfort, safety:meta.safety, flexibility:meta.flex,
      score:Math.max(0,Math.round(raw-penalty)), budgetFit:x.cost<=i.budget?"Within budget":"Over budget", feasibility};
  }).sort((a,b)=>b.score-a.score);
}

function buildPlan(){
  const i=getInputs(), r=getRoute(i), ranked=calculate(i,r), best=ranked[0];
  ["cost","speed","comfort","flex","safety"].forEach(k=>$(k+"Out").textContent=i.w[k]);
  $("heroRoute").textContent = `${i.oc}, ${i.os} → ${i.dc}, ${i.ds}`;
  $("heroText").textContent = `${i.travelers} traveler${i.travelers>1?"s":""} • ${i.days} days available • ${money(i.budget)} budget • about ${Math.round(r.distance)} miles`;
  $("heroBest").textContent = best.label;
  $("heroScore").textContent = `Score ${best.score}`;

  renderAdvisor(i,r,ranked,best);
  renderMap(i,r,best);
  renderCompare(ranked,best);
  renderItinerary(i,r,best);
  renderStops(i,r,best);
  renderExplore(i,r,best);
  renderPrep(i,r,best);
}

function renderAdvisor(i,r,ranked,best){
  $("winnerIcon").textContent=best.icon;
  $("winnerTitle").textContent=`${best.label} is the smartest option`;
  $("winnerReason").textContent=bestReason(i,r,best);
  $("winnerCost").textContent=money(best.cost);
  $("winnerTime").textContent=best.mode==="bike"?`${best.days} days`:fmtTime(best.time);
  $("winnerScore").textContent=best.score;
  $("winnerFeasible").textContent=best.feasibility;

  const second=ranked[1];
  const reasons=[
    ["Best total score",`${best.label} scored ${best.score} after weighting cost, speed, safety, comfort, and flexibility.`],
    ["Budget check",`${money(best.cost)} estimated cost vs. your ${money(i.budget)} budget. Status: ${best.budgetFit}.`],
    ["Time realism",best.mode==="bike"?`Bike travel needs about ${best.days} travel days. You entered ${i.days} days.`:`Estimated travel time is ${fmtTime(best.time)}.`],
    ["Why not the next option",second?`${second.label} was next best, but scored lower because of cost, time, comfort, safety, or feasibility.`:"Only one option was selected."],
    ["Route knowledge",r.curated?"This route has curated stop, stay, and attraction data.":"This is a custom route. RouteWise avoids fake exact places and gives planning categories plus a live Google Maps link."],
    ["Expert note",expertNote(best,i,r)]
  ];
  $("reasonGrid").innerHTML = reasons.map(([b,s])=>`<div><b>${b}</b><span>${s}</span></div>`).join("");
  $("actionGrid").innerHTML = actionItems(best,i,r).map(([b,s])=>`<div><b>${b}</b><span>${s}</span></div>`).join("");
}

function bestReason(i,r,best){
  const base = `This route is about ${Math.round(r.distance)} miles from ${i.oc}, ${i.os} to ${i.dc}, ${i.ds}.`;
  if(best.mode==="drive") return `${base} Driving wins because it balances cost, control, luggage, stop flexibility, and realistic timing.`;
  if(best.mode==="fly") return `${base} Flying wins because the time savings and comfort outweigh the added airport costs.`;
  if(best.mode==="train") return `${base} Train wins because it is lower-stress, safer, and comfortable while staying reasonably priced.`;
  if(best.mode==="bus") return `${base} Bus wins because it keeps cost low and still fits the available time.`;
  if(best.mode==="mixed") return `${base} Mixed travel wins because it combines lower cost with backup flexibility.`;
  return `${base} Bike wins only because your inputs make the days, budget, and adventure tradeoff realistic.`;
}

function expertNote(best,i,r){
  if(best.mode==="bike") return "Before choosing bike travel, confirm weather, shoulder/bike-lane availability, repair shops, safe lodging, and daily mileage.";
  if(best.mode==="fly") return "For flying, the key risk is hidden cost: baggage, airport parking, rideshare, rental car, and hotel location.";
  if(best.mode==="drive") return "For driving, the key risk is fatigue. If the drive is over 10–12 hours, split it with an overnight stay.";
  if(best.mode==="train") return "For train travel, verify station locations and last-mile transportation before booking lodging.";
  if(best.mode==="bus") return "For bus travel, check transfer times, late-night station safety, luggage rules, and backup lodging.";
  return "For mixed travel, build a backup plan because transfers and local transportation matter more than the main ticket price.";
}

function actionItems(best,i,r){
  if(best.mode==="fly") return [
    ["Book arrival lodging near the destination",`Focus on ${destinationStayText(i)} instead of route stops, because flying skips the road route.`],
    ["Check airport transfer cost","Add rideshare, rental car, parking, shuttle, or transit cost before final booking."],
    ["Plan first-day attractions","Choose one easy destination attraction after landing, not a route attraction."],
    ["Avoid hidden costs","Check baggage fees, seat selection, airport food, and local transportation."]
  ];
  if(best.mode==="bike") return [
    ["Verify daily mileage",`Target around ${Math.min(i.bikeMiles,Math.ceil(r.distance/best.days))} miles/day and avoid overbuilding the route.`],
    ["Plan repair + water","Find bike shops, water refill points, and safe rest areas near each stop city."],
    ["Choose realistic lodging","Use campgrounds, hostels, or budget motels near the route, not random remote stops."],
    ["Keep a backup mode","Have a train/bus backup for injury, weather, or mechanical problems."]
  ];
  if(best.mode==="train" || best.mode==="bus" || best.mode==="mixed") return [
    ["Confirm stations and transfers","Check departure station, arrival station, baggage rules, and connection time."],
    ["Stay near transit","Pick lodging near the arrival station or reliable public transportation."],
    ["Use stop cities carefully","Long transfers can become useful meal or sightseeing breaks."],
    ["Build a delay buffer","Keep money and time for delays, missed transfers, or late arrivals."]
  ];
  return [
    ["Open live route map","Use the Google Maps route button for exact roads, traffic, and current detours."],
    ["Pick intentional stops","Use one food/rest stop and one sightseeing stop so the trip is not just driving."],
    ["Split long drives","If the drive is over 10–12 hours, book a midpoint overnight stay."],
    ["Stay near the first attraction","Choose destination lodging based on what you want to do first."]
  ];
}

function destinationStayText(i){
  const key = `${i.ds}|${normalizeCity(i.dc)}`;
  const zones = {
    "FL|Orlando":"International Drive, Lake Buena Vista, or Downtown Orlando",
    "MA|Boston":"Back Bay, Seaport, or Downtown Boston",
    "IL|Chicago":"The Loop, River North, or West Loop",
    "GA|Atlanta":"Midtown, Downtown, or near MARTA access",
    "NV|Las Vegas":"The Strip or Downtown Las Vegas",
    "NY|New York":"Midtown Manhattan, Lower Manhattan, or near a subway line"
  };
  return zones[key] || `downtown ${i.dc} or near the arrival station/airport`;
}

function renderMap(i,r,best){
  renderStateDots();
  const start=coordsFor(i.oc,i.os), end=coordsFor(i.dc,i.ds);
  const p1=project(start[0],start[1]), p2=project(end[0],end[1]);
  const dx=p2.x-p1.x, c1={x:p1.x+dx*.35,y:Math.min(p1.y,p2.y)-80}, c2={x:p1.x+dx*.68,y:Math.max(p1.y,p2.y)+60};
  $("routePath").setAttribute("d",`M ${p1.x} ${p1.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`);
  const pins = [];
  pins.push(pin(p1.x,p1.y,"START",`${i.oc}, ${i.os}`,"#b85c38"));
  pins.push(pin(p2.x,p2.y,"DEST",`${i.dc}, ${i.ds}`,"#2f6f4e"));
  const stops = stopObjects(r).slice(0,5);
  stops.forEach((s,idx)=>{
    const coord = coordsFor(s.city.split(",")[0], (s.city.split(",")[1]||"").trim());
    let p = project(coord[0],coord[1]);
    if(!PLACE_COORDS[s.city]) {
      const t=(idx+1)/(stops.length+1);
      p={x:bezier(p1.x,c1.x,c2.x,p2.x,t), y:bezier(p1.y,c1.y,c2.y,p2.y,t)};
    }
    pins.push(`<circle cx="${p.x}" cy="${p.y}" r="8" fill="#e39a4b" stroke="#fff" stroke-width="3"/>`);
    pins.push(`<text x="${p.x+10}" y="${p.y+18}" class="pin-note">${s.city}</text>`);
  });
  $("routePins").innerHTML=pins.join("");
  $("mapsLink").href = `https://www.google.com/maps/dir/${encodeURIComponent(i.oc+", "+i.os)}/${encodeURIComponent(i.dc+", "+i.ds)}`;
  $("mapFacts").innerHTML = [
    ["Recommended mode",`${best.icon} ${best.label}`],
    ["Estimated route distance",`${Math.round(r.distance)} miles`],
    ["Main time estimates",`Drive ${fmtTime(r.driveHours)} • Fly ${fmtTime(r.flyHours)} • Train ${fmtTime(r.trainHours)} • Bus ${fmtTime(r.busHours)}`],
    ["Stops shown", stopObjects(r).slice(0,4).map(s=>s.city).join(" → ") || "Custom route planning stops"]
  ].map(([b,s])=>`<div><b>${b}</b><span>${s}</span></div>`).join("");
}

function renderStateDots(){
  if($("stateDots").dataset.done) return;
  const dots = Object.entries(STATE_COORDS).filter(([s])=>!["AK","HI"].includes(s)).map(([s,c])=>{
    const p=project(c[0],c[1]);
    return `<circle class="state-dot" cx="${p.x}" cy="${p.y}" r="3"/><text class="state-label" x="${p.x+4}" y="${p.y+4}">${s}</text>`;
  }).join("");
  $("stateDots").innerHTML=dots;
  $("stateDots").dataset.done="1";
}

function pin(x,y,top,bottom,color){
  return `<g><circle cx="${x}" cy="${y}" r="12" fill="${color}" stroke="#fff" stroke-width="4"/><text x="${x+16}" y="${y-7}" class="pin-label">${top}</text><text x="${x+16}" y="${y+10}" class="pin-note">${bottom}</text></g>`;
}

function project(lat,lon){
  // Albers-like hand-tuned projection for visual planning, not survey-grade GIS.
  return {x:120 + ((lon + 125) / 59) * 720, y:92 + ((50 - lat) / 26) * 360};
}
function bezier(a,b,c,d,t){return (1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t**2*c+t**3*d;}

function stopObjects(r){
  return r.routeStops || [];
}

function renderCompare(ranked,best){
  $("modeCards").innerHTML = ranked.map(x=>`
    <div class="mode-card ${x.mode===best.mode?"winner":""}">
      <div class="icon">${x.icon}</div>
      <h4>${x.label}</h4>
      <p><strong>Estimated cost:</strong> ${money(x.cost)}</p>
      <p><strong>Estimated time:</strong> ${x.mode==="bike"?`${x.days} days`:fmtTime(x.time)}</p>
      <p><strong>Score:</strong> ${x.score}</p>
      <p><strong>Feasibility:</strong> ${x.feasibility}</p>
      <p><strong>Budget:</strong> ${x.budgetFit}</p>
      <p>${x.notes}</p>
    </div>`).join("");
  const max = Math.max(...ranked.map(x=>x.cost));
  $("barChart").innerHTML = ranked.map(x=>`
    <div class="bar-row">
      <b>${x.icon} ${x.label}</b>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.max(8,x.cost/max*100)}%"></div></div>
      <span>${money(x.cost)}</span>
      <span>${x.mode==="bike"?`${x.days}d`:fmtTime(x.time)}</span>
    </div>`).join("");
}

function renderItinerary(i,r,best){
  $("itineraryMode").textContent = `${best.label} plan`;
  let rows = [];
  const stops = stopObjects(r);
  if(best.mode==="fly"){
    const first = destinationAttractions(i)[0];
    rows = [
      ["✈️",`Depart from ${i.oc}, ${i.os}`,"Arrive early, confirm baggage, and include airport parking/rideshare in the budget."],
      ["🧳",`Land near ${i.dc}, ${i.ds}`,"Do not use route sightseeing stops after flying. Focus on airport transfer, hotel check-in, and local transportation."],
      ["🏨",`Stay in ${destinationStayText(i)}`,"Choose lodging based on what you want to do first, not just the cheapest room."],
      ["📍",`First activity: ${first.place}`,`${first.where}. ${first.why}`]
    ];
  } else if(best.mode==="bike"){
    const daily = Math.min(i.bikeMiles, Math.ceil(r.distance/best.days));
    rows = [
      ["🚲",`Day 1: Leave ${i.oc}, ${i.os}`,`Target about ${daily} miles. Avoid night riding and confirm water stops.`],
      ["💧","Daily support rhythm","Stop every 15–25 miles for water, food, rest, phone battery, and route checks."],
      ["🏕️","Overnight strategy",`Use ${lodgingLabel(i.lodging)} near planned stop towns. Avoid remote lodging if arriving near dark.`],
      ["🛠️","Repair checkpoint","Identify at least one bike shop or transit backup near each major stop."],
      ["📍",`Arrive in ${i.dc}, ${i.ds}`,"Plan recovery time before major sightseeing."]
    ];
  } else if(best.mode==="train" || best.mode==="bus" || best.mode==="mixed"){
    rows = [
      [best.icon,`Depart from ${i.oc}, ${i.os}`,"Confirm station, departure time, baggage rules, food, and transfer requirements."],
      ["☕","Transfer or long break",stops[0]?`Use ${stops[0].city} as a possible food or transfer break if it appears on the route.`:"Use scheduled breaks for food and charging."],
      ["🚕",`Arrival transportation in ${i.dc}`,"Plan rideshare, public transit, walking distance, or bike rental from the station."],
      ["🏨",`Stay in ${destinationStayText(i)}`,"Choose lodging near transit or the first attraction."],
      ["📍","First local activity",`${destinationAttractions(i)[0].place}: ${destinationAttractions(i)[0].where}.`]
    ];
  } else {
    rows = [
      ["🚗",`Leave ${i.oc}, ${i.os}`,"Check live traffic, pack food/water, and schedule breaks before fatigue starts."],
      ["☕",stops[0]?`Stop 1: ${stops[0].place}`:"Stop 1: first route break",stops[0]?`${stops[0].where}. ${stops[0].why}`:"Use for food, fuel, restroom, and route check."],
      ["📍",stops[1]?`Sightseeing stop: ${stops[1].place}`:"Sightseeing stop",stops[1]?`${stops[1].where}. ${stops[1].why}`:"Pick one place that makes the road trip worthwhile."],
      ["🏨",`Overnight if needed`,r.stayZones[0]?`${r.stayZones[0].area}: ${r.stayZones[0].why}`:"Choose midpoint lodging near the route."],
      ["🏁",`Arrive in ${i.dc}, ${i.ds}`,`Check into lodging near ${destinationStayText(i)} and choose one simple first-night attraction.`]
    ];
  }
  $("timeline").innerHTML = rows.map(([icon,title,text])=>`
    <div class="timeline-item"><div class="timeline-icon">${icon}</div><div><h4>${title}</h4><p>${text}</p></div></div>`).join("");
}

function lodgingLabel(type){
  return type==="camping"?"campgrounds":type==="hostel"?"hostels or budget stays":type==="mixed"?"mixed low-cost lodging":"hotels or motels";
}

function renderStops(i,r,best){
  const stays = (r.stayZones || genericStayZones(i)).slice(0,5);
  $("stayList").innerHTML = stays.map(s=>`
    <div><b>${s.area}</b><span><strong>Where:</strong> ${s.where}<br><strong>Why stay here:</strong> ${s.why}<br><strong>Best for:</strong> ${s.bestFor}</span></div>`).join("");
  let stops = stopObjects(r).slice(0,6);
  if(best.mode==="fly"){
    stops = destinationAttractions(i).slice(0,4).map(a=>({
      city:`${i.dc}, ${i.ds}`, place:a.place, where:a.where, why:`After landing: ${a.why}`, bestFor:"fly arrival"
    }));
  }
  $("stopList").innerHTML = stops.map(s=>`
    <div><b>${s.place}</b><span><strong>Where:</strong> ${s.where}<br><strong>City:</strong> ${s.city}<br><strong>Why stop:</strong> ${s.why}<br><span class="badge">${s.bestFor}</span></span></div>`).join("");

  $("supportGrid").innerHTML = supportPlan(i,r,best).map(([b,s])=>`<div><b>${b}</b><span>${s}</span></div>`).join("");
}

function supportPlan(i,r,best){
  const common = [
    ["Budget buffer","Keep 10–15% of your budget unused for delays, meals, transit, or last-minute lodging."],
    ["Weather check","Check weather before departure and before each major travel segment."],
    ["Emergency backup","Share location with someone, carry a charger, and know your backup transit option."]
  ];
  if(best.mode==="fly") return [
    ["Airport transfer","Plan how you get from the airport to lodging before you book. This can change the real cost."],
    ["Arrival neighborhood",`For this plan, focus stays around ${destinationStayText(i)}.`],
    ["First-day pace","After flying, plan one attraction near lodging instead of trying to cover the whole destination."],
    ...common
  ];
  if(best.mode==="bike") return [
    ["Water + food","Plan water/food every 15–25 miles. Do not rely on random stops in rural sections."],
    ["Repair support","Carry tube, pump, multi-tool, lights, lock, and identify bike shops or transit backups."],
    ["Safe lodging","Avoid arriving after dark. Choose lodging near populated areas or established campgrounds."],
    ...common
  ];
  if(best.mode==="drive") return [
    ["Fatigue control","For drives over 10–12 hours, schedule an overnight or long rest stop."],
    ["Fuel + food","Group fuel, food, and restroom breaks every 2–3 hours."],
    ["Scenic stop","Add one famous stop so the route is part of the trip, not wasted time."],
    ...common
  ];
  return [
    ["Station safety","Avoid late-night arrivals without confirmed transportation and lodging."],
    ["Transfer buffer","Leave extra time for bus/train delays and missed connections."],
    ["Last-mile plan","Know how you will get from station to hotel: walk, rideshare, local transit, or bike rental."],
    ...common
  ];
}

function renderExplore(i,r,best){
  const dest = destinationAttractions(i);
  let items, scope;
  if(best.mode==="fly"){
    items = dest;
    scope = "Destination only after landing";
    $("exploreTitle").textContent = `What to see after landing in ${i.dc}, ${i.ds}`;
  } else {
    const routeItems = stopObjects(r).slice(0,4).map(s=>({place:s.place, where:s.where, why:`Route stop in ${s.city}: ${s.why}`}));
    items = [...routeItems, ...dest].slice(0,9);
    scope = r.curated ? "Route + destination" : "Destination + planning categories";
    $("exploreTitle").textContent = `What to see along the route and in ${i.dc}, ${i.ds}`;
  }
  $("exploreScope").textContent = scope;
  $("exploreGrid").innerHTML = items.map(a=>`
    <div><b>${a.place}</b><span><strong>Where:</strong> ${a.where}<br><strong>Why go:</strong> ${a.why}</span></div>`).join("");
}

function renderPrep(i,r,best){
  let items = [
    ["Documents","ID, tickets, lodging confirmation, payment card, emergency contact, and insurance/medical info."],
    ["Navigation","Use offline maps, Google Maps live routing, and save lodging/station/airport addresses."],
    ["Power","Bring a portable charger and charging cables. Keep phone battery available for navigation."],
    ["Budget","Track ticket, lodging, food, transfer, parking, bags, fuel, and emergency costs."],
    ["Weather","Check weather for departure, route stops, and destination."],
    ["Backup","Have a backup mode or backup overnight plan if the main plan fails."]
  ];
  if(best.mode==="bike") items.push(
    ["Bike gear","Helmet, lights, reflective clothing, lock, tube, pump, multi-tool, water bottles, repair plan."],
    ["Bike safety","Avoid night riding, confirm shoulders/bike lanes, and do not overestimate daily mileage."]
  );
  if(best.mode==="fly") items.push(
    ["Airport details","Baggage limits, rideshare/rental car, parking, TSA timing, and arrival transport."],
    ["Arrival focus","Do destination attractions only; route stops do not matter after flying."]
  );
  if(best.mode==="drive") items.push(
    ["Road trip kit","Snacks, water, first aid, tire pressure check, emergency kit, and fatigue breaks."],
    ["Overnight trigger","If route is over 10–12 hours, plan a stay instead of pushing through."]
  );
  if(best.mode==="train" || best.mode==="bus" || best.mode==="mixed") items.push(
    ["Transit details","Station location, transfer time, baggage rules, food options, and late arrival safety."],
    ["Last-mile connection","Plan local transit, rideshare, or walking route from the station."]
  );
  $("prepGrid").innerHTML = items.map(([b,s])=>`<div><b>${b}</b><span>${s}</span></div>`).join("");
}

document.addEventListener("DOMContentLoaded", init);
