import React, { useCallback } from 'react';
import { FlatList, ListRenderItem, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import ArticleCard, { Article } from './ArticleCard';
import articles from '@assets/data/articles.json';

const ArticlesFeed: React.FC = () => {
  const data: Article[] = articles as Article[];

  const keyExtractor = useCallback((item: Article) => String(item.id), []);

  const renderItem: ListRenderItem<Article> = useCallback(({ item }) => (
    <ArticleCard article={item} onPress={() => {}} />
  ), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.header}>Статьи</Text>
        <FlatList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fb',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    color: '#0f172a',
  },
  listContent: {
    paddingBottom: 24,
  },
});

export default ArticlesFeed;
