# BUG BOUNTY - EXPO SENSORS

## Visão geral

Este relatório documenta o comportamento divergente do movimento horizontal na Fase 2 do projeto ExploradorDEV, implementada com `expo-sensors` e `Accelerometer`.

Problema observado:

- No iOS, ao inclinar o aparelho, o personagem se move para o lado visual esperado.
- No Android, usando o mesmo cálculo, o personagem se move para o lado invertido.

A análise foi feita a partir do arquivo `src/screens/Level2ExpoSensors.js`, da documentação oficial do Expo SDK 54 e da documentação oficial do Android sobre sistema de coordenadas de sensores.

## Arquivo afetado

Arquivo:

```text
src/screens/Level2ExpoSensors.js
```

Biblioteca usada:

```js
import { Accelerometer } from 'expo-sensors';
```

Versões relevantes do projeto:

```json
{
  "expo": "~54.0.34",
  "expo-sensors": "~15.0.8",
  "react-native": "0.81.5"
}
```

## Comportamento observado

Na Fase 2, o personagem é movido horizontalmente com base no eixo `x` do acelerômetro.

O comportamento esperado é:

- inclinar para a direita: personagem anda para a direita;
- inclinar para a esquerda: personagem anda para a esquerda.

O comportamento real observado é:

- iOS: comportamento visual correto;
- Android: comportamento visual invertido.

## Evidência no código

O listener atual usa diretamente o valor `x` retornado pelo acelerômetro:

```js
subscription = Accelerometer.addListener(({ x }) => {
  setAxisX(parseFloat(x.toFixed(3)));

  const delta = x * SENSITIVITY;
  const { minX: currentMinX, maxX: currentMaxX } = limitsRef.current;

  const newX = Math.min(currentMaxX, Math.max(currentMinX, currentX.current + delta));

  currentX.current = newX;

  Animated.spring(posX, {
    toValue: newX,
    speed: 20,
    bounciness: 0,
    useNativeDriver: true,
  }).start();
});
```

Ponto crítico:

```js
const delta = x * SENSITIVITY;
```

Esse cálculo assume que o sinal de `x` tem o mesmo significado visual no iOS e no Android. Na prática, para esta experiência de jogo, essa premissa não se confirma.

## Causa provável

`expo-sensors` entrega os valores do acelerômetro como medições de sensor (`x`, `y`, `z`), mas não transforma automaticamente esses valores em comandos de interface como "andar para a direita" ou "andar para a esquerda".

Ou seja: o valor `x` representa uma leitura física do eixo X do dispositivo. A direção visual do personagem na tela é uma regra da aplicação, não uma garantia da API.

No iOS, o sinal atual de `x` está coincidindo com a expectativa da UI. No Android, para esta tela, o mesmo sinal precisa ser invertido para que a intenção visual seja preservada.

## Motivo técnico

Segundo a documentação do Expo SDK 54, `Accelerometer` fornece acesso ao acelerômetro do dispositivo e entrega medições em três dimensões. O tipo `AccelerometerMeasurement` possui as propriedades `x`, `y` e `z`, cada uma representando a aceleração reportada naquele eixo.

A documentação não afirma que `x > 0` sempre significa "mover elemento da UI para a direita" em todas as plataformas. Ela apenas expõe o valor reportado pelo sensor.

No Android, o sistema de coordenadas dos sensores é definido em relação à orientação natural do dispositivo. A documentação Android informa que, de forma geral, o eixo X é horizontal e aponta para a direita quando o dispositivo está em sua orientação padrão. Esse sistema é sobre o dispositivo/sensor, não sobre a regra de gameplay.

Como resultado, a aplicação precisa mapear explícitamente a leitura física para a intenção visual:

```text
leitura do sensor -> normalizacao por plataforma/orientacao -> movimento na tela
```

Hoje o app pula a etapa de normalização.

## Impacto no usuário

No Android, o controle fica contraintuitivo:

- o usuário inclina para um lado;
- o personagem responde para o lado oposto;
- a fase parece quebrada ou mal calibrada;
- a experiência fica diferente entre iOS e Android.

Esse problema afeta diretamente jogabilidade, acessibilidade e confiança do usuário no app.

## Como resolver

A solução é inserir uma camada de normalização entre o valor bruto do sensor e o deslocamento do personagem.

Como o comportamento correto já foi observado no iOS e o problema ocorre no Android, a correção mais direta é aplicar um multiplicador específico por plataforma.

## Solução realizada

Usar `Platform.OS` para inverter somente o Android:

```js
const directionMultiplier = Platform.OS === 'android' ? -1 : 1;
const delta = x * directionMultiplier * SENSITIVITY;
```

Aplicado no contexto do listener:

```js
subscription = Accelerometer.addListener(({ x }) => {
  setAxisX(parseFloat(x.toFixed(3)));

  const directionMultiplier = Platform.OS === 'android' ? -1 : 1;
  const delta = x * directionMultiplier * SENSITIVITY;
  const { minX: currentMinX, maxX: currentMaxX } = limitsRef.current;

  const newX = Math.min(currentMaxX, Math.max(currentMinX, currentX.current + delta));

  currentX.current = newX;

  Animated.spring(posX, {
    toValue: newX,
    speed: 20,
    bounciness: 0,
    useNativeDriver: true,
  }).start();
});
```

Vantagens:

- mantem o comportamento atual do iOS;
- corrige o Android sem alterár a sensibilidade;
- deixa a decisão explícita no código;
- reduz risco de regressão em outras partes da tela.

lista testes e evita espalhar regra de plataforma dentro do listener.

## Plano de teste

### iPhone físico

1. Abrir a Fase 2.
2. Inclinar o aparelho para a direita.
3. Confirmar que o personagem vai para a direita.
4. Inclinar o aparelho para a esquerda.
5. Confirmar que o personagem vai para a esquerda.
6. Verificar se o comportamento não mudou após aplicar o multiplicador.

### Android físico

1. Abrir a Fase 2.
2. Inclinar o aparelho para a direita.
3. Confirmar que o personagem vai para a direita.
4. Inclinar o aparelho para a esquerda.
5. Confirmar que o personagem vai para a esquerda.
6. Confirmar que o Android deixou de ficar invertido.

### Validações realizadas

- Confirmar que os limites laterais continuam funcionando.
- Confirmar que `axisX` continua mostrando o valor bruto do sensor.
- Confirmar que apenas o cálculo do movimento foi normalizado.
- Testar com o aparelho em posição neutra para verificar se não há movimento excessivo.
- Testar novamente após sair e voltar para a tela.

## Fontes consultadas

- Expo SDK 54 - Accelerometer: https://docs.expo.dev/versions/v54.0.0/sdk/accelerometer/
- Expo SDK 54 - Sensors: https://docs.expo.dev/versions/v54.0.0/sdk/sensors/
- Android Developers - Sensors overview: https://developer.android.com/develop/sensors-and-location/sensors/sensors_overview

## Conclusão

O bug não está necessariamente no `expo-sensors`; ele está no mapeamento direto entre leitura física do acelerômetro e movimento visual do personagem.

Para esta fase, como o iOS já apresenta o comportamento esperado e o Android está invertido, a solução recomendada é normalizar o delta por plataforma:

```js
const directionMultiplier = Platform.OS === 'android' ? -1 : 1;
const delta = x * directionMultiplier * SENSITIVITY;
```

Essa correção documenta explícitamente a diferença de plataforma e transforma a leitura bruta do sensor em um comando de movimento consistente para o usuário.


