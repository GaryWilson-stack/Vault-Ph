# VAULT PH — Technical Specification

## 1. Objective

Build a production-ready responsive game top-up marketplace called VAULT PH.

The application should provide a premium gaming storefront, product catalog, dynamic checkout, order management and administration.

The application must be structured so additional games/products can be added through the database/admin system without rewriting frontend components.

---

# 2. Recommended Stack

Use the existing project stack if one already exists.

If starting from scratch, use:

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS

UI:

- Reusable component architecture
- Lucide icons or another lightweight icon library
- Responsive design

Backend:

- Supabase

Database:

- PostgreSQL through Supabase

Authentication:

- Supabase Auth

Hosting:

- Vercel or equivalent

API:

- Server-side/API functions for sensitive operations

Do not introduce unnecessary frameworks or dependencies.

---

# 3. Architecture

Use a modular architecture.

Recommended structure:

src/
  components/
  pages/
  layouts/
  hooks/
  lib/
  services/
  types/
  data/
  admin/
  checkout/
  products/
  orders/

supabase/
  migrations/
  functions/

Do not place the entire application inside one large component.

---

# 4. Routes

Public routes:

/

 /games

 /games/:slug

 /products/:slug

 /checkout

 /order/:orderId

 /track-order

 /faq

 /contact

 /terms

 /privacy

Authentication:

/login

/register

/account

Admin:

/admin

/admin/orders

/admin/products

/admin/games

/admin/customers

/admin/settings

---

# 5. Database Schema

Create the following primary tables.

## games

Fields:

id UUID primary key

name TEXT

slug TEXT unique

description TEXT

logo_url TEXT

banner_url TEXT

category TEXT

active BOOLEAN

featured BOOLEAN

sort_order INTEGER

created_at TIMESTAMP

updated_at TIMESTAMP

---

## products

Fields:

id UUID primary key

game_id UUID nullable

name TEXT

slug TEXT unique

description TEXT

product_type TEXT

denomination TEXT

price NUMERIC

discount_price NUMERIC nullable

currency TEXT default 'PHP'

image_url TEXT

active BOOLEAN

featured BOOLEAN

sort_order INTEGER

delivery_type TEXT

created_at TIMESTAMP

updated_at TIMESTAMP

---

## product_fields

This table defines what information a customer must provide for a product.

Fields:

id UUID primary key

product_id UUID

field_name TEXT

field_label TEXT

field_type TEXT

placeholder TEXT

required BOOLEAN

validation_rules JSONB

sort_order INTEGER

---

## orders

Fields:

id UUID primary key

order_number TEXT unique

user_id UUID nullable

email TEXT

phone TEXT nullable

game_id UUID nullable

product_id UUID

quantity INTEGER

unit_price NUMERIC

discount NUMERIC

payment_fee NUMERIC

total NUMERIC

currency TEXT

payment_method TEXT

payment_reference TEXT nullable

payment_status TEXT

fulfillment_status TEXT

order_status TEXT

customer_data JSONB

internal_notes TEXT nullable

created_at TIMESTAMP

updated_at TIMESTAMP

---

## order_events

Fields:

id UUID primary key

order_id UUID

status TEXT

message TEXT

created_at TIMESTAMP

This table powers the order timeline.

---

## customers

Fields:

id UUID primary key

user_id UUID nullable

email TEXT

phone TEXT nullable

created_at TIMESTAMP

updated_at TIMESTAMP

---

## discount_codes

Fields:

id UUID primary key

code TEXT unique

discount_type TEXT

discount_value NUMERIC

minimum_order NUMERIC nullable

maximum_discount NUMERIC nullable

usage_limit INTEGER nullable

usage_count INTEGER

active BOOLEAN

starts_at TIMESTAMP

expires_at TIMESTAMP

---

# 6. Product Configuration

Products must be data-driven.

DO NOT create code such as:

if game === "mobile legends"

inside multiple components.

Instead:

Game
→ Products
→ Product fields
→ Checkout

Example:

Mobile Legends

Products:

50 Diamonds
100 Diamonds
250 Diamonds
500 Diamonds
Weekly Pass
Starlight

Each product can define its own required fields.

---

# 7. Checkout Flow

Flow:

Homepage

↓

Select Game

↓

Select Product

↓

Enter Required Information

↓

Select Package

↓

