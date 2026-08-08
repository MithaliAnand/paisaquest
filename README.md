# Golden Coin Journey

Absolutely — here’s a revised, paste-ready version of your prompt with those changes integrated while preserving the existing requirements.

USER-CONTROLLED FINANCIAL INPUTS & PERSONALIZED FINANCIAL GAME

The application must NOT rely on fixed financial values such as ₹50,000 salary, ₹8,000 remaining, ₹5,000 investment, or any other predetermined financial value.

All financial values used throughout the game must be based on the user's profile and subsequent choices.

The user must always feel that they are controlling their own financial journey.

VISUAL DESIGN & GAME ATMOSPHERE

The entire application should have a soft, premium pastel financial-game aesthetic.

Use:

Soft pastel backgrounds such as cream, blush, lavender, mint, baby blue, and warm peach

Gold accents

Soft gradients

Rounded cards

Gentle shadows

Subtle glassmorphism where appropriate

Friendly illustrations

Smooth Framer Motion animations

Warm, playful typography

Gold coin visual elements

FLOATING GOLD COINS BACKGROUND

Add subtle animated gold coins floating throughout the background of the application.

The coins should:

Be decorative and non-interactive

Float slowly and naturally

Have slightly different sizes

Have varied opacity

Have subtle rotations

Move at different speeds

Create a feeling of a magical financial game world

Remain behind the application's main content

Never interfere with buttons, inputs, sliders, cards, or drag-and-drop interactions

Use a soft gold color rather than an overly bright yellow.

The animation should be subtle enough that the UI remains easy to read.

Example visual atmosphere:

Pastel background

↓

Soft floating gold coins

↓

Rounded financial cards

↓

Gold highlights

↓

Playful financial adventure aesthetic

Do not make the background visually noisy.

INITIAL FINANCIAL PROFILE

When the user presses START ADVENTURE, show a polished profile popup that collects:

Full Name

Age

Monthly Salary

Current Savings

Monthly Expenses

Financial Goal

All monetary fields must accept Indian Rupees (₹).

Use a polished numeric input experience rather than plain browser inputs.

Examples:

Monthly Salary

₹ 50,000

Current Savings

₹ 25,000

Monthly Expenses

₹ 32,000

Show a live calculation:

Available After Expenses

₹18,000

The value must update instantly as salary or expenses change.

Validate inputs appropriately:

No negative values

Expenses cannot exceed salary without displaying a clear warning

Savings cannot be negative

Allow reasonable large financial values

Format numbers using the Indian numbering system

Examples:

₹1,00,000

₹1,50,000

₹12,50,000

Use friendly validation messages such as:

"Your expenses are higher than your salary right now 🌱 Try adjusting the numbers."

Avoid harsh banking-style error states.

EMERGENCY FUND ALLOCATION

Emergency funds must be treated as a user-controlled financial allocation, not an automatically assigned amount.

When the user reaches budgeting or an appropriate emergency-fund decision point, explicitly give them the ability to decide how much of their available money they want to put toward an emergency fund.

Display:

BUILD YOUR EMERGENCY FUND

"How much would you like to keep aside for unexpected moments?"

Allow the user to choose an amount using:

Interactive slider

Editable ₹ amount

+/- controls

The initial selected amount must be:

₹0

Do NOT automatically allocate money to the emergency fund.

The maximum emergency-fund allocation must dynamically depend on the user's available funds.

Example:

Available Budget

₹30,000

Emergency Fund Allocation

₹0 ━━━━━━━━━━━━━━━ ₹30,000

If the user selects:

₹10,000

show:

Emergency Fund

₹10,000

Remaining to Allocate

₹20,000

The remaining amount must update instantly.

The user should be able to decide how much goes toward:

🏦 Emergency Fund

🏦 Savings

📈 Investments

🍔 Food

🎮 Entertainment

✈ Travel

🛍 Shopping

The total allocation must never exceed the user's available amount.

