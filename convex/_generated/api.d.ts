/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as blog from "../blog.js";
import type * as cleanupAll from "../cleanupAll.js";
import type * as dropAll from "../dropAll.js";
import type * as fixUserSchema from "../fixUserSchema.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as profiles from "../profiles.js";
import type * as router from "../router.js";
import type * as search from "../search.js";
import type * as status from "../status.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  blog: typeof blog;
  cleanupAll: typeof cleanupAll;
  dropAll: typeof dropAll;
  fixUserSchema: typeof fixUserSchema;
  http: typeof http;
  messages: typeof messages;
  profiles: typeof profiles;
  router: typeof router;
  search: typeof search;
  status: typeof status;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
