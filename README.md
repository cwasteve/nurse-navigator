# Nurse Navigator

## Tech Stack

- React
- Typescript
- Vite
- Bun
- TailwindCSS
- IndexedDB (using the `idb` library)
- Lucide-React (icons)
- Tests
  - Vitest (unit tests)
  - Playwright (component and e2e)

### Reasoning

This repo was created with a lightweight starter it for React + TS + Vite, using Bun for the runtime. All of this was chosen for speed of development and relative performance.

I chose a SPA rather than using something like NextJS because this is a very specifically scoped application and wouldn't benefit from complex routing, SSR, etc.

While for an application this size `localStorage` would've worked fine, it seemed like a stretch from a design standpoint. IndexedDB just lent itself more to what I consider a realistic use case here. In a real world application we'd be interacting with one or multiple databases, so even though that'd require a different API and setup than we have, using IndexedDB made sense.

## Technical Design Principles

At it's heart this is a deduplication application (and potentially extensible to a normalization application). So technical design choices need to be made based on the idea of either:

1. **Hard to Make a Mistake**: High guardrails and gatekeepers (confirm dialogs, warnings, etc.) to prevent accidentally combining things that shouldn't be combined
2. **Easy to Recover From a Mistake**: Easy reverts of accidental or bad combinations

There's always some degree of balance, however, **given the requirements to be able to undo actions, I chose to essentially eliminate guardrails against making mistakes and to lean into easy reversion.**

This meant fewer clicks to achieve confirm/reject. I offset this by having multiple paths to undo a decision:

1. An "undo" button on each decision screen that would revert a patient to "unreviewed"
2. An "undo" button that appears in a toaster (stackable, so multiple actions in quick succession will show multiple of these) for 5 seconds so the user can immediately undo any action in modifying the patient status
3. The "Quick Review" option (my favorite bonus UX optimization) was easy to justify

This meant having multiple ways to undo decisions, and therefore having hooks and util functions that were applicable to that design. Similarly, rather than present multiple different styles/options for how to see data, the user really just has two:

1. Overview in a table
2. Detailed view with a "Compare Card"

Even our "Quick View" is really just a stack of "Compare Cards" that the nurse can quickly go through.

## Tradeoffs

I mentioned earlier (and I mention throughout this) that the main tradeoff is lack of guardrails. That seems fine to me in this circumstance and with this specific assignment. In other cases we may want both guardrails and easy undo.