EMERGENCY FUND — DYNAMIC CONSEQUENCES

The emergency fund must affect the game dynamically.

For example, during a medical emergency:

Two Months Later...

Unexpected Medical Emergency

Required:

₹15,000

The game checks the user's actual current emergency fund.

If sufficient:

Emergency Fund

₹20,000

Medical Cost

₹15,000

Remaining Emergency Fund

₹5,000

Show a positive consequence explaining that the emergency fund absorbed the unexpected expense.

If insufficient:

Emergency Fund

₹8,000

Medical Cost

₹15,000

Shortfall

₹7,000

Show the financial impact of the shortfall.

Do NOT simply label decisions as "correct" or "wrong."

Teach the player through the consequences of their actual financial decisions.

The medical emergency amount itself should also be generated dynamically based on the game's financial simulation rather than relying on a single hardcoded scenario amount.

CUSTOM BUDGETING

The Smart Budgeting adventure must use the user's actual financial information.

Never hardcode:

Salary ₹50,000

₹8,000 remaining

Instead calculate:

Available Budget = Monthly Salary − Monthly Expenses

Display the user's actual values.

Example:

MONTHLY ADVENTURE

Your Salary

₹75,000

Your Expenses

₹45,000

Available to Allocate

₹30,000

The user decides what to do with the available amount.

Emergency Fund must be one of the available allocation categories.

SMART BUDGETING CATEGORIES

The budgeting area should include clearly separated drop zones:

🏦 Savings

🛡️ Emergency Fund

📈 Investments

🍔 Food

🎮 Entertainment

✈️ Travel

🛍️ Shopping

Every category must have its own clearly defined, non-overlapping drop zone.

Maintain sufficient physical spacing between adjacent categories so that mobile users can confidently determine where they are dropping money.

SMART BUDGETING — CURRENCY NOTES

Represent available money using illustrated Indian currency notes.

The denominations should be visually clear and immediately recognizable.

Examples:

₹500

₹500

₹500

₹200

₹100

NOTE DESIGN

Every currency note must:

Display the ₹ Rupee symbol

Display the denomination prominently

Use a font color with strong contrast against the note background

Never use a denomination color that blends into the note

Have a large readable denomination

Have a large hit area

Have rounded illustrated edges

Have a slight natural rotation

Have a soft shadow

Have subtle floating animation while idle

Lift slightly when grabbed

Increase shadow while dragging

Scale up slightly while dragging

The denomination must remain clearly visible on both desktop and mobile.

For example:

Instead of displaying only:

500

display:

₹500

The ₹ symbol must be part of the visible denomination.

Use dark green, deep brown, navy, or another high-contrast color depending on the note's background.

Do not use low-contrast combinations such as pale yellow text on a light cream note.

PRECISE DRAG-AND-DROP SYSTEM

Money must ONLY be deposited into the category where the user actually drops it.

Never automatically move, redirect, snap, or assign a note to another category.

If the user drags a ₹500 note over Savings and releases it inside Savings:

→ ₹500 goes to Savings.

If the user releases it inside Investments:

→ ₹500 goes to Investments.

If the user releases it inside Emergency Fund:

→ ₹500 goes to Emergency Fund.

If the user releases it outside every valid drop zone:

→ The money returns to its original position.

Never guess the user's intended category.

The release coordinate is the single source of truth.

DROP DETECTION

Use the actual bounding rectangle of each drop zone.

Conceptually:

pointer release

↓

get pointer coordinates

↓

check every drop zone

↓

is pointer inside Savings?

↓

is pointer inside Emergency Fund?

↓

is pointer inside Investments?

↓

is pointer inside Food?

↓

is pointer inside Entertainment?

↓

is pointer inside Travel?

↓

is pointer inside Shopping?

↓

EXACTLY ONE matching zone

↓

deposit money

If the release point is not inside a valid drop zone:

→ Cancel transaction

→ Return note to its original position

Do NOT use:

