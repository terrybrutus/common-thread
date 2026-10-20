import { SYSTEM, MODEL, validateBrief, claudeRequest, parseClaudeResponse, CLAUDE_TIMEOUT_MS, claudeError, storyQuestionResponse } from "../../services/claude/worker/index.js";
export { SYSTEM, MODEL, validateBrief };

// Vite development middleware only. This module and the key never enter the browser bundle.
export function claudeDevPlugin(env) {
  let busy = false;
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
        if (busy) return send(429, { error: "Your puzzle is still being made. Wait for it to finish." });
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
          const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
            body: JSON.stringify(claudeRequest(brief)),
            signal: AbortSignal.timeout(CLAUDE_TIMEOUT_MS),
          });
          if (!response.ok) return send(502, { error: await claudeError(response) });
          const data = await response.json();
          try { send(200, { text: parseClaudeResponse(data, brief) }); } catch (error) { send(422, storyQuestionResponse(error)); }
        } catch {
          send(502, { error: "The local Claude connection failed. Check your connection and try again." });
        } finally { busy = false; }
      });
    },
  };
}
