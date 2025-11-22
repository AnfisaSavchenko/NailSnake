import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { storage, ChatMessage } from '@/utils/storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTextGeneration } from '@fastshot/ai';

export default function SupportScreen() {
  const [streakInfo, setStreakInfo] = useState<{ currentStreak: number; totalCheckins: number } | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const { generateText, isLoading: isAILoading } = useTextGeneration({
    onSuccess: async (response) => {
      // Save assistant message
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      await storage.saveChatMessage(assistantMessage);
      const updatedHistory = await storage.getChatHistory();
      setChatHistory(updatedHistory);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    },
    onError: (error) => {
      console.error('AI error:', error);
      Alert.alert('Oops!', 'Your sponsor is having a moment. Try again in a sec.');
    },
  });

  // Load data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoadingHistory(true);
      const [info, history] = await Promise.all([
        storage.getStreakInfo(),
        storage.getChatHistory(),
      ]);
      setStreakInfo(info);
      setChatHistory(history);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isAILoading) return;

    const userMessage = inputText.trim();
    setInputText('');

    // Save user message
    const userChatMessage: ChatMessage = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    await storage.saveChatMessage(userChatMessage);
    const updatedHistory = await storage.getChatHistory();
    setChatHistory(updatedHistory);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Build context-aware prompt with Man Repeller persona
    const streak = streakInfo?.currentStreak || 0;
    const nailGrowth = (streak * 0.1).toFixed(1);

    const conversationContext = updatedHistory
      .slice(-6) // Last 6 messages for context
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Sponsor'}: ${msg.content}`)
      .join('\n');

    const systemPrompt = `You are a 12-step program sponsor helping someone stop biting their nails. Your personality is inspired by Leandra Medine Cohen (Man Repeller): witty, self-aware, fashionable, supportive but not overly earnest, with a dash of humor and internet culture references. Keep responses to 2-3 sentences max.

Context:
- User's current streak: ${streak} days
- Estimated nail growth: ${nailGrowth}mm
- Recent conversation:
${conversationContext}

User's message: "${userMessage}"

Respond as their sponsor with Man Repeller energy:`;

    // Generate AI response
    await generateText(systemPrompt);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Chat History?',
      'This will delete all your conversations with your sponsor.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await storage.clearChatHistory();
            setChatHistory([]);
          },
        },
      ]
    );
  };

  if (isLoadingHistory || !streakInfo) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.coralOrange} />
        <Text style={styles.loadingText}>Loading your stats...</Text>
      </View>
    );
  }

  const nailGrowth = (streakInfo.currentStreak * 0.1).toFixed(1);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.statsTitle}>Your Progress</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{streakInfo.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{nailGrowth}mm</Text>
            <Text style={styles.statLabel}>Nail Growth</Text>
          </View>
        </View>
        <Text style={styles.statsSubtext}>
          💅 Nails grow ~0.1mm per day. You&apos;re making real progress!
        </Text>
      </View>

      {/* Chat Section */}
      <View style={styles.chatSection}>
        <View style={styles.chatHeader}>
          <View>
            <Text style={styles.chatTitle}>Your Sponsor</Text>
            <Text style={styles.chatSubtitle}>Man Repeller energy ✨</Text>
          </View>
          {chatHistory.length > 0 && (
            <TouchableOpacity onPress={handleClearHistory} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {chatHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>💬</Text>
              <Text style={styles.emptyStateText}>
                Start a conversation with your sponsor!
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Ask for advice, share your struggles, or just chat about nails and fashion.
              </Text>
            </View>
          ) : (
            chatHistory.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
                  ]}
                >
                  {message.content}
                </Text>
              </View>
            ))
          )}

          {isAILoading && (
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <ActivityIndicator size="small" color={Colors.darkBrown} />
              <Text style={styles.typingText}>Sponsor is typing...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="rgba(62, 39, 35, 0.5)"
            multiline
            maxLength={500}
            editable={!isAILoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isAILoading) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isAILoading}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.limeGreen,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.darkBrown,
    fontWeight: '600',
    marginTop: 12,
  },
  statsSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(62, 39, 35, 0.1)',
  },
  statsTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.darkBrown,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.coralOrange,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.darkBrown,
    opacity: 0.8,
  },
  statsSubtext: {
    fontSize: 12,
    color: Colors.darkBrown,
    opacity: 0.6,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  chatSection: {
    flex: 1,
    backgroundColor: Colors.limeGreen,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },
  chatTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.darkBrown,
  },
  chatSubtitle: {
    fontSize: 12,
    color: Colors.darkBrown,
    opacity: 0.6,
    marginTop: 2,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.darkBrown,
    opacity: 0.7,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.darkBrown,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.darkBrown,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.coralOrange,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: Colors.white,
    fontWeight: '500',
  },
  assistantMessageText: {
    color: Colors.darkBrown,
    fontWeight: '500',
  },
  typingText: {
    fontSize: 13,
    color: Colors.darkBrown,
    opacity: 0.7,
    fontStyle: 'italic',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 12,
    gap: 12,
    backgroundColor: Colors.limeGreen,
    borderTopWidth: 2,
    borderTopColor: 'rgba(62, 39, 35, 0.1)',
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.darkBrown,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.coralOrange,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
