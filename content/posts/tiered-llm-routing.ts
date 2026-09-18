import type { LocalSource } from "./index";

export const tieredLlmRouting: LocalSource = {
  kind: "local",
  slug: "benchmarking-12-llms-tiered-routing",
  title: "We benchmarked 12 LLMs to pick one. We ended up picking three.",
  excerpt:
    "A scored benchmark of 12 models for Milemark’s natural-language search ended in a three-tier router: measured costs, a heuristic that died against the data, and $0.014 per user per day.",
  date: "2026-09-10",
  cover: "/images/blog/tiered-llm-routing/cover.png",
  lead: "How a simple question — “which model should we use?” — turned into a carrier-style tiering system, and what the data did to our assumptions along the way.",
  body: [
    {
      type: "paragraph",
      text: "We had just shipped natural-language search for [Milemark](https://milemark.camp), a map of campgrounds. You type “find me a dog-friendly campground within 2 hours of Vancouver with decent cell coverage and showers, available this weekend” and the map applies the filters. Behind it: one gateway call, a zod schema, `temperature: 0`, and a model ID sitting in an environment variable.",
    },
    {
      type: "paragraph",
      text: "That environment variable said `google/gemini-2.5-flash-lite`. Not because we’d tested it. Because it was cheap, it was fast, and it was what the sibling repo used.",
    },
    {
      type: "paragraph",
      text: "So the question came up, as it always does: **is that the right model?**",
    },
    {
      type: "paragraph",
      text: "What followed was a week of benchmarking, one embarrassing performance bug, a heuristic that died on contact with real data, and a final architecture that looks nothing like what either of us proposed at the start. This is that journey.",
    },
    {
      type: "heading",
      text: "Part 1: You can’t compare models with vibes",
    },
    {
      type: "paragraph",
      text: "The first instinct when comparing models is to run a few queries and eyeball the output. This is worthless. Two models can both look “pretty good” on five sentences while differing enormously on the sixth, and you have no way to argue about which is better because you haven’t written down what “better” means.",
    },
    {
      type: "paragraph",
      text: "So the first real decision was: **build a scored benchmark, not a demo.**",
    },
    {
      type: "paragraph",
      text: "We wrote 20 sentences a real camper might type, and for each one, a set of executable checks — 40 in total. Not “does this look right?” but:",
    },
    {
      type: "code",
      lines: [
        "{",
        '  query: "find me a dog-friendly campground within 2 hours of vancouver',
        '          with decent cell coverage and showers, available this weekend.",',
        "  checks: [",
        '    { label: "showers",      ok: (i) => has(i, "facilities", "showers") },',
        '    { label: "pet_friendly", ok: (i) => has(i, "facilities", "pet_friendly") },',
        '    { label: "coverage=data",ok: (i) => i.filters.coverage === "data" },',
        '    { label: "near vancouver ~140km", ok: (i) => nearIs(i, "vancouver", 140) },',
        '    { label: "openOn = next saturday", ok: (i, c) => i.filters.openOn === c.nextSaturday },',
        "  ],",
        "}",
      ],
      title: "one benchmark row — 20 sentences, 40 executable checks",
    },
    {
      type: "paragraph",
      text: "This matters more than it sounds. A score built from named checks means a disagreement about a model’s ranking becomes a disagreement about a specific assertion — which is a conversation you can actually have. “Gemini scored 90%” is meaningless. “Gemini failed the `pet_friendly` check on sentence 1” is a bug report.",
    },
    {
      type: "paragraph",
      text: "The other thing we did: **priced it from measured usage.** Every call captured its token counts, and every model’s price came from the gateway’s own published catalogue rather than a hand-maintained table that would rot in a month. The output column that actually drives the decision isn’t the score — it’s **dollars per thousand queries.**",
    },
    {
      type: "paragraph",
      text: "Then we picked 12 models across four price tiers — free, cheap, medium, expensive — and let it run.",
    },
    {
      type: "heading",
      text: "Part 2: The run that took 34 minutes",
    },
    {
      type: "paragraph",
      text: "It should have taken two.",
    },
    {
      type: "paragraph",
      text: "The benchmark pooled work across sentences, and inside each sentence it looped through the 12 models sequentially. That meant every sentence took as long as the sum of all 12 models — and one of the free models averaged 53 seconds per call. One slow model serialized the entire matrix.",
    },
    {
      type: "paragraph",
      text: "The fix was three lines: pool over **(sentence × model) pairs** instead.",
    },
    {
      type: "code",
      lines: [
        "const pairs = queries.flatMap((item) => models.map((model) => ({ item, model })));",
        "const outcomes = await mapPool(pairs, concurrency, async ({ item, model }) => …);",
      ],
      title: "pooling over pairs, not sentences",
    },
    {
      type: "paragraph",
      text: "I mention this not because it’s clever — it isn’t — but because it’s the most common shape of performance bug in benchmark harnesses, and because the honest version of an engineering story includes the part where you killed your own 34-minute run.",
    },
    {
      type: "paragraph",
      text: "There was a second, funnier failure. Picking “free tier” models from the gateway catalogue by filtering on `price === 0` produced a list that included an **image model** and two **video models**. The gateway politely refused all three: “Use the video generation API instead.” A cheap one-sentence probe of the candidates would have caught it in 20 seconds. We ran the full matrix first.",
    },
    {
      type: "heading",
      text: "Part 3: What the data actually said",
    },
    {
      type: "paragraph",
      text: "240 real gateway calls. $1.15 spent. Here’s the leaderboard:",
    },
    {
      type: "code",
      lines: [
        "model                             tier        score   median   $/1k queries",
        "claude-haiku-4.5                  cheap        100%     1.6s          $2.23",
        "grok-4.3                          medium       100%     3.9s          $2.87",
        "claude-opus-4                     expensive    100%     2.8s         $31.70",
        "claude-sonnet-4.5                 medium        98%     2.2s          $6.24",
        "qwen3.7-flash                     cheap         93%    10.1s          $0.18",
        "gemini-2.5-flash-lite  incumbent  cheap         90%     0.9s          $0.12",
        "gemini-2.5-pro                    medium        90%     6.1s          $7.34",
        "ling-3.0-flash-fin                free          70%     2.7s           free",
        "fugu-ultra                        expensive     25%    32.8s         $27.96",
        "laguna-s-2.1-free                 free          12%     3.1s           free",
        "sonar-pro                         free           0%        —           free",
        "gpt-4-turbo                       expensive      0%        —              —",
      ],
      title: "12 models, 240 gateway calls, $1.15 spent",
    },
    {
      type: "paragraph",
      text: "Four findings, in ascending order of how much they changed our plans.",
    },
    {
      type: "paragraph",
      text: "**Price bought nothing.** Haiku and Opus 4 both scored 100%. Opus costs **14×** more and is slower. This is a structured-extraction task, not a reasoning task — the ceiling is low, and cheap models reach it. The expensive tier’s distinguishing feature in our results was that two of its three members couldn’t do the job at all.",
    },
    {
      type: "image",
      src: "/images/blog/tiered-llm-routing/price-bought-nothing.png",
      alt: "Haiku, Grok and Opus all scored 100%; Opus costs $31.70 per thousand queries against Haiku’s $2.23",
      caption:
        "Same score, 14× the bill. The column that decides things is dollars per thousand queries, and the expensive tier lost it.",
    },
    {
      type: "paragraph",
      text: "**The free tier doesn’t exist.** Of the three genuinely free text models: one couldn’t hold a structured-output schema at all (0/20), one failed 17 of 20 calls on gateway errors, and the best managed 70%.",
    },
    {
      type: "paragraph",
      text: "**No OpenAI model can serve this endpoint.** All of them — `gpt-4-turbo`, `gpt-5`, `gpt-5-mini` — failed 100% with the same error:",
    },
    {
      type: "quote",
      text: "Invalid schema for response_format: 'required' is required to be supplied and to be an array including every key in properties. Missing 'facilities'.",
    },
    {
      type: "paragraph",
      text: "OpenAI’s structured outputs require every key to be listed in `required`. Our schema is deliberately all-optional — that was the fix for an earlier bug where Gemini would live-lock trying to satisfy required fields it had no value for. **Two vendors’ structured-output implementations are mutually exclusive**, and we’d built on one of them without knowing it. Our model ID was documented as swappable; for an entire vendor, it was a guaranteed 100% failure rate.",
    },
    {
      type: "paragraph",
      text: "**And the incumbent failed the feature’s own headline example.** On the flagship sentence, `gemini-2.5-flash-lite` returned `showers` but not `pet_friendly` — it routed “dog-friendly” to the **“Ignored:”** list instead of mapping it to the taxonomy. It also missed `coverage: data` entirely. And on another sentence it applied a 4-star minimum rating while simultaneously telling the user it had ignored the phrase “well-reviewed campgrounds.”",
    },
    {
      type: "paragraph",
      text: "That last one is worth dwelling on. The user is told a constraint was dropped **that was in fact honoured.** The honesty channel — the feature that exists to stop the product over-claiming — was itself lying.",
    },
    {
      type: "paragraph",
      text: "The recommendation wrote itself: **switch to `claude-haiku-4.5`**. 100%, 1.6 seconds, $2.23 per thousand. One environment variable.",
    },
    {
      type: "paragraph",
      text: "That’s where this should have ended.",
    },
    {
      type: "heading",
      text: "Part 4: “What if we did what mobile carriers do?”",
    },
    {
      type: "paragraph",
      text: "Instead, the counter-proposal was a ladder. Three models: your first N searches go to the best one, the next M to a middle one, the rest to a free one. When you run out, you’re told you’ve used your daily limit.",
    },
    {
      type: "paragraph",
      text: "The framing was explicit and it was the right frame: **this is what carriers do with “unlimited” data.** 5G until your quota, then throttled — but never cut off.",
    },
    {
      type: "paragraph",
      text: "I pushed back hard on the first version, and the pushback was mostly wrong. Here’s what I got right and what I got wrong.",
    },
    {
      type: "paragraph",
      text: "**Right: the cost argument doesn’t hold.** Almost every user’s session is 1–3 searches. The long tail of 38-search power users is rare. So the first tier absorbs nearly all real traffic, and you pay premium prices for ~all of it. At the global ceiling of 2000 parses/day, the ladder costs exactly what “premium for everyone” costs. The ladder saves money only on the users who like the feature most.",
    },
    {
      type: "paragraph",
      text: "**Wrong: I concluded the ladder was therefore pointless.** It isn’t a cost mechanism. It’s an allowance mechanism. It buys an unbounded daily allowance at a bounded bill — 38 searches instead of 10, for under two cents a day. That’s a product decision, not a finance one, and once it was named correctly the design got much clearer.",
    },
    {
      type: "paragraph",
      text: "Then came the idea that reorganized everything:",
    },
    {
      type: "quote",
      text: "For easy queries use layer 3 or 2, and for complicated ones use the top layer.",
    },
    {
      type: "paragraph",
      text: "Not sequential position — **complexity routing.** Your 30th search, if it’s hard, still gets the good model. Your first search, if it’s trivial, doesn’t waste one.",
    },
    {
      type: "paragraph",
      text: "This is strictly better than a positional ladder, and it makes the counters mean something different. They stop being positions in a sequence and become **per-tier budgets**, spent whenever a query of that difficulty arrives.",
    },
    {
      type: "image",
      src: "/images/blog/tiered-llm-routing/position-vs-difficulty.png",
      alt: "Positional ladder versus complexity routing: the same three models, assigned by search position on the left and by query difficulty on the right",
      caption:
        "Same three models, same daily bill. Only the question the router asks changed.",
    },
    {
      type: "heading",
      text: "Part 5: The heuristic that didn’t survive the data",
    },
    {
      type: "paragraph",
      text: "Complexity routing needs something to judge complexity. Three options:",
    },
    {
      type: "list",
      items: [
        "A **pure heuristic** — count signals in the sentence. Free, deterministic, testable.",
        "A **classifier model call** — an extra gateway call to decide where to send the real one. Self-defeating.",
        "**Escalate on a weak-looking answer** — always start cheap, retry expensive if the result looks unconfident. Self-validating, but doubles cost on hard queries.",
      ],
    },
    {
      type: "paragraph",
      text: "We wanted the first. I proposed a rule that sounded reasonable: route on constraint-dimension count and the presence of a relative date. Three or more dimensions, or a date phrase, means send it to the top model.",
    },
    {
      type: "paragraph",
      text: "Then we went back to the benchmark data and actually tested the rule.",
    },
    {
      type: "paragraph",
      text: "**It missed half the hard cases.**",
    },
    {
      type: "paragraph",
      text: "Of 20 sentences: 12 were EASY (all three candidate models perfect), 6 MEDIUM, and 2 HARD (only Haiku correct). My rule caught one of the two hard sentences. It missed this one entirely:",
    },
    {
      type: "quote",
      text: "well-reviewed campgrounds, at least 4 stars, that I can book online",
    },
    {
      type: "paragraph",
      text: "Two dimensions. No date. Sixty-seven characters. By my rule, an easy query. In reality, the sentence **both** cheap models fail on, in exactly the same way.",
    },
    {
      type: "paragraph",
      text: "Its difficulty isn’t arity. It’s a **hedged scalar** — “well-reviewed” and “at least 4 stars” are the same dimension expressed twice, and both cheap models resolved that by applying one and confessing the other — plus a colloquial boolean (“that I can book online”) that neither mapped to a field.",
    },
    {
      type: "paragraph",
      text: "No countable surface feature separates that from “camping within 50 km of Banff”, which every model gets right.",
    },
    {
      type: "image",
      src: "/images/blog/tiered-llm-routing/heuristic-missed-half.png",
      alt: "Twenty sentences: twelve easy, six medium, two hard. The dimension-count rule caught one hard sentence and missed the other",
      caption:
        "The rule survived a design review and died against 20 rows. The sentence it missed has two dimensions, no date, and both cheap models fail it identically.",
    },
    {
      type: "paragraph",
      text: "Meanwhile, a **raw length threshold** separated hard from easy with a perfect confusion matrix. It was also a two-point fit with no causal story, and a 72-character prompt-injection attempt was long and handled fine by the free model. Fitting to n=2 is not a router, it’s a coincidence you’re about to deploy.",
    },
    {
      type: "paragraph",
      text: "**This is the part of the story I’d most want another team to steal.** The heuristic felt obviously right. It survived a design discussion. It died in ninety seconds against 20 rows of real data. If we’d shipped it, the failure would have been invisible — a mis-routed sentence doesn’t error, it returns a confident, plausible, wrong answer.",
    },
    {
      type: "heading",
      text: "Part 6: The signal that was actually there",
    },
    {
      type: "paragraph",
      text: "Digging into how the free model failed changed the design.",
    },
    {
      type: "paragraph",
      text: "Its 8 failures split **3 hard / 5 silent**:",
    },
    {
      type: "list",
      items: [
        "**Hard** — gateway timeouts, no object returned. Visible, and escalation fixes them.",
        "**Silent** — a well-formed, schema-valid object that was simply wrong.",
      ],
    },
    {
      type: "paragraph",
      text: "And four of the five silent failures clustered on one thing: **dates.**",
    },
    {
      type: "list",
      items: [
        "“open next Saturday” → returned `2026-09-13`. That’s a **Sunday**.",
        "“the middle of next July” → returned a date in this July, two months in the **past**. Our coercion layer caught the past date and told the user their date was unusable. It wasn’t. The model had mis-resolved “next.”",
        "The flagship sentence → **omitted the date field entirely**, with an empty “ignored” list. “Available this weekend” vanished, and the product reported nothing was dropped.",
      ],
    },
    {
      type: "paragraph",
      text: "That’s not a curve fit. That’s a **named capability gap**: this model cannot do date arithmetic. And a date-phrase regex is trivially cheap and reliable.",
    },
    {
      type: "image",
      src: "/images/blog/tiered-llm-routing/silent-failures.png",
      alt: "The free model’s eight failures: three loud timeouts, five silent wrong answers, four of them on dates",
      caption:
        "Loud failures escalate away. Silent ones never show up in an error rate, and four of five were the same missing capability.",
    },
    {
      type: "paragraph",
      text: "So the router became two mechanism-backed bands rather than one tuned threshold:",
    },
    {
      type: "code",
      lines: [
        "tier 1  iff  >= 11 words  ||  rating/booking language",
        "tier 3  iff  no date phrase && no rating/booking language && <= 9 words",
        "tier 2  otherwise",
      ],
      title: "routeTier(query) — two mechanism-backed bands",
    },
    {
      type: "paragraph",
      text: "The rating/booking band exists because that’s the **only** dimension where both cheap models fail identically. The date band exists because the free model provably can’t do dates. Each band has a reason you can state in a sentence, which is the difference between a rule and a fit.",
    },
    {
      type: "paragraph",
      text: "One more thing the data killed: the idea that escalation is a quality net. On the genuinely hard sentence, the middle model fails **exactly the same way** the cheap one does. Escalating from tier 3 to tier 2 buys you availability, never correctness.",
    },
    {
      type: "heading",
      text: "What we shipped",
    },
    {
      type: "paragraph",
      text: "**Three tiers.** Haiku (100%, budget 5/day), Gemini Flash Lite (90%, budget 25/day), and a free model — **uncapped**.",
    },
    {
      type: "paragraph",
      text: "Uncapping the free tier was the moment the carrier analogy paid off. A carrier doesn’t stop your data at 25GB; it slows it. Our free tier costs nothing, so capping it was pure friction. Which means the “you’ve used your daily limit” message — the thing originally asked for — **became unreachable.** No user is ever told they’re done. That’s the whole point.",
    },
    {
      type: "image",
      src: "/images/blog/tiered-llm-routing/three-tiers.png",
      alt: "Three tiers: Haiku at 5 a day, Gemini Flash Lite at 25 a day, and an uncapped free model. Claims walk down, failures escalate up",
      caption:
        "The claim walks down to the first tier with budget. A failed parse escalates one tier up, capped at two calls. The floor has no cap, so nobody hits a wall.",
    },
    {
      type: "paragraph",
      text: "**Routing is a pure function.** `routeTier(query): 1 | 2 | 3`. No gateway call, no latency, unit-tested against all 20 corpus sentences in CI. It’s the component most likely to rot silently, so it’s the one with the cheapest test.",
    },
    {
      type: "paragraph",
      text: "**Budgets are three atomic counters, one claimed per request.** The existing quota module already did a check-and-increment in a single SQL statement specifically to survive concurrent bursts. Splitting one bucket into three is a change of key, not of concurrency — the guarantee survives untouched. Routing picks a desired tier; the claim walks **down** to the first tier with budget.",
    },
    {
      type: "paragraph",
      text: "**Failures escalate up, capped at two calls.** A failed parse refunds its claim and retries one tier better. Hard cap: two gateway calls per request. No same-tier retry — the SDK already burned three attempts, and a fourth against a model that just timed out three times is latency with no upside.",
    },
    {
      type: "paragraph",
      text: "**The cache is keyed on tier, and upgrades.** One row per (query, date) with a tier column. A cached answer is served **only if its tier is at least as good as the tier this request earned** — otherwise it’s a miss, we spend the call, and the row upgrades for everyone after. The first person to ask a hard question pays for it once; everyone after gets the good answer free.",
    },
    {
      type: "paragraph",
      text: "**The meter reports the premium budget only.** Not “10 of 10 used” but “30 fast searches left today, then it keeps working.” When the floor is unlimited, that’s the only honest reading of “limit.”",
    },
    {
      type: "paragraph",
      text: "Worst realistic case: **$0.014 per user per day.**",
    },
    {
      type: "heading",
      text: "The risk we wrote down instead of solving",
    },
    {
      type: "paragraph",
      text: "The free model’s silent wrongness is real, and the router is the only thing holding it away from the dimensions it fails at. If a sentence mis-routes, the camper gets a confident answer that quietly ignored part of what they asked for. Nothing logs it. No error fires.",
    },
    {
      type: "paragraph",
      text: "We shipped it anyway — with the risk written into the ticket in plain language, not buried in a comment. A paid tier (top model for every query) is planned, and until then the free floor’s failure mode is bounded by a rule we can point at, test, and revise.",
    },
    {
      type: "paragraph",
      text: "That felt more honest than pretending the router is perfect, and more useful than blocking on making it perfect.",
    },
    {
      type: "heading",
      text: "Five things worth stealing",
    },
    {
      type: "list",
      items: [
        "**Score models with named checks, not vibes.** A number nobody can argue with is a number nobody can improve. Make disagreement about ranking into disagreement about a specific assertion.",
        "**Measure cost, don’t estimate it.** Capture real token usage, multiply by prices you fetch rather than maintain. “Dollars per thousand queries” is the column that decides things; nothing else is.",
        "**Test your heuristic against your data before you ship it.** Ours felt obviously correct, survived a design review, and died in ninety seconds against 20 real rows. The failure would have been invisible in production.",
        "**Distinguish loud failures from silent ones.** A timeout is cheap: you see it, you retry, the user loses nothing. A well-formed wrong answer is expensive and it is never in your error rate. Our free model’s headline score was 70%; its comprehension was 82% and its flakiness was the rest. Those two numbers demand completely different fixes.",
        "**Name what the mechanism is actually for.** We spent an hour arguing about a cost optimization that wasn’t one. Once it was correctly named — an allowance mechanism, buying unbounded usage at a bounded bill — every subsequent decision got easier, and several of them reversed.",
      ],
    },
    {
      type: "quote",
      text: "The benchmark harness is a ~700-line TypeScript file that runs the real production parse path through an injected model, grades it, prices it, and emits an HTML report. It is deliberately not wired into CI — a test suite that can bill a payment provider is a test suite that will.",
    },
  ],
  short: [
    {
      type: "paragraph",
      text: "Natural-language search for [Milemark](https://milemark.camp) is one gateway call, a zod schema, `temperature: 0`, and a model ID in an env var. That var said `google/gemini-2.5-flash-lite` — not because we’d tested it, but because the sibling repo used it.",
    },
    {
      type: "heading",
      text: "You can’t compare models with vibes",
    },
    {
      type: "paragraph",
      text: 'Two models can look equally good on five sentences and differ enormously on the sixth. So we built a scored benchmark of 20 camper sentences, 40 executable checks like `ok: (i) => has(i, "facilities", "pet_friendly")`. Named checks turn a disagreement about ranking into one about a specific assertion. We priced it from measured token counts; the deciding column is **dollars per thousand queries**.',
    },
    {
      type: "heading",
      text: "The run that took 34 minutes",
    },
    {
      type: "paragraph",
      text: "It should have taken two. The harness looped 12 models sequentially inside each sentence, so one model averaging 53 seconds per call serialized everything. The fix: pool over **(sentence × model) pairs**.",
    },
    {
      type: "heading",
      text: "What the data actually said",
    },
    {
      type: "paragraph",
      text: "240 gateway calls, $1.15. Ten of the twelve:",
    },
    {
      type: "code",
      lines: [
        "model                             tier        score   median   $/1k queries",
        "claude-haiku-4.5                  cheap        100%     1.6s          $2.23",
        "grok-4.3                          medium       100%     3.9s          $2.87",
        "claude-opus-4                     expensive    100%     2.8s         $31.70",
        "claude-sonnet-4.5                 medium        98%     2.2s          $6.24",
        "gemini-2.5-flash-lite  incumbent  cheap         90%     0.9s          $0.12",
        "ling-3.0-flash-fin                free          70%     2.7s           free",
        "fugu-ultra                        expensive     25%    32.8s         $27.96",
        "laguna-s-2.1-free                 free          12%     3.1s           free",
        "sonar-pro                         free           0%        —           free",
        "gpt-4-turbo                       expensive      0%        —              —",
      ],
      title: "ten of the twelve — 240 gateway calls, $1.15 spent",
    },
    {
      type: "paragraph",
      text: "**Price bought nothing** — Haiku and Opus 4 both scored 100%; Opus costs 14× more, and is slower. **The free tier doesn’t exist**: of three free text models, one held no schema at all, and the best managed 70%. **No OpenAI model can serve this endpoint** — all failed 100%, because OpenAI requires every key in `required` while our schema is deliberately all-optional; two vendors’ structured-output implementations are mutually exclusive. **And the incumbent failed the feature’s headline example**, routing “dog-friendly” to the “Ignored:” list, and elsewhere applied a 4-star minimum while claiming to have ignored “well-reviewed campgrounds” — the honesty channel itself lying.",
    },
    {
      type: "paragraph",
      text: "Recommendation: **switch to `claude-haiku-4.5`**. That’s where this should have ended.",
    },
    {
      type: "heading",
      text: "“What if we did what mobile carriers do?”",
    },
    {
      type: "paragraph",
      text: "The counter-proposal was a ladder: best model, then middle, then free — 5G until your quota, then throttled, never cut off. My pushback was right that it saves nothing (sessions are 1–3 searches, so the top tier absorbs nearly all traffic) and wrong that this made it pointless. It’s an allowance: 38 searches instead of 10, for two cents a day. Then the reframe: “for easy queries use layer 3 or 2, and for complicated ones use the top layer.” **Complexity routing** turns the counters into **per-tier budgets**.",
    },
    {
      type: "heading",
      text: "The heuristic that didn’t survive the data",
    },
    {
      type: "paragraph",
      text: "We wanted a pure heuristic: three or more constraint dimensions, or a relative date. **It missed half the hard cases.** Of 20 sentences, 2 were HARD (only Haiku correct); the rule caught one, missing “well-reviewed campgrounds, at least 4 stars, that I can book online” — two dimensions, no date, 67 characters. Its difficulty isn’t arity but a **hedged scalar**: one dimension stated twice, which both cheap models applied and then confessed to ignoring. A raw length threshold fit perfectly, on n=2. The rule died in ninety seconds against 20 rows, and in production its failure would have been invisible.",
    },
    {
      type: "heading",
      text: "The signal that was actually there",
    },
    {
      type: "paragraph",
      text: "The free model’s 8 failures split **3 hard / 5 silent** — timeouts you can see, versus schema-valid objects that were wrong. Four of the five silent ones were **dates**: “open next Saturday” → a Sunday; “the middle of next July” → two months in the past. A named capability gap, not a curve fit:",
    },
    {
      type: "code",
      lines: [
        "tier 1  iff  >= 11 words  ||  rating/booking language",
        "tier 3  iff  no date phrase && no rating/booking language && <= 9 words",
        "tier 2  otherwise",
      ],
      title: "routeTier(query) — two mechanism-backed bands",
    },
    {
      type: "paragraph",
      text: "Each band has a reason you can state in a sentence — the difference between a rule and a fit. And escalation is no quality net: the middle model fails the hard sentence exactly like the cheap one, buying availability, never correctness.",
    },
    {
      type: "heading",
      text: "What we shipped",
    },
    {
      type: "paragraph",
      text: "Three tiers — Haiku (5/day), Gemini Flash Lite (25/day), and a free model, **uncapped**, because a carrier slows you rather than stopping you. The “you’ve used your daily limit” message originally asked for became unreachable; that’s the whole point. Routing is a pure function, `routeTier(query): 1 | 2 | 3`, unit-tested against the corpus. Budgets are three atomic counters, one claimed per request; failures escalate up, capped at two calls; the cache is keyed on tier and upgrades. Worst case: **$0.014 per user per day.**",
    },
    {
      type: "paragraph",
      text: "The free model’s silent wrongness is real, and the router is the only thing holding it away from the dimensions it fails at. We shipped with that risk written into the ticket rather than blocking on perfection.",
    },
    {
      type: "heading",
      text: "Worth stealing",
    },
    {
      type: "list",
      items: [
        "**Score with named checks, not vibes.** A number nobody can argue with is a number nobody can improve.",
        "**Measure cost, don’t estimate it.** “Dollars per thousand queries” decides; nothing else does.",
        "**Test your heuristic against your data before shipping it.**",
        "**Separate loud failures from silent ones.** The free model’s 70% was 82% comprehension, the rest flakiness.",
        "**Name what the mechanism is for.** Renaming “cost optimization” to allowance reversed decisions.",
      ],
    },
    {
      type: "quote",
      text: "The benchmark harness is a ~700-line TypeScript file that runs the real production parse path through an injected model, grades it, prices it, and emits an HTML report. It is deliberately not wired into CI — a test suite that can bill a payment provider is a test suite that will.",
    },
  ],
  tldr: [
    {
      type: "list",
      items: [
        "12 models, 20 camper sentences, 40 named checks, 240 gateway calls, $1.15 — scored and priced from measured token usage.",
        "Price bought nothing: `claude-haiku-4.5` and `claude-opus-4` both scored 100%, and Opus costs 14× more ($31.70 vs $2.23 per 1k) and is slower.",
        "Every OpenAI model failed 100%: their structured outputs demand every key in `required`, and our schema is deliberately all-optional.",
        "The incumbent `gemini-2.5-flash-lite` scored 90% and failed the feature’s own headline sentence, dropping “dog-friendly” and cell coverage.",
        "Our complexity heuristic caught one of the 2 hard sentences; a rule built on word count, date phrases and rating language replaced it.",
        "Shipped three tiers — 5 premium/day, 25 mid/day, free uncapped — at $0.014 per user per day.",
      ],
    },
    {
      type: "quote",
      text: "It was never a cost optimization. It was an allowance.",
    },
  ],
};
