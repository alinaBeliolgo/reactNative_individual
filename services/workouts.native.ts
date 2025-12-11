// Native (iOS/Android): SQLite DB for workouts via expo-sqlite
type SQLiteMod = typeof import("expo-sqlite");
let SQLite: SQLiteMod | null = null;
async function getSQLiteModule(): Promise<SQLiteMod> {
  if (!SQLite) {
    const mod = await import("expo-sqlite");
    SQLite = mod;
  }
  return SQLite;
}

export interface Exercise {
  id?: number;
  name: string;
  quantity?: string; // sets/reps or duration
}

export interface Workout {
  id: number;
  name: string;
  instructions: string;
  image?: string;
  exercises?: Exercise[];
}

let dbPromise: Promise<import("expo-sqlite").SQLiteDatabase> | null = null;

function normalizeString(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export async function getDB(): Promise<import("expo-sqlite").SQLiteDatabase> {
  if (!dbPromise) {
    const sqlite = await getSQLiteModule();
    dbPromise = sqlite.openDatabaseAsync("workouts.db");
    const db = await dbPromise;

    await db.execAsync(`
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        instructions TEXT,
        image TEXT
      );

      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS workout_exercises (
        workout_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        quantity TEXT,
        FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
      );
    `);
  }
  return dbPromise as Promise<import("expo-sqlite").SQLiteDatabase>;
}

export async function resetDatabase(): Promise<void> {
  const db = await getDB();
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      PRAGMA foreign_keys = OFF;

      DROP TABLE IF EXISTS workout_exercises;
      DROP TABLE IF EXISTS exercises;
      DROP TABLE IF EXISTS workouts;

      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        instructions TEXT,
        image TEXT
      );

      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS workout_exercises (
        workout_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        quantity TEXT,
        FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
      );
    `);
  });
}

export async function saveWorkout(
  name: string,
  exercises: Exercise[],
  instructions: string,
  image?: string
): Promise<void> {
  const db = await getDB();

  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      "INSERT INTO workouts (name, instructions, image) VALUES (?, ?, ?)",
      [name, instructions, image ?? null]
    );
    const workoutId = result.lastInsertRowId;

    for (const { name: exName, quantity } of exercises) {
      const normalizedName = exName.trim().toLowerCase();

      let exercise = await db.getFirstAsync<{ id: number }>(
        "SELECT id FROM exercises WHERE name = ?",
        [normalizedName]
      );

      let exerciseId: number;

      if (exercise) {
        exerciseId = exercise.id;
      } else {
        const insertResult = await db.runAsync(
          "INSERT INTO exercises (name) VALUES (?)",
          [normalizedName]
        );
        exerciseId = insertResult.lastInsertRowId;
      }

      await db.runAsync(
        "INSERT INTO workout_exercises (workout_id, exercise_id, quantity) VALUES (?, ?, ?)",
        [workoutId, exerciseId, quantity ?? null]
      );
    }
  });
}

export async function updateWorkout(
  id: number,
  name: string,
  exercises: Exercise[],
  instructions: string,
  image?: string
): Promise<void> {
  const db = await getDB();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      "UPDATE workouts SET name = ?, instructions = ?, image = ? WHERE id = ?",
      [name, instructions, image ?? null, id]
    );

    await db.runAsync("DELETE FROM workout_exercises WHERE workout_id = ?", [id]);

    for (const { name: exName, quantity } of exercises) {
      const normalizedName = exName.trim().toLowerCase();

      let exercise = await db.getFirstAsync<{ id: number }>(
        "SELECT id FROM exercises WHERE name = ?",
        [normalizedName]
      );

      let exerciseId: number;

      if (exercise) {
        exerciseId = exercise.id;
      } else {
        const insertResult = await db.runAsync(
          "INSERT INTO exercises (name) VALUES (?)",
          [normalizedName]
        );
        exerciseId = insertResult.lastInsertRowId;
      }

      await db.runAsync(
        "INSERT INTO workout_exercises (workout_id, exercise_id, quantity) VALUES (?, ?, ?)",
        [id, exerciseId, quantity ?? null]
      );
    }
  });
}

export async function getAllWorkouts(keyword?: string): Promise<Workout[]> {
  const db = await getDB();

  let workouts: Workout[];

  if (keyword && keyword.trim() !== "") {
    const normalized = normalizeString(keyword.trim());
    const all = await db.getAllAsync<Workout>("SELECT * FROM workouts");
    workouts = all.filter((w) => normalizeString(w.name).includes(normalized));
  } else {
    workouts = await db.getAllAsync<Workout>("SELECT * FROM workouts");
  }

  for (const workout of workouts) {
    if (!workout.id) continue;

    const exercises = await db.getAllAsync<Exercise>(
      `
      SELECT e.name, we.quantity
      FROM workout_exercises we
      JOIN exercises e ON we.exercise_id = e.id
      WHERE we.workout_id = ?
      `,
      [workout.id]
    );

    workout.exercises = exercises;
  }

  if (keyword && keyword.trim() !== "") {
    const normalized = normalizeString(keyword.trim());
    workouts = workouts.filter((workout) => {
      const matchesName = normalizeString(workout.name).includes(normalized);
      const matchesExercise = (workout.exercises ?? []).some((ex) =>
        normalizeString(ex.name).includes(normalized)
      );
      return matchesName || matchesExercise;
    });
  }

  return workouts;
}

export async function getWorkoutById(id: number): Promise<Workout | null> {
  const db = await getDB();

  const workout = await db.getFirstAsync<Workout>(
    "SELECT * FROM workouts WHERE id = ?",
    [id]
  );

  if (!workout) return null;

  const exercises = await db.getAllAsync<Exercise>(
    `
    SELECT e.name, we.quantity
    FROM workout_exercises we
    JOIN exercises e ON we.exercise_id = e.id
    WHERE we.workout_id = ?;
    `,
    [id]
  );

  workout.exercises = exercises;
  return workout;
}

export async function deleteWorkout(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync("DELETE FROM workouts WHERE id = ?", [id]);
}

export async function getWorkoutExercises(): Promise<Exercise[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<Exercise>("SELECT * FROM exercises");
  return rows;
}

export default {
  getDB,
  resetDatabase,
  saveWorkout,
  updateWorkout,
  getAllWorkouts,
  getWorkoutById,
  deleteWorkout,
  getWorkoutExercises,
};
