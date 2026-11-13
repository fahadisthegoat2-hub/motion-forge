# motion-forge — Claude Code plugin

Viral 3D story shorts, realistic humans and sets, twist-driven scripts, reference style
learning, custom animation, motion graphics, on-device rendering (Good / High / Epic),
and growth packs (titles, descriptions, tags).

## Install (any computer, any session)
You need **Node.js** (nodejs.org → LTS) and **Google Chrome**. Everything else downloads
itself the first time it runs. Blender and Python are never installed.

```bash
claude plugin marketplace add fahadisthegoat2-hub/motion-forge
```
```bash
claude plugin install motion-forge@motion-forge-marketplace
```

### Auto-enable in every session (incl. Claude Code on the web)
Add this to `~/.claude/settings.json` (all your sessions on that computer) or to
`.claude/settings.json` inside any repo (every session that opens that repo, cloud too):
```json
{
  "extraKnownMarketplaces": {
    "motion-forge-marketplace": {
      "source": { "source": "github", "repo": "fahadisthegoat2-hub/motion-forge" }
    }
  },
  "enabledPlugins": { "motion-forge@motion-forge-marketplace": true }
}
```

## Commands
| Command | Does |
|---|---|
| `/forge-short <premise>` | Full 3D short: twist script → scenes → QA → render → publish pack |
| `/forge-long <premise> [minutes]` | Long-form 16:9 video: chapters, twists, renders in parts |
| `/forge-story <premise>` | Hook → escalation → climax → plot-twist script |
| `/forge-learn <images>` | Learns a reusable style from reference images |
| `/forge-3d <idea>` | Polished 3D scene |
| `/forge-animate <idea>` | Pro animation (12 principles, springs) |
| `/forge-motion <brief>` | Motion graphics → MP4/GIF |
| `/forge-publish <video>` | Titles, description, tags, hashtags |

Say **"Blender/Python allowed"** to unlock the Blender pipeline.

All skills load automatically: a startup hook tells Claude which skills to use for every
kind of request, so you never have to name them.

## Render on your device
Scenes open in Chrome with a **Render on this device** panel: pick Good, High or Epic,
click Render MP4, and it renders on your GPU and downloads the video.