Other tradeoffs include lack of customization capabilities, not being made to work on mobile (I haven't even checked how it looks in a small window), and using the more complicated IndexedDB rather than localStorage.

The principles guiding these decisions have always been (in this order):

1. What is easiest, most intuitive, most functional, and provides the least amount of resistance for the nurse to accomplish their goal?
2. What does the shape of the data we get allow us?
3. What are reasonable/foreseeable challenges we might encounter with other datasets that could be pulled in?

The first two are easy to control for. In fact, I've chosen a pretty bland UI so the action buttons and options will stand out. This is utility-focused, not fancy - but meant to still be a delightful UI to use in functionality. Regarding the third I've had to make "reasonable decisions" like the extent to which my date normalization (for search, display) util will accept different values and phone number format (i.e. we don't currently have to do any normalization there with our limited datasets).

### Data Focus

This is a bit odd. You'd expect to use the internal data as the main reference point in most cases - since that's our data.

However, this application only cares about matches, so more often than not we're referencing the `external` ID as our UUID instead. This is because an action is being taken _regarding the external record_ and NOT our internal record. For example, an external record is either accepted or rejected as a match. The internal record is NOT. It is the actual source of truth and the thing we're matching to.

### Nurse ID

One thing I _did_ add was a "Nurse ID" so that the "Notes" we added would have someone's sign off. This is always "Sarah Mitchell, RN". In a realistic scenario, it just makes sense to record who made a given decision and their notes. Since this was an add-on, I only utilize the nurse ID for notes. That's not really a tradeoff, just an acknowledgement.

### Consts & Data Structures

Additionally, I made the decision to structure my constants in the `/constants` folder in a certain way to make typing that much easier, avoid testing for strings, and have a unified codebase without scattered `const` values throughout.

### IndexedDB vs LocalStorage

I've used LocalStorage extensively in the past, so I'm much more comfortable with it and it's a pretty straightforward and simple API. However, our use case lends itself better to IndexedDB - especially since we'd be using a real DB in a production environment.

I hadn't worked with IndexedDB, so I had to do a little research on it. There's admittedly some additional complexity regarding modifying data (which requires the `upgrade` method), however, that felt minimal. You could easily run this using LocalStorage instead due to the small size and relative simplicity of the data shape. I just think you'd be essentially massaging the data shape more to work with LocalStorage, so I chose IndexedDB instead. The library `idb` just adds a more developer-friendly wrapper around that.

### Hooks vs Prop Drilling

Arguably, this application is small enough to just use prop-drilling for passing data states around from parent to child. However, that's just not a good pattern for scalability and in case the application increases in size. Additionally, the minimal overhead of adding context/providers and hooks is worth it, IMO.

There's not much cognitive complexity and even though I like to keep related code as close as possible to where it's used, this pattern is so common that any dev would be able to maintain the repo easily.

So `AppContext` consumes the `MatchFilterContext` (what data are we displaying and/or interacting with when it comes to multiple records) `MatchDataContext` (what data are we displaying/interacting with for an individual record).

### Testing Decisions

It's worth noting this isn't a comprehensively tested application. I created it and created tests to cover the essentials, but I'm actually not even recording test coverage. This is mostly due to time and prioritization.

## UX Design Principles

Given the use case, no focus was placed on mobile UX. While general responsive design principles were still followed, this is not designed to work on a mobile device.

The application was written with 3 principes in mind:

1. Make it easy to achieve the goal (easy comparison/matching)
2. Make it easy to fix problems (easy undo)
3. Provide "recommended paths" for use (Quick View of selected patient comparisons)

Wherever possible I've used icons, placeholders, and/or colors to indicate meaning instead of heavy text.

## Setup & Running Instructions

- Clone the repo
- Run `bun install`
- Run `bun dev`

## How to Use This Application + Key Components

_Note:_ Ideally, one could use this application without much explanation. My goal is that given 5 minutes to play around, you'd feel comfortable enough that this tool would be useful to you as a nurse. However, I've explained key aspects, behaviors, and functionalities below. While the application offers some text hints/tips on how to use it, I have kept those to a minimum so as not to clog the UI and hopefully the UX decisions have guided use. Icons, colors, and happy paths the you're funneled toward as the user have been chosen wherever I could to make this UI as intuitive as possible.

### The Table

- The table has tabs for different states of matching: "Unreviewd", "Confirmed", "Rejected", and "Needs Follow Up". Each tab shows how many rows/users are within each
- A nurse and see and sort matches within the table based on cofidence or patient name (at either our facility or external ones)
- On each row they can take a "Quick Action" by using the buttons on the right
  - These buttons vary based on which tab is selected

### Search Bar

- The search allows for autosuggest based on patient name or DOB (normalized)
  - You can search "March 15th" or "3/15" or "3-15" etc., if searching for DOB
  - We do NOT currently support DOB + name or vice versa in searches, so searching "Peter October" wouldn't work even though "Peter" and "October" are both valid searches. That was simply a decision to keep search simpler at this time and a tradeoff we made
- We use a custom helper function for normalizing the DOB, as pulling in a library like date-fns or something else seemed unnecessary given our limited data set. To scale, we might review this and would want to see what other date formats are used

### Quick Review

This is my favorite feature and the one I think nurses would use most often. It lives on the "Unreviewed" tab and is designed to let nurses group a bunch of cards and review them quickly. Here's how it works:

1. The nurse either a) checks the checkboxes next to a bunch of rows individually, or b) selects the checkbox at the top left of the table to select all, or c) **the most useful way, IMO**: the nurse puts in a minimum confidence threshold with an optional maximum and then hits "Select" to choose all of those
2. Once the desired rows are selected, the nurse clicks the "Quick Review" button that appears in the top left above the table
3. The rows' respective "Compare Cards" now appear in a modal, essentially like a stack of patient records to compare. These "Compare Cards" utilize the same component as if one were to press the "Compare" button for any individual row
4. For each card, the nurse can review and pick an action or "Skip" the card

