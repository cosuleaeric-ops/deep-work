#!/bin/bash
# Rulează: bash push-to-github.sh  (sau: ./push-to-github.sh dacă ai chmod +x)

set -e
cd "$(dirname "$0")"

echo "=== 1. Verificare git ==="
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Inițializare repo..."
  git init
fi

echo "=== 2. Remote origin = deep-work pe GitHub ==="
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/cosuleaeric-ops/deep-work.git
git remote -v

echo "=== 3. Adaug toate fișierele ==="
git add -A
git status

echo "=== 4. Commit (dacă sunt modificări) ==="
if git diff --staged --quiet 2>/dev/null && git diff --quiet 2>/dev/null; then
  echo "Nu sunt modificări de commit."
else
  git commit -m "elite deep work: culori calendar, extensie, fix-uri" || true
fi

echo "=== 5. Branch main ==="
git branch -M main

echo "=== 6. Push la GitHub ==="
echo "Dacă cer parolă/token, folosește token-ul tău GitHub (Settings → Developer settings → Personal access tokens)."
git push -u origin main

echo ""
echo "Gata. Verifică pe https://github.com/cosuleaeric-ops/deep-work"
