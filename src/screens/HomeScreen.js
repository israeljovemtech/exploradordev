/**
 * HomeScreen.js — ExploradorDev
 * -------------------------------------------------------
 * Tela inicial do jogo. Exibe os cards de cada fase.
 * Clique em uma fase para navegar até ela.
 * -------------------------------------------------------
 */

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

// ── Dados das fases ────────────────────────────────────────
const LEVELS = [
  {
    id: '1',
    number: '01',
    title: 'Fase 1',
    description: 'Em breve…',
    route: null, // ainda não implementada
    icon: '🗺️',
    locked: true,
  },
  {
    id: '2',
    number: '02',
    title: 'Explorador em Movimento',
    description: 'Incline o celular e guie o explorador pelo mapa.',
    route: 'Level2',
    icon: '🚀',
    locked: false,
  },
  // Adicione fases futuras aqui
];

// ── Componente ─────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  function handleLevelPress(level) {
    if (level.locked || !level.route) return;
    navigation.navigate(level.route);
  }

  function renderLevel({ item }) {
    return (
      <TouchableOpacity
        style={[styles.card, item.locked && styles.cardLocked]}
        onPress={() => handleLevelPress(item)}
        activeOpacity={item.locked ? 1 : 0.75}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.cardIcon}>{item.icon}</Text>
          <View>
            <Text style={styles.cardNumber}>FASE {item.number}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </View>
        </View>

        {item.locked ? (
          <Text style={styles.lockIcon}>🔒</Text>
        ) : (
          <Text style={styles.arrowIcon}>▶</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050a1e" />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.appTag}>EXPLORADOR DEV</Text>
        <Text style={styles.appTitle}>Mapa de Fases</Text>
        <Text style={styles.appSub}>Cada fase explora uma biblioteca do Expo.</Text>
      </View>

      {/* Lista de fases */}
      <FlatList
        data={LEVELS}
        keyExtractor={(item) => item.id}
        renderItem={renderLevel}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// ── Estilos ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050a1e',
  },

  // Cabeçalho
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
    color: '#475569',
    fontSize: 13,
    marginTop: 4,
  },

  // Lista
  list: {
    padding: 20,
    gap: 14,
  },

  // Card de fase
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
  cardLocked: {
    opacity: 0.45,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 4,
  },
  cardNumber: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  cardTitle: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  cardDesc: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 17,
    maxWidth: 220,
  },
  arrowIcon: {
    color: '#3b82f6',
    fontSize: 16,
    marginLeft: 8,
  },
  lockIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
});
