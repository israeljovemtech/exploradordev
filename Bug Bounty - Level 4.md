# Bug Bounty - Level 4

## Visão geral do teste

Este relatório avalia a Fase 4 do app, implementada em `src/screens/Level4Haptics.js` com `expo-haptics`.

A validação foi feita por inspeção de código e pela documentação oficial versionada do Expo SDK 54. Não foi realizado teste físico em aparelhos Android/iOS nem em dispositivo sem motor háptico.

Fonte consultada:

https://docs.expo.dev/versions/v54.0.0/sdk/haptics/

## Cenário 1: pressionar o botão muito rapidamente

### O que acontece

O código atual permite toques rápidos em sequência enquanto `gameState` não for `success`.

Cada toque chama `handlePress(button)`, que executa:

```js
await button.action();
```

As vibrações podem parecer sobrepostas, truncadas, enfileiradas ou ignoradas, dependendo do sistema operacional e do hardware. Além disso, como não há estado de bloqueio durante uma vibração, vários `handlePress` podem rodar muito próximos um do outro.

Também existe risco de inconsistência na sequência do jogador. Em toques muito rápidos, mais de uma chamada pode usar o mesmo valor antigo de `playerSequence`, porque `setPlayerSequence` é assíncrono.

### Causa provável

Não existe debounce, throttle ou flag de processamento como `isHapticsBusy`.

O botão só fica desabilitado quando `gameState === 'success'`. Em estado `playing` ou `error`, novos toques continuam sendo aceitos.

### Motivo técnico

Segundo a documentação do Expo SDK 54, as funções de haptics retornam uma `Promise<void>` que resolve quando a funcionalidade nativa é acionada. Isso não garante que o efeito físico terminou antes do próximo toque.

Na camada React, múltiplos eventos de toque podem disparar antes da UI renderizar o novo estado. Por isso, usar `const newSequence = [...playerSequence, button.id]` pode perder entradas quando os toques são muito rápidos.

### Como resolver

Adicionar controle de entrada durante a vibração:

- criar um estado ou `useRef` chamado `isHapticsBusy`;
- ignorar novos toques enquanto uma vibração estiver sendo processada;
- liberar o botão após um pequeno intervalo, como `150ms` a `300ms`;
- atualizar `playerSequence` com forma funcional para evitar estado antigo.

Exemplo de estratégia:

```js
const isHapticsBusy = useRef(false);

async function handlePress(button) {
  if (gameState === 'success' || isHapticsBusy.current) return;

  isHapticsBusy.current = true;

  try {
    await button.action();
    setPlayerSequence((currentSequence) => {
      const newSequence = [...currentSequence, button.id];
      // Validar sequencia aqui ou chamar uma funcao auxiliar.
      return newSequence;
    });
  } finally {
    setTimeout(() => {
      isHapticsBusy.current = false;
    }, 200);
  }
}
```

## Cenário 2: dispositivo sem motor háptico

### O que acontece

Em um dispositivo sem motor háptico, o comportamento esperado é que o app não crashe, mas a vibração pode simplesmente não acontecer.

No iOS, a documentação informa que o Taptic Engine pode não fazer nada em algumas condições, como:

- modo de pouca energia ativado;
- Taptic Engine desativado nos ajustes;
- câmera do iOS ativa;
- ditado do iOS ativo.

No Android, `expo-haptics` usa serviços de vibração do sistema. A permissão `VIBRATE` é adicionada automaticamente.

### Causa provável

`expo-haptics` abstrai a chamada nativa, mas não garante que todo dispositivo terá hardware háptico real ou que o sistema operacional executará o feedback.

### Motivo técnico

As APIs `impactAsync`, `notificationAsync` e `selectionAsync` retornam `Promise<void>` quando a chamada nativa é acionada. Isso não significa que o usuário necessariamente sentiu uma vibração.

O código atual também não usa `try/catch` ao chamar `button.action()`. Se uma chamada nativa falhar ou rejeitar por alguma condição inesperada, pode ocorrer erro não tratado.

### Como resolver

Tratar falhas silenciosas como parte normal da experiência:

- envolver chamadas hápticas em `try/catch`;
- manter feedback visual independente da vibração;
- mostrar progresso visual mesmo quando o hardware não vibrar;
- evitar depender exclusivamente da sensação háptica para completar a fase;
- considerar uma mensagem discreta se a vibração não puder ser executada.

Exemplo:

```js
async function safeHaptic(action) {
  try {
    await action();
    return true;
  } catch (error) {
    return false;
  }
}
```

Depois, `handlePress` pode continuar atualizando a UI mesmo se `safeHaptic` retornar `false`.

## Cenário 3: comparar impactAsync Heavy no Android vs iOS

### O que acontece

`Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)` não deve ser sentido exatamente igual no Android e no iOS.

No iOS, o `Heavy` é mapeado diretamente para o `UIImpactFeedbackStyle.Heavy`, usando o Taptic Engine quando disponível.

No Android, a documentação informa que `impactAsync` é simulado usando a API de vibração do Android. Portanto, a intensidade e a textura podem variar bastante entre fabricantes, modelos, versões do sistema e qualidade do motor de vibração.

### Causa provável

As plataformas usam mecanismos nativos diferentes.

### Motivo técnico

No iOS, há um motor háptico e estilos de feedback padronizados pelo sistema. No Android, o efeito equivalente pode ser apenas uma simulação via `Vibrator`, com comportamento dependente do aparelho.

Por isso, `Heavy` no Android pode parecer:

- mais longo;
- mais fraco;
- menos preciso;
- mais "vibração comum" do que feedback háptico;
- diferente entre dois aparelhos Android.

No iOS, tende a parecer mais curto, seco e consistente quando o Taptic Engine está ativo.

### Como resolver

Não usar `Heavy` como critério absoluto de intensidade entre plataformas.

Recomendações:

- testar em pelo menos um Android real e um iPhone real;
- ajustar texto da UI para não prometer a mesma sensação em todos os aparelhos;
- para Android, considerar `Haptics.performAndroidHapticsAsync()` quando quiser feedback mais parecido com padrões hápticos do sistema;
- manter fallback visual para cada toque.

Exemplo de abordagem por plataforma:

```js
async function playHeavyFeedback() {
  if (Platform.OS === 'android') {
    return Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Long_Press);
  }

  return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}
```


