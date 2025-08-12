import AudioQueue from '../AudioQueue';
import WebSocketAudioService from '../WebSocketAudioService';

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({
        sound: {
          setOnPlaybackStatusUpdate: jest.fn(),
          unloadAsync: jest.fn(),
          stopAsync: jest.fn()
        }
      }))
    },
    Recording: jest.fn(() => ({
      prepareToRecordAsync: jest.fn(),
      startAsync: jest.fn(),
      stopAndUnloadAsync: jest.fn(),
      getStatusAsync: jest.fn(() => ({ isRecording: true })),
      getURI: jest.fn(() => 'test-uri')
    }))
  }
}));

// Mock WebSocket
global.WebSocket = jest.fn(() => ({
  readyState: 1,
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
}));

// Mock URL and Blob for audio conversion
global.URL = {
  createObjectURL: jest.fn(() => 'blob:test-url'),
  revokeObjectURL: jest.fn()
};

global.Blob = jest.fn();
global.atob = jest.fn((str) => str); // Simple mock

describe('Progressive Streaming Implementation', () => {
  
  describe('AudioQueue', () => {
    let audioQueue;

    beforeEach(() => {
      audioQueue = new AudioQueue();
    });

    test('should initialize with empty queue', () => {
      expect(audioQueue.getQueueLength()).toBe(0);
      expect(audioQueue.isCurrentlyPlaying()).toBe(false);
    });

    test('should convert base64 to audio URL', () => {
      const base64Audio = 'dGVzdA=='; // "test" in base64
      const result = audioQueue.convertBase64ToAudio(base64Audio);
      
      expect(global.atob).toHaveBeenCalledWith(base64Audio);
      expect(global.Blob).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(result).toBe('blob:test-url');
    });

    test('should handle data URL prefix in base64', () => {
      const base64WithPrefix = 'data:audio/wav;base64,dGVzdA==';
      audioQueue.convertBase64ToAudio(base64WithPrefix);
      
      expect(global.atob).toHaveBeenCalledWith('dGVzdA==');
    });

    test('should add chunk to queue when not playing', async () => {
      const base64Audio = 'dGVzdA==';
      await audioQueue.addChunk(base64Audio, 1);
      
      expect(audioQueue.isCurrentlyPlaying()).toBe(true);
    });

    test('should queue chunks when already playing', async () => {
      // Start playing first chunk
      await audioQueue.addChunk('chunk1', 1);
      expect(audioQueue.isCurrentlyPlaying()).toBe(true);
      
      // Add second chunk to queue
      await audioQueue.addChunk('chunk2', 2);
      expect(audioQueue.getQueueLength()).toBe(1);
    });

    test('should call onChunkStarted callback', async () => {
      const onChunkStarted = jest.fn();
      audioQueue.setOnChunkStarted(onChunkStarted);
      
      await audioQueue.addChunk('test', 5);
      
      expect(onChunkStarted).toHaveBeenCalledWith(5);
    });

    test('should stop all playback and clear queue', async () => {
      await audioQueue.addChunk('chunk1', 1);
      await audioQueue.addChunk('chunk2', 2);
      
      await audioQueue.stop();
      
      expect(audioQueue.isCurrentlyPlaying()).toBe(false);
      expect(audioQueue.getQueueLength()).toBe(0);
    });
  });

  describe('WebSocketAudioService Progressive Streaming', () => {
    let service;
    let mockWs;

    beforeEach(() => {
      service = new WebSocketAudioService();
      mockWs = {
        readyState: 1,
        send: jest.fn(),
        close: jest.fn(),
        onopen: null,
        onmessage: null,
        onclose: null,
        onerror: null
      };
      global.WebSocket = jest.fn(() => mockWs);
    });

    test('should initialize with streaming state', () => {
      expect(service.streamingState).toEqual({
        isStreaming: false,
        currentChunk: 0,
        totalChunks: 0,
        fullText: ''
      });
    });

    test('should handle response_start message', () => {
      const responseData = {
        type: 'response_start',
        total_chunks: 5,
        full_text: 'Hello, this is a test response'
      };

      const streamingStartedSpy = jest.fn();
      service.on('streamingStarted', streamingStartedSpy);

      service.prepareForStreamingResponse(responseData);

      expect(service.streamingState.isStreaming).toBe(true);
      expect(service.streamingState.totalChunks).toBe(5);
      expect(service.streamingState.fullText).toBe('Hello, this is a test response');
      expect(streamingStartedSpy).toHaveBeenCalled();
    });

    test('should handle audio_chunk message', () => {
      // Prepare streaming first
      service.prepareForStreamingResponse({
        type: 'response_start',
        total_chunks: 3
      });

      const progressSpy = jest.fn();
      service.on('streamingProgress', progressSpy);

      const chunkData = {
        type: 'audio_chunk',
        chunk_id: 2,
        audio: 'dGVzdA==',
        text: 'Hello'
      };

      service.handleAudioChunk(chunkData);

      expect(service.streamingState.currentChunk).toBe(2);
      expect(progressSpy).toHaveBeenCalledWith({
        currentChunk: 2,
        totalChunks: 3,
        text: 'Hello'
      });
    });

    test('should handle response_complete message', () => {
      const completeSpy = jest.fn();
      service.on('streamingComplete', completeSpy);

      service.handleResponseComplete({ type: 'response_complete' });

      expect(service.streamingState.isStreaming).toBe(false);
      expect(completeSpy).toHaveBeenCalled();
    });

    test('should parse JSON messages for streaming', async () => {
      const messageData = {
        type: 'audio_chunk',
        chunk_id: 1,
        audio: 'dGVzdA=='
      };

      service.prepareForStreamingResponse = jest.fn();
      service.handleAudioChunk = jest.fn();
      service.handleResponseComplete = jest.fn();

      await service.handleWebSocketMessage(JSON.stringify(messageData));

      expect(service.handleAudioChunk).toHaveBeenCalledWith(messageData);
    });

    test('should fallback to binary audio for non-JSON messages', async () => {
      const binaryData = new ArrayBuffer(8);
      service.handleIncomingAudio = jest.fn();

      await service.handleWebSocketMessage(binaryData);

      expect(service.handleIncomingAudio).toHaveBeenCalledWith(binaryData);
    });

    test('should return streaming state', () => {
      service.streamingState = {
        isStreaming: true,
        currentChunk: 3,
        totalChunks: 5,
        fullText: 'Test'
      };

      expect(service.isStreaming()).toBe(true);
      expect(service.getStreamingProgress()).toBe(0.6); // 3/5
      expect(service.getStreamingState()).toEqual(service.streamingState);
    });

    test('should handle zero total chunks in progress calculation', () => {
      service.streamingState.totalChunks = 0;
      expect(service.getStreamingProgress()).toBe(0);
    });

    test('should stop audio queue on disconnect', async () => {
      service.audioQueue.stop = jest.fn();
      
      await service.disconnect();
      
      expect(service.audioQueue.stop).toHaveBeenCalled();
      expect(service.streamingState.isStreaming).toBe(false);
    });
  });

  describe('Integration Test', () => {
    test('should handle complete streaming flow', async () => {
      const service = new WebSocketAudioService();
      const events = [];

      // Capture events
      service.on('streamingStarted', (data) => events.push({ type: 'started', data }));
      service.on('streamingProgress', (data) => events.push({ type: 'progress', data }));
      service.on('streamingComplete', (data) => events.push({ type: 'complete', data }));

      // Simulate streaming flow
      await service.handleWebSocketMessage(JSON.stringify({
        type: 'response_start',
        total_chunks: 3,
        full_text: 'Complete response'
      }));

      await service.handleWebSocketMessage(JSON.stringify({
        type: 'audio_chunk',
        chunk_id: 1,
        audio: 'Y2h1bmsxCg==',
        text: 'Complete'
      }));

      await service.handleWebSocketMessage(JSON.stringify({
        type: 'audio_chunk',
        chunk_id: 2,
        audio: 'Y2h1bmsyCg==',
        text: 'response'
      }));

      await service.handleWebSocketMessage(JSON.stringify({
        type: 'response_complete'
      }));

      expect(events).toHaveLength(4);
      expect(events[0].type).toBe('started');
      expect(events[1].type).toBe('progress');
      expect(events[1].data.currentChunk).toBe(1);
      expect(events[2].type).toBe('progress');
      expect(events[2].data.currentChunk).toBe(2);
      expect(events[3].type).toBe('complete');
    });
  });
}); 