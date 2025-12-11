import React from "react";
import { StyleSheet, View } from "react-native";
import ArticlesFeed from "@components/ArticlesFeed";

export default function Home() {
  return (
    <View style={styles.container}>
      <ArticlesFeed />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
  },
});
