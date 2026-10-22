# Third-party resources

## Character: VRM1_Constraint_Twist_Sample

- Author: pixiv Inc.; version v1.0.1; copyright (c) 2022 pixiv Inc.
- Official source: https://github.com/vrm-c/vrm-specification/tree/master/samples/VRM1_Constraint_Twist_Sample
- Downloaded from: https://raw.githubusercontent.com/pixiv/three-vrm/dev/packages/three-vrm/examples/models/VRM1_Constraint_Twist_Sample.vrm
- Local file: `dist/assets/rain-walker.vrm` (unchanged original binary).
- SHA-256: `12c2b97e95e700783a6a550dc0eee2d7880aeedccef9ae67bc4c5a2f0f2631a2`.
- License: VRM Public License 1.0, https://vrm.dev/licenses/1.0/ . The model's embedded settings are preserved; a readable copy is in `dist/assets/rain-walker-license.json`.
- Embedded permissions include avatar use by everyone, commercial use by corporations, redistribution, and modification with redistribution. Attribution is not required by the model settings; the original copyright and license remain with the author.
- The supplied model is visually similar to the reference video. The reference creator's actual asset source has not been verified.

Animation blending, movement-distance sampling, foot-contact calibration, prop attachment and MToon adjustments are implemented by this project. Model geometry and painted textures belong to pixiv Inc.; the skeletal animation assets have their own CC0 sources listed below.

## Skeletal animations: CC0 1.0

The game uses three separate VRM Animation files. Original bytes are preserved, with local filenames chosen for the game.

| Local file | Creator and source motion | Original author page | SHA-256 |
| --- | --- | --- | --- |
| `dist/assets/animations/walk.vrma` | JenJell, Josie Walk; retargeted to VRM by sashii | https://booth.pm/ja/items/7861818 | `51c4158488a86a6bb99b978fb4d269e1798f9749bceaf0420473bae413fc3271` |
| `dist/assets/animations/run.vrma` | JenJell, Josie SlowRun; retargeted to VRM by sashii | https://booth.pm/ja/items/7861818 | `54fff21bbbbbe6364dc812f39dd849eadb61de3888b556580143d386592d17e5` |
| `dist/assets/animations/idle.vrma` | sashii, Sachi VRMA 1, `idle-01.vrma` | https://booth.pm/ja/items/6412084 | `5ed6c016df035b21daaefe64751e1356387c6a33693d31366b0912ac7566ea92` |

- License: CC0 1.0 Universal, https://creativecommons.org/publicdomain/zero/1.0/ .
- Both sashii author pages explicitly declare CC0. The original Josie asset page also declares Creative Commons Zero v1.0 Universal: https://jenjell.itch.io/josie-character-model .
- CC0 permits use, modification and redistribution without required attribution. Creator names are retained here voluntarily for provenance.
- Files were downloaded from the VoxAvatar redistribution mirror, with SHA-256 values matching its source manifest. Exact download URLs and the source record are preserved in `dist/assets/animations/SOURCES.md`.
- `run.vrma` is the source `SlowRun` clip, used as the game's running gait. Runtime retargeting, loop interpolation and contact correction do not modify the stored source bytes.

## Three.js, three-vrm and three-vrm-animation

- Three.js 0.186.1: MIT; `dist/vendor/THREE-LICENSE.txt`.
- @pixiv/three-vrm 3.5.5: MIT; `dist/vendor/THREE-VRM-LICENSE.txt`.
- @pixiv/three-vrm-animation 3.5.5: MIT; `dist/vendor/THREE-VRM-ANIMATION-LICENSE.txt`; implements VRMA loading and humanoid retargeting. Official source: https://github.com/pixiv/three-vrm/tree/dev/packages/three-vrm-animation .
- Dependencies are stored locally in `dist/vendor/`; runtime does not fetch a CDN.

## Project-created product packaging

`dist/assets/products-atlas-v1.png` was generated for this project with built-in ImageGen on 2026-10-12. It contains imaginary AME MART package artwork, not a downloaded commercial brand pack. The original image is stored locally without repainting; runtime uses its sixteen cells through UV mapping. The final prompt and integration notes are in `dist/assets/ART_DIRECTION.md`. The avatar's painted textures remain the original pixiv model textures.