Nearest card

Nearest category

Closest drop zone

Automatic snapping

Fuzzy matching

Distance-based detection

EMERGENCY FUND DROP-ZONE FEEDBACK

While dragging a note:

If the pointer enters Emergency Fund:

Only the Emergency Fund zone should respond.

It should:

Slightly enlarge

Glow softly

Show a pastel highlight

Display subtle text such as "Drop here"

Clearly communicate that the note can be deposited there

All other categories remain neutral.

The same behavior should apply independently to every category.

Never highlight multiple categories simultaneously.

CATEGORY BALANCES

Every category should visually accumulate the exact money deposited into it.

Example:

🏦 SAVINGS

₹2,500

🛡️ EMERGENCY FUND

₹5,000

📈 INVESTMENTS

₹1,500

As more money is added:

Currency notes stack naturally

Container fills

Coin particles appear

Total amount counts upward

XP updates

Coins update

Financial Health updates

The visual amount must always match the actual application state.

STRICT TRANSACTION LOGIC

Every successful drop must generate a transaction object containing:

{

  amount: 500,

  category: "emergencyFund",

  timestamp: ...

}

The category must come directly from the drop zone containing the release coordinates.

Never infer the category from:

Starting position

Direction of movement

Nearest card

Previous drag position

Previously highlighted category

Previous transaction

The release location is the single source of truth.

INVESTMENT CATEGORY INFORMATION ICONS

Add a small information icon (ⓘ) next to every Smart Investing category/card.

Examples:

📈 Mutual Funds ⓘ

🏦 Savings Account ⓘ

📊 Stocks ⓘ

🪙 Bonds ⓘ

or whatever investment categories are available in the application.

The information icon should be visually subtle but clearly discoverable.

When the user taps/clicks the information icon:

Flip the investment card.

The front of the card should show the investment category and its primary information.

The back of the card should explain:

What the investment is

How it generally works

Typical risk level

Expected/assumed return range

Suggested investment horizon

Key considerations

A simple beginner-friendly explanation

Example:

MUTUAL FUND

Risk

Medium

Expected Return

8–12%

Suggested Horizon

5+ Years

What is it?

"A mutual fund pools money from many investors and invests it across assets such as stocks or bonds. Returns are not guaranteed."

The card flip should be smooth and visually polished.

Use Framer Motion for the flip animation.

Do not navigate away from the investment screen.

The user should be able to tap the information icon again or a close/back control to return to the front of the card.

The information icon must NOT accidentally trigger the investment action or slider.

SMART INVESTING — USER-CONTROLLED AMOUNT

Smart Investing must NEVER use a fixed or pre-filled investment amount.

The initial investment amount must always be:

₹0

Never:

₹5,000

Never:

₹10,000

Never any other predefined amount.

The user must actively choose how much they want to invest.

INVESTMENT SLIDER

When the user opens an investment card:

HOW MUCH WOULD YOU LIKE TO INVEST?

Show:

₹0

Below it provide a premium interactive slider.

The slider must dynamically range from:

₹0 → Maximum Available Amount

Example:

If the user has ₹18,000 available:

₹0 ━━━━━━━━━━━━━━━ ₹18,000

The maximum must dynamically update according to the user's current available funds.

Use:

Large rounded slider track

Soft gold slider thumb

Pastel glow

Animated progress fill

Smooth spring movement

Large amount display

Useful tick marks

Touch-friendly hit area

As the slider moves:

₹0 → ₹2,500 → ₹7,500 → ₹12,000

the displayed amount should animate smoothly.

INVESTMENT PREVIEW

As the selected amount changes, dynamically update:

Investment Amount

₹7,500

Risk

Medium

Expected Return

8–12%

Duration

5+ Years

Potential Future Value

Dynamic calculation

Also display the percentage return alongside the projected final value.

For example:

Invested

₹7,500

Projected Value

₹11,028

Projected Gain

+₹3,528

Projected Return

+47.04%

