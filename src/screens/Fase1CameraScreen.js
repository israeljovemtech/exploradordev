import React, { useRef, useState } from 'react';
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function Fase1CameraScreen({ navigation }) {
  // useRef guarda a caamera para eu conseguir chamar funções dela depois
  const referenciaCamera = useRef(null);

  // Hook do expo-camera que ve se tem permissão
  const [permissao, solicitarPermissao] = useCameraPermissions();

  // Esses estados controlam o que aparece na tela
  const [fotoCapturada, setFotoCapturada] = useState(null);
  const [cameraPronta, setCameraPronta] = useState(false);
  const [capturando, setCapturando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  // Essa função roda quando clico no botao de tirar foto
  async function tirarFoto() {
    // Aqui eu evito erro se a camera ainda nao carregou ou se o botão foi apertado várias vezes
    if (!referenciaCamera.current || !cameraPronta || capturando) {
      return;
    }

    try {
      // Trava o botão enquanto esta tirando a foto
      setCapturando(true);
      setMensagemErro('');

      // Aqui a API tira a foto e devolve informacoes dela, principalmente o uri - uri é o caminho do arquivo da foto no celular
      const foto = await referenciaCamera.current.takePictureAsync({
        quality: 0.75,
        skipProcessing: false,
      });

      // Guardo a foto no estado para trocar a tela da camera pela previa
      setFotoCapturada(foto);
    } catch (erro) {
      // Se der erro, mostro uma mensagem simples em vez de deixar quebrar
      setMensagemErro('Nao foi possivel capturar a evidencia. Tente novamente.');
    } finally {
      // Libera o botão de novo no final
      setCapturando(false);
    }
  }

  // Limpa a foto para poder tentar tirar outra
  function reiniciarMissao() {
    setFotoCapturada(null);
    setMensagemErro('');
  }

  // Enquanto o app ainda esta conferindo a permissao, mostro carregando
  if (!permissao) {
    return (
      <View style={styles.containerCentralizado}>
        <StatusBar barStyle="light-content" backgroundColor="#07111f" />
        <Text style={styles.titulo}>Carregando permissao da camera...</Text>
      </View>
    );
  }

  // Se nao tiver permissao, a camera nem aparece. Primeiro o usuario precisa permitir
  if (!permissao.granted) {
    return (
      <View style={styles.containerCentralizado}>
        <StatusBar barStyle="light-content" backgroundColor="#07111f" />
        <Text style={styles.indicadorFase}>FASE 1</Text>
        <Text style={styles.titulo}>Fotografo Explorador</Text>
        <Text style={styles.textoAjuda}>
          A missão precisa da câmera para capturar uma evidência do ambiente.
        </Text>

        {/* Se ainda pode pedir permissão, mostro o botão que abre o popup do sistema. */}
        {permissao.canAskAgain ? (
          <TouchableOpacity style={styles.botaoPrincipal} onPress={solicitarPermissao}>
            <Text style={styles.textoBotaoPrincipal}>Permitir camera</Text>
          </TouchableOpacity>
        ) : (
          // Se a permissão foi bloqueada de vez, só avisa para liberar nas configurações
          <Text style={styles.textoErro}>
            Permissão negada permanentemente. Ative a câmera nas configurações do sistema.
          </Text>
        )}

        <TouchableOpacity style={styles.botaoSecundario} onPress={() => navigation.goBack()}>
          <Text style={styles.textoBotaoSecundario}>Voltar ao mapa</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Quando ja tem foto, eu mostro a previa em vez de continuar mostrando a camera
  if (fotoCapturada) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#07111f" />
        <Image source={{ uri: fotoCapturada.uri }} style={styles.previaFoto} resizeMode="cover" />
        <View style={styles.painelInferior}>
          <Text style={styles.indicadorFase}>FASE 1 CONCLUIDA</Text>
          <Text style={styles.titulo}>Evidencia capturada</Text>
          <Text style={styles.textoAjuda}>
            URI salvo no cache do app para registrar o resultado da missao.
          </Text>

          {/* Mostro o URI para provar que a camera retornou uma imagem de verdade. */}
          <Text style={styles.uriFoto} numberOfLines={2}>
            {fotoCapturada.uri}
          </Text>

          <View style={styles.linhaBotoes}>
            <TouchableOpacity style={styles.botaoSecundarioFlexivel} onPress={reiniciarMissao}>
              <Text style={styles.textoBotaoSecundario}>Tirar outra</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.botaoPrincipalFlexivel} onPress={() => navigation.goBack()}>
              <Text style={styles.textoBotaoPrincipal}>Finalizar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* CameraView e o preview ao vivo da camera. */}
      <CameraView
        ref={referenciaCamera}
        style={styles.camera}
        facing="back"
        // Quando a camera termina de carregar, libero o botao de foto.
        onCameraReady={() => setCameraPronta(true)}
        // Se a camera nao abrir, guardo erro para mostrar na tela.
        onMountError={() => setMensagemErro('A camera nao iniciou neste dispositivo.')}
      />

      <View style={styles.cabecalhoSobreposto}>
        <Text style={styles.indicadorFase}>FASE 1</Text>
        <Text style={styles.titulo}>Fotografo Explorador</Text>
        <Text style={styles.textoAjuda}>Aponte a camera e capture uma evidencia.</Text>
      </View>

      {/* aqui é s[ó uma mira visual para parecer missão de jgoo mesmo */}
      <View style={styles.mira} />

      <View style={styles.painelCamera}>
        {mensagemErro ? <Text style={styles.textoErro}>{mensagemErro}</Text> : null}
        <TouchableOpacity
          style={[styles.botaoCaptura, (!cameraPronta || capturando) && styles.botaoDesabilitado]}
          onPress={tirarFoto}
          // O botao fica bloqueado enquanto a camera nao estiver pronta.
          disabled={!cameraPronta || capturando}
        >
          <View style={styles.centroBotaoCaptura} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.botaoVoltarCamera} onPress={() => navigation.goBack()}>
          <Text style={styles.textoBotaoVoltarCamera}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111f',
  },
  containerCentralizado: {
    flex: 1,
    backgroundColor: '#07111f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  camera: {
    flex: 1,
  },
  cabecalhoSobreposto: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 44 : 58,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  indicadorFase: {
    color: '#f59e0b',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  titulo: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  textoAjuda: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
  mira: {
    position: 'absolute',
    top: '34%',
    alignSelf: 'center',
    width: 180,
    height: 180,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.85)',
    borderRadius: 16,
  },
  painelCamera: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: Platform.OS === 'android' ? 28 : 38,
    backgroundColor: 'rgba(7, 17, 31, 0.82)',
  },
  botaoCaptura: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  centroBotaoCaptura: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#f59e0b',
  },
  botaoDesabilitado: {
    opacity: 0.45,
  },
  botaoVoltarCamera: {
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  textoBotaoVoltarCamera: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '700',
  },
  previaFoto: {
    flex: 1,
  },
  painelInferior: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'android' ? 28 : 38,
    backgroundColor: '#07111f',
  },
  uriFoto: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  linhaBotoes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  botaoPrincipal: {
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 20,
    marginTop: 24,
  },
  botaoPrincipalFlexivel: {
    flex: 1,
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  textoBotaoPrincipal: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  botaoSecundario: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  botaoSecundarioFlexivel: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  textoBotaoSecundario: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '700',
  },
  textoErro: {
    color: '#fecaca',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
});
