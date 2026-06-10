/**
 * Level4HapticsCodeScreen.js
 * -------------------------------------------------------
 * Fase 4 — Código de Vibração
 * Biblioteca: expo-haptics
 *
 * O jogador deve pressionar os botões na sequência correta
 * para descobrir o "código secreto" de vibrações.
 * -------------------------------------------------------
 */

import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';

// ─── Sequência correta (código secreto) ──────────────────
// Altere aqui para mudar o desafio da fase
const CORRECT_SEQUENCE = ['leve', 'medio', 'forte'];

// ─── Definição dos botões de vibração ────────────────────
const VIBRATION_BUTTONS = [
  {
    id: 'leve',
    label: 'Leve',
    icon: '💨',
    color: '#38bdf8',
    description: 'Impact Light',
    action: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  },
  {
    id: 'medio',
    label: 'Médio',
    icon: '⚡',
    color: '#818cf8',
    description: 'Impact Medium',
    action: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  },
  {
    id: 'forte',
    label: 'Forte',
    icon: '💥',
    color: '#f97316',
    description: 'Impact Heavy',
    action: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  },
  {
    id: 'sucesso',
    label: 'Sucesso',
    icon: '✅',
    color: '#22c55e',
    description: 'Notification Success',
    action: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  },
  {
    id: 'erro',
    label: 'Erro',
    icon: '❌',
    color: '#ef4444',
    description: 'Notification Error',
    action: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  },
  {
    id: 'aviso',
    label: 'Aviso',
    icon: '⚠️',
    color: '#eab308',
    description: 'Notification Warning',
    action: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  },
  {
    id: 'selecao',
    label: 'Seleção',
    icon: '🔘',
    color: '#a78bfa',
    description: 'Selection',
    action: () => Haptics.selectionAsync(),
  },
];

