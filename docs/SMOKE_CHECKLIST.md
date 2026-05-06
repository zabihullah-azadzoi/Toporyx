# Toporyx Smoke Checklist

Run this before shipping or after touching storage, auth, or canvas behavior.

## Local Mode

1. Open the app signed out and confirm the top-left status shows `Local`.
2. Create a board, add a few nodes, connect them, resize at least one special shape (`cloud`, `diamond`, `hexagon`, `cylinder`).
3. Refresh and confirm the board is still there.
4. Close and reopen the app/browser tab and confirm the same board still loads.

## Cloud Mode

1. Sign in and confirm the top-left status switches to `Cloud`.
2. If this is a fresh user, confirm existing local boards appear after a short moment.
3. Create a new board while signed in, add content, wait for the status to return to `Saved`, then refresh.
4. Sign out and sign back in; confirm the cloud-created board is still present.

## Mode Switching

1. While signed in, switch between two boards and refresh on each board once.
2. Sign out and confirm the app returns to the local board set rather than the cloud board set.
3. Sign back in and confirm the cloud board set comes back.

## Editing & Recovery

1. Rename a board and confirm the new name persists after refresh.
2. Delete a non-primary board and confirm it stays deleted after refresh.
3. Use undo/redo after moving or resizing nodes.
4. Export a snapshot and confirm the preview or download still works.

## Failure Signals

1. Confirm the status chip does not stay stuck on `Saving`.
2. If a save fails, confirm the status shows `Save failed`.
