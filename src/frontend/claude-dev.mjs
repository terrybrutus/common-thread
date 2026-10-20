import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { SYSTEM, MODEL, validateBrief, parseOutput, outputSchema } from "../../services/claude/worker/index.js";
export { SYSTEM, MODEL, validateBrief };
const RESERVATION = 0.01;
const DAILY_CAP = 0.10;

// Vite development middleware only. This module and the key never enter the browser bundle.
export function claudeDevPlugin(env, root) {
  const ledgerPath = resolve(root, "../../.cache/claude-test-budget.json");
  let busy = false;
  let lastCall = 0;
  return {
    name: "private-local-claude",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__local-ai/puzzle", async (req, res) => {
        const send = (status, data) => {
          res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
          res.end(JSON.stringify(data));
        };
        // Reject remote clients, cross-site requests, and non-POST requests.
        const address = req.socket.remoteAddress;
        if (!["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(address) || req.headers.origin !== `http://${req.headers.host}` || !/^(127\.0\.0\.1|localhost|\[::1\]):\d+$/.test(req.headers.host || "")) return send(403, { error: "Local preview only." });
        if (req.method !== "POST" || !req.headers["content-type"]?.startsWith("application/json")) return send(405, { error: "Send a JSON puzzle brief." });
        if (!env.ANTHROPIC_API_KEY) return send(503, { error: "The local Claude API key isn't configured." });
        if (busy || Date.now() - lastCall < 20000) return send(429, { error: "Please wait 20 seconds between generations." });
        busy = true;
        try {
          let body = "";
          for await (const chunk of req) {
            body += chunk;
            if (Buffer.byteLength(body) > 64000) { send(413, { error: "Please shorten the brief." }); return; }
          }
          let brief;
          try { brief = validateBrief(JSON.parse(body)); }
          catch { return send(400, { error: "Please shorten or complete the puzzle brief." }); }
          const day = new Date().toISOString().slice(0, 10);
          let ledger = { day, reserved: 0 };
          try { ledger = JSON.parse(readFileSync(ledgerPath, "utf8")); }
          catch (error) { if (error.code !== "ENOENT") throw error; }
          if (ledger.day !== day) ledger = { day, reserved: 0 };
          if (!Number.isFinite(ledger.reserved) || ledger.reserved < 0) throw new Error("Invalid budget ledger");
          if (ledger.reserved + RESERVATION > DAILY_CAP + 1e-9) return send(429, { error: "The local tester's $0.10 daily allowance is used. Try tomorrow (UTC)." });
          // Persist before sending: failures and restarts still count toward this conservative allowance.
          mkdirSync(resolve(ledgerPath, ".."), { recursive: true });
          writeFileSync(ledgerPath, JSON.stringify({ day, reserved: ledger.reserved + RESERVATION }));
          lastCall = Date.now();
          const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
            body: JSON.stringify({ model: MODEL, max_tokens: 4000, thinking: { type: "adaptive" }, output_config: { effort: "low", format: { type: "json_schema", schema: outputSchema } }, system: SYSTEM, messages: [{ role: "user", content: JSON.stringify(brief) }] }),
            signal: AbortSignal.timeout(60000),
          });
          if (!response.ok) return send(502, { error: response.status === 401 || response.status === 403 ? "Claude rejected the test credential. Check the account's API access." : "Claude couldn't generate a puzzle. Check API credit or try later." });
          const data = await response.json();
          if (data.stop_reason !== "end_turn") return send(502, { error: "Claude didn't finish the puzzle. Please try again." });
          const text = data.content.filter(block => block.type === "text").map(block => block.text).join("");
          if (text.length > 16000) return send(502, { error: "The AI response was too long." });
          try { send(200, { text: parseOutput(text) }); } catch (error) { send(422, { error: error.message }); }
        } catch {
          send(502, { error: "The local Claude connection failed. Check your connection and try again." });
        } finally { busy = false; }
      });
    },
  };
}