// ─── Componente Principal ─────────────────────────────────
export default function Level4Haptics({ navigation }) {
  // Sequência que o jogador foi montando
  const [playerSequence, setPlayerSequence] = useState([]);
  const [showCorrectSequence, setShowCorrectSequence] = useState(false);

  // Estado do jogo: 'playing' | 'success' | 'error'
  const [gameState, setGameState] = useState('playing');

  // Último botão pressionado (para highlight visual)
  const [lastPressed, setLastPressed] = useState(null);

  // ── Lida com o toque em um botão ─────────────────────────
  async function handlePress(button) {
    if (gameState === 'success') return;

    // Aciona a vibração do botão
    await button.action();

    // Highlight visual rápido
    setLastPressed(button.id);
    setTimeout(() => setLastPressed(null), 300);

    // Adiciona à sequência do jogador
    const newSequence = [...playerSequence, button.id];
    setPlayerSequence(newSequence);

    if (gameState === 'error') return;

    // Verifica passo a passo se está correto
    const stepIndex = newSequence.length - 1;

    if (newSequence[stepIndex] !== CORRECT_SEQUENCE[stepIndex]) {
      // Passo errado → vibra erro e marca falha
      setGameState('error');
      return;
    }

    // Completou a sequência inteira corretamente
    const isCorrectSequence =
      newSequence.length === CORRECT_SEQUENCE.length &&
      newSequence.every((id, index) => id === CORRECT_SEQUENCE[index]);

    if (isCorrectSequence) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setGameState('success');
    }
  }

  // ── Reinicia a tentativa ──────────────────────────────────
  function handleReset() {
    setPlayerSequence([]);
    setGameState('playing');
    setLastPressed(null);
    setShowCorrectSequence(false);
  }

  // ── Helpers de exibição ───────────────────────────────────
  function getLabelById(id) {
    return VIBRATION_BUTTONS.find((b) => b.id === id)?.label ?? id;
  }

  function getIconById(id) {
    return VIBRATION_BUTTONS.find((b) => b.id === id)?.icon ?? '?';
  }

  // ─── Render ───────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cabeçalho ── */}
        <View style={styles.header}>
          <Text style={styles.badge}>FASE 4</Text>
          <Text style={styles.title}>Código de Vibração</Text>
          <Text style={styles.subtitle}>
            Toque nos botões, sinta as vibrações e descubra o código secreto.
          </Text>
        </View>

        {/* ── Missão ── */}
        <TouchableOpacity
          style={styles.missionBox}
          onPress={() => setShowCorrectSequence(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.missionLabel}>MISSAO</Text>
          <Text style={styles.missionText}>
            {showCorrectSequence ? (
              <>
                Adivinhe a sequencia secreta:{' '}
                {CORRECT_SEQUENCE.map((id, i) => (
                  <Text key={id} style={styles.missionHighlight}>
                    {getLabelById(id)}
                    {i < CORRECT_SEQUENCE.length - 1 ? ' -> ' : ''}
                  </Text>
                ))}
              </>
            ) : (
              'Toque aqui para revelar o codigo secreto.'
            )}
          </Text>
        </TouchableOpacity>

        {/* ── Progresso ── */}
        <View style={styles.progressRow}>
          {CORRECT_SEQUENCE.map((id, i) => {
            const filled = i < playerSequence.length;
            const correct =
              filled && playerSequence[i] === CORRECT_SEQUENCE[i];
            const wrong = filled && !correct;
            return (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  filled && correct && styles.progressDotCorrect,
                  filled && wrong && styles.progressDotWrong,
                ]}
              >
                <Text style={styles.progressDotText}>
                  {filled ? (correct ? '✓' : '✗') : String(i + 1)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ── Sequência do jogador ── */}
        <View style={styles.sequenceBox}>
          <Text style={styles.sequenceLabel}>SUA SEQUÊNCIA</Text>
          <View style={styles.sequenceItems}>
            {playerSequence.length === 0 ? (
              <Text style={styles.sequenceEmpty}>Nenhum botão pressionado ainda…</Text>
            ) : (
              playerSequence.map((id, i) => (
                <View key={i} style={styles.sequenceChip}>
                  <Text style={styles.sequenceChipText}>
                    {getIconById(id)} {getLabelById(id)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* ── Resultado ── */}
        {gameState === 'success' && (
          <View style={[styles.resultBox, styles.resultSuccess]}>
            <Text style={styles.resultEmoji}>🏆</Text>
            <Text style={styles.resultTitle}>Código Desbloqueado!</Text>
            <Text style={styles.resultText}>
              Você descobriu o código secreto de vibração.
            </Text>
          </View>
        )}

        {gameState === 'error' && (
          <View style={[styles.resultBox, styles.resultError]}>
            <Text style={styles.resultEmoji}>💀</Text>
            <Text style={styles.resultTitle}>Sequência Errada!</Text>
            <Text style={styles.resultText}>
              O código não corresponde. Tente novamente.
            </Text>
          </View>
        )}

        {/* ── Botões de vibração ── */}
        <Text style={styles.sectionTitle}>BOTÕES DE VIBRAÇÃO</Text>
        <View style={styles.buttonsGrid}>
          {VIBRATION_BUTTONS.map((button) => {
            const isPressed = lastPressed === button.id;
            const disabled = gameState === 'success';
            return (
              <TouchableOpacity
                key={button.id}
                style={[
                  styles.vibButton,
                  { borderColor: button.color },
                  isPressed && { backgroundColor: button.color + '33' },
                  disabled && styles.vibButtonDisabled,
                ]}
                onPress={() => handlePress(button)}
                activeOpacity={0.7}
                disabled={disabled}
              >
                <Text style={styles.vibButtonIcon}>{button.icon}</Text>
                <Text style={[styles.vibButtonLabel, { color: button.color }]}>
                  {button.label}
                </Text>
                <Text style={styles.vibButtonDesc}>{button.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Botão Reiniciar ── */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Text style={styles.resetButtonText}>🔄  Reiniciar Código</Text>
        </TouchableOpacity>

        {/* ── Botão Voltar ── */}
        {navigation && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050a1e',
  },
  scroll: {
    paddingBottom: 40,
  },

  // Cabeçalho
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  badge: {
    backgroundColor: '#a78bfa',
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
  },
  subtitle: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Missão
  missionBox: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  missionLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  missionText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  missionHighlight: {
    color: '#a78bfa',
    fontWeight: '700',
  },

  // Progresso
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  progressDotCorrect: {
    backgroundColor: '#14532d',
    borderColor: '#22c55e',
  },
  progressDotWrong: {
    backgroundColor: '#450a0a',
    borderColor: '#ef4444',
  },
  progressDotText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },

  // Sequência do jogador
  sequenceBox: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    minHeight: 64,
  },
  sequenceLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  sequenceItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sequenceEmpty: {
    color: '#334155',
    fontSize: 13,
    fontStyle: 'italic',
  },
  sequenceChip: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sequenceChipText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },

  // Resultado
  resultBox: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
  },
  resultSuccess: {
    backgroundColor: '#052e16',
    borderColor: '#16a34a',
  },
  resultError: {
    backgroundColor: '#2d0a0a',
    borderColor: '#dc2626',
  },
  resultEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  resultTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  resultText: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
  },

  // Grid de botões
  sectionTitle: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  vibButton: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  vibButtonDisabled: {
    opacity: 0.35,
  },
  vibButtonIcon: {
    fontSize: 22,
  },
  vibButtonLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  vibButtonDesc: {
    color: '#475569',
    fontSize: 9,
    textAlign: 'center',
  },

  // Botão reiniciar
  resetButton: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  resetButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },

  // Botão voltar
  backButton: {
    marginHorizontal: 20,
    marginBottom: 8,
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
});
