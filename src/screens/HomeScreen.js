import React from 'react';
import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const FASES = [
  {
    id: '1',
    numero: '01',
    titulo: 'Fotografo Explorador',
    descricao: 'Use a camera para capturar evidencias da missao.',
    rota: 'Fase1',
    icone: '📸',
    bloqueada: false,
  },
  {
    id: '2',
    numero: '02',
    titulo: 'Explorador em Movimento',
    descricao: 'Incline o celular e guie o explorador pelo mapa.',
    rota: 'Level2',
    icone: '🧭',
    bloqueada: false,
  },
  {
    id: '3',
    numero: '03',
    titulo: 'Mensagem Secreta',
    descricao: 'Agende uma notificacao e toque nela para concluir.',
    rota: 'Fase3',
    icone: '📧',
    bloqueada: false,
  },
  {
    id: '4',
    numero: '04',
    titulo: 'Codigo de Vibracao',
    descricao: 'Pressione os botoes para sentir vibracoes diferentes.',
    rota: 'Level4',
    icone: '📳',
    bloqueada: false,
  },
];

export default function HomeScreen({ navigation }) {
  function abrirFase(fase) {
    if (fase.bloqueada || !fase.rota) {
      return;
    }

    navigation.navigate(fase.rota);
  }

  function renderizarFase({ item }) {
    return (
      <TouchableOpacity
        style={[styles.card, item.bloqueada && styles.cardBloqueado]}
        onPress={() => abrirFase(item)}
        activeOpacity={item.bloqueada ? 1 : 0.75}
      >
        <View style={styles.cardEsquerda}>
          <View style={styles.iconeFase}>
            <Text style={styles.textoIcone}>{item.icone}</Text>
          </View>
          <View style={styles.conteudoCard}>
            <Text style={styles.numeroCard}>FASE {item.numero}</Text>
            <Text style={styles.tituloCard}>{item.titulo}</Text>
            <Text style={styles.descricaoCard}>{item.descricao}</Text>
          </View>
        </View>

        <Text style={styles.setaCard}>{item.bloqueada ? 'X' : '>'}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050a1e" />

      <View style={styles.header}>
        <Text style={styles.appTag}>EXPLORADOR DEV</Text>
        <Text style={styles.appTitle}>Mapa de Fases</Text>
        <Text style={styles.appSub}>Cada fase explora uma biblioteca do Expo SDK 54.</Text>
      </View>

      <FlatList
        data={FASES}
        keyExtractor={(item) => item.id}
        renderItem={renderizarFase}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050a1e',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
  },
  appTag: {
    color: '#f97316',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },
  appTitle: {
    color: '#e2e8f0',
    fontSize: 28,
    fontWeight: '700',
  },
  appSub: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
  lista: {
    padding: 20,
    gap: 14,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardBloqueado: {
    opacity: 0.45,
  },
  cardEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconeFase: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#172554',
    borderWidth: 1,
    borderColor: '#1d4ed8',
  },
  textoIcone: {
    color: '#bfdbfe',
    fontSize: 12,
    fontWeight: '900',
  },
  conteudoCard: {
    flex: 1,
  },
  numeroCard: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  tituloCard: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  descricaoCard: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 17,
    maxWidth: 230,
  },
  setaCard: {
    color: '#3b82f6',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 8,
  },
});
