#!/usr/bin/env python3
"""
WebSocket Audio Backend - Real-time audio streaming for voice conversations
"""

import asyncio
import websockets
import json
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebSocketAudioHandler:
    def __init__(self):
        self.connections = {}
        
    async def handle_client_connection(self, websocket, path):
        """Handle new WebSocket connection"""
        client_id = f"client_{id(websocket)}"
        logger.info(f"🔌 New client connected: {client_id}")
        
        try:
            await self.client_session_loop(client_id, websocket)
        except Exception as e:
            logger.error(f"🔥 Error: {e}")
        finally:
            if client_id in self.connections:
                del self.connections[client_id]
                
    async def client_session_loop(self, client_id: str, websocket):
        """Main session loop"""
        self.connections[client_id] = {'websocket': websocket}
        
        async for message in websocket:
            try:
                if isinstance(message, bytes):
                    # Audio data received
                    logger.info(f"🎵 Received audio: {len(message)} bytes")
                    # Echo back for testing
                    await websocket.send(message)
                else:
                    # JSON message
                    data = json.loads(message)
                    logger.info(f"📨 Message: {data}")
                    
            except Exception as e:
                logger.error(f"🔥 Error processing message: {e}")

async def main():
    logger.info("🚀 Starting WebSocket Audio Server...")
    
    handler = WebSocketAudioHandler()
    
    start_server = websockets.serve(
        handler.handle_client_connection,
        "localhost", 
        8765
    )
    
    logger.info("✅ WebSocket server running on ws://localhost:8765")
    await start_server

if __name__ == "__main__":
    asyncio.run(main()) 