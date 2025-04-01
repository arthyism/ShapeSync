import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const ProgressGalleryScreen = () => {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const directory = FileSystem.documentDirectory + 'gym-progress/';

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError('');
      
      const dirInfo = await FileSystem.getInfoAsync(directory);
      
      if (!dirInfo.exists) {
        setFiles([]);
        return;
      }

      const fileList = await FileSystem.readDirectoryAsync(directory);
      setFiles(fileList.reverse());
    } catch (err) {
      setError('Failed to load files');
      console.error('File loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (filename: string) => {
    try {
      const fileUri = directory + filename;
      await Sharing.shareAsync(fileUri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Share Progress Image',
      });
    } catch (err) {
      console.error('Sharing failed:', err);
      Alert.alert('Error', 'Could not share file');
    }
  };

  useEffect(() => {
    loadFiles();
  }, [refreshTrigger]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress History</Text>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : files.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.message}>No progress images found</Text>
        </View>
      ) : (
        <FlatList
          data={files}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View style={styles.fileContainer}>
              <Pressable
                style={styles.fileItem}
                onPress={() => setPreviewUri(directory + item)}
              >
                <Text style={styles.fileText}>{item}</Text>
                <View style={styles.buttonRow}>
                  <Pressable
                    style={[styles.actionButton, styles.previewButton]}
                    onPress={() => setPreviewUri(directory + item)}
                  >
                    <Text style={styles.buttonText}>Preview</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionButton, styles.shareButton]}
                    onPress={() => handleShare(item)}
                  >
                    <Text style={styles.buttonText}>Share</Text>
                  </Pressable>
                </View>
              </Pressable>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal visible={!!previewUri} transparent={true}>
        <View style={styles.modalContainer}>
          {previewUri && (
            <Image 
              source={{ uri: previewUri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
          <Pressable
            style={styles.closeButton}
            onPress={() => setPreviewUri(null)}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>
      </Modal>

      <Pressable
        style={styles.refreshButton}
        onPress={() => setRefreshTrigger(prev => prev + 1)}
      >
        <Text style={styles.buttonText}>Refresh List</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  listContent: {
    paddingBottom: 20,
  },
  fileContainer: {
    marginBottom: 15,
  },
  fileItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  fileText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  previewButton: {
    backgroundColor: '#2196F3',
  },
  shareButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  message: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  error: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
    fontSize: 16,
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '95%',
    height: '80%',
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  closeText: {
    color: 'white',
    fontSize: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProgressGalleryScreen;