---
description: Manage Docker containers for dev environment
allowed-tools: Bash(docker:*), Bash(docker-compose:*)
---

# Docker Container Management

Interactive troubleshooter for your Docker development environment (nginx, nextjs_app, redis, storybook_dev).

## Your Task

1. **Check container status first**
   ```bash
   docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -E '(nextjs_app|nginx|redis|storybook_dev)'
   ```

2. **Based on the status, provide appropriate guidance:**

### If all containers are running (healthy)

Say: "All 4 containers are running! Your dev environment is ready. ✓"

Show the current container status in a friendly table format.

### If any containers are down

**Step 1: Ask diagnostic questions to understand what happened**

Present these questions clearly:

```
To help you fix this, I need to understand what happened:

1️⃣  Did you just restart your computer, or manually stop the containers?
2️⃣  Did you recently change any configuration files (docker-compose.yml, .env, nginx.conf)?
3️⃣  Did you see any error messages before the containers stopped?
4️⃣  When did this last work? (today, yesterday, longer ago?)
```

**Step 2: Listen to their answers and provide a specific recommendation**

**If they say:** "Just restarted the computer" or "Stopped containers on purpose"
→ **Recommend: Simple Restart**
```
✅ RECOMMENDED: Simple restart (fastest option)

This will start your containers back up without rebuilding anything:

docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

This is usually what you want after a reboot.
```

**If they say:** "I changed docker-compose.yml" or "Modified .env files"
→ **Recommend: Rebuild with New Config**
```
✅ RECOMMENDED: Rebuild and restart (picks up your changes)

This will rebuild the containers with your new configuration:

docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

This ensures all config changes take effect.
```

**If they say:** "I saw error messages" or "One container keeps crashing"
→ **Recommend: Check Logs First**
```
✅ RECOMMENDED: Check logs to see what went wrong

Let me look at the error messages:

docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs nextjs_app --tail 50

[Run the command and show logs]

Based on the errors, I'll recommend the best fix:
- Just a restart? Use: `up`
- Need to rebuild? Use: `up --build`
- Something deeper? We might need to debug further
```

**If they say:** "It worked yesterday but not today" or "I'm not sure what happened"
→ **Recommend: Safe Rebuild**
```
✅ RECOMMENDED: Rebuild everything (safest option)

This rebuilds containers with the current code and config:

docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

This takes a bit longer but usually fixes mysterious issues.
```

**If they've tried multiple things:** "Nothing worked" or "I'm stuck"
→ **Recommend: Nuclear Option (with warning)**
```
⚠️  LAST RESORT: Complete fresh start (will delete local data)

Only use this if everything else has failed:

docker-compose -f docker-compose.yml -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

⚠️  WARNING: This deletes Docker volumes:
   - Redis cache will be cleared
   - Any uploaded files in volumes will be deleted
   - Database data if stored locally will be gone

Only use this if you don't need to preserve local data.
```

**Step 3: After recommending a command, offer next steps**

Ask: "Would you like me to run that command for you, or would you rather copy it and run it yourself?"

## Tone

Be friendly, reassuring, and smart. Use the project's communication style:
- Inviting ("Let's figure this out!")
- Focused (specific diagnosis, specific recommendation)
- Considerate (explain what each option does and when to use it)
- Supportive (no judgment - containers fail all the time!)
