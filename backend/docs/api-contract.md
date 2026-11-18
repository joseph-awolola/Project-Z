# API Contract

Recurring-payment platform backend (Node.js + Express, Interledger Open Payments).

**Base URL (dev):** `http://localhost:3000`
**Format:** JSON requests and responses (`Content-Type: application/json`)
**Auth:** after login or signup, send `Authorization: Bearer <token>` on every protected endpoint. Tokens last 7 days.
**Errors:** every error returns `{ "error": "message" }` with an HTTP status (400 bad input, 401 not logged in, 403 wrong role, 404 not found, 409 conflict, 500 server).
**CORS:** the backend only accepts requests from the origin set in `FRONTEND_URL` (for example `http://localhost:5173`). Tell the backend your dev URL.

## Conventions

- **Money is in minor units.** `feeMinor: 2500` means 25.00. To display, divide by 100.
- **Roles:** `OWNER` (creates businesses, receives payments) and `MEMBER` (subscribes and pays).
- **Subscription status:** `ACTIVE` | `CANCELLED`
- **Payment status:** `SUCCESS` | `FAILED`
- **Wallet URLs:** owners and members each need their own Interledger test wallet, for example `https://ilp.interledger-test.dev/abc123`. A `$ilp.interledger-test.dev/abc123` form is also accepted. Owner and member must use **different** wallets.

---

## Endpoints

### Auth

| Method | Path | Auth | Body | Success response |
|---|---|---|---|---|
| POST | `/api/auth/signup` | None | `{ name, email, password, role, walletUrl }` (`role` is `OWNER` or `MEMBER`) | `201` `{ token, user }` |
| POST | `/api/auth/login` | None | `{ email, password }` | `200` `{ token, user }` |
| GET | `/api/me` | Any | None | `200` `{ user }` |

`user` = `{ id, name, email, role, walletUrl, createdAt }`
Errors: signup `400` missing fields or bad role, `409` email already registered. Login `401` wrong email or password.

### Businesses (public)

| Method | Path | Auth | Body | Success response |
|---|---|---|---|---|
| GET | `/api/businesses` | None | None | `200` `{ businesses: [Business] }` |
| GET | `/api/businesses/:id` | None | None | `200` `{ business }` (404 if not found) |

`Business` = `{ id, name, feeMinor, ownerId, createdAt, owner: { name } }`

### Owner

| Method | Path | Auth | Body | Success response |
|---|---|---|---|---|
| POST | `/api/businesses` | OWNER | `{ name, feeMinor }` (`feeMinor` is a positive integer) | `201` `{ business }` |
| GET | `/api/owner/businesses` | OWNER | None | `200` `{ businesses: [Business + _count: { subscriptions }] }` |
| GET | `/api/owner/businesses/:id/members` | OWNER (own business) | None | `200` `{ members: [Member] }` |
| GET | `/api/owner/businesses/:id/payments` | OWNER (own business) | None | `200` `{ payments: [OwnerPayment] }` |

`Member` (a subscription) = `{ id, memberId, businessId, memberWallet, feeMinor, status, nextChargeAt, createdAt, member: { name, email }, payments: [latest Payment, 0 or 1 item] }`

`OwnerPayment` = `{ id, subscriptionId, status, amountMinor, opPaymentId, error, createdAt, subscription: { member: { name, email } } }`

For a business the owner does not own, the endpoint returns `404`.

### Member

| Method | Path | Auth | Body | Success response |
|---|---|---|---|---|
| POST | `/api/businesses/:id/subscribe` | MEMBER | None | `200` `{ redirectUrl }` |
| GET | `/api/subscriptions/mine` | MEMBER | None | `200` `{ subscriptions: [MySubscription] }` |
| POST | `/api/subscriptions/:id/cancel` | MEMBER (own subscription) | None | `200` `{ subscription }` |

`MySubscription` = `{ id, memberId, businessId, memberWallet, feeMinor, status, nextChargeAt, createdAt, business: { name, feeMinor }, payments: [Payment, newest first] }`

`Payment` = `{ id, subscriptionId, status, amountMinor, opPaymentId, error, createdAt }` (`error` is set only when `status` is `FAILED`)

Subscribe errors: `404` business not found, `409` already subscribed to this business.

### Demo helper

| Method | Path | Auth | Success response |
|---|---|---|---|
| GET | `/api/billing/run` | None | `200` `{ processed: <number of subscriptions charged> }` |

Charges every active subscription immediately. A subscription already charged this month will produce a `FAILED` payment (the member's monthly limit is reached). Use it for the demo only.

---

## The subscribe flow (read this one carefully)

The member's payment permission is approved in **their wallet provider's website**, so the flow leaves the app and comes back:

1. Member clicks "Subscribe" on a business page.
2. Frontend calls `POST /api/businesses/:id/subscribe` with the auth header and gets `{ redirectUrl }`.
3. Frontend navigates the browser there: `window.location.href = redirectUrl`. (Do not use fetch for this.)
4. Member approves in their wallet.
5. The wallet sends the browser to the backend, which saves the subscription and then **redirects the browser to your app**:
   - Success: `{FRONTEND_URL}/subscription/result?status=success`
   - Failure: `{FRONTEND_URL}/subscription/result?status=error&reason=<reason>` where `reason` is `rejected_or_expired` (member declined, or the link timed out) or `grant_failed`
6. The first payment is charged automatically a few seconds after approval. On the result page, show "Subscription active" and then poll `GET /api/subscriptions/mine` every 2 to 3 seconds (for up to 15 seconds or so) until `payments` has an entry.

**Frontend routes the backend expects:** `/subscription/result`.

## Pages these endpoints support

1. **Sign in / sign up** → `/api/auth/signup`, `/api/auth/login`
2. **Owner dashboard** → `/api/owner/businesses`, `POST /api/businesses`, `/api/owner/businesses/:id/members`
3. **Business join page** (public) → `/api/businesses/:id`, then `POST /api/businesses/:id/subscribe`
4. **Subscription result page** → `/subscription/result` (see the flow above)
5. **Member dashboard** → `/api/subscriptions/mine`, `/api/subscriptions/:id/cancel`
6. **Payment records** (owner) → `/api/owner/businesses/:id/payments`