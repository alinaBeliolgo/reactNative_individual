import CustomButton from "@components/CustomButton";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { deleteWorkout, getWorkoutById, Workout } from "services/workouts";

export default function WorkoutDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workoutId = id ? Number(id) : undefined;
  const [workout, setWorkout] = useState<Workout | null>(null);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      if (workoutId == null) return;

      async function load() {
        if (workoutId == null) return;
        const data = await getWorkoutById(workoutId);
        setWorkout(data);
      }
      load();
    }, [workoutId])
  );

  const handleDelete = async () => {
    if (!workoutId) return;

    Alert.alert(
      "Удалить тренировку",
      "Вы уверены, что хотите удалить эту тренировку?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWorkout(workoutId);
              Alert.alert("Успех", "Тренировка удалена!");
              router.back();
            } catch (error) {
              console.error(error);
              Alert.alert("Ошибка", "Произошла ошибка!");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (!workout) return <Text>Загрузка...</Text>;

  return (
    <ScrollView style={styles.container}>
      {workout.image ? (
        <Image source={{ uri: workout.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, { backgroundColor: "#eee" }]} />
      )}

      <View style={styles.textContainer}>
        <Text style={styles.title}>{workout.name}</Text>

        <Text style={styles.subtitle}>Упражнения:</Text>
        {workout.exercises && workout.exercises.length > 0 ? (
          workout.exercises.map((ing, idx) => (
            <Text key={idx}>
              - {ing.name} {ing.quantity ? `: ${ing.quantity}` : ""}
            </Text>
          ))
        ) : (
          <Text>Нет упражнений</Text>
        )}

        <Text style={styles.subtitle}>Шаги:</Text>
        <Text>{workout.instructions}</Text>
      </View>

      <CustomButton
        title="Редактировать тренировку"
        onPress={() =>
          router.push({
            pathname: "/workouts/add",
            params: { edit: "true", id: workout.id?.toString() },
          })
        }
      />
      <CustomButton title="Удалить тренировку" type="delete" onPress={handleDelete} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 16 
  },
  textContainer: { 
    marginTop: 10, 
    marginBottom: 20 
  },
  image: { 
    width: "100%", 
    height: 200, 
    borderRadius: 10 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold",
    marginVertical: 10
  },
  subtitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    marginTop: 10 
  },
});