The percentage must be calculated dynamically.

Do NOT display a fixed percentage.

The calculation should use:

Projected Return % =

((Projected Future Value − Investment Amount) / Investment Amount) × 100

For recurring investments, calculate the percentage based on total contributions versus projected future value.

FUTURE MIRROR — DYNAMIC COMPOUNDING

The Future Mirror must NEVER use fixed values.

Calculate projections from:

User's investment amount

Selected investment type

Expected annual return

Investment duration

Example:

User enters:

₹10,000

Selected investment:

Mutual Fund

Assumed return:

10%

Display an animated timeline:

TODAY

₹10,000

↓

1 YEAR

₹11,000

↓

3 YEARS

₹13,310

↓

5 YEARS

₹16,105

Alongside the final projection, display:

Total Invested

₹10,000

Projected Value

₹16,105

Projected Gain

₹6,105

Projected Return

+61.05%

All values must be calculated dynamically.

Animate each number counting upward.

Clearly label:

Illustrative projection — actual returns may vary.

FUTURE MIRROR — PERCENTAGE RETURNS

Every future-value projection must show both:

Final projected monetary value

Percentage return

For example:

5 YEARS

₹16,105

+61.05% projected return

Do not show only the final rupee amount.

Whenever the user changes:

Investment amount

Investment type

Expected return

Duration

both the projected value and projected return percentage must update immediately.

RECURRING INVESTMENT

Allow the user to choose between:

One-Time Investment

or

Monthly Investment

If Monthly Investment is selected:

HOW MUCH WOULD YOU LIKE TO INVEST EACH MONTH?

Start at:

₹0

Do NOT automatically set:

₹5,000

The monthly investment slider must range from:

₹0 → Maximum Affordable Monthly Investment

Calculate this dynamically from the user's financial profile.

Example:

Monthly Salary:

₹75,000

Monthly Expenses:

₹45,000

Available:

₹30,000

Monthly Investment Slider:

₹0 ━━━━━━━━━━━━━━━━━ ₹30,000

The user chooses the amount themselves.

RECURRING INVESTMENT PREVIEW

As the user changes the monthly investment amount, display:

Monthly Investment

₹7,500

Investment Duration

5 Years

Expected Return

10%

Estimated Contributions

₹4,50,000

Potential Future Value

Dynamic

Projected Gain

Dynamic

Projected Return

Dynamic %

Update all values instantly when the user changes:

Monthly amount

Investment type

Duration

Expected return

INVESTMENT CONFIRMATION

When the user presses:

INVEST ₹8,250

confirm the exact amount selected.

Deduct exactly that amount from the appropriate available balance.

Add exactly that amount to Investments.

Create an investment transaction.

Update:

Wallet

Investments

Coins

XP

Financial Health

Future Mirror

Investment history

Never substitute a fixed amount.

WALLET

The wallet must reflect the user's actual financial state.

Display dynamically:

Cash

₹XX,XXX

Savings

₹XX,XXX

Emergency Fund

₹XX,XXX

Investments

₹XX,XXX

Available Budget

₹XX,XXX

Every transaction must update these values immediately.

The wallet should visually fill and change based on the user's financial progress.

DASHBOARD — DYNAMIC VALUES

The dashboard must never contain placeholder financial numbers.

Display:

❤️ Financial Health

👛 Wallet

📈 Investments

🛡️ Emergency Fund

🪙 Coins

⭐ XP

🏆 Level

🎖️ Achievements

Financial Health should dynamically respond to:

Savings rate

Emergency fund ratio

Investment allocation

Spending decisions

Debt/loan decisions

Budget adherence

FINANCIAL HEALTH — EMERGENCY FUND FACTOR

Emergency-fund strength must be one of the factors used by the Financial Health calculation.

For example, the calculation can consider:

Savings rate

Emergency fund coverage

Investment allocation

Budget adherence

Spending behavior

Debt decisions

Do not hardcode a single score.

