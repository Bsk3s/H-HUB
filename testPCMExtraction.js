/**
 * Test script to verify PCM extraction is working correctly
 * This helps ensure we're sending the right format to Deepgram
 */

export function testPCMExtraction() {
  console.log('🧪 Testing PCM extraction logic...');
  
  // Create a mock WAV file structure for testing
  const mockWAVData = createMockWAVFile();
  
  // Test the stripWAVHeader function
  const pcmData = stripWAVHeader(mockWAVData);
  
  console.log('📊 PCM Extraction Test Results:');
  console.log(`  Original WAV size: ${mockWAVData.byteLength} bytes`);
  console.log(`  Extracted PCM size: ${pcmData.byteLength} bytes`);
  console.log(`  Header size stripped: ${mockWAVData.byteLength - pcmData.byteLength} bytes`);
  
  // Validate the extraction
  if (pcmData.byteLength > 0 && pcmData.byteLength < mockWAVData.byteLength) {
    console.log('✅ PCM extraction appears to be working correctly');
    return true;
  } else {
    console.log('❌ PCM extraction failed');
    return false;
  }
}

function createMockWAVFile() {
  // Create a minimal WAV file structure
  const sampleRate = 16000;
  const channels = 1;
  const bitDepth = 16;
  const duration = 0.25; // 250ms
  const numSamples = Math.floor(sampleRate * duration);
  
  // Calculate sizes
  const headerSize = 44; // Standard WAV header
  const dataSize = numSamples * channels * (bitDepth / 8);
  const fileSize = headerSize + dataSize;
  
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);
  const textEncoder = new TextEncoder();
  
  let offset = 0;
  
  // RIFF chunk
  const riffBytes = textEncoder.encode('RIFF');
  for (let i = 0; i < 4; i++) view.setUint8(offset++, riffBytes[i]);
  view.setUint32(offset, fileSize - 8, true); offset += 4;
  
  // WAVE format
  const waveBytes = textEncoder.encode('WAVE');
  for (let i = 0; i < 4; i++) view.setUint8(offset++, waveBytes[i]);
  
  // fmt chunk
  const fmtBytes = textEncoder.encode('fmt ');
  for (let i = 0; i < 4; i++) view.setUint8(offset++, fmtBytes[i]);
  view.setUint32(offset, 16, true); offset += 4; // fmt chunk size
  view.setUint16(offset, 1, true); offset += 2;  // PCM format
  view.setUint16(offset, channels, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, sampleRate * channels * (bitDepth / 8), true); offset += 4; // byte rate
  view.setUint16(offset, channels * (bitDepth / 8), true); offset += 2; // block align
  view.setUint16(offset, bitDepth, true); offset += 2;
  
  // data chunk
  const dataBytes = textEncoder.encode('data');
  for (let i = 0; i < 4; i++) view.setUint8(offset++, dataBytes[i]);
  view.setUint32(offset, dataSize, true); offset += 4;
  
  // Generate some sample PCM data (sine wave)
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 32767;
    view.setInt16(offset, Math.round(sample), true);
    offset += 2;
  }
  
  return buffer;
}

function stripWAVHeader(wavBuffer) {
  const dataView = new DataView(wavBuffer);
  
  let offset = 12; // Skip RIFF header
  
  // Find the "data" chunk
  while (offset < wavBuffer.byteLength - 8) {
    const chunkId = String.fromCharCode(
      dataView.getUint8(offset),
      dataView.getUint8(offset + 1),
      dataView.getUint8(offset + 2),
      dataView.getUint8(offset + 3)
    );
    
    const chunkSize = dataView.getUint32(offset + 4, true); // little endian
    
    if (chunkId === 'data') {
      // Found data chunk, extract PCM data
      const pcmOffset = offset + 8;
      const pcmSize = Math.min(chunkSize, wavBuffer.byteLength - pcmOffset);
      
      return wavBuffer.slice(pcmOffset, pcmOffset + pcmSize);
    }
    
    // Move to next chunk
    offset += 8 + chunkSize;
  }
  
  // If no data chunk found, return the buffer minus likely header size (44 bytes typical)
  const headerSize = 44;
  if (wavBuffer.byteLength > headerSize) {
    return wavBuffer.slice(headerSize);
  }
  
  return wavBuffer;
} 