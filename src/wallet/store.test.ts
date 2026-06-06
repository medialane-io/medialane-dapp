import { describe, it, expect, beforeEach } from "bun:test";
import { createWalletStore } from "./store";

describe("wallet store active-backend gating", () => {
  let s: ReturnType<typeof createWalletStore>;
  beforeEach(() => {
    s = createWalletStore();
  });

  it("starts idle", () => {
    expect(s.getState().status).toBe("idle");
    expect(s.getState().backend).toBeNull();
  });

  it("setActive marks a backend+method active and connecting", () => {
    s.getState().setActive("braavos");
    expect(s.getState().backend).toBe("injected");
    expect(s.getState().method).toBe("braavos");
    expect(s.getState().status).toBe("connecting");
  });

  it("applies ingest from the ACTIVE backend", () => {
    s.getState().setActive("braavos");
    s.getState().ingest("injected", {
      status: "ready",
      method: "braavos",
      address: "0xabc",
      error: null,
    });
    expect(s.getState().status).toBe("ready");
    expect(s.getState().address).toBe("0xabc");
  });

  it("IGNORES ingest from a non-active backend (no hijack)", () => {
    s.getState().setActive("braavos");
    s.getState().ingest("injected", {
      status: "ready",
      method: "braavos",
      address: "0xabc",
      error: null,
    });
    // a stale embedded (Privy) update must NOT take over
    s.getState().ingest("embedded", {
      status: "ready",
      method: "privy",
      address: "0xPRIVY",
      error: null,
    });
    expect(s.getState().method).toBe("braavos");
    expect(s.getState().address).toBe("0xabc");
  });

  it("clearActive resets to idle", () => {
    s.getState().setActive("privy");
    s.getState().clearActive();
    expect(s.getState().status).toBe("idle");
    expect(s.getState().backend).toBeNull();
  });
});
