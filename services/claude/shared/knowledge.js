// Reviewed content and exact transformations, shared by the game and private service.
// AI chooses a board from these facts; it cannot invent or silently substitute answers.
const fact = (id, category, words, explanation, clue) => ({ id, category, words: words.split('|'), explanation, clue });
const blank = (id, category, words, fixedText, explanation, clue) => ({ ...fact(id, category, words, explanation, clue), rule: 'fill-blank', fixedText });
const S = {
  presidents: { title: 'Presidential biographies', url: 'https://www.whitehousehistory.org/collections/president-biographies' },
  rushmore: { title: 'Mount Rushmore: the four presidents', url: 'https://www.nps.gov/moru/learn/historyculture/why-these-four-presidents.htm' },
  water: { title: 'USGS Water Science School', url: 'https://www.usgs.gov/water-science-school/science/water-science-glossary' },
  lakes: { title: 'NOAA: the five Great Lakes', url: 'https://oceanservice.noaa.gov/facts/great-lakes.html' },
  units: { title: 'BIPM: SI base units', url: 'https://www.bipm.org/en/measurement-units/si-base-units' },
  rights: { title: 'National Archives: the Bill of Rights', url: 'https://www.archives.gov/founding-docs/bill-of-rights-transcript' },
  planets: { title: 'NASA: planets', url: 'https://science.nasa.gov/solar-system/planets/' },
  geography: { title: 'National Geographic: geography resources', url: 'https://education.nationalgeographic.org/resource/geography/' },
  states: { title: 'U.S. Census Bureau: states', url: 'https://www.census.gov/library/reference/code-lists/ansi.html' },
};
export const knowledgePacks = [
  { id: 'world', name: 'World Geography', summary: 'Countries, capitals, oceans—and words hiding on the map.', sources: [S.geography], groups: [
    fact('capitals', 'European capital cities', 'PARIS|ROME|OSLO|VIENNA', 'These are the capitals of France, Italy, Norway, and Austria, respectively.', 'Think of seats of national government in Europe.'),
    fact('islands', 'Island countries in the Caribbean', 'CUBA|JAMAICA|BARBADOS|GRENADA', 'Cuba, Jamaica, Barbados and Grenada are independent island countries in the Caribbean.', 'Look toward the Caribbean Sea.'),
    fact('ranges', 'Mountain ranges', 'ANDES|ALPS|HIMALAYAS|PYRENEES', 'The Andes are in South America, the Himalayas in Asia, and the Alps and Pyrenees in Europe.', 'Think of chains of high peaks.'),
    blank('land', 'Country names ending in ___LAND', 'ICE|IRE|FIN|THAI', '___LAND', 'Add “land” after each tile: Iceland, Ireland, Finland and Thailand.', 'A common ending turns these into countries.'),
    blank('oceans', '___ Ocean', 'PACIFIC|ATLANTIC|INDIAN|ARCTIC', '___ Ocean', 'Add “Ocean” after each tile: Pacific Ocean, Atlantic Ocean, Indian Ocean and Arctic Ocean.', 'Each completes the name of an ocean.'),
    { ...fact('country-halves', 'Map names beginning with New ___', 'ZEALAND|CALEDONIA|GUINEA|BRITAIN', 'Put “New” before each tile: New Zealand, New Caledonia, New Guinea and New Britain.', 'One word begins all four geographical names.'), rule: 'last-word', sourceWords: ['NEW ZEALAND','NEW CALEDONIA','NEW GUINEA','NEW BRITAIN'] },
    blank('south', 'South ___ on the world map', 'AFRICA|KOREA|SUDAN|AMERICA', 'South ___', 'Put “South” before each tile: South Africa, South Korea, South Sudan and South America.', 'One direction completes four familiar place names.'),
  ] },
  { id: 'usa', name: 'U.S. Geography', summary: 'States, lakes, capitals, and a few unexpected turns.', sources: [S.states, S.lakes], groups: [
    fact('lakes', 'Great Lakes', 'SUPERIOR|MICHIGAN|HURON|ERIE', 'These lakes belong to the Great Lakes system along the U.S.–Canada border.', 'Think of a connected freshwater system along the U.S.–Canada border.'),
    fact('capitals', 'U.S. state capitals', 'BOISE|SALEM|ALBANY|AUSTIN', 'Boise is Idaho’s capital, Salem is Oregon’s, Albany is New York’s, and Austin is Texas’s.', 'These cities govern their states.'),
    fact('parks', 'U.S. national parks', 'YOSEMITE|YELLOWSTONE|ACADIA|ZION', 'Yosemite is in California; Yellowstone spans Wyoming, Montana and Idaho; Acadia is in Maine; Zion is in Utah.', 'Protected landscapes, from granite cliffs to desert canyons.'),
    blank('new', 'U.S. states: New ___', 'YORK|JERSEY|MEXICO|HAMPSHIRE', 'New ___', 'Put “New” before each tile: New York, New Jersey, New Mexico and New Hampshire.', 'One three-letter word starts all four state names.'),
    fact('codes', 'U.S. postal abbreviations that are also words', 'ME|IN|OR|HI', 'ME stands for Maine, IN for Indiana, OR for Oregon and HI for Hawaii. Each state code also spells an everyday word.', 'Read these as two-letter state codes.'),
    fact('deserts', 'Deserts extending into the United States', 'MOJAVE|SONORAN|CHIHUAHUAN|GREAT BASIN', 'These are the four major North American deserts extending into the U.S. The Sonoran and Chihuahuan also extend into Mexico.', 'Think of dry regions of western North America.'),
  ] },
  { id: 'presidents', name: 'Presidents & Civics', summary: 'Historic presidents and the language of government.', sources: [S.presidents, S.rushmore, S.rights], groups: [
    fact('rushmore', 'Presidents on Mount Rushmore', 'WASHINGTON|JEFFERSON|LINCOLN|THEODORE ROOSEVELT', 'Mount Rushmore depicts George Washington, Thomas Jefferson, Abraham Lincoln and Theodore Roosevelt.', 'Think of four faces carved into a mountain.'),
    fact('offices', 'Executive-branch Cabinet department heads', 'ATTORNEY GENERAL|SECRETARY OF STATE|SECRETARY OF DEFENSE|TREASURY SECRETARY', 'The attorney general leads the Justice Department; the other three roles lead the State, Defense and Treasury departments.', 'These officials lead Cabinet departments.'),
    fact('amendments', 'Freedoms in the First Amendment', 'SPEECH|RELIGION|PRESS|ASSEMBLY', 'The First Amendment protects freedom of speech, religion and the press, as well as peaceful assembly.', 'Think of the opening amendment to the Bill of Rights.'),
    blank('white', 'White ___', 'HOUSE|PAPER|FLAG|BOARD', 'White ___', 'Put “white” before each tile: White House, white paper, white flag and whiteboard.', 'One color completes every phrase; spacing may change.'),
    blank('bill', '___ bill', 'DOLLAR|SENATE|UTILITY|RESTAURANT', '___ bill', 'A dollar bill is money; a Senate bill is proposed legislation; utility and restaurant bills request payment. BILL has more than one meaning.', 'One word can mean money, legislation, or an amount owed.'),
    { ...fact('civic-halves', 'U.S. legal terms: ___ court', 'SUPREME|FEDERAL|DISTRICT|APPEALS', 'Add “court” after each tile: supreme court, federal court, district court and appeals court.', 'One shared word completes four legal phrases.'), rule: 'first-word', sourceWords: ['SUPREME COURT','FEDERAL COURT','DISTRICT COURT','APPEALS COURT'] },
    fact('early', 'The first four U.S. presidents', 'GEORGE WASHINGTON|JOHN ADAMS|THOMAS JEFFERSON|JAMES MADISON', 'Washington, Adams, Jefferson and Madison served as the first, second, third and fourth U.S. presidents, respectively.', 'Start at the beginning of the presidency.'),
  ] },
  { id: 'rivers', name: 'Rivers & Waterways', summary: 'Follow rivers across continents and learn how water moves.', sources: [S.water, S.geography], groups: [
    fact('africa', 'Rivers in Africa', 'NILE|CONGO|NIGER|ZAMBEZI', 'These rivers flow in Africa. The Nile reaches the Mediterranean; the Congo and Niger reach the Atlantic; the Zambezi reaches the Indian Ocean.', 'Follow these waterways across Africa.'),
    fact('europe', 'Rivers in Europe', 'DANUBE|RHINE|SEINE|THAMES', 'The Danube reaches the Black Sea; the Rhine the North Sea; the Seine the English Channel; and the Thames the North Sea.', 'These waterways pass through or alongside European cities.'),
    fact('features', 'Parts of a river', 'BANK|BED|MOUTH|SOURCE', 'A river begins at its source, flows over its bed between banks, and ends at its mouth.', 'These ordinary words also describe a river.'),
    blank('water', '___water', 'RAIN|FRESH|GROUND|SALT', '___water', 'Add “water” after each tile: rainwater, freshwater, groundwater and saltwater.', 'A common ending makes four kinds or sources of water.'),
    fact('cycle', 'Water-cycle processes', 'EVAPORATION|CONDENSATION|PRECIPITATION|INFILTRATION', 'Water evaporates into vapor, condenses into droplets, falls as precipitation, and enters soil through infiltration.', 'Think of water moving through air and ground.'),
    fact('boats', 'Small watercraft', 'CANOE|KAYAK|RAFT|GONDOLA', 'Canoes, kayaks, rafts and gondolas are small craft used to travel on water.', 'Think of ways to travel on water.'),
  ] },
  { id: 'science', name: 'Space & Science', summary: 'Planets, measurement, matter, and a little word science.', sources: [S.planets, S.units, S.water], groups: [
    fact('rocky', 'The four rocky planets of our solar system', 'MERCURY|VENUS|EARTH|MARS', 'Mercury, Venus, Earth and Mars are the four planets closest to the Sun, each with a solid, rocky surface.', 'Think of planets with solid, rocky surfaces.'),
    fact('units', 'SI base units', 'METRE|SECOND|KILOGRAM|KELVIN', 'The metre measures length, the second measures time, the kilogram measures mass, and the kelvin measures thermodynamic temperature.', 'These are fundamental measurement units.'),
    fact('matter', 'Familiar states of matter', 'SOLID|LIQUID|GAS|PLASMA', 'Solids hold their shape; liquids flow with a fixed volume; gases expand to fill their container; plasma contains charged particles.', 'Think of forms that matter can take.'),
    blank('sphere', 'Earth-system words ending in ___sphere', 'ATMO|HYDRO|BIO|LITHO', '___sphere', 'Add “sphere”: atmosphere, hydrosphere, biosphere and lithosphere—air, water, life and the rigid outer Earth, respectively.', 'These word parts share a scientific ending.'),
    fact('gases', 'Noble-gas elements', 'HELIUM|NEON|ARGON|KRYPTON', 'Helium, neon, argon and krypton belong to group 18 of the periodic table, the noble gases.', 'Look for elements in the same periodic-table family.'),
    blank('micro', 'Micro___', 'SCOPE|WAVE|CHIP|PHONE', 'Micro___', 'Put “micro” before each tile: microscope, microwave, microchip and microphone.', 'One prefix completes four technology words.'),
  ] },
  { id: 'general', name: 'General Knowledge', summary: 'A little of everything, with the widest mix of wordplay.', sources: [S.planets, S.geography], groups: [
    fact('instruments', 'Orchestral string instruments', 'VIOLIN|VIOLA|CELLO|DOUBLE BASS', 'Violin, viola, cello and double bass form the orchestral string section, from higher to lower pitch.', 'Think of the orchestral string section.'),
    fact('chess', 'Chess pieces', 'KING|QUEEN|ROOK|BISHOP', 'The king moves one square in any direction. Queens move along rows, columns or diagonals; rooks along rows or columns; bishops along diagonals.', 'Think of pieces on a chessboard.'),
    fact('shapes', 'Polygons with 3, 4, 5, and 6 sides', 'TRIANGLE|QUADRILATERAL|PENTAGON|HEXAGON', 'A triangle has three sides, a quadrilateral four, a pentagon five and a hexagon six.', 'Count the sides, from three through six.'),
    blank('house', '___house', 'BRICK|GREEN|FARM|TREE', '___house', 'Add “house” after each tile: brick house, greenhouse, farmhouse and treehouse.', 'One familiar building word completes all four.'),
    { ...fact('animals-drop', 'Animals, minus their first letter', 'EAR|OAR|INK|OX', 'Restore the missing first letters: ear → bear, oar → boar, ink → mink and ox → fox. Each becomes an animal.', 'Restore one letter at the beginning of each word.'), rule: 'drop-first', sourceWords: ['BEAR','BOAR','MINK','FOX'] },
    { ...fact('animals-anagram', 'Animals with their letters rearranged', 'BARE|SALE|LOIN|FLOW', 'Rearrange each tile into an animal: bare → bear, sale → seal, loin → lion and flow → wolf.', 'Rearrange the letters to find four animals.'), rule: 'anagram', sourceWords: ['BEAR','SEAL','LION','WOLF'] },
    { ...fact('desserts', 'Desserts: ___ pie', 'APPLE|CHERRY|PECAN|PUMPKIN', 'Add “pie” after each tile: apple pie, cherry pie, pecan pie and pumpkin pie.', 'One shared word completes four familiar desserts.'), rule: 'first-word', sourceWords: ['APPLE PIE','CHERRY PIE','PECAN PIE','PUMPKIN PIE'] },
  ] },
];
// Explicitly varied starter boards, not an AI fallback.
const starters = { world: ['capitals','islands','ranges','land'], usa: ['lakes','capitals','parks','new'], presidents: ['rushmore','amendments','white','bill'], rivers: ['africa','europe','features','water'], science: ['rocky','units','matter','sphere'], general: ['instruments','shapes','house','animals-drop'] };
const normalize = value => value.normalize('NFC').toUpperCase().replace(/[^\p{L}\p{N}]/gu, '');
export function packById(id) {
  const pack = knowledgePacks.find(p => p.id === id);
  if (!pack) throw new Error('Choose an available knowledge pack.');
  return pack;
}
export function packVariants(id) {
  return packById(id).groups.map(g => ({ ...g, rule: g.rule || 'literal', sourceWords: g.sourceWords || (g.fixedText ? g.words.map(w => g.fixedText.replace('___', w).toUpperCase()) : g.words) }));
}
export function knowledgeBoard(id, choices = starters[id]) {
  const pack = packById(id), variants = packVariants(id);
  if (!Array.isArray(choices) || choices.length !== 4 || new Set(choices).size !== 4) throw new Error('A knowledge board needs four different connections.');
  if (id === 'presidents' && choices.includes('early') && choices.includes('rushmore')) throw new Error('These two president groups refer to some of the same people.');
  const groups = choices.map(choice => {
    const g = variants.find(v => v.id === choice);
    if (!g) throw new Error('The AI selected an unreviewed connection.');
    const sources = g.sourceWords;
    if (['first-word','last-word'].includes(g.rule) && new Set(sources.map(source => normalize(source.split(' ')[g.rule === 'first-word' ? 1 : 0] || ''))).size !== 1) throw new Error('Unrelated missing words are not a connection.');
    for (let i = 0; i < 4; i++) {
      const tile = normalize(g.words[i]), source = normalize(sources[i]);
      if (g.rule === 'fill-blank' && (g.fixedText.split('___').length !== 2 || normalize(g.fixedText.replace('___', g.words[i])) !== source)) throw new Error('Invalid shared phrase.');
      if (g.rule === 'drop-first' && source.slice(1) !== tile) throw new Error('Invalid letter removal.');
      if (g.rule === 'anagram' && [...source].sort().join('') !== [...tile].sort().join('')) throw new Error('Invalid anagram.');
      if (g.rule === 'last-word' && (sources[i].split(' ').length !== 2 || normalize(sources[i].split(' ')[1]) !== tile)) throw new Error('Invalid missing word.');
      if (g.rule === 'first-word' && (sources[i].split(' ').length !== 2 || normalize(sources[i].split(' ')[0]) !== tile)) throw new Error('Invalid missing word.');
    }
    return { id: `${id}:${g.id}`, category: g.category, words: [...g.words], explanation: g.explanation, clue: g.clue, rule: g.rule, ...(g.rule !== 'literal' ? { sourceWords: [...sources] } : {}) };
  });
  const tiles = groups.flatMap(g => g.words.map(normalize));
  if (new Set(tiles).size !== 16 || groups.some(g => g.words.length !== 4 || g.words.some(w => w.length > 24))) throw new Error('This combination repeats a tile or exceeds the tile length.');
  // Reject extra literal answers to any selected literal category from its reviewed inventory.
  for (const group of groups.filter(g => g.rule === 'literal')) {
    const inventory = new Set(variants.find(v => `${id}:${v.id}` === group.id).sourceWords.map(normalize));
    if (groups.filter(g => g.id !== group.id).some(g => g.words.some(w => inventory.has(normalize(w))))) throw new Error('This combination has competing answers.');
  }
  return { id: `pack-${id}-${choices.join('-')}`, title: `${pack.name}: find the thread`, topic: pack.name, description: 'Four connections to discover. Some use facts; others play with the words themselves.', groups };
}
