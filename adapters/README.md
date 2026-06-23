# Adapters

An adapter implements the factory for exactly one technology stack. It is the
only layer that names a framework, a language, or a file path. The process and
contract layers never change when an adapter is added or removed.

## What an adapter contains

Each adapter is a self-contained directory `adapters/<name>/`:

- `manifest.yaml`, conformant to `contract/schemas/adapter-manifest.schema.yaml`,
  declaring the stack, capabilities, supported auth methods, build and test
  commands, directory conventions, the agents it ships, the locations of its code
  patterns, a scaffold source, and a `governance:` sub-envelope.
- `agents/`, the focused code-generation agents the scaffolding orchestrator
  invokes (data, API, UI, configure, trim, and any optional reviewer or seed
  generator the manifest declares).
- `patterns/`, concrete code-generation patterns the agents follow.
- `validation/`, the stack-specific invariants checked during final validation.

The factory binds a run to an adapter at pre-flight and confirms, once the
deployment variant is known at Stage 2, that the adapter can satisfy the run's
variant and auth methods before any scaffolding begins.

## Shipped adapters

### `encore-vue`

A neutral adapter for an Encore.ts backend with one or two Vue 3 SPAs on PrimeVue,
PostgreSQL (Encore `SQLDatabase`, tagged-template SQL, no ORM), and OpenID Connect
authentication via rauthy. It supports single and dual deployment topologies.

This adapter is **specification-complete** and its conventions are verified
against the runnable scaffold tree (the neutral `template-encore` repository,
referenced by `scaffold.source`). Create-eligibility is gated on publishing that
repository under the declared remote; until it is published the adapter fully
documents the stack and is locally verifiable, but cannot fetch the scaffold to
create a project end to end.

To contribute another adapter, follow `docs/how-to.md` ("Adding an adapter") and
the Adapter Manifest schema.
