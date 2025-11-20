export function sortearPremio() {
  return {
    numero: Math.floor(Math.random() * 100000),
    data: new Date().toISOString()
  };
}
