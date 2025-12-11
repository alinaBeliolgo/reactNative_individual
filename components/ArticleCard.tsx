import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export type Article = {
  id: number;
  title: string;
  description: string;
  image: string; // local path or URL
  category: string;
};

type Props = {
  article: Article;
  onPress?: () => void;
};

const ArticleCard: React.FC<Props> = ({ article, onPress }) => {
  return (
    <Pressable style={styles.card} onPress={onPress} android_ripple={{ color: '#eaeaea' }}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: article.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{article.category}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{article.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{article.description}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 180,
    backgroundColor: '#f2f2f2',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  content: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});

export default ArticleCard;