Order Summary

↓

Payment

↓

Payment Verification

↓

Order Created

↓

Fulfillment

↓

Completed

---

# 8. Dynamic Checkout Fields

The checkout page should render fields based on product configuration.

Example:

product_fields:

User ID
required = true

Zone ID
required = true

The frontend reads these fields from the database.

This allows future games to have completely different requirements.

---

# 9. Validation

Every checkout field must be validated.

Client-side validation:

- Required fields
- Valid format
- Length
- Numeric validation where applicable

Server-side validation MUST also occur.

Never rely exclusively on frontend validation.

---

# 10. Payment Architecture

Create:

PaymentService

Example interface:

createPayment()
verifyPayment()
handleWebhook()
refundPayment()

The UI should not directly contain provider-specific payment logic.

Payment providers should be implemented behind the service layer.

Example:

PaymentService
  ├── GCashProvider
  ├── PayPalProvider
  └── FutureProvider

Only implement providers for which actual credentials/API access are available.

If credentials are not available during development:

Use a clearly labeled mock/test payment provider.

Never simulate a successful real payment in production.

---

# 11. Fulfillment Architecture

Create:

FulfillmentService

Methods:

createOrder()
processOrder()
checkStatus()
retryOrder()

Potential providers:

- Supplier API
- H2H API
- Manual fulfillment

Example:

FulfillmentService
  ├── AutomaticProvider
  └── ManualProvider

The system should select the fulfillment provider based on the product's delivery_type.

---

# 12. Order Status System

Payment status:

PENDING

PROCESSING

PAID

FAILED

REFUNDED

---

Fulfillment status:

PENDING

PROCESSING

COMPLETED

FAILED

MANUAL_REVIEW

---

Overall order status:

PENDING_PAYMENT

PROCESSING

COMPLETED

FAILED

CANCELLED

REFUNDED

---

# 13. Admin Dashboard

Admin dashboard must be protected.

Admin pages should not be accessible to normal customers.

Use role-based authorization.

Dashboard cards:

Revenue

Orders

Pending

Completed

Failed

Products

Customers

---

# 14. Product Management

Admin can:

Create product

Edit product

Deactivate product

Change price

Change discount

Upload image

Mark featured

Change ordering

Configure checkout fields

Configure fulfillment method

---

# 15. Game Management

Admin can:

Create game

Edit game

Activate/deactivate game

Upload logo

Upload banner

Set featured

Change order

---

# 16. Order Management

Admin can:

Search order number

Filter by status

Filter by date

View order

View customer information

View product

View payment status

View fulfillment status

Update fulfillment

Add internal notes

Retry failed fulfillment

Manually complete an order

---

# 17. Homepage Components

Build the homepage using reusable components:

Navbar

Hero

PopularGames

HowItWorks

FeaturedProducts

WhyVault

SupportSection

FAQPreview

Footer

---

# 18. Navbar

Desktop:

VAULT PH logo

Home

Games

Track Order

Support

Search

Account

Mobile:

Logo

Search

Menu button

Cart/order indicator where appropriate

---

# 19. Hero Design

Use the supplied VAULT PH artwork as the primary visual reference.

Design language:

Dark navy background

Electric blue glow

Cyan highlights

White typography

Subtle gradients

Gaming artwork

Premium lighting effects

Avoid excessive neon effects.

The hero should remain readable and professional.

Primary CTA:

TOP UP NOW

Secondary CTA:

TRACK ORDER

---

# 20. Game Cards

Each card:

Game image

Game logo/name

Short description/category

Starting price if available

CTA

Hover:

Small scale transformation

Glow

Border highlight

Do not use excessive animations.

---

# 21. Product Page UI

Layout:

Game/Product image

Product title

Description

Package selector

Customer information

Payment options

Order summary

CTA

FAQ/instructions

Desktop:

Two-column layout.

Mobile:

Single-column layout.

---

# 22. Order Tracking UI

Order lookup:

Order number

Email/phone if required

Track button

Results:

Order number

Product

Amount

Payment status

Fulfillment status

Timeline

Support CTA

---

# 23. Visual Design System

Primary background:

#050B18

Secondary background:

#08152A

Panel:

#0B1D36

Primary blue:

#1677FF

Cyan:

#00CFFF

White:

#FFFFFF

Muted text:

#94A3B8

