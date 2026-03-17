import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { api } from '../services/api';
import { BragLog } from '../types';
import ScreenLayout from '../components/ScreenLayout';
import { playMessage } from '../services/sounds';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  createdAt: string;
}

export default function AICoachScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await api.get<BragLog[]>('/api/ai/history');
      const chatMessages: ChatMessage[] = [];
      history.reverse().forEach((log) => {
        chatMessages.push({
          id: `user-${log.id}`,
          text: log.message,
          isUser: true,
          createdAt: log.created_at,
        });
        chatMessages.push({
          id: `ai-${log.id}`,
          text: log.ai_response,
          isUser: false,
          createdAt: log.created_at,
        });
      });
      setMessages(chatMessages);
    } catch {}
  };

  const sendMessage = async (text: string, isCraving: boolean = false) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      isUser: true,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const endpoint = isCraving ? '/api/ai/craving' : '/api/ai/brag';
      const res = await api.post<{ ai_response: string }>(endpoint, { message: text.trim() });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: res.ai_response,
        isUser: false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      playMessage();
    } catch {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        text: '잠시 후 다시 시도해주세요.',
        isUser: false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
      {!item.isUser && <Text style={styles.aiLabel}>🐰 도파빗 코치</Text>}
      <Text style={[styles.messageText, item.isUser && styles.userText]}>{item.text}</Text>
    </View>
  );

  return (
    <ScreenLayout title="AI 코치" avoidKeyboard>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🐰</Text>
            <Text style={styles.emptyText}>오늘의 루틴을 완료하고{'\n'}도파빗에게 자랑해보세요!</Text>
          </View>
        }
      />

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => sendMessage('먹고싶다', true)}
          disabled={loading}
        >
          <Text style={styles.quickButtonText}>🍩 먹고싶다</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => sendMessage('담배 피고싶다', true)}
          disabled={loading}
        >
          <Text style={styles.quickButtonText}>🚬 피고싶다</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => sendMessage('쇼츠 보고싶다', true)}
          disabled={loading}
        >
          <Text style={styles.quickButtonText}>📱 보고싶다</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="도파빗에게 자랑하기..."
          placeholderTextColor={colors.textTertiary}
          value={input}
          onChangeText={setInput}
          multiline
        />
        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.sendButton} />
        ) : (
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim()}
          >
            <Text style={styles.sendText}>전송</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  messageList: {
    padding: 20,
    paddingBottom: 8,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.background,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  aiLabel: {
    ...typography.labelSmall,
    color: colors.primary,
    marginBottom: 4,
  },
  messageText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  userText: {
    color: colors.textWhite,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  quickButton: {
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickButtonText: {
    ...typography.labelSmall,
    color: colors.textPrimary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 12,
  },
  input: {
    flex: 1,
    ...typography.bodyMedium,
    backgroundColor: colors.backgroundGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    color: colors.textPrimary,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sendText: {
    ...typography.labelMedium,
    color: colors.primary,
  },
});
