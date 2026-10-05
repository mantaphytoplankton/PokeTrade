# PokeTrade — Product Backlog & Stories

Derived from [brd.md](./brd.md). Each BRD feature is broken into one row per component that implements it (App / MCP / Agent / RAG) so each row is independently testable and assignable. `story-mapping.md` (not yet created) will hold the visual story map; links below are anchors to fill in once that document exists.

## MVP Batches

Each MVP is a complete, shippable user flow — not a technical layer. Later MVPs build on earlier ones; none ships partially implemented.

| MVP | Theme | Complete User Flow | User Value | Features |
| --- | --- | --- | --- | --- |
| MVP-1 | Build & Browse a Collection | Register/log in → search the catalog → add a card → browse the collection grid → open Card Details | Start cataloging real cards against real, honestly-labeled price data | 25 |
| MVP-2 | Evaluate a Trade with AI | Open a card → build a trade draft → ask the agent whether it's fair, grounded in catalog + rules data | Get a trustworthy, sourced fairness judgment instead of guessing | 16 |
| MVP-3 | Personalize Cards & Track Wants | Attach a real photo to an owned card → maintain a want list of what's missing | Collection reflects true condition; collector knows what to seek out | 7 |
| MVP-4 | Set-Level Insight & Alerts | Open a set → see completion/coverage and set-specific notes → get proactive alerts on price or data changes | Plan acquisitions at the set level; get warned before being caught off guard | 7 |