The same user should receive different Financial Health results depending on their actual choices.

STATE MANAGEMENT

Create a centralized financial game state.

The application must persist:

User profile

Salary

Current savings

Monthly expenses

Financial goal

Available budget

Category allocations

Cash balance

Savings balance

Emergency fund

Investment balance

Investment history

Investment type

Investment amounts

Monthly investment amount

XP

Coins

Level

Achievements

Scenario decisions

Financial Health

Current game progress

Transaction history

Use reusable React state management.

Persist state using localStorage or another appropriate client-side persistence mechanism.

Refreshing or navigating between screens must NOT reset the user's financial journey.

FINANCIAL SIMULATION ENGINE

Create reusable calculation functions for:

Available budget

Savings rate

Investment allocation

Emergency fund ratio

Emergency fund coverage

Future investment value

Compound growth

Monthly investment growth

Projected gain

Projected return percentage

Financial Health

XP rewards

Coin rewards

Level progression

Avoid hardcoding scenario outcomes wherever possible.

The same user should receive different game outcomes depending on:

Salary

Expenses

Savings

Emergency fund allocation

Investment amount

Investment type

Investment duration

Spending choices

Scenario decisions

INPUT UX

Financial inputs should feel like part of the game rather than traditional forms.

Use:

Large rounded input capsules

₹ currency prefix

Animated number transitions

Custom sliders

+/- controls

Soft pastel illustrations

Interactive counters

Live calculations

Gold accents

Floating background coins

When a user changes:

₹10,000 → ₹15,000

animate the transition smoothly.

Never use harsh validation states.

Use friendly messages such as:

"That's more than your available budget 🌱 Try a smaller amount."

IMPORTANT USER-CONTROL RULES

The user must always feel that they are controlling their own financial journey.

Do NOT:

Automatically allocate money

Automatically create an emergency fund

Force a fixed investment amount

Use a fixed salary

Use fixed expenses

Use fixed savings

Use a fixed remaining balance

Automatically invest when opening an investment card

Automatically redirect a dropped currency note

Use proximity-based drag-and-drop

Use fixed future-value projections

Use fixed percentage-return values

The user must explicitly decide:

How much to save

How much to put into the emergency fund

How much to invest

How much to spend

Which investment type to choose

How long to invest

Whether to invest monthly or once

How much to invest monthly

How to respond to financial scenarios

FINAL REPORT

The final report must reflect the user's actual simulated financial journey.

It should dynamically summarize:

Starting salary

Starting savings

Monthly expenses

Total savings

Emergency fund built

Total invested

Investment types selected

Total contributions

Projected investment value

Projected gain

Projected return percentage

Spending allocations

Scenario decisions

Financial Health

Coins earned

XP earned

Level

Achievements

Never use predetermined results.

The final report should feel like a personalized financial adventure summary generated from the user's actual decisions.

OVERALL EXPERIENCE

The application should feel like:

A magical, personalized financial adventure game where the user's real choices control the world.

Visual direction:

Pastel background

Floating gold coins

+

Illustrated Indian currency notes

+

Gold accents

+

Smooth Framer Motion animations

+

Interactive sliders

+

Precise physical drag-and-drop

+

Flippable investment information cards

+

Dynamic projections

+

Dynamic percentage returns

+

User-controlled emergency funds

+

Personalized financial consequences

The experience should be:

Precise enough to trust.

Forgiving enough to enjoy.

Animated enough to feel alive.

Educational enough to teach.

Personalized enough to feel like the user's own financial journey.

Most importantly:

Never move, allocate, invest, spend, or project the user's money in a way they did not explicitly choose.

This version folds your four requested changes into the existing specification: user-controlled emergency-fund allocation, pastel/gold-coin visuals, clearer ₹ currency notes, flippable investment-category info cards, and dynamic percentage-return displays alongside projections.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://paisaquest.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6c6bc25d-b502-4346-9ca5-8422c534b906).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
