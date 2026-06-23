const $ = (id) => document.getElementById(id);

function money(value) {
  return `$${Math.round(value).toLocaleString()}`;
}

function number(id) {
  return Number($(id).value || 0);
}

function calculateTrip() {
  const travelers = number('travelers');
  const distance = number('distance');
  const mpg = number('mpg');
  const fuel = number('fuel');
  const hotelNights = number('hotelNights');
  const hotelCost = number('hotelCost');
  const airfare = number('airfare');
  const baggage = number('baggage');
  const parking = number('parking');
  const rental = number('rental');

  const tolls = distance > 600 ? 55 : 25;
  const food = travelers * Math.ceil(distance / 500) * 30;
  const vehicleWear = distance * 0.11;
  const gas = (distance / Math.max(mpg, 1)) * fuel;
  const driveHotel = hotelNights * hotelCost;
  const driveTotal = gas + tolls + food + vehicleWear + driveHotel;

  const rideShare = 70;
  const flyTotal = (airfare * travelers) + (baggage * travelers) + parking + rental + rideShare;

  const driveHours = Math.ceil(distance / 63);
  const flyHours = 6;

  const costWeight = number('costWeight');
  const speedWeight = number('speedWeight');
  const flexWeight = number('flexWeight');

  // Lower score is better. Cost and time are normalized to avoid one factor dominating.
  const driveScore = (driveTotal / 100) * costWeight + driveHours * speedWeight - (8 * flexWeight);
  const flyScore = (flyTotal / 100) * costWeight + flyHours * speedWeight - (4 * flexWeight);

  const recommendDrive = driveScore <= flyScore;
  const mode = recommendDrive ? 'DRIVE' : 'FLY';
  const savings = Math.abs(driveTotal - flyTotal);
  const timeDiff = Math.abs(driveHours - flyHours);

  $('bestMode').textContent = mode;
  $('headline').textContent = recommendDrive ? 'Driving is recommended' : 'Flying is recommended';
  $('reason').textContent = recommendDrive
    ? `Driving saves about ${money(savings)} and gives more flexibility, but flying saves about ${timeDiff} hours.`
    : `Flying saves about ${timeDiff} hours. Driving may still be cheaper by ${money(savings)}, depending on preference weighting.`;

  const pill = document.querySelector('.pill');
  pill.textContent = mode;
  pill.className = `pill ${recommendDrive ? 'drive' : 'fly'}`;

  $('driveCost').textContent = money(driveTotal);
  $('flyCost').textContent = money(flyTotal);
  $('driveTime').textContent = `${driveHours}h`;
  $('flyTime').textContent = `${flyHours}h`;

  $('driveBreakdown').innerHTML = [
    ['Gas', gas], ['Tolls', tolls], ['Food', food], ['Hotel', driveHotel], ['Vehicle wear', vehicleWear], ['Total', driveTotal]
  ].map(([label, value]) => `<li><span>${label}</span><strong>${money(value)}</strong></li>`).join('');

  $('flyBreakdown').innerHTML = [
    ['Airfare', airfare * travelers], ['Baggage', baggage * travelers], ['Airport parking', parking], ['Rental car', rental], ['Rideshare', rideShare], ['Total', flyTotal]
  ].map(([label, value]) => `<li><span>${label}</span><strong>${money(value)}</strong></li>`).join('');
}

$('calculateBtn').addEventListener('click', calculateTrip);
document.querySelectorAll('input').forEach(i => i.addEventListener('input', calculateTrip));
calculateTrip();
