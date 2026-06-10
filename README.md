# ExploradorDEV

ExploradorDEV é um aplicativo mobile gamificado criado com React Native e Expo SDK 54. O projeto apresenta um mapa de fases em que cada etapa explora uma API nativa do ecossistema Expo, como câmera, sensores, notificações locais e feedback háptico.

O objetivo é servir como base de estudo e demonstração prática para recursos nativos em apps React Native.

## Funcionalidades

### Fase 1 - Fotógrafo Explorador

Tela: `src/screens/Fase1CâmeraScreen.js`

Biblioteca: `expo-camera`

Permite solicitar permissão de câmera, abrir o preview ao vivo, capturar uma foto e exibir a prévia da imagem capturada com seu URI local.

### Fase 2 - Explorador em Movimento

Tela: `src/screens/Level2ExpoSensors.js`

Biblioteca: `expo-sensors`

Usa o acelerômetro para mover um personagem horizontalmente conforme a inclinação do aparelho. A tela também exibe dados do eixo X e trata o caso em que o acelerômetro não está disponível.

### Fase 3 - Mensagem Secreta

Tela: `src/screens/Fase3NotificacaoScreen.js`

Biblioteca: `expo-notifications`

Solicita permissão de notificações, cria canal de notificação no Android, agenda uma notificação local e conclui a missão quando o usuário toca na notificação.

### Fase 4 - Código de Vibração

Tela: `src/screens/Level4Haptics.js`

Biblioteca: `expo-haptics`

Apresenta botões com diferentes tipos de feedback háptico e desafia o usuário a reproduzir uma sequência correta de vibrações.

## Stack

- React `19.1.0`
- React Native `0.81.5`
- Expo `~54.0.34`
- React Navigation Native Stack
- Expo Câmera
- Expo Sensors
- Expo Notifications
- Expo Haptics
- Expo Status Bar
- Expo Splash Screen

## Pré-requisitos

Antes de executar o projeto, tenha instalado:

- Node.js
- npm
- Expo via `npx expo`
- Expo Go no dispositivo físico, ou um emulador/simulador configurado

Para testar câmera, acelerômetro, notificações e haptics com maior fidelidade, use um dispositivo físico.

## Instalação

Clone o projeto e instale as dependências:

```bash
npm install
```

## Como executar

Inicie o servidor de desenvolvimento:

```bash
npm start
```

Executar diretamente no Android:

```bash
npm run android
```

Executar diretamente no iOS:

```bash
npm run ios
```

Executar no navegador:

```bash
npm run web
```

## Scripts disponíveis

| Script | Descrição |
| --- | --- |
| `npm start` | Inicia o Expo Dev Server. |
| `npm run android` | Abre o app no Android via Expo. |
| `npm run ios` | Abre o app no iOS via Expo. |
| `npm run web` | Abre o app na versão web. |

## Rotas

As rotas são configuradas em `App.js` com `@react-navigation/native-stack`.

| Rota | Componente | Descrição |
| --- | --- | --- |
| `Home` | `HomeScreen` | Mapa inicial com os cards das fases. |
| `Fase1` | `Fase1CâmeraScreen` | Fase de captura com câmera. |
| `Level2` | `Level2ExpoSensors` | Fase de movimento com acelerômetro. |
| `Fase3` | `Fase3NotificacaoScreen` | Fase de notificação local. |
| `Level4` | `Level4Haptics` | Fase de feedback háptico. |

## Estrutura do projeto

```text
.
|-- App.js
|-- package.json
|-- README.md
|-- assets/
|-- src/
|   `-- screens/
|       |-- HomeScreen.js
|       |-- Fase1CameraScreen.js
|       |-- Level2ExpoSensors.js
|       |-- Fase3NotificacaoScreen.js
|       `-- Level4Haptics.js
|-- Bug Bounty - Level 2.md
`-- Bug Bounty - Level 4.md
```

## Permissões e recursos nativos

### Câmera

A Fase 1 usa `expo-camera` e depende da permissão de câmera. Caso a permissão seja negada, a tela mostra uma mensagem e oferece a ação para solicitar permissão quando permitido pelo sistema.

### Accelerometer

A Fase 2 usa `Accelerometer` de `expo-sensors`. O recurso depende de hardware compatível. Em dispositivos sem acelerômetro, a tela deve exibir uma mensagem de sensor indisponível.

### Notificações

A Fase 3 usa `expo-notifications`. No Android, a tela cria um canal de notificação antes de agendar a mensagem local. No iOS e Android, o usuário precisa conceder permissão para que a notificação seja exibida corretamente.

### Haptics

A Fase 4 usa `expo-haptics`. O resultado pode variar conforme o dispositivo, sistema operacional e disponibilidade de motor háptico. Em alguns ambientes, especialmente simuladores, o feedback pode ser limitado ou imperceptível.

## Assets principais

O projeto usa arquivos locais em `assets/`, incluindo imagens de fundo e sprites usados nas fases.

Exemplos usados no código:

- `assets/bg_level2.png`
- `assets/explorer.png`

## Documentos de apoio

O projeto possui relatórios auxiliares com análises de comportamento e riscos:

- `Bug Bounty - Level 2.md`
- `Bug Bounty - Level 4.md`

Esses documentos complementam o README com cenários de teste, causas prováveis e recomendações de correção.

## Boas práticas de desenvolvimento

- Teste recursos nativos em aparelho físico sempre que possível.
- Valide permissões antes de chamar APIs sensíveis.
- Trate falhas de hardware como parte esperada da experiência.
- Evite depender exclusivamente de câmera, sensores, notificações ou vibração para feedback crítico.
- Mantenha as fases desacopladas em arquivos separados dentro de `src/screens`.

## Troubleshooting

### A câmera não abre

Verifique se a permissão de câmera foi concedida. Se a permissão foi negada permanentemente, habilite manualmente nas configurações do sistema.

### O personagem da Fase 2 não se move

Confirme que o teste está sendo feito em um dispositivo com acelerômetro. Em simuladores ou ambientes sem sensor físico, o movimento pode não funcionar.

### A notificação não aparece

Verifique as permissões de notificação do sistema. No Android, confirme também se notificações do app estão habilitadas nas configurações.

### A vibração não é percebida

Teste em um dispositivo físico com motor háptico. Simuladores podem não reproduzir vibrações, e a intensidade pode variar entre Android e iOS.

## Licença

Este projeto está marcado como privado em `package.json`. Defina uma licença antes de publicar ou distribuir o código.


