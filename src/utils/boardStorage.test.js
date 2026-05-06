import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCloudSeedBoards,
  DEFAULT_BOARD,
  getStorageModeKey,
  parseStoredBoards,
  pickHydrationBoard,
} from './boardStorage.js';

test('parseStoredBoards returns an empty array for invalid payloads', () => {
  assert.deepEqual(parseStoredBoards(''), []);
  assert.deepEqual(parseStoredBoards('nope'), []);
  assert.deepEqual(parseStoredBoards('{"bad":true}'), []);
});

test('pickHydrationBoard prefers the requested board id', () => {
  const boards = [
    { ...DEFAULT_BOARD, id: 'a', name: 'A' },
    { ...DEFAULT_BOARD, id: 'b', name: 'B' },
  ];

  assert.equal(pickHydrationBoard(boards, 'b').id, 'b');
  assert.equal(pickHydrationBoard(boards, 'missing').id, 'a');
});

test('buildCloudSeedBoards keeps all local boards when they exist', () => {
  const localBoards = [
    { ...DEFAULT_BOARD, id: 'a' },
    { ...DEFAULT_BOARD, id: 'b' },
  ];

  const result = buildCloudSeedBoards(localBoards, {
    activeBoardId: 'c',
    activeBoard: null,
    diagram: { nodes: [], edges: [], drawings: [] },
    camera: { x: 1, y: 2, z: 3 },
  });

  assert.equal(result.length, 2);
  assert.deepEqual(result.map((board) => board.id), ['a', 'b']);
});

test('buildCloudSeedBoards falls back to current in-memory board', () => {
  const result = buildCloudSeedBoards([], {
    activeBoardId: 'live_board',
    activeBoard: { name: 'Live Board' },
    diagram: { nodes: [{ id: 'n1' }], edges: [], drawings: [] },
    camera: { x: 10, y: 20, z: 2 },
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'live_board');
  assert.equal(result[0].name, 'Live Board');
  assert.equal(result[0].camera.z, 2);
});

test('getStorageModeKey separates local and cloud sessions', () => {
  assert.equal(getStorageModeKey({ user: null, db: null, currentAppId: 'x' }), 'local');
  assert.equal(
    getStorageModeKey({ user: { uid: 'u1' }, db: {}, currentAppId: 'app-1' }),
    'cloud:u1:app-1',
  );
});
