Kill any running dev servers and restart on port 3000.

1. Check for processes on ports 3000–3009: `lsof -i :3000-3009 -t`
2. Kill any found: `lsof -i :3000-3009 -t 2>/dev/null | xargs kill -9 2>/dev/null`
3. Wait 1 second for cleanup
4. Start dev server in background: `cd app && npm run dev`
5. Wait 3 seconds, then verify with curl to localhost:3000
6. Report which ports were cleared and confirm server is up
