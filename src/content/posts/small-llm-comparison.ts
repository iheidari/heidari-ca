import costImage from "@/assets/images/blog/small-llm-comparison/cost.png";
import coverImage from "@/assets/images/blog/small-llm-comparison/cover.png";
import latencyImage from "@/assets/images/blog/small-llm-comparison/latency.png";
import overviewImage from "@/assets/images/blog/small-llm-comparison/overview.png";
import scoreImage from "@/assets/images/blog/small-llm-comparison/score.png";
import tokensImage from "@/assets/images/blog/small-llm-comparison/tokens.png";
import type { PostBlock } from "./blocks";
import type { LocalSource } from "./index";

/**
 * Figures shown in both the full and short editions. Shared rather than
 * retyped, so the alt text and captions can't drift between them.
 */
const overviewFigure: PostBlock = {
  type: "image",
  src: overviewImage,
  alt: "Four bar charts for all nine models: score, median latency with p95 ticks, output tokens per second, and cost per 1,000 searches",
  caption: "Score, latency (tick = p95), throughput and cost.",
};

const scoreFigure: PostBlock = {
  type: "image",
  src: scoreImage,
  alt: "Score by model: mimo-v2.5 100%; gpt-6-luna-fast, claude-haiku-5.5, gpt-6-luna, qwen3.5-flash and muse-spark-1.3-contributor 98.1%; nemotron-3.5-lightning 96.2%; llama-3.1-8b 92.0%; gemini-2.5-flash-lite 90.4%",
  caption: "Five models tied at 98.1%, one check short of perfect.",
};

const latencyFigure: PostBlock = {
  type: "image",
  src: latencyImage,
  alt: "Median latency: gemini-2.5-flash-lite 1.09 s, llama-3.1-8b 1.20 s, gpt-6-luna-fast 1.42 s, claude-haiku-5.5 1.55 s, gpt-6-luna 1.87 s, qwen3.5-flash 5.72 s, mimo-v2.5 7.23 s, muse-spark-1.3-contributor 7.66 s, nemotron-3.5-lightning 10.94 s",
  caption:
    "The three highlighted models are the only ones both under two seconds and at 98% or better.",
};

const tokensFigure: PostBlock = {
  type: "image",
  src: tokensImage,
  alt: "nemotron-3.5-lightning: 10.9 s median at 447 tokens per second and about 4,500 tokens per answer. claude-haiku-5.5: 1.6 s at 91 tokens per second and about 190 tokens per answer",
  caption:
    "Five times the throughput, seven times slower: the tokens were spent before the answer started.",
};

