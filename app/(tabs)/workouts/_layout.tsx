import { Stack } from "expo-router";
import { FC } from "react";

const WorkoutsLayout: FC = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Мои тренировки" }} />
      <Stack.Screen name="add" options={{ title: "Добавить тренировку" }} />
      <Stack.Screen name="[id]" options={{ title: "Детали тренировки" }} />
    </Stack>
  );
};

export default WorkoutsLayout;
