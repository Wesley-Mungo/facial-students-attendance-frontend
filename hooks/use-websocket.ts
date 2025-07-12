import { useEffect, useRef } from "react"

interface WebSocketMessage {
  [key: string]: any
  error?: string
}

interface UseWebSocketProps {
  url: string
  onOpen?: () => void
  onClose?: () => void
  onMessage?: (message: WebSocketMessage) => void
  reconnectInterval?: number
}

export const useWebSocket = ({
  url,
  onOpen,
  onClose,
  onMessage,
  reconnectInterval = 5000
}: UseWebSocketProps) => {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<NodeJS.Timeout | null>(null)

  const connect = () => {
    wsRef.current = new WebSocket(url)

    wsRef.current.onopen = () => {
      console.log(`Connected to ${url}`)
      if (onOpen) onOpen()
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current)
        reconnectRef.current = null
      }
    }

    wsRef.current.onclose = () => {
      console.log(`Disconnected from ${url}`)
      if (onClose) onClose()
      if (!reconnectRef.current) {
        reconnectRef.current = setTimeout(() => {
          console.log(`Reconnecting to ${url}`)
          connect()
        }, reconnectInterval)
      }
    }

    wsRef.current.onerror = (error) => {
      console.error(`WebSocket error:`, error)
    }

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (onMessage) onMessage(data)
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }
  }

  useEffect(() => {
    connect()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current)
      }
    }
  }, [url])

  const sendMessage = (message: string | object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const data = typeof message === "string" ? message : JSON.stringify(message)
      wsRef.current.send(data)
    } else {
      console.warn("WebSocket not connected")
    }
  }

  return { sendMessage }
}