export const smallLlmComparison: LocalSource = {
  kind: "local",
  slug: "nine-small-llms-for-natural-language-search",
  title:
    "Nine small LLMs, one job: turning a camper’s sentence into map filters",
  excerpt:
    "We ran nine fast, inexpensive models over Milemark’s 29-sentence search test set: six scored 98% or better, and three of those answered in under two seconds for $0.25–$0.50 per 1,000 searches.",
  date: "2026-10-09",
  cover: coverImage,
  lead: "Most small models read a search sentence correctly. What separates them is dates, wording, and how many tokens they spend getting there.",
  body: [
    {
      type: "paragraph",
      text: "[Milemark](https://milemark.camp) is a map of campgrounds. Its **Ask** box lets campers type what they want in plain English instead of clicking through filter chips. Behind it, a language model reads the sentence and fills in a structured search. We ran nine fast, inexpensive models through the same test set to see which ones get it right, how long they take, and what they cost.",
    },
    {
      type: "heading",
      text: "What the model has to do",
    },
    {
      type: "paragraph",
      text: "Take a request like “Find me a dog-friendly campground within 2 hours of Vancouver with decent cell coverage and showers, available this weekend.” A correct reading is: pet-friendly and showers, data coverage, near Vancouver within about 140 km, and open on the coming Saturday.",
    },
    {
      type: "paragraph",
      text: "The model returns this as a JSON object with a fixed schema: amenities, activities, site and access types, a date, cell coverage, a place and a radius or drive time, minimum rating, online booking, and a list of anything it couldn’t map to a filter. Our code then checks every value against the site’s fixed vocabulary, so a model can’t invent a filter that doesn’t exist.",
    },
    {
      type: "paragraph",
      text: "The hard parts are the ones that look easy:",
    },
    {
      type: "list",
      items: [
        "Working out what date “this weekend” or “the middle of next July” means.",
        "Telling “near me” apart from a place name.",
        "Keeping “Vancouver, Washington” separate from Vancouver, BC.",
        "Admitting that “under $30 a night” isn’t something the map can filter on, rather than quietly dropping it.",
      ],
    },
    {
      type: "heading",
      text: "How we tested",
    },
    {
      type: "list",
      items: [
        "**29 sentences, 52 automatic checks.** Each sentence comes with a written expectation and checks that pass or fail, such as “openOn = the coming Saturday” or “near Vancouver / 140 km”. The set covers amenities, places and distances, relative dates, ratings and booking, requests we can’t filter on, a prompt-injection attempt, and keyboard mash.",
        "**Same prompt, same schema, same gateway.** Every model got the identical system prompt and output schema, called through one AI gateway. Each answered all 29 sentences once, 8 at a time, all on the same day from the same machine. Relative dates were judged against 9 October 2026.",
        "**What we measured.** *Score* is the share of checks passed. *Latency* is wall-clock time from request to validated answer (median and 95th percentile). *Throughput* is output tokens per second over that same time. *Cost* is the run’s actual token usage at the gateway’s list price, scaled to 1,000 searches.",
      ],
    },
    {
      type: "heading",
      text: "Overview",
    },
    {
      type: "paragraph",
      text: "All four measures side by side. The highlighted models are the three that turned out both accurate and fast; the rest of the post explains why.",
    },
    overviewFigure,
    {
      type: "heading",
      text: "Most models got it right",
    },
    {
      type: "paragraph",
      text: "Six of the nine scored 98% or better. Only `xiaomi/mimo-v2.5` passed every check, but its median answer took 7.2 seconds, with a 95th percentile of 20 seconds.",
    },
    scoreFigure,
    {
      type: "heading",
      text: "Three were accurate and fast",
    },
    {
      type: "paragraph",
      text: "`openai/gpt-6-luna-fast` (1.4 s), `anthropic/claude-haiku-5.5` (1.6 s) and `openai/gpt-6-luna` (1.9 s) each missed exactly one check. The two models faster than them were also the two least accurate.",
    },
    latencyFigure,
    {
      type: "paragraph",
      text: "`gpt-6-luna` was the cheapest of the three at $0.25 per 1,000 searches. `gpt-6-luna-fast` isn’t in the gateway’s price list, so we priced it at twice `gpt-6-luna`’s rate.",
    },
    {
      type: "image",
      src: costImage,
      alt: "Cost per 1,000 searches: mimo-v2.5 $0.23, gpt-6-luna $0.25, gemini-2.5-flash-lite $0.25, llama-3.1-8b $0.32, muse-spark-1.3-contributor $0.40, claude-haiku-5.5 $0.43, gpt-6-luna-fast $0.50, qwen3.5-flash $0.83, nemotron-3.5-lightning $0.98",
      caption:
        "Every model costs under a dollar per 1,000 searches; the spread is about 4×.",
    },
    {
      type: "heading",
      text: "Dates separate the fastest models",
    },
    {
      type: "paragraph",
      text: "`google/gemini-2.5-flash-lite` was the fastest model (1.1 s median) but scored lowest (90%). It missed “this weekend”, “the middle of next July” and “last Christmas”. `meta/llama-3.1-8b` also missed a date question, and twice returned output that didn’t match the schema.",
    },
    {
      type: "heading",
      text: "Fast streaming isn’t a fast answer",
    },
    {
      type: "paragraph",
      text: "`nvidia/nemotron-3.5-lightning` streamed 447 tokens a second, the most of any model, but spent about 4,500 tokens per answer, mostly on reasoning. That made it the slowest and most expensive model here. The answer itself is around 120 tokens, so how many tokens a model spends matters more than how fast it produces them.",
    },
    tokensFigure,
    {
      type: "heading",
      text: "Where they missed",
    },
    {
      type: "paragraph",
      text: "The most common miss was vague wording. Four models treated “somewhere good for water sports” as something they couldn’t filter on, instead of mapping it to the site’s water activities. Every sentence with at least one miss:",
    },
    {
      type: "list",
      items: [
        "**“somewhere good for water sports”** — `gpt-6-luna-fast`, `gpt-6-luna`, `qwen3.5-flash` and `muse-spark-1.3-contributor` reported it as unsupported.",
        "**“Find me a dog-friendly campground within 2 hours of Vancouver…”** — `nemotron-3.5-lightning` and `gemini-2.5-flash-lite` missed one of five checks, `llama-3.1-8b` two.",
        "**“well-reviewed campgrounds, at least 4 stars, that I can book online”** — `claude-haiku-5.5` and `gemini-2.5-flash-lite` missed one of three checks.",
        "**“a campground with a hot tub, a spa and valet parking”** — `nemotron-3.5-lightning` missed one of two checks.",
        "**“open next Saturday”** — `llama-3.1-8b` got the date wrong.",
        "**“somewhere open in the middle of next July”** and **“a campsite that was open last Christmas”** — `gemini-2.5-flash-lite`.",
        "**“a quiet campground under $30 a night with no generators”** — `llama-3.1-8b` missed one of two checks.",
        "**“campgrounds near Tofino”** and **“anything around here with a beach”** — `llama-3.1-8b`’s calls failed.",
      ],
    },
    {
      type: "paragraph",
      text: "Every model that answered handled the prompt-injection attempt, the keyboard mash, coordinates, “near me” phrasing and both Vancouvers.",
    },
    {
      type: "heading",
      text: "The full numbers",
    },
    {
      type: "code",
      title: "29 sentences × 9 models · 9 October 2026",
      lines: [
        "model                             score  checks  answered  median     p95    min  out tok/s  in+out tok/s  tokens in / out   $/1k  run cost",
        "xiaomi/mimo-v2.5                 100.0%   52/52     29/29   7.23s  20.50s  3.08s         14           201       1397 / 129  $0.23   $0.0067",
        "openai/gpt-6-luna-fast            98.1%   51/52     29/29   1.42s   1.96s  1.07s         83          1417       1908 / 120  $0.50   $0.0145",
        "anthropic/claude-haiku-5.5        98.1%   51/52     29/29   1.55s   3.64s  893ms         91          2214       3304 / 193  $0.43   $0.0124",
        "openai/gpt-6-luna                 98.1%   51/52     29/29   1.87s   3.47s  1.26s         67          1077       1908 / 123  $0.25   $0.0073",
        "alibaba/qwen3.5-flash             98.1%   51/52     29/29   5.72s  28.96s  2.96s        137           483      2001 / 1563  $0.83   $0.0239",
        "meta/muse-spark-1.3-contributor   98.1%   51/52     29/29   7.66s  15.71s  4.38s        113           378      1949 / 1029  $0.40   $0.0116",
        "nvidia/nemotron-3.5-lightning     96.2%   50/52     29/29  10.94s  20.75s  2.70s        447           607      1483 / 4516  $0.98   $0.0283",
        "meta/llama-3.1-8b                 92.0%   46/50     27/29   1.20s   2.74s  675ms         25          1196        1410 / 60  $0.32   $0.0087",
        "google/gemini-2.5-flash-lite      90.4%   47/52     29/29   1.09s   1.61s  902ms        127          1869       1906 / 139  $0.25   $0.0071",
      ],
    },
    {
      type: "list",
      items: [
        "**Latency** includes network, queueing and time to first token. Failed calls are excluded. *Run cost* is what the whole 29-sentence run cost.",
        "**Throughput** is output tokens over end-to-end seconds, so it understates raw decode speed; the in+out column counts prompt tokens too. A reasoning model’s hidden tokens count only if the provider bills them as output.",
        "**Score** leaves out a failed call’s checks; *answered* is how many calls returned valid output. `llama-3.1-8b` failed 2 of 29 calls, so it was graded on the 50 checks from the calls it answered, and its *$/1k* is over those 27 calls.",
      ],
    },
    {
      type: "callout",
      title: "One run, small set",
      text: "This is one run of 29 sentences from one machine in one session. Latency varies by time of day and provider load, so treat gaps of a few hundred milliseconds as noise.",
    },
    {
      type: "heading",
      text: "Takeaways",
    },
    {
      type: "list",
      items: [
        "**Accuracy is nearly solved for this task.** Six of nine models were within one check of perfect. The choice comes down to speed and cost.",
        "**Test dates hardest.** Relative dates are where the fastest models fell down, and they’re easy to miss without a fixed “today” in the test.",
        "**Count tokens, not tokens per second.** A model that thinks for 4,500 tokens is slow however fast it streams.",
        "**Small, fast models are enough.** `gpt-6-luna`, `gpt-6-luna-fast` and `claude-haiku-5.5` all had median answers under two seconds for $0.50 or less per 1,000 searches.",
      ],
    },
  ],
  short: [
    {
      type: "paragraph",
      text: "[Milemark](https://milemark.camp)’s **Ask** box turns a sentence like “dog-friendly campground within 2 hours of Vancouver with showers, available this weekend” into map filters. We ran nine fast, inexpensive LLMs over the same 29 sentences and 52 checks, with the same prompt, schema and gateway.",
    },
    {
      type: "heading",
      text: "Overview",
    },
    {
      type: "paragraph",
      text: "All four measures side by side. The highlighted models are the three that turned out both accurate and fast.",
    },
    overviewFigure,
    {
      type: "heading",
      text: "Most models got it right",
    },
    {
      type: "paragraph",
      text: "Six of nine scored 98% or better. Only `xiaomi/mimo-v2.5` passed every check, at a 7.2-second median.",
    },
    scoreFigure,
    {
      type: "heading",
      text: "Three were accurate and fast",
    },
    {
      type: "paragraph",
      text: "`gpt-6-luna-fast` (1.4 s), `claude-haiku-5.5` (1.6 s) and `gpt-6-luna` (1.9 s) each missed one check. `gpt-6-luna` was cheapest of the three at $0.25 per 1,000 searches.",
    },
    latencyFigure,
    {
      type: "heading",
      text: "What separated the rest",
    },
    {
      type: "list",
      items: [
        "**Dates.** `gemini-2.5-flash-lite` was fastest (1.1 s) but scored lowest (90%), missing “this weekend”, “the middle of next July” and “last Christmas”. `llama-3.1-8b` also missed a date and twice broke the schema.",
        "**Token spend.** `nemotron-3.5-lightning` streamed 447 tokens a second but spent ~4,500 per answer, making it the slowest (10.9 s) and most expensive ($0.98 per 1,000).",
        "**Vague wording.** Four models reported “somewhere good for water sports” as unsupported instead of mapping it to water activities.",
      ],
    },
    tokensFigure,
    {
      type: "paragraph",
      text: "This is one run of 29 sentences, so treat latency gaps of a few hundred milliseconds as noise.",
    },
  ],
  tldr: [
    {
      type: "list",
      items: [
        "We ran nine small LLMs over Milemark’s 29-sentence search test set (52 checks): same prompt, schema and gateway.",
        "Six scored 98% or better; only `mimo-v2.5` was perfect, at a 7.2 s median.",
        "`gpt-6-luna-fast`, `claude-haiku-5.5` and `gpt-6-luna` were accurate and under 2 s; `gpt-6-luna` cost $0.25 per 1,000 searches.",
        "The two quickest to answer fell down on relative dates; `nemotron-3.5-lightning` streamed fastest but spent ~4,500 tokens per answer and was slowest overall.",
      ],
    },
    {
      type: "quote",
      text: "How many tokens a model spends matters more than how fast it produces them.",
    },
  ],
};
