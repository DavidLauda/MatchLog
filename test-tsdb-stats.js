

async function run() {
  const eventId = "2279771";
  console.log('Event ID:', eventId);

  // Get lineups
  let res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/lookuplineup.php?id=${eventId}`);
  let data = await res.json();
  console.log('Lineups length:', data.lineup ? data.lineup.length : 0);
}

run();
