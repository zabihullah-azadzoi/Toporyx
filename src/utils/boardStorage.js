export const EMPTY_DIAGRAM = { nodes: [], edges: [], drawings: [] };
export const DEFAULT_CAMERA = { x: 0, y: 0, z: 1 };
export const DEFAULT_BOARD = {
  id: 'default_board',
  name: 'Untitled Topology',
  diagram: EMPTY_DIAGRAM,
  camera: DEFAULT_CAMERA,
  updatedAt: 0,
};

export function parseStoredBoards(raw) {
  if (!raw) return [];

  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function loadLocalBoards(storage = globalThis.localStorage) {
  return parseStoredBoards(storage?.getItem('toporyx-local'));
}

export function saveLocalBoards(boards, storage = globalThis.localStorage) {
  storage?.setItem('toporyx-local', JSON.stringify(boards));
}

export function getStorageModeKey({ user, db, currentAppId }) {
  return user && db ? `cloud:${user.uid}:${currentAppId}` : 'local';
}

export function pickHydrationBoard(boards, preferredBoardId) {
  if (!Array.isArray(boards) || boards.length === 0) return DEFAULT_BOARD;
  return boards.find((board) => board.id === preferredBoardId) || boards[0];
}

export function buildFallbackBoard(latest) {
  return {
    id: latest.activeBoardId || DEFAULT_BOARD.id,
    name: latest.activeBoard?.name || DEFAULT_BOARD.name,
    diagram: latest.diagram || EMPTY_DIAGRAM,
    camera: latest.camera || DEFAULT_CAMERA,
    updatedAt: Date.now(),
  };
}

export function buildCloudSeedBoards(localBoards, latest) {
  if (Array.isArray(localBoards) && localBoards.length > 0) return localBoards;
  return [buildFallbackBoard(latest)];
}