Success:

#22C55E

Warning:

#F59E0B

Error:

#EF4444

Use these as starting points, but maintain accessible contrast.

---

# 24. Typography

Use a modern sans-serif font.

Recommended:

Inter

or

Manrope

Headings should be bold and gaming-oriented.

Body text should remain highly readable.

Do not use overly decorative fonts for normal UI.

---

# 25. Animation

Use subtle animations for:

- Card hover
- Buttons
- Page transitions
- Hero background
- Loading states
- Order status changes

Avoid animations that interfere with checkout.

Respect prefers-reduced-motion.

---

# 26. Mobile Requirements

Mobile navigation must be easy to use.

Product cards should become a responsive grid.

Checkout fields must be full width.

Buttons must be touch-friendly.

Order tracking must work comfortably on mobile.

No horizontal scrolling.

---

# 27. Loading States

Every API-driven component should have loading states.

Examples:

Product loading skeleton

Game loading skeleton

Order loading state

Payment processing state

Admin table loading state

---

# 28. Error Handling

Show human-readable errors.

Example:

Instead of:

"API error 500"

Show:

"We couldn't process your request right now. Please try again."

For failed payments:

"Payment could not be confirmed. Your order has not been completed."

For failed fulfillment:

"Your payment was received, but the top-up is still being processed. Please check your order status."

---

# 29. Security Rules

Never expose:

- API keys
- Payment secrets
- Supplier credentials
- Admin credentials

Use environment variables.

All sensitive operations must happen server-side.

Use database Row Level Security.

Customers must only be able to access their own orders.

Admins must have elevated permissions.

---

# 30. SEO

Each game/product page should have:

Unique title

Meta description

Open Graph image

Canonical URL

Structured metadata where appropriate

Example:

"Mobile Legends Top Up Philippines | VAULT PH"

---

# 31. Analytics

Architecture should allow analytics to be added.

Track events such as:

game_viewed

product_viewed

checkout_started

payment_started

payment_completed

order_completed

Do not collect unnecessary personal information.

---

# 32. Assets

Use the supplied VAULT PH promotional banners as design references/assets where appropriate.

Do not copy assets from TopupKuy.

Do not scrape copyrighted artwork from competitor websites.

Game logos/artwork should only be used where the business has appropriate rights/licensing or through permitted official/authorized assets.

---

# 33. Important Competitor Reference

TopupKuy can be used as a UX reference for:

- Game discovery
- Product categories
- Search
- Top-up flow
- Order tracking
- Payment flow
- Customer support
- Product organization

However:

DO NOT clone TopupKuy.

Do not copy:

- Their exact layout
- Their branding
- Their text
- Their logos
- Their proprietary graphics
- Their source code
- Their exact UI

VAULT PH must have an independent visual identity.

---

# 34. Development Strategy

Build in phases.

PHASE 1

Build:

- Design system
- Navbar
- Homepage
- Hero
- Game cards
- Product cards
- Responsive layout
- Footer

Use mock product data initially.

PHASE 2

Build:

- Game pages
- Product pages
- Dynamic product selection
- Dynamic checkout fields
- Order summary

PHASE 3

Build:

- Supabase database
- Games
- Products
- Product fields
- Orders
- Order events

PHASE 4

Build:

- Authentication
- Admin dashboard
- Product management
- Game management
- Order management

PHASE 5

Build:

- Real payment provider
- Payment verification
- Webhooks

PHASE 6

Build:

- Real fulfillment provider/API
- Automatic order processing
- Failure/retry handling

PHASE 7

Build:

- SEO
- Analytics
- Performance optimization
- Security review
- Final responsive QA

---

# 35. Definition of Done

The MVP is complete when:

1. A customer can browse the six initial product categories.

2. A customer can select a game.

3. A customer can select a product.

4. The correct dynamic account fields appear.

5. The customer can create an order.

6. The order is stored in the database.

7. The customer can track the order.

8. An admin can view the order.

9. An admin can manage games.

10. An admin can manage products.

11. The UI works on mobile, tablet and desktop.

12. Payment integration can be connected without restructuring the application.

13. Fulfillment providers can be connected without restructuring the application.

14. No secrets are exposed in frontend code.

15. The website visually matches the VAULT PH gaming brand.

16. Additional games can be added through the catalog system without rebuilding the frontend.