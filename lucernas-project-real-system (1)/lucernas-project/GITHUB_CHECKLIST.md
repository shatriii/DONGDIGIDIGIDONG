# Before you push this to GitHub

1. **Never commit `.env`.** It's already in `.gitignore` at the repo root
   and inside `backend/`. Only `backend/.env.example` (placeholders, no
   real values) should be committed. When you deploy, create the real
   `.env` directly on your host/CI — never in the repo.

2. **Rotate every secret that was ever in a real `.env` you shared or
   committed anywhere** — DB password, JWT_SECRET, AES_SECRET_KEY,
   DEPLOYER_PRIVATE_KEY, EMAIL_PASS. Old values should be treated as
   permanently compromised even if you delete the file later, since git
   history keeps everything unless you rewrite it.

3. **If you already pushed a `.env` in an earlier commit**, deleting it in
   a new commit is not enough — it's still in history. Either:
   - rotate the secrets (simplest, and you should do this anyway), or
   - scrub history with a tool like `git filter-repo` or BFG Repo-Cleaner
     before making the repo public.

4. **GitHub alone doesn't run this app.** It's just code storage. To
   actually have a working system online you still need:
   - a Postgres database somewhere (Supabase, Railway, RDS, etc.)
   - a place to run `backend/` (Render, Railway, Fly.io, a VPS, etc.) —
     set the real env vars there, not in the repo
   - a place to run/build `frontend/` (Vercel, Netlify, or serve the
     `npm run build` output from anywhere) — point it at the deployed
     backend URL instead of the local dev proxy
   - a running Besu node (or whatever RPC endpoint `BESU_RPC_URL` points
     to) reachable from wherever the backend runs

5. Decide public vs. private repo. Given this handles student PII (names,
   emails, course) and event ticketing, a private repo is the safer
   default unless there's a specific reason to make it public.
