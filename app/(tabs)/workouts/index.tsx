import CustomButton from "@components/CustomButton";
import SearchBar from "@components/SearchBar";
import WorkoutCard from "@components/WorkoutCard";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { getAllWorkouts, Workout } from "services/workouts";

export default function WorkoutsIndex() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const router = useRouter();

  const [query, setQuery] = useState<string>("");

  const handleSearch = async () => {
    try {
      const results: Workout[] = await getAllWorkouts(query || "");
      setWorkouts(results || []);
    } catch (error) {
      console.error(error);
      setWorkouts([]);
    }
  };

  const loadWorkouts = async () => {
    try {
      const data: Workout[] = await getAllWorkouts();
      setWorkouts(data);
    } catch (error) {
      console.error(error);
      setWorkouts([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Поиск локальных тренировок</Text>
      <SearchBar query={query} setQuery={setQuery} handleSearch={handleSearch} placeholder="Напр.: ноги" />

      <Text style={styles.title}>Мои тренировки</Text>
      {workouts.length === 0 && <Text style={styles.noData}>Тренировок нет</Text>}
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id!.toString()}
        renderItem={({ item }) => <WorkoutCard item={item} />}
        showsVerticalScrollIndicator={false}
      />

      <CustomButton
        title={"➕ Добавить тренировку"}
        onPress={() => router.push("/workouts/add")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16,
    backgroundColor: "#fff" 
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold",
    marginBottom: 10 
  },
  noData: { 
    fontSize: 16, 
    textAlign: "center",
    color: "#6A6887",
    marginTop: 20,
  },
});
