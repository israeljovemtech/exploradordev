# Bug Bounty - Level 2

## Visão geral do teste

Este relatório avalia a Fase 2 do app, baseada em `expo-sensors` e no sensor `Accelerometer`.

A validação foi feita por inspeção de código e pela documentação oficial versionada do Expo SDK 54. Não foi realizada simulação física em um dispositivo sem acelerômetro.

Fonte consultada:

https://docs.expo.dev/versions/v54.0.0/sdk/accelerometer/

## Cenário 1: sair e voltar para o app

### O que acontece

No código atual, o listener do acelerômetro é criado no `useEffect` da tela e removido apenas quando o componente desmonta.

Se o usuário sair do app e voltar, a tela provavelmente continuará montada. Nesse caso, o personagem tende a continuar da última posição armazenada em `currentX`.

Dependendo do sistema operacional, o sensor pode continuar ativo, ser pausado temporariamente ou retomar ao voltar. Ao retomar, pode haver um salto de posição se o sensor entregar uma leitura forte imediatamente.

### Causa provável

Não há controle explícito do estado do app, como `AppState`, nem controle de foco da tela, como `useFocusEffect`.

### Motivo técnico

O `Accelerometer.addListener` continua registrado enquanto a tela estiver montada. A limpeza atual com `subscription?.remove()` só acontece no retorno do `useEffect`, normalmente quando a tela desmonta.

### Como resolver

Adicionar controle de ciclo de vida:

- remover ou pausar o listener quando o app sair do estado `active`;
- recriar o listener quando o app voltar para `active`;
- opcionalmente zerar `axisX` ao voltar;
- considerar manter ou recentralizar `currentX`, dependendo da experiência desejada.

## Cenário 2: intervalo de leitura muito baixo com setUpdateInterval

### O que acontece

Com intervalo muito baixo, por exemplo `16ms`, o app pode receber muitas leituras por segundo.

Possíveis efeitos:

- maior uso de CPU;
- maior consumo de bateria;
- excesso de chamadas para `setAxisX`;
- muitas animações `Animated.spring` iniciadas em sequência;
- movimento tremido, atrasado ou com perda de frames;
- comportamento diferente no Android 12 ou superior.

### Causa provável

Frequência de leitura alta demais para o processamento da UI e da thread JavaScript, especialmente quando cada leitura atualiza estado e dispara animação.

### Motivo técnico

`Accelerometer.setUpdateInterval(intervalMs)` define o intervalo desejado entre atualizações do sensor. A documentação do Expo SDK 54 informa que, a partir do Android 12 (API 31), o sistema aplica limite de 200ms para atualizações de sensores, a menos que o app declare permissão de alta frequência.

### Como resolver

Manter um intervalo moderado, como `50ms` ou `100ms`, para equilibrar fluidez e custo.

Se for necessário usar intervalo menor que `200ms` no Android 12 ou superior, adicionar a permissão abaixo no `app.json`:

```json
{
  "expo": {
    "android": {
      "permissions": ["android.permission.HIGH_SAMPLING_RATE_SENSORS"]
    }
  }
}
```

Também é recomendado:

- reduzir atualizações visuais desnecessarias;
- evitar atualizar texto de debug em toda leitura;
- aplicar uma zona morta para ignorar microvariações;
- suavizar o movimento com filtro ou interpolação.

## Cenário 3: dispositivo sem acelerômetro

### O que acontece

O código chama `Accelerometer.isAvailableAsync()` antes de registrar o listener.

Se esse método retornar `false`, o app não deve crashar. A tela renderiza uma mensagem informando que o sensor não foi encontrado.

### Causa provável

O app já tem uma verificacao básica de disponibilidade do sensor antes de usar `Accelerometer.addListener`.

### Motivo técnico

Segundo a documentação do Expo SDK 54, `isAvailableAsync()` retorna uma `Promise<boolean>` indicando se o acelerômetro está disponível. A própria documentação recomenda verificar a disponibilidade antes de tentar usar o sensor.

### Risco atual

Embora o fluxo trate o retorno `false`, ele não envolve `isAvailableAsync()` e `addListener()` em `try/catch`.

Se a chamada rejeitar por algum erro inesperado de ambiente, permissão, plataforma ou runtime, pode ocorrer erro não tratado.

### Como resolver

Adicionar tratamento de erro ao iniciar o sensor:

```js
async function startSensor() {
  try {
    const available = await Accelerometer.isAvailableAsync();

    if (!available) {
      setSensorAvailable(false);
      return;
    }

    Accelerometer.setUpdateInterval(SENSOR_INTERVAL_MS);
    subscription = Accelerometer.addListener(handleAccelerometerUpdate);
  } catch (error) {
    setSensorAvailable(false);
  }
}
```

Para web, considerar também o fluxo de permissões com `requestPermissionsAsync()` quando aplicável.

## Recomendações de correção

1. Corrigir a rota da Fase 2 em `App.js` para usar `Level2ExpoSensors`.
2. Adicionar controle de `AppState` ou foco da tela para pausar e retomar o listener do acelerômetro.
3. Manter `SENSOR_INTERVAL_MS` em um valor seguro, como `50ms` ou `100ms`.
4. Adicionar `try/catch` ao fluxo de inicialização do sensor.
5. Se a leitura em alta frequência for realmente necessária no Android 12+, adicionar `android.permission.HIGH_SAMPLING_RATE_SENSORS`.
6. Testar em aparelho físico Android é, se possível, em ambiente sem acelerômetro para confirmar o comportamento da tela de fallback.


