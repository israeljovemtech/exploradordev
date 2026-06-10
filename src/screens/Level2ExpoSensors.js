/**
 * Level2MotionExplorerScreen.js
 * -------------------------------------------------------
 * Fase 2 — Explorador em Movimento
 * Biblioteca: expo-sensors (Accelerometer)
 *
 * O personagem se move horizontalmente de acordo com a
 * inclinação lateral do celular (eixo X do acelerômetro).
 * -------------------------------------------------------
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Accelerometer } from 'expo-sensors';

// ─── Constantes ───────────────────────────────────────────
/** Largura do sprite do personagem em px */
const CHARACTER_SIZE = 80;

/** Metade do sprite — usado para centralizar e calcular limites */
/** Margem de segurança nas bordas da tela */
const EDGE_PADDING = 10;

/** Posição X mínima permitida (borda esquerda) */
/** Posição X máxima permitida (borda direita, descontando o sprite) */
const getMaxX = (screenWidth) => Math.max(EDGE_PADDING, screenWidth - CHARACTER_SIZE - EDGE_PADDING);

/** Posição X inicial (centro da tela) */
const getInitialX = (screenWidth) => {
  const maxX = getMaxX(screenWidth);
  const centeredX = (screenWidth - CHARACTER_SIZE) / 2;

  return Math.min(maxX, Math.max(EDGE_PADDING, centeredX));
};

/** Intervalo de atualização do sensor em ms (menor = mais fluido) */
const SENSOR_INTERVAL_MS = 50;

/**
 * Sensibilidade: multiplica o valor bruto do eixo X.
 * Aumente para movimento mais rápido; diminua para mais suave.
 */
const SENSITIVITY = 12;

