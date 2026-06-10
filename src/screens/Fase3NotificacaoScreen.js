import React, { useEffect, useState } from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Notifications from 'expo-notifications';

// Esse handler faz a notificação aparecer mesmo se o app estiver aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Nome do canal usado no Android para essa fase.
const CANAL_MISSAO = 'mensagem-secreta';

// Tempo que demora para a notificação chegar depois de apertar o botão
const SEGUNDOS_ATE_NOTIFICACAO = 5;

export default function Fase3NotificacaoScreen({ navigation }) {
  // Estados usados para mostrar o andamento da permissão e da missão 
  const [statusPermissao, setStatusPermissao] = useState('verificando');
  const [statusMissao, setStatusMissao] = useState('Aguardando preparo da mensagem.');
  const [idNotificacao, setIdNotificacao] = useState(null);
  const [missaoConcluida, setMissaoConcluida] = useState(false);
  const [agendando, setAgendando] = useState(false);
  const [erro, setErro] = useState('');

  // useEffect roda quando entro na tela. Aqui preparo notificaçõess e escuto o toque nela
  useEffect(() => {
    let assinaturaResposta;

    async function prepararFase() {
      try {
        // Android precisa de canal de notificação, por isso faço isso primeiro.
        await configurarCanalAndroid();

        // Verifico se ja tenho permissao, mas sem abrir popup ainda.
        const permissaoAtual = await Notifications.getPermissionsAsync();
        setStatusPermissao(permissaoAtual.granted ? 'concedida' : 'pendente');

        // Esse listener percebe quando o usuario toca na notificacao.
        assinaturaResposta = Notifications.addNotificationResponseReceivedListener((resposta) => {
          // Esse data.fase serve para confirmar que a notificacao e da fase 3.
          const fase = resposta.notification.request.content.data?.fase;

          if (fase === 'mensagem-secreta') {
            // Se tocou na notificacao certa, marco a missao como concluida.
            setMissaoConcluida(true);
            setStatusMissao('Mensagem aberta. Missao concluida.');
          }
        });
      } catch (erroPreparacao) {
        // Se o aparelho nao preparar notificacoes, mostro erro simples.
        setErro('Nao foi possivel preparar as notificacoes neste dispositivo.');
      }
    }

    prepararFase();

    return () => {
      // Quando sai da tela eu removo o listener para nao duplicar eventos.
      assinaturaResposta?.remove();
    };
  }, []);

  // Separei em funcao porque isso so e necessario no Android.
  async function configurarCanalAndroid() {
    if (Platform.OS !== 'android') {
      return;
    }

    // Canal com importancia alta para a notificacao aparecer bem destacada.
    await Notifications.setNotificationChannelAsync(CANAL_MISSAO, {
      name: 'Mensagens secretas',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f59e0b',
    });
  }

  // Antes de agendar, eu confiro se ja tem permissao. Se nao tiver, eu peço.
  async function solicitarPermissaoSeNecessario() {
    const permissaoAtual = await Notifications.getPermissionsAsync();

    if (permissaoAtual.granted) {
      // Se ja esta permitido, nao precisa pedir de novo.
      setStatusPermissao('concedida');
      return true;
    }

    // Aqui aparece o pedido de permissao do sistema.
    const novaPermissao = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    });

    setStatusPermissao(novaPermissao.granted ? 'concedida' : 'negada');
    return novaPermissao.granted;
  }

  // Funcao do botao principal. Ela agenda a mensagem secreta.
  async function agendarMensagemSecreta() {
    try {
      // Trava o botao enquanto agenda para evitar clicar varias vezes.
      setAgendando(true);
      setErro('');
      setMissaoConcluida(false);

      // Se nao tiver permissao, nao agenda, mas tambem nao quebra o app.
      const permissaoLiberada = await solicitarPermissaoSeNecessario();

      if (!permissaoLiberada) {
        setStatusMissao('Permissao negada. A fase nao trava, mas a mensagem nao pode aparecer.');
        return;
      }

      // Aqui a API agenda uma notificacao local para alguns segundos depois.
      const identificador = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Mensagem secreta encontrada',
          body: 'Toque aqui para receber a recompensa da missao.',
          sound: true,
          // Dados escondidos que eu uso depois para identificar essa notificacao.
          data: {
            fase: 'mensagem-secreta',
            recompensa: 'Fragmento de mapa',
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: SEGUNDOS_ATE_NOTIFICACAO,
          // No Android isso conecta a notificacao no canal criado la em cima.
          channelId: CANAL_MISSAO,
        },
      });

      // Guardo esse id para conseguir cancelar se precisar.
      setIdNotificacao(identificador);
      setStatusMissao(`Mensagem agendada para daqui ${SEGUNDOS_ATE_NOTIFICACAO} segundos.`);
    } catch (erroAgendamento) {
      // Erro amigavel caso o agendamento falhe.
      setErro('Falha ao agendar a notificacao local. Tente novamente.');
    } finally {
      // Libera o botao de novo.
      setAgendando(false);
    }
  }

  // Cancela a notificacao que ainda esta esperando para aparecer.
  async function cancelarMensagem() {
    if (!idNotificacao) {
      return;
    }

    await Notifications.cancelScheduledNotificationAsync(idNotificacao);
    setIdNotificacao(null);
    setStatusMissao('Mensagem secreta cancelada.');
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#08111f" />

      <View style={styles.header}>
        <Text style={styles.indicadorFase}>FASE 3</Text>
        <Text style={styles.titulo}>Mensagem Secreta</Text>
        <Text style={styles.subtitulo}>
          Agende uma notificacao local e toque nela para concluir a missao.
        </Text>
      </View>

      <View style={styles.areaMissao}>
        <View style={[styles.circuloStatus, missaoConcluida && styles.circuloConcluido]}>
          <Text style={styles.iconeStatus}>{missaoConcluida ? 'OK' : '...'}</Text>
        </View>

        <Text style={styles.rotulo}>STATUS DA PERMISSAO</Text>
        <Text style={styles.valorStatus}>{formatarPermissao(statusPermissao)}</Text>

        <Text style={styles.rotulo}>REGISTRO DA MISSAO</Text>
        <Text style={styles.textoMissao}>{statusMissao}</Text>

        {erro ? <Text style={styles.textoErro}>{erro}</Text> : null}
      </View>

      <View style={styles.rodape}>
        <TouchableOpacity
          style={[styles.botaoPrincipal, agendando && styles.botaoDesabilitado]}
          onPress={agendarMensagemSecreta}
          disabled={agendando}
        >
          <Text style={styles.textoBotaoPrincipal}>
            {agendando ? 'Agendando...' : 'Enviar mensagem secreta'}
          </Text>
        </TouchableOpacity>

        <View style={styles.linhaBotoes}>
          <TouchableOpacity style={styles.botaoSecundarioFlexivel} onPress={cancelarMensagem}>
            <Text style={styles.textoBotaoSecundario}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botaoSecundarioFlexivel} onPress={() => navigation.goBack()}>
            <Text style={styles.textoBotaoSecundario}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Transforma o status interno em um texto mais facil de mostrar na tela.
