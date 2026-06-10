# Bug Bounty - Level 2

## Visao geral do teste

Este relatorio avalia a Fase 2 do app, baseada em `expo-sensors` e no sensor `Acelerometro`.

A validacao foi feita por inspecao de codigo e pela documentacao oficial versionada do Expo SDK 54. Nao foi realizada simulacao fisica em um dispositivo sem acelerometro.

Fonte consultada:

https://docs.expo.dev/versions/v54.0.0/sdk/accelerometer/

## Cenario 1: sair e voltar para o app

### O que acontece

No codigo atual, o listener do acelerometro e criado no `useEffect` da tela e removido apenas quando o componente desmonta.

Se o usuario sair do app e voltar, a tela provavelmente continuara montada. Nesse caso, o personagem tende a continuar da ultima posicao armazenada em `currentX`.

Dependendo do sistema operacional, o sensor pode continuar ativo, ser pausado temporariamente ou retomar ao voltar. Ao retomar, pode haver um salto de posicao se o sensor entregar uma leitura forte imediatamente.

### Causa provavel

Nao ha controle explicito do estado do app, como `AppState`, nem controle de foco da tela, como `useFocusEffect`.

### Motivo tecnico

O `Accelerometer.addListener` continua registrado enquanto a tela estiver montada. A limpeza atual com `subscription?.remove()` so acontece no retorno do `useEffect`, normalmente quando a tela desmonta.

### Como resolver

Adicionar controle de ciclo de vida:

- remover ou pausar o listener quando o app sair do estado `active`;
- recriar o listener quando o app voltar para `active`;
- opcionalmente zerar `axisX` ao voltar;
- considerar manter ou recentralizar `currentX`, dependendo da experiencia desejada.

## Cenario 2: intervalo de leitura muito baixo com setUpdateInterval

### O que acontece

Com intervalo muito baixo, por exemplo `16ms`, o app pode receber muitas leituras por segundo.

Possiveis efeitos:

- maior uso de CPU;
- maior consumo de bateria;
- excesso de chamadas para `setAxisX`;
- muitas animacoes `Animated.spring` iniciadas em sequencia;
- movimento tremido, atrasado ou com perda de frames;
- comportamento diferente no Android 12 ou superior.

### Causa provavel

Frequencia de leitura alta demais para o processamento da UI e da thread JavaScript, especialmente quando cada leitura atualiza estado e dispara animacao.

### Motivo tecnico

`Accelerometer.setUpdateInterval(intervalMs)` define o intervalo desejado entre atualizacoes do sensor. A documentacao do Expo SDK 54 informa que, a partir do Android 12 (API 31), o sistema aplica limite de 200ms para atualizacoes de sensores, a menos que o app declare permissao de alta frequencia.

### Como resolver

Manter um intervalo moderado, como `50ms` ou `100ms`, para equilibrar fluidez e custo.

Se for necessario usar intervalo menor que `200ms` no Android 12 ou superior, adicionar a permissao abaixo no `app.json`:

```json
{
  "expo": {
    "android": {
      "permissions": ["android.permission.HIGH_SAMPLING_RATE_SENSORS"]
    }
  }
}
```

Tambem e recomendado:

- reduzir atualizacoes visuais desnecessarias;
- evitar atualizar texto de debug em toda leitura;
- aplicar uma zona morta para ignorar microvariacoes;
- suavizar o movimento com filtro ou interpolacao.

## Cenario 3: dispositivo sem acelerometro

### O que acontece

O codigo chama `Accelerometer.isAvailableAsync()` antes de registrar o listener.

Se esse metodo retornar `false`, o app nao deve crashar. A tela renderiza uma mensagem informando que o sensor nao foi encontrado.

### Causa provavel

O app ja tem uma verificacao basica de disponibilidade do sensor antes de usar `Accelerometer.addListener`.

### Motivo tecnico

Segundo a documentacao do Expo SDK 54, `isAvailableAsync()` retorna uma `Promise<boolean>` indicando se o acelerometro esta disponivel. A propria documentacao recomenda verificar a disponibilidade antes de tentar usar o sensor.

### Risco atual

Embora o fluxo trate o retorno `false`, ele nao envolve `isAvailableAsync()` e `addListener()` em `try/catch`.

Se a chamada rejeitar por algum erro inesperado de ambiente, permissao, plataforma ou runtime, pode ocorrer erro nao tratado.

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

Para web, considerar tambem o fluxo de permissoes com `requestPermissionsAsync()` quando aplicavel.

## Recomendacoes de correcao

1. Corrigir a rota da Fase 2 em `App.js` para usar `Level2ExpoSensors`.
2. Adicionar controle de `AppState` ou foco da tela para pausar e retomar o listener do acelerometro.
3. Manter `SENSOR_INTERVAL_MS` em um valor seguro, como `50ms` ou `100ms`.
4. Adicionar `try/catch` ao fluxo de inicializacao do sensor.
5. Se a leitura em alta frequencia for realmente necessaria no Android 12+, adicionar `android.permission.HIGH_SAMPLING_RATE_SENSORS`.
6. Testar em aparelho fisico Android e, se possivel, em ambiente sem acelerometro para confirmar o comportamento da tela de fallback.
