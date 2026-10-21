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
    fact('islands', 'Island countries in the Caribbean', 'CUBA|JAMAICA|BARBADOS|GRENADA', 'These are four independent island countries in the Caribbean; the region has many more.', 'Look toward the Caribbean Sea.'),
    fact('ranges', 'Mountain ranges', 'ANDES|ALPS|HIMALAYAS|PYRENEES', 'The Andes are in South America, the Himalayas in Asia, and the Alps and Pyrenees in Europe.', 'Think of chains of high peaks.'),
    blank('land', 'Country names ending in ___LAND', 'ICE|IRE|FIN|THAI', '___LAND', 'Add LAND to make ICELAND, IRELAND, FINLAND, and THAILAND. These tiles are only parts of the country names.', 'A common ending turns these into countries.'),
    blank('oceans', '___ Ocean', 'PACIFIC|ATLANTIC|INDIAN|ARCTIC', '___ Ocean', 'Complete Pacific Ocean, Atlantic Ocean, Indian Ocean, and Arctic Ocean. These are four of the five named oceans; the Southern Ocean is the fifth.', 'Each completes the name of an ocean.'),
    { ...fact('country-halves', 'Country names missing their first word', 'ZEALAND|RICA|LANKA|FASO', 'Complete NEW ZEALAND, COSTA RICA, SRI LANKA, and BURKINA FASO. All four are country names with the first word removed.', 'Each tile finishes a two-word country name.'), rule: 'last-word', sourceWords: ['NEW ZEALAND','COSTA RICA','SRI LANKA','BURKINA FASO'] },
    blank('south', 'South ___ on the world map', 'AFRICA|KOREA|SUDAN|AMERICA', 'South ___', 'South Africa, South Korea, and South Sudan are countries. South America is a continent. SOUTH completes all four names.', 'One direction completes four familiar place names.'),
  ] },
  { id: 'usa', name: 'U.S. Geography', summary: 'States, lakes, capitals, and a few unexpected turns.', sources: [S.states, S.lakes], groups: [
    fact('lakes', 'Four of the five Great Lakes', 'SUPERIOR|MICHIGAN|HURON|ERIE', 'These are four Great Lakes. Ontario is the fifth; this board does not list the complete set.', 'Think of a connected freshwater system along the U.S.–Canada border.'),
    fact('capitals', 'U.S. state capitals', 'BOISE|SALEM|ALBANY|AUSTIN', 'Boise is Idaho’s capital, Salem is Oregon’s, Albany is New York’s, and Austin is Texas’s.', 'These cities govern their states.'),
    fact('parks', 'U.S. national parks', 'YOSEMITE|YELLOWSTONE|ACADIA|ZION', 'These national parks are in California; Wyoming, Montana and Idaho; Maine; and Utah, respectively.', 'Protected landscapes, from granite cliffs to desert canyons.'),
    blank('new', 'U.S. states: New ___', 'YORK|JERSEY|MEXICO|HAMPSHIRE', 'New ___', 'Add NEW to get New York, New Jersey, New Mexico, and New Hampshire—the four U.S. states whose names begin with New.', 'One three-letter word starts all four state names.'),
    fact('codes', 'U.S. postal abbreviations that are also words', 'ME|IN|OR|HI', 'ME means Maine, IN Indiana, OR Oregon, and HI Hawaii. Each of these four abbreviations is also an English word; many other state codes are not words.', 'Read these as two-letter state codes.'),
    fact('deserts', 'Deserts extending into the United States', 'MOJAVE|SONORAN|CHIHUAHUAN|GREAT BASIN', 'These are the four major North American deserts extending into the U.S. The Sonoran and Chihuahuan also extend into Mexico.', 'Think of dry regions of western North America.'),
  ] },
  { id: 'presidents', name: 'Presidents & Civics', summary: 'Historic presidents and the language of government.', sources: [S.presidents, S.rushmore, S.rights], groups: [
    fact('rushmore', 'Presidents on Mount Rushmore', 'WASHINGTON|JEFFERSON|LINCOLN|THEODORE ROOSEVELT', 'Mount Rushmore depicts George Washington, Thomas Jefferson, Abraham Lincoln, and Theodore Roosevelt—not Franklin Roosevelt.', 'Think of four faces carved into a mountain.'),
    fact('offices', 'Executive-branch Cabinet department heads', 'ATTORNEY GENERAL|SECRETARY OF STATE|SECRETARY OF DEFENSE|TREASURY SECRETARY', 'These four roles lead the Justice, State, Defense, and Treasury departments. There are other Cabinet departments too; the formal Treasury title is Secretary of the Treasury.', 'These officials lead Cabinet departments.'),
    fact('amendments', 'Freedoms in the First Amendment', 'SPEECH|RELIGION|PRESS|ASSEMBLY', 'The First Amendment protects these freedoms, along with the right to petition. These four do not exhaust its protections.', 'Think of the opening amendment to the Bill of Rights.'),
    blank('white', 'White ___', 'HOUSE|PAPER|FLAG|BOARD', 'White ___', 'WHITE makes WHITE HOUSE, WHITE PAPER, WHITE FLAG, and WHITEBOARD. A white paper is an explanatory report; the other phrases name a residence, a signal, and a writing surface.', 'One color completes every phrase; spacing may change.'),
    blank('bill', '___ bill', 'DOLLAR|SENATE|UTILITY|RESTAURANT', '___ bill', 'A dollar bill is money; a Senate bill is proposed legislation; utility and restaurant bills request payment. BILL has more than one meaning.', 'One word can mean money, legislation, or an amount owed.'),
    { ...fact('civic-halves', 'Civics phrases missing their first word', 'ORDER|COLLEGE|SERVICE|COURT', 'Complete EXECUTIVE ORDER, ELECTORAL COLLEGE, SECRET SERVICE, and SUPREME COURT. Each tile is the last word of a two-word civics phrase.', 'Restore the first word of four familiar civics terms.'), rule: 'last-word', sourceWords: ['EXECUTIVE ORDER','ELECTORAL COLLEGE','SECRET SERVICE','SUPREME COURT'] },
    fact('early', 'The first four U.S. presidents', 'GEORGE WASHINGTON|JOHN ADAMS|THOMAS JEFFERSON|JAMES MADISON', 'In order: Washington, Adams, Jefferson, and Madison. Presidential surnames alone can be ambiguous, so these tiles use full names.', 'Start at the beginning of the presidency.'),
  ] },
  { id: 'rivers', name: 'Rivers & Waterways', summary: 'Follow rivers across continents and learn how water moves.', sources: [S.water, S.geography], groups: [
    fact('africa', 'Rivers in Africa', 'NILE|CONGO|NIGER|ZAMBEZI', 'These rivers flow in Africa. The Nile reaches the Mediterranean; the Congo and Niger reach the Atlantic; the Zambezi reaches the Indian Ocean.', 'Follow these waterways across Africa.'),
    fact('europe', 'Rivers in Europe', 'DANUBE|RHINE|SEINE|THAMES', 'The Danube reaches the Black Sea; the Rhine the North Sea; the Seine the English Channel; and the Thames the North Sea.', 'These waterways pass through or alongside European cities.'),
    fact('features', 'Parts of a river', 'BANK|BED|MOUTH|SOURCE', 'A river begins at its source, flows over its bed between banks, and ends at its mouth. Mouth and bed also have everyday meanings.', 'These ordinary words also describe a river.'),
    blank('water', '___water', 'RAIN|FRESH|GROUND|SALT', '___water', 'Complete RAINWATER, FRESHWATER, GROUNDWATER, and SALTWATER. The shared ending is WATER.', 'A common ending makes four kinds or sources of water.'),
    fact('cycle', 'Water-cycle processes', 'EVAPORATION|CONDENSATION|PRECIPITATION|INFILTRATION', 'Water can evaporate, condense into droplets, fall as precipitation, and infiltrate soil. These are four processes in a larger cycle.', 'Think of water moving through air and ground.'),
    fact('boats', 'Small watercraft', 'CANOE|KAYAK|RAFT|GONDOLA', 'These are types of watercraft. A gondola here is the boat associated with Venice, rather than a cable-car cabin.', 'Think of ways to travel on water.'),
  ] },
  { id: 'science', name: 'Space & Science', summary: 'Planets, measurement, matter, and a little word science.', sources: [S.planets, S.units, S.water], groups: [
    fact('rocky', 'The four rocky planets of our solar system', 'MERCURY|VENUS|EARTH|MARS', 'These are the four inner, terrestrial planets. Jupiter and Saturn are gas giants; Uranus and Neptune are ice giants.', 'Think of planets with solid, rocky surfaces.'),
    fact('units', 'SI base units', 'METRE|SECOND|KILOGRAM|KELVIN', 'These measure length, time, mass, and thermodynamic temperature, respectively. They are four of the seven SI base units.', 'These are fundamental measurement units.'),
    fact('matter', 'Familiar states of matter', 'SOLID|LIQUID|GAS|PLASMA', 'These are four familiar states of matter. Plasma contains charged particles; the list is not exhaustive.', 'Think of forms that matter can take.'),
    blank('sphere', 'Earth-system words ending in ___sphere', 'ATMO|HYDRO|BIO|LITHO', '___sphere', 'ATMOSPHERE, HYDROSPHERE, BIOSPHERE, and LITHOSPHERE refer to air, water, life, and the rigid outer Earth. The displayed pieces are word parts.', 'These word parts share a scientific ending.'),
    fact('gases', 'Noble-gas elements', 'HELIUM|NEON|ARGON|KRYPTON', 'These elements are in group 18 of the periodic table. Helium fills balloons; neon is associated with illuminated signs.', 'Look for elements in the same periodic-table family.'),
    blank('micro', 'Micro___', 'SCOPE|WAVE|CHIP|PHONE', 'Micro___', 'MICROSCOPE, MICROWAVE, MICROCHIP, and MICROPHONE share MICRO. A microphone converts sound to an electrical signal.', 'One prefix completes four technology words.'),
  ] },
  { id: 'general', name: 'General Knowledge', summary: 'A little of everything, with the widest mix of wordplay.', sources: [S.planets, S.geography], groups: [
    fact('instruments', 'Orchestral string instruments', 'VIOLIN|VIOLA|CELLO|DOUBLE BASS', 'These are four bowed string instruments commonly found in an orchestra. A double bass can also be plucked.', 'Think of the orchestral string section.'),
    fact('chess', 'Chess pieces other than pawns', 'KING|QUEEN|ROOK|BISHOP', 'These are four kinds of chess piece; the knight is another. Pawns are deliberately excluded from this category.', 'Think of pieces on a chessboard.'),
    fact('shapes', 'Polygons with 3, 4, 5, and 6 sides', 'TRIANGLE|QUADRILATERAL|PENTAGON|HEXAGON', 'The side counts are three, four, five, and six, respectively. A square is one kind of quadrilateral.', 'Count the sides, from three through six.'),
    blank('house', '___house', 'BRICK|GREEN|FARM|TREE', '___house', 'BRICK HOUSE, GREENHOUSE, FARMHOUSE, and TREEHOUSE share HOUSE. The blank works across open and closed compounds.', 'One familiar building word completes all four.'),
    { ...fact('animals-drop', 'Animals, minus their first letter', 'EAR|OAR|INK|OX', 'Restore the first letters: BEAR, BOAR, MINK, and FOX. Each displayed tile is a real word formed by removing the first letter of an animal name.', 'Restore one letter at the beginning of each word.'), rule: 'drop-first', sourceWords: ['BEAR','BOAR','MINK','FOX'] },
    { ...fact('animals-anagram', 'Animals with their letters rearranged', 'BARE|SALE|LOIN|FLOW', 'Rearrange each tile to get BEAR, SEAL, LION, and WOLF. Every letter is used exactly once; no letters are added or removed.', 'Rearrange the letters to find four animals.'), rule: 'anagram', sourceWords: ['BEAR','SEAL','LION','WOLF'] },
    { ...fact('desserts', 'Desserts missing their last word', 'APPLE|RICE|ICE|FRUIT', 'Complete APPLE PIE, RICE PUDDING, ICE CREAM, and FRUIT SALAD. Each is a two-word food name missing its final word.', 'Each tile starts a familiar two-word dessert name.'), rule: 'first-word', sourceWords: ['APPLE PIE','RICE PUDDING','ICE CREAM','FRUIT SALAD'] },
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