function formatarPermissao(statusPermissao) {
  const textos = {
    verificando: 'Verificando...',
    pendente: 'Ainda nao solicitada',
    concedida: 'Concedida',
    negada: 'Negada',
  };

  return textos[statusPermissao] ?? statusPermissao;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08111f',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: 24,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#172033',
  },
  indicadorFase: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  titulo: {
    color: '#f8fafc',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitulo: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
  areaMissao: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  circuloStatus: {
    width: 142,
    height: 142,
    borderRadius: 71,
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  circuloConcluido: {
    borderColor: '#22c55e',
    backgroundColor: '#052e16',
  },
  iconeStatus: {
    color: '#e2e8f0',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1,
  },
  rotulo: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginTop: 16,
    marginBottom: 6,
  },
  valorStatus: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
  },
  textoMissao: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 290,
    textAlign: 'center',
  },
  textoErro: {
    color: '#fecaca',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 16,
    textAlign: 'center',
  },
  rodape: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'android' ? 28 : 38,
  },
  botaoPrincipal: {
    backgroundColor: '#38bdf8',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  botaoDesabilitado: {
    opacity: 0.5,
  },
  textoBotaoPrincipal: {
    color: '#082f49',
    fontSize: 14,
    fontWeight: '800',
  },
  linhaBotoes: {
    flexDirection: 'row',
    gap: 12,
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
});
