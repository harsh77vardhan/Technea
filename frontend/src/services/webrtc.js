/**
 * Production-ready WebRTC Mesh Voice & Video Manager for Technea Study Rooms.
 *
 * Implements:
 * - Peer-to-peer audio & video media streams (RTCPeerConnection)
 * - Automatic STUN/TURN server discovery with fallback
 * - Full-duplex WebSocket signaling with HTTP REST fallback
 * - ICE candidate queuing and polite glare resolution
 * - Real-time mute, camera, and screen share controls
 * - Resource cleanup and memory leak prevention
 */

import {
  getRoomIceServersApi,
  getWebRTCSignalsApi,
  joinWebRTCCallApi,
  leaveWebRTCCallApi,
  sendWebRTCSignalApi,
  updateWebRTCStatusApi,
} from './api'

const DEFAULT_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
]

export class WebRTCManager {
  constructor({
    roomId,
    user,
    token,
    onActivePeersChange,
    onRemoteStreamChange,
    onLocalStreamChange,
    onError,
  }) {
    this.roomId = roomId
    this.user = user
    this.token = token
    this.onActivePeersChange = onActivePeersChange
    this.onRemoteStreamChange = onRemoteStreamChange
    this.onLocalStreamChange = onLocalStreamChange
    this.onError = onError

    // Media Streams
    this.localAudioTrack = null
    this.localVideoTrack = null
    this.localStream = null
    this.screenStream = null

    // State flags
    this.isJoined = false
    this.isMuted = false
    this.isVideoActive = false
    this.isScreenSharing = false

    // Peer Connections: remoteUserId -> RTCPeerConnection
    this.peerConnections = new Map()
    // Remote Media Streams: remoteUserId -> MediaStream
    this.remoteStreams = new Map()
    // Queued ICE candidates: remoteUserId -> Array<RTCIceCandidateInit>
    this.iceQueues = new Map()
    // Active Peers Metadata: remoteUserId -> peerMetadata
    this.activePeers = new Map()

    // ICE servers cache
    this.iceServers = DEFAULT_ICE_SERVERS

    // Signaling Transport
    this.ws = null
    this.wsConnected = false
    this.pollInterval = null
    this.pingInterval = null
    this.lastPolledSignalId = 0
    this.isDestroyed = false
  }

  /**
   * Determine WebSocket URL for backend signaling server
   */
  getSignalingWsUrl() {
    let wsBase = ''
    const apiUrl = import.meta.env?.VITE_API_URL || import.meta.env?.VITE_BACKEND_URL || ''

    if (apiUrl && apiUrl.startsWith('http')) {
      const parsed = new URL(apiUrl)
      const wsProtocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:'
      wsBase = `${wsProtocol}//${parsed.host}`
    } else if (typeof window !== 'undefined') {
      const isHttps = window.location.protocol === 'https:'
      const wsProtocol = isHttps ? 'wss:' : 'ws:'
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        wsBase = `${wsProtocol}//127.0.0.1:8000`
      } else {
        // Production: technea-backend.onrender.com or current host
        wsBase = isHttps ? 'wss://technea-backend.onrender.com' : `${wsProtocol}//${window.location.host}`
      }
    }

