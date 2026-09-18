# Complete the TypeNova learning experience

## What I’ll build
- Add a focused lesson workspace for all 18 lessons, with live guidance, keyboard highlighting, clear targets, retry controls, and automatic completion tracking.
- Add configurable typing tests for 15, 30, 60, and 120 seconds across easy, medium, and hard text.
- Add adaptive drills generated from each learner’s weak keys, plus manual key selection for new users.
- Add a readable progress page with trends, lesson completion, key accuracy, session history, coaching, and a protected reset action.
- Refine navigation and layouts across phone and desktop while preserving the established dark typing-lab visual direction.

## Quality and behavior
- Keep all practice results in the browser with no account required.
- Save each completed run exactly once and keep lesson, test, and drill statistics consistent.
- Ensure keyboard-only use, clear focus states, accessible labels, and reduced-motion support.
- Give every page unique search and sharing metadata.
- Verify every menu link, typing interaction, completion flow, retry action, and reset action in the running preview.

## Technical details
- Use the existing typing engine, profile model, lesson library, and semantic design tokens as the shared source of truth.
- Add TanStack routes for `/learn/$lessonId`, `/test`, `/drills`, and `/progress`.
- Reuse `TypingSurface`, `VirtualKeyboard`, `ResultsPanel`, `StatTile`, and `Sparkline`; refine shared pieces only where correctness or usability requires it.
- Run targeted checks and responsive browser verification after implementation.
