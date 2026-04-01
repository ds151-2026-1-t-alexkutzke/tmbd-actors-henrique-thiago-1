import { Link, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, FlatList, Pressable } from 'react-native';
import { api } from '../../src/api/tmdb';

interface Movies {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

interface CastDetails {
  profile_path: string | null;
  name: string;
  biography: string;
  birthday: string;
  deathday: string | null;
}

export default function ActorDetailsScreen() {
  // Captura o parâmetro '[id]' do nome do arquivo
  const { id } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [Cast, setCast] = useState<CastDetails | null>(null);
  const [movies, setMovies] = useState<Movies[]>([]);

  console.log(movies);
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const [responseCast, responseMovies] = await Promise.all([
          api.get(`/person/${id}`),
          api.get(`/person/${id}/movie_credits`),
        ])
        setMovies(responseMovies.data.cast.slice(0,10));
        setCast(responseCast.data);
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

  if (!Cast) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Ator não encontrado.</Text>
      </View>
    );
  }

    const renderMovieItem = ({ item }: { item: Movies }) => (
      // Link do Expo Router passando o ID do filme como parâmetro dinâmico
      <Link href={`../movie/${item.id}`} asChild>
        <Pressable>
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
              style={styles.posterMovie}
            />
            <Text style={styles.title}>{item.title}</Text>
          </Pressable>

      </Link>
    );

  return (
    <ScrollView style={styles.container}>
      {Cast.profile_path && (
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${Cast.profile_path}` }}
          style={styles.poster}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>{Cast.name}</Text>

        <View style={styles.statsContainer}>
          <Text style={styles.statText}>⭐ {Cast.birthday}</Text>
          <Text style={styles.statText}>⏱️ {Cast.deathday ? (Cast.deathday) : "Em Breve"}</Text>
        </View>

        <Text style={styles.sectionTitle}>Sinopse</Text>
        <Text style={styles.overview}>
          {Cast.biography || 'Biografia não disponível para este ator.'}
        </Text>
        <Text style={styles.sectionTitle}>Filmes feitos</Text>
        <FlatList
          horizontal={true}
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMovieItem}
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
  posterMovie: { width: 100, height: 150 },
});