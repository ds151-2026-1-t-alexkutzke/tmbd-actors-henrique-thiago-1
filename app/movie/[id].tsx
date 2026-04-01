import { Link, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, FlatList, Pressable } from 'react-native';
import { api } from '../../src/api/tmdb';

interface MovieDetails {
  title: string;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  runtime: number;
}

interface Actors {
  id: number;
  profile_path: string | null;
  name: string;
}

export default function MovieDetailsScreen() {
  // Captura o parâmetro '[id]' do nome do arquivo
  const { id } = useLocalSearchParams();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [Cast, setCast] = useState<Actors[]>([]);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const [response, responseActor] = await Promise.all([
          api.get(`/movie/${id}`),
          api.get(`/movie/${id}/credits`),
        ])
        setMovie(response.data);
        setCast(responseActor.data.cast.slice(0,10));
      } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]); // O hook é re-executado caso o ID mude

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Filme não encontrado.</Text>
      </View>
    );
  }

    const renderCastItem = ({ item }: { item: Actors }) => (
      // Link do Expo Router passando o ID do filme como parâmetro dinâmico
      <Link href={`../actor/${item.id}`} asChild>
        <Pressable>
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${item.profile_path}` }}
              style={styles.posterActor}
            />
            <Text style={styles.title}>{item.name}</Text>
          </Pressable>

      </Link>
    );

  return (
    <ScrollView style={styles.container}>
      {movie.poster_path && (
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
          style={styles.poster}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{movie.title}</Text>

        <View style={styles.statsContainer}>
          <Text style={styles.statText}>⭐ {movie.vote_average.toFixed(1)}/10</Text>
          <Text style={styles.statText}>⏱️ {movie.runtime} min</Text>
        </View>

        <Text style={styles.sectionTitle}>Sinopse</Text>
        <Text style={styles.overview}>
          {movie.overview || 'Sinopse não disponível para este filme.'}
        </Text>
        <Text style={styles.sectionTitle}>Atores</Text>
        <FlatList
          horizontal={true}
          data={Cast}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCastItem}
          contentContainerStyle={styles.listContainer}
        />

        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  poster: { width: '100%', height: 400 },
  content: { padding: 20 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  statsContainer: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statText: { color: '#E50914', fontSize: 16, fontWeight: '600' },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  overview: { color: '#D1D5DB', fontSize: 16, lineHeight: 24 },
  errorText: { color: '#FFFFFF', fontSize: 18 },
  listContainer: { padding: 16, color: '#ffffff' },
  posterActor: { width: 100, height: 150 },
});