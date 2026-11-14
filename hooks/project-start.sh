#!/bin/sh
# Fallback for sessions on this repo where the marketplace plugin didn't load: same rules, paths = this repo.
if ls -d "$HOME"/.claude/plugins/cache/*/motion-video >/dev/null 2>&1; then exit 0; fi
sed "s#\${CLAUDE_PLUGIN_ROOT}#$CLAUDE_PROJECT_DIR#g" "$CLAUDE_PROJECT_DIR/hooks/context.md"
echo "Skills are plain files in this repo: before working, read $CLAUDE_PROJECT_DIR/skills/<name>/SKILL.md for every skill the routing above names."
