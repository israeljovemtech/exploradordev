# Bug Bounty - Level 4

## Visao geral do teste

Este relatorio avalia a Fase 4 do app, implementada em `src/screens/Level4Haptics.js` com `expo-haptics`.

A validacao foi feita por inspecao de codigo e pela documentacao oficial versionada do Expo SDK 54. Nao foi realizado teste fisico em aparelhos Android/iOS nem em dispositivo sem motor haptico.

Fonte consultada:

https://docs.expo.dev/versions/v54.0.0/sdk/haptics/

## Cenario 1: pressionar o botao muito rapidamente

### O que acontece

O codigo atual permite toques rapidos em sequencia enquanto `gameState` nao for `success`.

Cada toque chama `handlePress(button)`, que executa:

```js
await button.action();
```

As vibracoes podem parecer sobrepostas, truncadas, enfileiradas ou ignoradas, dependendo do sistema operacional e do hardware. Alem disso, como nao ha estado de bloqueio durante uma vibracao, varios `handlePress` podem rodar muito proximos um do outro.

Tambem existe risco de inconsistencia na sequencia do jogador. Em toques muito rapidos, mais de uma chamada pode usar o mesmo valor antigo de `playerSequence`, porque `setPlayerSequence` e assincrono.

### Causa provavel

Nao existe debounce, throttle ou flag de processamento como `isHapticsBusy`.

O botao so fica desabilitado quando `gameState === 'success'`. Em estado `playing` ou `error`, novos toques continuam sendo aceitos.

### Motivo tecnico

Segundo a documentacao do Expo SDK 54, as funcoes de haptics retornam uma `Promise<void>` que resolve quando a funcionalidade nativa e acionada. Isso nao garante que o efeito fisico terminou antes do proximo toque.

Na camada React, multiplos eventos de toque podem disparar antes da UI renderizar o novo estado. Por isso, usar `const newSequence = [...playerSequence, button.id]` pode perder entradas quando os toques sao muito rapidos.

### Como resolver

Adicionar controle de entrada durante a vibracao:

- criar um estado ou `useRef` chamado `isHapticsBusy`;
- ignorar novos toques enquanto uma vibracao estiver sendo processada;
- liberar o botao apos um pequeno intervalo, como `150ms` a `300ms`;
- atualizar `playerSequence` com forma funcional para evitar estado antigo.

Exemplo de estrategia:

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

## Cenario 2: dispositivo sem motor haptico

### O que acontece

Em um dispositivo sem motor haptico, o comportamento esperado e que o app nao crashe, mas a vibracao pode simplesmente nao acontecer.

No iOS, a documentacao informa que o Taptic Engine pode nao fazer nada em algumas condicoes, como:

- modo de pouca energia ativado;
- Taptic Engine desativado nos ajustes;
- camera do iOS ativa;
- ditado do iOS ativo.

Na web, a vibracao depende de suporte do navegador, hardware de vibracao e permissao/contexto do usuario.

No Android, `expo-haptics` usa servicos de vibracao do sistema. A permissao `VIBRATE` e adicionada automaticamente.

### Causa provavel

`expo-haptics` abstrai a chamada nativa, mas nao garante que todo dispositivo tera hardware haptico real ou que o sistema operacional executara o feedback.

### Motivo tecnico

As APIs `impactAsync`, `notificationAsync` e `selectionAsync` retornam `Promise<void>` quando a chamada nativa e acionada. Isso nao significa que o usuario necessariamente sentiu uma vibracao.

O codigo atual tambem nao usa `try/catch` ao chamar `button.action()`. Se uma chamada nativa falhar ou rejeitar por alguma condicao inesperada, pode ocorrer erro nao tratado.

### Como resolver

Tratar falhas silenciosas como parte normal da experiencia:

- envolver chamadas hapticas em `try/catch`;
- manter feedback visual independente da vibracao;
- mostrar progresso visual mesmo quando o hardware nao vibrar;
- evitar depender exclusivamente da sensacao haptica para completar a fase;
- considerar uma mensagem discreta se a vibracao nao puder ser executada.

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

## Cenario 3: comparar impactAsync Heavy no Android vs iOS

### O que acontece

`Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)` nao deve ser sentido exatamente igual no Android e no iOS.

No iOS, o `Heavy` e mapeado diretamente para o `UIImpactFeedbackStyle.Heavy`, usando o Taptic Engine quando disponivel.

No Android, a documentacao informa que `impactAsync` e simulado usando a API de vibracao do Android. Portanto, a intensidade e a textura podem variar bastante entre fabricantes, modelos, versoes do sistema e qualidade do motor de vibracao.

### Causa provavel

As plataformas usam mecanismos nativos diferentes.

### Motivo tecnico

No iOS, ha um motor haptico e estilos de feedback padronizados pelo sistema. No Android, o efeito equivalente pode ser apenas uma simulacao via `Vibrator`, com comportamento dependente do aparelho.

Por isso, `Heavy` no Android pode parecer:

- mais longo;
- mais fraco;
- menos preciso;
- mais "vibracao comum" do que feedback haptico;
- diferente entre dois aparelhos Android.

No iOS, tende a parecer mais curto, seco e consistente quando o Taptic Engine esta ativo.

### Como resolver

Nao usar `Heavy` como criterio absoluto de intensidade entre plataformas.

Recomendacoes:

- testar em pelo menos um Android real e um iPhone real;
- ajustar texto da UI para nao prometer a mesma sensacao em todos os aparelhos;
- para Android, considerar `Haptics.performAndroidHapticsAsync()` quando quiser feedback mais parecido com padroes hapticos do sistema;
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

## Recomendacoes gerais de correcao

1. Adicionar debounce/throttle para impedir spam de toques.
2. Usar `useRef` para bloquear chamadas hapticas concorrentes.
3. Atualizar `playerSequence` com callback funcional para evitar estado antigo em toques rapidos.
4. Envolver chamadas hapticas em `try/catch`.
5. Garantir feedback visual para todos os botoes, mesmo sem vibracao.
6. Tratar Android e iOS como experiencias hapticas equivalentes em intencao, mas nao identicas em intensidade.
7. Testar em hardware real, especialmente para comparar `ImpactFeedbackStyle.Heavy`.

## Resultado esperado apos correcoes

- Toques muito rapidos nao devem quebrar a sequencia.
- Vibracoes nao devem acumular chamadas concorrentes sem controle.
- Dispositivos sem motor haptico devem continuar navegaveis e jogaveis.
- Android e iOS devem oferecer feedback coerente, mesmo que a sensacao fisica seja diferente.
