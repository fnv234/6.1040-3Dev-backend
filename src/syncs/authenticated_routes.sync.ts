/**
 * Synchronizations for authenticated routes.
 * These routes require user authentication before executing.
 *
 * TODO: Add Authenticating/Sessioning concept for proper authentication.
 * For now, these syncs simply pass through the requests.
 *
 * NOTE: These syncs use the instrumented concept instances from @concepts,
 * which are already connected to the database and the sync engine.
 */

import { actions, Frames, Sync } from "@engine";