**Not yet batched:** WANT-02 (want-list match on another user's public trade offer) depends on a public trade-sharing capability that isn't specified anywhere in brd.md beyond "if sharing is enabled later." It has no home MVP until that dependency is scoped — flagged `TBD` rather than forced into a batch.

## Product Backlog

| Index | Component | Module | Feature Code | Feature Name | Description | Story Map | MVP Batch | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | App | Account Management | ACCT-01 | Register | Create account with name, email, optional photo, collector experience level, password | [story-mapping.md#ACCT-01](story-mapping.md#ACCT-01) | MVP-1 | ToDo |
| 2 | App | Account Management | ACCT-02 | Log in | Authenticate with email and password | [story-mapping.md#ACCT-02](story-mapping.md#ACCT-02) | MVP-1 | Done |
| 3 | App | Account Management | ACCT-03 | Reset password | Request and complete a password reset via email | [story-mapping.md#ACCT-03](story-mapping.md#ACCT-03) | MVP-1 | Done |
| 4 | App | Account Management | ACCT-04 | Account header | Show "Hello, [Username]" + avatar + Logout on authenticated pages | [story-mapping.md#ACCT-04](story-mapping.md#ACCT-04) | MVP-1 | Done |
| 5 | App | Collection Cards | COLL-01 | Collection grid | Show owned cards in a responsive grid, filterable by set/rarity/language | [story-mapping.md#COLL-01](story-mapping.md#COLL-01) | MVP-1 | Done |
| 6 | App | Collection Cards | COLL-02 | Card tile content | Each tile shows name/set/number/condition/quantity/price snapshot/thumbnail with placeholders for missing data | [story-mapping.md#COLL-02](story-mapping.md#COLL-02) | MVP-1 | Done |
| 7 | App | Collection Cards | COLL-03 | Grid navigation | Click a card to open Card Details; click a set to open Set Overview | [story-mapping.md#COLL-03](story-mapping.md#COLL-03) | MVP-1 | ToDo |
| 8 | App | Want List | WANT-01 | Add want-list entry | Add a wanted card with quantity and optional max willing price | [story-mapping.md#WANT-01](story-mapping.md#WANT-01) | MVP-3 | ToDo |
| 9 | App | Want List | WANT-02 | Want-list match highlight | Highlight a want-list card appearing in another user's public trade offer (requires sharing, later) | [story-mapping.md#WANT-02](story-mapping.md#WANT-02) | TBD | ToDo |
| 10 | App | Want List | WANT-03 | Duplicate want guard | Block duplicate want entries for the same card identity unless condition variants differ | [story-mapping.md#WANT-03](story-mapping.md#WANT-03) | MVP-3 | ToDo |
| 11 | App | Add / Search Cards | SRCH-01 | Search UI | Enter a name, set code, or card number and submit a catalog search | [story-mapping.md#SRCH-01](story-mapping.md#SRCH-01) | MVP-1 | ToDo |
| 12 | MCP | Add / Search Cards | SRCH-02 | search_cards tool | Query the catalog by name/set code/number and return standardized matches | [story-mapping.md#SRCH-02](story-mapping.md#SRCH-02) | MVP-1 | ToDo |
| 13 | App | Add / Search Cards | SRCH-03 | Printing disambiguation | Choose the correct printing when multiple matches differ by language/set/variant | [story-mapping.md#SRCH-03](story-mapping.md#SRCH-03) | MVP-1 | ToDo |
| 14 | App | Add / Search Cards | SRCH-04 | Add to Collection/Want List | Add the chosen card to Collection or Want List with condition and quantity | [story-mapping.md#SRCH-04](story-mapping.md#SRCH-04) | MVP-1 | ToDo |
| 15 | App | Add / Search Cards | SRCH-05 | Manual photo upload | Upload a card picture (camera or file) when adding or editing an owned card | [story-mapping.md#SRCH-05](story-mapping.md#SRCH-05) | MVP-3 | ToDo |
| 16 | App | Add / Search Cards | SRCH-06 | Thumbnail precedence | Prefer user photo, then catalog image, then a placeholder | [story-mapping.md#SRCH-06](story-mapping.md#SRCH-06) | MVP-1 | Done |
| 17 | App | Add / Search Cards | SRCH-07 | Photo validation & replace/remove | Validate file type/size; allow replace or remove with confirmation | [story-mapping.md#SRCH-07](story-mapping.md#SRCH-07) | MVP-3 | ToDo |
| 18 | App | Card Details | CARD-01 | Card Details view | Show full catalog details, images, and price history summary | [story-mapping.md#CARD-01](story-mapping.md#CARD-01) | MVP-1 | Done |
| 19 | App | Card Details | CARD-02 | Edit card picture | Upload, replace, or remove the card picture from Card Details | [story-mapping.md#CARD-02](story-mapping.md#CARD-02) | MVP-3 | ToDo |
| 20 | App | Card Details | CARD-03 | Link to Trade Analysis | Navigate from Card Details into Trade Analysis for this card | [story-mapping.md#CARD-03](story-mapping.md#CARD-03) | MVP-2 | ToDo |
| 21 | App | Card Details | CARD-04 | Remove from Collection/Want List | Remove the card from Collection or Want List with confirmation | [story-mapping.md#CARD-04](story-mapping.md#CARD-04) | MVP-3 | ToDo |
| 22 | App | Card Details | CARD-05 | Close interactions | Close Card Details via Close button, Escape, or outside click | [story-mapping.md#CARD-05](story-mapping.md#CARD-05) | MVP-1 | ToDo |
| 23 | MCP | Price Status Classification | PRICE-01 | Price signal | Classify a card's price as Green/Yellow/Red with label and description | [story-mapping.md#PRICE-01](story-mapping.md#PRICE-01) | MVP-1 | Done |
| 24 | Agent | Price Status Classification | PRICE-02 | Trade fairness signal | Classify a proposed trade as Green/Yellow/Red with label and description | [story-mapping.md#PRICE-02](story-mapping.md#PRICE-02) | MVP-2 | ToDo |
| 25 | App | Price Status Classification | PRICE-03 | Signal rendering | Render both signals with text label and description; never color alone | [story-mapping.md#PRICE-03](story-mapping.md#PRICE-03) | MVP-1 | Done |
| 26 | MCP | Catalog / Price MCP | CATMCP-01 | Catalog & price retrieval | search_cards/get_card/get_set tools over approved providers (TCGdex primary) | [story-mapping.md#CATMCP-01](story-mapping.md#CATMCP-01) | MVP-1 | ToDo |
| 27 | MCP | Catalog / Price MCP | CATMCP-02 | Data normalization | Normalize multi-provider data; flag stale, missing, or conflicting prices | [story-mapping.md#CATMCP-02](story-mapping.md#CATMCP-02) | MVP-1 | Done |
| 28 | MCP | Catalog / Price MCP | CATMCP-03 | Standard response contract | Return standardized identity, price snapshots, sources, last update, confidence on every tool call | [story-mapping.md#CATMCP-03](story-mapping.md#CATMCP-03) | MVP-1 | ToDo |
| 29 | MCP | Collection Alerts | ALERT-01 | Alert detection | Detect large price swings, missing price, reprints, and condition caveats worth flagging | [story-mapping.md#ALERT-01](story-mapping.md#ALERT-01) | MVP-4 | ToDo |
| 30 | App | Collection Alerts | ALERT-02 | Alert surfacing | Show alerts on Collection Cards and Card Details; highlight increased severity | [story-mapping.md#ALERT-02](story-mapping.md#ALERT-02) | MVP-4 | ToDo |
| 31 | App | Trade Scratchpad | SCRATCH-01 | Build trade draft | Select offered/requested cards; show side totals and the gap | [story-mapping.md#SCRATCH-01](story-mapping.md#SCRATCH-01) | MVP-2 | ToDo |
| 32 | App | Trade Scratchpad | SCRATCH-02 | Multi-card packages | Support multi-card packages with currency and source shown per line | [story-mapping.md#SCRATCH-02](story-mapping.md#SCRATCH-02) | MVP-2 | ToDo |
| 33 | App | Trade Scratchpad | SCRATCH-03 | Save / clear draft | Save a trade draft; clear it with confirmation | [story-mapping.md#SCRATCH-03](story-mapping.md#SCRATCH-03) | MVP-2 | ToDo |
| 34 | Agent | Trade Analytics Agent | AGENT-01 | Trade grounding | Analyze a proposed trade using poke-catalog-mcp and poke-rules-rag data | [story-mapping.md#AGENT-01](story-mapping.md#AGENT-01) | MVP-2 | ToDo |
| 35 | Agent | Trade Analytics Agent | AGENT-02 | Analysis factors | Factor print rarity, condition assumptions, language, avg1/7/30, and data gaps into the analysis | [story-mapping.md#AGENT-02](story-mapping.md#AGENT-02) | MVP-2 | ToDo |
| 36 | Agent | Trade Analytics Agent | AGENT-03 | Fact/assessment/prediction split | Separate catalog facts, assessments, and predictions in every response; never present an estimate as guaranteed | [story-mapping.md#AGENT-03](story-mapping.md#AGENT-03) | MVP-2 | ToDo |
| 37 | Agent | Trade Analytics Agent | AGENT-04 | Trade Analysis chat behavior | Keep the trade draft in conversation context; system prompt in a version-controlled file | [story-mapping.md#AGENT-04](story-mapping.md#AGENT-04) | MVP-2 | ToDo |
| 38 | Agent | Trade Analytics Agent | AGENT-05 | Set Overview chat behavior | Keep the selected set in conversation context; system prompt in a version-controlled file | [story-mapping.md#AGENT-05](story-mapping.md#AGENT-05) | MVP-4 | ToDo |
| 39 | App | Trade Analysis | TRADE-01 | Trade Analysis screen | Show side values, gap, volatility notes, collector impact, sources, last update, confidence | [story-mapping.md#TRADE-01](story-mapping.md#TRADE-01) | MVP-2 | ToDo |
| 40 | App | Trade Analysis | TRADE-02 | Trade Analysis chat UI | Chat about the selected trade draft | [story-mapping.md#TRADE-02](story-mapping.md#TRADE-02) | MVP-2 | ToDo |
| 41 | App | Set Overview | SET-01 | Set Overview screen | Show set identity, card count, owned vs missing, price coverage, sources, last update, confidence | [story-mapping.md#SET-01](story-mapping.md#SET-01) | MVP-4 | ToDo |
| 42 | MCP | Set Overview | SET-02 | Set card listing | Return all cards in a set with price-coverage flags, for owned-vs-missing and coverage calculations | [story-mapping.md#SET-02](story-mapping.md#SET-02) | MVP-4 | ToDo |
| 43 | App | Set Overview | SET-03 | Set Overview chat UI | Chat about the selected set | [story-mapping.md#SET-03](story-mapping.md#SET-03) | MVP-4 | ToDo |
| 44 | RAG | Rules / Market RAG | RAG-01 | Generic knowledge load | Load generic trade/grading/reprint/pitfall knowledge at app launch | [story-mapping.md#RAG-01](story-mapping.md#RAG-01) | MVP-2 | ToDo |
| 45 | RAG | Rules / Market RAG | RAG-02 | Set-specific knowledge load | Load set-specific notes on demand when a new set is accessed, then cache | [story-mapping.md#RAG-02](story-mapping.md#RAG-02) | MVP-4 | ToDo |
| 46 | RAG | Rules / Market RAG | RAG-03 | Sourced knowledge items | Every knowledge item carries a source and date where available; prefer authoritative references | [story-mapping.md#RAG-03](story-mapping.md#RAG-03) | MVP-2 | ToDo |
| 47 | App | Data Quality | DQ-01 | Last-updated display | Show when price and catalog information was last updated, everywhere it appears | [story-mapping.md#DQ-01](story-mapping.md#DQ-01) | MVP-1 | ToDo |
| 48 | MCP | Data Quality | DQ-02 | Data-quality flags | Flag stale, incomplete, unavailable, or conflicting data; distinguish list price, last sale, and average | [story-mapping.md#DQ-02](story-mapping.md#DQ-02) | MVP-1 | ToDo |
| 49 | Agent | Data Quality | DQ-03 | Non-authoritative disclaimer | Never present AI value judgments as official Pokémon Company, shop, or marketplace valuations | [story-mapping.md#DQ-03](story-mapping.md#DQ-03) | MVP-2 | ToDo |
| 50 | MCP | Data Quality | DQ-04 | Provider failure isolation | One provider failure must not take down the whole app | [story-mapping.md#DQ-04](story-mapping.md#DQ-04) | MVP-1 | Done |
| 51 | App | Performance | PERF-01 | Progressive collection load | Show stored collection info immediately while price updates load in the background | [story-mapping.md#PERF-01](story-mapping.md#PERF-01) | MVP-1 | Done |
| 52 | App | Performance | PERF-02 | Latency contract & progress tips | Meet the ≤20s per-component target with a ~10s "more time is needed" tip; fetch in parallel | [story-mapping.md#PERF-02](story-mapping.md#PERF-02) | MVP-1 | ToDo |
| 53 | MCP | Performance | PERF-03 | Caching, timeout, retry, fallback | Cache with last-updated time; apply timeouts/retries; fall back only after the wait path completes | [story-mapping.md#PERF-03](story-mapping.md#PERF-03) | MVP-1 | ToDo |
| 54 | Agent | Performance | PERF-04 | No redundant LLM calls | Avoid unnecessary repeated LLM calls for the same logical output within a conversation | [story-mapping.md#PERF-04](story-mapping.md#PERF-04) | MVP-2 | ToDo |
| 55 | RAG | Performance | PERF-05 | No redundant retrieval calls | Avoid unnecessary repeated RAG retrieval for the same query/context within a conversation | [story-mapping.md#PERF-05](story-mapping.md#PERF-05) | MVP-2 | ToDo |
| 56 | App | Collection Cards | COLL-04 | Sort collection by name | Sort owned cards by card name (A–Z or Z–A); composes with any active set/rarity/language filter | [story-mapping.md#COLL-04](story-mapping.md#COLL-04) | TBD | Done |

New rows append at the end rather than renumbering the table to stay module-contiguous — Feature Code (not Index) is what groups a feature with its module; sort/filter this table by Module when you need a grouped view.

## Feature Code Legend

`ACCT` Account Management · `COLL` Collection Cards · `WANT` Want List · `SRCH` Add/Search Cards · `CARD` Card Details · `PRICE` Price Status Classification · `CATMCP` Catalog/Price MCP · `ALERT` Collection Alerts · `SCRATCH` Trade Scratchpad · `AGENT` Trade Analytics Agent · `TRADE` Trade Analysis · `SET` Set Overview · `RAG` Rules/Market RAG · `DQ` Data Quality · `PERF` Performance

---

## Stories & Acceptance Criteria

### Account Management

#### ACCT-01 — Register

As a new collector, I want to create an account, so that I can start tracking my collection.

- Given the registration form, when I submit name, email, password, and collector experience level with a photo omitted, then the account is created and I am signed in.
- Given the registration form, when I submit an email already registered, then registration is rejected with a clear "email already in use" message and no duplicate account is created.
- Given the registration form, when I submit a password that fails policy (e.g. too short), then registration is rejected with a specific validation message and no account is created.
- Given the registration form, when I attach a profile photo, then it is stored and shown as my avatar after sign-in.

#### ACCT-02 — Log in

As a registered collector, I want to log in with email and password, so that I can access my collection.

- Given a registered account, when I submit the correct email and password, then I am authenticated and redirected to my dashboard.
- Given a registered account, when I submit an incorrect password, then authentication fails with an "invalid email or password" message and no session is established.
- Given no account exists for an email, when I submit that email with any password, then authentication fails with the same generic "invalid email or password" message (no user enumeration).

#### ACCT-03 — Reset password

As a collector who forgot my password, I want to reset it via email, so that I can regain access.

- Given a registered email, when I request a password reset, then a reset email is sent and a generic confirmation is shown regardless of whether the email exists.
- Given a valid, unexpired reset link, when I submit a new password meeting policy, then my password is updated and I can log in with it.
- Given an expired or already-used reset link, when I open it, then I see an "expired or invalid link" message and no password is changed.

#### ACCT-04 — Account header

As an authenticated collector, I want to see my identity in the header, so that I always know I'm signed in and can log out.

- Given I am signed in, when any authenticated page loads, then the header shows "Hello, [Username]", my avatar, and a Logout control.
- Given the header, when I select Logout, then my session ends and I am returned to the login page.

### Collection Cards

#### COLL-01 — Collection grid

As a collector, I want to see my owned cards in a filterable grid, so that I can browse my collection quickly.

- Given owned cards exist, when I open Collection, then they render in a responsive grid.
- Given the grid is open, when I filter by set, rarity, or language (individually or combined), then only matching cards remain visible and the count updates.
- Given a filter matches no cards, when it is applied, then an empty state is shown instead of a blank grid.

#### COLL-02 — Card tile content

As a collector, I want each tile to show the key facts about that card, so that I don't need to open details for routine browsing.

- Given a card tile, when data is complete, then it shows name, set, number, condition, quantity, latest price snapshot, and thumbnail.
- Given a card is missing a price snapshot or thumbnail, when the tile renders, then a clear placeholder is shown in place of the missing field, not a blank or broken element.

#### COLL-03 — Grid navigation

As a collector, I want to jump from the grid into details, so that I can inspect one card or its set.

- Given the grid, when I click a card, then Card Details opens for that card.
- Given the grid, when I click a set label, then Set Overview opens for that set.

#### COLL-04 — Sort collection by name

As a collector, I want to sort my collection by card name, so that I can find a specific card quickly without scanning the whole grid.

- Given the grid, when no sort is chosen, then cards display in the order they were added to the collection (unchanged from today's behavior).
- Given the grid, when I choose "Name A–Z", then cards are ordered alphabetically ascending by name.
- Given "Name A–Z" is active, when I choose "Name Z–A", then the order reverses to descending.
- Given card names that differ only by case or accent (e.g. "pikachu" vs. "Pikachu", "Flabébé" vs. "Flabebe"), when sorted, then they order the same way a person alphabetizing by hand would — case and accents don't change the ordering.
- Given a set/rarity/language filter is active, when I also choose a sort, then only the filtered cards are sorted, and changing the filter afterward keeps the same sort applied to the new results.
- Given a filter narrows the grid to no cards, when a sort is also active, then the existing empty-filter message is shown — sorting does not add a second, separate empty state.
- Given two or more owned cards share the exact same name (e.g. two printings of the same card), when sorted, then their relative order stays stable across re-renders rather than jittering between them.

### Want List

#### WANT-01 — Add want-list entry

As a collector, I want to track cards I'm looking for, so that I know what to seek out in trades.

- Given a card identity, when I add it to my Want List with a quantity, then it appears in my Want List with that quantity.
- Given I add a want-list entry, when I optionally set a max willing price, then it is stored and shown alongside the entry.
- Given I omit the max willing price, when the entry is saved, then it displays as "no max set" rather than zero.

#### WANT-02 — Want-list match highlight

As a collector with sharing enabled, I want to see when someone else's public trade offer matches my want list, so that I can pursue it.

- Given public trade-offer sharing is enabled (future capability) and another user's offer includes a card on my want list, when I view my Want List, then that entry is highlighted with a link to the offer.
- Given sharing is not yet enabled, then this feature is out of scope for the current MVP batch and no highlight logic runs.

#### WANT-03 — Duplicate want guard

As a collector, I want duplicate want entries blocked, so that my list stays clean.

- Given a want-list entry already exists for a card identity and condition variant, when I try to add the same identity and condition variant again, then the app blocks it with a message pointing to the existing entry.
- Given an existing want-list entry, when I add the same card identity but a different condition variant, then a new, separate entry is created.

### Add / Search Cards

#### SRCH-01 — Search UI

As a collector, I want to search the catalog, so that I can find a specific card to add.

- Given the search field, when I enter a card name and submit, then matching results are shown.
- Given the search field, when I enter a set code or card number and submit, then matching results are shown.
- Given a query with no matches, when I submit, then a "no results" state is shown with a suggestion to refine the query.

#### SRCH-02 — search_cards tool

As a client application (WebApp or an external MCP consumer), I want a `search_cards` tool, so that I can query the catalog by name, set code, or number.

- Given a name, set code, or number parameter, when `search_cards` is called, then it returns matching cards as standardized `CardIdentity` records.
- Given a query that matches nothing, when `search_cards` is called, then it returns an empty result set, not an error.
- Given the upstream catalog provider times out, when `search_cards` is called, then it returns a typed error result (never a thrown exception across the tool boundary).

#### SRCH-03 — Printing disambiguation

As a collector, I want to pick the exact printing, so that the card I add matches what I actually own or want.

- Given a search result with multiple printings of the same card (different language, set, or variant), when I view the results, then each printing is shown distinctly enough to tell them apart.
- Given multiple printings shown, when I select one, then that specific printing (not a generic card identity) is carried forward to the add step.

#### SRCH-04 — Add to Collection/Want List

As a collector, I want to add a chosen card with my condition and quantity, so that my records reflect what I own or want.

- Given a selected printing, when I add it to Collection with a condition and quantity, then it appears in my Collection grid with those values.
- Given a selected printing, when I add it to my Want List, then it appears in my Want List per WANT-01 rules.
- Given I submit the add form without a required field (e.g. quantity), then the submission is rejected with a field-level error.

#### SRCH-05 — Manual photo upload

As a collector, I want to attach my own photo to an owned card, so that I can show its real condition.

- Given the add/edit card form, when I upload a photo via camera or file picker, then it is stored with that collection entry.
- Given no photo is uploaded, when the entry is saved, then it falls back to catalog imagery per SRCH-06.

#### SRCH-06 — Thumbnail precedence

As a collector, I want the most relevant image shown first, so that my collection view reflects reality.

- Given a collection entry with a user photo, when its thumbnail renders anywhere, then the user photo is shown.
- Given a collection entry with no user photo but a catalog image, when its thumbnail renders, then the catalog image is shown.
- Given a collection entry with neither, when its thumbnail renders, then a placeholder image is shown.

#### SRCH-07 — Photo validation & replace/remove

As a collector, I want invalid uploads rejected and my photo easy to change, so that bad files don't get stored.

- Given a file exceeding the size limit or with an unsupported type, when I attempt to upload it, then it is rejected with a specific error and nothing is stored.
- Given an existing uploaded photo, when I choose to replace it with a new valid file, then the old file is superseded by the new one.
- Given an existing uploaded photo, when I choose to remove it, then I am asked to confirm, and only after confirming is the photo deleted and the thumbnail falls back per SRCH-06.

### Card Details

#### CARD-01 — Card Details view

As a collector, I want full details on one card, so that I can evaluate it before a trade or purchase.

- Given a card, when I open Card Details, then it shows full catalog details, available images, and a price history summary.
- Given price history is unavailable for a card, when Card Details renders, then it shows a clear "no price history available" state rather than an empty chart.

#### CARD-02 — Edit card picture

As a collector, I want to manage my card's photo from details, so that I don't need to go back to the add/edit flow.

- Given Card Details for an owned card, when I upload, replace, or remove its picture, then the same rules as SRCH-05/06/07 apply and the change is reflected immediately in Card Details and the Collection grid.

#### CARD-03 — Link to Trade Analysis

As a collector, I want to jump straight into trade analysis for a card, so that I can evaluate a swap without re-selecting it.

- Given Card Details, when I select "Analyze in a trade," then Trade Analysis opens with this card pre-populated on one side of the draft.

#### CARD-04 — Remove from Collection/Want List

As a collector, I want to remove a card I no longer own or want, so that my lists stay accurate.

- Given Card Details for an owned or wanted card, when I choose Remove, then I am asked to confirm.
- Given the confirmation, when I confirm, then the entry is removed from Collection or Want List and Card Details closes.
- Given the confirmation, when I cancel, then no change is made and Card Details remains open.

#### CARD-05 — Close interactions

As a collector, I want multiple ways to close details, so that the interaction feels natural.

- Given Card Details is open, when I select Close, then it closes.
- Given Card Details is open, when I press Escape, then it closes.
- Given Card Details is open, when I click outside the panel, then it closes.

### Price Status Classification

#### PRICE-01 — Price signal

As a client application, I want a price stability signal per card, so that I can show collectors how much to trust a price.

- Given recent price data close to trailing averages, when the signal is computed, then it classifies as Green ("stable").
- Given volatile or incomplete recent price data, when the signal is computed, then it classifies as Yellow ("volatile or incomplete data").
- Given an outlier or conflicting cross-provider price, when the signal is computed, then it classifies as Red ("outlier / unreliable / conflicting sources").
- Given any classification, then it always includes both a text label and a one-line description.

#### PRICE-02 — Trade fairness signal

As a collector evaluating a trade, I want a fairness signal, so that I can judge balance at a glance.

- Given a trade draft with side values roughly equal within an agreed tolerance, when fairness is computed, then it classifies as Green ("balanced").
- Given a trade draft with a moderate value gap, when fairness is computed, then it classifies as Yellow ("skewed").
- Given a trade draft with a large, one-sided value gap, when fairness is computed, then it classifies as Red ("strongly one-sided").
- Given any classification, then it always includes both a text label and a one-line description.

#### PRICE-03 — Signal rendering

As a collector, I want signals to be understandable without relying on color, so that the meaning is always clear.

- Given a price or fairness signal anywhere in the UI, when it renders, then it shows the text label and description alongside the color, never color alone.

### Catalog / Price MCP

#### CATMCP-01 — Catalog & price retrieval

As a client application (WebApp or an external MCP consumer), I want catalog and price tools, so that I can look up cards, sets, and prices from one place.

- Given a valid card, set, or search parameter, when `get_card`, `get_set`, or `search_cards` is called, then it returns data sourced from TCGdex (or another approved provider).
- Given an unknown card or set identifier, when the corresponding tool is called, then it returns a typed not-found result, not a thrown error.

#### CATMCP-02 — Data normalization

As a client application, I want provider data normalized, so that I don't have to handle each provider's raw format.

- Given raw provider payloads with differing shapes, when normalized, then the result matches the shared `CardIdentity`/`PriceSnapshot` schema regardless of source provider.
- Given prices that are stale, missing, or conflicting across providers, when normalized, then the result is flagged accordingly rather than silently picking one value.

#### CATMCP-03 — Standard response contract

As a client application, I want every catalog/price response shaped the same way, so that downstream code doesn't special-case providers.

- Given any successful tool call, when the response is returned, then it includes standardized identity, price snapshots, sources, last-updated timestamp, and a confidence value.
- Given a partial failure (e.g. one price source unavailable), when the response is returned, then available fields are still populated and the gap is reflected in a lower confidence value, not a total failure.

### Collection Alerts

#### ALERT-01 — Alert detection

As a client application, I want to detect conditions worth flagging, so that collectors are warned proactively.

- Given a card's price moves beyond a defined swing threshold since the last snapshot, when alerts are evaluated, then a price-swing alert is produced.
- Given a card has no available price, a known reprint, or a condition-sensitive caveat, when alerts are evaluated, then the corresponding alert is produced.
- Given none of these conditions apply, when alerts are evaluated, then no alert is produced for that card.

#### ALERT-02 — Alert surfacing

As a collector, I want to see alerts where I already look, so that I don't miss something important.

- Given an active alert for a card, when I view Collection Cards or Card Details, then the alert is visible on that card.
- Given an alert's severity increases since I last saw it, when it renders, then the increased severity is clearly highlighted.

### Trade Scratchpad

#### SCRATCH-01 — Build trade draft

As a collector, I want to lay out a proposed trade, so that I can see whether it's balanced before committing.

- Given cards selected for "offered" and "requested" sides, when the draft updates, then each side's total value and the gap between them are shown.
- Given no cards are selected on a side, when the draft renders, then that side shows a zero total rather than an error.

#### SCRATCH-02 — Multi-card packages

As a collector, I want to trade multiple cards per side, so that I can model real multi-card deals.

- Given more than one card added to a side, when the draft renders, then all cards on that side are listed with their own currency and price source.
- Given cards from different price currencies on the same side, when totals are computed, then the total is computed in a single stated currency with the conversion basis shown.

#### SCRATCH-03 — Save / clear draft

As a collector, I want to save my work and clear it when done, so that I don't lose progress or leave stale drafts around.

- Given a trade draft in progress, when I save it, then it persists and reopens with the same selections later.
- Given a saved or in-progress draft, when I choose Clear, then I am asked to confirm, and only after confirming is the draft emptied.

### Trade Analytics Agent

#### AGENT-01 — Trade grounding

As a collector chatting about a trade, I want the agent to ground its analysis in real data, so that its answers aren't just generic LLM guesses.

- Given a trade draft, when the agent analyzes it, then it calls poke-catalog-mcp for current card/price data and poke-rules-rag for relevant trade-practice knowledge before answering.
- Given poke-catalog-mcp or poke-rules-rag returns a partial or degraded result, when the agent answers, then it reflects the gap (lower confidence, explicit caveat) rather than answering as if data were complete.

#### AGENT-02 — Analysis factors

As a collector, I want the analysis to account for the details that actually affect value, so that it's useful rather than superficial.

- Given a trade involving cards with different rarities, conditions, languages, or trailing averages (avg1/7/30), when the agent analyzes it, then its answer references the specific factors that applied to this trade, not a generic template.
- Given a data gap (e.g. missing avg30 for one card), when the agent analyzes it, then it names the gap explicitly instead of silently omitting it.

#### AGENT-03 — Fact/assessment/prediction split

As a collector, I want to know what's a fact versus a guess, so that I don't overtrust the agent's opinion.

- Given any agent response, when it is generated, then catalog facts, the fairness assessment, and any predictions are structurally separated (not blended into one paragraph).
- Given the agent includes a price prediction, when it is shown, then it is explicitly labeled as a prediction and never phrased as a guaranteed sale price.

#### AGENT-04 — Trade Analysis chat behavior

As a collector, I want to keep chatting about the same trade, so that I don't have to repeat context.

- Given an open Trade Analysis chat, when I ask a follow-up question, then the current trade draft remains available as context without re-stating it.
- Given the agent's behavior for this surface, then its system prompt is loaded from a dedicated version-controlled file, not an inline string.

#### AGENT-05 — Set Overview chat behavior

As a collector, I want to keep chatting about the same set, so that I don't have to repeat context.

- Given an open Set Overview chat, when I ask a follow-up question, then the current set remains available as context without re-stating it.
- Given the agent's behavior for this surface, then its system prompt is loaded from a dedicated version-controlled file, not an inline string.

### Trade Analysis

#### TRADE-01 — Trade Analysis screen

As a collector, I want a clear breakdown of my trade draft, so that I can decide whether to proceed.

- Given a selected trade draft, when Trade Analysis opens, then it shows side values, the gap, volatility notes, collector impact, sources, last-updated time, and a confidence value.
- Given any of those fields is unavailable, when the screen renders, then it shows an explicit "unavailable" state for that field rather than omitting it silently.

#### TRADE-02 — Trade Analysis chat UI

As a collector, I want to ask follow-up questions about my trade, so that I can clarify anything unclear from the screen.

- Given the Trade Analysis screen, when I send a chat message, then the agent's response streams in and renders with facts, assessment, and predictions visually distinguished (per AGENT-03).
- Given the agent is still generating a response after about 10 seconds, when I'm waiting, then a "more time is needed" tip is shown instead of a generic spinner or the word "timeout."

### Set Overview

#### SET-01 — Set Overview screen

As a collector, I want a summary of a whole set, so that I know what I have and what I'm missing.

- Given a selected set, when Set Overview opens, then it shows set identity, total card count, owned-vs-missing counts, price coverage, sources, last-updated time, and a confidence value.
- Given the set has cards with no price data, when the screen renders, then price coverage reflects that gap explicitly (e.g. "62 of 102 cards priced") rather than silently excluding them.

#### SET-02 — Set card listing

As a client application, I want the full card list for a set with price-coverage flags, so that I can compute owned-vs-missing and coverage without N separate calls.

- Given a valid set code, when the set's card list is requested, then all cards in the set are returned, each flagged with whether current price data is available.
- Given a set with more cards than fit in one page, when the list is requested, then it is paginated rather than failing or truncating silently.

#### SET-03 — Set Overview chat UI

As a collector, I want to ask about a set, so that I can get context beyond the summary numbers.

- Given the Set Overview screen, when I send a chat message, then the agent's response streams in, grounded in this set's data (per AGENT-05).

### Rules / Market RAG

#### RAG-01 — Generic knowledge load

As the trade agent, I want general trade/grading/reprint knowledge available immediately, so that I can answer common questions without delay.

- Given the app starts, when generic knowledge is loaded, then it is available in memory before the first chat request needs it.
- Given the generic knowledge fails to load, when the app starts, then the app still starts (agent falls back to catalog-only grounding with a noted limitation), rather than failing to boot.

#### RAG-02 — Set-specific knowledge load

As the trade agent, I want set-specific notes available when a collector looks at that set, so that I can give set-aware answers without pre-loading everything.

- Given a set is accessed for the first time, when its notes are needed, then they are fetched and embedded on demand.
- Given a set's notes were already fetched, when it is accessed again, then the cached notes are reused instead of re-fetching.
- Given set-specific notes are not yet ready, when the collector opens Set Overview, then the catalog data still renders immediately and the notes backfill when available (never blocks the screen).

#### RAG-03 — Sourced knowledge items

As a collector, I want the agent's background knowledge to be traceable, so that I can judge how much to trust it.

- Given a knowledge item is used to ground an answer, when the agent cites it, then the citation includes a source and a date where one is available.
- Given two knowledge items conflict, when both are candidates for retrieval, then the more authoritative or better-sourced one is preferred.

### Data Quality

#### DQ-01 — Last-updated display

As a collector, I want to know how fresh the information is, so that I can judge how much to rely on it.

- Given price or catalog data is shown anywhere (grid, details, trade analysis, set overview), when it renders, then a last-updated timestamp is shown alongside it.

#### DQ-02 — Data-quality flags

As a client application, I want data-quality issues flagged explicitly, so that collectors aren't misled by silently degraded data.

- Given data that is stale, incomplete, unavailable, or conflicting, when it is returned, then it carries an explicit flag naming the issue.
- Given a price value, when displayed, then it is labeled as list price, last sale, or average — never presented ambiguously as just "the price."

#### DQ-03 — Non-authoritative disclaimer

As a collector, I want to know the agent's judgments aren't official, so that I don't mistake them for authoritative valuations.

- Given any agent value judgment or fairness assessment, when it is shown, then it is clearly distinguished from an official Pokémon Company, shop, or marketplace valuation.

#### DQ-04 — Provider failure isolation

As a collector, I want the app to keep working when one data source is down, so that a single outage doesn't block me.

- Given one price or catalog provider is unavailable, when I use the app, then features depending on other providers or cached data continue to work.
- Given a provider failure, when it occurs, then it is reflected as a degraded/flagged result for the affected data only, not as a whole-app error.

### Performance

#### PERF-01 — Progressive collection load

As a collector, I want to see my collection instantly, so that I'm not staring at a blank screen while prices load.

- Given I open Collection, when stored collection data is available locally, then it renders immediately, before fresh price data arrives.
- Given fresh price data arrives after the initial render, when it's ready, then affected tiles update in place without a full-page reload.

#### PERF-02 — Latency contract & progress tips

As a collector, I want responsive screens and honest progress feedback, so that I don't think the app is broken.

- Given any component (dashboard, search, details, set overview, AI response) is loading, when independent data sources are needed, then they are fetched in parallel, not sequentially.
- Given a component is still loading after about 10 seconds, when I'm waiting, then a "more time is needed" tip is shown (never the word "Timeout").
- Given a component's data is ready, when it becomes available, then it renders immediately rather than waiting for the slowest sibling component.
- Given a component is still not ready after 20 seconds, when the target is missed, then a defined fallback or error state is shown instead of hanging indefinitely.

#### PERF-03 — Caching, timeout, retry, fallback

As a client application, I want disciplined caching and failure handling, so that the app stays fast and resilient without violating the freshness contract.

- Given a cached value with a last-updated time, when it is served, then that timestamp is shown and it is never relabeled as live.
- Given an upstream call exceeding its timeout, when it fails, then a bounded retry is attempted before falling back.
- Given the wait path (per PERF-02) has completed and the component is still empty, when a local fallback is used, then it is only swapped in at that point, never silently substituted early.

#### PERF-04 — No redundant LLM calls

As the trade agent, I want to avoid duplicate model calls, so that responses stay fast and costs stay controlled.

- Given a conversation already has a needed piece of information in context, when a follow-up question is asked, then the agent reuses that context rather than re-issuing an identical LLM call.
- Given a single logical output (e.g. one trade analysis), when it is generated, then only one LLM call produces it — no parallel duplicate calls for the same output.

#### PERF-05 — No redundant retrieval calls

As poke-rules-rag, I want to avoid duplicate retrieval work, so that chat responses stay within the latency budget.

- Given a query already retrieved within the same conversation turn, when the same or a near-duplicate query recurs, then the cached retrieval result is reused instead of re-querying.
- Given set-specific notes already cached for the active set (per RAG-02), when the agent needs them again in the same session, then the cache is used, not a fresh fetch.
