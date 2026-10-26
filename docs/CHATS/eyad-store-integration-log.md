# VAULT PH — Eyad Store Reseller Integration & Progress Log

**Date:** October 26, 2026  
**Conversation ID:** `bf419895-d420-4c25-9c36-a5925d939fe3`  
**Project:** VAULT PH Game Top-up Marketplace  

---

## 1. Context & Previous State Summary

Prior to this session:
- **Phase 1-4 Complete**: Frontend storefront, dynamic catalog, Supabase database, admin management panel, and order tracking.
- **Last Action**: Dual-layer persistent admin login was implemented in `src/admin/pages/AdminLoginPage.tsx` (using master passkey `VAULT-ADMIN-2026`), verified with `npm run build`, and pushed to GitHub (`main`).
- **Upcoming Milestone**: Phase 5 (Payment Architecture & Real Gateway Integration) followed by Phase 6 (Fulfillment Automation).

---

## 2. Eyad Store Reseller Integration Request

The user requested integrating the **Eyad Store Reseller API** into VAULT PH according to official specs:
- **API Docs URL**: `https://reseller.eyadstore.gg/api-docs.html`
- **Base URL**: `https://reseller.eyadstore.gg`
- **Authentication**: `X-Store-Key` HTTP Header
- **Initial Focus**: Philippines top-ups (e.g., Mobile Legends `mlbb_ph`, Valorant `valorant_ph`, Free Fire `freefire_ph`, Wild Rift `wild_rift_ph`, Genshin, etc.).

---

## 3. Project Architecture Inspection

| Component | Technology | Role |
|---|---|---|
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS | Single Page App (SPA) |
| **Backend & Auth** | Supabase (PostgreSQL + Supabase Auth) | Database & User/Admin Auth |
| **Hosting** | Vercel (`vercel.json` rewrite configuration) | Client & Serverless Hosting |
| **Security Principle** | Secrets strictly server-side | Never expose `X-Store-Key` in browser bundle |

---

## 4. Official API Specifications & Findings

From downloading and analyzing `https://reseller.eyadstore.gg/api-docs.html`:

### Key Endpoints (All HTTP POST with JSON body):
- `POST /store/api/capabilities` — Account limits, capabilities, observed IP address.
- `POST /store/api/balance` — Current reseller balance (USD).
- `POST /store/api/games` — Supported games, required account fields (`requires_server`, `requires_zone`), and validation support (`supports_id_check`).
- `POST /store/api/packages` — Packages & pricing for a game (e.g. `{"game": "mlbb_ph"}`).
- `POST /store/api/validate` — Player ID validation (returns player nickname before charging).
- `POST /store/api/order` — Place order with `package_id`, `payment_reference`, and `max_charge_usd`.
- `POST /store/api/order/status` — Order status lookup.

### Outbound IP Requirements:
- Eyad Store supports IP allowlisting (`partner_policy.ip_enforced`).
- While not enforced, `/store/api/capabilities` shows `partner_policy.observed_ip`.
- If an account has IP enforcement enabled, hosting on Vercel requires a fixed outbound proxy/NAT IP registered with Eyad Store support.

---

## 5. Security & Read-Only Testing Performed

1. **API Key Storage**:
   - The user securely placed the key in `.env.local` as `EYAD_STORE_API_KEY`.
   - `.env.local` is ignored by Git, ensuring zero leakage to GitHub or chat logs.

2. **Handshake Test Result**:
   - Tested endpoint: `POST https://reseller.eyadstore.gg/store/api/capabilities` with `X-Store-Key`.
   - **Status: HTTP 200 OK — CONNECTED & VERIFIED!**
   - **Account Partner Name**: `VaultPH`
   - **IP Enforced**: `false` (A fixed outbound proxy IP is NOT required right now; Vercel serverless functions can call the API directly!).
   - **Account Mode**: `balance` (Reseller balance: `$0.00 USD`).
   - **Catalog Access**: Full live access to game catalog and packages including Philippine games (`bloodstrike_ph`, `league_of_legends_pc_ph`, `honkai_impact_3rd_ph`, `mlbb_adventure`, `genshin`, `pubgm`, etc.).

---

## 6. Implementation Progress & Next Steps Checklist

- [x] Configure `EYAD_STORE_API_KEY` in `.env.local` securely.
- [x] Verify API connection, capabilities, and balance (`HTTP 200 OK`, `ip_enforced: false`).
- [ ] Create serverless API proxy (`api/eyad/[...path].ts` or `api/eyad.ts`) to keep `EYAD_STORE_API_KEY` secret from frontend users.
- [ ] Build catalog integration service to query live packages and prices for Philippine products.
- [ ] Wire player validation endpoint (`/store/api/validate`) to checkout form when `supports_id_check: true`.
- [ ] Implement safety controls: price guard (`max_charge_usd`), idempotency reference, dry-run fulfillment.
