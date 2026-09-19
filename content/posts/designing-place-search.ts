import type { PostBlock } from "./blocks";
import type { LocalSource } from "./index";

/**
 * The sourcing note closes every edition. Shared rather than retyped, so the
 * link and the wording can't drift between the full and short versions.
 */
const numbersNote: PostBlock = {
  type: "callout",
  title: "On the numbers",
  text: "Numbers in this piece were measured against the live GeoNames US and Canada dumps and a production-shaped campground database — not estimated. The dataset is [GeoNames](https://www.geonames.org/), CC BY 4.0.",
  href: "https://milemark.camp",
  linkLabel: "See Milemark",
};

export const placeSearch: LocalSource = {
  kind: "local",
  slug: "designing-place-search-geonames",
  title: "The feature I thought would take a weekend",
  excerpt:
    "Adding place search to a camping app looked like a table and a text query. Four measurements against the GeoNames dumps demolished the design that sounded obviously right.",
  date: "2026-09-09",
  cover: "/images/blog/place-search/cover.png",
  lead: "How four measurements demolished a design that sounded obviously right.",
  body: [
    {
      type: "paragraph",
      text: "There is a particular kind of feature that feels finished before you start it.",
    },
    {
      type: "paragraph",
      text: "Ours was this: our camping app has a search box. Type a name, get a campground. Perfectly useful, and perfectly limited — because nobody plans a trip by campground name. They plan by *place*. “Somewhere near Banff.” “That lake in Muskoka.” “Anywhere in Utah.”",
    },
    {
      type: "paragraph",
      text: "So the ask was simple. Add places to the search. Cities, parks, lakes. Put them in their own section, cap them at five, campgrounds underneath. I already knew the shape of the answer: a table of locations, a text search over it, done.",
    },
    {
      type: "paragraph",
      text: "I was right about the table. I was wrong about nearly everything else, and every single correction came from the same place — not from an argument, but from a number.",
    },
    {
      type: "image",
      src: "/images/blog/place-search/search-sections.png",
      alt: "Sketch of a search box returning a places section above a campgrounds section",
      caption:
        "One query, two sections, five places max — the part of the instinct that survived.",
    },
    {
      type: "paragraph",
      text: "This is the story of that design, told through the four moments it fell over.",
    },
    {
      type: "heading",
      text: "First, the thing that was already true",
    },
    {
      type: "paragraph",
      text: "Before designing anything, we read what existed. That turned out to be half the work.",
    },
    {
      type: "paragraph",
      text: "The campground search wasn't a naive `LIKE '%query%'`. It was a hybrid: an accent-folded, lowercased expression index backed by trigrams, with five match tiers — exact, name-prefix, word-prefix, contains, approximate — ordered by how many of your typed words the name actually answered, then by popularity, then by name, then by ID, so that the CDN never cached a coin flip.",
    },
    {
      type: "paragraph",
      text: "It also carried a scar. The escaping happened *after* folding, and *in SQL*, because Unicode normalization can **create** wildcard characters that weren't in the input. Someone had found that. Someone had fixed it. The comment explaining why was longer than the code.",
    },
    {
      type: "paragraph",
      text: "And there was a second, quieter fact: the endpoint was deliberately not rate-limited. It fires on every keystroke; the CDN is the abuse control. It sends no authorization header, and nothing in its response may ever become user-specific, because the moment it does, the cache dies.",
    },
    {
      type: "paragraph",
      text: "That single paragraph killed an option I hadn't even proposed yet. Live geocoding APIs — Nominatim, Mapbox, whatever — were out. Not because they're bad, but because a network hop per keystroke is incompatible with the architecture the search box already had. The constraint wasn't a preference. It was load-bearing.",
    },
    {
      type: "paragraph",
      text: "So: a local table. That part of my instinct survived.",
    },
    {
      type: "heading",
      text: "Reversal one: the data source doesn't have the thing you assumed it has",
    },
    {
      type: "paragraph",
      text: "We picked GeoNames. It's the only free dataset that covers cities, parks and lakes in one place, it ships a population column for ranking, and it's CC BY 4.0 — usable commercially with attribution.",
    },
    {
      type: "paragraph",
      text: "Then we downloaded it and started counting, and the first assumption fell over immediately.",
    },
    {
      type: "paragraph",
      text: "**GeoNames has no bounding boxes.** None. Not for cities, not for parks, not for lakes. The only geometry in the entire free dump is 250 simplified country outlines.",
    },
    {
      type: "paragraph",
      text: "This mattered more than it sounds. We'd been debating whether picking a place should fit the map to the place's extent — fly to Banff National Park and frame the whole park — or just drop the camera at a point with a fixed zoom. The elegant answer is obviously fit-to-extent. It's also impossible with this dataset, and the alternative sources that *do* have polygons come with real costs: OpenStreetMap's share-alike licence can infect a derived database; PAD-US and CPCAD are two separate national datasets you'd have to reconcile.",
    },
    {
      type: "paragraph",
      text: "So the design became point-based, with a fixed zoom per kind of place. Not because it's better. Because the data has an opinion and it's the only one on offer.",
    },
    {
      type: "paragraph",
      text: "Second surprise, same afternoon: **Canadian national parks aren't filed as parks.**",
    },
    {
      type: "paragraph",
      text: "GeoNames has a feature code for parks. US national parks are in it — all 79. But of the 50 Canadian rows named “National Park,” **45 are filed as `L.RES`, “reserve.”** Banff is a reserve. Jasper is a reserve. A park-code-only import would have shipped with a straight face and silently excluded the most famous camping destinations in Canada.",
    },
    {
      type: "quote",
      text: "Nothing in the documentation warns you. You find it by counting, or you don't find it at all.",
    },
    {
      type: "heading",
      text: "Reversal two: my filter was a filter that didn't filter",
    },
    {
      type: "paragraph",
      text: "Here's the one I was most confident about, and most wrong about.",
    },
    {
      type: "paragraph",
      text: "Duplicate names in GeoNames are not an edge case — they're the dominant characteristic. **“Mud Lake” appears 1,041 times** across the US and Canada. “Long Lake,” 763. “Twin Lakes,” 510. If someone types “mud,” a naive top-five is five indistinguishable Mud Lakes in Minnesota, and the feature is a joke.",
    },
    {
      type: "paragraph",
      text: "My fix was obvious and, I thought, elegant: we're a camping app. Only keep places that have at least one campground near them. Precompute the count on import, gate on it, and get a “12 campgrounds nearby” subtitle for free.",
    },
    {
      type: "paragraph",
      text: "We measured it. Spatial join, 750,000 candidate rows against 36,000 published campgrounds, at 25 kilometres and at 50.",
    },
    {
      type: "code",
      title: "duplicate names — unfiltered vs. within 25 km",
      lines: [
        "                            unfiltered   within 25 km",
        "Mud Lake                         1,041            992",
        "Long Lake                          763            672",
        "Twin Lakes                         510            464",
        "rows inside a duplicated name    57.4%          57.1%",
      ],
    },
    {
      type: "paragraph",
      text: "The top-fifteen collision list came back **identical**, minus five percent.",
    },
    {
      type: "paragraph",
      text: "The reason is embarrassing in hindsight. Thirty-six thousand campgrounds spread across a continent means “within 25 km of a campground” is a synonym for “in the inhabited part of North America.” The filter retained 91.8% of US lakes. It also retained 89.8% of **streams** and 98.6% of **golf courses**. It wasn't a camping filter. It was a population filter wearing a camping costume.",
    },
    {
      type: "paragraph",
      text: "What actually worked was something I'd have called a hack if I'd thought of it first: **does the place have a Wikipedia article?**",
    },
    {
      type: "paragraph",
      text: "GeoNames ships an alternate-names dataset where one row type is a Wikipedia link. It's not curated for us. It's not about camping. It's just a proxy for *has anyone ever cared about this place*.",
    },
    {
      type: "image",
      src: "/images/blog/place-search/notability-filter.png",
      alt: "Sketch: a grid of identical Mud Lake blobs funnelled through a 'has a Wikipedia article?' box, leaving a handful",
      caption:
        "Worst collision: 1,041 unfiltered, 992 after the proximity filter, 34 after notability.",
    },
    {
      type: "paragraph",
      text: "A thirty-fold collapse, versus a five-percent one. And it disambiguates for free: among roughly ninety US rows named “Lake Louise,” it picks out almost none — while Lake Tahoe, out of six same-name rows, is selected cleanly.",
    },
    {
      type: "paragraph",
      text: "Then the same measurement immediately stopped us from over-applying it. Only 4,429 of 70,872 parks have a Wikipedia link. Gate parks the same way and you delete 94% of them — including most state and provincial parks, which is *exactly where people camp*.",
    },
    {
      type: "paragraph",
      text: "So the rule went per-kind. **Lakes must be notable. Parks and cities need not be.** A camper searching for a lake means a famous one. A camper searching for a park may well mean a small provincial one nobody's written about.",
    },
    {
      type: "paragraph",
      text: "That asymmetry is not something I'd have designed. It's something the data forced, and it's only defensible because we can show the numbers on both halves.",
    },
    {
      type: "heading",
      text: "Reversal three: the countries are coded differently, and the marquee lakes are man-made",
    },
    {
      type: "paragraph",
      text: "We nearly excluded reservoirs. They're a separate feature code from lakes, and “reservoir” sounds like infrastructure — dams and drinking water, not camping.",
    },
    {
      type: "paragraph",
      text: "Then we checked the specific places by name.",
    },
    {
      type: "paragraph",
      text: "**Lake Mead. Lake Powell. Shasta Lake. Lake Havasu. Lake Cumberland. Lake Sakakawea. Lake Oahe. Fort Peck Lake. Flaming Gorge. Lake Berryessa. Table Rock. Lake Texoma. Toledo Bend.** Every one of them classified as a reservoir.",
    },
    {
      type: "paragraph",
      text: "Tahoe, Okeechobee and Champlain are lakes. Almost every marquee reservoir-camping destination in the western and southern United States is not. Dropping the code would have deleted them all, quietly, and the bug report would have arrived as “why can't I find Lake Powell” six months later.",
    },
    {
      type: "paragraph",
      text: "And underneath that, a structural fact that shapes the whole import:",
    },
    {
      type: "image",
      src: "/images/blog/place-search/reservoirs-vs-ponds.png",
      alt: "Sketch bar chart: 58,539 US reservoirs vs 58 US ponds; 121 Canadian reservoirs vs 7,415 Canadian ponds",
      caption:
        "GNIS and CGNDB use the same vocabulary differently — so the import needs a per-country code table.",
    },
    {
      type: "paragraph",
      text: "That is not a data error. GeoNames sources the two countries from two different national gazetteers — GNIS in the US, CGNDB in Canada — and they use the vocabulary differently. **A symmetric rule cannot work.** The import needs an explicit per-country code table, and it needs a comment saying why, or the first person who reads it will “simplify” it and delete either every American reservoir or every Canadian pond.",
    },
    {
      type: "paragraph",
      text: "While we were there, two more premises of mine died. I'd assumed the `L.RES` reserve code was a military-land dumping ground — bombing ranges, proving grounds. A strict pattern match found **five such rows out of 3,145**, two of which were false positives. The real contamination was 243 Canadian National Historic Sites and roughly 200 French-language reserves that an English regex will never catch.",
    },
    {
      type: "paragraph",
      text: "And I'd assumed a Wikidata identifier would work as a notability signal alongside the Wikipedia link. It's present on 74% of mountains and near-zero percent of everything else. It's not a signal. It's a bulk import artefact.",
    },
    {
      type: "paragraph",
      text: "Three assumptions, three measurements, three corrections. None of them were arguments. They were counts.",
    },
    {
      type: "heading",
      text: "Reversal four: the constraint that came from outside the code",
    },
    {
      type: "paragraph",
      text: "The API change looked trivial. Return `{ places, camps }` instead of a bare array. Two clients, both ours, a compile error each. Fix and ship.",
    },
    {
      type: "paragraph",
      text: "Except one of those clients is a React Native app that is **already in the App Store**.",
    },
    {
      type: "paragraph",
      text: "We went looking for the escape hatch and found it missing, three times over:",
    },
    {
      type: "list",
      items: [
        "**No over-the-air updates.** The library isn't even a dependency. The API base URL and the request path are inlined into the binary at build time. Every change is an App Store *and* a Play Store release — and the last version landed eight days apart across the two.",
        "**No client-version signal.** The search call sends no headers at all. The server cannot refuse an old client. Worse, it cannot *count* them — so there is no observable date on which the last old client is gone.",
        "**No precedent for removal.** We grepped. The repo had already faced this exact question three times — a legacy filter spelling, a legacy URL format, a legacy boolean — and answered “read it forever, never write it” every time. Each with a comment naming the shipped mobile build as the reason.",
      ],
    },
    {
      type: "paragraph",
      text: "So the design became: a **new, purely additive endpoint**, plus the old one kept permanently as a four-line projection of the same query.",
    },
    {
      type: "paragraph",
      text: "Note the word. Not *deprecated* — **permanent**. “Deprecated” implies a cleanup date, and there is no mechanism by which anyone could ever verify that date had arrived. Writing “deprecated, remove in Q3” would be scheduling a future outage and calling it hygiene.",
    },
    {
      type: "paragraph",
      text: "And the reason it's a projection rather than a copy is the part I'd have got wrong under time pressure: if the two endpoints have two implementations, every future ranking improvement either gets done twice or silently diverges — and it diverges *for the users you cannot upgrade*. One library, two thin routes.",
    },
    {
      type: "paragraph",
      text: "There was one small bonus. The existing endpoint documents a known cache-poisoning hole: append junk query parameters and you mint unlimited cache misses. We're not fixing that on the shipped route, because changing a live route's cache-key behaviour is precisely the thing that could break clients we can't reach. But the new route ignores unknown parameters from birth. New code doesn't have to inherit old scars.",
    },
    {
      type: "heading",
      text: "The small one that would have shipped broken",
    },
    {
      type: "paragraph",
      text: "One last measurement, almost an afterthought, and my favourite.",
    },
    {
      type: "paragraph",
      text: "Picking a place flies the map to it at a zoom appropriate to the kind of place. City close, park wider, province widest. Obvious.",
    },
    {
      type: "paragraph",
      text: "Both clients have a “too zoomed out to load” gate, and they're spelled differently. Web uses a minimum zoom level, default 4 — permissive. Mobile uses a maximum region span: **30 degrees**.",
    },
    {
      type: "paragraph",
      text: "Work out the equivalences and web zoom 6 is roughly a 51-degree span. Over the gate.",
    },
    {
      type: "image",
      src: "/images/blog/place-search/zoom-gate.png",
      alt: "Sketch of two map frames: zoom 6 at a 51 degree span crossed out, zoom 7 at 25.6 degrees loading pins",
      caption:
        "Zoom 6 clears the web's gate and trips the mobile one — same feature, empty map.",
    },
    {
      type: "paragraph",
      text: "So “show the whole province” — the natural, generous choice — would have worked beautifully on the web and landed every mobile user on an empty map with a “zoom in to load” prompt. Zoom 7 is about 25.6 degrees, comfortably under. **The region zoom must be 7 and never 6**, and there is now a test asserting every mobile span sits under the gate, because that is a number someone will round for good aesthetic reasons.",
    },
    {
      type: "heading",
      text: "What the process actually was",
    },
    {
      type: "paragraph",
      text: "Reading it back, the design didn't come from being clever. It came from a loop:",
    },
    {
      type: "quote",
      text: "State the assumption out loud. Go count. Change your mind in public.",
    },
    {
      type: "paragraph",
      text: "Every reversal in this piece follows that shape. Proximity felt like the natural relevance filter — until we counted golf courses. Reservoirs felt like infrastructure — until we listed them by name. The API change felt trivial — until we grepped for an update mechanism and found three separate confirmations that there wasn't one.",
    },
    {
      type: "paragraph",
      text: "The counting was cheap. Downloading the dumps, loading them into a scratch table, running the joins — an hour, maybe. The features those hours prevented shipping broken: no Canadian national parks, no Lake Powell, five identical Mud Lakes on the most obvious query, and an empty map for every mobile user who tapped a province.",
    },
    {
      type: "paragraph",
      text: "Two things I'd carry to the next one.",
    },
    {
      type: "list",
      items: [
        "**Write down what you rejected and why you rejected it, with the number attached.** The spec we ended up with says proximity filtering was measured at 57.4% versus 57.1%. That sentence exists so that in eight months, when someone sensibly suggests filtering places by campground proximity, the answer is a measurement rather than an argument. Rejected options are design output. Most specs throw them away.",
        "**Read the constraints before you design inside them.** The no-rate-limit posture, the escape-after-fold ordering, the three prior “read it forever” decisions — none of that was in anyone's head at the start, and all of it was written down in comments by people who'd been bitten. The codebase had already answered several of our questions. We just hadn't asked it yet.",
      ],
    },
    {
      type: "paragraph",
      text: "The feature still isn't built. But when it is, it won't be missing Banff.",
    },
    numbersNote,
  ],
  short: [
    {
      type: "paragraph",
      text: "Nobody plans a camping trip by campground name; they plan by place. The ask: add cities, parks and lakes to our search. I assumed a table and a text search. I was right about the table, wrong about nearly everything else, and every correction came from a number.",
    },
    {
      type: "heading",
      text: "First, the thing that was already true",
    },
    {
      type: "paragraph",
      text: "The existing search was already a hybrid: accent-folded trigram index, five match tiers, deterministic ordering so the CDN never cached a coin flip. The endpoint is deliberately not rate-limited: it fires on every keystroke and the CDN is the abuse control. That killed live geocoding APIs. So: a local table.",
    },
    {
      type: "heading",
      text: "Reversal one: the data source doesn't have the thing you assumed it has",
    },
    {
      type: "paragraph",
      text: "We picked GeoNames (CC BY 4.0) and counted. **It has no bounding boxes.** The only geometry in the free dump is 250 country outlines, and polygon sources carry real costs (OpenStreetMap's share-alike licence, reconciling PAD-US and CPCAD). The design became point-based with a fixed zoom per kind of place.",
    },
    {
      type: "paragraph",
      text: "Second: **Canadian national parks aren't filed as parks.** All 79 US national parks carry the park code, but of 50 Canadian rows named “National Park,” **45 are filed as `L.RES`, “reserve.”** A park-code-only import would have silently dropped Banff and Jasper.",
    },
    {
      type: "heading",
      text: "Reversal two: my filter was a filter that didn't filter",
    },
    {
      type: "paragraph",
      text: "**“Mud Lake” appears 1,041 times**; “Long Lake,” 763; “Twin Lakes,” 510. My fix: keep only places with a campground nearby. We measured it, 750,000 candidates against 36,000 campgrounds:",
    },
    {
      type: "code",
      title: "duplicate names — unfiltered vs. within 25 km",
      lines: [
        "                                 unfiltered    within 25 km",
        "Mud Lake                              1,041             992",
        "Long Lake                               763             672",
        "Twin Lakes                              510             464",
        "rows inside a duplicated name         57.4%           57.1%",
      ],
    },
    {
      type: "paragraph",
      text: "“Within 25 km of a campground” means “inhabited North America.” The filter retained 91.8% of US lakes, 89.8% of streams and 98.6% of golf courses.",
    },
    {
      type: "paragraph",
      text: "What worked: **does the place have a Wikipedia article?**",
    },
    {
      type: "code",
      title: "worst collision by filter",
      lines: [
        "                    worst collision",
        "unfiltered                    1,041",
        "proximity filter                992",
        "notability                       34",
      ],
    },
    {
      type: "paragraph",
      text: "But only 4,429 of 70,872 parks have a Wikipedia link; gating parks would delete 94% of them, including the provincial parks where people camp. So: **lakes must be notable; parks and cities need not be.**",
    },
    {
      type: "heading",
      text: "Reversal three: the countries are coded differently, and the marquee lakes are man-made",
    },
    {
      type: "paragraph",
      text: "We nearly excluded reservoirs. Then we checked by name: **Lake Mead, Lake Powell, Shasta Lake, Lake Havasu, Lake Cumberland, Lake Sakakawea, Lake Oahe, Fort Peck Lake, Flaming Gorge, Lake Berryessa, Table Rock, Lake Texoma, Toledo Bend.** All reservoirs.",
    },
    {
      type: "code",
      title: "reservoirs vs. ponds — US and Canada",
      lines: [
        "                 reservoirs    ponds",
        "United States        58,539       58",
        "Canada                  121    7,415",
      ],
    },
    {
      type: "paragraph",
      text: "GeoNames sources the US from GNIS and Canada from CGNDB, with different vocabularies. **A symmetric rule cannot work**; the import needs a per-country code table and a comment saying why.",
    },
    {
      type: "paragraph",
      text: "Two more premises died: `L.RES` held **five military rows out of 3,145**, the real contamination being 243 Canadian National Historic Sites; and Wikidata identifiers, on 74% of mountains and near-zero of everything else, are an import artefact, not a signal.",
    },
    {
      type: "heading",
      text: "Reversal four: the constraint that came from outside the code",
    },
    {
      type: "paragraph",
      text: "Returning `{ places, camps }` instead of a bare array looked trivial. But one client is a React Native app **already in the App Store**: no over-the-air updates, no client-version signal so the server can't refuse or count old clients, and a repo that had answered “read it forever, never write it” three times before.",
    },
    {
      type: "paragraph",
      text: "So: a **new, purely additive endpoint**, the old one kept **permanently** as a four-line projection of the same query. Not deprecated, because no one could verify a cleanup date; a projection, not a copy, so ranking never diverges for users you cannot upgrade.",
    },
    {
      type: "heading",
      text: "The small one that would have shipped broken",
    },
    {
      type: "paragraph",
      text: "Mobile refuses to load above a region span of **30 degrees**. Web zoom 6 is roughly 51 degrees; zoom 7 is about 25.6. “Show the whole province” would have given every mobile user an empty map. **The region zoom must be 7 and never 6**, and a test now asserts every mobile span sits under the gate.",
    },
    {
      type: "heading",
      text: "What the process actually was",
    },
    {
      type: "paragraph",
      text: "**State the assumption out loud. Go count. Change your mind in public.** The counting cost an hour and prevented shipping without Banff, without Lake Powell, and with an empty mobile map.",
    },
    {
      type: "paragraph",
      text: "**Write down what you rejected and why, with the number attached.** The spec says proximity measured 57.4% versus 57.1%, so next time the answer is a measurement, not an argument. **Read the constraints before you design inside them.** The codebase had already answered several of our questions; we just hadn't asked it yet.",
    },
    {
      type: "paragraph",
      text: "The feature still isn't built. But when it is, it won't be missing Banff.",
    },
    numbersNote,
  ],
  tldr: [
    {
      type: "list",
      items: [
        "Adding place search to a camping app looked like a weekend job; four measurements overturned the obvious design.",
        "GeoNames has no bounding boxes, and 45 of 50 Canadian “National Park” rows are filed as reserves, so a park-code import would have dropped Banff.",
        "Campground-proximity filtering barely helped: “Mud Lake” fell from 1,041 to 992 duplicates. A Wikipedia-link filter cut it to 34.",
        "Lake Mead and Lake Powell are coded as reservoirs; the US has 58,539 reservoirs and 58 ponds, Canada 121 and 7,415, so rules must be per-country.",
        "A shipped React Native app with no OTA updates forced a new additive endpoint alongside the old.",
        "Mobile caps region span at 30 degrees, so province zoom must be 7.",
      ],
    },
    {
      type: "quote",
      text: "State the assumption, go count, change your mind in public.",
    },
  ],
};