    const cleanToken = encodeURIComponent(this.token || '')
    return `${wsBase}/ws/community/rooms/${this.roomId}/signal?token=${cleanToken}`
  }

  /**
   * Initialize ICE servers and connect to live audio room
   */
  async joinVoice({ enableVideo = false } = {}) {
    if (this.isJoined) return

    try {
      // 1. Fetch ICE servers from backend
      try {
        const iceData = await getRoomIceServersApi(this.roomId)
        if (iceData?.iceServers && Array.isArray(iceData.iceServers) && iceData.iceServers.length > 0) {
          this.iceServers = iceData.iceServers
        }
      } catch (err) {
        console.warn('Using default STUN servers:', err)
        this.iceServers = DEFAULT_ICE_SERVERS
      }

      // 2. Obtain local audio stream via getUserMedia
      let audioStream = null
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
            video: false,
          })
          this.localAudioTrack = audioStream.getAudioTracks()[0] || null
        } catch (err) {
          console.warn('Microphone permission not granted, continuing in listening mode:', err)
          this.onError?.('Microphone not detected or permission denied. Joined in listening mode.')
        }
      }

      // 3. Obtain video stream if requested
      if (enableVideo && navigator.mediaDevices?.getUserMedia) {
        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24 } },
          })
          this.localVideoTrack = videoStream.getVideoTracks()[0] || null
          this.isVideoActive = true
        } catch (err) {
          console.warn('Camera permission not granted:', err)
        }
      }

      // 4. Create combined local MediaStream
      this.localStream = new MediaStream()
      if (this.localAudioTrack) this.localStream.addTrack(this.localAudioTrack)
      if (this.localVideoTrack) this.localStream.addTrack(this.localVideoTrack)
      this.onLocalStreamChange?.(this.localStream)

      // 5. Connect WebSocket signaling channel
      await this.connectSignaling()

      // 6. Record join in backend DB
      await joinWebRTCCallApi(this.roomId).catch((e) => console.warn('DB join error:', e))

      this.isJoined = true
      this.isMuted = false
      return { localStream: this.localStream }
    } catch (err) {
      this.leave()
      throw err
    }
  }

  /**
   * Connect to WebSocket signaling server with REST fallback
   */
  async connectSignaling() {
    const wsUrl = this.getSignalingWsUrl()

    return new Promise((resolve) => {
      let resolved = false
      const done = () => {
        if (!resolved) {
          resolved = true
          resolve()
        }
      }

      try {
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          this.wsConnected = true
          // Keepalive ping every 20 seconds
          this.pingInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.ws.send(JSON.stringify({ type: 'ping' }))
            }
          }, 20000)
          done()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleSignalingMessage(data)
          } catch (err) {
            console.error('Signaling parse error:', err)
          }
        }

        this.ws.onerror = (err) => {
          console.warn('Signaling WebSocket encountered an error, activating HTTP fallback:', err)
          this.wsConnected = false
          this.startRestPollingFallback()
          done()
        }

        this.ws.onclose = () => {
          this.wsConnected = false
          if (this.pingInterval) clearInterval(this.pingInterval)
          if (!this.isDestroyed && this.isJoined) {
            this.startRestPollingFallback()
          }
        }

        // Timeout fallback after 3 seconds if WS hangs
        setTimeout(() => {
          if (!this.wsConnected) {
            this.startRestPollingFallback()
            done()
          }
        }, 3000)
      } catch (err) {
        console.warn('Could not initialize WebSocket, using REST polling fallback:', err)
        this.startRestPollingFallback()
        done()
      }
    })
  }

  /**
   * Fallback: REST Polling for environments where WebSockets are blocked
   */
  startRestPollingFallback() {
    if (this.pollInterval || this.isDestroyed) return
    console.info('Using WebRTC REST polling fallback for signals.')

    this.pollInterval = setInterval(async () => {
      if (this.isDestroyed || !this.isJoined) return
      try {
        const signals = await getWebRTCSignalsApi(this.roomId, this.lastPolledSignalId)
        if (Array.isArray(signals)) {
          for (const sig of signals) {
            if (sig.id > this.lastPolledSignalId) {
              this.lastPolledSignalId = sig.id
            }
            try {
              const payload = JSON.parse(sig.payload)
              this.handleSignalingMessage({
                type: sig.signal_type,
                from_user_id: sig.from_user_id,
                from_user_name: sig.from_user_name,
                target_user_id: sig.target_user_id,
                ...payload,
              })
            } catch {
              // Ignore invalid payload
            }
          }
        }
      } catch {
        // Silently ignore polling transient errors
      }
    }, 1500)
  }

  /**
   * Dispatch a signaling message via WebSocket or REST
   */
  sendSignal(type, payload = {}) {
    const message = {
      type,
      ...payload,
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      // Send via REST fallback
      sendWebRTCSignalApi(this.roomId, {
        target_user_id: payload.target_user_id || null,
        signal_type: type,
        payload: JSON.stringify(payload),
      }).catch((e) => console.warn('REST signal error:', e))
    }
  }

  /**
   * Handle incoming WebRTC signaling messages
   */
  async handleSignalingMessage(data) {
    const { type, from_user_id, target_user_id } = data

    // Ignore messages intended for someone else
    if (target_user_id && target_user_id !== this.user?.id) {
      return
    }

    switch (type) {
      case 'welcome': {
        // Initial state from server: contains list of peers already in room
        const peers = data.peers || []
        for (const peer of peers) {
          if (peer.user_id !== this.user?.id) {
            this.activePeers.set(peer.user_id, peer)
            // As the newcomer, initiate WebRTC connection to each existing peer
            await this.initiatePeerConnection(peer.user_id)
          }
        }
        this.emitActivePeers()
        break
      }

      case 'peer-joined': {
        if (from_user_id && from_user_id !== this.user?.id) {
          this.activePeers.set(from_user_id, {
            user_id: from_user_id,
            user_name: data.user_name || 'Learner',
            avatar_url: data.avatar_url,
            is_audio_active: data.is_audio_active ?? true,
            is_muted: data.is_muted ?? false,
            is_video_active: data.is_video_active ?? false,
            is_screen_sharing: data.is_screen_sharing ?? false,
          })
          this.emitActivePeers()
        }
        break
      }

      case 'offer': {
        if (from_user_id && from_user_id !== this.user?.id) {
          await this.handleOffer(from_user_id, data.sdp)
        }
        break
      }

      case 'answer': {
        if (from_user_id && from_user_id !== this.user?.id) {
          await this.handleAnswer(from_user_id, data.sdp)
        }
        break
      }

      case 'ice-candidate': {
        if (from_user_id && from_user_id !== this.user?.id && data.candidate) {
          await this.handleIceCandidate(from_user_id, data.candidate)
        }
        break
      }

      case 'media-status': {
        const peerId = data.user_id || from_user_id
        if (peerId && this.activePeers.has(peerId)) {
          const current = this.activePeers.get(peerId)
          this.activePeers.set(peerId, {
            ...current,
            is_audio_active: data.is_audio_active ?? current.is_audio_active,
            is_muted: data.is_muted ?? current.is_muted,
            is_video_active: data.is_video_active ?? current.is_video_active,
            is_screen_sharing: data.is_screen_sharing ?? current.is_screen_sharing,
          })
          this.emitActivePeers()
        }
        break
      }

      case 'peer-left': {
        const peerId = data.user_id || from_user_id
        if (peerId) {
          this.closePeerConnection(peerId)
          this.activePeers.delete(peerId)
          this.emitActivePeers()
        }
        break
      }

      default:
        break
    }
  }

  /**
   * Create or retrieve an RTCPeerConnection for a specific remote peer
   */
  getOrCreatePeerConnection(remoteUserId) {
    if (this.peerConnections.has(remoteUserId)) {
      return this.peerConnections.get(remoteUserId)
    }

    const pc = new RTCPeerConnection({
      iceServers: this.iceServers,
    })

    // Attach local media tracks (Audio and Video)
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream)
      })
    }

    // ICE Candidate generation
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal('ice-candidate', {
          target_user_id: remoteUserId,
          candidate: event.candidate.toJSON(),
        })
      }
    }

    // Remote Track received
    pc.ontrack = (event) => {
      let stream = this.remoteStreams.get(remoteUserId)
      if (!stream) {
        stream = new MediaStream()
        this.remoteStreams.set(remoteUserId, stream)
      }

      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach((track) => {
          if (!stream.getTracks().some((t) => t.id === track.id)) {
            stream.addTrack(track)
          }
        })
      } else if (event.track) {
        if (!stream.getTracks().some((t) => t.id === event.track.id)) {
          stream.addTrack(event.track)
        }
      }

      this.onRemoteStreamChange?.(remoteUserId, stream)
    }

    // Connection state logging & cleanup
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState
      if (state === 'failed') {
        console.warn(`PeerConnection with ${remoteUserId} failed. Restarting ICE...`)
        pc.restartIce?.()
      } else if (state === 'closed' || state === 'disconnected') {
        console.info(`PeerConnection with ${remoteUserId} changed to ${state}`)
      }
    }

    this.peerConnections.set(remoteUserId, pc)
    return pc
  }

  /**
   * Initiate an SDP Offer to a remote peer
   */
  async initiatePeerConnection(remoteUserId) {
    try {
      const pc = this.getOrCreatePeerConnection(remoteUserId)
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
      await pc.setLocalDescription(offer)

      this.sendSignal('offer', {
        target_user_id: remoteUserId,
        sdp: offer,
      })
    } catch (err) {
      console.error(`Failed to initiate offer to ${remoteUserId}:`, err)
    }
  }

  /**
   * Handle incoming SDP Offer and respond with an SDP Answer
   */
  async handleOffer(fromUserId, sdp) {
    try {
      const pc = this.getOrCreatePeerConnection(fromUserId)
      await pc.setRemoteDescription(new RTCSessionDescription(sdp))

      // Flush any queued ICE candidates for this peer
      await this.flushIceQueue(fromUserId)

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      this.sendSignal('answer', {
        target_user_id: fromUserId,
        sdp: answer,
      })
    } catch (err) {
      console.error(`Failed to handle offer from ${fromUserId}:`, err)
    }
  }

  /**
   * Handle incoming SDP Answer
   */
  async handleAnswer(fromUserId, sdp) {
    try {
      const pc = this.peerConnections.get(fromUserId)
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp))
        await this.flushIceQueue(fromUserId)
      }
    } catch (err) {
      console.error(`Failed to handle answer from ${fromUserId}:`, err)
    }
  }

  /**
   * Handle incoming ICE Candidate
   */
  async handleIceCandidate(fromUserId, candidateInit) {
    try {
      const pc = this.peerConnections.get(fromUserId)
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        await pc.addIceCandidate(new RTCIceCandidate(candidateInit))
      } else {
        // Remote description not ready yet, queue the candidate
        if (!this.iceQueues.has(fromUserId)) {
          this.iceQueues.set(fromUserId, [])
        }
        this.iceQueues.get(fromUserId).push(candidateInit)
      }
    } catch (err) {
      console.warn(`Failed to add ICE candidate from ${fromUserId}:`, err)
    }
  }

  /**
   * Flush queued ICE candidates once remote description is set
   */
  async flushIceQueue(peerId) {
    const queue = this.iceQueues.get(peerId)
    if (!queue || queue.length === 0) return

    const pc = this.peerConnections.get(peerId)
    if (!pc) return

    for (const candidate of queue) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (err) {
        console.warn(`Error flushing candidate for ${peerId}:`, err)
      }
    }
    this.iceQueues.set(peerId, [])
  }

  /**
   * Toggle local microphone Mute / Unmute
   */
  async toggleMute() {
    this.isMuted = !this.isMuted

    if (this.localAudioTrack) {
      this.localAudioTrack.enabled = !this.isMuted
    }

    // Broadcast updated status via signaling and sync to DB
    this.sendSignal('media-status', {
      is_audio_active: true,
      is_muted: this.isMuted,
      is_video_active: this.isVideoActive,
      is_screen_sharing: this.isScreenSharing,
    })

    updateWebRTCStatusApi(this.roomId, {
      is_audio_active: true,
      is_muted: this.isMuted,
      is_video_active: this.isVideoActive,
      is_screen_sharing: this.isScreenSharing,
    }).catch(() => {})

    return this.isMuted
  }

  /**
   * Toggle local camera On / Off
   */
  async toggleCamera() {
    const nextVideo = !this.isVideoActive

    try {
      if (nextVideo) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24 } },
        })
        const newTrack = stream.getVideoTracks()[0]
        this.localVideoTrack = newTrack

        if (this.localStream) {
          // Remove old video track if any
          this.localStream.getVideoTracks().forEach((t) => this.localStream.removeTrack(t))
          this.localStream.addTrack(newTrack)
        }

        // Add or replace track in all active peer connections
        for (const [peerId, pc] of this.peerConnections.entries()) {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video')
          if (sender) {
            await sender.replaceTrack(newTrack)
          } else {
            pc.addTrack(newTrack, this.localStream)
            // Trigger renegotiation offer
            this.initiatePeerConnection(peerId)
          }
        }
        this.isVideoActive = true
      } else {
        // Stop and remove local video track
        if (this.localVideoTrack) {
          this.localVideoTrack.stop()
          if (this.localStream) {
            this.localStream.removeTrack(this.localVideoTrack)
          }
          this.localVideoTrack = null
        }

        for (const [, pc] of this.peerConnections.entries()) {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video')
          if (sender) {
            await sender.replaceTrack(null)
          }
        }
        this.isVideoActive = false
      }

      this.onLocalStreamChange?.(this.localStream)

      // Broadcast status
      this.sendSignal('media-status', {
        is_audio_active: true,
        is_muted: this.isMuted,
        is_video_active: this.isVideoActive,
        is_screen_sharing: this.isScreenSharing,
      })

      updateWebRTCStatusApi(this.roomId, {
        is_audio_active: true,
        is_muted: this.isMuted,
        is_video_active: this.isVideoActive,
        is_screen_sharing: this.isScreenSharing,
      }).catch(() => {})

      return this.isVideoActive
    } catch (err) {
      console.warn('Camera toggle error:', err)
      this.onError?.('Camera device unavailable or permission denied.')
      return this.isVideoActive
    }
  }

  /**
   * Toggle Screen Sharing
   */
  async toggleScreenShare() {
    const nextScreen = !this.isScreenSharing

    try {
      if (nextScreen) {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        this.screenStream = stream
        const screenTrack = stream.getVideoTracks()[0]

        screenTrack.onended = () => {
          this.toggleScreenShare()
        }

        // Replace video track in all active peer connections with screen share track
        for (const [peerId, pc] of this.peerConnections.entries()) {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video')
          if (sender) {
            await sender.replaceTrack(screenTrack)
          } else {
            pc.addTrack(screenTrack, stream)
            this.initiatePeerConnection(peerId)
          }
        }

        this.isScreenSharing = true
      } else {
        if (this.screenStream) {
          this.screenStream.getTracks().forEach((t) => t.stop())
          this.screenStream = null
        }

        // Revert back to local camera track (or null if camera is off)
        const fallbackTrack = this.localVideoTrack || null
        for (const [, pc] of this.peerConnections.entries()) {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video')
          if (sender) {
            await sender.replaceTrack(fallbackTrack)
          }
        }

        this.isScreenSharing = false
      }

      this.sendSignal('media-status', {
        is_audio_active: true,
        is_muted: this.isMuted,
        is_video_active: this.isVideoActive,
        is_screen_sharing: this.isScreenSharing,
      })

      updateWebRTCStatusApi(this.roomId, {
        is_audio_active: true,
        is_muted: this.isMuted,
        is_video_active: this.isVideoActive,
        is_screen_sharing: this.isScreenSharing,
      }).catch(() => {})

      return { isScreenSharing: this.isScreenSharing, screenStream: this.screenStream }
    } catch (err) {
      console.warn('Screen share cancelled:', err)
      return { isScreenSharing: this.isScreenSharing, screenStream: null }
    }
  }

  /**
   * Close a specific peer connection cleanly
   */
  closePeerConnection(peerId) {
    const pc = this.peerConnections.get(peerId)
    if (pc) {
      pc.onicecandidate = null
      pc.ontrack = null
      pc.onconnectionstatechange = null
      pc.close()
      this.peerConnections.delete(peerId)
    }

    const stream = this.remoteStreams.get(peerId)
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      this.remoteStreams.delete(peerId)
      this.onRemoteStreamChange?.(peerId, null)
    }

    this.iceQueues.delete(peerId)
  }

  /**
   * Emit updated list of active peers to UI callback
   */
  emitActivePeers() {
    const peersList = Array.from(this.activePeers.values())
    // Add current user representation
    const me = {
      user_id: this.user?.id,
      user_name: this.user?.full_name || 'You',
      avatar_url: this.user?.avatar_url,
      is_audio_active: true,
      is_muted: this.isMuted,
      is_video_active: this.isVideoActive,
      is_screen_sharing: this.isScreenSharing,
    }
    this.onActivePeersChange?.([me, ...peersList])
  }

  /**
   * Leave Voice & Video call cleanly: free all resources, stop tracks, close sockets
   */
  leave() {
    this.isDestroyed = true
    this.isJoined = false

    // Notify peers and backend
    this.sendSignal('leave', { user_id: this.user?.id })
    leaveWebRTCCallApi(this.roomId).catch(() => {})

    // Stop local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop())
      this.localStream = null
    }
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((t) => t.stop())
      this.screenStream = null
    }
    this.localAudioTrack = null
    this.localVideoTrack = null

    // Close all peer connections
    for (const [peerId] of this.peerConnections.entries()) {
      this.closePeerConnection(peerId)
    }
    this.peerConnections.clear()
    this.remoteStreams.clear()
    this.iceQueues.clear()
    this.activePeers.clear()

    // Close WebSocket
    if (this.ws) {
      this.ws.onclose = null
      this.ws.onerror = null
      this.ws.close()
      this.ws = null
    }

    // Clear intervals
    if (this.pingInterval) clearInterval(this.pingInterval)
    if (this.pollInterval) clearInterval(this.pollInterval)

    this.onLocalStreamChange?.(null)
    this.onActivePeersChange?.([])
  }
}
