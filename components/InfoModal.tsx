import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors } from '@/constants/Colors';

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modal}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>How Nailgrow Works</Text>

              <View style={styles.section}>
                <Text style={styles.emoji}>🐍</Text>
                <Text style={styles.sectionTitle}>Daily Check-ins</Text>
                <Text style={styles.sectionText}>
                  Check in every day to grow your snake! Each successful check-in adds one
                  body segment to your snake and builds your streak.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.emoji}>💰</Text>
                <Text style={styles.sectionTitle}>Earn Credits</Text>
                <Text style={styles.sectionText}>
                  Every daily check-in earns you <Text style={styles.bold}>1 Credit</Text>.
                  Credits are your currency to unlock nail art inspiration!
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.emoji}>🎨</Text>
                <Text style={styles.sectionTitle}>Generate Moodboards</Text>
                <Text style={styles.sectionText}>
                  Spend 1 credit in the Inspo tab to generate AI-powered nail art designs
                  inspired by Pinterest, K-pop, Kawaii, WGSN, and Asian 3D nail trends.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.emoji}>📈</Text>
                <Text style={styles.sectionTitle}>Track Progress</Text>
                <Text style={styles.sectionText}>
                  Visit the Stats tab to see your nail growth, chat with your sponsor,
                  and celebrate your milestones!
                </Text>
              </View>

              <View style={styles.loopCard}>
                <Text style={styles.loopTitle}>The Loop:</Text>
                <Text style={styles.loopText}>
                  Check in daily → Get Credits → Unlock Pinterest Moodboards
                </Text>
              </View>

              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Got it!</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.limeGreen,
    borderRadius: 30,
    padding: 30,
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.darkBrown,
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.darkBrown,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: Colors.darkBrown,
    lineHeight: 20,
    opacity: 0.8,
  },
  bold: {
    fontWeight: '700',
  },
  loopCard: {
    backgroundColor: Colors.coralOrange,
    padding: 20,
    borderRadius: 20,
    marginVertical: 12,
  },
  loopTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  loopText: {
    fontSize: 14,
    color: Colors.white,
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: Colors.coralOrange,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 12,
  },
  closeButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
