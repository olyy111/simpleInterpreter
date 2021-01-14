export let SHOULD_LOG_STACK: boolean = false;
export let SHOULD_LOG_SCOPE: boolean = false;
export function setStack(flag: boolean) {
  SHOULD_LOG_STACK = flag
}
export function setScope(flag: boolean) {
  SHOULD_LOG_SCOPE = flag
}