import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { ImageBackground, StyleSheet, Text } from "react-native";
import { Exercise } from "services/workouts";

interface Workout {
  id: number;
  name: string;
  instructions: string;
  image?: string | null;
  exercises?: Exercise[];
}

interface CardProps {
  item: Workout;
}

export default function WorkoutCard({ item }: CardProps) {
  const image =
    item.image && item.image.trim() !== ""
      ? item.image
      : "https://picsum.photos/seed/workout/600/400";

  const ingredientsText = item.exercises
    ? item.exercises
        .slice(0, 3)
        .map((ex) => `• ${ex.name}${ex.quantity ? `: ${ex.quantity}` : ""}`)
        .join(" ")
    : "";

  return (
    <Link
      href={{ pathname: "/workouts/[id]", params: { id: item.id } }}
      style={styles.container}
    >
      <ImageBackground
        source={{ uri: image }}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.gradient}
        >
          <Text style={styles.name}>{item.name}</Text>
          {ingredientsText ? (
            <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
              {ingredientsText}...
            </Text>
          ) : (
            <Text style={styles.subtitle}>Нет упражнений</Text>
          )}
        </LinearGradient>
      </ImageBackground>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 8,
    marginHorizontal: 6,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  imageBackground: {
    width: "100%",
    height: 180,
    justifyContent: "flex-end",
  },
  imageStyle: {
    borderRadius: 16,
  },
  gradient: {
    padding: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: "#ddd",
    fontSize: 14,
    marginTop: 2,
  },
});
