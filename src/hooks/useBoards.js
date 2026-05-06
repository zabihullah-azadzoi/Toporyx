import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { reportError } from '../utils/monitoring';
import {
  buildCloudSeedBoards,
  DEFAULT_BOARD,
  DEFAULT_CAMERA,
  EMPTY_DIAGRAM,
  getStorageModeKey,
  loadLocalBoards,
  pickHydrationBoard,
  saveLocalBoards,
} from '../utils/boardStorage';

export function useBoards({
  user,
  authReady,
  db,
  currentAppId,
  diagram,
  camera,
  generateId,
  setDiagram,
  setCamera,
  setSelectedId,
  setSidebarOpen,
  setScreenshotArea,
  setEditingBoardNameId,
  resetHistory,
}) {
  const [boards, setBoards] = useState([DEFAULT_BOARD]);
  const [activeBoardId, setActiveBoardId] = useState('default_board');
  const didHydrateRef = useRef(false);
  const lastStorageModeRef = useRef('boot');
  const cloudSeedAttemptedRef = useRef(false);
  const [saveState, setSaveState] = useState('saved');

  const activeBoard = useMemo(
    () => boards.find((b) => b.id === activeBoardId) || boards[0],
    [boards, activeBoardId],
  );
  const hasActiveBoard = Boolean(activeBoard);
  const activeBoardName = activeBoard?.name || DEFAULT_BOARD.name;
  const latestStateRef = useRef({
    diagram,
    camera,
    activeBoardId,
    activeBoard,
  });

  useEffect(() => {
    latestStateRef.current = {
      diagram,
      camera,
      activeBoardId,
      activeBoard,
    };
  }, [diagram, camera, activeBoardId, activeBoard]);

  useEffect(() => {
    if (!authReady) return;

    const nextModeKey = getStorageModeKey({ user, db, currentAppId });
    if (lastStorageModeRef.current !== nextModeKey) {
      didHydrateRef.current = false;
      cloudSeedAttemptedRef.current = false;
      lastStorageModeRef.current = nextModeKey;
    }

    if (user && db) {
      const boardsRef = collection(db, 'artifacts', currentAppId, 'users', user.uid, 'boards');
      const unsub = onSnapshot(
        boardsRef,
        (snapshot) => {
          const loadedBoards = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
          loadedBoards.sort((a, b) => b.updatedAt - a.updatedAt);

          if (loadedBoards.length > 0) {
            setBoards(loadedBoards);
            setActiveBoardId((prevId) => {
              const target = pickHydrationBoard(loadedBoards, prevId);
              if (!didHydrateRef.current) {
                setDiagram(target.diagram || EMPTY_DIAGRAM);
                setCamera(target.camera || DEFAULT_CAMERA);
                didHydrateRef.current = true;
              }
              return target.id;
            });
            setSaveState('saved');
          } else if (!cloudSeedAttemptedRef.current) {
            cloudSeedAttemptedRef.current = true;
            const latest = latestStateRef.current;
            const localBoards = loadLocalBoards();
            const boardsToSeed = buildCloudSeedBoards(localBoards, latest);

            Promise.all(
              boardsToSeed.map((board) =>
                setDoc(
                  doc(db, 'artifacts', currentAppId, 'users', user.uid, 'boards', board.id),
                  {
                    name: board.name || DEFAULT_BOARD.name,
                    diagram: board.diagram || EMPTY_DIAGRAM,
                    camera: board.camera || DEFAULT_CAMERA,
                    updatedAt: board.updatedAt || Date.now(),
                  },
                  { merge: true },
                ),
              ),
            )
              .then(() => setSaveState('saved'))
              .catch((err) => {
                setSaveState('error');
                reportError('boards.cloud.seed', err, { count: boardsToSeed.length });
              });
          }
        },
        (err) => {
          setSaveState('error');
          reportError('boards.cloud.sync', err);
        },
      );
      return () => unsub();
    }

    const hydrateTimeout = setTimeout(() => {
      const data = loadLocalBoards();
      if (data.length === 0) {
        setBoards([DEFAULT_BOARD]);
        setActiveBoardId('default_board');
        setDiagram(EMPTY_DIAGRAM);
        setCamera(DEFAULT_CAMERA);
        didHydrateRef.current = true;
        return;
      }

      setBoards(data);
      setActiveBoardId((prevId) => {
        const target = pickHydrationBoard(data, prevId);
        if (!didHydrateRef.current) {
          setDiagram(target.diagram || EMPTY_DIAGRAM);
          setCamera(target.camera || DEFAULT_CAMERA);
          didHydrateRef.current = true;
        }
        return target.id;
      });
      setSaveState('saved');
    }, 0);
    return () => clearTimeout(hydrateTimeout);
  }, [authReady, user, db, currentAppId, setDiagram, setCamera]);

  useEffect(() => {
    if (!authReady) return;
    if (!activeBoardId || !hasActiveBoard) return;
    const saveFrame = requestAnimationFrame(() => setSaveState('saving'));
    const timeout = setTimeout(() => {
      if (user && db) {
        const docRef = doc(db, 'artifacts', currentAppId, 'users', user.uid, 'boards', activeBoardId);
        setDoc(docRef, { name: activeBoardName, diagram, camera, updatedAt: Date.now() }, { merge: true })
          .then(() => setSaveState('saved'))
          .catch((err) => {
            setSaveState('error');
            reportError('boards.cloud.autosave', err, { boardId: activeBoardId });
          });
      } else {
        setBoards((prev) => {
          const updated = prev.map((board) =>
            board.id === activeBoardId ? { ...board, diagram, camera, updatedAt: Date.now() } : board,
          );
          saveLocalBoards(updated);
          return updated;
        });
        setSaveState('saved');
      }
    }, 800);

    return () => {
      cancelAnimationFrame(saveFrame);
      clearTimeout(timeout);
    };
  }, [authReady, diagram, camera, activeBoardId, hasActiveBoard, activeBoardName, user, db, currentAppId]);

  const handleSwitchBoard = useCallback(
    (board) => {
      setActiveBoardId(board.id);
      setDiagram(board.diagram || EMPTY_DIAGRAM);
      setCamera(board.camera || DEFAULT_CAMERA);
      setSelectedId(null);
      setSidebarOpen(false);
      setScreenshotArea(null);
      resetHistory();
    },
    [setDiagram, setCamera, setSelectedId, setSidebarOpen, setScreenshotArea, resetHistory],
  );

  const createNewBoard = useCallback(async () => {
    const newId = generateId('b');
    const newBoard = {
      id: newId,
      name: 'Draft Architecture',
      diagram: EMPTY_DIAGRAM,
      camera: DEFAULT_CAMERA,
      updatedAt: Date.now(),
    };

    setBoards((prev) => [newBoard, ...prev]);
    setActiveBoardId(newId);
    setDiagram(newBoard.diagram);
    setCamera(newBoard.camera);
    setSidebarOpen(false);
    resetHistory();

    if (user && db) {
      try {
        await setDoc(doc(db, 'artifacts', currentAppId, 'users', user.uid, 'boards', newId), newBoard);
      } catch (err) {
        reportError('boards.cloud.create', err, { boardId: newId });
      }
    }
  }, [generateId, setDiagram, setCamera, setSidebarOpen, resetHistory, user, db, currentAppId]);

  const deleteBoard = useCallback(
    async (id, event) => {
      event.stopPropagation();
      if (boards.length <= 1) return;

      setBoards((prev) => {
        const remaining = prev.filter((board) => board.id !== id);
        if (activeBoardId === id && remaining.length > 0) {
          handleSwitchBoard(remaining[0]);
        }
        return remaining;
      });

      if (user && db) {
        try {
          await deleteDoc(doc(db, 'artifacts', currentAppId, 'users', user.uid, 'boards', id));
        } catch (err) {
          reportError('boards.cloud.delete', err, { boardId: id });
        }
      }
    },
    [boards.length, activeBoardId, handleSwitchBoard, user, db, currentAppId],
  );

  const renameBoard = useCallback(
    async (id, newName) => {
      if (!newName.trim()) {
        setEditingBoardNameId(null);
        return;
      }

      setBoards((prev) =>
        prev.map((board) =>
          board.id === id ? { ...board, name: newName.trim(), updatedAt: Date.now() } : board,
        ),
      );
      setEditingBoardNameId(null);

      if (user && db) {
        try {
          await setDoc(
            doc(db, 'artifacts', currentAppId, 'users', user.uid, 'boards', id),
            { name: newName.trim(), updatedAt: Date.now() },
            { merge: true },
          );
        } catch (err) {
          reportError('boards.cloud.rename', err, { boardId: id });
        }
      }
    },
    [setEditingBoardNameId, user, db, currentAppId],
  );

  return {
    boards,
    activeBoardId,
    activeBoard,
    storageMode: user && db ? 'cloud' : 'local',
    saveState,
    createNewBoard,
    deleteBoard,
    renameBoard,
    handleSwitchBoard,
  };
}
