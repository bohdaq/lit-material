export { fixture, cleanup, type FixtureOptions } from "./fixture.js";
export { waitForUpdate, waitFor, nextFrame } from "./wait.js";
export {
  getByRole,
  getAllByRole,
  queryByRole,
  queryAllByRole,
  findByRole,
  getByText,
  queryByText,
  queryAllByText,
  findByText,
  getByLabel,
  type RoleOptions,
  type TextOptions,
  type TextMatch,
} from "./queries.js";
export { queryDeep, queryAllDeep, walk, composedParent, isHidden, type QueryRoot } from "./dom.js";
export { roleOf, accessibleName, isDisabled } from "./roles.js";
export { user, activeElement } from "./user.js";