// ─── Componente Principal ─────────────────────────────────
export default function Level2MotionExplorerScreen({ navigation }) {
  const { width: screenWidth } = useWindowDimensions();
  const minX = EDGE_PADDING;
  const maxX = getMaxX(screenWidth);
  const initialX = getInitialX(screenWidth);

  // Valor Animated para a posição X do personagem
  const posX = useRef(new Animated.Value(initialX)).current;

  // Armazena a posição X atual como número (fora do Animated) para os cálculos
  const currentX = useRef(initialX);

  // MantÃ©m os limites atuais disponÃ­veis para o listener do sensor
  const limitsRef = useRef({ minX, maxX });

  // Valor bruto do eixo X exibido na tela (para debug/UX)
  const [axisX, setAxisX] = useState(0);

  // Se o sensor está disponível no dispositivo
  const [sensorAvailable, setSensorAvailable] = useState(true);

  useEffect(() => {
    limitsRef.current = { minX, maxX };

    const boundedX = Math.min(maxX, Math.max(minX, currentX.current));
    currentX.current = boundedX;
    posX.setValue(boundedX);
  }, [maxX, minX, posX]);

  // ── Configuração do acelerômetro ──────────────────────────
  useEffect(() => {
    let subscription;

    async function startSensor() {
      // Verifica disponibilidade do sensor
      const available = await Accelerometer.isAvailableAsync();
      if (!available) {
        setSensorAvailable(false);
        return;
      }

      // Define o intervalo de atualização
      Accelerometer.setUpdateInterval(SENSOR_INTERVAL_MS);

      // Inscreve no listener do acelerômetro
      subscription = Accelerometer.addListener(({ x }) => {
        // Atualiza o indicador visual do eixo X
        setAxisX(parseFloat(x.toFixed(3)));

        // Calcula o deslocamento baseado na inclinação
        // No iOS/Android, inclinar para a direita = x negativo
        // Invertemos o sinal para que a direita → movimento para direita
        const delta = x * SENSITIVITY;
        const { minX: currentMinX, maxX: currentMaxX } = limitsRef.current;

        // Nova posição X, limitada entre MIN_X e MAX_X
        const newX = Math.min(currentMaxX, Math.max(currentMinX, currentX.current + delta));

        // Atualiza a referência numérica
        currentX.current = newX;

        // Anima o sprite suavemente para a nova posição
        Animated.spring(posX, {
          toValue: newX,
          speed: 20,
          bounciness: 0,
          useNativeDriver: true,
        }).start();
      });
    }

    startSensor();

    // Limpeza: cancela o listener ao sair da tela
    return () => {
      subscription?.remove();
    };
  }, []);

  // ── Render: sensor indisponível ───────────────────────────
  if (!sensorAvailable) {
    return (
      <View style={styles.unavailableContainer}>
        <Text style={styles.unavailableEmoji}>📡</Text>
        <Text style={styles.unavailableTitle}>Sensor não encontrado</Text>
        <Text style={styles.unavailableText}>
          Este dispositivo não possui acelerômetro disponível.{'\n'}
          Tente em um celular físico com sensores ativos.
        </Text>
        {navigation && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── Render principal ──────────────────────────────────────
  return (
    <ImageBackground
      // Fundo temático — troque por um asset local se preferir:
      // source={require('../../assets/bg_space.png')}
      source={require('../../assets/bg_level2.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Overlay escuro para melhorar legibilidade */}
      <View style={styles.overlay} />

      {/* ── Cabeçalho ── */}
      <View style={styles.header}>
        <Text style={styles.badge}>FASE 2</Text>
        <Text style={styles.title2}>Explorador em Movimento</Text>
        <Text style={styles.subtitle}>Incline o celular para mover o explorador.</Text>
      </View>

      {/* ── Área de jogo ── */}
      <View style={styles.gameArea}>
        {/* Chão decorativo */}
        <View style={styles.ground} />

        {/* Personagem animado */}
        <Animated.Image
          source={require('../../assets/explorer.png')}
          style={[
            styles.character,
            {
              // translateX move o personagem horizontalmente
              // (posX já contém a posição absoluta; ajustamos com translateX a partir do centro)
              transform: [
                {
                  translateX: posX,
                },
              ],
              // Resetamos left para 0 pois usamos translateX para posicionar
              left: 0,
            },
          ]}
          resizeMode="contain"
        />
      </View>

      {/* ── Painel de dados do sensor ── */}
      <View style={styles.sensorPanel}>
        <Text style={styles.sensorLabel}>EIXO X DO ACELERÔMETRO</Text>
        <View style={styles.sensorBarTrack}>
          <View
            style={[
              styles.sensorBarFill,
              {
                // Mapeia -1..1 para 0..100% da barra
                width: `${Math.min(100, Math.max(0, (axisX + 1) * 50))}%`,
                backgroundColor: axisX < 0 ? '#60a5fa' : '#f97316',
              },
            ]}
          />
        </View>
        <Text style={styles.sensorValue}>
          {axisX > 0 ? '← ' : axisX < 0 ? ' →' : '  '}
          {'  '}x = {axisX.toFixed(3)}
          {'  '}
          {axisX > 0 ? ' ←' : axisX < 0 ? '→ ' : '  '}
        </Text>
      </View>

      {/* ── Dica de controle ── */}
      <View style={styles.hintRow}>
        <Text style={styles.hintText}>⬅️  Incline para se mover  ➡️</Text>
      </View>

      {/* ── Botão voltar ── */}
      {navigation && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
      )}
    </ImageBackground>
  );
}

// ─── Estilos ──────────────────────────────────────────────
const styles = StyleSheet.create({
  // Layout base
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 30, 0.72)',
  },

  // Cabeçalho
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  badge: {
    backgroundColor: '#f97316',
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  title: {
    color: '#e2e8f0',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  title2: {
    color: '#000000',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  subtitle: {
    color: '#f97316',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },

  // Área de jogo
  gameArea: {
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  ground: {
    height: 6,
    backgroundColor: '#334155',
    borderTopWidth: 1,
    borderTopColor: '#475569',
  },
  character: {
    position: 'absolute',
    bottom: 8, // senta em cima do chão
    width: CHARACTER_SIZE,
    height: CHARACTER_SIZE,
    // left e transform são definidos inline acima
  },

  // Painel do sensor
  sensorPanel: {
    marginHorizontal: 24,
    marginBottom: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e3a5f',
  },
  sensorLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  sensorBarTrack: {
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  sensorBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  sensorValue: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },

  // Dica
  hintRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  hintText: {
    color: '#f97316',
    fontSize: 12,
  },

  // Botão voltar
  backButton: {
    marginHorizontal: 24,
    marginBottom: Platform.OS === 'android' ? 24 : 32,
    backgroundColor: 'rgba(30, 58, 95, 0.9)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1d4ed8',
  },
  backButtonText: {
    color: '#93c5fd',
    fontSize: 14,
    fontWeight: '600',
  },

  // Tela de sensor indisponível
  unavailableContainer: {
    flex: 1,
    backgroundColor: '#050a1e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  unavailableEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  unavailableTitle: {
    color: '#e2e8f0',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  unavailableText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
});
