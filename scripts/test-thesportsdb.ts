import https from 'https'

function fetchApi(endpoint: string) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'www.thesportsdb.com',
      path: endpoint,
      method: 'GET'
    }, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(JSON.parse(data)))
    })
    req.on('error', reject)
    req.end()
  })
}

async function main() {
  const f = await fetchApi(`/api/v1/json/3/eventslast.php?id=133613`) as any; // Man City
  console.log(`Man City last 5 matches:`);
  if (f.results) {
      f.results.slice(0, 5).forEach((m: any) => {
          console.log(`${m.strHomeTeam} vs ${m.strAwayTeam} on ${m.dateEvent}`);
      });
  }
}

main().catch(console.error)
