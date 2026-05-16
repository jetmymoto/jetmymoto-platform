function slugifyBrand(b) { return String(b||"").toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }
function slugifyModel(m) { 
  let s = String(m||"").toLowerCase();
  // Remove spaces between letters, numbers, and common suffixes (like gs, rt, r, xr, rr)
  // "r 1300 gs" -> "r1300gs"
  s = s.replace(/^([a-z])\s+(\d+)\s+([a-z]+)/, "$1$2$3");
  // "f 900 gs adventure" -> "f900gs adventure" -> "f900gs-adventure"
  s = s.replace(/^([a-z]+)\s+(\d+)\s+([a-z]+)/, "$1$2$3");
  s = s.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return s;
}
console.log(slugifyModel("R 1300 GS"));
console.log(slugifyModel("F 900 GS Adventure"));
console.log(slugifyModel("Multistrada V4"));
console.log(slugifyModel("Africa Twin 1100"));
