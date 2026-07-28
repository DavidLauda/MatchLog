const API_KEY = "dfe2bc3b5fa8a1f96f8925f5a00719ff";
const API_HOST = "v3.football.api-sports.io";

async function fetchApi(endpoint, params = {}) {
  const url = new URL(`https://${API_HOST}/${endpoint}`);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  const response = await fetch(url.toString(), {
    headers: {
      'x-apisports-key': API_KEY,
    }
  });
  
  const data = await response.json();
  console.log(JSON.stringify(data.errors, null, 2));
  console.log("Total results:", data.results);
}

fetchApi('fixtures', { date: '2023-05-15', league: '39', season: '2022' });
