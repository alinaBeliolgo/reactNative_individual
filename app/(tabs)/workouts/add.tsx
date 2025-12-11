import CustomButton from "@components/CustomButton";
import CustomInput from "@components/CustomInput";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Exercise, getWorkoutById, saveWorkout, updateWorkout } from "services/workouts";

export default function AddWorkout() {
  const { edit, id } = useLocalSearchParams();
  const isEdit = edit === "true";
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [ingredients, setIngredients] = useState<Exercise[]>([]);
  const [instructions, setInstructions] = useState<string>("");
  const [image, setImage] = useState<string>("");

  useEffect(() => {
    if (isEdit && id) {
      (async () => {
        const workout = await getWorkoutById(Number(id));
        if (workout) {
          setName(workout.name);
          setInstructions(workout.instructions);
          setImage(workout.image || "");
          setIngredients(workout.exercises || []);
        }
      })();
    }
  }, [isEdit, id]);

  const handleAddIngredient = () => {
    setIngredients(prev => [...prev, { name: "", quantity: "" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: 'name' | 'quantity', value: string) => {
    setIngredients(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || ingredients.length === 0 || !instructions.trim()) {
      Alert.alert("Ошибка", "Заполните все поля!");
      return;
    }

    const filteredIngredients = ingredients.filter(i => i.name.trim());
    if (filteredIngredients.length === 0) {
      Alert.alert("Ошибка", "Добавьте хотя бы одно упражнение!");
      return;
    }

    try {
      if (isEdit && id) {
        await updateWorkout(Number(id), name.trim(), filteredIngredients, instructions.trim(), image);
        Alert.alert("Успех", "Тренировка обновлена!");
      } else {
        await saveWorkout(name.trim(), filteredIngredients, instructions.trim(), image);
        Alert.alert("Успех", "Тренировка сохранена!");
      }
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Ошибка", "Произошла ошибка!");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isEdit ? "Редактировать тренировку" : "Добавить тренировку"}</Text>
      
      <CustomInput onChangeText={setName} value={name} placeholder="Напр.: Тренировка ног" />

      <Text style={styles.sectionTitle}>Упражнения</Text>
      {ingredients.map((ingredient, index) => (
        <View key={index} style={styles.ingredientRow}>
          <CustomInput
            placeholder="Напр.: Приседания"
            value={ingredient.name}
            onChangeText={(value) => handleIngredientChange(index, "name", value)}
            style={styles.inputSmall}
          />
          <CustomInput
            placeholder="Напр.: 3x12"
            value={ingredient.quantity || ""}
            onChangeText={(value) => handleIngredientChange(index, "quantity", value)}
            style={styles.inputSmall}
          />
          <Pressable style={styles.removeBtn} onPress={() => handleRemoveIngredient(index)}>
            <Text style={{ color: "white" }}>✕</Text>
          </Pressable>
        </View>
      ))}

      <CustomButton type='secondary' title="+ Добавить упражнение" onPress={handleAddIngredient} />

      <CustomInput onChangeText={setInstructions} value={instructions} placeholder="Описание / Шаги" multiline />

      <CustomButton title={image ? "Изменить изображение" : "Добавить изображение"} onPress={pickImage} /> 
      {image ? (
        <View style={styles.thumbnailContainer}>
          <Image source={{ uri: image }} style={styles.thumbnail} />
        </View>
      ) : null}

      <CustomButton title={isEdit ? "Обновить" : "Сохранить"} onPress={handleSave} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 16,
    flexGrow: 1,
    backgroundColor: "#fff"
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    marginBottom: 10 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    marginVertical: 10
  },
  ingredientRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginVertical: 4,
  },
  inputSmall: {
    flex: 1,
    marginRight: 6,
  },
  removeBtn: { 
    backgroundColor: "red", 
    padding: 6, 
    borderRadius: 8,
  },  
  addIngredientBtn: { 
    backgroundColor: "#22C55E", 
    padding: 8, 
    borderRadius: 8, 
    alignItems: "center",
    marginVertical: 8 
  },
  addIngredientText: { 
    color: "#fff" 
  },
  button: { 
    backgroundColor: "#ff914d", 
    padding: 10, 
    borderRadius: 8, 
    alignItems: "center", 
    marginVertical: 6 
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "bold" 
  },
  thumbnailContainer: {
    marginVertical: 10,
    alignItems: "center",
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 10,
    resizeMode: "cover",
  },
});
