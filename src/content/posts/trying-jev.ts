import confidenceFloorImage from "@/assets/images/blog/jev/confidence-floor.png";
import coverImage from "@/assets/images/blog/jev/cover.png";
import fallbackImage from "@/assets/images/blog/jev/fallback.png";
import firstResultsImage from "@/assets/images/blog/jev/first-results.png";
import scoreWhatMattersImage from "@/assets/images/blog/jev/score-what-matters.png";
import sentenceToQuestionsImage from "@/assets/images/blog/jev/sentence-to-questions.png";
import type { LocalSource } from "./index";

export const tryingJev: LocalSource = {
  kind: "local",
  slug: "trying-jev-for-natural-language-search",
  title: "What we learned trying Jev for natural-language search",
  excerpt:
    "We rebuilt Milemark’s natural-language search as ~90 yes/no and multiple-choice questions for Jev: 90% of checks passed at 409 ms and $0.34 per 1,000 searches, but our confidence scoring sent every search back to the LLM.",
  date: "2026-10-01",
  cover: coverImage,
  lead: "Jev can’t write, so we asked it questions — and found that how you score its confidence matters as much as the model.",
  body: [
    {
      type: "paragraph",
      text: "[Milemark](https://milemark.camp) is a map of campgrounds. Its **Ask** box lets campers type a request like “dog friendly campground with showers near Banff next weekend”. We turn that sentence into map filters.",
    },
    {
      type: "paragraph",
      text: "Until now, a large language model did that work. We send it the sentence, and it returns a structured object: facilities, a place, a date, and so on. That works, but every search costs an LLM call. LLMs are also unreliable at date arithmetic, and we had built extra routing to send date-heavy questions to stronger models.",
    },
    {
      type: "paragraph",
      text: "So we tried **Jev**, a “System One” model from TypeSafe. This post covers how we used it and what we found.",
    },
    {
      type: "heading",
      text: "What Jev does differently",
    },
    {
      type: "paragraph",
      text: "Jev doesn’t write text. You give it some content and a list of typed questions, and it answers all of them in one call:",
    },
    {
      type: "list",
      items: [
        "**Yes/no questions**, each answered with a probability.",
        "**Multiple-choice questions**, answered with the chosen option and a confidence.",
      ],
    },
    {
      type: "paragraph",
      text: "It can’t produce strings or free numbers. Its documentation says it’s unreliable at arithmetic and at comparing dates. In return it’s fast and very cheap, and every answer comes with a number that says how sure it is.",
    },
    {
      type: "heading",
      text: "Turning a search box into questions",
    },
    {
      type: "paragraph",
      text: "The main work was rephrasing “parse this sentence” as questions Jev can answer:",
    },
    {
      type: "list",
      items: [
        "**Filters:** one yes/no question per filter, such as “Does the camper need a campground with showers?” Our filter list generates these, so a new filter gets a question automatically.",
        "**Country, rating and coverage:** one multiple-choice question each.",
        "**Place names:** Jev can’t write a place name. Our code lists every 1–3-word span of the sentence (“banff”, “near banff”, …), and Jev picks the span that names the place. The answer is always the camper’s own words.",
        "**Travel limits (“within 2 hours”):** a regex finds number-and-unit phrases. Jev picks the one that is the limit, and our code converts minutes to hours or miles to kilometres.",
        "**Dates:** Jev reads the parts (this or next, weekday, month, day), and our code does the calendar maths. It resolves “next weekend”, rolls a past date into next year, and rejects February 30.",
      ],
    },
    {
      type: "paragraph",
      text: "The result is the same structure the LLM produces. The rest of the pipeline, including validation, caching and place lookup, didn’t change.",
    },
    {
      type: "image",
      src: sentenceToQuestionsImage,
      alt: "The sentence split into questions: pet-friendly yes, showers yes, the place span “banff”, and next weekend, which code turns into Saturday",
      caption:
        "Jev picks and says yes or no; our code does the calendar maths.",
    },
    {
      type: "heading",
      text: "Keeping the LLM as a safety net",
    },
    {
      type: "paragraph",
      text: "Jev only answers when it’s sure. If its confidence is too low, if it notices a request we can’t handle, or if the call fails, the search falls through to the existing LLM path. A camper never sees a Jev error. At worst the search is a little slower.",
    },
    {
      type: "image",
      src: fallbackImage,
      alt: "Flow: the search goes to Jev; if it’s sure, straight to map filters; if not, through the existing LLM",
      caption:
        "Low confidence, an unhandled request or a failed call all fall through to the path we already trust.",
    },
    {
      type: "paragraph",
      text: "The setup was simpler than we expected. Vercel’s AI Gateway serves Jev as `typesafe-ai/jev`, so we used the gateway key we already had. We didn’t need a new account, a new key or a new SDK, just one `fetch` call.",
    },
    {
      type: "heading",
      text: "The first results",
    },
    {
      type: "paragraph",
      text: "We ran Jev alone over our test set of 29 sentences. The set covers easy filters, places, travel times, dates, nonsense and one prompt-injection attempt.",
    },
    {
      type: "code",
      title: "jev alone — 29-sentence test set",
      lines: [
        "metric                     jev",
        "test checks passed         90%",
        "median latency             409 ms",
        "95th-percentile latency    497 ms",
        "cost per 1,000 searches    about $0.34",
        "whole test run             about $0.01",
      ],
    },
    {
      type: "paragraph",
      text: "Jev got most sentences right. For “dog friendly campground with showers near Banff next weekend” it returned showers, pet-friendly, Banff, and the correct Saturday.",
    },
    {
      type: "image",
      src: firstResultsImage,
      alt: "Jev alone on 29 sentences: 90% of checks passed, 409 ms median latency, about $0.34 per 1,000 searches",
      caption:
        "Mostly right, fast and cheap, before the fallback even enters the picture.",
    },
    {
      type: "heading",
      text: "The surprise: it was never sure enough",
    },
    {
      type: "paragraph",
      text: "Even when Jev was right, it almost never cleared our confidence bar:",
    },
    {
      type: "code",
      title: "confidence floor vs. share sent to the LLM",
      lines: [
        "confidence floor   share sent to the LLM",
        "0.6                62%",
        "0.7                97%",
        "0.8                100%",
        "0.9                100%",
      ],
    },
    {
      type: "paragraph",
      text: "At our planned floor of 0.8, Jev would have answered nothing on its own. The cause is how we scored confidence, more than how good Jev is. We took the **lowest confidence across all ~90 questions**, including the many that don’t apply to a given sentence. With that many questions, one of them will usually land near 50/50, and that one answer sets the score for the whole parse.",
    },
    {
      type: "image",
      src: confidenceFloorImage,
      alt: "Share of searches sent to the LLM: 62% at a 0.6 floor, 97% at 0.7, 100% at 0.8 and 0.9",
      caption: "At our planned floor of 0.8, every search went to the LLM.",
    },
    {
      type: "paragraph",
      text: "Two smaller findings:",
    },
    {
      type: "list",
      items: [
        "The “anything else we didn’t cover?” question fired on 3 of 29 sentences, including one we handle completely.",
        "Each call used about 8,000 input tokens, because 90 questions with descriptions add up. It’s still cheap at this price, but the cost comes from the size of the question list, not from the camper’s sentence.",
      ],
    },
    {
      type: "heading",
      text: "What we’re changing next",
    },
    {
      type: "list",
      items: [
        "**Score only what matters.** Take the lowest confidence among the answers that actually set something (the filters that came back “yes”, the place, the date), as we originally planned. Then re-run the test set to pick a floor.",
        "**Tune the “anything else?” question** so it stops firing on sentences we already cover.",
        "**Measure in production before relying on it.** Jev stays behind a switch that is off by default. Our analytics can’t yet tell a Jev answer from an LLM answer, so we’ll add that before turning it on.",
      ],
    },
    {
      type: "image",
      src: scoreWhatMattersImage,
      alt: "Now: the lowest of ~90 answers, where one 50/50 question sinks the parse. Next: the lowest of only the answers that set something",
      caption:
        "Only the answers that set a filter, place or date should decide whether Jev is trusted.",
    },
    {
      type: "heading",
      text: "Takeaways",
    },
    {
      type: "list",
      items: [
        "**Rephrasing the problem is most of the work.** Jev can’t write, so you design questions around what it can do: pick, rank and say yes or no. Letting code do the arithmetic and copy the camper’s own words worked well.",
        "**Confidence is the product.** The speed and price are appealing, but the value comes from the confidence score. How you combine 90 confidences into one decision matters as much as the model.",
        "**Keep the fallback.** Because the LLM path stays in place, trying Jev is low-risk: when it’s unsure, campers get the same answer they get today.",
      ],
    },
    {
      type: "paragraph",
      text: "We’ll share updated numbers once we’ve re-scored the results.",
    },
  ],
  short: [
    {
      type: "paragraph",
      text: "[Milemark](https://milemark.camp)’s **Ask** box turns a sentence like “dog friendly campground with showers near Banff next weekend” into map filters. Until now an LLM did that, at an LLM call per search. So we tried **Jev**, a “System One” model from TypeSafe.",
    },
    {
      type: "heading",
      text: "What Jev does differently",
    },
    {
      type: "paragraph",
      text: "Jev doesn’t write text. It answers a list of typed questions in one call: yes/no questions with a probability, and multiple-choice questions with a confidence. It can’t write strings or do reliable arithmetic, but it’s fast, very cheap, and every answer says how sure it is.",
    },
    {
      type: "heading",
      text: "Turning a search box into questions",
    },
    {
      type: "paragraph",
      text: "Each filter becomes a yes/no question; country, rating and coverage are multiple-choice. For place names, our code lists every 1–3-word span and Jev picks the one naming the place. For dates, Jev reads the parts and our code does the calendar maths. The output matches the LLM’s structure.",
    },
    {
      type: "image",
      src: sentenceToQuestionsImage,
      alt: "The sentence split into questions: pet-friendly yes, showers yes, the place span “banff”, and next weekend, which code turns into Saturday",
      caption:
        "Jev picks and says yes or no; our code does the calendar maths.",
    },
    {
      type: "paragraph",
      text: "If Jev is unsure, flags a request we can’t handle, or fails, the search falls through to the existing LLM path. Vercel’s AI Gateway serves Jev as `typesafe-ai/jev`: one `fetch` call.",
    },
    {
      type: "image",
      src: fallbackImage,
      alt: "Flow: the search goes to Jev; if it’s sure, straight to map filters; if not, through the existing LLM",
      caption:
        "Low confidence, an unhandled request or a failed call all fall through to the path we already trust.",
    },
    {
      type: "heading",
      text: "The first results",
    },
    {
      type: "paragraph",
      text: "On our 29-sentence test set, Jev alone passed 90% of checks at 409 ms median (497 ms p95), about $0.34 per 1,000 searches.",
    },
    {
      type: "image",
      src: firstResultsImage,
      alt: "Jev alone on 29 sentences: 90% of checks passed, 409 ms median latency, about $0.34 per 1,000 searches",
      caption:
        "Mostly right, fast and cheap, before the fallback even enters the picture.",
    },
    {
      type: "heading",
      text: "The surprise: it was never sure enough",
    },
    {
      type: "code",
      title: "confidence floor vs. share sent to the LLM",
      lines: [
        "confidence floor   share sent to the LLM",
        "0.6                62%",
        "0.7                97%",
        "0.8                100%",
        "0.9                100%",
      ],
    },
    {
      type: "paragraph",
      text: "At our planned floor of 0.8, Jev answered nothing on its own. The cause is our scoring: we took the **lowest confidence across all ~90 questions**, and one near-50/50 answer to an irrelevant question sank the whole parse. Each call also used about 8,000 input tokens.",
    },
    {
      type: "image",
      src: confidenceFloorImage,
      alt: "Share of searches sent to the LLM: 62% at a 0.6 floor, 97% at 0.7, 100% at 0.8 and 0.9",
      caption: "At our planned floor of 0.8, every search went to the LLM.",
    },
    {
      type: "heading",
      text: "What we’re changing next",
    },
    {
      type: "paragraph",
      text: "Score only the answers that set something, then re-pick a floor; tune the “anything else?” question; and keep Jev behind an off-by-default switch until production analytics can tell its answers apart.",
    },
    {
      type: "image",
      src: scoreWhatMattersImage,
      alt: "Now: the lowest of ~90 answers, where one 50/50 question sinks the parse. Next: the lowest of only the answers that set something",
      caption:
        "Only the answers that set a filter, place or date should decide whether Jev is trusted.",
    },
    {
      type: "heading",
      text: "Takeaways",
    },
    {
      type: "list",
      items: [
        "**Rephrasing the problem is most of the work.** Design questions around picking and yes/no; let code do the arithmetic.",
        "**Confidence is the product.** How you combine 90 confidences matters as much as the model.",
        "**Keep the fallback.** When Jev is unsure, campers get the same answer they get today.",
      ],
    },
    {
      type: "paragraph",
      text: "We’ll share updated numbers once we’ve re-scored the results.",
    },
  ],
  tldr: [
    {
      type: "list",
      items: [
        "Milemark’s Ask box turns a camper’s sentence into map filters; we tried replacing the LLM with Jev, a model that only answers yes/no and multiple-choice questions.",
        "We rephrased parsing as ~90 questions: Jev picks filters, place spans and date parts, and our code does the arithmetic.",
        "Jev alone passed 90% of checks on 29 test sentences, at 409 ms median and about $0.34 per 1,000 searches.",
        "But at our planned 0.8 confidence floor, 100% of searches fell back to the LLM, because we scored the lowest confidence across all ~90 questions.",
        "Next: score only the answers that set something, and keep Jev behind an off-by-default switch with the LLM as fallback.",
      ],
    },
    {
      type: "quote",
      text: "How you combine confidences matters as much as the model.",
    },
  ],
};
