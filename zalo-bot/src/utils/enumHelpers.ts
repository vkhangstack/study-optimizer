import { MessageType, MessageDirection, ZaloEventType } from '../types/enums';

/**
 * Utility functions for working with enums
 */

/**
 * Get all message types as an array
 */
export function getAllMessageTypes(): MessageType[] {
  return Object.values(MessageType);
}

/**
 * Get all message directions as an array
 */
export function getAllMessageDirections(): MessageDirection[] {
  return Object.values(MessageDirection);
}

/**
 * Get all Zalo event types as an array
 */
export function getAllZaloEventTypes(): ZaloEventType[] {
  return Object.values(ZaloEventType);
}

/**
 * Check if a string is a valid message type
 */
export function isValidMessageType(type: string): type is MessageType {
  return Object.values(MessageType).includes(type as MessageType);
}

/**
 * Check if a string is a valid message direction
 */
export function isValidMessageDirection(direction: string): direction is MessageDirection {
  return Object.values(MessageDirection).includes(direction as MessageDirection);
}

/**
 * Check if a string is a valid Zalo event type
 */
export function isValidZaloEventType(eventType: string): eventType is ZaloEventType {
  return Object.values(ZaloEventType).includes(eventType as ZaloEventType);
}

/**
 * Convert string to MessageType with validation
 */
export function toMessageType(type: string): MessageType {
  if (isValidMessageType(type)) {
    return type;
  }
  throw new Error(`Invalid message type: ${type}`);
}

/**
 * Convert string to MessageDirection with validation
 */
export function toMessageDirection(direction: string): MessageDirection {
  if (isValidMessageDirection(direction)) {
    return direction;
  }
  throw new Error(`Invalid message direction: ${direction}`);
}

/**
 * Convert string to ZaloEventType with validation
 */
export function toZaloEventType(eventType: string): ZaloEventType {
  if (isValidZaloEventType(eventType)) {
    return eventType;
  }
  throw new Error(`Invalid Zalo event type: ${eventType}`);
}

/**
 * Get message type display name
 */
export function getMessageTypeDisplayName(type: MessageType): string {
  const displayNames: Record<MessageType, string> = {
    [MessageType.TEXT]: 'Text Message',
    [MessageType.IMAGE]: 'Image',
    [MessageType.FILE]: 'File',
    [MessageType.STICKER]: 'Sticker',
    [MessageType.LOCATION]: 'Location',
    [MessageType.TEMPLATE]: 'Template',
    [MessageType.AUDIO]: 'Audio',
    [MessageType.VIDEO]: 'Video',
    [MessageType.DOCUMENT]: 'Document',
    [MessageType.CHAT_PHOTO]: 'Chat Photo',
    [MessageType.CHAT_STICKER]: 'Chat Sticker',
  };
  
  return displayNames[type] || type;
}

/**
 * Get message direction display name
 */
export function getMessageDirectionDisplayName(direction: MessageDirection): string {
  const displayNames: Record<MessageDirection, string> = {
    [MessageDirection.INCOMING]: 'Received',
    [MessageDirection.OUTGOING]: 'Sent',
  };
  
  return displayNames[direction] || direction;
}

/**
 * Get message type icon/emoji
 */
export function getMessageTypeIcon(type: MessageType): string {
  const icons: Record<MessageType, string> = {
    [MessageType.TEXT]: '💬',
    [MessageType.IMAGE]: '🖼️',
    [MessageType.FILE]: '📎',
    [MessageType.STICKER]: '😊',
    [MessageType.LOCATION]: '📍',
    [MessageType.TEMPLATE]: '📋',
    [MessageType.AUDIO]: '🎵',
    [MessageType.VIDEO]: '🎥',
    [MessageType.DOCUMENT]: '📄',
    [MessageType.CHAT_PHOTO]: '🖼️',
    [MessageType.CHAT_STICKER]: '😊',
  };
  
  return icons[type] || '📝';
}