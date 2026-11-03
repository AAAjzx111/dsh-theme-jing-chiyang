/**
 * Host half of the 「镜 · 炽阳神光」 theme bundle.
 *
 * The whole theme lives in the Client half (`./client`): it registers the
 * colour tokens and draws the animated background inside the page. The Host
 * half exists because a Loader row needs a package entry point; it registers
 * nothing and never touches a service, so the theme cannot break the Host.
 */
export function apply() {}
