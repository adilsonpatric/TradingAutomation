async function test() {
  try {
    const r1 = await fetch('http://localhost:3000/api/journal/trades', { method: 'POST' });
    console.log("3000 status:", r1.status);
  } catch(e) { console.log("3000 err", e.message); }
  
  try {
    const r2 = await fetch('http://localhost:3001/api/journal/trades', { method: 'POST' });
    console.log("3001 status:", r2.status);
  } catch(e) { console.log("3001 err", e.message); }
}
test();