### Compare Card Modal

I tried to stay true to the instructions here, so I only have the "Notes" option on the "Follow-up" section.

**Confirm**: With the principle of "easy to revert", when you click "Confirm" the card is confirmed

**Reject**: If you select "Reject" then you are forced to choose one of the reasons and then you need to click a button to "Reject"

**Needs Follow-Up**: You may add a note, but that is optional. So for this option you'll click another button to complete the "flag for follow up" action

After each action you'll see the "Undo" toast which includes info on who the card was for, what action was taken, and a button to quickly undo the change

## Testing

Tests were created mostly by using Claude Code after the fact, although there are times when I like to use TDD and I used that in particular for the "Quick Review" feature. I wanted to have tests that:

- Ensured any key changes were picked up ("tested" the `/constants` files, since they're used throughout and foundational)
- Ensured our utilities/shared logic works as expected
- Ensured our fundamental user paths and interactions handled expectations

For the first two needs I created unit tests using vitest, and for the latter point I have component tests and e2e tests using playwright.

### How to Run Tests

- Run basic unit tests of utils/constants (to ensure we catch changes) using `bun test`
- Run component tests (playwright) with `bun test:components`
- E2E tests with `bun test:e2e` (if you want to watch it in the browser, add the `--headed` flag)

## Use of AI (Claude Code)

I wrote the initial plan (`/project_plans/01_foundation-plan.md`) by prompting Claude Code in my own words with what the project was about. I didn't want to copy/paste the whole assignment in, however, I knew the principles and focual points I wanted.

After seeing what it came up with, I had it code some of the foundations and then I set to work coding up the appropriate use cases, paths, and share logic/components. What I generally do is make the architectural decisions, given it constraints (only some of which are in the `CLAUDE.md` file), and then I had to:

- Make the code more reusable with shared components and types
- Add appropriate `/constants`
- Create/update `/utils`
- Add hooks
- Add tests

I tend to treat AI like a junior developer. If you create the architectural guidance and requirements, give it very specific instructions, and then check its work - it's a great way to delegate. After all, creating a component is more or less boilerplate. Same with creating a hook. But knowing how to architect an application and being able to troubleshoot/debug, and optimize a codebase for maintainability is key.

That's where I spend more time at this point than in hand coding.

One thing you'll notice is that I left in some AI comments. While I prefer self-documenting code, sometimes these are helpful. Overcommunication is fine as long as it adds something non-obvious or that could slip through the cracks.

## Enhancements

The biggest enhancement by far is the "Quick Review" functionality. This speeds up the review process quite a bit, in my opinion, and is probably the thing most likely to be used most readily by nurses.

Second is the "Undo" toast. I think that's just a nice element that puts the "Undo" function immediately at your fingertips.

And the last major enhancement is the auto-suggest in search. That's another easy win for UX for the nurses who might utilize this kind of application.

## What I'd Do With More Time

I probably spent about 8-9 hours in the application creation and review, and another hour writing this up and checking everything.

If I had more time I'd harden this codebase a bit with more tests and I'd spend more time re-reviewing and optimizing the code. Admittedly, the biggest weakness is definitely on edge case handling.

**Top Things**

1. More edge case testing & handling
2. Estensibility for additional data sources, APIs/an API wrapper for different DBs
3. More complex search functionality to handle and/or more complex filter logic (i.e. filters on why someone was rejected + confidence score, etc. so we could use that info to improve matching algo maybe)
4. Better accessibility - although I've used RadixUI to help give me some of that out of the box, I'd like to ensure the table is more accessible. This is especially true when it comes to interactions such as selecting a row for comparison.

Overall I'm happy with this application.
