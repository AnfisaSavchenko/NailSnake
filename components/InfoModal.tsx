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

              <View style={styles.stepsList}>
                <View style={styles.step}>
                  <Text style={styles.stepNumber}>1.</Text>
                  <Text style={styles.stepText}>Check in daily and grow your snake</Text>
                </View>

                <View style={styles.step}>
                  <Text style={styles.stepNumber}>2.</Text>
                  <Text style={styles.stepText}>Get daily credits</Text>
                </View>

                <View style={styles.step}>
                  <Text style={styles.stepNumber}>3.</Text>
                  <Text style={styles.stepText}>Spend them on moodboards</Text>
                </View>
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
    marginBottom: 32,
    textAlign: 'center',
  },
  stepsList: {
    marginBottom: 32,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.coralOrange,
    marginRight: 12,
    minWidth: 30,
  },
  stepText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.darkBrown,
    lineHeight: 26,
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
