# Comprehensive System Remediation & Stabilization Plan

## Executive Summary
This document outlines the professional remediation strategy for the MessageSender application. Based on a deep-dive architectural audit, several "contract drifts," authorization flaws, and payload mismatches have been identified between the Next.js frontend and the NestJS backend. This plan provides a phased, rigorous approach to resolving these issues and enforcing standard software engineering practices, with a heavy emphasis on Unit and Integration testing.

---

## Phase 1: Security, Authorization & Workspace Isolation
**Goal:** Guarantee strict tenant isolation and correct role propagation across the entire stack.

### Remediation Tasks:
1. **JWT Strategy & Role Guard Synchronization:** 
   - Update `jwt.strategy.ts` to ensure `role` and `workspaceId` claims are accurately verified and attached to the request payload.
   - Refactor `RolesGuard` and `WorkspaceGuard` to enforce strict matrix checks (e.g., `Admin` globally, `WorkspaceOwner` locally).
2. **Member API Consolidation:** 
   - Unify the split workspace-member logic from `users.controller.ts` and `workspaces.controller.ts` into a cohesive `workspace-members.controller.ts`.

### Testing Requirements:
- **Unit Testing (Jest):** Mock request objects to test `RolesGuard` and `WorkspaceGuard` independently. Verify that unauthorized roles throw `ForbiddenException`.
- **Integration Testing (Supertest):** Create E2E flows verifying that User A (in Workspace A) receives a `403/404` when attempting to access Workspace B's resources.

---

## Phase 2: Global API Contract & Middleware Standardization
**Goal:** Establish a single source of truth for all API responses, eliminating frontend/backend parsing errors.

### Remediation Tasks:
1. **Pagination Envelope Standardization:**
   - **Issue:** Frontend expects `{ data, meta }`, backend sends `{ data, pagination }`.
   - **Fix:** Implement a global `TransformInterceptor` in NestJS to automatically format all paginated responses to the `{ data, meta: { total, page, limit, totalPages } }` structure.
2. **Error Handling & Routing Drifts:**
   - Align mismatched routes: Update UI hooks fetching `/admin/system-health` to target the correct backend `/admin/health` endpoint.
   - Standardize backend validation errors to be easily parsed by frontend forms (e.g., Zod or React Hook Form resolvers).

### Testing Requirements:
- **Unit Testing:** Test the global interceptor and exception filters with mock HTTP responses.
- **Integration Testing:** Trigger validation failures deliberately on generic DTOs and assert the standard error envelope returns as expected.

---

## Phase 3: Data Payload Reconciliation (Campaigns & Integrations)
**Goal:** Eliminate "Undefined" and "Bad Request" errors by perfectly aligning TypeScript interfaces/Zod schemas with Backend DTOs.

### Remediation Tasks:
1. **Campaign Creation Drift:**
   - Refactor the Next.js `CampaignFormData` component (`create/page.tsx`) and underlying API services to map exactly to the `CreateCampaignDto`.
   - Change frontend payload from `{ type, segmentId, message }` `->` to backend standard `{ campaignType, audienceSegmentId, audienceType, messageContent }`.
2. **Inbox/Bypass Methods:**
   - Ensure the UI states for inbox interaction (OTN, Message Tags) correctly propagate boolean/enum flags required by the backend `compliance.service.ts` to bypass standard 24-hr rules safely.

### Testing Requirements:
- **Unit Testing:** Write frontend utility tests for data transformers (mapping local UI state to the precise API payload shape).
- **Integration Testing (API edge):** Use Jest/Supertest on the backend `/campaigns` POST route with the newly formatted payloads to ensure a `201 Created` outcome and correct database seeding.

---

## Phase 4: System Reliability & Async Job Verification
**Goal:** Ensure the background processing topology (BullMQ, Redis, Webhooks) operates predictably under load.

### Remediation Tasks:
1. **BullMQ Worker hardening:**
   - Ensure Facebook Webhook duplicate events are explicitly caught using Redis locking or idempotency keys before firing queue jobs.
2. **WebSocket Stability:**
   - Add explicit connection lifecycle checks to `inbox.gateway.ts` to prevent memory leaks from dangling frontend client sockets.

### Testing Requirements:
- **Unit Testing:** Isolate Webhook controller logic. Mock `BullMQ` to test that webhooks correctly map to the queue logic without actually writing to Redis.
- **Integration Testing:** End-to-end integration tests where a mock Facebook Webhook payload is dispatched, verifying the system caches the idempotency key and rejects duplicate deliveries in rapid succession.

---

## Phase 5: CI/CD & Automated Assurance
**Goal:** Automate tests so contract drift mathematically cannot happen in the future.

### Remediation Tasks:
1. **API Typings Automation (Future-proofing):** Evaluate using OpenAPI (Swagger) auto-generation to export a TypeScript client directly to the frontend, removing manual interfaces entirely.
2. **Pipelines:**
   - Configure a pre-commit hook (Husky) to run formatting (Prettier/ESLint) and Unit Tests.
   - Configure GitHub Actions to run the full `npm run test:e2e` suite against a distinct temporary PostgreSQL database instance on every PR.

## Immediate Action Items (Getting Started)
To execute this seamlessly:
1. Initialize the **Global Testing Suites** (ensure `jest-e2e.json` runs clean).
2. Begin **Phase 1 (Security Isolation)**.
3. Advance to **Phase 2 (Pagination & Error standardizing)**.
