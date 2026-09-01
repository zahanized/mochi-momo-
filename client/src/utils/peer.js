import Peer from 'peerjs';

let peerInstance = null;

export function createPeer() {
  // No config needed for id/host — PeerJS's own free public broker
  // handles connection setup for us. Video/audio never touches it directly;
  // it only helps two browsers find each other.
  peerInstance = new Peer();
  return peerInstance;
}

export function getPeer() {
  return peerInstance;
}

export function destroyPeer() {
  if (peerInstance) {
    peerInstance.destroy();
    peerInstance = null;
  }
}